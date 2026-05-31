from fastapi.testclient import TestClient

from app.api.questionnaires import get_questionnaire_service
from app.main import app
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class FakeQuestionnaireService:
    # Fake service uporabimo, da API test preverja endpoint, ne questionnaire service logike.
    async def generate_questionnaire(self, target_type, target_id: str):
        if target_id == "missing_id":
            return None

        return {
            "target_type": target_type,
            "target_id": target_id,
            "title": "Testni vprašalnik",
            "questions": [
                {
                    "id": "q_001",
                    "question": "Razumem osnovne pojme.",
                    "type": "yes_no",
                    "learning_unit_id": "ue_001",
                    "related_topic": "Osnovni pojmi",
                }
            ],
        }


def override_questionnaire_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake service.
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom zamenjamo pravi QuestionnaireService s fake service-om.
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_questionnaire_returns_questionnaire():
    # Preverimo uspešen primer za generiranje vprašalnika.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": QuestionnaireTargetType.LEARNING_UNIT.value,
            "target_id": "ue_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["title"] == "Testni vprašalnik"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["id"] == "q_001"


def test_get_questionnaire_returns_404_when_missing():
    # Če service ne najde vprašalnika, endpoint vrne 404.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": QuestionnaireTargetType.LEARNING_UNIT.value,
            "target_id": "missing_id",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."


def test_get_questionnaire_requires_target_type():
    # Endpoint mora vrniti 422, če target_type manjka.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_id": "ue_001",
        },
    )

    assert response.status_code == 422


def test_get_questionnaire_requires_target_id():
    # Endpoint mora vrniti 422, če target_id manjka.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": QuestionnaireTargetType.LEARNING_UNIT.value,
        },
    )

    assert response.status_code == 422