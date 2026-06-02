import pytest
from unittest.mock import AsyncMock

from app.services.users.user_service import UserService


# Mock repository-ja za uporabnike.
# Tako testiramo service logiko brez povezave z MongoDB.
@pytest.fixture
def user_repository():
    return AsyncMock()


# Mock repository-ja za user progress.
# Trenutni UserService ga še vedno pokliče pri get_or_create_user_profile.
@pytest.fixture
def user_progress_repository():
    return AsyncMock()


# Glavni fixture za UserService.
@pytest.fixture
def service(
    user_repository,
    user_progress_repository,
):
    return UserService(
        user_repository=user_repository,
        user_progress_repository=user_progress_repository,
    )


@pytest.mark.asyncio
async def test_get_user_by_id_returns_user(
    service,
    user_repository,
):
    # Arrange: repository vrne uporabnika po lokalnem ID-ju.
    user_repository.get_user_by_id.return_value = {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    # Act: pridobimo uporabnika prek service-a.
    result = await service.get_user_by_id("user_001")

    # Assert: service samo posreduje rezultat repository-ja.
    assert result == {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    user_repository.get_user_by_id.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_get_user_by_id_returns_none_when_user_missing(
    service,
    user_repository,
):
    # Arrange: repository ne najde uporabnika.
    user_repository.get_user_by_id.return_value = None

    # Act: poskusimo pridobiti neobstoječega uporabnika.
    result = await service.get_user_by_id("missing_user")

    # Assert: service vrne None.
    assert result is None
    user_repository.get_user_by_id.assert_awaited_once_with("missing_user")


@pytest.mark.asyncio
async def test_get_user_by_auth_user_id_returns_user(
    service,
    user_repository,
):
    # Arrange: repository vrne uporabnika po zunanjem auth_user_id.
    user_repository.get_user_by_auth_user_id.return_value = {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
    }

    # Act: pridobimo uporabnika prek auth_user_id.
    result = await service.get_user_by_auth_user_id("supabase_test_001")

    # Assert: service pokliče pravilno repository metodo.
    assert result == {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
    }

    user_repository.get_user_by_auth_user_id.assert_awaited_once_with(
        "supabase_test_001"
    )


@pytest.mark.asyncio
async def test_get_user_by_auth_user_id_returns_none_when_user_missing(
    service,
    user_repository,
):
    # Arrange: uporabnik s tem auth_user_id ne obstaja.
    user_repository.get_user_by_auth_user_id.return_value = None

    # Act: poskusimo pridobiti uporabnika.
    result = await service.get_user_by_auth_user_id("missing_auth_user")

    # Assert: service vrne None.
    assert result is None
    user_repository.get_user_by_auth_user_id.assert_awaited_once_with(
        "missing_auth_user"
    )


@pytest.mark.asyncio
async def test_get_or_create_user_profile_returns_user_and_creates_progress(
    service,
    user_repository,
    user_progress_repository,
):
    # Arrange: repository vrne obstoječ ali novo ustvarjen uporabniški profil.
    user_data = {
        "auth_provider": "supabase",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    user_repository.get_or_create_user_profile.return_value = {
        "_id": "user_001",
        "auth_provider": "supabase",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    user_progress_repository.get_or_create_progress.return_value = {
        "user_id": "user_001"
    }

    # Act: pridobimo ali ustvarimo uporabniški profil.
    result = await service.get_or_create_user_profile(user_data)

    # Assert: service vrne uporabnika in zagotovi progress zapis.
    assert result == {
        "_id": "user_001",
        "auth_provider": "supabase",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    user_repository.get_or_create_user_profile.assert_awaited_once_with(user_data)
    user_progress_repository.get_or_create_progress.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_get_or_create_user_profile_uses_id_when_mongo_id_is_missing(
    service,
    user_repository,
    user_progress_repository,
):
    # Arrange: service podpira tudi user["id"], če _id ni prisoten.
    user_repository.get_or_create_user_profile.return_value = {
        "id": "user_001",
        "auth_user_id": "supabase_test_001",
    }

    # Act: pridobimo ali ustvarimo uporabnika.
    result = await service.get_or_create_user_profile(
        {
            "auth_user_id": "supabase_test_001",
        }
    )

    # Assert: progress se ustvari z id vrednostjo.
    assert result["id"] == "user_001"
    user_progress_repository.get_or_create_progress.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_get_or_create_user_profile_does_not_create_progress_without_user_id(
    service,
    user_repository,
    user_progress_repository,
):
    # Arrange: repository vrne uporabnika brez _id/id.
    user_repository.get_or_create_user_profile.return_value = {
        "auth_user_id": "supabase_test_001",
    }

    # Act: pokličemo service.
    result = await service.get_or_create_user_profile(
        {
            "auth_user_id": "supabase_test_001",
        }
    )

    # Assert: brez user_id se progress repository ne kliče.
    assert result == {
        "auth_user_id": "supabase_test_001",
    }
    user_progress_repository.get_or_create_progress.assert_not_called()


@pytest.mark.asyncio
async def test_update_user_profile_updates_allowed_fields(
    service,
    user_repository,
):
    # Arrange: repository vrne posodobljenega uporabnika.
    user_repository.update_user_profile.return_value = {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Novo ime",
        "email": "new@example.com",
    }

    # Act: update vsebuje dovoljena in nedovoljena polja.
    result = await service.update_user_profile(
        user_id="user_001",
        update_data={
            "name": "Novo ime",
            "email": "new@example.com",
            "auth_user_id": "should_not_update",
            "progress": {
                "saved": {
                    "module_ids": ["mod_001"],
                }
            },
        },
    )

    # Assert: service v repository pošlje samo dovoljena polja.
    assert result == {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Novo ime",
        "email": "new@example.com",
    }

    user_repository.update_user_profile.assert_awaited_once_with(
        "user_001",
        {
            "name": "Novo ime",
            "email": "new@example.com",
        },
    )


@pytest.mark.asyncio
async def test_update_user_profile_filters_out_disallowed_fields(
    service,
    user_repository,
):
    # Arrange: obstoječ uporabnik.
    user_repository.get_user_by_id.return_value = {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    # Act: update vsebuje samo nedovoljena polja.
    result = await service.update_user_profile(
        user_id="user_001",
        update_data={
            "auth_user_id": "changed",
            "progress": {},
            "created_at": "2026-01-01T00:00:00Z",
        },
    )

    # Assert: service ne kliče update_user_profile, ampak vrne trenutnega uporabnika.
    assert result == {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
        "email": "test@example.com",
    }

    user_repository.update_user_profile.assert_not_called()
    user_repository.get_user_by_id.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_update_user_profile_returns_current_user_when_update_data_empty(
    service,
    user_repository,
):
    # Arrange: obstoječ uporabnik.
    user_repository.get_user_by_id.return_value = {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
    }

    # Act: update_data je prazen.
    result = await service.update_user_profile(
        user_id="user_001",
        update_data={},
    )

    # Assert: service vrne trenutnega uporabnika brez update klica.
    assert result == {
        "_id": "user_001",
        "auth_user_id": "supabase_test_001",
        "name": "Testni uporabnik",
    }

    user_repository.update_user_profile.assert_not_called()
    user_repository.get_user_by_id.assert_awaited_once_with("user_001")


@pytest.mark.asyncio
async def test_update_user_profile_returns_none_when_user_missing_and_no_allowed_fields(
    service,
    user_repository,
):
    # Arrange: uporabnik ne obstaja.
    user_repository.get_user_by_id.return_value = None

    # Act: update nima dovoljenih polj, zato service poskusi vrniti trenutnega uporabnika.
    result = await service.update_user_profile(
        user_id="missing_user",
        update_data={
            "progress": {},
        },
    )

    # Assert: ker uporabnik ne obstaja, service vrne None.
    assert result is None
    user_repository.get_user_by_id.assert_awaited_once_with("missing_user")
    user_repository.update_user_profile.assert_not_called()


@pytest.mark.asyncio
async def test_update_user_profile_allows_only_name(
    service,
    user_repository,
):
    # Arrange: repository vrne posodobljenega uporabnika.
    user_repository.update_user_profile.return_value = {
        "_id": "user_001",
        "name": "Novo ime",
    }

    # Act: posodobimo samo name.
    result = await service.update_user_profile(
        user_id="user_001",
        update_data={
            "name": "Novo ime",
        },
    )

    # Assert: update vsebuje samo name.
    assert result == {
        "_id": "user_001",
        "name": "Novo ime",
    }

    user_repository.update_user_profile.assert_awaited_once_with(
        "user_001",
        {
            "name": "Novo ime",
        },
    )


@pytest.mark.asyncio
async def test_update_user_profile_allows_only_email(
    service,
    user_repository,
):
    # Arrange: repository vrne posodobljenega uporabnika.
    user_repository.update_user_profile.return_value = {
        "_id": "user_001",
        "email": "new@example.com",
    }

    # Act: posodobimo samo email.
    result = await service.update_user_profile(
        user_id="user_001",
        update_data={
            "email": "new@example.com",
        },
    )

    # Assert: update vsebuje samo email.
    assert result == {
        "_id": "user_001",
        "email": "new@example.com",
    }

    user_repository.update_user_profile.assert_awaited_once_with(
        "user_001",
        {
            "email": "new@example.com",
        },
    )