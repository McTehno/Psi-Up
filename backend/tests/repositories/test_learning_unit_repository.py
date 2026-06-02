import pytest

from app.repositories.learning_unit_repository import LearningUnitRepository


class FakeCursor:
    # Fake cursor posnema MongoDB cursor, ki podpira list(cursor).
    def __init__(self, documents):
        self.documents = documents

    def __iter__(self):
        return iter(self.documents)


class FakeCollection:
    # Fake collection hrani dokumente v spominu in posnema osnovne MongoDB metode.
    def __init__(self, documents):
        self.documents = documents
        self.last_find_filter = None
        self.last_find_one_filter = None

    def find(self, query_filter):
        # Shranimo zadnji filter, da preverimo, ali repository zgradi pravilen query.
        self.last_find_filter = query_filter

        if query_filter == {}:
            return FakeCursor(self.documents)

        if "_id" in query_filter and "$in" in query_filter["_id"]:
            return FakeCursor(self._filter_by_ids(query_filter))

        if "$or" in query_filter:
            return FakeCursor(self._filter_by_search_query(query_filter))

        return FakeCursor([])

    def find_one(self, query_filter):
        # Shranimo zadnji filter, da preverimo iskanje po _id.
        self.last_find_one_filter = query_filter

        learning_unit_id = query_filter.get("_id")

        for document in self.documents:
            if document.get("_id") == learning_unit_id:
                return document

        return None

    def _filter_by_ids(self, query_filter):
        # Poenostavljena logika za MongoDB $in filter.
        expected_ids = query_filter["_id"]["$in"]

        return [
            document
            for document in self.documents
            if document.get("_id") in expected_ids
        ]

    def _filter_by_search_query(self, query_filter):
        # Poenostavljena search logika za testiranje regex iskanja.
        regex_query = query_filter["$or"][0]["title"]["$regex"].lower()

        matching_documents = []

        for document in self.documents:
            searchable_parts = [
                str(document.get("title", "")),
                str(document.get("short_description", "")),
                " ".join(document.get("keywords", [])),
                " ".join(document.get("acquired_competencies", [])),
                str(document.get("delivery_mode", "")),
                str(document.get("provider", "")),
                str(document.get("target_audience", "")),
                str(document.get("knowledge_assessment", "")),
                str(document.get("certificate", "")),
            ]

            for topic in document.get("content_topics", []):
                if isinstance(topic, dict):
                    searchable_parts.append(str(topic.get("title", "")))
                    searchable_parts.append(
                        " ".join(topic.get("related_competency_codes", []))
                    )

            for competency in document.get("digcomp_competencies", []):
                if isinstance(competency, dict):
                    searchable_parts.append(str(competency.get("code", "")))
                    searchable_parts.append(str(competency.get("title", "")))
                    searchable_parts.append(str(competency.get("description", "")))

            for question in document.get("self_assessment_questions", []):
                if isinstance(question, dict):
                    searchable_parts.append(str(question.get("question", "")))
                    searchable_parts.append(str(question.get("related_topic", "")))
                    searchable_parts.append(str(question.get("related_topic_id", "")))
                    searchable_parts.append(
                        " ".join(question.get("related_competency_codes", []))
                    )

            searchable_text = " ".join(searchable_parts).lower()

            if regex_query in searchable_text:
                matching_documents.append(document)

        return matching_documents


class FakeDatabase:
    # Fake database omogoča dostop do kolekcije prek database["learning_units"].
    def __init__(self, collection):
        self.collection = collection
        self.last_collection_name = None

    def __getitem__(self, collection_name):
        self.last_collection_name = collection_name
        return self.collection


@pytest.fixture
def learning_unit_documents():
    # Testni podatki uporabljajo novo learning unit strukturo s content_topics.
    return [
        {
            "_id": "ue_001",
            "title": "Osnovni pojmi umetne inteligence",
            "short_description": "Uvod v osnovne pojme umetne inteligence.",
            "duration_hours": 0.5,
            "keywords": ["umetna inteligenca", "UI"],
            "content_topics": [
                {
                    "id": "topic_ue_001_001",
                    "title": "Razumevanje pojma umetna inteligenca",
                    "related_competency_codes": ["1.2"],
                }
            ],
            "acquired_competencies": [
                "Udeleženec razume osnovni koncept umetne inteligence"
            ],
            "digcomp_competencies": [
                {
                    "code": "1.2",
                    "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                    "description": "Prepoznava in razume digitalne informacije.",
                }
            ],
            "delivery_mode": "Spletno",
            "provider": "NIDiKo demo izvajalec",
            "target_audience": "Odrasli uporabniki",
            "prerequisites": [],
            "knowledge_assessment": "Kratek kviz",
            "certificate": "Potrdilo o udeležbi",
            "self_assessment_questions": [
                {
                    "id": "q_ue_001_001",
                    "question": "Razumem osnovni koncept umetne inteligence.",
                    "type": "yes_no",
                    "related_topic": "Razumevanje pojma umetna inteligenca",
                    "related_topic_id": "topic_ue_001_001",
                    "related_competency_codes": ["1.2"],
                }
            ],
        },
        {
            "_id": "ue_005",
            "title": "Osnove Excela",
            "short_description": "Učna enota za osnovno uporabo Excela.",
            "duration_hours": 8,
            "keywords": ["Excel", "preglednice"],
            "content_topics": [
                {
                    "id": "topic_ue_005_001",
                    "title": "Razumevanje programskega vmesnika",
                    "related_competency_codes": ["3.2"],
                }
            ],
            "acquired_competencies": [
                "Udeleženec se znajde v vmesniku Excel"
            ],
            "digcomp_competencies": [
                {
                    "code": "3.2",
                    "title": "Ustvarjanje digitalnih vsebin",
                    "description": "Ustvarja in ureja vsebino z digitalnimi orodji.",
                }
            ],
            "delivery_mode": "V živo",
            "provider": "Šolski center Kungota",
            "target_audience": "Nad 50 let",
            "prerequisites": ["Osnovno poznavanje računalnika"],
            "knowledge_assessment": "Pisni test",
            "certificate": "Mikrocertifikat",
            "self_assessment_questions": [
                {
                    "id": "q_ue_005_001",
                    "question": "Znam uporabljati osnovni programski vmesnik Excela.",
                    "type": "yes_no",
                    "related_topic": "Razumevanje programskega vmesnika",
                    "related_topic_id": "topic_ue_005_001",
                    "related_competency_codes": ["3.2"],
                }
            ],
        },
    ]


@pytest.fixture
def fake_collection(learning_unit_documents):
    return FakeCollection(learning_unit_documents)


@pytest.fixture
def fake_database(fake_collection):
    return FakeDatabase(fake_collection)


@pytest.fixture
def repository(fake_database):
    return LearningUnitRepository(fake_database)


@pytest.mark.asyncio
async def test_get_all_learning_units_returns_all_documents(
    repository,
    fake_database,
    fake_collection,
    learning_unit_documents,
):
    # Preverimo, da repository prebere vse učne enote iz learning_units kolekcije.
    result = await repository.get_all_learning_units()

    assert result == learning_unit_documents
    assert fake_database.last_collection_name == "learning_units"
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_get_learning_unit_by_id_returns_document_when_found(
    repository,
    fake_database,
    fake_collection,
):
    # Preverimo, da repository poišče učno enoto po _id.
    result = await repository.get_learning_unit_by_id("ue_001")

    assert result is not None
    assert result["_id"] == "ue_001"
    assert result["title"] == "Osnovni pojmi umetne inteligence"
    assert fake_database.last_collection_name == "learning_units"
    assert fake_collection.last_find_one_filter == {"_id": "ue_001"}


@pytest.mark.asyncio
async def test_get_learning_unit_by_id_returns_none_when_not_found(repository):
    # Če učna enota ne obstaja, repository vrne None.
    result = await repository.get_learning_unit_by_id("missing_id")

    assert result is None


@pytest.mark.asyncio
async def test_get_learning_units_by_ids_returns_units_in_requested_order(
    repository,
    fake_collection,
):
    # Repository mora vrniti učne enote v istem vrstnem redu, kot so bile zahtevane.
    result = await repository.get_learning_units_by_ids(["ue_005", "ue_001"])

    assert [learning_unit["_id"] for learning_unit in result] == ["ue_005", "ue_001"]
    assert fake_collection.last_find_filter == {
        "_id": {
            "$in": ["ue_005", "ue_001"],
        }
    }


@pytest.mark.asyncio
async def test_get_learning_units_by_ids_skips_missing_ids(repository):
    # Če en ID ne obstaja, ga repository preskoči.
    result = await repository.get_learning_units_by_ids(
        ["ue_005", "missing_id", "ue_001"]
    )

    assert [learning_unit["_id"] for learning_unit in result] == ["ue_005", "ue_001"]


@pytest.mark.asyncio
async def test_get_learning_units_by_ids_returns_empty_list_for_empty_ids(
    repository,
    fake_collection,
):
    # Če seznam ID-jev ni podan, repository ne kliče MongoDB.
    result = await repository.get_learning_units_by_ids([])

    assert result == []
    assert fake_collection.last_find_filter is None


@pytest.mark.asyncio
async def test_search_learning_units_returns_all_when_query_is_empty(
    repository,
    fake_collection,
    learning_unit_documents,
):
    # Prazen search query vrne vse učne enote.
    result = await repository.search_learning_units("")

    assert result == learning_unit_documents
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_search_learning_units_searches_by_title(repository, fake_collection):
    # Search naj išče po title.
    result = await repository.search_learning_units("excel")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_005"
    assert fake_collection.last_find_filter == {
        "$or": [
            {"title": {"$regex": "excel", "$options": "i"}},
            {"short_description": {"$regex": "excel", "$options": "i"}},
            {"keywords": {"$regex": "excel", "$options": "i"}},
            {"content_topics.title": {"$regex": "excel", "$options": "i"}},
            {
                "content_topics.related_competency_codes": {
                    "$regex": "excel",
                    "$options": "i",
                }
            },
            {"content_topics": {"$regex": "excel", "$options": "i"}},
            {"acquired_competencies": {"$regex": "excel", "$options": "i"}},
            {"digcomp_competencies.code": {"$regex": "excel", "$options": "i"}},
            {"digcomp_competencies.title": {"$regex": "excel", "$options": "i"}},
            {
                "digcomp_competencies.description": {
                    "$regex": "excel",
                    "$options": "i",
                }
            },
            {"self_assessment_questions.question": {"$regex": "excel", "$options": "i"}},
            {
                "self_assessment_questions.related_topic": {
                    "$regex": "excel",
                    "$options": "i",
                }
            },
            {
                "self_assessment_questions.related_topic_id": {
                    "$regex": "excel",
                    "$options": "i",
                }
            },
            {
                "self_assessment_questions.related_competency_codes": {
                    "$regex": "excel",
                    "$options": "i",
                }
            },
            {"delivery_mode": {"$regex": "excel", "$options": "i"}},
            {"provider": {"$regex": "excel", "$options": "i"}},
            {"target_audience": {"$regex": "excel", "$options": "i"}},
            {"knowledge_assessment": {"$regex": "excel", "$options": "i"}},
            {"certificate": {"$regex": "excel", "$options": "i"}},
        ]
    }


@pytest.mark.asyncio
async def test_search_learning_units_searches_by_content_topic_title(repository):
    # Search naj najde učno enoto tudi po content_topics.title.
    result = await repository.search_learning_units("programskega vmesnika")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_005"


@pytest.mark.asyncio
async def test_search_learning_units_searches_by_digcomp_code(repository):
    # Search naj najde učno enoto tudi po DigComp code.
    result = await repository.search_learning_units("1.2")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_001"


@pytest.mark.asyncio
async def test_search_learning_units_searches_by_question_text(repository):
    # Search naj najde učno enoto tudi po vprašanju za samooceno.
    result = await repository.search_learning_units("programski vmesnik")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_005"


@pytest.mark.asyncio
async def test_search_learning_units_searches_by_provider(repository):
    # Search naj najde učno enoto tudi po provider polju.
    result = await repository.search_learning_units("kungota")

    assert len(result) == 1
    assert result[0]["_id"] == "ue_005"


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_questions(repository):
    # Repository vrne surova self_assessment_questions vprašanja iz učne enote.
    result = await repository.get_self_assessment_questions("ue_001")

    assert result == [
        {
            "id": "q_ue_001_001",
            "question": "Razumem osnovni koncept umetne inteligence.",
            "type": "yes_no",
            "related_topic": "Razumevanje pojma umetna inteligenca",
            "related_topic_id": "topic_ue_001_001",
            "related_competency_codes": ["1.2"],
        }
    ]


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_empty_list_when_unit_missing(
    repository,
):
    # Če učna enota ne obstaja, ni vprašanj za samooceno.
    result = await repository.get_self_assessment_questions("missing_id")

    assert result == []


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_empty_list_when_questions_missing():
    # Če dokument nima self_assessment_questions polja, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "ue_without_questions",
                "title": "Učna enota brez vprašanj",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = LearningUnitRepository(database)

    result = await repository.get_self_assessment_questions("ue_without_questions")

    assert result == []


@pytest.mark.asyncio
async def test_get_self_assessment_questions_returns_empty_list_when_questions_is_not_list():
    # Če self_assessment_questions ni seznam, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "ue_invalid_questions",
                "self_assessment_questions": "not-a-list",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = LearningUnitRepository(database)

    result = await repository.get_self_assessment_questions("ue_invalid_questions")

    assert result == []