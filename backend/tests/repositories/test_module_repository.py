import pytest

from app.repositories.module_repository import ModuleRepository


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
        # Shranimo zadnji filter, da preverimo, ali repository zgradi pravilen query.
        self.last_find_filter = query_filter

        if query_filter == {}:
            return FakeCursor(self.documents)

        if "_id" in query_filter and "$in" in query_filter["_id"]:
            return FakeCursor(self._filter_by_ids(query_filter))

        if "learning_units.learning_unit_id" in query_filter:
            return FakeCursor(self._filter_by_learning_unit_id(query_filter))

        if "$or" in query_filter:
            return FakeCursor(self._filter_by_search_query(query_filter))

        return FakeCursor([])

    def find_one(self, query_filter):
        # Shranimo zadnji filter, da preverimo iskanje po _id.
        self.last_find_one_filter = query_filter

        module_id = query_filter.get("_id")

        for document in self.documents:
            if document.get("_id") == module_id:
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

    def _filter_by_learning_unit_id(self, query_filter):
        # Poenostavljena logika za learning_units.learning_unit_id filter.
        expected_learning_unit_id = query_filter["learning_units.learning_unit_id"]

        matching_documents = []

        for document in self.documents:
            for learning_unit in document.get("learning_units", []):
                if learning_unit.get("learning_unit_id") == expected_learning_unit_id:
                    matching_documents.append(document)
                    break

        return matching_documents

    def _filter_by_search_query(self, query_filter):
        # Poenostavljena search logika za testiranje regex iskanja.
        regex_query = query_filter["$or"][0]["title"]["$regex"].lower()

        matching_documents = []

        for document in self.documents:
            title = str(document.get("title", "")).lower()
            short_description = str(document.get("short_description", "")).lower()
            keywords = " ".join(document.get("keywords", [])).lower()
            domains = " ".join(document.get("domains", [])).lower()

            learning_unit_ids = " ".join(
                learning_unit.get("learning_unit_id", "")
                for learning_unit in document.get("learning_units", [])
                if isinstance(learning_unit, dict)
            ).lower()

            if (
                regex_query in title
                or regex_query in short_description
                or regex_query in keywords
                or regex_query in domains
                or regex_query in learning_unit_ids
            ):
                matching_documents.append(document)

        return matching_documents


class FakeDatabase:
    # Fake database omogoča dostop do kolekcije prek database["modules"].
    def __init__(self, collection):
        self.collection = collection
        self.last_collection_name = None

    def __getitem__(self, collection_name):
        self.last_collection_name = collection_name
        return self.collection


@pytest.fixture
def module_documents():
    # Testni podatki uporabljajo novo strukturo z learning_units referencami.
    return [
        {
            "_id": "mod_001",
            "title": "Razumevanje umetne inteligence",
            "short_description": "Modul predstavlja osnovne pojme umetne inteligence.",
            "duration_hours": 1.75,
            "keywords": ["umetna inteligenca", "UI"],
            "domains": ["Umetna inteligenca"],
            "learning_units": [
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
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": ["ue_001", "ue_002"],
                },
            ],
        },
        {
            "_id": "mod_003",
            "title": "Osnove Excela",
            "short_description": "Modul zajema osnovno uporabo Excela.",
            "duration_hours": 9.75,
            "keywords": ["Excel", "preglednice"],
            "domains": ["Ustvarjanje in uporaba digitalnih vsebin"],
            "learning_units": [
                {
                    "learning_unit_id": "ue_005",
                    "order": 1,
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                }
            ],
        },
    ]


@pytest.fixture
def fake_collection(module_documents):
    return FakeCollection(module_documents)


@pytest.fixture
def fake_database(fake_collection):
    return FakeDatabase(fake_collection)


@pytest.fixture
def repository(fake_database):
    return ModuleRepository(fake_database)


@pytest.mark.asyncio
async def test_get_all_modules_returns_all_documents(
    repository,
    fake_database,
    fake_collection,
    module_documents,
):
    # Preverimo, da repository prebere vse module iz modules kolekcije.
    result = await repository.get_all_modules()

    assert result == module_documents
    assert fake_database.last_collection_name == "modules"
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_get_module_by_id_returns_document_when_found(
    repository,
    fake_database,
    fake_collection,
):
    # Preverimo, da repository poišče modul po _id.
    result = await repository.get_module_by_id("mod_001")

    assert result is not None
    assert result["_id"] == "mod_001"
    assert result["title"] == "Razumevanje umetne inteligence"
    assert fake_database.last_collection_name == "modules"
    assert fake_collection.last_find_one_filter == {"_id": "mod_001"}


