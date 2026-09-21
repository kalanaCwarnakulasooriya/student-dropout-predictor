from __future__ import annotations

import logging
import pathlib
import warnings
from typing import Any

import numpy as np
import pandas as pd

from app.schemas import StudentPredictionInput
from app.services.risk_engine import (
    _build_message,
    _classify_risk,
    evaluate_student_risk,
)

logger = logging.getLogger(__name__)

_THIS_DIR = pathlib.Path(__file__).resolve().parent 
_BACKEND_ROOT = _THIS_DIR.parents[1] 
_REPO_ROOT = _THIS_DIR.parents[2]     

_MODEL_PATH = _BACKEND_ROOT / "student_dropout_model.pkl"

if not _MODEL_PATH.exists():
    _MODEL_PATH = _REPO_ROOT / "ml-model" / "models" / "student_dropout_model.pkl"
if not _MODEL_PATH.exists():
    _MODEL_PATH = _REPO_ROOT / "ml-model" / "artifacts" / "student_dropout_model.pkl"

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

_pipeline: Any | None = None


def _load_pipeline() -> Any | None:
    if not _MODEL_PATH.exists():
        logger.warning("ML artifact not found at %s. Fallback active.", _MODEL_PATH)
        return None
    try:
        import joblib
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            pipeline = joblib.load(_MODEL_PATH)
        logger.info("ML model loaded successfully from %s", _MODEL_PATH)
        return pipeline
    except Exception:
        logger.exception("Failed loading ML model from %s.", _MODEL_PATH)
        return None


_pipeline = _load_pipeline()


def _map_department(dept: str) -> str:
    d = dept.lower()
    if "comput" in d or "it" in d or "cs" in d:
        return "CS"
    if "engin" in d:
        return "Engineering"
    if "busi" in d or "mgt" in d:
        return "Business"
    if "art" in d:
        return "Arts"
    return "Science"


def _map_semester(sem: str) -> str:
    s = sem.lower()
    if "1" in s or "2" in s:
        return "Year 1"
    if "3" in s or "4" in s:
        return "Year 2"
    if "5" in s or "6" in s:
        return "Year 3"
    return "Year 4"


def _map_parental_education(edu: str) -> str:
    e = edu.lower()
    if "master" in e:
        return "Master"
    if "phd" in e or "doctor" in e:
        return "PhD"
    if "bachelor" in e or "degree" in e:
        return "Bachelor"
    return "High School"


def _build_feature_df(data: StudentPredictionInput) -> pd.DataFrame:
    stress_val = data.stress_index
    if data.financial_stress is not None and data.stress_index == 5.0:
        stress_val = float(data.financial_stress * 2.0)

    academic_perf = (data.gpa + data.semester_gpa + data.cgpa) / 3.0
    study_att_score = data.study_hours * (data.attendance / 100.0)
    
    if stress_val <= 3.0:
        stress_level = "Low"
    elif stress_val <= 7.0:
        stress_level = "Medium"
    else:
        stress_level = "High"

    log_family_income = float(np.log1p(data.family_income))
    
    study_mins = data.study_hours * 60.0
    travel_study_ratio = data.travel_time_minutes / (study_mins if study_mins > 0 else 1.0)

    if data.assignment_delay_days <= 1:
        delay_level = "Low"
    elif data.assignment_delay_days <= 3:
        delay_level = "Moderate"
    else:
        delay_level = "High"

    row: dict[str, Any] = {
        "Age": float(data.age),
        "Gender": data.gender,
        "Family_Income": float(data.family_income),
        "Internet_Access": data.internet_access,
        "Study_Hours_per_Day": float(data.study_hours),
        "Attendance_Rate": float(data.attendance),
        "Assignment_Delay_Days": int(data.assignment_delay_days),
        "Travel_Time_Minutes": float(data.travel_time_minutes),
        "Part_Time_Job": data.part_time_job,
        "Scholarship": data.scholarship,
        "Stress_Index": float(stress_val),
        "GPA": float(data.gpa),
        "Semester_GPA": float(data.semester_gpa),
        "CGPA": float(data.cgpa),
        "Semester": _map_semester(data.semester),
        "Department": _map_department(data.department),
        "Parental_Education": _map_parental_education(data.parental_education),
        "Academic_Performance_Score": float(academic_perf),
        "Study_Attendance_Score": float(study_att_score),
        "Stress_Level": stress_level,
        "Log_Family_Income": log_family_income,
        "Travel_Study_Ratio": float(travel_study_ratio),
        "Assignment_Delay_Level": delay_level,
    }

    return pd.DataFrame([row], columns=_FEATURE_COLUMNS)


def _extract_risk_factors(data: StudentPredictionInput) -> list[str]:
    factors: list[str] = []
    if data.cgpa < 2.0:
        factors.append(f"Low CGPA ({data.cgpa:.2f} / 4.00)")
    if data.gpa < 2.0:
        factors.append(f"Low Baseline GPA ({data.gpa:.2f} / 4.00)")
    if data.attendance < 65.0:
        factors.append(f"Poor Attendance ({data.attendance:.1f}%)")
    if data.failures >= 1:
        label = "Failure" if data.failures == 1 else "Failures"
        factors.append(f"{data.failures} Previous Academic {label}")
    if data.stress_index >= 7.0:
        factors.append(f"Severe Stress Level ({data.stress_index:.0f}/10)")
    if data.assignment_delay_days >= 3:
        factors.append(f"Chronic Assignment Delays ({data.assignment_delay_days} Days)")
    if data.study_hours < 2.0:
        factors.append(f"Insufficient Daily Study Hours ({data.study_hours:.1f} hrs/day)")
    return factors


def _build_recommendations(data: StudentPredictionInput, risk_level: str) -> list[str]:
    recs: list[str] = []
    if data.cgpa < 2.0 or data.gpa < 2.0:
        recs.append("Schedule an urgent academic counselling session to review course load and study strategy.")
        recs.append("Enrol the student in subject-specific tutoring or a peer-mentoring programme.")
    if data.attendance < 65.0:
        recs.append("Trigger an attendance alert and initiate weekly check-ins with the student's advisor.")
        recs.append("Investigate underlying barriers to attendance (transport, health, work commitments).")
    if data.failures >= 1:
        recs.append("Recommend a course-repeat or remedial plan to address failed subjects before the next semester.")
    if data.stress_index >= 7.0:
        recs.append("Refer the student to campus student welfare and mental health counselling.")
    if data.assignment_delay_days >= 3:
        recs.append("Provide structured academic deadline coaching and continuous progress tracking.")
    if not recs:
        recs.append("Maintain current academic momentum and encourage participation in enrichment activities.")
    return recs


def predict_student_dropout(data: StudentPredictionInput) -> dict:
    if _pipeline is not None:
        try:
            df = _build_feature_df(data)

            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                proba_matrix = _pipeline.predict_proba(df)

            dropout_proba: float = round(float(proba_matrix[0][1]), 4)
            dropout_proba = max(0.0, min(1.0, dropout_proba))

            if dropout_proba >= 0.50:
                risk_level = "High"
            elif dropout_proba >= 0.30:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            prediction = "Dropout" if dropout_proba >= 0.40 else "Graduate / Retained"

            return {
                "prediction": prediction,
                "probability": dropout_proba,
                "riskLevel": risk_level,
                "keyRiskFactors": _extract_risk_factors(data),
                "recommendations": _build_recommendations(data, risk_level),
                "message": _build_message(risk_level, prediction),
            }
        except Exception:
            logger.exception("ML inference failed — falling back to rule engine.")

    return evaluate_student_risk(data)


def is_ml_active() -> bool:
    return _pipeline is not None