from __future__ import annotations

from app.schemas import StudentPredictionInput

_W_CGPA_LOW        = 0.28   # CGPA < 2.0
_W_GPA_LOW         = 0.22   # GPA  < 2.0
_W_ATTENDANCE_LOW  = 0.20   # attendance < 65 %
_W_FINANCIAL_STRESS= 0.15   # financial_stress >= 4
_W_FAILURES        = 0.10   # failures >= 1 (scaled by failure count, capped at weight)
_W_STUDY_HOURS_LOW = 0.05   # study_hours < 2


def _classify_risk(probability: float) -> str:
    if probability >= 0.70:
        return "High"
    if probability >= 0.35:
        return "Medium"
    return "Low"


def _build_message(risk_level: str, prediction: str) -> str:
    messages = {
        "High": (
            "This student is at high risk of dropping out. "
            "Immediate academic and financial counselling is strongly recommended."
        ),
        "Medium": (
            "This student shows moderate dropout risk indicators. "
            "Proactive advising and structured monitoring are advised."
        ),
        "Low": (
            "This student is currently on track to graduate. "
            "Encourage consistent attendance and healthy study habits."
        ),
    }
    return messages[risk_level]

def evaluate_student_risk(data: StudentPredictionInput) -> dict:
    cgpa_low        = data.cgpa        < 2.0
    gpa_low         = data.gpa         < 2.0
    attendance_low  = data.attendance  < 65.0
    high_fin_stress = data.financial_stress >= 4
    has_failures    = data.failures    >= 1
    low_study_hours = data.study_hours < 2.0

    failure_weight = min(data.failures * (_W_FAILURES / 2), _W_FAILURES) if has_failures else 0.0

    probability: float = round(
        (cgpa_low        * _W_CGPA_LOW)
        + (gpa_low         * _W_GPA_LOW)
        + (attendance_low  * _W_ATTENDANCE_LOW)
        + (high_fin_stress * _W_FINANCIAL_STRESS)
        + failure_weight
        + (low_study_hours * _W_STUDY_HOURS_LOW),
        4,
    )

    probability = max(0.0, min(1.0, probability))

    risk_level = _classify_risk(probability)
    prediction = "Dropout" if risk_level in ("High", "Medium") else "Graduate / Retained"

    key_risk_factors: list[str] = []

    if cgpa_low:
        key_risk_factors.append(f"Low CGPA ({data.cgpa:.2f} / 4.00)")
    if gpa_low:
        key_risk_factors.append(f"Low GPA ({data.gpa:.2f} / 4.00)")
    if attendance_low:
        key_risk_factors.append(f"Poor Attendance ({data.attendance:.1f}%)")
    if has_failures:
        label = "Failure" if data.failures == 1 else "Failures"
        key_risk_factors.append(f"{data.failures} Previous Academic {label}")
    if high_fin_stress:
        key_risk_factors.append(f"High Financial Stress (Level {data.financial_stress}/5)")
    if low_study_hours:
        key_risk_factors.append(f"Insufficient Study Hours ({data.study_hours:.1f} hrs/week)")

    recommendations: list[str] = []

    if cgpa_low or gpa_low:
        recommendations.append(
            "Schedule an urgent academic counselling session to review course load and study strategy."
        )
        recommendations.append(
            "Enrol the student in subject-specific tutoring or a peer-mentoring programme."
        )
    if attendance_low:
        recommendations.append(
            "Trigger an attendance alert and initiate weekly check-ins with the student's advisor."
        )
        recommendations.append(
            "Investigate underlying barriers to attendance (transport, health, work commitments)."
        )
    if has_failures:
        recommendations.append(
            "Recommend a course-repeat or remedial plan to address failed subjects before the next semester."
        )
        if data.failures >= 2:
            recommendations.append(
                "Consider a reduced course load this semester to improve pass rates and reduce burnout."
            )
    if high_fin_stress:
        recommendations.append(
            "Refer the student to the financial aid office to explore bursaries, grants, or payment plans."
        )
        recommendations.append(
            "Connect the student with part-time campus employment or emergency fund resources."
        )
    if low_study_hours:
        recommendations.append(
            "Provide a structured weekly study plan and introduce the student to campus study-skill workshops."
        )

    if not recommendations:
        recommendations.append(
            "Maintain current academic momentum and encourage participation in enrichment activities."
        )

    return {
        "prediction":       prediction,
        "probability":      probability,
        "riskLevel":        risk_level,
        "keyRiskFactors":   key_risk_factors,
        "recommendations":  recommendations,
        "message":          _build_message(risk_level, prediction),
    }
