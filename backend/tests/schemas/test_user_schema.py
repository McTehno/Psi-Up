from datetime import datetime

import pytest
from pydantic import ValidationError

from app.schemas.user_schema import (
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)


def test_user_response_maps_mongodb_id_to_id():
    # Preverimo, da shema pravilno pretvori MongoDB _id v API polje id.
    user = UserResponse(
        _id="user_001",
        auth_user_id="supabase_test_001",
        name="Testni uporabnik",
        email="test@example.com",
        created_at="2026-05-18T00:00:00Z",
    )

    assert user.id == "user_001"
    assert isinstance(user.created_at, datetime)


def test_user_create_request_accepts_valid_email():
    # Preverimo request za ustvarjanje lokalnega profila po prijavi.
    request = UserCreateRequest(
        auth_user_id="supabase_test_001",
        name="Testni uporabnik",
        email="test@example.com",
    )

    assert request.auth_user_id == "supabase_test_001"
    assert request.email == "test@example.com"


def test_user_create_request_rejects_invalid_email():
    # Pydantic mora zavrniti nepravilno oblikovan email.
    with pytest.raises(ValidationError):
        UserCreateRequest(
            auth_user_id="supabase_test_001",
            email="invalid-email",
        )


def test_user_update_request_allows_partial_update():
    # Pri posodobitvi profila lahko pošljemo samo eno polje.
    request = UserUpdateRequest(
        name="Novo ime",
    )

    assert request.name == "Novo ime"
    assert request.email is None