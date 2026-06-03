from app.services.assessments.assessment_progress_service import AssessmentProgressService


class FakeUserProgressService:
    def __init__(self, progress):
        self.progress = progress

    async def get_or_create_progress(self, user_id: str):
        return self.progress


def build_service(progress=None):
    return AssessmentProgressService(
        assessment_service=None,
        questionnaire_answers_service=None,
        user_progress_service=FakeUserProgressService(progress or {}),
        completed_content_service=None,
        current_position_service=None,
        learning_path_service=None,
        module_service=None,
        learning_unit_service=None,
    )


def test_build_complete_answers_uses_submitted_answer_by_question_text():
    service = build_service()

    all_questions = [
        {
            "id": "q_original_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        }
    ]

    submitted_answers = [
        {
            "question_id": "q_different_001",
            "question": "  Razumem osnovni koncept umetne inteligence.  ",
            "type": "yes_no",
            "answer": False,
            "learning_unit_id": "ue_001",
            "topic_id": "topic_001",
            "competency_codes": ["1.2"],
        }
    ]

    result = service._build_complete_answers(
        all_questions=all_questions,
        submitted_answers=submitted_answers,
        existing_completed={
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        latest_explicit_answers={},
    )

    assert len(result) == 1

    answer = result[0]

    assert answer["question_id"] == "q_different_001"
    assert answer["answer"] is False
    assert answer["was_answered"] is True
    assert answer["learning_unit_id"] == "ue_001"
    assert answer["topic_id"] == "topic_001"
    assert answer["competency_codes"] == ["1.2"]


def test_build_complete_answers_uses_latest_explicit_answer_by_question_text():
    service = build_service()

    all_questions = [
        {
            "id": "q_original_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        }
    ]

    latest_explicit_answers = {
        "question:razumem osnovni koncept umetne inteligence.": {
            "question_id": "q_previous_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "answer": True,
            "was_answered": True,
            "learning_unit_id": "ue_001",
            "topic_id": "topic_001",
            "competency_codes": ["1.2"],
        }
    }

    result = service._build_complete_answers(
        all_questions=all_questions,
        submitted_answers=[],
        existing_completed={
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        latest_explicit_answers=latest_explicit_answers,
    )

    assert len(result) == 1

    answer = result[0]

    assert answer["question_id"] == "q_previous_001"
    assert answer["answer"] is True
    assert answer["was_answered"] is True
    assert answer["is_prefilled"] is True
    assert answer["prefill_source"] == "last_answer"


def test_build_complete_answers_marks_unanswered_yes_no_as_fallback_false():
    service = build_service()

    all_questions = [
        {
            "id": "q_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        }
    ]

    result = service._build_complete_answers(
        all_questions=all_questions,
        submitted_answers=[],
        existing_completed={
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        latest_explicit_answers={},
    )

    assert len(result) == 1

    answer = result[0]

    assert answer["question_id"] == "q_001"
    assert answer["answer"] is False
    assert answer["was_answered"] is False


def test_build_complete_answers_marks_completed_unanswered_as_fallback_true():
    service = build_service()

    all_questions = [
        {
            "id": "q_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        }
    ]

    result = service._build_complete_answers(
        all_questions=all_questions,
        submitted_answers=[],
        existing_completed={
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": ["ue_001"],
        },
        latest_explicit_answers={},
    )

    assert len(result) == 1

    answer = result[0]

    assert answer["question_id"] == "q_001"
    assert answer["answer"] is True
    assert answer["was_answered"] is False


async def test_get_latest_explicit_answer_maps_ignores_fallback_answers():
    progress = {
        "questionnaire_answers": [
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "type": "yes_no",
                        "answer": False,
                        "was_answered": False,
                    },
                    {
                        "question_id": "q_002",
                        "question": "Razumem, zakaj so podatki pomembni.",
                        "type": "yes_no",
                        "answer": True,
                        "was_answered": True,
                    },
                ],
            }
        ]
    }

    service = build_service(progress=progress)

    result = await service._get_latest_explicit_answer_maps(
        user_id="user_test"
    )

    assert "id:q_001" not in result
    assert "question:razumem osnovni koncept umetne inteligence." not in result

    assert result["id:q_002"]["answer"] is True
    assert result["question:razumem, zakaj so podatki pomembni."]["answer"] is True


async def test_get_latest_explicit_answer_maps_maps_explicit_answer_by_id_and_text():
    progress = {
        "questionnaire_answers": [
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_001",
                        "question": "  Razumem osnovni koncept umetne inteligence.  ",
                        "type": "yes_no",
                        "answer": False,
                        "was_answered": True,
                    }
                ],
            }
        ]
    }

    service = build_service(progress=progress)

    result = await service._get_latest_explicit_answer_maps(
        user_id="user_test"
    )

    assert result["id:q_001"]["answer"] is False
    assert (
        result["question:razumem osnovni koncept umetne inteligence."]["answer"]
        is False
    )