@pytest.mark.asyncio
async def test_get_module_by_id_returns_none_when_not_found(repository):
    # Če modul ne obstaja, repository vrne None.
    result = await repository.get_module_by_id("missing_id")

    assert result is None


@pytest.mark.asyncio
async def test_get_modules_by_ids_returns_modules_in_requested_order(
    repository,
    fake_collection,
):
    # Repository mora vrniti module v istem vrstnem redu, kot so bili zahtevani.
    result = await repository.get_modules_by_ids(["mod_003", "mod_001"])

    assert [module["_id"] for module in result] == ["mod_003", "mod_001"]
    assert fake_collection.last_find_filter == {
        "_id": {
            "$in": ["mod_003", "mod_001"],
        }
    }


@pytest.mark.asyncio
async def test_get_modules_by_ids_skips_missing_ids(repository):
    # Če en ID ne obstaja, ga repository preskoči.
    result = await repository.get_modules_by_ids(["mod_003", "missing_id", "mod_001"])

    assert [module["_id"] for module in result] == ["mod_003", "mod_001"]


@pytest.mark.asyncio
async def test_get_modules_by_ids_returns_empty_list_for_empty_ids(
    repository,
    fake_collection,
):
    # Če seznam ID-jev ni podan, repository ne kliče MongoDB.
    result = await repository.get_modules_by_ids([])

    assert result == []
    assert fake_collection.last_find_filter is None


@pytest.mark.asyncio
async def test_get_modules_by_learning_unit_id_returns_modules_that_contain_learning_unit(
    repository,
    fake_collection,
):
    # Preverimo, da repository najde module, ki vsebujejo izbrano učno enoto.
    result = await repository.get_modules_by_learning_unit_id("ue_001")

    assert len(result) == 1
    assert result[0]["_id"] == "mod_001"
    assert fake_collection.last_find_filter == {
        "learning_units.learning_unit_id": "ue_001"
    }


@pytest.mark.asyncio
async def test_get_modules_by_learning_unit_id_respects_limit(repository):
    # Preverimo, da repository uporabi limit nad rezultati.
    result = await repository.get_modules_by_learning_unit_id(
        learning_unit_id="ue_001",
        limit=1,
    )

    assert len(result) == 1


@pytest.mark.asyncio
async def test_get_modules_by_learning_unit_id_returns_empty_list_for_empty_learning_unit_id(
    repository,
    fake_collection,
):
    # Če learning_unit_id ni podan, repository ne kliče MongoDB in vrne prazen seznam.
    result = await repository.get_modules_by_learning_unit_id("")

    assert result == []
    assert fake_collection.last_find_filter is None


@pytest.mark.asyncio
async def test_search_modules_returns_all_when_query_is_empty(
    repository,
    fake_collection,
    module_documents,
):
    # Prazen search query vrne vse module.
    result = await repository.search_modules("")

    assert result == module_documents
    assert fake_collection.last_find_filter == {}


@pytest.mark.asyncio
async def test_search_modules_searches_by_title(repository, fake_collection):
    # Search naj išče po title.
    result = await repository.search_modules("excel")

    assert len(result) == 1
    assert result[0]["_id"] == "mod_003"
    assert fake_collection.last_find_filter == {
        "$or": [
            {"title": {"$regex": "excel", "$options": "i"}},
            {"short_description": {"$regex": "excel", "$options": "i"}},
            {"keywords": {"$regex": "excel", "$options": "i"}},
            {"domains": {"$regex": "excel", "$options": "i"}},
            {"learning_units.learning_unit_id": {"$regex": "excel", "$options": "i"}},
        ]
    }


@pytest.mark.asyncio
async def test_search_modules_searches_by_domain(repository):
    # Search naj najde modul tudi po domains.
    result = await repository.search_modules("umetna inteligenca")

    assert len(result) == 1
    assert result[0]["_id"] == "mod_001"


@pytest.mark.asyncio
async def test_search_modules_searches_by_learning_unit_id(repository):
    # Search naj najde modul tudi po learning_units.learning_unit_id.
    result = await repository.search_modules("ue_005")

    assert len(result) == 1
    assert result[0]["_id"] == "mod_003"


@pytest.mark.asyncio
async def test_get_learning_unit_references_for_module_returns_learning_units(
    repository,
):
    # Repository vrne learning_units reference iz izbranega modula.
    result = await repository.get_learning_unit_references_for_module("mod_001")

    assert len(result) == 3
    assert result[0]["learning_unit_id"] == "ue_001"
    assert result[1]["learning_unit_id"] == "ue_002"
    assert result[2]["learning_unit_id"] == "ue_003"


