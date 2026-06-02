import pytest
from unittest.mock import AsyncMock

from app.services.learning_units.learning_unit_service import LearningUnitService


# Mock repository-ja za učne enote.
# Tako testiramo service logiko brez povezave z MongoDB.
@pytest.fixture
def learning_unit_repository():
    return AsyncMock()


# Mock repository-ja za module.
# Uporablja se pri recommended_modules na detail strani učne enote.
@pytest.fixture
def module_repository():
    return AsyncMock()


# Glavni fixture za LearningUnitService.
# Vsak test dobi svežo instanco service-a z mock dependency-ji.
@pytest.fixture
def service(
    learning_unit_repository,
    module_repository,
):
    return LearningUnitService(
        learning_unit_repository=learning_unit_repository,
        module_repository=module_repository,
    )


def test_normalize_content_topic_accepts_valid_topic(service):
    # Arrange: pripravimo veljaven content topic.
    topic = {
        "id": " topic_ue_001_001 ",
        "title": " Razumevanje pojma umetna inteligenca ",
        "related_competency_codes": [" 1.2 ", "", 123, "5.2"],
    }

    # Act: normaliziramo content topic.
    result = service._normalize_content_topic(
        topic=topic,
        learning_unit_id="ue_001",
        index=0,
    )

    # Assert: topic je očiščen in ima stabilno strukturo.
    assert result == {
        "id": "topic_ue_001_001",
        "title": "Razumevanje pojma umetna inteligenca",
        "related_competency_codes": ["1.2", "5.2"],
    }


def test_normalize_content_topic_generates_id_when_missing(service):
    # Arrange: topic nima ID-ja, ima pa naslov.
    topic = {
        "title": "Razumevanje pojma umetna inteligenca",
        "related_competency_codes": ["1.2"],
    }

    # Act: service generira stabilen topic ID.
    result = service._normalize_content_topic(
        topic=topic,
        learning_unit_id="ue_001",
        index=0,
    )

    # Assert: ID je generiran iz learning_unit_id in indexa.
    assert result == {
        "id": "topic_ue_001_001",
        "title": "Razumevanje pojma umetna inteligenca",
        "related_competency_codes": ["1.2"],
    }


def test_normalize_content_topic_supports_old_string_format(service):
    # Arrange: začasno podpremo staro obliko content topic kot string.
    topic = " Stara tema kot string "

    # Act: normaliziramo staro obliko.
    result = service._normalize_content_topic(
        topic=topic,
        learning_unit_id="ue_001",
        index=1,
    )

    # Assert: string se pretvori v novo topic strukturo.
    assert result == {
        "id": "topic_ue_001_002",
        "title": "Stara tema kot string",
        "related_competency_codes": [],
    }


def test_normalize_content_topic_skips_invalid_topic(service):
    # Arrange: topic ni dict ali veljaven string.
    topic = 123

    # Act: poskusimo normalizirati neveljaven topic.
    result = service._normalize_content_topic(
        topic=topic,
        learning_unit_id="ue_001",
        index=0,
    )

    # Assert: neveljaven topic se preskoči.
    assert result is None


def test_normalize_content_topic_skips_topic_without_title(service):
    # Arrange: topic nima veljavnega title.
    topic = {
        "id": "topic_ue_001_001",
        "title": "",
    }

    # Act: poskusimo normalizirati topic brez naslova.
    result = service._normalize_content_topic(
        topic=topic,
        learning_unit_id="ue_001",
        index=0,
    )

    # Assert: topic brez naslova se preskoči.
    assert result is None


def test_normalize_content_topics_skips_invalid_items(service):
    # Arrange: seznam vsebuje veljavne in neveljavne content topic-e.
    topics = [
        {
            "id": "topic_ue_001_001",
            "title": "Prva tema",
            "related_competency_codes": ["1.2"],
        },
        "Druga tema",
        {
            "id": "topic_invalid",
            "title": "",
        },
        123,
    ]

    # Act: normaliziramo seznam topicov.
    result = service._normalize_content_topics(
        topics=topics,
        learning_unit_id="ue_001",
    )

    # Assert: v rezultatu ostanejo samo veljavni topic-i.
    assert result == [
        {
            "id": "topic_ue_001_001",
            "title": "Prva tema",
            "related_competency_codes": ["1.2"],
        },
        {
            "id": "topic_ue_001_002",
            "title": "Druga tema",
            "related_competency_codes": [],
        },
    ]


