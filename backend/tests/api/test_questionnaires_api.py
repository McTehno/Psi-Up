from fastapi.testclient import TestClient

from app.api.questionnaires import get_questionnaire_service
from app.main import app
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class FakeQuestionnaireService:
    # Fake service uporabimo, da API test preverja endpoint,
    # ne pa dejanske logike zbiranja vprašanj.
    async def generate_questionnaire(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str,
        latest_explicit_answers=None,
    ):
        if target_id == "missing_id":
            return None

        return {
            "target_type": target_type,
            "target_id": target_id,
            "title": "Testni vprašalnik",
            "questions": [
                {
                    "id": "q_001",
                    "question": "Razumem vsebino.",
                    "type": "yes_no",
                    "answer": None,
                    "is_prefilled": False,
                    "prefill_source": None,
                    "learning_path_id": (
                        target_id
                        if target_type == QuestionnaireTargetType.LEARNING_PATH
                        else None
                    ),
                    "module_id": (
                        target_id
                        if target_type == QuestionnaireTargetType.MODULE
                        else "mod_001"
                    ),
                    "learning_unit_id": (
                        target_id
                        if target_type == QuestionnaireTargetType.LEARNING_UNIT
                        else "ue_001"
                    ),
                    "related_topic": "Testna tema",
                    "related_topic_id": "topic_001",
                    "related_competency_codes": ["1.2"],
                    "sources": [
                        {
                            "learning_path_id": (
                                target_id
                                if target_type == QuestionnaireTargetType.LEARNING_PATH
                                else None
                            ),
                            "module_id": (
                                target_id
                                if target_type == QuestionnaireTargetType.MODULE
                                else "mod_001"
                            ),
                            "learning_unit_id": (
                                target_id
                                if target_type == QuestionnaireTargetType.LEARNING_UNIT
                                else "ue_001"
                            ),
                            "topic_id": "topic_001",
                            "related_topic": "Testna tema",
                            "competency_codes": ["1.2"],
                        }
                    ],
                }
            ],
        }


def override_questionnaire_service():
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake QuestionnaireService.
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_questionnaire_for_learning_path_returns_questionnaire():
    # Endpoint vrne vprašalnik za učno pot.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "learning_path",
            "target_id": "lp_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_path"
    assert data["target_id"] == "lp_001"
    assert data["title"] == "Testni vprašalnik"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["id"] == "q_001"
    assert data["questions"][0]["learning_path_id"] == "lp_001"
    assert data["questions"][0]["answer"] is None
    assert data["questions"][0]["is_prefilled"] is False
    assert data["questions"][0]["prefill_source"] is None


def test_get_questionnaire_for_module_returns_questionnaire():
    # Endpoint vrne vprašalnik za modul.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "module",
            "target_id": "mod_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "module"
    assert data["target_id"] == "mod_001"
    assert data["title"] == "Testni vprašalnik"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["module_id"] == "mod_001"
    assert data["questions"][0]["answer"] is None
    assert data["questions"][0]["is_prefilled"] is False
    assert data["questions"][0]["prefill_source"] is None


def test_get_questionnaire_for_learning_unit_returns_questionnaire():
    # Endpoint vrne vprašalnik za učno enoto.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "learning_unit",
            "target_id": "ue_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["title"] == "Testni vprašalnik"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["learning_unit_id"] == "ue_001"
    assert data["questions"][0]["answer"] is None
    assert data["questions"][0]["is_prefilled"] is False
    assert data["questions"][0]["prefill_source"] is None


def test_get_questionnaire_returns_sources():
    # Vprašanje vsebuje sources, da backend ve, od kod vprašanje izvira.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "module",
            "target_id": "mod_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    source = data["questions"][0]["sources"][0]

    assert source["module_id"] == "mod_001"
    assert source["learning_unit_id"] == "ue_001"
    assert source["topic_id"] == "topic_001"
    assert source["related_topic"] == "Testna tema"
    assert source["competency_codes"] == ["1.2"]


def test_get_questionnaire_returns_404_when_missing():
    # Če service ne najde vprašalnika, endpoint vrne 404.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "module",
            "target_id": "missing_id",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."


def test_get_questionnaire_returns_422_for_invalid_target_type():
    # Pydantic/FastAPI zavrne neveljaven target_type.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "invalid_target",
            "target_id": "target_001",
        },
    )

    assert response.status_code == 422


def test_get_questionnaire_returns_422_when_target_type_missing():
    # target_type je obvezen query parameter.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_id": "mod_001",
        },
    )

    assert response.status_code == 422


def test_get_questionnaire_returns_422_when_target_id_missing():
    # target_id je obvezen query parameter.
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": "module",
        },
    )

    assert response.status_code == 422