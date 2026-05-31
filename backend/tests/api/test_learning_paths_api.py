from fastapi.testclient import TestClient

from app.api.learning_paths import (
    get_learning_path_service,
    get_questionnaire_service,
)
from app.main import app


class FakeLearningPathService:
    # Fake service uporabimo, da API test preverja endpoint, ne service logike.
    async def get_all_learning_paths(self):
        return [
            {
                "_id": "up_001",
                "title": "Iskanje informacij z umetno inteligenco",
                "short_description": "Učna pot za uporabo umetne inteligence.",
                "duration_hours": 4.25,
                "keywords": ["umetna inteligenca", "iskanje"],
                "modules": [
                    {
                        "module_id": "mod_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    }
                ],
            }
        ]

    async def get_learning_path_by_id(self, learning_path_id: str):
        if learning_path_id == "missing_id":
            return None

        return {
            "_id": learning_path_id,
            "title": "Iskanje informacij z umetno inteligenco",
            "short_description": "Učna pot za uporabo umetne inteligence.",
            "duration_hours": 4.25,
            "keywords": ["umetna inteligenca", "iskanje"],
            "modules": [
                {
                    "module_id": "mod_001",
                    "order": 1,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                }
            ],
        }

    async def get_learning_path_detail(self, learning_path_id: str):
        if learning_path_id == "missing_id":
            return None

        return {
            "_id": learning_path_id,
            "title": "Iskanje informacij z umetno inteligenco",
            "short_description": "Učna pot za uporabo umetne inteligence.",
            "module_details": [
                {
                    "_id": "mod_001",
                    "title": "Razumevanje umetne inteligence",
                    "short_description": "Modul o osnovah UI.",
                }
            ],
        }

    async def get_module_references_for_learning_path(self, learning_path_id: str):
        if learning_path_id == "missing_id":
            return []

        return [
            {
                "module_id": "mod_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            },
            {
                "module_id": "mod_002",
                "order": 2,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": ["mod_001"],
            },
        ]

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: list[str],
    ):
        if learning_path_id == "missing_id":
            return []

        available = [
            {
                "module_id": "mod_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ]

        if "mod_001" in completed_module_ids:
            available.append(
                {
                    "module_id": "mod_002",
                    "order": 2,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": ["mod_001"],
                }
            )

        return available


class FakeQuestionnaireService:
    # Fake questionnaire service uporabimo za endpoint /questionnaire.
    async def generate_questionnaire(self, target_type, target_id: str):
        if target_id == "missing_id":
            return None

        return {
            "target_type": target_type,
            "target_id": target_id,
            "title": "Vprašalnik za učno pot",
            "questions": [
                {
                    "id": "q_001",
                    "question": "Razumem vsebino učne poti.",
                    "type": "yes_no",
                    "learning_unit_id": "ue_001",
                    "related_topic": "Osnovni pojmi",
                }
            ],
        }


def override_learning_path_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake learning path service.
    return FakeLearningPathService()


def override_questionnaire_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake questionnaire service.
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake service odvisnosti.
    app.dependency_overrides[get_learning_path_service] = override_learning_path_service
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_learning_paths_returns_list():
    # Preverimo, da endpoint vrne seznam učnih poti.
    response = client.get("/api/learning-paths")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["_id"] == "up_001"
    assert data[0]["title"] == "Iskanje informacij z umetno inteligenco"


def test_get_learning_path_by_id_returns_path():
    # Preverimo, da endpoint vrne učno pot po ID.
    response = client.get("/api/learning-paths/up_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "up_001"
    assert data["title"] == "Iskanje informacij z umetno inteligenco"


def test_get_learning_path_by_id_returns_404_when_missing():
    # Če učna pot ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-paths/missing_id")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna pot ni najdena."


def test_get_learning_path_detail_returns_detail():
    # Detail endpoint vrne učno pot z dodatnimi podatki.
    response = client.get("/api/learning-paths/up_001/detail")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "up_001"
    assert data["title"] == "Iskanje informacij z umetno inteligenco"
    assert len(data["module_details"]) == 1


def test_get_learning_path_detail_returns_404_when_missing():
    # Če učna pot za detail ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-paths/missing_id/detail")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna pot ni najdena."


def test_get_learning_path_modules_returns_references():
    # Endpoint vrne reference modulov znotraj učne poti.
    response = client.get("/api/learning-paths/up_001/modules")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["module_id"] == "mod_001"
    assert data[1]["module_id"] == "mod_002"


def test_get_available_modules_without_completed_ids():
    # Brez zaključenih predpogojev je dostopen samo prvi modul.
    response = client.get("/api/learning-paths/up_001/available-modules")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["module_id"] == "mod_001"


def test_get_available_modules_with_completed_ids():
    # Če je mod_001 zaključen, postane dostopen tudi mod_002.
    response = client.get(
        "/api/learning-paths/up_001/available-modules",
        params={
            "completed_module_ids": ["mod_001"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["module_id"] == "mod_001"
    assert data[1]["module_id"] == "mod_002"


def test_get_learning_path_questionnaire_returns_questionnaire():
    # Preverimo vprašalnik za izbrano učno pot.
    response = client.get("/api/learning-paths/up_001/questionnaire")

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_path"
    assert data["target_id"] == "up_001"
    assert data["title"] == "Vprašalnik za učno pot"


def test_get_learning_path_questionnaire_returns_404_when_missing():
    # Če vprašalnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-paths/missing_id/questionnaire")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."