def test_build_topic_lookup_uses_topic_id_and_title(service):
    # Arrange: pripravimo normalizirane content topic-e.
    content_topics = [
        {
            "id": "topic_ue_001_001",
            "title": "Razumevanje pojma umetna inteligenca",
            "related_competency_codes": ["1.2"],
        }
    ]

    # Act: zgradimo lookup.
    result = service._build_topic_lookup(content_topics)

    # Assert: topic je dostopen po ID-ju in po naslovu.
    assert result["topic_ue_001_001"] == content_topics[0]
    assert result["Razumevanje pojma umetna inteligenca"] == content_topics[0]


def test_normalize_self_assessment_question_accepts_valid_question(service):
    # Arrange: vprašanje že ima topic id, topic title in competency codes.
    topic_lookup = {
        "topic_ue_001_001": {
            "id": "topic_ue_001_001",
            "title": "Razumevanje pojma umetna inteligenca",
            "related_competency_codes": ["1.2"],
        }
    }

    question = {
        "id": " q_ue_001_001 ",
        "question": " Razumem osnovni koncept umetne inteligence. ",
        "type": " yes_no ",
        "related_topic": " Razumevanje pojma umetna inteligenca ",
        "related_topic_id": " topic_ue_001_001 ",
        "related_competency_codes": [" 1.2 ", "", 123],
    }

    # Act: normaliziramo vprašanje.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup=topic_lookup,
    )

    # Assert: vprašanje je očiščeno in vsebuje learning_unit_id.
    assert result == {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "type": "yes_no",
        "learning_unit_id": "ue_001",
        "related_topic": "Razumevanje pojma umetna inteligenca",
        "related_topic_id": "topic_ue_001_001",
        "related_competency_codes": ["1.2"],
    }


def test_normalize_self_assessment_question_fills_topic_data_from_lookup(service):
    # Arrange: vprašanje ima samo related_topic_id, competency codes pa dobi iz content topic-a.
    topic_lookup = {
        "topic_ue_001_001": {
            "id": "topic_ue_001_001",
            "title": "Razumevanje pojma umetna inteligenca",
            "related_competency_codes": ["1.2"],
        }
    }

    question = {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "related_topic_id": "topic_ue_001_001",
    }

    # Act: normaliziramo vprašanje.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup=topic_lookup,
    )

    # Assert: related_topic in related_competency_codes se dopolnita iz topic lookup-a.
    assert result == {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "type": "yes_no",
        "learning_unit_id": "ue_001",
        "related_topic": "Razumevanje pojma umetna inteligenca",
        "related_topic_id": "topic_ue_001_001",
        "related_competency_codes": ["1.2"],
    }


def test_normalize_self_assessment_question_fills_topic_id_from_title(service):
    # Arrange: vprašanje ima samo related_topic title.
    topic = {
        "id": "topic_ue_001_001",
        "title": "Razumevanje pojma umetna inteligenca",
        "related_competency_codes": ["1.2"],
    }
    topic_lookup = {
        "Razumevanje pojma umetna inteligenca": topic,
    }

    question = {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "related_topic": "Razumevanje pojma umetna inteligenca",
    }

    # Act: normaliziramo vprašanje.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup=topic_lookup,
    )

    # Assert: related_topic_id in competency codes se dopolnijo iz topic title-a.
    assert result == {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
        "type": "yes_no",
        "learning_unit_id": "ue_001",
        "related_topic": "Razumevanje pojma umetna inteligenca",
        "related_topic_id": "topic_ue_001_001",
        "related_competency_codes": ["1.2"],
    }


def test_normalize_self_assessment_question_uses_default_type(service):
    # Arrange: vprašanje nima type.
    question = {
        "id": "q_ue_001_001",
        "question": "Razumem osnovni koncept umetne inteligence.",
    }

    # Act: normaliziramo vprašanje.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup={},
    )

    # Assert: privzeti tip vprašanja je yes_no.
    assert result["type"] == "yes_no"


