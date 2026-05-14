from fastapi import APIRouter, HTTPException

from app.schemas.recommendation_schema import (
    CompetencyRecommendationRequest,
    CompetencyRecommendationResponse,
)
from app.services.recommendations.recommendation_service import (
    recommend_competencies_from_answers,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post(
    "/competencies",
    response_model=CompetencyRecommendationResponse,
)
def create_competency_recommendation(request: CompetencyRecommendationRequest):
    recommendation = recommend_competencies_from_answers(
        group_id=request.group_id,
        answers=request.answers,
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Skupina kompetenc ni bila najdena.",
        )

    return recommendation