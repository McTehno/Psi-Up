from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.user_progress_schema import (
    CompleteContentRequest,
    ContentProgressResponse,
    CurrentPositionResponse,
    FavoriteContentRequest,
    QuestionnaireAnswerResponse,
    QuestionnaireAnswersResponse,
    SaveContentRequest,
    SaveQuestionnaireAnswersRequest,
    UpdateCurrentPositionRequest,
    UserProgressCreateRequest,
    UserProgressResponse,
)


def test_content_progress_response_accepts_valid_data():
    # Preverimo strukturo za saved/favorites/completed.
    progress = ContentProgressResponse(
        learning_path_ids=["lp_001"],
        module_ids=["mod_001"],
        learning_unit_ids=["ue_001"],
    )

    assert progress.learning_path_ids == ["lp_001"]
    assert progress.module_ids == ["mod_001"]
    assert progress.learning_unit_ids == ["ue_001"]


def test_content_progress_response_uses_default_empty_lists():
    # Če ID seznami niso podani, shema uporabi prazne sezname.
    progress = ContentProgressResponse()

    assert progress.learning_path_ids == []
    assert progress.module_ids == []
    assert progress.learning_unit_ids == []


def test_content_progress_response_uses_independent_default_lists():
    # Default seznami ne smejo biti deljeni med instancami.
    first_progress = ContentProgressResponse()
    second_progress = ContentProgressResponse()

    first_progress.module_ids.append("mod_001")

    assert first_progress.module_ids == ["mod_001"]
    assert second_progress.module_ids == []


def test_current_position_response_accepts_valid_data():
    # Trenutna pozicija hrani, kje uporabnik nadaljuje učenje znotraj učne poti.
    updated_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    position = CurrentPositionResponse(
        learning_path_id="lp_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
        updated_at=updated_at,
    )

    assert position.learning_path_id == "lp_001"
    assert position.current_module_id == "mod_001"
    assert position.current_learning_unit_id == "ue_001"
    assert position.updated_at == updated_at


def test_current_position_response_uses_default_optional_values():
    # current_module_id, current_learning_unit_id in updated_at so optional.
    position = CurrentPositionResponse(
        learning_path_id="lp_001",
    )

    assert position.learning_path_id == "lp_001"
    assert position.current_module_id is None
    assert position.current_learning_unit_id is None
    assert position.updated_at is None


def test_current_position_response_requires_learning_path_id():
    # learning_path_id je obvezen.
    with pytest.raises(ValidationError):
        CurrentPositionResponse()


def test_questionnaire_answer_response_accepts_valid_data():
    # Posamezen odgovor hrani vprašanje, odgovor in povezave na vsebino/topic/kompetence.
    answered_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    answer = QuestionnaireAnswerResponse(
        question_id="q_001",
        question="Razumem vsebino.",
        type="yes_no",
        answer=True,
        was_answered=True,
        learning_path_id="lp_001",
        module_id="mod_001",
        learning_unit_id="ue_001",
        topic_id="topic_001",
        competency_codes=["1.2", "5.2"],
        answered_at=answered_at,
    )

    assert answer.question_id == "q_001"
    assert answer.question == "Razumem vsebino."
    assert answer.type == "yes_no"
    assert answer.answer is True
    assert answer.was_answered is True
    assert answer.learning_path_id == "lp_001"
    assert answer.module_id == "mod_001"
    assert answer.learning_unit_id == "ue_001"
    assert answer.topic_id == "topic_001"
    assert answer.competency_codes == ["1.2", "5.2"]
    assert answer.answered_at == answered_at


def test_questionnaire_answer_response_accepts_supported_answer_types():
    # answer podpira bool, string, int, float, list stringov ali None.
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
        answer = QuestionnaireAnswerResponse(
            question_id="q_001",
            question="Vprašanje?",
            answer=value,
        )

        assert answer.answer == value


def test_questionnaire_answer_response_uses_default_values():
    # Če optional polja niso podana, dobijo privzete vrednosti.
    answer = QuestionnaireAnswerResponse(
        question_id="q_001",
        question="Vprašanje?",
    )

    assert answer.type == "yes_no"
    assert answer.answer is None
    assert answer.was_answered is True
    assert answer.learning_path_id is None
    assert answer.module_id is None
    assert answer.learning_unit_id is None
    assert answer.topic_id is None
    assert answer.competency_codes == []
    assert answer.answered_at is None


