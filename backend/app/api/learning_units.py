from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.learning_unit_schema import LearningUnitResponse
from app.schemas.questionnaire_schema import QuestionnaireResponse
from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.questionnaires.questionnaire_service import QuestionnaireService

from app.database.mongodb import get_database
from app.repositories.learning_unit_repository import LearningUnitRepository

router = APIRouter(prefix="/learning-units", tags=["Learning units"])


def get_learning_unit_service() -> LearningUnitService:
    """
    Vrne LearningUnitService instanco.

    Ustvari povezavo:
    database -> LearningUnitRepository -> LearningUnitService.
    """

    database = get_database()
    learning_unit_repository = LearningUnitRepository(database)

    return LearningUnitService(learning_unit_repository)


def get_questionnaire_service() -> QuestionnaireService:
    """
    Vrne QuestionnaireService instanco.

    TODO:
    - Povezati z dejanskimi service-i za learning_paths, modules in learning_units.
    - Dodati dependency injection za database.
    """

    raise NotImplementedError("QuestionnaireService dependency še ni implementiran.")


@router.get("", response_model=List[LearningUnitResponse])
async def get_learning_units(
    learning_unit_service: LearningUnitService = Depends(get_learning_unit_service),
) -> List[LearningUnitResponse]:
    """
    Vrne vse učne enote.

    TODO:
    - Poklicati LearningUnitService.
    - Dodati paginacijo, če bo podatkov veliko.
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

    TODO:
    - Dodati boljšo obravnavo napak.
    - Preveriti, ali ID obstaja v bazi.
    """

    learning_unit = await learning_unit_service.get_learning_unit_by_id(
        learning_unit_id
    )

    if not learning_unit:
        raise HTTPException(status_code=404, detail="Učna enota ni najdena.")

    return learning_unit


@router.get("/{learning_unit_id}/detail", response_model=LearningUnitResponse)
async def get_learning_unit_detail(
    learning_unit_id: str,
    learning_unit_service: LearningUnitService = Depends(get_learning_unit_service),
) -> LearningUnitResponse:
    """
    Vrne podrobnosti učne enote za detail page.

    TODO:
    - Po potrebi dodati podatke o napredku uporabnika.
    - Po potrebi dodati povezane module ali učne poti.
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

    TODO:
    - Poklicati QuestionnaireService za target_type learning_unit.
    - Dodati obravnavo primera, ko vprašalnik ne obstaja.
    """

    from app.schemas.questionnaire_schema import QuestionnaireTargetType

    questionnaire = await questionnaire_service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id=learning_unit_id,
    )

    if not questionnaire:
        raise HTTPException(status_code=404, detail="Vprašalnik ni najden.")

    return questionnaire