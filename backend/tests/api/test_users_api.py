from fastapi.testclient import TestClient

from app.api.users import get_user_service
from app.core.security import get_current_user
from app.main import app


class FakeUserService:
    # Fake service uporabimo, da API test preverja endpoint, auth pravila in response.
    async def get_or_create_user_profile(self, user_data: dict):
        return {
            "_id": "user_001",
            "auth_user_id": user_data["auth_user_id"],
            "name": user_data.get("name"),
            "email": user_data["email"],
            "created_at": "2026-05-18T00:00:00Z",
        }

    async def get_user_by_auth_user_id(self, auth_user_id: str):
        if auth_user_id == "missing_auth_user":
            return None

        return {
            "_id": "user_001",
            "auth_user_id": auth_user_id,
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "created_at": "2026-05-18T00:00:00Z",
        }

    async def get_user_by_id(self, user_id: str):
        if user_id == "missing_user":
            return None

        return {
            "_id": user_id,
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "created_at": "2026-05-18T00:00:00Z",
        }

    async def update_user_profile(self, user_id: str, update_data: dict):
        if user_id == "missing_user":
            return None

        return {
            "_id": user_id,
            "auth_user_id": "supabase_test_001",
            "name": update_data.get("name", "Testni uporabnik"),
            "email": update_data.get("email", "test@example.com"),
            "created_at": "2026-05-18T00:00:00Z",
        }


def override_user_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake user service.
    return FakeUserService()


def override_current_user():
    # Simuliramo prijavljenega uporabnika iz JWT tokena.
    return {
        "sub": "supabase_test_001",
    }


def override_different_current_user():
    # Simuliramo prijavljenega uporabnika, ki ni lastnik zahteve.
    return {
        "sub": "another_supabase_user",
    }


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo osnovne fake dependency-je.
    app.dependency_overrides[get_user_service] = override_user_service
    app.dependency_overrides[get_current_user] = override_current_user


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_or_create_user_profile_returns_profile():
    # Prijavljen uporabnik lahko ustvari oziroma pridobi svoj lokalni profil.
    response = client.post(
        "/api/users/profile",
        json={
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["auth_user_id"] == "supabase_test_001"
    assert data["name"] == "Testni uporabnik"
    assert data["email"] == "test@example.com"


def test_get_or_create_user_profile_returns_403_when_auth_user_does_not_match():
    # Uporabnik ne sme ustvariti profila za drug auth_user_id.
    app.dependency_overrides[get_current_user] = override_different_current_user

    response = client.post(
        "/api/users/profile",
        json={
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


def test_get_user_by_auth_user_id_returns_user():
    # Prijavljen uporabnik lahko pridobi profil po svojem auth_user_id.
    response = client.get("/api/users/by-auth/supabase_test_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["auth_user_id"] == "supabase_test_001"


def test_get_user_by_auth_user_id_returns_403_for_different_auth_user():
    # Uporabnik ne sme brati profila drugega auth uporabnika.
    app.dependency_overrides[get_current_user] = override_different_current_user

    response = client.get("/api/users/by-auth/supabase_test_001")

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Unauthorized"


def test_get_user_by_auth_user_id_returns_404_when_missing():
    # Če profil za auth_user_id ne obstaja, endpoint vrne 404.
    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "missing_auth_user",
    }

    response = client.get("/api/users/by-auth/missing_auth_user")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Uporabnik ni najden."


def test_get_user_by_id_returns_user():
    # Endpoint vrne uporabnika po lokalnem user_id.
    response = client.get("/api/users/user_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "user_001"
    assert data["auth_user_id"] == "supabase_test_001"


def test_get_user_by_id_returns_404_when_missing():
    # Če lokalni uporabnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/users/missing_user")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Uporabnik ni najden."


def test_update_user_profile_returns_updated_user():
    # Endpoint posodobi uporabniški profil.
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


def test_update_user_profile_returns_404_when_missing():
    # Če uporabnik ne obstaja, posodobitev vrne 404.
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