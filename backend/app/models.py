from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class StudentRecord(Base):

    __tablename__ = "student_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(50), nullable=False)
    gpa: Mapped[float] = mapped_column(Float, nullable=False)
    semester_gpa: Mapped[float] = mapped_column(Float, nullable=False)
    cgpa: Mapped[float] = mapped_column(Float, nullable=False)
    attendance: Mapped[float] = mapped_column(Float, nullable=False)
    study_hours: Mapped[float] = mapped_column(Float, nullable=False)
    failures: Mapped[int] = mapped_column(Integer, nullable=False)
    family_income: Mapped[float] = mapped_column(Float, nullable=False)
    financial_stress: Mapped[int] = mapped_column(Integer, nullable=False)

    department: Mapped[str] = mapped_column(String(50), nullable=True, default="CS")
    semester: Mapped[str] = mapped_column(String(50), nullable=True, default="Year 1")
    assignment_delay_days: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    travel_time_minutes: Mapped[float] = mapped_column(Float, nullable=True, default=30.0)
    stress_index: Mapped[float] = mapped_column(Float, nullable=True, default=5.0)
    parental_education: Mapped[str] = mapped_column(String(50), nullable=True, default="Bachelor")
    part_time_job: Mapped[str] = mapped_column(String(10), nullable=True, default="No")
    scholarship: Mapped[str] = mapped_column(String(10), nullable=True, default="No")
    internet_access: Mapped[str] = mapped_column(String(10), nullable=True, default="Yes")

    prediction: Mapped[str] = mapped_column(String(30), nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(10), nullable=False)

    key_risk_factors: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return (
            f"<StudentRecord id={self.id} department={self.department!r} prediction={self.prediction!r} "
            f"risk_level={self.risk_level!r} evaluated_at={self.evaluated_at}>"
        )
