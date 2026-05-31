from fastapi.testclient import TestClient

from app.api.modules import (
    get_module_service,
    get_questionnaire_service,
)
from app.main import app


class FakeModuleService:
    # Fake service uporabimo, da API test preverja endpoint, ne service logike.
    async def get_all_modules(self):
        return [
            {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
                "short_description": "Modul o osnovnih pojmih umetne inteligence.",
                "duration_hours": 1.75,
                "keywords": ["umetna inteligenca", "UI"],
                "domains": ["Umetna inteligenca"],
                "learning_units": [
                    {
                        "learning_unit_id": "ue_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    }
                ],
            }
        ]

    async def get_module_by_id(self, module_id: str):
        if module_id == "missing_id":
            return None

        return {
            "_id": module_id,
            "title": "Razumevanje umetne inteligence",
            "short_description": "Modul o osnovnih pojmih umetne inteligence.",
            "duration_hours": 1.75,
            "keywords": ["umetna inteligenca", "UI"],
            "domains": ["Umetna inteligenca"],
            "learning_units": [
                {
                    "learning_unit_id": "ue_001",
                    "order": 1,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                }
            ],
        }

    async def get_module_detail(self, module_id: str):
        if module_id == "missing_id":
            return None

        return {
            "_id": module_id,
            "title": "Razumevanje umetne inteligence",
            "short_description": "Modul o osnovnih pojmih umetne inteligence.",
            "learning_unit_details": [
                {
                    "_id": "ue_001",
                    "title": "Kaj je umetna inteligenca?",
                    "short_description": "Uvod v osnovne pojme.",
                }
            ],
        }

    async def get_learning_unit_references_for_module(self, module_id: str):
        if module_id == "missing_id":
            return []

        return [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            },
            {
                "learning_unit_id": "ue_002",
                "order": 2,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": ["ue_001"],
            },
        ]

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: list[str],
    ):
        if module_id == "missing_id":
            return []

        available = [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ]

        if "ue_001" in completed_learning_unit_ids:
            available.append(
                {
                    "learning_unit_id": "ue_002",
                    "order": 2,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": ["ue_001"],
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
            "title": "Vprašalnik za modul",
            "questions": [
                {
                    "id": "q_001",
                    "question": "Razumem vsebino modula.",
                    "type": "yes_no",
                    "learning_unit_id": "ue_001",
                    "related_topic": "Osnovni pojmi",
                }
            ],
        }


def override_module_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake module service.
    return FakeModuleService()


def override_questionnaire_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake questionnaire service.
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake service odvisnosti.
    app.dependency_overrides[get_module_service] = override_module_service
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_modules_returns_list():
    # Preverimo, da endpoint vrne seznam modulov.
    response = client.get("/api/modules")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["_id"] == "mod_001"
    assert data[0]["title"] == "Razumevanje umetne inteligence"


def test_get_module_by_id_returns_module():
    # Preverimo, da endpoint vrne modul po ID.
    response = client.get("/api/modules/mod_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "mod_001"
    assert data["title"] == "Razumevanje umetne inteligence"


def test_get_module_by_id_returns_404_when_missing():
    # Če modul ne obstaja, endpoint vrne 404.
    response = client.get("/api/modules/missing_id")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Modul ni najden."


def test_get_module_detail_returns_detail():
    # Detail endpoint vrne modul z dodatnimi podatki.
    response = client.get("/api/modules/mod_001/detail")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "mod_001"
    assert data["title"] == "Razumevanje umetne inteligence"
    assert len(data["learning_unit_details"]) == 1


def test_get_module_detail_returns_404_when_missing():
    # Če modul za detail ne obstaja, endpoint vrne 404.
    response = client.get("/api/modules/missing_id/detail")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Modul ni najden."


def test_get_module_learning_units_returns_references():
    # Endpoint vrne reference učnih enot znotraj modula.
    response = client.get("/api/modules/mod_001/learning-units")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["learning_unit_id"] == "ue_001"
    assert data[1]["learning_unit_id"] == "ue_002"


def test_get_available_learning_units_without_completed_ids():
    # Brez zaključenih predpogojev je dostopna samo prva učna enota.
    response = client.get("/api/modules/mod_001/available-learning-units")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["learning_unit_id"] == "ue_001"


def test_get_available_learning_units_with_completed_ids():
    # Če je ue_001 zaključena, postane dostopna tudi ue_002.
    response = client.get(
        "/api/modules/mod_001/available-learning-units",
        params={
            "completed_learning_unit_ids": ["ue_001"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["learning_unit_id"] == "ue_001"
    assert data[1]["learning_unit_id"] == "ue_002"


def test_get_module_questionnaire_returns_questionnaire():
    # Preverimo vprašalnik za izbran modul.
    response = client.get("/api/modules/mod_001/questionnaire")

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "module"
    assert data["target_id"] == "mod_001"
    assert data["title"] == "Vprašalnik za modul"


def test_get_module_questionnaire_returns_404_when_missing():
    # Če vprašalnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/modules/missing_id/questionnaire")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."