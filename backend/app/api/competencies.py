from fastapi import APIRouter, HTTPException

from app.schemas.competency_schema import CompetencyResponse
from app.services.competencies.competency_service import (
    get_competencies,
    get_competency,
)


router = APIRouter(
    prefix="/competencies",
    tags=["Competencies"],
)


@router.get("", response_model=list[CompetencyResponse])
def read_competencies():
    return get_competencies()


@router.get("/{competency_id}", response_model=CompetencyResponse)
def read_competency(competency_id: str):
    competency = get_competency(competency_id)

    if competency is None:
        raise HTTPException(
            status_code=404,
            detail="Kompetenca ni bila najdena.",
        )

    return competency