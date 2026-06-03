import pytest

from app.repositories.learning_path_repository import LearningPathRepository


class FakeCursor:
    # Fake cursor posnema MongoDB cursor, ki podpira list(cursor) in limit().
    def __init__(self, documents):
        self.documents = documents
        self.limit_value = None

    def limit(self, limit_value: int):
        self.limit_value = limit_value
        return self

    def __iter__(self):
        if self.limit_value is None:
            return iter(self.documents)

        return iter(self.documents[: self.limit_value])


class FakeCollection:
    # Fake collection hrani dokumente v spominu in posnema osnovne MongoDB metode.
    def __init__(self, documents):
        self.documents = documents
        self.last_find_filter = None
        self.last_find_one_filter = None

    def find(self, query_filter):
        # Shranimo zadnji filter, da lahko preverimo, ali repository zgradi pravilen query.
        self.last_find_filter = query_filter

        if query_filter == {}:
            return FakeCursor(self.documents)

        if "$or" in query_filter:
            return FakeCursor(self._filter_by_search_query(query_filter))

        if "steps" in query_filter:
            return FakeCursor(self._filter_by_step_elem_match(query_filter))

        return FakeCursor([])

    def find_one(self, query_filter):
        # Shranimo zadnji filter, da preverimo iskanje po _id.
        self.last_find_one_filter = query_filter

        learning_path_id = query_filter.get("_id")

        for document in self.documents:
            if document.get("_id") == learning_path_id:
                return document

        return None

    def _filter_by_search_query(self, query_filter):
        # Poenostavljena search logika za testiranje regex iskanja.
        regex_query = query_filter["$or"][0]["title"]["$regex"].lower()

        matching_documents = []

        for document in self.documents:
            title = str(document.get("title", "")).lower()
            short_description = str(document.get("short_description", "")).lower()
            keywords = " ".join(document.get("keywords", [])).lower()

            if (
                regex_query in title
                or regex_query in short_description
                or regex_query in keywords
            ):
                matching_documents.append(document)

        return matching_documents

    def _filter_by_step_elem_match(self, query_filter):
        # Poenostavljena elemMatch logika za steps.
        elem_match = query_filter["steps"]["$elemMatch"]
        expected_type = elem_match.get("type")
        expected_ref_id = elem_match.get("ref_id")

        matching_documents = []

        for document in self.documents:
            for step in document.get("steps", []):
                if (
                    step.get("type") == expected_type
                    and step.get("ref_id") == expected_ref_id
                ):
                    matching_documents.append(document)
                    break

        return matching_documents


class FakeDatabase:
    # Fake database omogoča dostop do kolekcije prek database["learning_paths"].
    def __init__(self, collection):
        self.collection = collection
        self.last_collection_name = None

    def __getitem__(self, collection_name):
        self.last_collection_name = collection_name
        return self.collection


@pytest.fixture
def learning_path_documents():
    # Testni podatki uporabljajo novo steps strukturo.
    return [
        {
            "_id": "up_001",
            "title": "Osnove umetne inteligence",
            "short_description": "Učna pot za razumevanje UI.",
            "keywords": ["umetna inteligenca", "iskanje"],
            "steps": [
                {
                    "type": "module",
                    "ref_id": "mod_001",
                    "order": 1,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                },
                {
                    "type": "learning_unit",
                    "ref_id": "ue_001",
                    "order": 2,
                    "parallel_group": None,
                    "is_required": False,
                    "prerequisites": ["mod_001"],
                },
                {
                    "type": "module",
                    "ref_id": "mod_002",
                    "order": 3,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": ["mod_001"],
                },
            ],
        },
        {
            "_id": "up_002",
            "title": "Osnove Excela",
            "short_description": "Učna pot za delo s preglednicami.",
            "keywords": ["excel", "preglednice"],
            "steps": [
                {
                    "type": "module",
                    "ref_id": "mod_003",
                    "order": 1,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                }
            ],
        },
    ]


@pytest.fixture
def fake_collection(learning_path_documents):
    return FakeCollection(learning_path_documents)


@pytest.fixture
def fake_database(fake_collection):
    return FakeDatabase(fake_collection)


@pytest.fixture
def repository(fake_database):
    return LearningPathRepository(fake_database)


@pytest.mark.asyncio
async def test_get_all_learning_paths_returns_all_documents(
    repository,
    fake_database,
    fake_collection,
    learning_path_documents,
):
    # Preverimo, da repository prebere vse učne poti iz learning_paths kolekcije.
    result = await repository.get_all_learning_paths()

    assert result == learning_path_documents
    assert fake_database.last_collection_name == "learning_paths"
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_get_learning_path_by_id_returns_document_when_found(
    repository,
    fake_database,
    fake_collection,
):
    # Preverimo, da repository poišče učno pot po _id.
    result = await repository.get_learning_path_by_id("up_001")

    assert result is not None
    assert result["_id"] == "up_001"
    assert result["title"] == "Osnove umetne inteligence"
    assert fake_database.last_collection_name == "learning_paths"
    assert fake_collection.last_find_one_filter == {"_id": "up_001"}


@pytest.mark.asyncio
async def test_get_learning_path_by_id_returns_none_when_not_found(repository):
    # Če učna pot ne obstaja, repository vrne None.
    result = await repository.get_learning_path_by_id("missing_id")

    assert result is None


