from datetime import datetime, timezone, timedelta

import pytest

from app.services.user_progress.questionnaire_answers_service import (
    QuestionnaireAnswersService,
)


class FakeQuestionnaireAnswersRepository:
    def __init__(self, questionnaire_answers):
        self.questionnaire_answers = questionnaire_answers

    async def get_all_questionnaire_answers(self, user_id: str):
        return self.questionnaire_answers


@pytest.mark.asyncio
async def test_latest_explicit_answer_uses_newest_answered_at():
    old_time = datetime.now(timezone.utc) - timedelta(days=1)
    new_time = datetime.now(timezone.utc)

    repository = FakeQuestionnaireAnswersRepository(
        questionnaire_answers=[
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": True,
                        "was_answered": True,
                        "answered_at": old_time,
                    }
                ],
            },
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": False,
                        "was_answered": True,
                        "answered_at": new_time,
                    }
                ],
            },
        ]
    )

    service = QuestionnaireAnswersService(repository)

    result = await service.get_latest_explicit_answer_maps(
        user_id="user_test"
    )

    assert result["id:q_ue_001_001"]["answer"] is False
    assert (
        result["question:razumem osnovni koncept umetne inteligence."]["answer"]
        is False
    )


@pytest.mark.asyncio
async def test_latest_explicit_answer_ignores_backend_fallback_answers():
    old_time = datetime.now(timezone.utc) - timedelta(days=1)
    new_time = datetime.now(timezone.utc)

    repository = FakeQuestionnaireAnswersRepository(
        questionnaire_answers=[
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": False,
                        "was_answered": True,
                        "answered_at": old_time,
                    }
                ],
            },
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": True,
                        "was_answered": False,
                        "answered_at": new_time,
                    }
                ],
            },
        ]
    )

    service = QuestionnaireAnswersService(repository)

    result = await service.get_latest_explicit_answer_maps(
        user_id="user_test"
    )

    assert result["id:q_ue_001_001"]["answer"] is False


@pytest.mark.asyncio
async def test_latest_explicit_answer_matches_same_question_text_with_different_ids():
    old_time = datetime.now(timezone.utc) - timedelta(days=1)
    new_time = datetime.now(timezone.utc)

    repository = FakeQuestionnaireAnswersRepository(
        questionnaire_answers=[
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": True,
                        "was_answered": True,
                        "answered_at": old_time,
                    }
                ],
            },
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_duplicate_001",
                        "question": "  Razumem osnovni koncept umetne inteligence.  ",
                        "answer": False,
                        "was_answered": True,
                        "answered_at": new_time,
                    }
                ],
            },
        ]
    )

    service = QuestionnaireAnswersService(repository)

    result = await service.get_latest_explicit_answer_maps(
        user_id="user_test"
    )

    assert result["id:q_duplicate_001"]["answer"] is False
    assert (
        result["question:razumem osnovni koncept umetne inteligence."]["answer"]
        is False
    )


@pytest.mark.asyncio
async def test_latest_explicit_answer_returns_empty_map_for_missing_user_id():
    repository = FakeQuestionnaireAnswersRepository(
        questionnaire_answers=[
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "answer": True,
                        "was_answered": True,
                        "answered_at": datetime.now(timezone.utc),
                    }
                ],
            }
        ]
    )

    service = QuestionnaireAnswersService(repository)

    result = await service.get_latest_explicit_answer_maps(user_id="")

    assert result == {}