def test_normalize_self_assessment_question_skips_invalid_question(service):
    # Arrange: vprašanje ni dict.
    question = "invalid-question"

    # Act: poskusimo normalizirati neveljavno vprašanje.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup={},
    )

    # Assert: neveljavno vprašanje se preskoči.
    assert result is None


def test_normalize_self_assessment_question_skips_question_without_id(service):
    # Arrange: vprašanje nima ID-ja.
    question = {
        "question": "Razumem osnovni koncept umetne inteligence.",
    }

    # Act: poskusimo normalizirati vprašanje brez ID-ja.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup={},
    )

    # Assert: vprašanje brez ID-ja se preskoči.
    assert result is None


def test_normalize_self_assessment_question_skips_question_without_text(service):
    # Arrange: vprašanje nima besedila.
    question = {
        "id": "q_ue_001_001",
    }

    # Act: poskusimo normalizirati vprašanje brez besedila.
    result = service._normalize_self_assessment_question(
        question=question,
        learning_unit_id="ue_001",
        topic_lookup={},
    )

    # Assert: vprašanje brez besedila se preskoči.
    assert result is None


def test_normalize_learning_unit_normalizes_basic_fields_topics_and_questions(service):
    # Arrange: učna enota vsebuje nečiste vrednosti in povezavo vprašanja na topic.
    learning_unit = {
        "_id": "ue_001",
        "title": " Osnovni pojmi umetne inteligence ",
        "short_description": None,
        "duration_hours": 0.5,
        "keywords": [" UI ", "", 123, "umetna inteligenca"],
        "content_topics": [
            {
                "id": "topic_ue_001_001",
                "title": " Razumevanje pojma umetna inteligenca ",
                "related_competency_codes": [" 1.2 "],
            }
        ],
        "acquired_competencies": [" Kompetenca 1 ", "", 123],
        "digcomp_competencies": [
            {
                "code": "1.2",
                "title": "Kompetenca",
                "description": "Opis",
            }
        ],
        "prerequisites": [" Predpogoj ", "", 123],
        "self_assessment_questions": [
            {
                "id": "q_ue_001_001",
                "question": " Razumem osnovni koncept umetne inteligence. ",
                "related_topic_id": "topic_ue_001_001",
            },
            "invalid-question",
        ],
    }

    # Act: normaliziramo učno enoto.
    result = service._normalize_learning_unit(learning_unit)

    # Assert: learning unit ima stabilno API strukturo.
    assert result["_id"] == "ue_001"
    assert result["title"] == "Osnovni pojmi umetne inteligence"
    assert result["short_description"] == ""
    assert result["keywords"] == ["UI", "umetna inteligenca"]
    assert result["content_topics"] == [
        {
            "id": "topic_ue_001_001",
            "title": "Razumevanje pojma umetna inteligenca",
            "related_competency_codes": ["1.2"],
        }
    ]
    assert result["acquired_competencies"] == ["Kompetenca 1"]
    assert result["digcomp_competencies"] == [
        {
            "code": "1.2",
            "title": "Kompetenca",
            "description": "Opis",
        }
    ]
    assert result["prerequisites"] == ["Predpogoj"]
    assert result["self_assessment_questions"] == [
        {
            "id": "q_ue_001_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic": "Razumevanje pojma umetna inteligenca",
            "related_topic_id": "topic_ue_001_001",
            "related_competency_codes": ["1.2"],
        }
    ]


def test_normalize_recommended_module_returns_short_module(service):
    # Arrange: pripravimo modul z dodatnimi polji, ki jih detail učne enote ne potrebuje.
    module = {
        "_id": " mod_001 ",
        "title": " Razumevanje umetne inteligence ",
        "short_description": " Opis modula. ",
        "duration_hours": 1.75,
        "keywords": [" UI ", "", 123],
        "domains": [" Umetna inteligenca ", None],
        "learning_units": [],
    }

    # Act: normaliziramo priporočeni modul.
    result = service._normalize_recommended_module(module)

    # Assert: rezultat vsebuje samo kratek prikaz modula.
    assert result == {
        "_id": "mod_001",
        "title": "Razumevanje umetne inteligence",
        "short_description": "Opis modula.",
        "duration_hours": 1.75,
        "keywords": ["UI"],
        "domains": ["Umetna inteligenca"],
    }


