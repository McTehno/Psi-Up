from fastapi import APIRouter, HTTPException

from app.schemas.questionnaire_schema import GroupQuestionnaireResponse
from app.services.questionnaires.questionnaire_service import (
    get_questionnaire_for_group,
)


router = APIRouter(
    prefix="/competency-groups",
    tags=["Questionnaires"],
)


@router.get(
    "/{group_id}/questionnaire",
    response_model=GroupQuestionnaireResponse,
)
def read_questionnaire_for_group(group_id: str):
    questionnaire = get_questionnaire_for_group(group_id)

    if questionnaire is None:
        raise HTTPException(
            status_code=404,
            detail="Skupina kompetenc ni bila najdena.",
        )

    return questionnaire