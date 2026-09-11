from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictionResponse, StudentPredictionInput

app = FastAPI(
    title="Student Dropout Risk Prediction API",
    description=(
        "FastAPI backend for predicting student dropout risk. "
        "Day 1 — mock prediction logic; real ML model will be integrated later."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _mock_predict(data: StudentPredictionInput) -> PredictionResponse:
    """
    Rule-based mock that mimics plausible model output.
    Priority order: HIGH → MEDIUM → LOW risk.

    HIGH risk  — gpa < 2.0  OR  attendance < 60  OR  failures >= 3
    MEDIUM risk — gpa < 2.5  OR  attendance < 75  OR  financial_stress >= 4
    LOW risk   — everything else
    """

    # --- HIGH risk ---
    if data.gpa < 2.0 or data.attendance < 60 or data.failures >= 3:
        return PredictionResponse(
            prediction="Dropout",
            probability=0.82,
            riskLevel="High",
            message=(
                "This student is at high risk of dropping out. "
                "Immediate academic counselling and financial support are strongly recommended."
            ),
        )

    # --- MEDIUM risk ---
    if data.gpa < 2.5 or data.attendance < 75 or data.financial_stress >= 4:
        return PredictionResponse(
            prediction="Dropout",
            probability=0.55,
            riskLevel="Medium",
            message=(
                "This student shows moderate dropout risk indicators. "
                "Proactive academic advising and monitoring are advised."
            ),
        )

    # --- LOW risk ---
    return PredictionResponse(
        prediction="Graduate / Retained",
        probability=0.15,
        riskLevel="Low",
        message=(
            "This student is on track to graduate. "
            "Continue encouraging consistent attendance and study habits."
        ),
    )

@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health-check endpoint — confirms the API is running."""
    return {
        "status": "ok",
        "message": "Student Dropout Risk Prediction API is up and running.",
        "version": app.version,
    }


@app.post("/api/predictions", response_model=PredictionResponse, tags=["Predictions"])
def predict_dropout(payload: StudentPredictionInput) -> PredictionResponse:
    """
    **Mock** dropout-risk prediction endpoint.

    Accepts a `StudentPredictionInput` payload and returns a
    `PredictionResponse` with a predicted outcome, probability,
    risk level, and a descriptive message.

    > **Note:** This endpoint uses rule-based mock logic.
    > It will be replaced by the trained ML model on integration day.
    """
    return _mock_predict(payload)
