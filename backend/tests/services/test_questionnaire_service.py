import pytest
from unittest.mock import AsyncMock

from app.schemas.questionnaire_schema import QuestionnaireTargetType
from app.services.questionnaires.questionnaire_service import QuestionnaireService


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
    return QuestionnaireService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


def test_normalize_question_text_normalizes_spaces_and_case(service):
    # Besedilo vprašanja se normalizira za deduplikacijo.
    result = service._normalize_question_text("  Znam   uporabljati   Excel.  ")

    assert result == "znam uporabljati excel."


def test_normalize_question_text_returns_empty_string_for_invalid_value(service):
    # Če question ni string, normalizacija vrne prazen string.
    result = service._normalize_question_text(None)

    assert result == ""


def test_get_string_value_returns_trimmed_string(service):
    # Service vrne očiščen string.
    result = service._get_string_value("  Vprašanje  ")

    assert result == "Vprašanje"


def test_get_string_value_returns_fallback_for_invalid_value(service):
    # Če vrednost ni string, service vrne fallback.
    result = service._get_string_value(None, fallback="fallback")

    assert result == "fallback"


def test_get_optional_string_value_returns_trimmed_string(service):
    # Optional string se očisti.
    result = service._get_optional_string_value("  mod_001  ")

    assert result == "mod_001"


def test_get_optional_string_value_returns_none_for_empty_or_invalid_value(service):
    # Prazen ali neveljaven optional string postane None.
    assert service._get_optional_string_value("") is None
    assert service._get_optional_string_value(None) is None
    assert service._get_optional_string_value(123) is None


def test_get_optional_int_value_returns_int(service):
    # Optional int se ohrani, če je vrednost integer.
    result = service._get_optional_int_value(3)

    assert result == 3


def test_get_optional_int_value_returns_none_for_invalid_value(service):
    # Neveljavna optional int vrednost postane None.
    assert service._get_optional_int_value("3") is None
    assert service._get_optional_int_value(None) is None


def test_get_bool_value_returns_bool(service):
    # Boolean vrednost se ohrani.
    assert service._get_bool_value(False) is False
    assert service._get_bool_value(True) is True


def test_get_bool_value_returns_fallback_for_invalid_value(service):
    # Če vrednost ni boolean, service vrne fallback.
    assert service._get_bool_value("yes") is True
    assert service._get_bool_value(None, fallback=False) is False


def test_get_string_list_value_returns_only_non_empty_strings(service):
    # Seznam kompetenc se očisti in neveljavne vrednosti se odstranijo.
    result = service._get_string_list_value([" 1.2 ", "", 123, "5.2", None])

    assert result == ["1.2", "5.2"]


def test_get_string_list_value_returns_empty_list_for_invalid_value(service):
    # Če vrednost ni list, service vrne prazen seznam.
    result = service._get_string_list_value("1.2,5.2")

    assert result == []


def test_build_question_source_returns_source_structure(service):
    # Source hrani povezave na path/module/unit/topic/competencies in navigacijske metapodatke.
    question = {
        "learning_path_id": " lp_001 ",
        "module_id": " mod_001 ",
        "learning_unit_id": " ue_001 ",
        "related_topic_id": " topic_001 ",
        "related_topic": " Osnovni pojmi ",
        "related_competency_codes": [" 1.2 ", "", 123, "5.2"],
    }

    result = service._build_question_source(question)

    assert result == {
        "learning_path_id": "lp_001",
        "module_id": "mod_001",
        "learning_unit_id": "ue_001",
        "topic_id": "topic_001",
        "related_topic": "Osnovni pojmi",
        "competency_codes": ["1.2", "5.2"],
        "order": None,
        "parallel_group": None,
        "is_required": True,
        "prerequisites": [],
    }


