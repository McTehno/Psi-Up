from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.module_schema import ModuleDetailResponse, ModuleResponse
from app.schemas.questionnaire_schema import QuestionnaireResponse, QuestionnaireTargetType
from app.services.modules.module_service import ModuleService
from app.services.questionnaires.questionnaire_service import QuestionnaireService

from app.database.mongodb import get_database

from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository
from app.repositories.learning_path_repository import LearningPathRepository


from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.modules.module_service import ModuleService



router = APIRouter(prefix="/modules", tags=["Modules"])


def get_module_service() -> ModuleService:
    """
    Vrne ModuleService instanco.

    Ustvari povezavo:
    database -> ModuleRepository + LearningUnitRepository + LearningPathRepository
    -> ModuleService.
    """

    database = get_database()

    module_repository = ModuleRepository(database)
    learning_unit_repository = LearningUnitRepository(database)
    learning_path_repository = LearningPathRepository(database)

    learning_unit_service = LearningUnitService(learning_unit_repository)

    return ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
        learning_path_repository=learning_path_repository,
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


@router.get("", response_model=List[ModuleResponse])
async def get_modules(
    module_service: ModuleService = Depends(get_module_service),
) -> List[ModuleResponse]:
    """
    Vrne vse module.

    TODO:
    - Poklicati ModuleService.
    - Dodati paginacijo, če bo podatkov veliko.
    """

    modules = await module_service.get_all_modules()
    return modules


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module_by_id(
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
) -> ModuleResponse:
    """
    Vrne en modul po ID.

    TODO:
    - Dodati boljšo obravnavo napak.
    - Preveriti, ali ID obstaja v bazi.
    """

    module = await module_service.get_module_by_id(module_id)

    if not module:
        raise HTTPException(status_code=404, detail="Modul ni najden.")

    return module


@router.get("/{module_id}/detail", response_model=ModuleDetailResponse)
async def get_module_detail(
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
):
    """
    Vrne podrobnosti modula za detail page.

    TODO:
    - Vrne osnovne podatke modula.
    - Vrne tudi podrobnosti učnih enot znotraj modula.
    - Po potrebi dodati response_model, ko bo končna oblika potrjena.
    """

    module = await module_service.get_module_detail(module_id)

    if not module:
        raise HTTPException(status_code=404, detail="Modul ni najden.")

    return module


@router.get("/{module_id}/learning-units")
async def get_module_learning_units(
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
):
    """
    Vrne reference učnih enot znotraj modula.

    TODO:
    - Po potrebi vrniti tudi celotne podatke učnih enot, ne samo reference.
    - Urediti prikaz glede na order in parallel_group.
    - Dejanska logika dostopnosti mora temeljiti na prerequisites.
    """

    learning_units = await module_service.get_learning_unit_references_for_module(
        module_id
    )

    return learning_units


@router.get("/{module_id}/available-learning-units")
async def get_available_learning_units_for_module(
    module_id: str,
    completed_learning_unit_ids: List[str] = Query(default=[]),
    module_service: ModuleService = Depends(get_module_service),
):
    """
    Vrne učne enote, ki jih uporabnik lahko začne glede na zaključene predpogoje.

    TODO:
    - completed_learning_unit_ids bo kasneje verjetno prišel iz user_progress.
    - Trenutno je pripravljen kot query parameter za testiranje.
    - Prerequisites so glavni vir logike dostopnosti.
    """

    available_learning_units = await module_service.get_available_learning_units_for_module(
        module_id=module_id,
        completed_learning_unit_ids=completed_learning_unit_ids,
    )

    return available_learning_units


@router.get("/{module_id}/questionnaire", response_model=QuestionnaireResponse)
async def get_module_questionnaire(
    module_id: str,
    questionnaire_service: QuestionnaireService = Depends(get_questionnaire_service),
) -> QuestionnaireResponse:
    """
    Vrne vprašalnik za izbran modul.

    TODO:
    - Poklicati QuestionnaireService za target_type module.
    - Dodati obravnavo primera, ko vprašalnik ne obstaja.
    """

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id=module_id,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire