import pytest
from unittest.mock import AsyncMock

from app.schemas.assessment_schema import AssessmentStatus
from app.schemas.questionnaire_schema import QuestionnaireTargetType
from app.services.assessments.assessment_service import AssessmentService


@pytest.fixture
def learning_path_service():
    return AsyncMock()


@pytest.fixture
def module_service():
    return AsyncMock()


@pytest.fixture
def learning_unit_service():
    return AsyncMock()


@pytest.fixture
def service(
    learning_path_service,
    module_service,
    learning_unit_service,
):
    return AssessmentService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


@pytest.fixture
def learning_unit():
    return {
        "_id": "ue_001",
        "title": "Osnovni pojmi umetne inteligence",
        "content_topics": [
            {
                "id": "topic_001",
                "title": "Osnovni pojmi",
                "related_competency_codes": ["1.2"],
            },
            {
                "id": "topic_002",
                "title": "Primeri uporabe",
                "related_competency_codes": ["5.2"],
            },
        ],
        "self_assessment_questions": [
            {
                "id": "q_001",
                "question": "Razumem osnovne pojme.",
                "related_topic_id": "topic_001",
                "related_competency_codes": ["1.2"],
            },
            {
                "id": "q_002",
                "question": "Poznam primere uporabe.",
                "related_topic_id": "topic_002",
                "related_competency_codes": ["5.2"],
            },
        ],
    }


def test_get_list_value_returns_list(service):
    # Če je vrednost list, jo service vrne.
    assert service._get_list_value(["a", "b"]) == ["a", "b"]


def test_get_list_value_returns_empty_list_for_invalid_value(service):
    # Če vrednost ni list, service vrne prazen seznam.
    assert service._get_list_value(None) == []
    assert service._get_list_value("not-a-list") == []


def test_get_string_value_returns_trimmed_string(service):
    # String vrednost se očisti.
    result = service._get_string_value("  ue_001  ")

    assert result == "ue_001"


def test_get_string_value_returns_fallback_for_invalid_value(service):
    # Če vrednost ni string, service vrne fallback.
    result = service._get_string_value(None, fallback="fallback")

    assert result == "fallback"


def test_get_string_list_value_returns_only_valid_strings(service):
    # Seznam stringov se očisti in neveljavne vrednosti se odstranijo.
    result = service._get_string_list_value([" 1.2 ", "", 123, None, "5.2"])

    assert result == ["1.2", "5.2"]


def test_get_string_list_value_returns_empty_list_for_invalid_value(service):
    # Če vrednost ni list, service vrne prazen seznam.
    result = service._get_string_list_value("1.2,5.2")

    assert result == []


def test_normalize_question_text_normalizes_text(service):
    # Besedilo vprašanja se normalizira za primerjavo odgovorov.
    result = service._normalize_question_text("  Razumem   osnovne   pojme. ")

    assert result == "razumem osnovne pojme."


def test_normalize_question_text_returns_empty_string_for_invalid_value(service):
    # Če vprašanje ni string, normalizacija vrne prazen string.
    result = service._normalize_question_text(None)

    assert result == ""


def test_add_unique_adds_values_without_duplicates(service):
    # V seznam doda samo nove vrednosti.
    target = ["1.2"]

    service._add_unique(target, ["1.2", "5.2"])

    assert target == ["1.2", "5.2"]


def test_build_answer_maps_builds_lookup_by_question_id_and_text(service):
    # Odgovori se mapirajo po question_id in normalizirani vsebini vprašanja.
    answers = [
        {
            "question_id": "q_001",
            "question": " Razumem osnovne pojme. ",
            "answer": True,
        },
        {
            "question_id": "q_002",
            "question": "Poznam primere uporabe.",
            "answer": False,
        },
        "invalid-answer",
    ]

    result = service._build_answer_maps(answers)

    assert result["by_question_id"] == {
        "q_001": True,
        "q_002": False,
    }
    assert result["by_question_text"] == {
        "razumem osnovne pojme.": True,
        "poznam primere uporabe.": False,
    }