def test_questionnaire_answer_response_requires_question_id():
    # question_id je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireAnswerResponse(
            question="Vprašanje?",
        )


def test_questionnaire_answer_response_requires_question_text():
    # question je obvezen.
    with pytest.raises(ValidationError):
        QuestionnaireAnswerResponse(
            question_id="q_001",
        )


def test_questionnaire_answers_response_accepts_valid_data():
    # En zapis predstavlja zadnje stanje odgovorov za en target.
    submitted_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    questionnaire_answers = QuestionnaireAnswersResponse(
        target_type="module",
        target_id="mod_001",
        last_submitted_at=submitted_at,
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem vsebino.",
                "answer": True,
            }
        ],
    )

    assert questionnaire_answers.target_type == "module"
    assert questionnaire_answers.target_id == "mod_001"
    assert questionnaire_answers.last_submitted_at == submitted_at
    assert len(questionnaire_answers.answers) == 1
    assert questionnaire_answers.answers[0].question_id == "q_001"


def test_questionnaire_answers_response_accepts_allowed_target_types():
    # target_type je omejen na learning_path, module in learning_unit.
    for target_type in ["learning_path", "module", "learning_unit"]:
        questionnaire_answers = QuestionnaireAnswersResponse(
            target_type=target_type,
            target_id="target_001",
        )

        assert questionnaire_answers.target_type == target_type


def test_questionnaire_answers_response_rejects_invalid_target_type():
    # Neveljaven target_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        QuestionnaireAnswersResponse(
            target_type="invalid_target",
            target_id="target_001",
        )


def test_questionnaire_answers_response_uses_default_values():
    # answers je privzeto prazen seznam.
    questionnaire_answers = QuestionnaireAnswersResponse(
        target_type="learning_unit",
        target_id="ue_001",
    )

    assert questionnaire_answers.last_submitted_at is None
    assert questionnaire_answers.answers == []


def test_save_questionnaire_answers_request_accepts_valid_data():
    # Request za shranjevanje odgovorov ne vsebuje user_id, ker pride iz JWT.
    request = SaveQuestionnaireAnswersRequest(
        target_type="learning_path",
        target_id="lp_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem vsebino.",
                "answer": True,
                "learning_path_id": "lp_001",
                "module_id": "mod_001",
                "learning_unit_id": "ue_001",
            }
        ],
    )

    assert request.target_type == "learning_path"
    assert request.target_id == "lp_001"
    assert len(request.answers) == 1
    assert request.answers[0].answer is True


def test_save_questionnaire_answers_request_rejects_invalid_target_type():
    # target_type mora biti eden od dovoljenih tipov.
    with pytest.raises(ValidationError):
        SaveQuestionnaireAnswersRequest(
            target_type="invalid_target",
            target_id="x_001",
        )


def test_save_questionnaire_answers_request_uses_default_answers():
    # answers je lahko prazen seznam, ker podpiramo partial/empty stanje.
    request = SaveQuestionnaireAnswersRequest(
        target_type="module",
        target_id="mod_001",
    )

    assert request.answers == []


def test_user_progress_response_accepts_valid_data_with_alias_id():
    # UserProgressResponse predstavlja embedded progress kot response.
    progress = UserProgressResponse(
        _id="progress_user_001",
        user_id="user_001",
        saved={
            "learning_path_ids": ["lp_001"],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        favorites={
            "learning_path_ids": [],
            "module_ids": ["mod_001"],
            "learning_unit_ids": [],
        },
        completed={
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": ["ue_001"],
        },
        current_positions=[
            {
                "learning_path_id": "lp_001",
                "current_module_id": "mod_001",
                "current_learning_unit_id": "ue_001",
            }
        ],
        questionnaire_answers=[
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_001",
                        "question": "Razumem temo.",
                        "answer": True,
                    }
                ],
            }
        ],
    )

    assert progress.id == "progress_user_001"
    assert progress.user_id == "user_001"
    assert progress.saved.learning_path_ids == ["lp_001"]
    assert progress.favorites.module_ids == ["mod_001"]
    assert progress.completed.learning_unit_ids == ["ue_001"]
    assert len(progress.current_positions) == 1
    assert len(progress.questionnaire_answers) == 1