@pytest.mark.asyncio
async def test_get_learning_paths_by_module_id_returns_paths_that_contain_module(
    repository,
    fake_collection,
):
    # Preverimo, da repository išče module znotraj nove steps strukture.
    result = await repository.get_learning_paths_by_module_id("mod_001")

    assert len(result) == 1
    assert result[0]["_id"] == "up_001"
    assert fake_collection.last_find_filter == {
        "steps": {
            "$elemMatch": {
                "type": "module",
                "ref_id": "mod_001",
            }
        }
    }


@pytest.mark.asyncio
async def test_get_learning_paths_by_module_id_respects_limit(repository):
    # Preverimo, da repository uporabi limit nad rezultati.
    result = await repository.get_learning_paths_by_module_id(
        module_id="mod_001",
        limit=1,
    )

    assert len(result) == 1


@pytest.mark.asyncio
async def test_get_learning_paths_by_module_id_returns_empty_list_for_empty_module_id(
    repository,
    fake_collection,
):
    # Če module_id ni podan, repository ne kliče MongoDB in vrne prazen seznam.
    result = await repository.get_learning_paths_by_module_id("")

    assert result == []
    assert fake_collection.last_find_filter is None


@pytest.mark.asyncio
async def test_search_learning_paths_returns_all_when_query_is_empty(
    repository,
    fake_collection,
    learning_path_documents,
):
    # Prazen search query vrne vse učne poti.
    result = await repository.search_learning_paths("")

    assert result == learning_path_documents
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_search_learning_paths_searches_by_title(repository, fake_collection):
    # Search naj išče po title.
    result = await repository.search_learning_paths("excel")

    assert len(result) == 1
    assert result[0]["_id"] == "up_002"
    assert fake_collection.last_find_filter == {
        "$or": [
            {"title": {"$regex": "excel", "$options": "i"}},
            {"short_description": {"$regex": "excel", "$options": "i"}},
            {"keywords": {"$regex": "excel", "$options": "i"}},
        ]
    }


@pytest.mark.asyncio
async def test_search_learning_paths_searches_by_keyword(repository):
    # Search naj najde učno pot tudi po keywords.
    result = await repository.search_learning_paths("iskanje")

    assert len(result) == 1
    assert result[0]["_id"] == "up_001"


@pytest.mark.asyncio
async def test_get_step_references_for_learning_path_returns_steps(repository):
    # Repository vrne steps iz izbrane učne poti.
    result = await repository.get_step_references_for_learning_path("up_001")

    assert len(result) == 3
    assert result[0]["type"] == "module"
    assert result[0]["ref_id"] == "mod_001"
    assert result[1]["type"] == "learning_unit"
    assert result[1]["ref_id"] == "ue_001"


@pytest.mark.asyncio
async def test_get_step_references_for_learning_path_returns_empty_list_when_path_missing(
    repository,
):
    # Če učna pot ne obstaja, ni step referenc.
    result = await repository.get_step_references_for_learning_path("missing_id")

    assert result == []


@pytest.mark.asyncio
async def test_get_step_references_for_learning_path_returns_empty_list_when_steps_missing(
    fake_database,
):
    # Če dokument nima steps polja, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "up_without_steps",
                "title": "Pot brez steps",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = LearningPathRepository(database)

    result = await repository.get_step_references_for_learning_path("up_without_steps")

    assert result == []


@pytest.mark.asyncio
async def test_get_module_references_for_learning_path_returns_only_module_steps(
    repository,
):
    # Compatibility metoda mora iz steps vrniti samo module.
    result = await repository.get_module_references_for_learning_path("up_001")

    assert result == [
        {
            "module_id": "mod_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "module_id": "mod_002",
            "order": 3,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": ["mod_001"],
        },
    ]


@pytest.mark.asyncio
async def test_get_module_references_for_learning_path_returns_empty_list_when_path_missing(
    repository,
):
    # Če učna pot ne obstaja, ni module referenc.
    result = await repository.get_module_references_for_learning_path("missing_id")

    assert result == []


@pytest.mark.asyncio
async def test_get_learning_path_prerequisites_for_module_returns_prerequisites(
    repository,
):
    # Preverimo, da repository vrne prerequisites za modul znotraj učne poti.
    result = await repository.get_learning_path_prerequisites_for_module(
        learning_path_id="up_001",
        module_id="mod_002",
    )

    assert result == ["mod_001"]


@pytest.mark.asyncio
async def test_get_learning_path_prerequisites_for_module_returns_empty_list_when_module_missing(
    repository,
):
    # Če modul ni del učne poti, ni prerequisites.
    result = await repository.get_learning_path_prerequisites_for_module(
        learning_path_id="up_001",
        module_id="missing_module",
    )

    assert result == []


@pytest.mark.asyncio
async def test_get_available_modules_for_learning_path_returns_modules_without_prerequisites(
    repository,
):
    # Brez completed modulov je dostopen samo modul brez prerequisites.
    result = await repository.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=[],
    )

    assert result == [
        {
            "module_id": "mod_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]


@pytest.mark.asyncio
async def test_get_available_modules_for_learning_path_returns_modules_with_completed_prerequisites(
    repository,
):
    # Ko je mod_001 completed, postane dostopen tudi mod_002.
    result = await repository.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=["mod_001"],
    )

    assert result == [
        {
            "module_id": "mod_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "module_id": "mod_002",
            "order": 3,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": ["mod_001"],
        },
    ]


@pytest.mark.asyncio
async def test_get_available_modules_for_learning_path_keeps_completed_modules_available(
    repository,
):
    # available pomeni dostopno, zato completed modul še vedno ostane v rezultatu.
    result = await repository.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=["mod_001", "mod_002"],
    )

    assert [module["module_id"] for module in result] == ["mod_001", "mod_002"]