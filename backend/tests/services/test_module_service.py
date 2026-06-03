import pytest
from unittest.mock import AsyncMock

from app.services.modules.module_service import ModuleService


# Mock repository-ja za module.
# Tako testiramo service logiko brez povezave z MongoDB.
@pytest.fixture
def module_repository():
    return AsyncMock()


# Mock service-a za učne enote.
# Uporablja se pri detail prikazu in vprašanjih za samooceno.
@pytest.fixture
def learning_unit_service():
    return AsyncMock()


# Mock repository-ja za učne poti.
# Uporablja se samo pri recommended_learning_paths na detail strani modula.
@pytest.fixture
def learning_path_repository():
    return AsyncMock()


# Glavni fixture za ModuleService.
# Vsak test dobi svežo instanco service-a z mock dependency-ji.
@pytest.fixture
def service(
    module_repository,
    learning_unit_service,
    learning_path_repository,
):
    return ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
        learning_path_repository=learning_path_repository,
    )


def test_normalize_learning_unit_reference_returns_valid_reference(service):
    # Arrange: pripravimo veljavno referenco učne enote z odvečnimi presledki.
    reference = {
        "learning_unit_id": " ue_001 ",
        "order": 2,
        "parallel_group": " group_a ",
        "is_required": False,
        "prerequisites": [" ue_000 ", "", 123, "ue_099"],
    }

    # Act: normaliziramo eno referenco učne enote.
    result = service._normalize_learning_unit_reference(reference)

    # Assert: vrednosti so očiščene, neveljavni prerequisites pa odstranjeni.
    assert result == {
        "learning_unit_id": "ue_001",
        "order": 2,
        "parallel_group": "group_a",
        "is_required": False,
        "prerequisites": ["ue_000", "ue_099"],
    }


def test_normalize_learning_unit_reference_skips_missing_learning_unit_id(service):
    # Arrange: referenca nima veljavnega learning_unit_id.
    reference = {
        "learning_unit_id": "",
        "order": 1,
    }

    # Act: poskusimo normalizirati neveljavno referenco.
    result = service._normalize_learning_unit_reference(reference)

    # Assert: referenca brez learning_unit_id se preskoči.
    assert result is None


def test_normalize_learning_unit_reference_uses_default_values(service):
    # Arrange: referenca vsebuje samo obvezen learning_unit_id.
    reference = {
        "learning_unit_id": "ue_001",
    }

    # Act: normaliziramo referenco.
    result = service._normalize_learning_unit_reference(reference)

    # Assert: manjkajoča optional polja dobijo varne privzete vrednosti.
    assert result == {
        "learning_unit_id": "ue_001",
        "order": 0,
        "parallel_group": None,
        "is_required": True,
        "prerequisites": [],
    }


def test_normalize_learning_unit_references_skips_invalid_items_and_sorts_by_order(service):
    # Arrange: seznam vsebuje veljavne, neveljavne in napačno urejene reference.
    references = [
        {
            "learning_unit_id": "ue_002",
            "order": 2,
        },
        "invalid-item",
        {
            "learning_unit_id": "ue_001",
            "order": 1,
        },
        {
            "learning_unit_id": "",
            "order": 3,
        },
    ]

    # Act: normaliziramo seznam referenc učnih enot.
    result = service._normalize_learning_unit_references(references)

    # Assert: neveljavni elementi so odstranjeni, veljavni pa urejeni po order.
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
            "prerequisites": [],
        },
    ]


