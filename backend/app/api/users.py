from fastapi import APIRouter, Depends, HTTPException

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

    TODO:
    - Povezati z UserRepository.
    - Povezati z UserProgressRepository.
    - Dodati dependency injection za database.
    """

    raise NotImplementedError("UserService dependency še ni implementiran.")


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Vrne uporabniški profil po lokalnem user_id.

    TODO:
    - Poklicati UserService.
    - Dodati obravnavo, če uporabnik ne obstaja.
    """

    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user


@router.get("/by-auth/{auth_user_id}", response_model=UserResponse)
async def get_user_by_auth_user_id(
    auth_user_id: str,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Vrne uporabniški profil po zunanjem auth_user_id.

    TODO:
    - auth_user_id pride iz zunanjega auth sistema.
    - Uporablja se za povezavo Firebase/Auth0 uporabnika z našo bazo.
    """

    user = await user_service.get_user_by_auth_user_id(auth_user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user


@router.post("/profile", response_model=UserResponse)
async def get_or_create_user_profile(
    request: UserCreateRequest,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Vrne ali ustvari uporabniški profil po uspešni zunanji prijavi.

    TODO:
    - Frontend po prijavi prek zunanjega auth sistema pošlje auth_user_id.
    - Če uporabnik že obstaja, ga vrnemo.
    - Če ne obstaja, ustvarimo lokalni profil in prazen user_progress.
    """

    user = await user_service.get_or_create_user_profile(
        request.model_dump()
    )

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_profile(
    user_id: str,
    request: UserUpdateRequest,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    """
    Posodobi aplikacijski profil uporabnika.

    TODO:
    - Dovoliti samo posodobitev aplikacijskih podatkov.
    - Ne urejati gesel, ker so gesla v zunanjem auth sistemu.
    """

    user = await user_service.update_user_profile(
        user_id=user_id,
        update_data=request.model_dump(exclude_unset=True),
    )

    if not user:
        raise HTTPException(status_code=404, detail="Uporabnik ni najden.")

    return user