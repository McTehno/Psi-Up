from app.schemas.questionnaire_schema import (
    QuestionnaireAnswerRequest,
    QuestionnaireQuestionResponse,
    QuestionnaireResponse,
    QuestionnaireSubmitRequest,
    QuestionnaireTargetType,
)


def test_questionnaire_target_type_values_are_correct():
    # Enum vrednosti morajo ostati usklajene z API query parametri.
    assert QuestionnaireTargetType.LEARNING_PATH == "learning_path"
    assert QuestionnaireTargetType.MODULE == "module"
    assert QuestionnaireTargetType.LEARNING_UNIT == "learning_unit"


def test_questionnaire_question_response_uses_default_type():
    # Če type ni podan, vprašanje privzeto uporablja yes_no.
    question = QuestionnaireQuestionResponse(
        id="q_001",
        question="Razumem osnovne pojme.",
    )

    assert question.type == "yes_no"
    assert question.learning_unit_id is None
    assert question.related_topic is None


def test_questionnaire_response_accepts_questions():
    # Preverimo, da vprašalnik sprejme seznam vprašanj.
    questionnaire = QuestionnaireResponse(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        title="Vprašalnik za učno enoto",
        questions=[
            {
                "id": "q_001",
                "question": "Razumem osnovne pojme.",
                "type": "yes_no",
                "learning_unit_id": "ue_001",
                "related_topic": "Osnove",
            }
        ],
    )

    assert questionnaire.target_type == QuestionnaireTargetType.LEARNING_UNIT
    assert questionnaire.questions[0].learning_unit_id == "ue_001"


def test_questionnaire_submit_request_accepts_answers():
    # Preverimo strukturo requesta, ki ga frontend pošlje ob oddaji vprašalnika.
    request = QuestionnaireSubmitRequest(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            QuestionnaireAnswerRequest(
                question_id="q_001",
                learning_unit_id="ue_001",
                answer=True,
            )
        ],
    )

    assert request.user_id == "user_001"
    assert request.answers[0].answer is True