from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class StudentPredictionInput(BaseModel):
    department: str = Field(default="Computing & IT", description="Department / Faculty")
    semester: str = Field(default="Year 2", description="Current Semester")

    cgpa: float = Field(..., ge=0.0, le=4.0, description="Overall CGPA")
    semester_gpa: float = Field(..., ge=0.0, le=4.0, description="Latest Semester GPA")
    gpa: float = Field(..., ge=0.0, le=4.0, description="Baseline / Admission GPA")
    failures: int = Field(default=0, ge=0, description="Failed courses")

    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance Rate (%)")
    study_hours: float = Field(..., ge=0.0, description="Study Hours per Day")
    assignment_delay_days: int = Field(default=0, ge=0, description="Assignment Delay in Days")

    age: float = Field(..., ge=15.0, le=60.0, description="Age in years")
    gender: str = Field(..., description="Gender (Male / Female)")
    parental_education: str = Field(default="High School", description="Parental Education Level")
    family_income: float = Field(..., ge=0.0, description="Monthly Family Income")
    travel_time_minutes: float = Field(default=30.0, ge=0.0, description="Commute Time in Minutes")
    stress_index: float = Field(default=5.0, ge=1.0, le=10.0, description="Stress Index (1-10)")
    part_time_job: str = Field(default="No", description="Has Part-Time Employment (Yes/No)")
    scholarship: str = Field(default="No", description="Holds Scholarship (Yes/No)")
    internet_access: str = Field(default="Yes", description="Reliable Internet (Yes/No)")

    financial_stress: Optional[int] = Field(None, ge=0, le=5)


class PredictionResponse(BaseModel):

    prediction: str = Field(
        ...,
        description="Predicted outcome: 'Dropout' or 'Graduate / Retained'",
    )
    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Dropout probability as a value between 0 and 1",
    )
    riskLevel: str = Field(
        ...,
        description="Categorised risk level: 'Low', 'Medium', or 'High'",
    )
    keyRiskFactors: list[str] = Field(
        default_factory=list,
        description=(
            "Dynamically extracted list of student metrics that contributed to risk "
            "(e.g. 'Low GPA (1.80)', 'Poor Attendance (55.0%)')."
        ),
    )
    recommendations: list[str] = Field(
        default_factory=list,
        description=(
            "Tailored, actionable intervention steps for academic advisors "
            "based on the detected risk factors."
        ),
    )
    message: str = Field(..., description="Human-readable summary of the prediction")

    model_config = {
        "json_schema_extra": {
            "example": {
                "prediction": "Dropout",
                "probability": 0.82,
                "riskLevel": "High",
                "keyRiskFactors": [
                    "Low GPA (1.80)",
                    "Poor Attendance (55.0%)",
                    "2 Previous Academic Failures",
                    "High Financial Stress (Level 4/5)",
                ],
                "recommendations": [
                    "Schedule urgent academic counselling session within 48 hours.",
                    "Refer student to the financial aid office to explore bursaries or payment plans.",
                    "Enrol student in an attendance-improvement programme and set weekly check-ins.",
                    "Connect student with a peer-tutoring programme to address academic failures.",
                ],
                "message": (
                    "This student is at high risk of dropping out. "
                    "Immediate academic and financial counselling is recommended."
                ),
            }
        }
    }


class StudentHistoryItem(BaseModel):
    id: int
    age: float
    gender: str
    gpa: float
    semester_gpa: float
    cgpa: float
    attendance: float
    study_hours: float
    failures: int
    family_income: float
    financial_stress: Optional[int] = 0
    prediction: str
    probability: float
    risk_level: str
    evaluated_at: datetime

    model_config = {"from_attributes": True}