from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
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

    prediction: Mapped[str] = mapped_column(String(30), nullable=False)
    probability: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(10), nullable=False)

    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return (
            f"<StudentRecord id={self.id} prediction={self.prediction!r} "
            f"risk_level={self.risk_level!r} evaluated_at={self.evaluated_at}>"
        )
