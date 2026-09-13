"""
ml_service.py — ML inference layer for the Student Dropout Risk Prediction API.

Responsibilities
----------------
1. Locate and load the trained sklearn Pipeline artifact at import time.
2. Map the 10-field ``StudentPredictionInput`` to the 23-column feature space
   that the model was trained on, applying the same feature engineering used
   in the training notebook (notebook 04_feature_engineering / 05_model_training).
3. Run ``pipeline.predict_proba()`` and derive risk level / prediction label.
4. Re-use the rule engine's factor extraction and recommendation logic so the
   response format is identical regardless of which engine produced the score.
5. Fall back gracefully to ``evaluate_student_risk()`` when:
   - the artifact file is absent, or
   - any exception occurs during inference.
"""

from __future__ import annotations

import logging
import math
import pathlib
import warnings
from typing import Any

import pandas as pd

from app.schemas import StudentPredictionInput
from app.services.risk_engine import (
    _build_message,
    _classify_risk,
    evaluate_student_risk,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Artifact location
# The pkl lives at  <repo-root>/ml-model/models/student_dropout_model.pkl.
# We resolve the path relative to this file so it works regardless of the
# working directory from which uvicorn is launched.
# ---------------------------------------------------------------------------

_THIS_DIR = pathlib.Path(__file__).resolve().parent          # backend/app/services/
_REPO_ROOT = _THIS_DIR.parents[2]                            # student-dropout-predictor/
_MODEL_PATH = _REPO_ROOT / "ml-model" / "models" / "student_dropout_model.pkl"

# ---------------------------------------------------------------------------
# Feature contract  (order must match training: df.drop(columns=["Dropout"]))
# ---------------------------------------------------------------------------

_FEATURE_COLUMNS: list[str] = [
    "Age",
    "Gender",
    "Family_Income",
    "Internet_Access",
    "Study_Hours_per_Day",
    "Attendance_Rate",
    "Assignment_Delay_Days",
    "Travel_Time_Minutes",
    "Part_Time_Job",
    "Scholarship",
    "Stress_Index",
    "GPA",
    "Semester_GPA",
    "CGPA",
    "Semester",
    "Department",
    "Parental_Education",
    "Academic_Performance_Score",
    "Study_Attendance_Score",
    "Stress_Level",
    "Log_Family_Income",
    "Travel_Study_Ratio",
    "Assignment_Delay_Level",
]

# ---------------------------------------------------------------------------
# Startup: load model once
# ---------------------------------------------------------------------------

_pipeline: Any | None = None


def _load_pipeline() -> Any | None:
    """
    Attempt to load the joblib/pickle artifact. Returns None on any failure
    so the rest of the service can fall back to the rule engine.
    """
    if not _MODEL_PATH.exists():
        logger.warning(
            "ML model artifact not found at %s — rule-engine fallback will be used.",
            _MODEL_PATH,
        )
        return None

    try:
        import joblib  # noqa: PLC0415 — lazy import keeps startup fast if unused

        with warnings.catch_warnings():
            # Suppress sklearn's InconsistentVersionWarning at startup;
            # the minor version mismatch (1.8 → 1.9) is safe for inference.
            warnings.simplefilter("ignore")
            pipeline = joblib.load(_MODEL_PATH)

        logger.info("ML model loaded successfully from %s", _MODEL_PATH)
        return pipeline

    except Exception:
        logger.exception(
            "Failed to load ML model from %s — rule-engine fallback will be used.",
            _MODEL_PATH,
        )
        return None


_pipeline = _load_pipeline()

# ---------------------------------------------------------------------------
# Feature engineering helpers
# ---------------------------------------------------------------------------

# Neutral / most-common defaults for columns not present in StudentPredictionInput.
# These mirror the modal values in the training dataset and are used only when
# the pipeline cannot derive a better estimate from available inputs.
_DEFAULTS: dict[str, Any] = {
    "Internet_Access":       "Yes",        # >90 % of training rows had "Yes"
    "Assignment_Delay_Days": 1,            # median ≈ 1 day
    "Travel_Time_Minutes":   30.0,         # median ≈ 30 min
    "Part_Time_Job":         "No",         # majority class
    "Scholarship":           "No",         # majority class
    "Semester":              "Year 2",     # mid-point
    "Department":            "CS",         # largest department
    "Parental_Education":    "Bachelor",   # most common
}


def _financial_stress_to_stress_index(financial_stress: int) -> float:
    """
    Convert the API's 1–5 ``financial_stress`` ordinal to a continuous
    ``Stress_Index`` approximation.

    The training dataset's Stress_Index is a composite score; the simplest
    linear mapping that preserves direction:  index ≈ financial_stress * 0.6
    (keeps the result in the ~0.6–3.0 range observed in training data).
    """
    return round(financial_stress * 0.6, 4)


def _stress_index_to_level(stress_index: float) -> str:
    """Map a continuous Stress_Index back to the 'Stress_Level' ordinal category."""
    if stress_index < 1.2:
        return "Low"
    if stress_index < 2.4:
        return "Medium"
    return "High"


def _assignment_delay_level(days: int) -> str:
    """Replicate the training notebook's binning of Assignment_Delay_Days."""
    if days == 0:
        return "Low"
    if days <= 2:
        return "Moderate"
    return "High"


def _build_feature_df(data: StudentPredictionInput) -> pd.DataFrame:
    """
    Construct the 23-column DataFrame that the sklearn Pipeline expects.

    Direct mappings (API field → model column):
        age              → Age
        gender           → Gender
        family_income    → Family_Income
        study_hours      → Study_Hours_per_Day
        attendance       → Attendance_Rate
        gpa              → GPA
        semester_gpa     → Semester_GPA
        cgpa             → CGPA

    Derived columns (matching training feature engineering):
        Stress_Index             = financial_stress * 0.6
        Academic_Performance_Score = (GPA + Semester_GPA + CGPA) / 3
        Study_Attendance_Score   = Study_Hours_per_Day * (Attendance_Rate / 100)
        Log_Family_Income        = log(Family_Income + 1)
        Travel_Study_Ratio       = Travel_Time_Minutes / (Study_Hours_per_Day * 60 + 1)
        Assignment_Delay_Level   = binned from Assignment_Delay_Days
        Stress_Level             = derived from Stress_Index

    Remaining columns use neutral defaults (see _DEFAULTS).
    """
    delay_days: int = _DEFAULTS["Assignment_Delay_Days"]
    travel_min: float = _DEFAULTS["Travel_Time_Minutes"]

    stress_index = _financial_stress_to_stress_index(data.financial_stress)
    study_hours_day = data.study_hours / 7.0  # API is weekly; model is daily

    # Engineered features
    academic_perf = round((data.gpa + data.semester_gpa + data.cgpa) / 3.0, 6)
    study_att_score = round(study_hours_day * (data.attendance / 100.0), 6)
    log_family_income = round(math.log(data.family_income + 1), 6)
    travel_study_ratio = round(
        travel_min / (study_hours_day * 60.0 + 1.0), 6
    )
    stress_level = _stress_index_to_level(stress_index)
    delay_level = _assignment_delay_level(delay_days)

    row: dict[str, Any] = {
        "Age":                        data.age,
        "Gender":                     data.gender,
        "Family_Income":              data.family_income,
        "Internet_Access":            _DEFAULTS["Internet_Access"],
        "Study_Hours_per_Day":        round(study_hours_day, 4),
        "Attendance_Rate":            data.attendance,
        "Assignment_Delay_Days":      delay_days,
        "Travel_Time_Minutes":        travel_min,
        "Part_Time_Job":              _DEFAULTS["Part_Time_Job"],
        "Scholarship":                _DEFAULTS["Scholarship"],
        "Stress_Index":               stress_index,
        "GPA":                        data.gpa,
        "Semester_GPA":               data.semester_gpa,
        "CGPA":                       data.cgpa,
        "Semester":                   _DEFAULTS["Semester"],
        "Department":                 _DEFAULTS["Department"],
        "Parental_Education":         _DEFAULTS["Parental_Education"],
        "Academic_Performance_Score": academic_perf,
        "Study_Attendance_Score":     study_att_score,
        "Stress_Level":               stress_level,
        "Log_Family_Income":          log_family_income,
        "Travel_Study_Ratio":         travel_study_ratio,
        "Assignment_Delay_Level":     delay_level,
    }

    # Guarantee column order matches training
    return pd.DataFrame([row], columns=_FEATURE_COLUMNS)


# ---------------------------------------------------------------------------
# Factor extraction helpers (rule-based, shared with risk_engine)
# ---------------------------------------------------------------------------

def _extract_risk_factors(data: StudentPredictionInput) -> list[str]:
    """Mirror risk_engine's factor extraction against the same thresholds."""
    factors: list[str] = []
    if data.cgpa < 2.0:
        factors.append(f"Low CGPA ({data.cgpa:.2f} / 4.00)")
    if data.gpa < 2.0:
        factors.append(f"Low GPA ({data.gpa:.2f} / 4.00)")
    if data.attendance < 65.0:
        factors.append(f"Poor Attendance ({data.attendance:.1f}%)")
    if data.failures >= 1:
        label = "Failure" if data.failures == 1 else "Failures"
        factors.append(f"{data.failures} Previous Academic {label}")
    if data.financial_stress >= 4:
        factors.append(f"High Financial Stress (Level {data.financial_stress}/5)")
    if data.study_hours < 2.0:
        factors.append(f"Insufficient Study Hours ({data.study_hours:.1f} hrs/week)")
    return factors


def _build_recommendations(data: StudentPredictionInput) -> list[str]:
    """Mirror risk_engine's recommendation builder."""
    recs: list[str] = []
    if data.cgpa < 2.0 or data.gpa < 2.0:
        recs.append(
            "Schedule an urgent academic counselling session to review course load and study strategy."
        )
        recs.append(
            "Enrol the student in subject-specific tutoring or a peer-mentoring programme."
        )
    if data.attendance < 65.0:
        recs.append(
            "Trigger an attendance alert and initiate weekly check-ins with the student's advisor."
        )
        recs.append(
            "Investigate underlying barriers to attendance (transport, health, work commitments)."
        )
    if data.failures >= 1:
        recs.append(
            "Recommend a course-repeat or remedial plan to address failed subjects before the next semester."
        )
        if data.failures >= 2:
            recs.append(
                "Consider a reduced course load this semester to improve pass rates and reduce burnout."
            )
    if data.financial_stress >= 4:
        recs.append(
            "Refer the student to the financial aid office to explore bursaries, grants, or payment plans."
        )
        recs.append(
            "Connect the student with part-time campus employment or emergency fund resources."
        )
    if data.study_hours < 2.0:
        recs.append(
            "Provide a structured weekly study plan and introduce the student to campus study-skill workshops."
        )
    if not recs:
        recs.append(
            "Maintain current academic momentum and encourage participation in enrichment activities."
        )
    return recs


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------


def predict_student_dropout(data: StudentPredictionInput) -> dict:
    """
    Primary prediction entry point.

    Attempts ML inference; silently falls back to the rule engine on any
    failure so the API always returns a valid response.

    Returns a dict with the same keys as ``evaluate_student_risk()``:
        prediction, probability, riskLevel, keyRiskFactors, recommendations, message
    """
    if _pipeline is not None:
        try:
            df = _build_feature_df(data)

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                proba_matrix = _pipeline.predict_proba(df)

            # classes_ = [0, 1]  →  column 1 is P(Dropout)
            dropout_proba: float = round(float(proba_matrix[0][1]), 4)
            dropout_proba = max(0.0, min(1.0, dropout_proba))

            risk_level = _classify_risk(dropout_proba)
            prediction = "Dropout" if risk_level in ("High", "Medium") else "Graduate / Retained"

            return {
                "prediction":      prediction,
                "probability":     dropout_proba,
                "riskLevel":       risk_level,
                "keyRiskFactors":  _extract_risk_factors(data),
                "recommendations": _build_recommendations(data),
                "message":         _build_message(risk_level, prediction),
            }

        except Exception:
            logger.exception(
                "ML inference failed for input %s — falling back to rule engine.", data
            )

    # ---- Fallback ----
    logger.debug("Using rule-engine fallback for prediction.")
    return evaluate_student_risk(data)


def is_ml_active() -> bool:
    """Return True if the ML pipeline was loaded successfully."""
    return _pipeline is not None