def test_normalize_module_normalizes_basic_fields_and_learning_units(service):
    # Arrange: modul vsebuje nečiste stringe, neveljavne keywords/domains in learning_units.
    module = {
        "_id": "mod_001",
        "title": " Razumevanje umetne inteligence ",
        "short_description": None,
        "duration_hours": 1.75,
        "keywords": [" UI ", "", 123, "GenUI"],
        "domains": [" Umetna inteligenca ", None, "Digitalne vsebine"],
        "learning_units": [
            {
                "learning_unit_id": "ue_002",
                "order": 2,
            },
            {
                "learning_unit_id": "ue_001",
                "order": 1,
            },
            "invalid-item",
        ],
    }

    # Act: normaliziramo modul.
    result = service._normalize_module(module)

    # Assert: modul ima stabilno API strukturo.
    assert result["_id"] == "mod_001"
    assert result["title"] == "Razumevanje umetne inteligence"
    assert result["short_description"] == ""
    assert result["duration_hours"] == 1.75
    assert result["keywords"] == ["UI", "GenUI"]
    assert result["domains"] == ["Umetna inteligenca", "Digitalne vsebine"]
    assert result["learning_units"] == [
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
            "prerequisites": [],
        },
    ]


def test_normalize_recommended_learning_path_returns_short_learning_path(service):
    # Arrange: pripravimo learning path z dodatnimi polji, ki jih detail modula ne potrebuje.
    learning_path = {
        "_id": " up_001 ",
        "title": " Iskanje informacij z UI ",
        "short_description": " Opis učne poti. ",
        "duration_hours": 4.25,
        "keywords": [" UI ", "", 123, "iskanje"],
        "steps": [],
    }

    # Act: normaliziramo priporočeno učno pot.
    result = service._normalize_recommended_learning_path(learning_path)

    # Assert: rezultat vsebuje samo kratek prikaz učne poti.
    assert result == {
        "_id": "up_001",
        "title": "Iskanje informacij z UI",
        "short_description": "Opis učne poti.",
        "duration_hours": 4.25,
        "keywords": ["UI", "iskanje"],
    }


@pytest.mark.asyncio
async def test_get_all_modules_returns_normalized_modules(
    service,
    module_repository,
):
    # Arrange: repository vrne en veljaven modul in en neveljaven element.
    module_repository.get_all_modules.return_value = [
        {
            "_id": "mod_001",
            "title": " Modul 1 ",
            "short_description": None,
            "keywords": [" test "],
            "domains": [" domena "],
            "learning_units": [],
        },
        "invalid-item",
    ]

    # Act: service pridobi vse module.
    result = await service.get_all_modules()

    # Assert: service vrne samo normalizirane module.
    assert result == [
        {
            "_id": "mod_001",
            "title": "Modul 1",
            "short_description": "",
            "keywords": ["test"],
            "domains": ["domena"],
            "learning_units": [],
        }
    ]

    module_repository.get_all_modules.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_module_by_id_returns_none_when_not_found(
    service,
    module_repository,
):
    # Arrange: repository ne najde modula.
    module_repository.get_module_by_id.return_value = None

    # Act: poskusimo pridobiti neobstoječ modul.
    result = await service.get_module_by_id("missing_id")

    # Assert: service vrne None, ker modul ne obstaja.
    assert result is None
    module_repository.get_module_by_id.assert_awaited_once_with("missing_id")


