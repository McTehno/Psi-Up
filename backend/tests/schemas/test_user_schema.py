from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.user_schema import (
    UserContentProgress,
    UserCreateRequest,
    UserCurrentPosition,
    UserProgress,
    UserQuestionnaireAnswer,
    UserQuestionnaireAnswers,
    UserResponse,
    UserUpdateRequest,
)


def test_user_content_progress_accepts_valid_data():
    # Preverimo strukturo za saved/favorites/completed.
    progress = UserContentProgress(
        learning_path_ids=["lp_001"],
        module_ids=["mod_001"],
        learning_unit_ids=["ue_001"],
    )

    assert progress.learning_path_ids == ["lp_001"]
    assert progress.module_ids == ["mod_001"]
    assert progress.learning_unit_ids == ["ue_001"]


def test_user_content_progress_uses_default_empty_lists():
    # Če ID seznami niso podani, dobimo prazne sezname.
    progress = UserContentProgress()

    assert progress.learning_path_ids == []
    assert progress.module_ids == []
    assert progress.learning_unit_ids == []


def test_user_content_progress_uses_independent_default_lists():
    # Default seznami ne smejo biti deljeni med instancami.
    first_progress = UserContentProgress()
    second_progress = UserContentProgress()

    first_progress.module_ids.append("mod_001")

    assert first_progress.module_ids == ["mod_001"]
    assert second_progress.module_ids == []


def test_user_current_position_accepts_valid_data():
    # Trenutna pozicija hrani learning path in trenutno mesto uporabnika.
    updated_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    position = UserCurrentPosition(
        learning_path_id="lp_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
        updated_at=updated_at,
    )

    assert position.learning_path_id == "lp_001"
    assert position.current_module_id == "mod_001"
    assert position.current_learning_unit_id == "ue_001"
    assert position.updated_at == updated_at


def test_user_current_position_uses_default_optional_values():
    # current_module_id, current_learning_unit_id in updated_at so optional.
    position = UserCurrentPosition(
        learning_path_id="lp_001",
    )

    assert position.learning_path_id == "lp_001"
    assert position.current_module_id is None
    assert position.current_learning_unit_id is None
    assert position.updated_at is None


def test_user_current_position_requires_learning_path_id():
    # learning_path_id je obvezen za trenutno pozicijo.
    with pytest.raises(ValidationError):
        UserCurrentPosition()