def test_get_answer_for_question_prefers_question_id(service):
    # Če je question_id prisoten, se odgovor najde po ID-ju.
    question = {
        "id": "q_001",
        "question": "Razumem osnovne pojme.",
    }
    answer_maps = {
        "by_question_id": {
            "q_001": True,
        },
        "by_question_text": {
            "razumem osnovne pojme.": False,
        },
    }

    result = service._get_answer_for_question(question, answer_maps)

    assert result is True


def test_get_answer_for_question_falls_back_to_question_text(service):
    # Če ID-ja ni v lookup-u, service poišče odgovor po normaliziranem besedilu.
    question = {
        "id": "q_missing",
        "question": "Razumem osnovne pojme.",
    }
    answer_maps = {
        "by_question_id": {},
        "by_question_text": {
            "razumem osnovne pojme.": True,
        },
    }

    result = service._get_answer_for_question(question, answer_maps)

    assert result is True


def test_get_answer_for_question_returns_none_when_not_found(service):
    # Če odgovora ni, service vrne None.
    question = {
        "id": "q_missing",
        "question": "Neznano vprašanje.",
    }
    answer_maps = {
        "by_question_id": {},
        "by_question_text": {},
    }

    result = service._get_answer_for_question(question, answer_maps)

    assert result is None


def test_get_topic_id_from_topic_returns_topic_id(service):
    # Topic ID se prebere iz content topic objekta.
    result = service._get_topic_id_from_topic(
        {
            "id": " topic_001 ",
        }
    )

    assert result == "topic_001"


def test_get_topic_id_from_topic_returns_none_for_invalid_topic(service):
    # Če topic ni dict ali nima ID-ja, service vrne None.
    assert service._get_topic_id_from_topic("invalid-topic") is None
    assert service._get_topic_id_from_topic({}) is None


def test_get_topic_competency_codes_returns_codes(service):
    # Kompetence se preberejo iz related_competency_codes.
    result = service._get_topic_competency_codes(
        {
            "related_competency_codes": [" 1.2 ", "", 123, "5.2"],
        }
    )

    assert result == ["1.2", "5.2"]


def test_get_all_topic_ids_returns_unique_topic_ids(service):
    # Service vrne vse veljavne topic ID-je brez podvajanja.
    topics = [
        {"id": "topic_001"},
        {"id": "topic_002"},
        {"id": "topic_001"},
        {},
        "invalid-topic",
    ]

    result = service._get_all_topic_ids(topics)

    assert result == ["topic_001", "topic_002"]


def test_get_all_topic_competency_codes_returns_unique_codes(service):
    # Service vrne vse kompetence iz content topicov brez podvajanja.
    topics = [
        {"related_competency_codes": ["1.2", "5.2"]},
        {"related_competency_codes": ["1.2", "3.1"]},
        "invalid-topic",
    ]

    result = service._get_all_topic_competency_codes(topics)

    assert result == ["1.2", "5.2", "3.1"]


@pytest.mark.asyncio
async def test_evaluate_learning_unit_marks_unit_completed_when_all_answers_true(
    service,
    learning_unit_service,
    learning_unit,
):
    # Če so vsi topic-i znani, je učna enota pokrita.
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_UNIT
    assert result["target_id"] == "ue_001"
    assert result["start_learning_unit_id"] is None
    assert result["skipped_learning_units"] == ["ue_001"]
    assert result["recommended_next_learning_units"] == []
    assert result["known_competency_codes"] == ["1.2", "5.2"]
    assert result["missing_competency_codes"] == []
    assert result["learning_unit_results"][0]["is_completed_by_assessment"] is True


@pytest.mark.asyncio
async def test_evaluate_learning_unit_recommends_unit_when_answer_false(
    service,
    learning_unit_service,
    learning_unit,
):
    # Če uporabniku manjka en topic, priporočimo to učno enoto.
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": False,
            },
        ],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_UNIT
    assert result["target_id"] == "ue_001"
    assert result["start_learning_unit_id"] == "ue_001"
    assert result["skipped_learning_units"] == []
    assert result["recommended_next_learning_units"] == ["ue_001"]
    assert result["known_competency_codes"] == ["1.2"]
    assert result["missing_competency_codes"] == ["5.2"]
    assert result["learning_unit_results"][0]["known_topic_ids"] == ["topic_001"]
    assert result["learning_unit_results"][0]["missing_topic_ids"] == ["topic_002"]
    assert result["learning_unit_results"][0]["is_completed_by_assessment"] is False


