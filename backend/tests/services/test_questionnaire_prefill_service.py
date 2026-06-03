import pytest

from app.schemas.questionnaire_schema import QuestionnaireTargetType
from app.services.questionnaires.questionnaire_service import QuestionnaireService


class FakeLearningPathService:
    async def get_learning_path_by_id(self, learning_path_id: str):
        return None

    async def get_self_assessment_questions_for_learning_path(
        self,
        learning_path_id: str,
    ):
        return []


class FakeModuleService:
    async def get_module_by_id(self, module_id: str):
        return {
            "_id": module_id,
            "title": "Razumevanje umetne inteligence",
        }

    async def get_self_assessment_questions_for_module(self, module_id: str):
        return [
            {
                "id": "q_ue_001_001",
                "question": "Razumem osnovni koncept umetne inteligence.",
                "type": "yes_no",
                "module_id": module_id,
                "learning_unit_id": "ue_001",
                "related_topic": "Razumevanje pojma umetna inteligenca",
                "related_topic_id": "topic_ue_001_001",
                "related_competency_codes": ["1.2"],
            },
            {
                "id": "q_ue_002_001",
                "question": "Razumem, zakaj so podatki pomembni pri umetni inteligenci.",
                "type": "yes_no",
                "module_id": module_id,
                "learning_unit_id": "ue_002",
                "related_topic": "Vloga podatkov pri umetni inteligenci",
                "related_topic_id": "topic_ue_002_001",
                "related_competency_codes": ["1.3"],
            },
        ]


class FakeLearningUnitService:
    async def get_learning_unit_by_id(self, learning_unit_id: str):
        return None

    async def get_self_assessment_questions(self, learning_unit_id: str):
        return []


@pytest.mark.asyncio
async def test_generate_questionnaire_prefills_question_by_question_id():
    service = QuestionnaireService(
        learning_path_service=FakeLearningPathService(),
        module_service=FakeModuleService(),
        learning_unit_service=FakeLearningUnitService(),
    )

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        latest_explicit_answers={
            "id:q_ue_001_001": {
                "question_id": "q_ue_001_001",
                "question": "Razumem osnovni koncept umetne inteligence.",
                "answer": False,
                "was_answered": True,
            }
        },
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.MODULE
    assert result["target_id"] == "mod_001"

    first_question = result["questions"][0]
    second_question = result["questions"][1]

    assert first_question["id"] == "q_ue_001_001"
    assert first_question["answer"] is False
    assert first_question["is_prefilled"] is True
    assert first_question["prefill_source"] == "last_answer"

    assert second_question["id"] == "q_ue_002_001"
    assert second_question["answer"] is None
    assert second_question["is_prefilled"] is False
    assert second_question["prefill_source"] is None


@pytest.mark.asyncio
async def test_generate_questionnaire_prefills_question_by_normalized_text():
    service = QuestionnaireService(
        learning_path_service=FakeLearningPathService(),
        module_service=FakeModuleService(),
        learning_unit_service=FakeLearningUnitService(),
    )

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        latest_explicit_answers={
            "question:razumem osnovni koncept umetne inteligence.": {
                "question_id": "different_question_id",
                "question": "Razumem osnovni koncept umetne inteligence.",
                "answer": True,
                "was_answered": True,
            }
        },
    )

    assert result is not None

    first_question = result["questions"][0]

    assert first_question["id"] == "q_ue_001_001"
    assert first_question["answer"] is True
    assert first_question["is_prefilled"] is True
    assert first_question["prefill_source"] == "last_answer"


@pytest.mark.asyncio
async def test_generate_questionnaire_without_prefill_keeps_questions_unanswered():
    service = QuestionnaireService(
        learning_path_service=FakeLearningPathService(),
        module_service=FakeModuleService(),
        learning_unit_service=FakeLearningUnitService(),
    )

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        latest_explicit_answers={},
    )

    assert result is not None

    for question in result["questions"]:
        assert question["answer"] is None
        assert question["is_prefilled"] is False
        assert question["prefill_source"] is None