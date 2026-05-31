from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database.mongodb import get_database

from app.schemas.learning_unit_schema import (
    LearningUnitDetailResponse,
    LearningUnitResponse,
)

from app.schemas.questionnaire_schema import (
    QuestionnaireResponse,
    QuestionnaireTargetType,
)

from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.questionnaires.questionnaire_service import QuestionnaireService
from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.modules.module_service import ModuleService

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository


router = APIRouter(prefix="/learning-units", tags=["Learning units"])


def get_learning_unit_service() -> LearningUnitService:
    """
    Vrne LearningUnitService instanco.

    Ustvari povezavo:
    database -> LearningUnitRepository + ModuleRepository -> LearningUnitService.
    """

    database = get_database()

    learning_unit_repository = LearningUnitRepository(database)
    module_repository = ModuleRepository(database)

    return LearningUnitService(
        learning_unit_repository=learning_unit_repository,
        module_repository=module_repository,
    )


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
    )

    learning_path_service = LearningPathService(
        learning_path_repository=learning_path_repository,
        module_service=module_service,
    )

    return QuestionnaireService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


@router.get("", response_model=List[LearningUnitResponse])
async def get_learning_units(
    learning_unit_service: LearningUnitService = Depends(get_learning_unit_service),
) -> List[LearningUnitResponse]:
    """
    Vrne vse učne enote.
    """

    learning_units = await learning_unit_service.get_all_learning_units()
    return learning_units


@router.get("/{learning_unit_id}", response_model=LearningUnitResponse)
async def get_learning_unit_by_id(
    learning_unit_id: str,
    learning_unit_service: LearningUnitService = Depends(get_learning_unit_service),
) -> LearningUnitResponse:
    """
    Vrne eno učno enoto po ID.

    Če učna enota ne obstaja, vrne 404.
    """

    learning_unit = await learning_unit_service.get_learning_unit_by_id(
        learning_unit_id
    )

    if not learning_unit:
        raise HTTPException(status_code=404, detail="Učna enota ni najdena.")

    return learning_unit


@router.get("/{learning_unit_id}/detail", response_model=LearningUnitDetailResponse)
async def get_learning_unit_detail(
    learning_unit_id: str,
    learning_unit_service: LearningUnitService = Depends(get_learning_unit_service),
) -> LearningUnitResponse:
    """
    Vrne podrobnosti učne enote za detail page.

    Trenutno vrne enako strukturo kot osnovni endpoint za eno učno enoto.
    """

    learning_unit = await learning_unit_service.get_learning_unit_detail(
        learning_unit_id
    )

    if not learning_unit:
        raise HTTPException(status_code=404, detail="Učna enota ni najdena.")

    return learning_unit


@router.get("/{learning_unit_id}/questionnaire", response_model=QuestionnaireResponse)
async def get_learning_unit_questionnaire(
    learning_unit_id: str,
    questionnaire_service: QuestionnaireService = Depends(get_questionnaire_service),
) -> QuestionnaireResponse:
    """
    Vrne vprašalnik za izbrano učno enoto.

    Vprašalnik se generira iz vprašanj za samooceno znotraj učne enote.
    """

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id=learning_unit_id,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire