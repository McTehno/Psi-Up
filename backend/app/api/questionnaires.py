from fastapi import APIRouter, Depends, HTTPException, Query

from app.database.mongodb import get_database

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository

from app.schemas.questionnaire_schema import (
    QuestionnaireResponse,
    QuestionnaireTargetType,
)

from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.modules.module_service import ModuleService
from app.services.questionnaires.questionnaire_service import QuestionnaireService

from app.repositories.user_progress.questionnaire_answers_repository import (
    QuestionnaireAnswersRepository,
)
from app.services.user_progress.questionnaire_answers_service import (
    QuestionnaireAnswersService,
)

from typing import Optional

router = APIRouter(prefix="/questionnaires", tags=["Questionnaires"])


def get_questionnaire_service() -> QuestionnaireService:
    """
    Vrne QuestionnaireService instanco.

    Ustvari povezavo:
    database -> repositories -> services -> QuestionnaireService.
    """

    database = get_database()

    learning_unit_repository = LearningUnitRepository(database)
    module_repository = ModuleRepository(database)
    learning_path_repository = LearningPathRepository(database)

    learning_unit_service = LearningUnitService(learning_unit_repository)

    module_service = ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
        learning_path_repository=learning_path_repository,
    )

    learning_path_service = LearningPathService(
        learning_path_repository=learning_path_repository,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )

    return QuestionnaireService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )

def get_questionnaire_answers_service() -> QuestionnaireAnswersService:
    """
    Vrne QuestionnaireAnswersService instanco.
    """

    database = get_database()

    questionnaire_answers_repository = QuestionnaireAnswersRepository(database)

    return QuestionnaireAnswersService(
        questionnaire_answers_repository=questionnaire_answers_repository,
    )

@router.get("", response_model=QuestionnaireResponse)
async def get_questionnaire(
    target_type: QuestionnaireTargetType = Query(
        ...,
        description="Tip vsebine, za katero želimo vprašalnik.",
    ),
    target_id: str = Query(
        ...,
        description="ID učne poti, modula ali učne enote.",
    ),
    user_id: Optional[str] = Query(
        None,
        description="ID uporabnika za predizpolnitev zadnjih odgovorov.",
    ),
    questionnaire_service: QuestionnaireService = Depends(get_questionnaire_service),
    questionnaire_answers_service: QuestionnaireAnswersService = Depends(
        get_questionnaire_answers_service
    ),
) -> QuestionnaireResponse:
    """
    Vrne vprašalnik za izbrano učno pot, modul ali učno enoto.

    Če je user_id podan, se vprašanja predizpolnijo z zadnjimi
    eksplicitnimi odgovori uporabnika.
    """

    latest_explicit_answers = {}

    if user_id:
        latest_explicit_answers = (
            await questionnaire_answers_service.get_latest_explicit_answer_maps(
                user_id=user_id
            )
        )

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=target_type,
        target_id=target_id,
        latest_explicit_answers=latest_explicit_answers,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire