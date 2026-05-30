from app.repositories.learning_unit_repository import LearningUnitRepository

from tests.repositories.fake_mongo import FakeCollection, FakeDatabase


def create_repository():
    # Pripravimo repository s fake learning_units kolekcijo.
    collection = FakeCollection(
        [
            {
                "_id": "ue_001",
                "title": "Osnove umetne inteligence",
                "short_description": "Uvod v osnovne pojme UI.",
                "keywords": ["UI", "umetna inteligenca"],
                "content_topics": ["Osnovni pojmi"],
                "acquired_competencies": ["Razumevanje osnov UI"],
                "digcomp_competencies": [
                    {
                        "code": "1.1",
                        "title": "Brskanje in iskanje podatkov",
                        "description": "Iskanje informacij v digitalnem okolju.",
                    }
                ],
                "delivery_mode": "Spletno",
                "provider": "NIDiKo",
                "target_audience": "Začetniki",
                "knowledge_assessment": "Kratek kviz",
                "certificate": "Potrdilo",
                "self_assessment_questions": [
                    {
                        "id": "q_001",
                        "question": "Razumem osnovne pojme UI.",
                        "type": "yes_no",
                        "related_topic": "Osnovni pojmi",
                    }
                ],
            },
            {
                "_id": "ue_002",
                "title": "Napredno iskanje informacij",
                "short_description": "Uporaba UI pri iskanju informacij.",
                "keywords": ["iskanje", "informacije"],
                "content_topics": ["Iskanje informacij"],
                "acquired_competencies": ["Iskanje z UI"],
                "digcomp_competencies": [],
                "delivery_mode": "Spletno",
                "provider": "NIDiKo",
                "target_audience": "Začetniki",
                "knowledge_assessment": "Kratek kviz",
                "certificate": "Potrdilo",
                "self_assessment_questions": [],
            },
        ]
    )

    database = FakeDatabase(
        {
            "learning_units": collection,
        }
    )

    return LearningUnitRepository(database), collection


async def test_get_all_learning_units_returns_all_documents():
    # Preverimo, da repository vrne vse učne enote iz kolekcije.
    repository, collection = create_repository()

    result = await repository.get_all_learning_units()

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_get_learning_unit_by_id_returns_matching_document():
    # Preverimo iskanje ene učne enote po _id.
    repository, collection = create_repository()

    result = await repository.get_learning_unit_by_id("ue_001")

    assert result["_id"] == "ue_001"
    assert collection.last_find_one_filter == {"_id": "ue_001"}


async def test_get_learning_unit_by_id_returns_none_when_missing():
    # Če učna enota ne obstaja, repository vrne None.
    repository, _ = create_repository()

    result = await repository.get_learning_unit_by_id("missing_id")

    assert result is None


async def test_get_learning_units_by_ids_preserves_requested_order():
    # Repository mora vrniti učne enote v istem vrstnem redu, kot so podani ID-ji.
    repository, _ = create_repository()

    result = await repository.get_learning_units_by_ids(["ue_002", "ue_001"])

    assert [learning_unit["_id"] for learning_unit in result] == ["ue_002", "ue_001"]


async def test_get_learning_units_by_ids_returns_empty_list_for_empty_input():
    # Prazen seznam ID-jev ne sme sprožiti nepotrebnega iskanja v bazi.
    repository, _ = create_repository()

    result = await repository.get_learning_units_by_ids([])

    assert result == []


async def test_search_learning_units_returns_all_when_query_is_empty():
    # Prazen query pomeni, da repository vrne vse učne enote.
    repository, collection = create_repository()

    result = await repository.search_learning_units("")

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_search_learning_units_finds_matching_document():
    # Preverimo, da search najde učno enoto po naslovu ali povezanih poljih.
    repository, _ = create_repository()

    result = await repository.search_learning_units("napredno")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_002"


async def test_get_self_assessment_questions_returns_questions_for_existing_unit():
    # Repository vrne vprašanja za samooceno iz izbrane učne enote.
    repository, _ = create_repository()

    result = await repository.get_self_assessment_questions("ue_001")

    assert len(result) == 1
    assert result[0]["id"] == "q_001"


async def test_get_self_assessment_questions_returns_empty_list_when_unit_missing():
    # Če učna enota ne obstaja, repository vrne prazen seznam vprašanj.
    repository, _ = create_repository()

    result = await repository.get_self_assessment_questions("missing_id")

    assert result == []