@pytest.mark.asyncio
async def test_get_all_learning_units_returns_normalized_learning_units(
    service,
    learning_unit_repository,
):
    # Arrange: repository vrne eno veljavno učno enoto in en neveljaven element.
    learning_unit_repository.get_all_learning_units.return_value = [
        {
            "_id": "ue_001",
            "title": " Učna enota 1 ",
            "short_description": None,
            "keywords": [" test "],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        },
        "invalid-item",
    ]

    # Act: service pridobi vse učne enote.
    result = await service.get_all_learning_units()

    # Assert: service vrne samo normalizirane učne enote.
    assert result == [
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
            "short_description": "",
            "keywords": ["test"],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        }
    ]

    learning_unit_repository.get_all_learning_units.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_learning_unit_by_id_returns_none_when_not_found(
    service,
    learning_unit_repository,
):
    # Arrange: repository ne najde učne enote.
    learning_unit_repository.get_learning_unit_by_id.return_value = None

    # Act: poskusimo pridobiti neobstoječo učno enoto.
    result = await service.get_learning_unit_by_id("missing_id")

    # Assert: service vrne None, ker učna enota ne obstaja.
    assert result is None
    learning_unit_repository.get_learning_unit_by_id.assert_awaited_once_with(
        "missing_id"
    )


@pytest.mark.asyncio
async def test_get_learning_unit_by_id_returns_normalized_learning_unit(
    service,
    learning_unit_repository,
):
    # Arrange: repository vrne učno enoto z nečistimi vrednostmi.
    learning_unit_repository.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": " Učna enota 1 ",
        "short_description": " Opis ",
        "keywords": [" a ", "b"],
        "content_topics": [],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [],
    }

    # Act: pridobimo učno enoto po ID-ju.
    result = await service.get_learning_unit_by_id("ue_001")

    # Assert: učna enota je normalizirana pred vračanjem response-a.
    assert result == {
        "_id": "ue_001",
        "title": "Učna enota 1",
        "short_description": "Opis",
        "keywords": ["a", "b"],
        "content_topics": [],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [],
    }


@pytest.mark.asyncio
async def test_get_learning_units_by_ids_returns_normalized_learning_units(
    service,
    learning_unit_repository,
):
    # Arrange: repository vrne učne enote za podane ID-je.
    learning_unit_repository.get_learning_units_by_ids.return_value = [
        {
            "_id": "ue_002",
            "title": " Učna enota 2 ",
            "short_description": " Opis 2 ",
            "keywords": [],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        },
        {
            "_id": "ue_001",
            "title": " Učna enota 1 ",
            "short_description": " Opis 1 ",
            "keywords": [" test "],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        },
    ]

    # Act: pridobimo več učnih enot po ID-jih.
    result = await service.get_learning_units_by_ids(["ue_002", "ue_001"])

    # Assert: service normalizira vse učne enote.
    assert result == [
        {
            "_id": "ue_002",
            "title": "Učna enota 2",
            "short_description": "Opis 2",
            "keywords": [],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        },
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
            "short_description": "Opis 1",
            "keywords": ["test"],
            "content_topics": [],
            "acquired_competencies": [],
            "digcomp_competencies": [],
            "prerequisites": [],
            "self_assessment_questions": [],
        },
    ]

    learning_unit_repository.get_learning_units_by_ids.assert_awaited_once_with(
        ["ue_002", "ue_001"]
    )


@pytest.mark.asyncio
async def test_get_learning_unit_detail_adds_recommended_modules(
    service,
    learning_unit_repository,
    module_repository,
):
    # Arrange: repository vrne učno enoto.
    learning_unit_repository.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": "Učna enota 1",
        "short_description": "Opis.",
        "keywords": [],
        "content_topics": [],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [],
    }

    # Arrange: module repository vrne module, ki vsebujejo to učno enoto.
    module_repository.get_modules_by_learning_unit_id.return_value = [
        {
            "_id": "mod_001",
            "title": " Modul 1 ",
            "short_description": " Opis modula. ",
            "duration_hours": 1.75,
            "keywords": [" UI ", "", 123],
            "domains": [" Domena ", None],
        }
    ]

    # Act: pridobimo detail učne enote.
    result = await service.get_learning_unit_detail("ue_001")

    # Assert: detail response vsebuje recommended_modules.
    assert result is not None
    assert result["_id"] == "ue_001"
    assert result["recommended_modules"] == [
        {
            "_id": "mod_001",
            "title": "Modul 1",
            "short_description": "Opis modula.",
            "duration_hours": 1.75,
            "keywords": ["UI"],
            "domains": ["Domena"],
        }
    ]

    module_repository.get_modules_by_learning_unit_id.assert_awaited_once_with(
        learning_unit_id="ue_001",
        limit=6,
    )


