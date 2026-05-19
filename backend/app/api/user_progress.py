from fastapi import APIRouter, Depends, HTTPException

from app.schemas.user_progress_schema import (
    CompleteContentRequest,
    FavoriteContentRequest,
    SaveContentRequest,
    UpdateCurrentPositionRequest,
    UserProgressResponse,
)
from app.database.mongodb import get_database

from app.services.user_progress.completed_content_service import CompletedContentService
from app.services.user_progress.current_position_service import CurrentPositionService
from app.services.user_progress.favorite_content_service import FavoriteContentService
from app.services.user_progress.saved_content_service import SavedContentService
from app.services.user_progress.user_progress_service import UserProgressService

from app.repositories.user_progress.user_progress_repository import UserProgressRepository
from app.repositories.user_progress.saved_content_repository import SavedContentRepository
from app.repositories.user_progress.favorite_content_repository import FavoriteContentRepository
from app.repositories.user_progress.completed_content_repository import CompletedContentRepository
from app.repositories.user_progress.current_position_repository import CurrentPositionRepository

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository
from app.services.validation.content_validation_service import ContentValidationService


router = APIRouter(prefix="/user-progress", tags=["User progress"])


def get_user_progress_service() -> UserProgressService:
    """
    Vrne UserProgressService instanco.

    Ustvari povezavo:
    database -> UserProgressRepository -> UserProgressService.
    """

    database = get_database()
    user_progress_repository = UserProgressRepository(database)

    return UserProgressService(user_progress_repository)


def get_saved_content_service() -> SavedContentService:
    """
    Vrne SavedContentService instanco.

    Ustvari povezavo:
    database -> SavedContentRepository -> SavedContentService.
    """

    database = get_database()
    saved_content_repository = SavedContentRepository(database)

    return SavedContentService(saved_content_repository)


def get_favorite_content_service() -> FavoriteContentService:
    """
    Vrne FavoriteContentService instanco.

    Ustvari povezavo:
    database -> FavoriteContentRepository -> FavoriteContentService.
    """

    database = get_database()
    favorite_content_repository = FavoriteContentRepository(database)

    return FavoriteContentService(favorite_content_repository)


def get_completed_content_service() -> CompletedContentService:
    """
    Vrne CompletedContentService instanco.

    Ustvari povezavo:
    database -> CompletedContentRepository -> CompletedContentService.
    """

    database = get_database()
    completed_content_repository = CompletedContentRepository(database)

    return CompletedContentService(completed_content_repository)


def get_current_position_service() -> CurrentPositionService:
    """
    Vrne CurrentPositionService instanco.

    Ustvari povezavo:
    database -> CurrentPositionRepository -> CurrentPositionService.
    """

    database = get_database()
    current_position_repository = CurrentPositionRepository(database)

    return CurrentPositionService(current_position_repository)

def get_content_validation_service() -> ContentValidationService:
    """
    Vrne ContentValidationService instanco.

    Ustvari povezavo:
    database -> repositories -> ContentValidationService.
    """

    database = get_database()

    user_progress_repository = UserProgressRepository(database)
    learning_path_repository = LearningPathRepository(database)
    module_repository = ModuleRepository(database)
    learning_unit_repository = LearningUnitRepository(database)

    return ContentValidationService(
        user_progress_repository=user_progress_repository,
        learning_path_repository=learning_path_repository,
        module_repository=module_repository,
        learning_unit_repository=learning_unit_repository,
    )

@router.get("/{user_id}", response_model=UserProgressResponse)
async def get_user_progress(
    user_id: str,
    user_progress_service: UserProgressService = Depends(get_user_progress_service),
) -> UserProgressResponse:
    """
    Vrne napredek uporabnika.

    TODO:
    - Poklicati UserProgressService.
    - Če napredek ne obstaja, ga lahko kasneje ustvarimo ali vrnemo 404.
    """

    progress = await user_progress_service.get_progress_by_user_id(user_id)

    if not progress:
        raise HTTPException(status_code=404, detail="Napredek uporabnika ni najden.")

    return progress


@router.post("/{user_id}/ensure", response_model=UserProgressResponse)
async def get_or_create_user_progress(
    user_id: str,
    user_progress_service: UserProgressService = Depends(get_user_progress_service),
) -> UserProgressResponse:
    """
    Vrne obstoječ napredek uporabnika ali ustvari praznega.

    TODO:
    - Uporabiti ob ustvarjanju uporabniškega profila ali pri prvem obisku profila.
    """

    return await user_progress_service.get_or_create_progress(user_id)


