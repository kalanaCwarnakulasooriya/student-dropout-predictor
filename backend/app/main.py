from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictionResponse, StudentPredictionInput
from app.services.risk_engine import evaluate_student_risk

app = FastAPI(
    title="Student Dropout Risk Prediction API",
    description=(
        "FastAPI backend for predicting student dropout risk. "
        "Day 2 — dynamic weighted rule engine with granular risk-factor extraction "
        "and tailored advisor recommendations. ML model integration planned for a future sprint."
    ),
    version="0.2.0",
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
    }


@app.post(
    "/api/predictions",
    response_model=PredictionResponse,
    tags=["Predictions"],
    summary="Predict student dropout risk",
)
def predict_dropout(payload: StudentPredictionInput) -> PredictionResponse:
    result = evaluate_student_risk(payload)
    return PredictionResponse(**result)

