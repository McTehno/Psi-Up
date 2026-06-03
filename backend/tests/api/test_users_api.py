from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.api.users import get_user_service
from app.core.security import get_current_user
from app.main import app


class FakeUserService:
    # Fake service uporabimo, da API test preverja endpoint, ne service logike.
    async def get_or_create_user_profile(self, user_data):
        return {
            "_id": "user_supabase_test_001",
            "auth_provider": user_data.get("auth_provider"),
            "auth_user_id": user_data.get("auth_user_id"),
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "created_at": datetime(2026, 5, 18, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
            "progress": {
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
            },
        }

    async def get_user_by_auth_user_id(self, auth_user_id: str):
        if auth_user_id == "missing_auth_user":
            return None

        return {
            "_id": "user_supabase_test_001",
            "auth_provider": "supabase",
            "auth_user_id": auth_user_id,
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "created_at": datetime(2026, 5, 18, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
            "progress": {
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
            },
        }

    async def get_user_by_id(self, user_id: str):
        if user_id == "missing_user":
            return None

        return {
            "_id": user_id,
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "created_at": datetime(2026, 5, 18, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
            "progress": {
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
            },
        }

    async def update_user_profile(self, user_id: str, update_data):
        if user_id == "missing_user":
            return None

        return {
            "_id": user_id,
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": update_data.get("name", "Testni uporabnik"),
            "email": update_data.get("email", "test@example.com"),
            "created_at": datetime(2026, 5, 18, tzinfo=timezone.utc),
            "updated_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
            "progress": {
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
            },
        }


def override_user_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake user service.
    return FakeUserService()


def override_current_user():
    # Simuliramo prijavljenega uporabnika iz zunanjega auth sistema.
    return {
        "sub": "supabase_test_001",
    }


def override_current_user_mismatch():
    # Simuliramo prijavljenega uporabnika, ki ne sme dostopati do tujega profila.
    return {
        "sub": "other_auth_user",
    }


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake service in fake auth uporabnika.
    app.dependency_overrides[get_user_service] = override_user_service
    app.dependency_overrides[get_current_user] = override_current_user


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_or_create_user_profile_returns_user_profile():
    # Endpoint ustvari ali vrne uporabniški profil po zunanji prijavi.
    response = client.post(
        "/api/users/profile",
        json={
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_supabase_test_001"
    assert data["auth_provider"] == "supabase"
    assert data["auth_user_id"] == "supabase_test_001"
    assert data["name"] == "Testni uporabnik"
    assert data["email"] == "test@example.com"
    assert "progress" in data
    assert data["progress"]["saved"]["module_ids"] == []


def test_get_or_create_user_profile_returns_403_when_auth_user_does_not_match():
    # Uporabnik ne sme ustvariti profila za drug auth_user_id.
    app.dependency_overrides[get_current_user] = override_current_user_mismatch

    response = client.post(
        "/api/users/profile",
        json={
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
        },
    )

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Unauthorized"


def test_get_or_create_user_profile_rejects_invalid_email():
    # UserCreateRequest uporablja EmailStr, zato neveljaven email vrne 422.
    response = client.post(
        "/api/users/profile",
        json={
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "invalid-email",
        },
    )

    assert response.status_code == 422


def test_get_user_by_auth_user_id_returns_user_profile():
    # Endpoint vrne profil po zunanjem auth_user_id.
    response = client.get("/api/users/by-auth/supabase_test_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_supabase_test_001"
    assert data["auth_user_id"] == "supabase_test_001"
    assert data["name"] == "Testni uporabnik"


def test_get_user_by_auth_user_id_returns_403_when_auth_user_does_not_match():
    # Uporabnik ne sme brati profila drugega auth_user_id.
    app.dependency_overrides[get_current_user] = override_current_user_mismatch

    response = client.get("/api/users/by-auth/supabase_test_001")

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Unauthorized"


def test_get_user_by_auth_user_id_returns_404_when_missing():
    # Če uporabnik z auth_user_id ne obstaja, endpoint vrne 404.
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "missing_auth_user",
    }

    response = client.get("/api/users/by-auth/missing_auth_user")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Uporabnik ni najden."


def test_get_user_by_id_returns_user_profile():
    # Endpoint vrne uporabnika po lokalnem user_id.
    response = client.get("/api/users/user_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["auth_user_id"] == "supabase_test_001"
    assert data["email"] == "test@example.com"


def test_get_user_by_id_returns_404_when_missing():
    # Če lokalni uporabnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/users/missing_user")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Uporabnik ni najden."


def test_update_user_profile_returns_updated_user():
    # Endpoint posodobi dovoljena polja uporabniškega profila.
    response = client.put(
        "/api/users/user_001",
        json={
            "name": "Novo ime",
            "email": "new@example.com",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["name"] == "Novo ime"
    assert data["email"] == "new@example.com"


def test_update_user_profile_accepts_partial_update():
    # Update request lahko vsebuje samo name.
    response = client.put(
        "/api/users/user_001",
        json={
            "name": "Novo ime",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["name"] == "Novo ime"
    assert data["email"] == "test@example.com"


def test_update_user_profile_rejects_invalid_email():
    # UserUpdateRequest uporablja EmailStr, zato neveljaven email vrne 422.
    response = client.put(
        "/api/users/user_001",
        json={
            "email": "invalid-email",
        },
    )

    assert response.status_code == 422


def test_update_user_profile_returns_404_when_missing():
    # Če uporabnik ne obstaja, endpoint vrne 404.
    response = client.put(
        "/api/users/missing_user",
        json={
            "name": "Novo ime",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Uporabnik ni najden."