@pytest.mark.asyncio
async def test_evaluate_learning_unit_marks_unanswered_topics_as_missing(
    service,
    learning_unit_service,
    learning_unit,
):
    # Če za topic ni odgovora, se šteje kot manjkajoč.
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            }
        ],
    )

    assert result["known_competency_codes"] == ["1.2"]
    assert result["missing_competency_codes"] == ["5.2"]
    assert result["learning_unit_results"][0]["known_topic_ids"] == ["topic_001"]
    assert result["learning_unit_results"][0]["missing_topic_ids"] == ["topic_002"]


@pytest.mark.asyncio
async def test_evaluate_learning_unit_uses_question_text_when_question_id_differs(
    service,
    learning_unit_service,
    learning_unit,
):
    # Če question_id ne ustreza, se odgovor najde po normaliziranem besedilu vprašanja.
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "different_id",
                "question": "  razumem   osnovne pojme. ",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    assert result["learning_unit_results"][0]["is_completed_by_assessment"] is True
    assert result["missing_competency_codes"] == []


@pytest.mark.asyncio
async def test_evaluate_learning_unit_returns_empty_result_when_unit_missing(
    service,
    learning_unit_service,
):
    # Če učna enota ne obstaja, service vrne prazen assessment rezultat.
    learning_unit_service.get_learning_unit_by_id.return_value = None

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="missing_ue",
        answers=[],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_UNIT
    assert result["target_id"] == "missing_ue"
    assert result["learning_unit_results"] == []
    assert result["summary"] == "Učna enota ne obstaja."


@pytest.mark.asyncio
async def test_evaluate_module_marks_completed_when_required_units_completed(
    service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    # Modul je completed, če so vse required učne enote pokrite.
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }
    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "is_required": True,
            "prerequisites": [],
        }
    ]
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    assert result["target_type"] == QuestionnaireTargetType.MODULE
    assert result["target_id"] == "mod_001"
    assert result["skipped_modules"] == ["mod_001"]
    assert result["skipped_learning_units"] == ["ue_001"]
    assert result["module_results"][0]["status"] == AssessmentStatus.COMPLETED
    assert result["module_results"][0]["completed_learning_units"] == ["ue_001"]
    assert result["module_results"][0]["missing_learning_units"] == []


@pytest.mark.asyncio
async def test_evaluate_module_marks_partially_completed(
    service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    # Modul je partially_completed, če je vsaj ena učna enota pokrita, druga pa manjka.
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }
    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "is_required": True,
            "prerequisites": [],
        },
        {
            "learning_unit_id": "ue_002",
            "is_required": True,
            "prerequisites": ["ue_001"],
        },
    ]

    learning_unit_service.get_learning_unit_by_id.side_effect = [
        learning_unit,
        {
            **learning_unit,
            "_id": "ue_002",
            "self_assessment_questions": [
                {
                    "id": "q_003",
                    "question": "Znam nadaljevanje.",
                    "related_topic_id": "topic_003",
                    "related_competency_codes": ["3.1"],
                }
            ],
            "content_topics": [
                {
                    "id": "topic_003",
                    "title": "Nadaljevanje",
                    "related_competency_codes": ["3.1"],
                }
            ],
        },
    ]

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
            {
                "question_id": "q_003",
                "question": "Znam nadaljevanje.",
                "answer": False,
            },
        ],
    )

    assert result["module_results"][0]["status"] == AssessmentStatus.PARTIALLY_COMPLETED
    assert result["module_results"][0]["completed_learning_units"] == ["ue_001"]
    assert result["module_results"][0]["missing_learning_units"] == ["ue_002"]
    assert result["start_learning_unit_id"] == "ue_002"
    assert result["recommended_next_learning_units"] == ["ue_002"]


@pytest.mark.asyncio
async def test_evaluate_module_marks_not_started(
    service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    # Modul je not_started, če ni pokrita nobena učna enota.
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }
    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "is_required": True,
            "prerequisites": [],
        }
    ]
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": False,
            }
        ],
    )

    assert result["module_results"][0]["status"] == AssessmentStatus.NOT_STARTED
    assert result["start_learning_unit_id"] == "ue_001"
    assert result["recommended_next_learning_units"] == ["ue_001"]
    assert result["skipped_modules"] == []


@pytest.mark.asyncio
async def test_evaluate_module_returns_empty_result_when_module_missing(
    service,
    module_service,
):
    # Če modul ne obstaja, service vrne prazen assessment rezultat.
    module_service.get_module_by_id.return_value = None

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="missing_mod",
        answers=[],
    )

    assert result["target_type"] == QuestionnaireTargetType.MODULE
    assert result["target_id"] == "missing_mod"
    assert result["module_results"] == []
    assert result["summary"] == "Modul ne obstaja."


@pytest.mark.asyncio
async def test_evaluate_learning_path_recommends_first_uncovered_module(
    service,
    learning_path_service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    # Learning path začne pri prvem modulu, ki ni pokrit in ima izpolnjene prerequisites.
    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "lp_001",
        "title": "Učna pot 1",
    }
    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_001",
            "prerequisites": [],
        }
    ]
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }
    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "is_required": True,
            "prerequisites": [],
        }
    ]
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="lp_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": False,
            }
        ],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_PATH
    assert result["target_id"] == "lp_001"
    assert result["start_module_id"] == "mod_001"
    assert result["start_learning_unit_id"] == "ue_001"
    assert result["recommended_next_modules"] == ["mod_001"]
    assert result["recommended_next_learning_units"] == ["ue_001"]


@pytest.mark.asyncio
async def test_evaluate_learning_path_skips_completed_module(
    service,
    learning_path_service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    # Če je modul pokrit, ga learning path preskoči.
    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "lp_001",
        "title": "Učna pot 1",
    }
    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_001",
            "prerequisites": [],
        }
    ]
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }
    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "is_required": True,
            "prerequisites": [],
        }
    ]
    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="lp_001",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    assert result["start_module_id"] is None
    assert result["start_learning_unit_id"] is None
    assert result["skipped_modules"] == ["mod_001"]
    assert result["skipped_learning_units"] == ["ue_001"]
    assert result["summary"] == "Uporabnik je glede na odgovore pokril vse korake v učni poti."


@pytest.mark.asyncio
async def test_evaluate_learning_path_returns_empty_result_when_path_missing(
    service,
    learning_path_service,
):
    # Če učna pot ne obstaja, service vrne prazen assessment rezultat.
    learning_path_service.get_learning_path_by_id.return_value = None

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="missing_lp",
        answers=[],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_PATH
    assert result["target_id"] == "missing_lp"
    assert result["learning_unit_results"] == []
    assert result["module_results"] == []
    assert result["summary"] == "Učna pot ne obstaja."


def test_empty_result_returns_stable_structure(service):
    # Prazen rezultat ima stabilno strukturo za response model.
    result = service._empty_result(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        summary="Test summary.",
    )

    assert result == {
        "user_id": "user_001",
        "target_type": QuestionnaireTargetType.MODULE,
        "target_id": "mod_001",
        "start_module_id": None,
        "start_learning_unit_id": None,
        "skipped_modules": [],
        "skipped_learning_units": [],
        "recommended_next_modules": [],
        "recommended_next_learning_units": [],
        "known_competency_codes": [],
        "missing_competency_codes": [],
        "learning_unit_results": [],
        "module_results": [],
        "summary": "Test summary.",
    }

@pytest.fixture
def second_learning_unit():
    """
    Druga testna učna enota.

    Uporabimo jo pri testih, kjer modul ali učna pot vsebuje več učnih enot.
    """

    return {
        "_id": "ue_002",
        "title": "Nadaljevanje",
        "content_topics": [
            {
                "id": "topic_003",
                "title": "Nadaljevanje",
                "related_competency_codes": ["3.1"],
            }
        ],
        "self_assessment_questions": [
            {
                "id": "q_003",
                "question": "Znam nadaljevanje.",
                "related_topic_id": "topic_003",
                "related_competency_codes": ["3.1"],
            }
        ],
    }


@pytest.fixture
def third_learning_unit():
    """
    Tretja testna učna enota.

    Uporabimo jo za parallel_group scenarij v modulu.
    """

    return {
        "_id": "ue_003",
        "title": "Vzporedna učna enota A",
        "content_topics": [
            {
                "id": "topic_004",
                "title": "Vzporedna vsebina A",
                "related_competency_codes": ["4.1"],
            }
        ],
        "self_assessment_questions": [
            {
                "id": "q_004",
                "question": "Znam vzporedno vsebino A.",
                "related_topic_id": "topic_004",
                "related_competency_codes": ["4.1"],
            }
        ],
    }


@pytest.fixture
def fourth_learning_unit():
    """
    Četrta testna učna enota.

    Uporabimo jo kot drugo učno enoto v isti parallel_group.
    """

    return {
        "_id": "ue_004",
        "title": "Vzporedna učna enota B",
        "content_topics": [
            {
                "id": "topic_005",
                "title": "Vzporedna vsebina B",
                "related_competency_codes": ["4.2"],
            }
        ],
        "self_assessment_questions": [
            {
                "id": "q_005",
                "question": "Znam vzporedno vsebino B.",
                "related_topic_id": "topic_005",
                "related_competency_codes": ["4.2"],
            }
        ],
    }


#Modul s parallel_group
@pytest.mark.asyncio
async def test_evaluate_module_with_parallel_units_keeps_completed_parallel_unit(
    service,
    module_service,
    learning_unit_service,
    learning_unit,
    second_learning_unit,
    third_learning_unit,
    fourth_learning_unit,
):
    """
    Modul vsebuje dve vzporedni učni enoti:
    - ue_003 manjka,
    - ue_004 je pokrita.

    Pričakovanje:
    - ue_004 je v skipped_learning_units,
    - ue_003 je v missing_learning_units,
    - modul je partially_completed,
    - priporočena naslednja učna enota je ue_003.
    """

    module_service.get_module_by_id.return_value = {
        "_id": "mod_002",
        "title": "Modul z vzporednimi učnimi enotami",
    }

    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "learning_unit_id": "ue_002",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": ["ue_001"],
        },
        {
            "learning_unit_id": "ue_003",
            "order": 3,
            "parallel_group": "parallel_A",
            "is_required": True,
            "prerequisites": ["ue_001", "ue_002"],
        },
        {
            "learning_unit_id": "ue_004",
            "order": 3,
            "parallel_group": "parallel_A",
            "is_required": True,
            "prerequisites": ["ue_001", "ue_002"],
        },
    ]

    learning_unit_service.get_learning_unit_by_id.side_effect = [
        learning_unit,
        second_learning_unit,
        third_learning_unit,
        fourth_learning_unit,
    ]

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_002",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
            {
                "question_id": "q_003",
                "question": "Znam nadaljevanje.",
                "answer": True,
            },
            {
                "question_id": "q_004",
                "question": "Znam vzporedno vsebino A.",
                "answer": False,
            },
            {
                "question_id": "q_005",
                "question": "Znam vzporedno vsebino B.",
                "answer": True,
            },
        ],
    )

    assert result["module_results"][0]["status"] == AssessmentStatus.PARTIALLY_COMPLETED

    assert result["module_results"][0]["completed_learning_units"] == [
        "ue_001",
        "ue_002",
        "ue_004",
    ]

    assert result["module_results"][0]["missing_learning_units"] == ["ue_003"]

    assert result["skipped_learning_units"] == [
        "ue_001",
        "ue_002",
        "ue_004",
    ]

    assert result["start_learning_unit_id"] == "ue_003"
    assert result["recommended_next_learning_units"] == ["ue_003"]

