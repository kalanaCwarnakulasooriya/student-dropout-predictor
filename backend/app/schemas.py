from pydantic import BaseModel, Field


class StudentPredictionInput(BaseModel):
    """Input schema for student dropout risk prediction."""

    age: int = Field(..., ge=1, description="Student age in years")
    gender: str = Field(..., description="Student gender (e.g. 'Male', 'Female')")
    gpa: float = Field(..., ge=0.0, le=4.0, description="Cumulative GPA on a 4.0 scale")
    semester_gpa: float = Field(..., ge=0.0, le=4.0, description="Current semester GPA")
    cgpa: float = Field(..., ge=0.0, le=4.0, description="Cumulative Grade Point Average")
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0–100)")
    study_hours: float = Field(..., ge=0.0, description="Average weekly study hours")
    failures: int = Field(..., ge=0, description="Number of failed courses")
    family_income: float = Field(..., ge=0.0, description="Annual family income")
    financial_stress: int = Field(..., ge=1, le=5, description="Financial stress level (1 = Low, 5 = High)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 20,
                "gender": "Female",
                "gpa": 1.8,
                "semester_gpa": 1.5,
                "cgpa": 1.7,
                "attendance": 55.0,
                "study_hours": 4.0,
                "failures": 2,
                "family_income": 25000.0,
                "financial_stress": 4,
            }
        }
    }


class PredictionResponse(BaseModel):
    """Output schema returned by the prediction endpoint."""

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
    message: str = Field(..., description="Human-readable summary of the prediction")

    model_config = {
        "json_schema_extra": {
            "example": {
                "prediction": "Dropout",
                "probability": 0.82,
                "riskLevel": "High",
                "message": (
                    "This student is at high risk of dropping out. "
                    "Immediate academic and financial counselling is recommended."
                ),
            }
        }
    }
