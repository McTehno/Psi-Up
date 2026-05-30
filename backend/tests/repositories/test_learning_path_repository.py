from app.repositories.learning_path_repository import LearningPathRepository

from tests.repositories.fake_mongo import FakeCollection, FakeDatabase


def create_repository():
    # Pripravimo repository s fake learning_paths kolekcijo.
    collection = FakeCollection(
        [
            {
                "_id": "up_001",
                "title": "Iskanje informacij z umetno inteligenco",
                "short_description": "Učna pot za uporabo UI pri iskanju informacij.",
                "keywords": ["UI", "iskanje informacij"],
                "modules": [
                    {
                        "module_id": "mod_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    },
                    {
                        "module_id": "mod_002",
                        "order": 2,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": ["mod_001"],
                    },
                ],
            },
            {
                "_id": "up_002",
                "title": "Digitalna varnost",
                "short_description": "Učna pot za digitalno varnost.",
                "keywords": ["varnost"],
                "modules": [],
            },
        ]
    )

    database = FakeDatabase(
        {
            "learning_paths": collection,
        }
    )

    return LearningPathRepository(database), collection


async def test_get_all_learning_paths_returns_all_documents():
    # Preverimo, da repository vrne vse učne poti iz kolekcije.
    repository, collection = create_repository()

    result = await repository.get_all_learning_paths()

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_get_learning_path_by_id_returns_matching_document():
    # Preverimo iskanje ene učne poti po _id.
    repository, collection = create_repository()

    result = await repository.get_learning_path_by_id("up_001")

    assert result["_id"] == "up_001"
    assert collection.last_find_one_filter == {"_id": "up_001"}


async def test_get_learning_path_by_id_returns_none_when_missing():
    # Če učna pot ne obstaja, repository vrne None.
    repository, _ = create_repository()

    result = await repository.get_learning_path_by_id("missing_id")

    assert result is None


async def test_search_learning_paths_returns_all_when_query_is_empty():
    # Prazen query pomeni, da repository vrne vse učne poti.
    repository, collection = create_repository()

    result = await repository.search_learning_paths("")

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_search_learning_paths_finds_matching_document():
    # Preverimo, da search najde učno pot po naslovu ali povezanih poljih.
    repository, _ = create_repository()

    result = await repository.search_learning_paths("varnost")

    assert len(result) == 1
    assert result[0]["_id"] == "up_002"


async def test_get_module_references_for_learning_path_returns_references():
    # Repository vrne reference modulov znotraj učne poti.
    repository, _ = create_repository()

    result = await repository.get_module_references_for_learning_path("up_001")

    assert len(result) == 2
    assert result[0]["module_id"] == "mod_001"


async def test_get_module_references_for_learning_path_returns_empty_list_when_missing():
    # Če učna pot ne obstaja, repository vrne prazen seznam referenc.
    repository, _ = create_repository()

    result = await repository.get_module_references_for_learning_path("missing_id")

    assert result == []


async def test_get_learning_path_prerequisites_for_module_returns_prerequisites():
    # Preverimo predpogoje za določen modul znotraj učne poti.
    repository, _ = create_repository()

    result = await repository.get_learning_path_prerequisites_for_module(
        learning_path_id="up_001",
        module_id="mod_002",
    )

    assert result == ["mod_001"]


async def test_get_available_modules_for_learning_path_respects_prerequisites():
    # Dostopni so samo moduli, katerih predpogoji so že zaključeni.
    repository, _ = create_repository()

    result = await repository.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=[],
    )

    assert [module["module_id"] for module in result] == ["mod_001"]


async def test_get_available_modules_for_learning_path_returns_next_after_completion():
    # Ko je prvi prerequisite zaključen, postane dostopen tudi naslednji modul.
    repository, _ = create_repository()

    result = await repository.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=["mod_001"],
    )

    assert [module["module_id"] for module in result] == [
        "mod_001",
        "mod_002",
    ]