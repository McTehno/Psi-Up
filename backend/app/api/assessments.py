from fastapi import APIRouter, HTTPException

from app.schemas.assessment_schema import (
    SelfAssessmentRequest,
    SelfAssessmentResponse,
)
from app.services.assessments.assessment_service import process_self_assessment


router = APIRouter(
    prefix="/assessments",
    tags=["Assessments"],
)


@router.post(
    "/self-assessment",
    response_model=SelfAssessmentResponse,
)
def create_self_assessment(request: SelfAssessmentRequest):
    assessment = process_self_assessment(
        competency_id=request.competency_id,
        self_assessment_level=request.self_assessment_level,
    )

    if assessment is None:
        raise HTTPException(
            status_code=400,
            detail="Izbrana raven samoocene ni veljavna.",
        )

    return assessment