#Learning path z neposredno učno enoto kot step
@pytest.mark.asyncio
async def test_evaluate_learning_path_supports_direct_learning_unit_step(
    service,
    learning_path_service,
    learning_unit_service,
    learning_unit,
):
    """
    Učna pot vsebuje neposredno učno enoto kot step.

    Če uporabnik te učne enote ne zna, jo service priporoči kot začetno točko.
    """

    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "up_004",
        "title": "Mešana učna pot",
    }

    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]

    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_004",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": False,
            }
        ],
    )

    assert result["target_type"] == QuestionnaireTargetType.LEARNING_PATH
    assert result["target_id"] == "up_004"

    assert result["start_module_id"] is None
    assert result["start_learning_unit_id"] == "ue_001"

    assert result["recommended_next_modules"] == []
    assert result["recommended_next_learning_units"] == ["ue_001"]

    assert result["skipped_learning_units"] == []
    assert result["summary"] == "Uporabnik naj začne pri učni enoti ue_001."

#Learning path preskoči direct learning_unit, če je pokrita
@pytest.mark.asyncio
async def test_evaluate_learning_path_skips_completed_direct_learning_unit_step(
    service,
    learning_path_service,
    learning_unit_service,
    learning_unit,
):
    """
    Če je direct learning_unit step pokrit,
    ga learning path preskoči.
    """

    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "up_004",
        "title": "Mešana učna pot",
    }

    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]

    learning_unit_service.get_learning_unit_by_id.return_value = learning_unit

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_004",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    assert result["start_module_id"] is None
    assert result["start_learning_unit_id"] is None

    assert result["skipped_learning_units"] == ["ue_001"]
    assert result["recommended_next_learning_units"] == []

    assert result["summary"] == "Uporabnik je glede na odgovore pokril vse korake v učni poti."

#Learning path: direct learning_unit + naslednji modul
@pytest.mark.asyncio
async def test_evaluate_learning_path_moves_from_direct_unit_to_next_module(
    service,
    learning_path_service,
    module_service,
    learning_unit_service,
    learning_unit,
    second_learning_unit,
):
    """
    Učna pot ima:
    - direct learning_unit step ue_001,
    - nato module step mod_001.

    Če je ue_001 pokrita, mod_001 pa še ne,
    mora service priporočiti mod_001 in prvo manjkajočo učno enoto v njem.
    """

    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "up_004",
        "title": "Mešana učna pot",
    }

    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": ["ue_001"],
        },
    ]

    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }

    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_002",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]

    learning_unit_service.get_learning_unit_by_id.side_effect = [
        learning_unit,
        second_learning_unit,
    ]

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_004",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
            {
                "question_id": "q_003",
                "question": "Znam nadaljevanje.",
                "answer": False,
            },
        ],
    )

    assert result["skipped_learning_units"] == ["ue_001"]

    assert result["start_module_id"] == "mod_001"
    assert result["start_learning_unit_id"] == "ue_002"

    assert result["recommended_next_modules"] == ["mod_001"]
    assert result["recommended_next_learning_units"] == ["ue_002"]

#Deduplikacija learning_unit_results
@pytest.mark.asyncio
async def test_evaluate_learning_path_deduplicates_learning_unit_results(
    service,
    learning_path_service,
    module_service,
    learning_unit_service,
    learning_unit,
):
    """
    Ista učna enota se pojavi:
    - kot direct learning_unit step,
    - in znotraj modula.

    V learning_unit_results mora biti samo en rezultat za ue_001.
    """

    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "up_duplicate",
        "title": "Učna pot s podvojeno učno enoto",
    }

    learning_path_service.get_step_references_for_learning_path.return_value = [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": ["ue_001"],
        },
    ]

    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
    }

    module_service.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]

    learning_unit_service.get_learning_unit_by_id.side_effect = [
        learning_unit,
        learning_unit,
    ]

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_duplicate",
        answers=[
            {
                "question_id": "q_001",
                "question": "Razumem osnovne pojme.",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "question": "Poznam primere uporabe.",
                "answer": True,
            },
        ],
    )

    learning_unit_result_ids = [
        unit_result["learning_unit_id"]
        for unit_result in result["learning_unit_results"]
    ]

    assert learning_unit_result_ids.count("ue_001") == 1