@pytest.mark.asyncio
async def test_get_learning_unit_detail_returns_none_when_learning_unit_not_found(
    service,
    learning_unit_repository,
    module_repository,
):
    # Arrange: repository ne najde učne enote.
    learning_unit_repository.get_learning_unit_by_id.return_value = None

    # Act: poskusimo pridobiti detail za neobstoječo učno enoto.
    result = await service.get_learning_unit_detail("missing_id")

    # Assert: service vrne None in ne kliče module repository-ja.
    assert result is None
    module_repository.get_modules_by_learning_unit_id.assert_not_called()


@pytest.mark.asyncio
async def test_get_learning_unit_detail_works_without_module_repository(
    learning_unit_repository,
):
    # Arrange: service lahko deluje tudi brez module_repository.
    service = LearningUnitService(
        learning_unit_repository=learning_unit_repository,
        module_repository=None,
    )

    learning_unit_repository.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": "Učna enota 1",
        "short_description": "Opis.",
        "keywords": [],
        "content_topics": [],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [],
    }

    # Act: pridobimo detail učne enote brez recommended modules dependency-ja.
    result = await service.get_learning_unit_detail("ue_001")

    # Assert: recommended_modules je prazen seznam.
    assert result is not None
    assert result["recommended_modules"] == []


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_normalized_questions(
    service,
    learning_unit_repository,
):
    # Arrange: repository vrne učno enoto s content topicom in vprašanjem.
    learning_unit_repository.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": "Učna enota 1",
        "short_description": "Opis.",
        "keywords": [],
        "content_topics": [
            {
                "id": "topic_ue_001_001",
                "title": "Tema 1",
                "related_competency_codes": ["1.2"],
            }
        ],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [
            {
                "id": "q_ue_001_001",
                "question": "Razumem temo.",
                "related_topic_id": "topic_ue_001_001",
            }
        ],
    }

    # Act: pridobimo vprašanja za samooceno.
    result = await service.get_self_assessment_questions("ue_001")

    # Assert: vprašanje je normalizirano in povezano s topic podatki.
    assert result == [
        {
            "id": "q_ue_001_001",
            "question": "Razumem temo.",
            "type": "yes_no",
            "learning_unit_id": "ue_001",
            "related_topic": "Tema 1",
            "related_topic_id": "topic_ue_001_001",
            "related_competency_codes": ["1.2"],
        }
    ]


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_empty_list_when_unit_missing(
    service,
    learning_unit_repository,
):
    # Arrange: repository ne najde učne enote.
    learning_unit_repository.get_learning_unit_by_id.return_value = None

    # Act: poskusimo pridobiti vprašanja za neobstoječo učno enoto.
    result = await service.get_self_assessment_questions("missing_id")

    # Assert: service vrne prazen seznam.
    assert result == []


@pytest.mark.asyncio
async def test_get_self_assessment_questions_for_learning_unit_uses_alias_method(
    service,
    learning_unit_repository,
):
    # Arrange: repository vrne učno enoto brez vprašanj.
    learning_unit_repository.get_learning_unit_by_id.return_value = {
        "_id": "ue_001",
        "title": "Učna enota 1",
        "short_description": "Opis.",
        "keywords": [],
        "content_topics": [],
        "acquired_competencies": [],
        "digcomp_competencies": [],
        "prerequisites": [],
        "self_assessment_questions": [],
    }

    # Act: pokličemo alias metodo, ki jo uporablja LearningPathService.
    result = await service.get_self_assessment_questions_for_learning_unit("ue_001")

    # Assert: alias vrne enak rezultat kot osnovna metoda.
    assert result == []
    learning_unit_repository.get_learning_unit_by_id.assert_awaited_once_with("ue_001")