@pytest.mark.asyncio
async def test_get_learning_unit_references_for_module_returns_empty_list_when_module_missing(
    repository,
):
    # Če modul ne obstaja, ni learning unit referenc.
    result = await repository.get_learning_unit_references_for_module("missing_id")

    assert result == []


@pytest.mark.asyncio
async def test_get_learning_unit_references_for_module_returns_empty_list_when_learning_units_missing():
    # Če dokument nima learning_units polja, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "mod_without_learning_units",
                "title": "Modul brez learning units",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_learning_unit_references_for_module(
        "mod_without_learning_units"
    )

    assert result == []


@pytest.mark.asyncio
async def test_get_learning_unit_references_for_module_returns_empty_list_when_learning_units_is_not_list():
    # Če learning_units ni seznam, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "mod_invalid_learning_units",
                "learning_units": "not-a-list",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_learning_unit_references_for_module(
        "mod_invalid_learning_units"
    )

    assert result == []


@pytest.mark.asyncio
async def test_get_module_prerequisites_for_learning_unit_returns_prerequisites(
    repository,
):
    # Preverimo, da repository vrne prerequisites za učno enoto znotraj modula.
    result = await repository.get_module_prerequisites_for_learning_unit(
        module_id="mod_001",
        learning_unit_id="ue_003",
    )

    assert result == ["ue_001", "ue_002"]


@pytest.mark.asyncio
async def test_get_module_prerequisites_for_learning_unit_returns_empty_list_when_learning_unit_missing(
    repository,
):
    # Če učna enota ni del modula, ni prerequisites.
    result = await repository.get_module_prerequisites_for_learning_unit(
        module_id="mod_001",
        learning_unit_id="missing_learning_unit",
    )

    assert result == []


@pytest.mark.asyncio
async def test_get_module_prerequisites_for_learning_unit_filters_invalid_prerequisites():
    # Repository odstrani neveljavne prerequisites in pusti samo neprazne stringe.
    collection = FakeCollection(
        [
            {
                "_id": "mod_001",
                "learning_units": [
                    {
                        "learning_unit_id": "ue_002",
                        "prerequisites": ["ue_001", "", 123, "ue_000"],
                    }
                ],
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_module_prerequisites_for_learning_unit(
        module_id="mod_001",
        learning_unit_id="ue_002",
    )

    assert result == ["ue_001", "ue_000"]


@pytest.mark.asyncio
async def test_get_module_prerequisites_for_learning_unit_returns_empty_list_when_prerequisites_is_not_list():
    # Če prerequisites ni seznam, repository vrne prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "mod_001",
                "learning_units": [
                    {
                        "learning_unit_id": "ue_002",
                        "prerequisites": "not-a-list",
                    }
                ],
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_module_prerequisites_for_learning_unit(
        module_id="mod_001",
        learning_unit_id="ue_002",
    )

    assert result == []


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_returns_units_without_prerequisites(
    repository,
):
    # Brez completed učnih enot je dostopna samo učna enota brez prerequisites.
    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=[],
    )

    assert result == [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_returns_units_with_completed_prerequisites(
    repository,
):
    # Ko je ue_001 completed, postane dostopna tudi ue_002.
    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=["ue_001"],
    )

    assert result == [
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
    ]


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_keeps_completed_units_available(
    repository,
):
    # available pomeni dostopno, zato completed učna enota še vedno ostane v rezultatu.
    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=["ue_001", "ue_002", "ue_003"],
    )

    assert [
        learning_unit["learning_unit_id"]
        for learning_unit in result
    ] == ["ue_001", "ue_002", "ue_003"]


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_ignores_invalid_learning_unit_items():
    # Če learning_units vsebuje neveljavne elemente, jih available logika preskoči.
    collection = FakeCollection(
        [
            {
                "_id": "mod_001",
                "learning_units": [
                    {
                        "learning_unit_id": "ue_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    },
                    "invalid-item",
                ],
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=[],
    )

    assert result == [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        }
    ]


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_treats_invalid_prerequisites_as_empty():
    # Če prerequisites ni seznam, se obravnava kot prazen seznam.
    collection = FakeCollection(
        [
            {
                "_id": "mod_001",
                "learning_units": [
                    {
                        "learning_unit_id": "ue_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": "not-a-list",
                    }
                ],
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = ModuleRepository(database)

    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=[],
    )

    assert result == [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": "not-a-list",
        }
    ]