import json
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Base, StudentRecord
from app.schemas import PredictionResponse, StudentHistoryItem, StudentPredictionInput
from app.services.ml_service import is_ml_active, predict_student_dropout
from app.services.risk_engine import evaluate_student_risk

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Dropout Risk Prediction API",
    description=(
        "FastAPI backend for predicting student dropout risk. "
        "Day 4 — ML inference via sklearn Pipeline with rule-engine fallback. "
        "SQLite persistence and full prediction history included."
    ),
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def health_check() -> dict:
    return {
        "status": "ok",
        "message": "Student Dropout Risk Prediction API is up and running.",
        "version": app.version,
        "ml_active": is_ml_active(),
    }

@app.post(
    "/api/predictions",
    response_model=PredictionResponse,
    tags=["Predictions"],
    summary="Evaluate student dropout risk and persist the result",
    status_code=201,
)
def predict_dropout(
    payload: StudentPredictionInput,
    db: Session = Depends(get_db),
) -> PredictionResponse:

    result = predict_student_dropout(payload)

    record = StudentRecord(
        age=int(payload.age),
        gender=payload.gender,
        gpa=payload.gpa,
        semester_gpa=payload.semester_gpa,
        cgpa=payload.cgpa,
        attendance=payload.attendance,
        study_hours=payload.study_hours,
        failures=payload.failures,
        family_income=payload.family_income,
        financial_stress=payload.financial_stress or 0,

        department=payload.department,
        semester=payload.semester,
        assignment_delay_days=payload.assignment_delay_days,
        travel_time_minutes=payload.travel_time_minutes,
        stress_index=payload.stress_index,
        parental_education=payload.parental_education,
        part_time_job=payload.part_time_job,
        scholarship=payload.scholarship,
        internet_access=payload.internet_access,

        prediction=result["prediction"],
        probability=result["probability"],
        risk_level=result["riskLevel"],
        key_risk_factors=json.dumps(result.get("keyRiskFactors", [])),
        recommendations=json.dumps(result.get("recommendations", [])),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    response_data = dict(result)
    response_data["id"] = record.id

    return PredictionResponse(**response_data)


@app.get(
    "/api/predictions/history",
    response_model=list[StudentHistoryItem],
    tags=["Predictions"],
    summary="Retrieve all past student evaluations",
)
def get_prediction_history(db: Session = Depends(get_db)) -> list[StudentHistoryItem]:

    records = (
        db.query(StudentRecord)
        .order_by(StudentRecord.evaluated_at.desc())
        .all()
    )

    history_items: list[StudentHistoryItem] = []
    for r in records:
        krf: list[str] = []
        if getattr(r, "key_risk_factors", None):
            try:
                krf = json.loads(r.key_risk_factors)
            except Exception:
                krf = []

        recs: list[str] = []
        if getattr(r, "recommendations", None):
            try:
                recs = json.loads(r.recommendations)
            except Exception:
                recs = []

        if not krf or not recs:
            try:
                temp_input = StudentPredictionInput(
                    department=r.department or "CS",
                    semester=r.semester or "Year 1",
                    cgpa=r.cgpa,
                    semester_gpa=r.semester_gpa,
                    gpa=r.gpa,
                    failures=r.failures,
                    attendance=r.attendance,
                    study_hours=r.study_hours,
                    assignment_delay_days=getattr(r, "assignment_delay_days", 0) or 0,
                    age=float(r.age),
                    gender=r.gender,
                    parental_education=getattr(r, "parental_education", "Bachelor") or "Bachelor",
                    family_income=r.family_income,
                    travel_time_minutes=getattr(r, "travel_time_minutes", 30.0) or 30.0,
                    stress_index=getattr(r, "stress_index", 5.0) or (float(r.financial_stress * 2) if r.financial_stress else 5.0),
                    part_time_job=getattr(r, "part_time_job", "No") or "No",
                    scholarship=getattr(r, "scholarship", "No") or "No",
                    internet_access=getattr(r, "internet_access", "Yes") or "Yes",
                    financial_stress=r.financial_stress,
                )
                computed = evaluate_student_risk(temp_input)
                if not krf:
                    krf = computed.get("keyRiskFactors", [])
                if not recs:
                    recs = computed.get("recommendations", [])
            except Exception:
                pass

        history_items.append(
            StudentHistoryItem(
                id=r.id,
                age=float(r.age),
                gender=r.gender,
                gpa=r.gpa,
                semester_gpa=r.semester_gpa,
                cgpa=r.cgpa,
                attendance=r.attendance,
                study_hours=r.study_hours,
                failures=r.failures,
                family_income=r.family_income,
                financial_stress=r.financial_stress,
                department=r.department or "CS",
                semester=r.semester or "Year 1",
                assignment_delay_days=getattr(r, "assignment_delay_days", 0) or 0,
                travel_time_minutes=getattr(r, "travel_time_minutes", 30.0) or 30.0,
                stress_index=getattr(r, "stress_index", 5.0) or 5.0,
                parental_education=getattr(r, "parental_education", "Bachelor") or "Bachelor",
                part_time_job=getattr(r, "part_time_job", "No") or "No",
                scholarship=getattr(r, "scholarship", "No") or "No",
                internet_access=getattr(r, "internet_access", "Yes") or "Yes",
                prediction=r.prediction,
                probability=r.probability,
                risk_level=r.risk_level,
                key_risk_factors=krf,
                recommendations=recs,
                evaluated_at=r.evaluated_at,
            )
        )

    return history_items
