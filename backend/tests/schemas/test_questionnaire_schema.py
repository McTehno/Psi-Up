import pytest
from pydantic import ValidationError

from app.schemas.questionnaire_schema import (
    QuestionnaireAnswerRequest,
    QuestionnaireQuestionResponse,
    QuestionnaireQuestionSourceResponse,
    QuestionnaireResponse,
    QuestionnaireSubmitRequest,
    QuestionnaireTargetType,
)


def test_questionnaire_target_type_values():
    # Enum podpira vprašalnik za učno pot, modul in učno enoto.
    assert QuestionnaireTargetType.LEARNING_PATH == "learning_path"
    assert QuestionnaireTargetType.MODULE == "module"
    assert QuestionnaireTargetType.LEARNING_UNIT == "learning_unit"


def test_questionnaire_question_source_response_accepts_valid_data():
    # Source pove, iz katere vsebine/topic-a/kompetenc vprašanje izhaja.
    source = QuestionnaireQuestionSourceResponse(
        learning_path_id="lp_001",
        module_id="mod_001",
        learning_unit_id="ue_001",
        topic_id="topic_001",
        related_topic="Osnovni pojmi umetne inteligence",
        competency_codes=["1.2", "5.2"],
    )

    assert source.learning_path_id == "lp_001"
    assert source.module_id == "mod_001"
    assert source.learning_unit_id == "ue_001"
    assert source.topic_id == "topic_001"
    assert source.related_topic == "Osnovni pojmi umetne inteligence"
    assert source.competency_codes == ["1.2", "5.2"]


def test_questionnaire_question_source_response_uses_default_values():
    # Vsa source polja so optional, competency_codes pa je privzeto prazen seznam.
    source = QuestionnaireQuestionSourceResponse()

    assert source.learning_path_id is None
    assert source.module_id is None
    assert source.learning_unit_id is None
    assert source.topic_id is None
    assert source.related_topic is None
    assert source.competency_codes == []


def test_questionnaire_question_source_response_uses_independent_competency_code_lists():
    # Default competency_codes seznam ne sme biti deljen med instancami.
    first_source = QuestionnaireQuestionSourceResponse()
    second_source = QuestionnaireQuestionSourceResponse()

    first_source.competency_codes.append("1.2")

    assert first_source.competency_codes == ["1.2"]
    assert second_source.competency_codes == []


def test_questionnaire_question_response_accepts_valid_data():
    # Vprašanje vsebuje osnovne podatke, povezave in seznam sources.
    question = QuestionnaireQuestionResponse(
        id="q_001",
        question="Razumem osnovni koncept umetne inteligence.",
        type="yes_no",
        learning_path_id="lp_001",
        module_id="mod_001",
        learning_unit_id="ue_001",
        related_topic="Osnovni pojmi umetne inteligence",
        related_topic_id="topic_001",
        related_competency_codes=["1.2"],
        sources=[
            {
                "learning_path_id": "lp_001",
                "module_id": "mod_001",
                "learning_unit_id": "ue_001",
                "topic_id": "topic_001",
                "related_topic": "Osnovni pojmi umetne inteligence",
                "competency_codes": ["1.2"],
            }
        ],
    )

    assert question.id == "q_001"
    assert question.question == "Razumem osnovni koncept umetne inteligence."
    assert question.type == "yes_no"
    assert question.learning_path_id == "lp_001"
    assert question.module_id == "mod_001"
    assert question.learning_unit_id == "ue_001"
    assert question.related_topic == "Osnovni pojmi umetne inteligence"
    assert question.related_topic_id == "topic_001"
    assert question.related_competency_codes == ["1.2"]
    assert len(question.sources) == 1
    assert question.sources[0].learning_unit_id == "ue_001"


def test_questionnaire_question_response_uses_default_values():
    # Optional povezave so None, type je yes_no, seznami so prazni.
    question = QuestionnaireQuestionResponse(
        id="q_001",
        question="Razumem vsebino.",
    )

    assert question.type == "yes_no"
    assert question.learning_path_id is None
    assert question.module_id is None
    assert question.learning_unit_id is None
    assert question.related_topic is None
    assert question.related_topic_id is None
    assert question.related_competency_codes == []
    assert question.sources == []


def test_questionnaire_question_response_requires_id():
    # id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireQuestionResponse(
            question="Razumem vsebino.",
        )


def test_questionnaire_question_response_requires_question_text():
    # question je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireQuestionResponse(
            id="q_001",
        )


def test_questionnaire_response_accepts_valid_data():
    # Celoten vprašalnik vsebuje target in seznam vprašanj.
    questionnaire = QuestionnaireResponse(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        title="Vprašalnik za modul",
        questions=[
            {
                "id": "q_001",
                "question": "Razumem vsebino modula.",
                "type": "yes_no",
                "module_id": "mod_001",
                "learning_unit_id": "ue_001",
                "related_topic_id": "topic_001",
                "related_competency_codes": ["1.2"],
            }
        ],
    )

    assert questionnaire.target_type == QuestionnaireTargetType.MODULE
    assert questionnaire.target_id == "mod_001"
    assert questionnaire.title == "Vprašalnik za modul"
    assert len(questionnaire.questions) == 1
    assert questionnaire.questions[0].id == "q_001"


