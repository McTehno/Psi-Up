from fastapi.testclient import TestClient

from app.api.assessments import get_assessment_progress_service
from app.main import app
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class FakeAssessmentProgressService:
    # Fake service uporabimo, da API test preverja endpoint in request mapping,
    # ne pa celotne assessment/progress logike.
    async def evaluate_and_update_progress(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        submitted_answers,
    ):
        return {
            "user_id": user_id,
            "target_type": target_type,
            "target_id": target_id,
            "start_module_id": "mod_001"
            if target_type == QuestionnaireTargetType.LEARNING_PATH
            else None,
            "start_learning_unit_id": "ue_001",
            "skipped_modules": [],
            "skipped_learning_units": [],
            "recommended_next_modules": ["mod_001"]
            if target_type == QuestionnaireTargetType.LEARNING_PATH
            else [],
            "recommended_next_learning_units": ["ue_001"],
            "known_competency_codes": ["1.2"],
            "missing_competency_codes": ["5.2"],
            "learning_unit_results": [
                {
                    "learning_unit_id": "ue_001",
                    "known_topic_ids": ["topic_001"],
                    "missing_topic_ids": ["topic_002"],
                    "known_competency_codes": ["1.2"],
                    "missing_competency_codes": ["5.2"],
                    "is_completed_by_assessment": False,
                }
            ],
            "module_results": [
                {
                    "module_id": "mod_001",
                    "status": "partially_completed",
                    "completed_learning_units": [],
                    "missing_learning_units": ["ue_001"],
                }
            ],
            "completed_learning_unit_ids": [],
            "completed_module_ids": [],
            "completed_learning_path_ids": [],
            "current_position": {
                "learning_path_id": target_id
                if target_type == QuestionnaireTargetType.LEARNING_PATH
                else None,
                "current_module_id": "mod_001"
                if target_type != QuestionnaireTargetType.LEARNING_UNIT
                else None,
                "current_learning_unit_id": "ue_001",
            },
            "summary": "Uporabniku priporočamo učno enoto ue_001.",
        }


def override_assessment_progress_service():
    return FakeAssessmentProgressService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake AssessmentProgressService.
    app.dependency_overrides[get_assessment_progress_service] = (
        override_assessment_progress_service
    )


def teardown_function():
    # Po vsakem testu počistimo dependency override.
    app.dependency_overrides.clear()


def test_evaluate_questionnaire_answers_for_learning_path_returns_assessment_result():
    # Endpoint oceni odgovore za učno pot.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "learning_path",
            "target_id": "lp_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "question": "Razumem osnovne pojme.",
                    "type": "yes_no",
                    "answer": True,
                    "learning_path_id": "lp_001",
                    "module_id": "mod_001",
                    "learning_unit_id": "ue_001",
                    "topic_id": "topic_001",
                    "competency_codes": ["1.2"],
                },
                {
                    "question_id": "q_002",
                    "question": "Poznam primere uporabe.",
                    "type": "yes_no",
                    "answer": False,
                    "learning_path_id": "lp_001",
                    "module_id": "mod_001",
                    "learning_unit_id": "ue_001",
                    "topic_id": "topic_002",
                    "competency_codes": ["5.2"],
                },
            ],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["target_type"] == "learning_path"
    assert data["target_id"] == "lp_001"
    assert data["start_module_id"] == "mod_001"
    assert data["start_learning_unit_id"] == "ue_001"
    assert data["recommended_next_modules"] == ["mod_001"]
    assert data["recommended_next_learning_units"] == ["ue_001"]
    assert data["known_competency_codes"] == ["1.2"]
    assert data["missing_competency_codes"] == ["5.2"]
    assert data["current_position"]["learning_path_id"] == "lp_001"


def test_evaluate_questionnaire_answers_for_module_returns_assessment_result():
    # Endpoint oceni odgovore za modul.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "module",
            "target_id": "mod_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "question": "Razumem vsebino modula.",
                    "answer": False,
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
    assert data["target_type"] == "module"
    assert data["target_id"] == "mod_001"
    assert data["start_module_id"] is None
    assert data["start_learning_unit_id"] == "ue_001"
    assert data["module_results"][0]["module_id"] == "mod_001"
    assert data["module_results"][0]["status"] == "partially_completed"
    assert data["current_position"]["current_module_id"] == "mod_001"


def test_evaluate_questionnaire_answers_for_learning_unit_returns_assessment_result():
    # Endpoint oceni odgovore za učno enoto.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "learning_unit",
            "target_id": "ue_001",
            "answers": [
                {
                    "question_id": "q_001",
                    "question": "Razumem vsebino učne enote.",
                    "answer": False,
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
    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["start_module_id"] is None
    assert data["start_learning_unit_id"] == "ue_001"
    assert data["recommended_next_modules"] == []
    assert data["recommended_next_learning_units"] == ["ue_001"]
    assert data["current_position"]["current_module_id"] is None
    assert data["current_position"]["current_learning_unit_id"] == "ue_001"


def test_evaluate_questionnaire_answers_accepts_empty_answers():
    # Endpoint sprejme tudi prazen seznam odgovorov.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "module",
            "target_id": "mod_001",
            "answers": [],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["target_type"] == "module"
    assert data["target_id"] == "mod_001"


def test_evaluate_questionnaire_answers_uses_default_empty_answers():
    # Če answers niso poslani, QuestionnaireSubmitRequest uporabi prazen seznam.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "module",
            "target_id": "mod_001",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == "user_001"
    assert data["target_type"] == "module"
    assert data["target_id"] == "mod_001"


def test_evaluate_questionnaire_answers_returns_422_for_invalid_target_type():
    # Pydantic/FastAPI zavrne neveljaven target_type.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "invalid_target",
            "target_id": "target_001",
            "answers": [],
        },
    )

    assert response.status_code == 422


def test_evaluate_questionnaire_answers_returns_422_when_user_id_missing():
    # user_id je obvezen.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "target_type": "module",
            "target_id": "mod_001",
            "answers": [],
        },
    )

    assert response.status_code == 422


def test_evaluate_questionnaire_answers_returns_422_when_target_type_missing():
    # target_type je obvezen.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_id": "mod_001",
            "answers": [],
        },
    )

    assert response.status_code == 422


def test_evaluate_questionnaire_answers_returns_422_when_target_id_missing():
    # target_id je obvezen.
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": "user_001",
            "target_type": "module",
            "answers": [],
        },
    )

    assert response.status_code == 422