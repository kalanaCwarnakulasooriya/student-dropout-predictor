from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Base, StudentRecord
from app.schemas import PredictionResponse, StudentHistoryItem, StudentPredictionInput
from app.services.ml_service import is_ml_active, predict_student_dropout

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
    """
    Run ML inference (or rule-engine fallback) against the submitted student
    data, persist the evaluation to SQLite, and return the full prediction response.
    """
    result = predict_student_dropout(payload)

    record = StudentRecord(
        age=payload.age,
        gender=payload.gender,
        gpa=payload.gpa,
        semester_gpa=payload.semester_gpa,
        cgpa=payload.cgpa,
        attendance=payload.attendance,
        study_hours=payload.study_hours,
        failures=payload.failures,
        family_income=payload.family_income,
        financial_stress=payload.financial_stress,

        prediction=result["prediction"],
        probability=result["probability"],
        risk_level=result["riskLevel"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PredictionResponse(**result)


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
    return records
