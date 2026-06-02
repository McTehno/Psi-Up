import pytest
from unittest.mock import AsyncMock

from app.services.user_progress.user_progress_service import UserProgressService


# Mock repository-ja za user progress.
# Tako testiramo service logiko brez povezave z MongoDB.
@pytest.fixture
def user_progress_repository():
    return AsyncMock()


# Glavni fixture za UserProgressService.
@pytest.fixture
def service(user_progress_repository):
    return UserProgressService(
        user_progress_repository=user_progress_repository,
    )


@pytest.fixture
def progress_response():
    # Osnovni progress response v novi embedded strukturi.
    return {
        "_id": "progress_user_001",
        "user_id": "user_001",
        "saved": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "favorites": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "current_positions": [],
        "questionnaire_answers": [],
    }


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_progress(
    service,
    user_progress_repository,
    progress_response,
):
    # Arrange: repository vrne obstoječ progress.
    user_progress_repository.get_progress_by_user_id.return_value = progress_response

    # Act: service pridobi progress po user_id.
    result = await service.get_progress_by_user_id("user_001")

    # Assert: service vrne rezultat repository-ja.
    assert result == progress_response
    user_progress_repository.get_progress_by_user_id.assert_awaited_once_with(
        "user_001"
    )


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_none_when_missing(
    service,
    user_progress_repository,
):
    # Arrange: repository ne najde progressa.
    user_progress_repository.get_progress_by_user_id.return_value = None

    # Act: poskusimo pridobiti progress.
    result = await service.get_progress_by_user_id("missing_user")

    # Assert: service vrne None.
    assert result is None
    user_progress_repository.get_progress_by_user_id.assert_awaited_once_with(
        "missing_user"
    )


@pytest.mark.asyncio
async def test_create_progress_returns_created_progress(
    service,
    user_progress_repository,
    progress_response,
):
    # Arrange: repository ustvari začetni progress.
    user_progress_repository.create_progress.return_value = progress_response

    # Act: service ustvari progress.
    result = await service.create_progress("user_001")

    # Assert: service vrne ustvarjen progress.
    assert result == progress_response
    user_progress_repository.create_progress.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_get_or_create_progress_returns_existing_or_created_progress(
    service,
    user_progress_repository,
    progress_response,
):
    # Arrange: repository vrne obstoječ ali novo ustvarjen progress.
    user_progress_repository.get_or_create_progress.return_value = progress_response

    # Act: service zagotovi progress za uporabnika.
    result = await service.get_or_create_progress("user_001")

    # Assert: service delegira logiko v repository.
    assert result == progress_response
    user_progress_repository.get_or_create_progress.assert_awaited_once_with(
        "user_001"
    )


@pytest.mark.asyncio
async def test_get_or_create_progress_can_return_progress_for_missing_user(
    service,
    user_progress_repository,
):
    # Repository po trenutni implementaciji lahko vrne prazen progress response
    # tudi, če users dokument ne obstaja.
    user_progress_repository.get_or_create_progress.return_value = {
        "_id": "progress_missing_user",
        "user_id": "missing_user",
        "saved": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "favorites": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "current_positions": [],
        "questionnaire_answers": [],
    }

    # Act: service pokliče repository.
    result = await service.get_or_create_progress("missing_user")

    # Assert: service ne dodaja dodatne validacije, ampak vrne repository rezultat.
    assert result["_id"] == "progress_missing_user"
    assert result["user_id"] == "missing_user"
    assert result["saved"]["module_ids"] == []

    user_progress_repository.get_or_create_progress.assert_awaited_once_with(
        "missing_user"
    )