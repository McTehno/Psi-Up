from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.database.mongodb import get_database
from app.repositories.user_progress.user_progress_repository import UserProgressRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import (
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services.users.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """
    Vrne UserService instanco.

    Ustvari povezavo:
    database -> UserRepository + UserProgressRepository -> UserService.
    """

    database = get_database()

    user_repository = UserRepository(database)
    user_progress_repository = UserProgressRepository(database)

    return UserService(
        user_repository=user_repository,
        user_progress_repository=user_progress_repository,
    )


@router.post("/profile", response_model=UserResponse)
async def get_or_create_user_profile(
    request: UserCreateRequest,
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    """
    Vrne ali ustvari uporabniški profil po uspešni zunanji prijavi.

    Frontend po prijavi prek zunanjega auth sistema pošlje auth_user_id.
    Če uporabnik že obstaja, ga vrnemo.
    Če ne obstaja, ustvarimo lokalni profil in prazen user_progress.
    """

    if current_user.get("sub") != request.auth_user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = await user_service.get_or_create_user_profile(
        request.model_dump()
    )

    return user


@router.get("/by-auth/{auth_user_id}", response_model=UserResponse)
async def get_user_by_auth_user_id(
    auth_user_id: str,
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(get_current_user),
) -> UserResponse:
    """
    Vrne uporabniški profil po zunanjem auth_user_id.
    """

    if current_user.get("sub") != auth_user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = await user_service.get_user_by_auth_user_id(auth_user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Vrne uporabniški profil po lokalnem user_id.
    """

    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_profile(
    user_id: str,
    request: UserUpdateRequest,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Posodobi aplikacijski profil uporabnika.
    """

    user = await user_service.update_user_profile(
        user_id=user_id,
        update_data=request.model_dump(exclude_unset=True),
    )

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user