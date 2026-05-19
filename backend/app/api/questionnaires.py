from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.questionnaire_schema import (
    QuestionnaireResponse,
    QuestionnaireTargetType,
)
from app.services.questionnaires.questionnaire_service import QuestionnaireService

router = APIRouter(prefix="/questionnaires", tags=["Questionnaires"])


def get_questionnaire_service() -> QuestionnaireService:
    """
    Vrne QuestionnaireService instanco.

    TODO:
    - Povezati z LearningPathService.
    - Povezati z ModuleService.
    - Povezati z LearningUnitService.
    - Dodati dependency injection za database.
    """

    raise NotImplementedError("QuestionnaireService dependency še ni implementiran.")


@router.get("", response_model=QuestionnaireResponse)
async def get_questionnaire(
    target_type: QuestionnaireTargetType = Query(
        ...,
        description="Tip vsebine, za katero želimo vprašalnik."
    ),
    target_id: str = Query(
        ...,
        description="ID učne poti, modula ali učne enote."
    ),
    questionnaire_service: QuestionnaireService = Depends(get_questionnaire_service),
) -> QuestionnaireResponse:
    """
    Vrne vprašalnik za izbrano učno pot, modul ali učno enoto.

    TODO:
    - Poklicati QuestionnaireService.
    - Dodati obravnavo primera, ko vprašalnik ne obstaja.
    - Kasneje dodati preverjanje, ali target_id res pripada izbranemu target_type.
    """

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=target_type,
        target_id=target_id,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire