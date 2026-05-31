from fastapi.testclient import TestClient

from app.api.user_progress import (
    get_authenticated_local_user_id,
    get_completed_content_service,
    get_content_validation_service,
    get_current_position_service,
    get_favorite_content_service,
    get_saved_content_service,
    get_user_progress_service,
)
from app.main import app


def make_progress(user_id: str = "user_001"):
    # Skupen fake user progress response za vse user progress endpoint-e.
    return {
        "_id": f"progress_{user_id}",
        "user_id": user_id,
        "saved_learning_paths": [],
        "saved_modules": [],
        "saved_learning_units": [],
        "favorite_learning_paths": [],
        "favorite_modules": [],
        "favorite_learning_units": [],
        "completed_learning_paths": [],
        "completed_modules": [],
        "completed_learning_units": [],
        "current_positions": [],
    }


class FakeUserProgressService:
    # Fake service za osnovni user progress.
    async def get_progress_by_user_id(self, user_id: str):
        if user_id == "missing_user":
            return None

        return make_progress(user_id)

    async def get_or_create_progress(self, user_id: str):
        return make_progress(user_id)


class FakeSavedContentService:
    # Fake service za save/remove save akcije.
    async def save_content(self, user_id: str, content_id: str, content_type: str):
        progress = make_progress(user_id)
        progress["saved_learning_units"] = [content_id]
        return progress

    async def remove_saved_content(self, user_id: str, content_id: str, content_type: str):
        return make_progress(user_id)


class FakeFavoriteContentService:
    # Fake service za favorite/remove favorite akcije.
    async def favorite_content(self, user_id: str, content_id: str, content_type: str):
        progress = make_progress(user_id)
        progress["favorite_learning_units"] = [content_id]
        return progress

    async def remove_favorite_content(self, user_id: str, content_id: str, content_type: str):
        return make_progress(user_id)


class FakeCompletedContentService:
    # Fake service za complete/remove complete akcije.
    async def complete_content(self, user_id: str, content_id: str, content_type: str):
        progress = make_progress(user_id)
        progress["completed_learning_units"] = [content_id]
        return progress

    async def remove_completed_content(self, user_id: str, content_id: str, content_type: str):
        return make_progress(user_id)


class FakeCurrentPositionService:
    # Fake service za trenutno pozicijo uporabnika.
    async def update_current_position(
        self,
        user_id: str,
        learning_path_id: str,
        current_module_id: str | None,
        current_learning_unit_id: str | None,
    ):
        progress = make_progress(user_id)
        progress["current_positions"] = [
            {
                "learning_path_id": learning_path_id,
                "current_module_id": current_module_id,
                "current_learning_unit_id": current_learning_unit_id,
            }
        ]
        return progress


class FakeContentValidationService:
    # Fake validation service potrdi vse actione.
    async def validate_content_action(
        self,
        user_id: str,
        content_type: str,
        content_id: str,
    ):
        return None

    async def validate_current_position(
        self,
        user_id: str,
        learning_path_id: str,
        current_module_id: str | None,
        current_learning_unit_id: str | None,
    ):
        return None


async def override_authenticated_user_id():
    # Simuliramo lokalni user_id prijavljenega uporabnika.
    return "user_001"


async def override_different_authenticated_user_id():
    # Simuliramo drugega prijavljenega uporabnika.
    return "another_user"


def override_user_progress_service():
    return FakeUserProgressService()


def override_saved_content_service():
    return FakeSavedContentService()


def override_favorite_content_service():
    return FakeFavoriteContentService()


def override_completed_content_service():
    return FakeCompletedContentService()


def override_current_position_service():
    return FakeCurrentPositionService()


def override_content_validation_service():
    return FakeContentValidationService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake dependency-je za user progress.
    app.dependency_overrides[get_authenticated_local_user_id] = override_authenticated_user_id
    app.dependency_overrides[get_user_progress_service] = override_user_progress_service
    app.dependency_overrides[get_saved_content_service] = override_saved_content_service
    app.dependency_overrides[get_favorite_content_service] = override_favorite_content_service
    app.dependency_overrides[get_completed_content_service] = override_completed_content_service
    app.dependency_overrides[get_current_position_service] = override_current_position_service
    app.dependency_overrides[get_content_validation_service] = override_content_validation_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_user_progress_returns_progress():
    # Prijavljen uporabnik lahko pridobi svoj user progress.
    response = client.get("/api/user-progress/user_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "progress_user_001"
    assert data["user_id"] == "user_001"


def test_get_user_progress_returns_403_for_other_user():
    # Uporabnik ne sme brati napredka drugega uporabnika.
    app.dependency_overrides[get_authenticated_local_user_id] = override_different_authenticated_user_id

    response = client.get("/api/user-progress/user_001")

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Nimate dovoljenja za dostop do tega napredka."


def test_get_user_progress_returns_404_when_missing():
    # Če progress ne obstaja, endpoint vrne 404.
    app.dependency_overrides[get_authenticated_local_user_id] = lambda: "missing_user"

    response = client.get("/api/user-progress/missing_user")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Napredek uporabnika ni najden."


def test_ensure_user_progress_returns_progress():
    # Endpoint vrne obstoječ ali ustvari nov user progress.
    response = client.post("/api/user-progress/user_001/ensure")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "progress_user_001"
    assert data["user_id"] == "user_001"


def test_ensure_user_progress_returns_403_for_other_user():
    # Uporabnik ne sme ustvariti ali pridobiti napredka za drugega uporabnika.
    app.dependency_overrides[get_authenticated_local_user_id] = override_different_authenticated_user_id

    response = client.post("/api/user-progress/user_001/ensure")

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Nimate dovoljenja za urejanje tega napredka."


def test_save_content_returns_updated_progress():
    # Endpoint shrani vsebino prijavljenemu uporabniku.
    response = client.post(
        "/api/user-progress/save",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["saved_learning_units"] == ["ue_001"]


def test_remove_saved_content_returns_updated_progress():
    # Endpoint odstrani shranjeno vsebino.
    response = client.request(
        "DELETE",
        "/api/user-progress/save",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["saved_learning_units"] == []


def test_favorite_content_returns_updated_progress():
    # Endpoint označi vsebino kot priljubljeno.
    response = client.post(
        "/api/user-progress/favorite",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["favorite_learning_units"] == ["ue_001"]


def test_remove_favorite_content_returns_updated_progress():
    # Endpoint odstrani vsebino iz priljubljenih.
    response = client.request(
        "DELETE",
        "/api/user-progress/favorite",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["favorite_learning_units"] == []


def test_complete_content_returns_updated_progress():
    # Endpoint označi vsebino kot dokončano.
    response = client.post(
        "/api/user-progress/complete",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["completed_learning_units"] == ["ue_001"]


def test_remove_completed_content_returns_updated_progress():
    # Endpoint odstrani vsebino iz dokončanih.
    response = client.request(
        "DELETE",
        "/api/user-progress/complete",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["completed_learning_units"] == []


def test_update_current_position_returns_updated_progress():
    # Endpoint posodobi trenutno pozicijo uporabnika.
    response = client.put(
        "/api/user-progress/current-position",
        json={
            "learning_path_id": "up_001",
            "current_module_id": "mod_001",
            "current_learning_unit_id": "ue_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["current_positions"][0]["learning_path_id"] == "up_001"
    assert data["current_positions"][0]["current_module_id"] == "mod_001"
    assert data["current_positions"][0]["current_learning_unit_id"] == "ue_001"