def test_build_question_source_keeps_navigation_metadata(service):
    # Source ohrani order, parallel_group, is_required in prerequisites.
    question = {
        "learning_path_id": "up_004",
        "module_id": "mod_005",
        "learning_unit_id": "ue_010",
        "related_topic_id": "topic_001",
        "related_topic": "Tema",
        "related_competency_codes": ["1.3"],
        "order": 3,
        "parallel_group": "mixed_parallel_group",
        "is_required": False,
        "prerequisites": ["ue_001", "mod_003"],
    }

    result = service._build_question_source(question)

    assert result["order"] == 3
    assert result["parallel_group"] == "mixed_parallel_group"
    assert result["is_required"] is False
    assert result["prerequisites"] == ["ue_001", "mod_003"]


def test_normalize_question_returns_valid_question_with_source(service):
    # Vprašanje se normalizira v response obliko in dobi sources.
    question = {
        "id": " q_001 ",
        "question": " Razumem osnovni koncept umetne inteligence. ",
        "type": " yes_no ",
        "learning_path_id": "lp_001",
        "module_id": "mod_001",
        "learning_unit_id": "ue_001",
        "related_topic": "Osnovni pojmi",
        "related_topic_id": "topic_001",
        "related_competency_codes": ["1.2"],
    }

    result = service._normalize_question(question)

    assert result == {
        "id": "q_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "type": "yes_no",
        "learning_path_id": "lp_001",
        "module_id": "mod_001",
        "learning_unit_id": "ue_001",
        "order": None,
        "parallel_group": None,
        "is_required": True,
        "prerequisites": [],
        "related_topic": "Osnovni pojmi",
        "related_topic_id": "topic_001",
        "related_competency_codes": ["1.2"],
        "sources": [
            {
                "learning_path_id": "lp_001",
                "module_id": "mod_001",
                "learning_unit_id": "ue_001",
                "topic_id": "topic_001",
                "related_topic": "Osnovni pojmi",
                "competency_codes": ["1.2"],
                "order": None,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    }


def test_normalize_question_keeps_navigation_metadata(service):
    # _normalize_question ohrani parallel_group in ostale navigacijske metapodatke.
    question = {
        "id": "q_001",
        "question": "Razumem vsebino.",
        "type": "yes_no",
        "learning_path_id": "up_004",
        "module_id": "mod_005",
        "learning_unit_id": "ue_010",
        "order": 3,
        "parallel_group": "mixed_parallel_group",
        "is_required": False,
        "prerequisites": ["ue_001", "mod_003"],
        "related_topic": "Tema",
        "related_topic_id": "topic_001",
        "related_competency_codes": ["1.3"],
    }

    result = service._normalize_question(question)

    assert result is not None
    assert result["order"] == 3
    assert result["parallel_group"] == "mixed_parallel_group"
    assert result["is_required"] is False
    assert result["prerequisites"] == ["ue_001", "mod_003"]

    assert result["sources"][0]["order"] == 3
    assert result["sources"][0]["parallel_group"] == "mixed_parallel_group"
    assert result["sources"][0]["is_required"] is False
    assert result["sources"][0]["prerequisites"] == ["ue_001", "mod_003"]


def test_normalize_question_uses_default_navigation_metadata(service):
    # Neveljavne navigacijske vrednosti dobijo varne default vrednosti.
    question = {
        "id": "q_001",
        "question": "Razumem vsebino.",
        "order": "not-number",
        "parallel_group": "",
        "is_required": "yes",
        "prerequisites": "ue_001",
    }

    result = service._normalize_question(question)

    assert result is not None
    assert result["order"] is None
    assert result["parallel_group"] is None
    assert result["is_required"] is True
    assert result["prerequisites"] == []

    assert result["sources"][0]["order"] is None
    assert result["sources"][0]["parallel_group"] is None
    assert result["sources"][0]["is_required"] is True
    assert result["sources"][0]["prerequisites"] == []


def test_normalize_question_uses_default_type(service):
    # Če type ni podan, se uporabi yes_no.
    question = {
        "id": "q_001",
        "question": "Razumem vsebino.",
    }

    result = service._normalize_question(question)

    assert result is not None
    assert result["type"] == "yes_no"


def test_normalize_question_skips_invalid_question(service):
    # Ne-dict vprašanje se preskoči.
    result = service._normalize_question("invalid-question")

    assert result is None


def test_normalize_question_skips_question_without_id(service):
    # Vprašanje brez ID-ja se preskoči.
    result = service._normalize_question(
        {
            "question": "Razumem vsebino.",
        }
    )

    assert result is None


def test_normalize_question_skips_question_without_text(service):
    # Vprašanje brez besedila se preskoči.
    result = service._normalize_question(
        {
            "id": "q_001",
        }
    )

    assert result is None


def test_merge_question_sources_adds_duplicate_sources(service):
    # Pri podvojenem vprašanju se sources združijo.
    existing_question = {
        "id": "q_001",
        "question": "Razumem vsebino.",
        "sources": [
            {
                "learning_unit_id": "ue_001",
                "topic_id": "topic_001",
                "competency_codes": ["1.2"],
            }
        ],
    }
    duplicate_question = {
        "id": "q_002",
        "question": "Razumem vsebino.",
        "sources": [
            {
                "learning_unit_id": "ue_002",
                "topic_id": "topic_002",
                "competency_codes": ["5.2"],
            }
        ],
    }

    result = service._merge_question_sources(
        existing_question=existing_question,
        duplicate_question=duplicate_question,
    )

    assert len(result["sources"]) == 2
    assert result["sources"][0]["learning_unit_id"] == "ue_001"
    assert result["sources"][1]["learning_unit_id"] == "ue_002"


def test_deduplicate_questions_with_sources_merges_duplicate_question_text(service):
    # Isto vprašanje z različnimi presledki/case se prikaže enkrat, sources pa se združijo.
    questions = [
        {
            "id": "q_001",
            "question": "Razumem vsebino.",
            "sources": [
                {
                    "learning_unit_id": "ue_001",
                    "topic_id": "topic_001",
                    "competency_codes": ["1.2"],
                }
            ],
        },
        {
            "id": "q_002",
            "question": "  razumem   vsebino. ",
            "sources": [
                {
                    "learning_unit_id": "ue_002",
                    "topic_id": "topic_002",
                    "competency_codes": ["5.2"],
                }
            ],
        },
    ]

    result = service._deduplicate_questions_with_sources(questions)

    assert len(result) == 1
    assert result[0]["id"] == "q_001"
    assert len(result[0]["sources"]) == 2


def test_normalize_questions_skips_invalid_and_deduplicates(service):
    # Najprej se odstranijo neveljavna vprašanja, nato se podvojena združijo.
    questions = [
        {
            "id": "q_001",
            "question": "Razumem vsebino.",
            "learning_unit_id": "ue_001",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        },
        {
            "id": "q_002",
            "question": " razumem vsebino. ",
            "learning_unit_id": "ue_002",
            "related_topic_id": "topic_002",
            "related_competency_codes": ["5.2"],
        },
        {
            "id": "",
            "question": "Neveljavno vprašanje.",
        },
        "invalid-item",
    ]

    result = service._normalize_questions(questions)

    assert len(result) == 1
    assert result[0]["question"] == "Razumem vsebino."
    assert len(result[0]["sources"]) == 2
    assert result[0]["sources"][0]["learning_unit_id"] == "ue_001"
    assert result[0]["sources"][1]["learning_unit_id"] == "ue_002"


@pytest.mark.asyncio
async def test_generate_questionnaire_for_learning_path_returns_questionnaire(
    service,
    learning_path_service,
):
    # Service ustvari vprašalnik za učno pot.
    learning_path_service.get_learning_path_by_id.return_value = {
        "_id": "lp_001",
        "title": "Učna pot UI",
    }
    learning_path_service.get_self_assessment_questions_for_learning_path.return_value = [
        {
            "id": "q_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "learning_path_id": "lp_001",
            "module_id": "mod_001",
            "learning_unit_id": "ue_001",
            "related_topic": "Osnovni pojmi",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
            "order": 2,
            "parallel_group": "group_A",
            "is_required": True,
            "prerequisites": ["ue_000"],
        }
    ]

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="lp_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.LEARNING_PATH
    assert result["target_id"] == "lp_001"
    assert result["title"] == "Učna pot UI"
    assert len(result["questions"]) == 1
    assert result["questions"][0]["id"] == "q_001"
    assert result["questions"][0]["order"] == 2
    assert result["questions"][0]["parallel_group"] == "group_A"
    assert result["questions"][0]["is_required"] is True
    assert result["questions"][0]["prerequisites"] == ["ue_000"]

    learning_path_service.get_learning_path_by_id.assert_awaited_once_with("lp_001")
    learning_path_service.get_self_assessment_questions_for_learning_path.assert_awaited_once_with(
        "lp_001"
    )


@pytest.mark.asyncio
async def test_generate_questionnaire_for_learning_path_returns_none_when_missing(
    service,
    learning_path_service,
):
    # Če učna pot ne obstaja, service vrne None.
    learning_path_service.get_learning_path_by_id.return_value = None

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="missing_lp",
    )

    assert result is None
    learning_path_service.get_self_assessment_questions_for_learning_path.assert_not_called()


@pytest.mark.asyncio
async def test_generate_questionnaire_for_module_returns_questionnaire(
    service,
    module_service,
):
    # Service ustvari vprašalnik za modul.
    module_service.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Razumevanje umetne inteligence",
    }
    module_service.get_self_assessment_questions_for_module.return_value = [
        {
            "id": "q_001",
            "question": "Razumem vsebino modula.",
            "module_id": "mod_001",
            "learning_unit_id": "ue_001",
            "related_topic": "Tema",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
            "order": 3,
            "parallel_group": "skupina_A",
            "is_required": False,
            "prerequisites": ["ue_000"],
        }
    ]

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.MODULE
    assert result["target_id"] == "mod_001"
    assert result["title"] == "Razumevanje umetne inteligence"
    assert len(result["questions"]) == 1
    assert result["questions"][0]["order"] == 3
    assert result["questions"][0]["parallel_group"] == "skupina_A"
    assert result["questions"][0]["is_required"] is False
    assert result["questions"][0]["prerequisites"] == ["ue_000"]

    module_service.get_module_by_id.assert_awaited_once_with("mod_001")
    module_service.get_self_assessment_questions_for_module.assert_awaited_once_with(
        "mod_001"
    )