def test_user_progress_response_accepts_id_by_field_name():
    # Zaradi populate_by_name=True lahko uporabimo tudi id namesto _id.
    progress = UserProgressResponse(
        id="progress_user_001",
        user_id="user_001",
    )

    assert progress.id == "progress_user_001"
    assert progress.user_id == "user_001"


def test_user_progress_response_uses_default_empty_progress_sections():
    # Če progress sekcije niso podane, se ustvarijo prazne strukture.
    progress = UserProgressResponse(
        user_id="user_001",
    )

    assert progress.id is None

    assert progress.saved.learning_path_ids == []
    assert progress.saved.module_ids == []
    assert progress.saved.learning_unit_ids == []

    assert progress.favorites.learning_path_ids == []
    assert progress.favorites.module_ids == []
    assert progress.favorites.learning_unit_ids == []

    assert progress.completed.learning_path_ids == []
    assert progress.completed.module_ids == []
    assert progress.completed.learning_unit_ids == []

    assert progress.current_positions == []
    assert progress.questionnaire_answers == []


def test_user_progress_response_requires_user_id():
    # user_id je obvezen.
    with pytest.raises(ValidationError):
        UserProgressResponse()


def test_user_progress_response_serializes_id_as_alias_when_requested():
    # Pri by_alias=True se id serializira kot _id.
    progress = UserProgressResponse(
        _id="progress_user_001",
        user_id="user_001",
    )

    result = progress.model_dump(by_alias=True)

    assert result["_id"] == "progress_user_001"
    assert "id" not in result


def test_user_progress_create_request_accepts_valid_data():
    # Create request vsebuje samo user_id.
    request = UserProgressCreateRequest(
        user_id="user_001",
    )

    assert request.user_id == "user_001"


def test_user_progress_create_request_requires_user_id():
    # user_id je obvezen.
    with pytest.raises(ValidationError):
        UserProgressCreateRequest()


def test_save_content_request_accepts_allowed_content_types():
    # SaveContentRequest sprejme learning_path, module in learning_unit.
    for content_type in ["learning_path", "module", "learning_unit"]:
        request = SaveContentRequest(
            content_id="content_001",
            content_type=content_type,
        )

        assert request.content_id == "content_001"
        assert request.content_type == content_type


def test_save_content_request_rejects_invalid_content_type():
    # Neveljaven content_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        SaveContentRequest(
            content_id="content_001",
            content_type="invalid_type",
        )


def test_save_content_request_requires_content_id():
    # content_id je obvezen.
    with pytest.raises(ValidationError):
        SaveContentRequest(
            content_type="module",
        )


def test_favorite_content_request_accepts_allowed_content_types():
    # FavoriteContentRequest uporablja enako content_type logiko.
    for content_type in ["learning_path", "module", "learning_unit"]:
        request = FavoriteContentRequest(
            content_id="content_001",
            content_type=content_type,
        )

        assert request.content_id == "content_001"
        assert request.content_type == content_type


def test_favorite_content_request_rejects_invalid_content_type():
    # Neveljaven content_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        FavoriteContentRequest(
            content_id="content_001",
            content_type="invalid_type",
        )


def test_complete_content_request_accepts_allowed_content_types():
    # CompleteContentRequest uporablja enako content_type logiko.
    for content_type in ["learning_path", "module", "learning_unit"]:
        request = CompleteContentRequest(
            content_id="content_001",
            content_type=content_type,
        )

        assert request.content_id == "content_001"
        assert request.content_type == content_type


def test_complete_content_request_rejects_invalid_content_type():
    # Neveljaven content_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        CompleteContentRequest(
            content_id="content_001",
            content_type="invalid_type",
        )


def test_update_current_position_request_accepts_valid_data():
    # Request za trenutno pozicijo vsebuje learning_path_id in opcijsko module/unit.
    request = UpdateCurrentPositionRequest(
        learning_path_id="lp_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    assert request.learning_path_id == "lp_001"
    assert request.current_module_id == "mod_001"
    assert request.current_learning_unit_id == "ue_001"


def test_update_current_position_request_uses_default_optional_values():
    # current_module_id in current_learning_unit_id sta optional.
    request = UpdateCurrentPositionRequest(
        learning_path_id="lp_001",
    )

    assert request.learning_path_id == "lp_001"
    assert request.current_module_id is None
    assert request.current_learning_unit_id is None


def test_update_current_position_request_requires_learning_path_id():
    # learning_path_id je obvezen.
    with pytest.raises(ValidationError):
        UpdateCurrentPositionRequest()