@pytest.mark.asyncio
async def test_get_module_by_id_returns_normalized_module(
    service,
    module_repository,
):
    # Arrange: repository vrne modul z nečistimi vrednostmi.
    module_repository.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": " Modul 1 ",
        "short_description": " Opis ",
        "keywords": [" a ", "b"],
        "domains": [" domena "],
        "learning_units": [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
            }
        ],
    }

    # Act: pridobimo modul po ID-ju.
    result = await service.get_module_by_id("mod_001")

    # Assert: modul je normaliziran pred vračanjem response-a.
    assert result == {
        "_id": "mod_001",
        "title": "Modul 1",
        "short_description": "Opis",
        "keywords": ["a", "b"],
        "domains": ["domena"],
        "learning_units": [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    }


@pytest.mark.asyncio
async def test_get_modules_by_ids_returns_normalized_modules(
    service,
    module_repository,
):
    # Arrange: repository vrne module za podane ID-je.
    module_repository.get_modules_by_ids.return_value = [
        {
            "_id": "mod_002",
            "title": " Modul 2 ",
            "short_description": " Opis 2 ",
            "keywords": [],
            "domains": [],
            "learning_units": [],
        },
        {
            "_id": "mod_001",
            "title": " Modul 1 ",
            "short_description": " Opis 1 ",
            "keywords": [" test "],
            "domains": [" domena "],
            "learning_units": [],
        },
    ]

    # Act: pridobimo več modulov po ID-jih.
    result = await service.get_modules_by_ids(["mod_002", "mod_001"])

    # Assert: service normalizira vse module, ki jih vrne repository.
    assert result == [
        {
            "_id": "mod_002",
            "title": "Modul 2",
            "short_description": "Opis 2",
            "keywords": [],
            "domains": [],
            "learning_units": [],
        },
        {
            "_id": "mod_001",
            "title": "Modul 1",
            "short_description": "Opis 1",
            "keywords": ["test"],
            "domains": ["domena"],
            "learning_units": [],
        },
    ]

    module_repository.get_modules_by_ids.assert_awaited_once_with(["mod_002", "mod_001"])


@pytest.mark.asyncio
async def test_get_module_detail_adds_learning_unit_details_and_recommended_paths(
    service,
    module_repository,
    learning_unit_service,
    learning_path_repository,
):
    # Arrange: modul vsebuje reference učnih enot.
    module_repository.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
        "short_description": "Opis.",
        "keywords": [],
        "domains": [],
        "learning_units": [
            {
                "learning_unit_id": "ue_002",
                "order": 2,
            },
            {
                "learning_unit_id": "ue_001",
                "order": 1,
            },
        ],
    }

    # Arrange: learning unit service vrne podrobnosti učnih enot.
    learning_unit_service.get_learning_units_by_ids.return_value = [
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
        },
        {
            "_id": "ue_002",
            "title": "Učna enota 2",
        },
    ]

    # Arrange: learning path repository vrne učne poti, ki vsebujejo modul.
    learning_path_repository.get_learning_paths_by_module_id.return_value = [
        {
            "_id": "up_001",
            "title": " Učna pot 1 ",
            "short_description": " Opis poti. ",
            "duration_hours": 4.25,
            "keywords": [" UI ", "", 123],
            "steps": [],
        }
    ]

    # Act: pridobimo detail podatke modula.
    result = await service.get_module_detail("mod_001")

    # Assert: detail response vsebuje normalizirane learning_units, details in recommended paths.
    assert result is not None
    assert result["_id"] == "mod_001"
    assert result["learning_units"] == [
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
            "prerequisites": [],
        },
    ]
    assert result["learning_unit_details"] == [
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
        },
        {
            "_id": "ue_002",
            "title": "Učna enota 2",
        },
    ]
    assert result["recommended_learning_paths"] == [
        {
            "_id": "up_001",
            "title": "Učna pot 1",
            "short_description": "Opis poti.",
            "duration_hours": 4.25,
            "keywords": ["UI"],
        }
    ]

    learning_unit_service.get_learning_units_by_ids.assert_awaited_once_with(
        ["ue_001", "ue_002"]
    )
    learning_path_repository.get_learning_paths_by_module_id.assert_awaited_once_with(
        module_id="mod_001",
        limit=6,
    )


@pytest.mark.asyncio
async def test_get_module_detail_returns_none_when_module_not_found(
    service,
    module_repository,
    learning_unit_service,
    learning_path_repository,
):
    # Arrange: repository ne najde modula.
    module_repository.get_module_by_id.return_value = None

    # Act: poskusimo pridobiti detail za neobstoječ modul.
    result = await service.get_module_detail("missing_id")

    # Assert: service vrne None in ne kliče dodatnih dependency-jev.
    assert result is None
    learning_unit_service.get_learning_units_by_ids.assert_not_called()
    learning_path_repository.get_learning_paths_by_module_id.assert_not_called()