def test_questionnaire_response_accepts_allowed_target_types():
    # Vprašalnik lahko nastane za vse tri podprte target tipe.
    for target_type in [
        QuestionnaireTargetType.LEARNING_PATH,
        QuestionnaireTargetType.MODULE,
        QuestionnaireTargetType.LEARNING_UNIT,
    ]:
        questionnaire = QuestionnaireResponse(
            target_type=target_type,
            target_id="target_001",
        )

        assert questionnaire.target_type == target_type


def test_questionnaire_response_rejects_invalid_target_type():
    # Neveljaven target_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        QuestionnaireResponse(
            target_type="invalid_target",
            target_id="target_001",
        )


def test_questionnaire_response_uses_default_values():
    # title je optional, questions je privzeto prazen seznam.
    questionnaire = QuestionnaireResponse(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
    )

    assert questionnaire.title is None
    assert questionnaire.questions == []


def test_questionnaire_response_requires_target_type():
    # target_type je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireResponse(
            target_id="ue_001",
        )


def test_questionnaire_response_requires_target_id():
    # target_id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireResponse(
            target_type=QuestionnaireTargetType.LEARNING_UNIT,
        )


def test_questionnaire_answer_request_accepts_valid_bool_answer():
    # Za yes_no vprašanje je bool odgovor veljaven.
    answer = QuestionnaireAnswerRequest(
        question_id="q_001",
        question="Razumem vsebino.",
        type="yes_no",
        answer=True,
        learning_path_id="lp_001",
        module_id="mod_001",
        learning_unit_id="ue_001",
        topic_id="topic_001",
        competency_codes=["1.2"],
    )

    assert answer.question_id == "q_001"
    assert answer.question == "Razumem vsebino."
    assert answer.type == "yes_no"
    assert answer.answer is True
    assert answer.learning_path_id == "lp_001"
    assert answer.module_id == "mod_001"
    assert answer.learning_unit_id == "ue_001"
    assert answer.topic_id == "topic_001"
    assert answer.competency_codes == ["1.2"]


def test_questionnaire_answer_request_accepts_supported_answer_types():
    # answer podpira več tipov, ker vprašanja niso nujno vedno yes_no.
    valid_answers = [
        True,
        False,
        "yes",
        3,
        4.5,
        ["a", "b"],
        None,
    ]

    for value in valid_answers:
        answer = QuestionnaireAnswerRequest(
            question_id="q_001",
            question="Vprašanje?",
            answer=value,
        )

        assert answer.answer == value


def test_questionnaire_answer_request_uses_default_values():
    # Optional polja dobijo privzete vrednosti.
    answer = QuestionnaireAnswerRequest(
        question_id="q_001",
        question="Vprašanje?",
    )

    assert answer.type == "yes_no"
    assert answer.answer is None
    assert answer.learning_path_id is None
    assert answer.module_id is None
    assert answer.learning_unit_id is None
    assert answer.topic_id is None
    assert answer.competency_codes == []


def test_questionnaire_answer_request_requires_question_id():
    # question_id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireAnswerRequest(
            question="Vprašanje?",
        )


def test_questionnaire_answer_request_requires_question_text():
    # question je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireAnswerRequest(
            question_id="q_001",
        )


def test_questionnaire_submit_request_accepts_valid_data():
    # Submit request vsebuje user_id, target in seznam odgovorov.
    request = QuestionnaireSubmitRequest(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="lp_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem vsebino.",
                "answer": True,
                "learning_path_id": "lp_001",
                "module_id": "mod_001",
                "learning_unit_id": "ue_001",
                "topic_id": "topic_001",
                "competency_codes": ["1.2"],
            }
        ],
    )

    assert request.user_id == "user_001"
    assert request.target_type == QuestionnaireTargetType.LEARNING_PATH
    assert request.target_id == "lp_001"
    assert len(request.answers) == 1
    assert request.answers[0].question_id == "q_001"
    assert request.answers[0].answer is True


def test_questionnaire_submit_request_accepts_allowed_target_types():
    # Submit request podpira vse target tipe.
    for target_type in [
        QuestionnaireTargetType.LEARNING_PATH,
        QuestionnaireTargetType.MODULE,
        QuestionnaireTargetType.LEARNING_UNIT,
    ]:
        request = QuestionnaireSubmitRequest(
            user_id="user_001",
            target_type=target_type,
            target_id="target_001",
        )

        assert request.target_type == target_type


def test_questionnaire_submit_request_rejects_invalid_target_type():
    # Neveljaven target_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        QuestionnaireSubmitRequest(
            user_id="user_001",
            target_type="invalid_target",
            target_id="target_001",
        )


def test_questionnaire_submit_request_uses_default_answers():
    # answers je privzeto prazen seznam.
    request = QuestionnaireSubmitRequest(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
    )

    assert request.answers == []


def test_questionnaire_submit_request_requires_user_id():
    # user_id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireSubmitRequest(
            target_type=QuestionnaireTargetType.MODULE,
            target_id="mod_001",
        )


def test_questionnaire_submit_request_requires_target_id():
    # target_id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireSubmitRequest(
            user_id="user_001",
            target_type=QuestionnaireTargetType.MODULE,
        )