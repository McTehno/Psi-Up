from fastapi import APIRouter

from app.schemas.competency_group_schema import CompetencyGroupResponse
from app.services.competency_groups.competency_group_service import (
    get_competency_groups,
)


router = APIRouter(
    prefix="/competency-groups",
    tags=["Competency Groups"],
)


@router.get("", response_model=list[CompetencyGroupResponse])
def read_competency_groups():
    return get_competency_groups()