@router.post("/save", response_model=UserProgressResponse)
async def save_content(
    request: SaveContentRequest,
    saved_content_service: SavedContentService = Depends(get_saved_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Shrani učno pot, modul ali učno enoto uporabniku.

    TODO:
    - Preveriti, ali content_id obstaja.
    - Preveriti, ali je content_type veljaven.
    """
    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )
    progress = await saved_content_service.save_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Vsebine ni bilo mogoče shraniti.")

    return progress


@router.delete("/save", response_model=UserProgressResponse)
async def remove_saved_content(
    request: SaveContentRequest,
    saved_content_service: SavedContentService = Depends(get_saved_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Odstrani shranjeno vsebino uporabnika.

    TODO:
    - Preveriti, ali je vsebina res shranjena.
    - Vrniti posodobljen napredek.
    """
    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )

    progress = await saved_content_service.remove_saved_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Shranjene vsebine ni bilo mogoče odstraniti.")

    return progress


@router.post("/favorite", response_model=UserProgressResponse)
async def favorite_content(
    request: FavoriteContentRequest,
    favorite_content_service: FavoriteContentService = Depends(get_favorite_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Označi vsebino kot priljubljeno.

    TODO:
    - Preveriti, ali content_id obstaja.
    - Preveriti, ali je content_type veljaven.
    """
    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )
    progress = await favorite_content_service.favorite_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Vsebine ni bilo mogoče označiti kot priljubljene.")

    return progress


@router.delete("/favorite", response_model=UserProgressResponse)
async def remove_favorite_content(
    request: FavoriteContentRequest,
    favorite_content_service: FavoriteContentService = Depends(get_favorite_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Odstrani vsebino iz priljubljenih.

    TODO:
    - Preveriti, ali je vsebina res označena kot priljubljena.
    - Vrniti posodobljen napredek.
    """

    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )

    progress = await favorite_content_service.remove_favorite_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Priljubljene vsebine ni bilo mogoče odstraniti.")

    return progress


@router.post("/complete", response_model=UserProgressResponse)
async def complete_content(
    request: CompleteContentRequest,
    completed_content_service: CompletedContentService = Depends(get_completed_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Označi vsebino kot dokončano.

    TODO:
    - Preveriti, ali content_id obstaja.
    - Preveriti, ali je content_type veljaven.
    - Po potrebi samodejno posodobiti trenutno pozicijo.
    """
    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )

    progress = await completed_content_service.complete_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Vsebine ni bilo mogoče označiti kot dokončane.")

    return progress


@router.delete("/complete", response_model=UserProgressResponse)
async def remove_completed_content(
    request: CompleteContentRequest,
    completed_content_service: CompletedContentService = Depends(get_completed_content_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Odstrani vsebino iz dokončanih.

    TODO:
    - Preveriti, ali je vsebina res dokončana.
    - Vrniti posodobljen napredek.
    """
    await validation_service.validate_content_action(
        user_id=request.user_id,
        content_type=request.content_type,
        content_id=request.content_id,
    )

    progress = await completed_content_service.remove_completed_content(
        user_id=request.user_id,
        content_id=request.content_id,
        content_type=request.content_type,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Dokončane vsebine ni bilo mogoče odstraniti.")

    return progress


@router.put("/current-position", response_model=UserProgressResponse)
async def update_current_position(
    request: UpdateCurrentPositionRequest,
    current_position_service: CurrentPositionService = Depends(get_current_position_service),
    validation_service: ContentValidationService = Depends(get_content_validation_service),
) -> UserProgressResponse:
    """
    Posodobi trenutno pozicijo uporabnika.

    TODO:
    - Preveriti, ali podani learning_path_id, current_module_id in current_learning_unit_id obstajajo.
    - Če uporabnik nima progress zapisa, ga ustvariti.
    """
    await validation_service.validate_current_position(
        user_id=request.user_id,
        learning_path_id=request.learning_path_id,
        current_module_id=request.current_module_id,
        current_learning_unit_id=request.current_learning_unit_id,
    )
    progress = await current_position_service.update_current_position(
        user_id=request.user_id,
        learning_path_id=request.learning_path_id,
        current_module_id=request.current_module_id,
        current_learning_unit_id=request.current_learning_unit_id,
    )

    if not progress:
        raise HTTPException(status_code=400, detail="Trenutne pozicije ni bilo mogoče posodobiti.")

    return progress