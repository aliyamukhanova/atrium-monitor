from fastapi import (
    APIRouter,
    HTTPException,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Report
from app.schemas import (
    ReportCreate,
    ReportResponse,
    ReportUpdate,
)


router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)

@router.get(
    "",
    response_model=list[ReportResponse],
)
def get_reports():
    db: Session = SessionLocal()

    try:
        return (
            db.query(Report)
            .order_by(Report.created_at.desc())
            .all()
        )

    finally:
        db.close()

@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_report(
    report_data: ReportCreate,
):
    db: Session = SessionLocal()

    try:
        report = Report(
            category=report_data.category,
            comment=report_data.comment,
            status="open",
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return report

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
        
@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def get_report(report_id: int):
    db: Session = SessionLocal()

    try:
        report = (
            db.query(Report)
            .filter(Report.id == report_id)
            .first()
        )

        if report is None:
            raise HTTPException(
                status_code=404,
                detail="Report not found",
            )

        return report

    finally:
        db.close()
        
@router.patch(
    "/{report_id}",
    response_model=ReportResponse,
)
def update_report(
    report_id: int,
    report_data: ReportUpdate,
):
    db: Session = SessionLocal()

    try:
        report = (
            db.query(Report)
            .filter(Report.id == report_id)
            .first()
        )

        if report is None:
            raise HTTPException(
                status_code=404,
                detail="Report not found",
            )

        update_data = report_data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(report, field, value)

        db.commit()
        db.refresh(report)

        return report

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
        
@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_report(report_id: int):
    db: Session = SessionLocal()

    try:
        report = (
            db.query(Report)
            .filter(Report.id == report_id)
            .first()
        )

        if report is None:
            raise HTTPException(
                status_code=404,
                detail="Report not found",
            )

        db.delete(report)
        db.commit()

        return Response(
            status_code=status.HTTP_204_NO_CONTENT,
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()