@pytest.mark.asyncio
async def test_generate_questionnaire_for_module_returns_none_when_missing(
    service,
    module_service,
):
    # Če modul ne obstaja, service vrne None.
    module_service.get_module_by_id.return_value = None

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="missing_mod",
    )

    assert result is None
    module_service.get_self_assessment_questions_for_module.assert_not_called()


@pytest.mark.asyncio
async def test_generate_questionnaire_for_learning_unit_returns_questionnaire(
    service,
    learning_unit_service,
):
    # Service ustvari vprašalnik za eno učno enoto.
    learning_unit_service.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": "Osnovni pojmi umetne inteligence",
    }
    learning_unit_service.get_self_assessment_questions.return_value = [
        {
            "id": "q_001",
            "question": "Razumem vsebino učne enote.",
            "learning_unit_id": "ue_001",
            "related_topic": "Tema",
            "related_topic_id": "topic_001",
            "related_competency_codes": ["1.2"],
        }
    ]

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.LEARNING_UNIT
    assert result["target_id"] == "ue_001"
    assert result["title"] == "Osnovni pojmi umetne inteligence"
    assert len(result["questions"]) == 1
    assert result["questions"][0]["order"] is None
    assert result["questions"][0]["parallel_group"] is None
    assert result["questions"][0]["is_required"] is True
    assert result["questions"][0]["prerequisites"] == []

    learning_unit_service.get_learning_unit_by_id.assert_awaited_once_with("ue_001")
    learning_unit_service.get_self_assessment_questions.assert_awaited_once_with(
        "ue_001"
    )


@pytest.mark.asyncio
async def test_generate_questionnaire_for_learning_unit_returns_none_when_missing(
    service,
    learning_unit_service,
):
    # Če učna enota ne obstaja, service vrne None.
    learning_unit_service.get_learning_unit_by_id.return_value = None

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="missing_ue",
    )

    assert result is None
    learning_unit_service.get_self_assessment_questions.assert_not_called()