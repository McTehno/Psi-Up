from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.learning_path_schema import LearningPathResponse
from app.schemas.questionnaire_schema import QuestionnaireResponse, QuestionnaireTargetType
from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.questionnaires.questionnaire_service import QuestionnaireService

from app.database.mongodb import get_database

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository

from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.modules.module_service import ModuleService


router = APIRouter(prefix="/learning-paths", tags=["Learning paths"])


def get_learning_path_service() -> LearningPathService:
    """
    Vrne LearningPathService instanco.

    Ustvari povezavo:
    database -> LearningPathRepository + ModuleRepository + LearningUnitRepository -> LearningPathService.
    """

    database = get_database()

    learning_path_repository = LearningPathRepository(database)
    module_repository = ModuleRepository(database)
    learning_unit_repository = LearningUnitRepository(database)

    learning_unit_service = LearningUnitService(learning_unit_repository)

    module_service = ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
    )

    return LearningPathService(
        learning_path_repository=learning_path_repository,
        module_service=module_service,
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


@router.get("", response_model=List[LearningPathResponse])
async def get_learning_paths(
    learning_path_service: LearningPathService = Depends(get_learning_path_service),
) -> List[LearningPathResponse]:
    """
    Vrne vse učne poti.

    TODO:
    - Poklicati LearningPathService.
    - Dodati paginacijo, če bo podatkov veliko.
    """

    learning_paths = await learning_path_service.get_all_learning_paths()
    return learning_paths


@router.get("/{learning_path_id}", response_model=LearningPathResponse)
async def get_learning_path_by_id(
    learning_path_id: str,
    learning_path_service: LearningPathService = Depends(get_learning_path_service),
) -> LearningPathResponse:
    """
    Vrne eno učno pot po ID.

    TODO:
    - Dodati boljšo obravnavo napak.
    - Preveriti, ali ID obstaja v bazi.
    """

    learning_path = await learning_path_service.get_learning_path_by_id(
        learning_path_id
    )

    if not learning_path:
        raise HTTPException(status_code=404, detail="Učna pot ni najdena.")

    return learning_path


@router.get("/{learning_path_id}/detail")
async def get_learning_path_detail(
    learning_path_id: str,
    learning_path_service: LearningPathService = Depends(get_learning_path_service),
):
    """
    Vrne podrobnosti učne poti za detail page.

    TODO:
    - Vrne osnovne podatke učne poti.
    - Vrne tudi podrobnosti modulov znotraj učne poti.
    - Po potrebi dodati response_model, ko bo končna oblika potrjena.
    """

    learning_path = await learning_path_service.get_learning_path_detail(
        learning_path_id
    )

    if not learning_path:
        raise HTTPException(status_code=404, detail="Učna pot ni najdena.")

    return learning_path


@router.get("/{learning_path_id}/modules")
async def get_learning_path_modules(
    learning_path_id: str,
    learning_path_service: LearningPathService = Depends(get_learning_path_service),
):
    """
    Vrne reference modulov znotraj učne poti.

    TODO:
    - Po potrebi vrniti tudi celotne podatke modulov, ne samo reference.
    - Urediti prikaz glede na order in parallel_group.
    - Dejanska logika dostopnosti mora temeljiti na prerequisites.
    """

    modules = await learning_path_service.get_module_references_for_learning_path(
        learning_path_id
    )

    return modules


@router.get("/{learning_path_id}/available-modules")
async def get_available_modules_for_learning_path(
    learning_path_id: str,
    completed_module_ids: List[str] = Query(default=[]),
    learning_path_service: LearningPathService = Depends(get_learning_path_service),
):
    """
    Vrne module, ki jih uporabnik lahko začne glede na zaključene predpogoje.

    TODO:
    - completed_module_ids bo kasneje verjetno prišel iz user_progress.
    - Trenutno je pripravljen kot query parameter za testiranje.
    - Prerequisites so glavni vir logike dostopnosti.
    """

    available_modules = await learning_path_service.get_available_modules_for_learning_path(
        learning_path_id=learning_path_id,
        completed_module_ids=completed_module_ids,
    )

    return available_modules


@router.get("/{learning_path_id}/questionnaire", response_model=QuestionnaireResponse)
async def get_learning_path_questionnaire(
    learning_path_id: str,
    questionnaire_service: QuestionnaireService = Depends(get_questionnaire_service),
) -> QuestionnaireResponse:
    """
    Vrne vprašalnik za izbrano učno pot.

    TODO:
    - Poklicati QuestionnaireService za target_type learning_path.
    - Dodati obravnavo primera, ko vprašalnik ne obstaja.
    """

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id=learning_path_id,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire