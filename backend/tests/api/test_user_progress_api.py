from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.api.user_progress import (
    get_authenticated_local_user_id,
    get_completed_content_service,
    get_content_validation_service,
    get_current_position_service,
    get_favorite_content_service,
    get_questionnaire_answers_service,
    get_saved_content_service,
    get_user_progress_service,
)
from app.main import app


def build_progress_response(user_id="user_001"):
    # Osnovni progress response v novi embedded users.progress strukturi.
    return {
        "_id": f"progress_{user_id}",
        "user_id": user_id,
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


class FakeUserProgressService:
    # Fake service za osnovni progress.
    async def get_progress_by_user_id(self, user_id: str):
        if user_id == "missing_user":
            return None

        return build_progress_response(user_id)

    async def get_or_create_progress(self, user_id: str):
        return build_progress_response(user_id)


class FakeSavedContentService:
    # Fake service za saved vsebine.
    async def save_content(self, user_id: str, content_id: str, content_type: str):
        progress = build_progress_response(user_id)

        if content_type == "learning_path":
            progress["saved"]["learning_path_ids"].append(content_id)

        if content_type == "module":
            progress["saved"]["module_ids"].append(content_id)

        if content_type == "learning_unit":
            progress["saved"]["learning_unit_ids"].append(content_id)

        return progress

    async def remove_saved_content(self, user_id: str, content_id: str, content_type: str):
        return build_progress_response(user_id)


class FakeFavoriteContentService:
    # Fake service za favorites vsebine.
    async def favorite_content(self, user_id: str, content_id: str, content_type: str):
        progress = build_progress_response(user_id)

        if content_type == "learning_path":
            progress["favorites"]["learning_path_ids"].append(content_id)

        if content_type == "module":
            progress["favorites"]["module_ids"].append(content_id)

        if content_type == "learning_unit":
            progress["favorites"]["learning_unit_ids"].append(content_id)

        return progress

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ):
        return build_progress_response(user_id)


class FakeCompletedContentService:
    # Fake service za completed vsebine.
    async def complete_content(self, user_id: str, content_id: str, content_type: str):
        progress = build_progress_response(user_id)

        if content_type == "learning_path":
            progress["completed"]["learning_path_ids"].append(content_id)

        if content_type == "module":
            progress["completed"]["module_ids"].append(content_id)

        if content_type == "learning_unit":
            progress["completed"]["learning_unit_ids"].append(content_id)

        return progress

    async def remove_completed_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ):
        return build_progress_response(user_id)


class FakeCurrentPositionService:
    # Fake service za trenutno pozicijo.
    async def update_current_position(
        self,
        user_id: str,
        learning_path_id: str,
        current_module_id: str | None = None,
        current_learning_unit_id: str | None = None,
    ):
        progress = build_progress_response(user_id)

        progress["current_positions"] = [
            {
                "learning_path_id": learning_path_id,
                "current_module_id": current_module_id,
                "current_learning_unit_id": current_learning_unit_id,
                "updated_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
            }
        ]

        return progress


class FakeQuestionnaireAnswersService:
    # Fake service za shranjevanje odgovorov vprašalnika.
    async def save_questionnaire_answers(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        answers: list,
    ):
        progress = build_progress_response(user_id)

        progress["questionnaire_answers"] = [
            {
                "target_type": target_type,
                "target_id": target_id,
                "last_submitted_at": datetime(2026, 6, 1, tzinfo=timezone.utc),
                "answers": answers,
            }
        ]

        return progress


class FakeContentValidationService:
    # Fake validation service ne blokira veljavnih testnih zahtevkov.
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
        current_module_id: str | None = None,
        current_learning_unit_id: str | None = None,
    ):
        return None


def override_authenticated_local_user_id():
    # Simuliramo prijavljenega uporabnika, mapiranega na lokalni user_id.
    return "user_001"


def override_other_authenticated_local_user_id():
    # Simuliramo drugega uporabnika za 403 teste.
    return "other_user"


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


def override_questionnaire_answers_service():
    return FakeQuestionnaireAnswersService()


def override_content_validation_service():
    return FakeContentValidationService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo vse dependency override-e.
    app.dependency_overrides[get_authenticated_local_user_id] = (
        override_authenticated_local_user_id
    )
    app.dependency_overrides[get_user_progress_service] = override_user_progress_service
    app.dependency_overrides[get_saved_content_service] = override_saved_content_service
    app.dependency_overrides[get_favorite_content_service] = (
        override_favorite_content_service
    )
    app.dependency_overrides[get_completed_content_service] = (
        override_completed_content_service
    )
    app.dependency_overrides[get_current_position_service] = (
        override_current_position_service
    )
    app.dependency_overrides[get_questionnaire_answers_service] = (
        override_questionnaire_answers_service
    )
    app.dependency_overrides[get_content_validation_service] = (
        override_content_validation_service
    )


def teardown_function():
    # Po vsakem testu počistimo override-e.
    app.dependency_overrides.clear()


def test_get_user_progress_returns_progress():
    # Prijavljen uporabnik lahko pridobi svoj progress.
    response = client.get("/api/user-progress/user_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "progress_user_001"
    assert data["user_id"] == "user_001"
    assert data["saved"]["module_ids"] == []
    assert data["favorites"]["learning_path_ids"] == []
    assert data["completed"]["learning_unit_ids"] == []


def test_get_user_progress_returns_403_for_other_user():
    # Uporabnik ne sme brati tujega progressa.
    app.dependency_overrides[get_authenticated_local_user_id] = (
        override_other_authenticated_local_user_id
    )

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


def test_get_or_create_user_progress_returns_progress():
    # Endpoint /ensure vrne obstoječ ali novo ustvarjen progress.
    response = client.post("/api/user-progress/user_001/ensure")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "progress_user_001"
    assert data["user_id"] == "user_001"


def test_get_or_create_user_progress_returns_403_for_other_user():
    # Uporabnik ne sme ustvariti ali pridobiti tujega progressa.
    app.dependency_overrides[get_authenticated_local_user_id] = (
        override_other_authenticated_local_user_id
    )

    response = client.post("/api/user-progress/user_001/ensure")

    assert response.status_code == 403

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "FORBIDDEN"
    assert data["error"]["message"] == "Nimate dovoljenja za urejanje tega napredka."


def test_save_content_adds_module_to_saved():
    # Shrani modul v saved.module_ids.
    response = client.post(
        "/api/user-progress/save",
        json={
            "content_id": "mod_001",
            "content_type": "module",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["saved"]["module_ids"] == ["mod_001"]


def test_remove_saved_content_returns_progress():
    # Odstrani shranjeno vsebino.
    response = client.request(
        "DELETE",
        "/api/user-progress/save",
        json={
            "content_id": "mod_001",
            "content_type": "module",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["saved"]["module_ids"] == []


def test_favorite_content_adds_learning_unit_to_favorites():
    # Označi učno enoto kot priljubljeno.
    response = client.post(
        "/api/user-progress/favorite",
        json={
            "content_id": "ue_001",
            "content_type": "learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["favorites"]["learning_unit_ids"] == ["ue_001"]


def test_remove_favorite_content_returns_progress():
    # Odstrani vsebino iz priljubljenih.
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

    assert data["favorites"]["learning_unit_ids"] == []


def test_complete_content_adds_learning_path_to_completed():
    # Označi učno pot kot dokončano.
    response = client.post(
        "/api/user-progress/complete",
        json={
            "content_id": "lp_001",
            "content_type": "learning_path",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["completed"]["learning_path_ids"] == ["lp_001"]


def test_remove_completed_content_returns_progress():
    # Odstrani vsebino iz dokončanih.
    response = client.request(
        "DELETE",
        "/api/user-progress/complete",
        json={
            "content_id": "lp_001",
            "content_type": "learning_path",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["completed"]["learning_path_ids"] == []


def test_save_content_rejects_invalid_content_type():
    # SaveContentRequest zavrne neveljaven content_type.
    response = client.post(
        "/api/user-progress/save",
        json={
            "content_id": "mod_001",
            "content_type": "invalid_type",
        },
    )

    assert response.status_code == 422


def test_update_current_position_returns_updated_progress():
    # Posodobi trenutno pozicijo uporabnika.
    response = client.put(
        "/api/user-progress/current-position",
        json={
            "learning_path_id": "lp_001",
            "current_module_id": "mod_001",
            "current_learning_unit_id": "ue_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert len(data["current_positions"]) == 1
    assert data["current_positions"][0]["learning_path_id"] == "lp_001"
    assert data["current_positions"][0]["current_module_id"] == "mod_001"
    assert data["current_positions"][0]["current_learning_unit_id"] == "ue_001"


def test_save_questionnaire_answers_returns_updated_progress():
    # Shrani odgovore vprašalnika v questionnaire_answers.
    response = client.post(
        "/api/user-progress/questionnaire-answers",
        json={
            "target_type": "module",
            "target_id": "mod_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "question": "Razumem vsebino.",
                    "type": "yes_no",
                    "answer": True,
                    "was_answered": True,
                    "module_id": "mod_001",
                    "learning_unit_id": "ue_001",
                    "topic_id": "topic_001",
                    "competency_codes": ["1.2"],
                }
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert len(data["questionnaire_answers"]) == 1
    assert data["questionnaire_answers"][0]["target_type"] == "module"
    assert data["questionnaire_answers"][0]["target_id"] == "mod_001"
    assert data["questionnaire_answers"][0]["answers"][0]["question_id"] == "q_001"
    assert data["questionnaire_answers"][0]["answers"][0]["answer"] is True


def test_save_questionnaire_answers_rejects_invalid_target_type():
    # SaveQuestionnaireAnswersRequest zavrne neveljaven target_type.
    response = client.post(
        "/api/user-progress/questionnaire-answers",
        json={
            "target_type": "invalid_target",
            "target_id": "mod_001",
            "answers": [],
        },
    )

    assert response.status_code == 422