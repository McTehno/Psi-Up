from app.repositories.module_repository import ModuleRepository

from tests.repositories.fake_mongo import FakeCollection, FakeDatabase


def create_repository():
    # Pripravimo repository s fake modules kolekcijo.
    collection = FakeCollection(
        [
            {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
                "short_description": "Osnovni pojmi UI.",
                "keywords": ["UI", "umetna inteligenca"],
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
                ],
            },
            {
                "_id": "mod_002",
                "title": "Iskanje informacij z UI",
                "short_description": "Uporaba UI za iskanje informacij.",
                "keywords": ["iskanje"],
                "domains": ["Informacijska pismenost"],
                "learning_units": [],
            },
        ]
    )

    database = FakeDatabase(
        {
            "modules": collection,
        }
    )

    return ModuleRepository(database), collection


async def test_get_all_modules_returns_all_documents():
    # Preverimo, da repository vrne vse module iz kolekcije.
    repository, collection = create_repository()

    result = await repository.get_all_modules()

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_get_module_by_id_returns_matching_document():
    # Preverimo iskanje enega modula po _id.
    repository, collection = create_repository()

    result = await repository.get_module_by_id("mod_001")

    assert result["_id"] == "mod_001"
    assert collection.last_find_one_filter == {"_id": "mod_001"}


async def test_get_module_by_id_returns_none_when_missing():
    # Če modul ne obstaja, repository vrne None.
    repository, _ = create_repository()

    result = await repository.get_module_by_id("missing_id")

    assert result is None


async def test_get_modules_by_ids_preserves_requested_order():
    # Repository mora vrniti module v istem vrstnem redu, kot so podani ID-ji.
    repository, _ = create_repository()

    result = await repository.get_modules_by_ids(["mod_002", "mod_001"])

    assert [module["_id"] for module in result] == ["mod_002", "mod_001"]


async def test_get_modules_by_ids_returns_empty_list_for_empty_input():
    # Prazen seznam ID-jev ne sme sprožiti nepotrebnega iskanja v bazi.
    repository, _ = create_repository()

    result = await repository.get_modules_by_ids([])

    assert result == []


async def test_search_modules_returns_all_when_query_is_empty():
    # Prazen query pomeni, da repository vrne vse module.
    repository, collection = create_repository()

    result = await repository.search_modules("")

    assert len(result) == 2
    assert collection.last_find_filter == {}


async def test_search_modules_finds_matching_document():
    # Preverimo, da search najde modul po naslovu ali povezanih poljih.
    repository, _ = create_repository()

    result = await repository.search_modules("iskanje")

    assert len(result) == 1
    assert result[0]["_id"] == "mod_002"


async def test_get_learning_unit_references_for_module_returns_references():
    # Repository vrne reference učnih enot znotraj modula.
    repository, _ = create_repository()

    result = await repository.get_learning_unit_references_for_module("mod_001")

    assert len(result) == 2
    assert result[0]["learning_unit_id"] == "ue_001"


async def test_get_learning_unit_references_for_module_returns_empty_list_when_missing():
    # Če modul ne obstaja, repository vrne prazen seznam referenc.
    repository, _ = create_repository()

    result = await repository.get_learning_unit_references_for_module("missing_id")

    assert result == []


async def test_get_module_prerequisites_for_learning_unit_returns_prerequisites():
    # Preverimo predpogoje za določeno učno enoto znotraj modula.
    repository, _ = create_repository()

    result = await repository.get_module_prerequisites_for_learning_unit(
        module_id="mod_001",
        learning_unit_id="ue_002",
    )

    assert result == ["ue_001"]


async def test_get_available_learning_units_for_module_respects_prerequisites():
    # Dostopne so samo učne enote, katerih predpogoji so že zaključeni.
    repository, _ = create_repository()

    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=[],
    )

    assert [learning_unit["learning_unit_id"] for learning_unit in result] == ["ue_001"]


async def test_get_available_learning_units_for_module_returns_next_after_completion():
    # Ko je prvi prerequisite zaključen, postane dostopna tudi naslednja učna enota.
    repository, _ = create_repository()

    result = await repository.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=["ue_001"],
    )

    assert [learning_unit["learning_unit_id"] for learning_unit in result] == [
        "ue_001",
        "ue_002",
    ]