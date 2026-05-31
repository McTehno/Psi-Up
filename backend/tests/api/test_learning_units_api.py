from fastapi.testclient import TestClient

from app.api.learning_units import (
    get_learning_unit_service,
    get_questionnaire_service,
)
from app.main import app


class FakeLearningUnitService:
    # Fake service uporabimo, da API test preverja endpoint, ne service logike.
    async def get_all_learning_units(self):
        return [
            {
                "_id": "ue_001",
                "title": "Kaj je umetna inteligenca?",
                "short_description": "Uvod v osnovne pojme umetne inteligence.",
                "duration_hours": 0.5,
                "keywords": ["umetna inteligenca", "UI"],
                "content_topics": ["Osnovni pojmi"],
                "acquired_competencies": ["Razumevanje osnov UI"],
                "digcomp_competencies": [],
                "delivery_mode": "Spletno",
                "provider": "NIDiKo",
                "target_audience": "Začetniki",
                "prerequisites": [],
                "knowledge_assessment": "Kratek kviz",
                "certificate": "Potrdilo",
                "self_assessment_questions": [],
            }
        ]

    async def get_learning_unit_by_id(self, learning_unit_id: str):
        if learning_unit_id == "missing_id":
            return None

        return {
            "_id": learning_unit_id,
            "title": "Kaj je umetna inteligenca?",
            "short_description": "Uvod v osnovne pojme umetne inteligence.",
            "duration_hours": 0.5,
            "keywords": ["umetna inteligenca", "UI"],
            "content_topics": ["Osnovni pojmi"],
            "acquired_competencies": ["Razumevanje osnov UI"],
            "digcomp_competencies": [],
            "delivery_mode": "Spletno",
            "provider": "NIDiKo",
            "target_audience": "Začetniki",
            "prerequisites": [],
            "knowledge_assessment": "Kratek kviz",
            "certificate": "Potrdilo",
            "self_assessment_questions": [],
        }

    async def get_learning_unit_detail(self, learning_unit_id: str):
        return await self.get_learning_unit_by_id(learning_unit_id)


class FakeQuestionnaireService:
    # Fake questionnaire service uporabimo za endpoint /questionnaire.
    async def generate_questionnaire(self, target_type, target_id: str):
        if target_id == "missing_id":
            return None

        return {
            "target_type": target_type,
            "target_id": target_id,
            "title": "Vprašalnik za učno enoto",
            "questions": [
                {
                    "id": "q_001",
                    "question": "Razumem osnovne pojme umetne inteligence.",
                    "type": "yes_no",
                    "learning_unit_id": target_id,
                    "related_topic": "Osnovni pojmi",
                }
            ],
        }


def override_learning_unit_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake learning unit service.
    return FakeLearningUnitService()


def override_questionnaire_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake questionnaire service.
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake service odvisnosti.
    app.dependency_overrides[get_learning_unit_service] = override_learning_unit_service
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_learning_units_returns_list():
    # Preverimo, da endpoint vrne seznam učnih enot.
    response = client.get("/api/learning-units")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["_id"] == "ue_001"
    assert data[0]["title"] == "Kaj je umetna inteligenca?"


def test_get_learning_unit_by_id_returns_unit():
    # Preverimo, da endpoint vrne učno enoto po ID.
    response = client.get("/api/learning-units/ue_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "ue_001"
    assert data["title"] == "Kaj je umetna inteligenca?"


def test_get_learning_unit_by_id_returns_404_when_missing():
    # Če učna enota ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna enota ni najdena."


def test_get_learning_unit_detail_returns_unit():
    # Detail endpoint trenutno vrne enako strukturo učne enote.
    response = client.get("/api/learning-units/ue_001/detail")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "ue_001"
    assert data["title"] == "Kaj je umetna inteligenca?"


def test_get_learning_unit_detail_returns_404_when_missing():
    # Če učna enota za detail ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id/detail")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna enota ni najdena."


def test_get_learning_unit_questionnaire_returns_questionnaire():
    # Preverimo vprašalnik za izbrano učno enoto.
    response = client.get("/api/learning-units/ue_001/questionnaire")

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["title"] == "Vprašalnik za učno enoto"
    assert len(data["questions"]) == 1


def test_get_learning_unit_questionnaire_returns_404_when_missing():
    # Če vprašalnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id/questionnaire")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."