def test_user_questionnaire_answer_accepts_valid_data():
    # Posamezen odgovor podpira povezave na path/module/unit/topic/competencies.
    answered_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    answer = UserQuestionnaireAnswer(
        question_id="q_001",
        question="Razumem vsebino.",
        type="yes_no",
        answer=True,
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
    assert answer.learning_path_id == "lp_001"
    assert answer.module_id == "mod_001"
    assert answer.learning_unit_id == "ue_001"
    assert answer.topic_id == "topic_001"
    assert answer.competency_codes == ["1.2", "5.2"]
    assert answer.answered_at == answered_at


def test_user_questionnaire_answer_accepts_supported_answer_types():
    # answer lahko trenutno sprejme bool, string, int, float, list stringov ali None.
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
        answer = UserQuestionnaireAnswer(
            question_id="q_001",
            question="Vprašanje?",
            answer=value,
        )

        assert answer.answer == value


def test_user_questionnaire_answer_uses_default_values():
    # Če niso podana optional polja, dobijo varne privzete vrednosti.
    answer = UserQuestionnaireAnswer(
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
    assert answer.answered_at is None


def test_user_questionnaire_answer_requires_question_id():
    # question_id je obvezen.
    with pytest.raises(ValidationError):
        UserQuestionnaireAnswer(
            question="Vprašanje?",
        )


def test_user_questionnaire_answer_requires_question_text():
    # question je obvezen.
    with pytest.raises(ValidationError):
        UserQuestionnaireAnswer(
            question_id="q_001",
        )


def test_user_questionnaire_answers_accepts_valid_data():
    # En zapis predstavlja zadnje stanje odgovorov za en target.
    submitted_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    questionnaire_answers = UserQuestionnaireAnswers(
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


def test_user_questionnaire_answers_accepts_allowed_target_types():
    # target_type je omejen na learning_path, module in learning_unit.
    for target_type in ["learning_path", "module", "learning_unit"]:
        questionnaire_answers = UserQuestionnaireAnswers(
            target_type=target_type,
            target_id="target_001",
        )

        assert questionnaire_answers.target_type == target_type


def test_user_questionnaire_answers_rejects_invalid_target_type():
    # Neveljaven target_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        UserQuestionnaireAnswers(
            target_type="invalid_target",
            target_id="target_001",
        )


def test_user_questionnaire_answers_uses_default_values():
    # Če answers niso podani, dobimo prazen seznam.
    questionnaire_answers = UserQuestionnaireAnswers(
        target_type="learning_unit",
        target_id="ue_001",
    )

    assert questionnaire_answers.last_submitted_at is None
    assert questionnaire_answers.answers == []


def test_user_progress_accepts_valid_embedded_progress():
    # UserProgress združi saved, favorites, completed, current_positions in questionnaire_answers.
    progress = UserProgress(
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

    assert progress.saved.learning_path_ids == ["lp_001"]
    assert progress.favorites.module_ids == ["mod_001"]
    assert progress.completed.learning_unit_ids == ["ue_001"]
    assert len(progress.current_positions) == 1
    assert len(progress.questionnaire_answers) == 1


def test_user_progress_uses_default_empty_structure():
    # Če progress ni podan, se ustvari prazna embedded struktura.
    progress = UserProgress()

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


def test_user_response_accepts_valid_user_with_alias_id():
    # UserResponse sprejme MongoDB _id in embedded progress.
    created_at = datetime(2026, 5, 18, tzinfo=timezone.utc)
    updated_at = datetime(2026, 6, 1, tzinfo=timezone.utc)

    user = UserResponse(
        _id="user_001",
        auth_provider="supabase",
        auth_user_id="supabase_test_001",
        name="Testni uporabnik",
        email="test@example.com",
        created_at=created_at,
        updated_at=updated_at,
        progress={
            "saved": {
                "learning_path_ids": [],
                "module_ids": ["mod_001"],
                "learning_unit_ids": [],
            }
        },
    )

    assert user.id == "user_001"
    assert user.auth_provider == "supabase"
    assert user.auth_user_id == "supabase_test_001"
    assert user.name == "Testni uporabnik"
    assert str(user.email) == "test@example.com"
    assert user.created_at == created_at
    assert user.updated_at == updated_at
    assert user.progress.saved.module_ids == ["mod_001"]


def test_user_response_accepts_id_by_field_name():
    # Zaradi populate_by_name=True lahko uporabimo tudi id namesto _id.
    user = UserResponse(
        id="user_001",
        auth_user_id="supabase_test_001",
        created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
    )

    assert user.id == "user_001"
    assert user.auth_provider is None
    assert user.name is None
    assert user.email is None
    assert user.updated_at is None
    assert isinstance(user.progress, UserProgress)


def test_user_response_uses_default_progress_when_missing():
    # Če progress ni poslan, se ustvari prazen UserProgress.
    user = UserResponse(
        _id="user_001",
        auth_user_id="supabase_test_001",
        created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
    )

    assert user.progress.saved.learning_path_ids == []
    assert user.progress.favorites.module_ids == []
    assert user.progress.completed.learning_unit_ids == []
    assert user.progress.current_positions == []
    assert user.progress.questionnaire_answers == []


def test_user_response_requires_id():
    # Uporabnik brez _id ali id ni veljaven response.
    with pytest.raises(ValidationError):
        UserResponse(
            auth_user_id="supabase_test_001",
            created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
        )


def test_user_response_requires_auth_user_id():
    # auth_user_id je obvezen, ker povezuje lokalni profil z zunanjim auth uporabnikom.
    with pytest.raises(ValidationError):
        UserResponse(
            _id="user_001",
            created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
        )


def test_user_response_requires_created_at():
    # created_at je obvezen.
    with pytest.raises(ValidationError):
        UserResponse(
            _id="user_001",
            auth_user_id="supabase_test_001",
        )


def test_user_response_rejects_invalid_email():
    # EmailStr zavrne neveljaven email.
    with pytest.raises(ValidationError):
        UserResponse(
            _id="user_001",
            auth_user_id="supabase_test_001",
            email="not-an-email",
            created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
        )


def test_user_response_serializes_id_as_alias_when_requested():
    # Pri by_alias=True se id serializira nazaj kot _id.
    user = UserResponse(
        _id="user_001",
        auth_user_id="supabase_test_001",
        created_at=datetime(2026, 5, 18, tzinfo=timezone.utc),
    )

    result = user.model_dump(by_alias=True)

    assert result["_id"] == "user_001"
    assert "id" not in result


def test_user_create_request_accepts_valid_data():
    # UserCreateRequest se uporabi po uspešni prijavi prek zunanjega auth sistema.
    request = UserCreateRequest(
        auth_provider="supabase",
        auth_user_id="supabase_test_001",
        name="Testni uporabnik",
        email="test@example.com",
    )

    assert request.auth_provider == "supabase"
    assert request.auth_user_id == "supabase_test_001"
    assert request.name == "Testni uporabnik"
    assert str(request.email) == "test@example.com"


def test_user_create_request_allows_optional_profile_fields():
    # name, email in auth_provider so optional.
    request = UserCreateRequest(
        auth_user_id="supabase_test_001",
    )

    assert request.auth_provider is None
    assert request.auth_user_id == "supabase_test_001"
    assert request.name is None
    assert request.email is None


def test_user_create_request_requires_auth_user_id():
    # auth_user_id je obvezen za ustvarjanje lokalnega profila.
    with pytest.raises(ValidationError):
        UserCreateRequest(
            name="Testni uporabnik",
        )


def test_user_create_request_rejects_invalid_email():
    # EmailStr zavrne neveljaven email tudi pri create requestu.
    with pytest.raises(ValidationError):
        UserCreateRequest(
            auth_user_id="supabase_test_001",
            email="invalid-email",
        )


def test_user_update_request_accepts_valid_data():
    # UserUpdateRequest podpira posodobitev imena in emaila.
    request = UserUpdateRequest(
        name="Novo ime",
        email="new@example.com",
    )

    assert request.name == "Novo ime"
    assert str(request.email) == "new@example.com"


def test_user_update_request_allows_partial_update():
    # Update je lahko delni, na primer samo name.
    request = UserUpdateRequest(
        name="Novo ime",
    )

    assert request.name == "Novo ime"
    assert request.email is None


def test_user_update_request_allows_empty_body():
    # Ker sta name in email optional, je prazen update request validen.
    request = UserUpdateRequest()

    assert request.name is None
    assert request.email is None


def test_user_update_request_rejects_invalid_email():
    # EmailStr zavrne neveljaven email pri update requestu.
    with pytest.raises(ValidationError):
        UserUpdateRequest(
            email="invalid-email",
        )