@pytest.mark.asyncio
async def test_get_module_detail_works_without_learning_path_repository(
    module_repository,
    learning_unit_service,
):
    # Arrange: service lahko deluje tudi brez learning_path_repository.
    service = ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
        learning_path_repository=None,
    )

    module_repository.get_module_by_id.return_value = {
        "_id": "mod_001",
        "title": "Modul 1",
        "short_description": "Opis.",
        "keywords": [],
        "domains": [],
        "learning_units": [],
    }

    learning_unit_service.get_learning_units_by_ids.return_value = []

    # Act: pridobimo detail modula brez recommended learning paths dependency-ja.
    result = await service.get_module_detail("mod_001")

    # Assert: recommended_learning_paths je prazen seznam.
    assert result is not None
    assert result["recommended_learning_paths"] == []
    learning_unit_service.get_learning_units_by_ids.assert_awaited_once_with([])


@pytest.mark.asyncio
async def test_get_learning_unit_references_for_module_returns_normalized_references(
    service,
    module_repository,
):
    # Arrange: repository vrne learning unit reference v napačnem vrstnem redu.
    module_repository.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_002",
            "order": 2,
        },
        {
            "learning_unit_id": "ue_001",
            "order": 1,
        },
    ]

    # Act: pridobimo reference učnih enot za modul.
    result = await service.get_learning_unit_references_for_module("mod_001")

    # Assert: service vrne normalizirane reference, urejene po order.
    assert [reference["learning_unit_id"] for reference in result] == ["ue_001", "ue_002"]
    module_repository.get_learning_unit_references_for_module.assert_awaited_once_with(
        "mod_001"
    )


@pytest.mark.asyncio
async def test_get_available_learning_units_for_module_returns_normalized_references(
    service,
    module_repository,
):
    # Arrange: repository vrne available learning units.
    module_repository.get_available_learning_units_for_module.return_value = [
        {
            "learning_unit_id": "ue_002",
            "order": 2,
            "prerequisites": [" ue_001 ", "", 123],
        },
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "prerequisites": [],
        },
    ]

    # Act: pridobimo dostopne učne enote.
    result = await service.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=["ue_001"],
    )

    # Assert: service normalizira in uredi available learning units.
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

    module_repository.get_available_learning_units_for_module.assert_awaited_once_with(
        "mod_001",
        ["ue_001"],
    )


@pytest.mark.asyncio
async def test_get_self_assessment_questions_for_module_collects_questions_from_learning_units(
    service,
    module_repository,
    learning_unit_service,
):
    # Arrange: modul vsebuje dve učni enoti.
    module_repository.get_learning_unit_references_for_module.return_value = [
        {
            "learning_unit_id": "ue_001",
            "order": 1,
        },
        {
            "learning_unit_id": "ue_002",
            "order": 2,
        },
    ]

    # Arrange: learning unit service vrne vprašanja za vsako učno enoto.
    learning_unit_service.get_self_assessment_questions.side_effect = [
        [
            {
                "id": "q_ue_001_001",
                "question": "Razumem prvo učno enoto.",
                "learning_unit_id": "ue_001",
            }
        ],
        [
            {
                "id": "q_ue_002_001",
                "question": "Razumem drugo učno enoto.",
            },
            "invalid-question",
        ],
    ]

    # Act: pridobimo vprašanja za celoten modul.
    result = await service.get_self_assessment_questions_for_module("mod_001")

    # Assert: vprašanja dobijo module_id in learning_unit_id.
    assert result == [
        {
            "id": "q_ue_001_001",
            "question": "Razumem prvo učno enoto.",
            "learning_unit_id": "ue_001",
            "module_id": "mod_001",
        },
        {
            "id": "q_ue_002_001",
            "question": "Razumem drugo učno enoto.",
            "module_id": "mod_001",
            "learning_unit_id": "ue_002",
        },
    ]

    assert learning_unit_service.get_self_assessment_questions.await_count == 2
    learning_unit_service.get_self_assessment_questions.assert_any_await("ue_001")
    learning_unit_service.get_self_assessment_questions.assert_any_await("ue_002")