from fastapi.testclient import TestClient

from app.api.assessments import get_assessment_service
from app.main import app


class FakeAssessmentService:
    # Fake service uporabimo, da API test preverja endpoint in request/response obliko.
    def __init__(self):
        self.last_call = None

    async def evaluate_answers(self, user_id, target_type, target_id, answers):
        self.last_call = {
            "user_id": user_id,
            "target_type": target_type,
            "target_id": target_id,
            "answers": answers,
        }

        return {
            "user_id": user_id,
            "target_type": target_type,
            "target_id": target_id,
            "start_module_id": "mod_001",
            "start_learning_unit_id": "ue_001",
            "skipped_modules": [],
            "skipped_learning_units": [],
            "recommended_next_modules": ["mod_001"],
            "recommended_next_learning_units": ["ue_001"],
            "learning_unit_results": [],
            "module_results": [],
            "summary": "Priporočamo začetek pri prvi učni enoti.",
        }


fake_assessment_service = FakeAssessmentService()


def override_assessment_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake service.
    return fake_assessment_service


client = TestClient(app)


def setup_function():
    # Pred vsakim testom zamenjamo pravi AssessmentService s fake service-om.
    app.dependency_overrides[get_assessment_service] = override_assessment_service
    fake_assessment_service.last_call = None


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_evaluate_assessment_returns_result():
    # Preverimo uspešen assessment flow prek API endpointa.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "learning_unit",
            "target_id": "ue_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "learning_unit_id": "ue_001",
                    "answer": False,
                }
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["start_module_id"] == "mod_001"
    assert data["start_learning_unit_id"] == "ue_001"
    assert data["recommended_next_modules"] == ["mod_001"]
    assert data["recommended_next_learning_units"] == ["ue_001"]


def test_evaluate_assessment_passes_answers_to_service():
    # Preverimo, da endpoint pravilno preda odgovore v service sloj.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "learning_unit",
            "target_id": "ue_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "learning_unit_id": "ue_001",
                    "answer": True,
                }
            ],
        },
    )

    assert response.status_code == 200
    assert fake_assessment_service.last_call is not None
    assert fake_assessment_service.last_call["user_id"] == "user_001"
    assert fake_assessment_service.last_call["target_type"] == "learning_unit"
    assert fake_assessment_service.last_call["target_id"] == "ue_001"
    assert fake_assessment_service.last_call["answers"][0]["question_id"] == "q_001"
    assert fake_assessment_service.last_call["answers"][0]["answer"] is True


def test_evaluate_assessment_requires_body():
    # Endpoint mora vrniti 422, če request body manjka.
    response = client.post("/api/assessments/evaluate")

    assert response.status_code == 422


def test_evaluate_assessment_rejects_invalid_target_type():
    # Pydantic mora zavrniti nepodprt target_type.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "invalid_type",
            "target_id": "ue_001",
            "answers": [],
        },
    )

    assert response.status_code == 422