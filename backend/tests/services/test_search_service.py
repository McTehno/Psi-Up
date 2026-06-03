import pytest
from unittest.mock import AsyncMock

from app.schemas.search_schema import SearchContentType
from app.services.search.search_service import SearchService


# Mock repository-ja za učne poti.
@pytest.fixture
def learning_path_repository():
    return AsyncMock()


# Mock repository-ja za module.
@pytest.fixture
def module_repository():
    return AsyncMock()


# Mock repository-ja za učne enote.
@pytest.fixture
def learning_unit_repository():
    return AsyncMock()


# Glavni fixture za SearchService.
@pytest.fixture
def service(
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    return SearchService(
        learning_path_repository=learning_path_repository,
        module_repository=module_repository,
        learning_unit_repository=learning_unit_repository,
    )


def test_get_string_value_returns_string(service):
    # Če je vrednost string, jo service vrne.
    result = service._get_string_value("Osnove Excela")

    assert result == "Osnove Excela"


def test_get_string_value_returns_fallback_for_none(service):
    # Če je vrednost None, service vrne fallback.
    result = service._get_string_value(None, fallback="fallback")

    assert result == "fallback"


def test_get_string_value_returns_fallback_for_invalid_type(service):
    # Napačnih tipov ne pretvarjamo na silo v string.
    result = service._get_string_value(123, fallback="fallback")

    assert result == "fallback"


def test_get_string_list_value_accepts_valid_string_list(service):
    # Keywords se očistijo in prazni stringi se odstranijo.
    result = service._get_string_list_value([" Excel ", "", "podatki", None, 123])

    assert result == ["Excel", "podatki"]


def test_get_string_list_value_returns_empty_list_for_none(service):
    # Če vrednost ni list, service vrne prazen seznam.
    result = service._get_string_list_value(None)

    assert result == []


def test_get_string_list_value_returns_empty_list_for_invalid_type(service):
    # Če keywords pride kot string ali drug tip, service vrne prazen seznam.
    result = service._get_string_list_value("Excel, podatki")

    assert result == []


def test_to_search_result_maps_database_document_to_search_result(service):
    # Dokument iz baze se pretvori v enotno search result obliko.
    item = {
        "_id": "mod_001",
        "title": "Osnove Excela",
        "short_description": "Modul za osnovno uporabo Excela.",
        "keywords": ["Excel", "preglednice"],
    }

    result = service._to_search_result(item, SearchContentType.MODULE)

    assert result == {
        "id": "mod_001",
        "type": SearchContentType.MODULE,
        "title": "Osnove Excela",
        "short_description": "Modul za osnovno uporabo Excela.",
        "keywords": ["Excel", "preglednice"],
    }


def test_to_search_result_uses_id_when_mongo_id_is_missing(service):
    # Če _id ni prisoten, service uporabi id.
    item = {
        "id": "ue_001",
        "title": "Osnovni pojmi umetne inteligence",
        "short_description": "Opis učne enote.",
        "keywords": ["UI"],
    }

    result = service._to_search_result(item, SearchContentType.LEARNING_UNIT)

    assert result["id"] == "ue_001"
    assert result["type"] == SearchContentType.LEARNING_UNIT


def test_to_search_result_uses_safe_fallback_values(service):
    # Nepopoln dokument ne sme zlomiti search response-a.
    item = {
        "_id": None,
        "title": None,
        "short_description": 123,
        "keywords": [None, "", " Excel ", 123],
    }

    result = service._to_search_result(item, SearchContentType.MODULE)

    assert result == {
        "id": "",
        "type": SearchContentType.MODULE,
        "title": "",
        "short_description": "",
        "keywords": ["Excel"],
    }


@pytest.mark.asyncio
async def test_search_without_types_searches_all_content_types(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če types niso podani, service išče po vseh treh tipih.
    learning_path_repository.search_learning_paths.return_value = [
        {
            "_id": "lp_001",
            "title": "Učna pot",
            "short_description": "Opis učne poti.",
            "keywords": ["pot"],
        }
    ]
    module_repository.search_modules.return_value = [
        {
            "_id": "mod_001",
            "title": "Modul",
            "short_description": "Opis modula.",
            "keywords": ["modul"],
        }
    ]
    learning_unit_repository.search_learning_units.return_value = [
        {
            "_id": "ue_001",
            "title": "Učna enota",
            "short_description": "Opis učne enote.",
            "keywords": ["enota"],
        }
    ]

    result = await service.search(query="test", types=None)

    assert result == [
        {
            "id": "lp_001",
            "type": SearchContentType.LEARNING_PATH,
            "title": "Učna pot",
            "short_description": "Opis učne poti.",
            "keywords": ["pot"],
        },
        {
            "id": "mod_001",
            "type": SearchContentType.MODULE,
            "title": "Modul",
            "short_description": "Opis modula.",
            "keywords": ["modul"],
        },
        {
            "id": "ue_001",
            "type": SearchContentType.LEARNING_UNIT,
            "title": "Učna enota",
            "short_description": "Opis učne enote.",
            "keywords": ["enota"],
        },
    ]

    learning_path_repository.search_learning_paths.assert_awaited_once_with("test")
    module_repository.search_modules.assert_awaited_once_with("test")
    learning_unit_repository.search_learning_units.assert_awaited_once_with("test")


@pytest.mark.asyncio
async def test_search_with_learning_path_type_searches_only_learning_paths(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če je izbran samo learning_path, service ne kliče module/unit repository-jev.
    learning_path_repository.search_learning_paths.return_value = [
        {
            "_id": "lp_001",
            "title": "Učna pot",
            "short_description": "Opis.",
            "keywords": [],
        }
    ]

    result = await service.search(
        query="test",
        types=[SearchContentType.LEARNING_PATH],
    )

    assert len(result) == 1
    assert result[0]["type"] == SearchContentType.LEARNING_PATH
    assert result[0]["id"] == "lp_001"

    learning_path_repository.search_learning_paths.assert_awaited_once_with("test")
    module_repository.search_modules.assert_not_called()
    learning_unit_repository.search_learning_units.assert_not_called()


@pytest.mark.asyncio
async def test_search_with_module_type_searches_only_modules(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če je izbran samo module, service kliče samo module repository.
    module_repository.search_modules.return_value = [
        {
            "_id": "mod_001",
            "title": "Modul",
            "short_description": "Opis.",
            "keywords": [],
        }
    ]

    result = await service.search(
        query="test",
        types=[SearchContentType.MODULE],
    )

    assert len(result) == 1
    assert result[0]["type"] == SearchContentType.MODULE
    assert result[0]["id"] == "mod_001"

    learning_path_repository.search_learning_paths.assert_not_called()
    module_repository.search_modules.assert_awaited_once_with("test")
    learning_unit_repository.search_learning_units.assert_not_called()


@pytest.mark.asyncio
async def test_search_with_learning_unit_type_searches_only_learning_units(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če je izbran samo learning_unit, service kliče samo learning unit repository.
    learning_unit_repository.search_learning_units.return_value = [
        {
            "_id": "ue_001",
            "title": "Učna enota",
            "short_description": "Opis.",
            "keywords": [],
        }
    ]

    result = await service.search(
        query="test",
        types=[SearchContentType.LEARNING_UNIT],
    )

    assert len(result) == 1
    assert result[0]["type"] == SearchContentType.LEARNING_UNIT
    assert result[0]["id"] == "ue_001"

    learning_path_repository.search_learning_paths.assert_not_called()
    module_repository.search_modules.assert_not_called()
    learning_unit_repository.search_learning_units.assert_awaited_once_with("test")


@pytest.mark.asyncio
async def test_search_with_multiple_types_searches_selected_repositories(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če sta izbrana module in learning_unit, service ne išče po learning paths.
    module_repository.search_modules.return_value = [
        {
            "_id": "mod_001",
            "title": "Modul",
            "short_description": "Opis modula.",
            "keywords": ["modul"],
        }
    ]
    learning_unit_repository.search_learning_units.return_value = [
        {
            "_id": "ue_001",
            "title": "Učna enota",
            "short_description": "Opis učne enote.",
            "keywords": ["enota"],
        }
    ]

    result = await service.search(
        query="excel",
        types=[
            SearchContentType.MODULE,
            SearchContentType.LEARNING_UNIT,
        ],
    )

    assert result == [
        {
            "id": "mod_001",
            "type": SearchContentType.MODULE,
            "title": "Modul",
            "short_description": "Opis modula.",
            "keywords": ["modul"],
        },
        {
            "id": "ue_001",
            "type": SearchContentType.LEARNING_UNIT,
            "title": "Učna enota",
            "short_description": "Opis učne enote.",
            "keywords": ["enota"],
        },
    ]

    learning_path_repository.search_learning_paths.assert_not_called()
    module_repository.search_modules.assert_awaited_once_with("excel")
    learning_unit_repository.search_learning_units.assert_awaited_once_with("excel")


@pytest.mark.asyncio
async def test_search_skips_invalid_repository_items(
    service,
    learning_path_repository,
):
    # Če repository vrne ne-dict element, ga service preskoči.
    learning_path_repository.search_learning_paths.return_value = [
        {
            "_id": "lp_001",
            "title": "Učna pot",
            "short_description": "Opis.",
            "keywords": [],
        },
        "invalid-item",
    ]

    result = await service.search(
        query="test",
        types=[SearchContentType.LEARNING_PATH],
    )

    assert result == [
        {
            "id": "lp_001",
            "type": SearchContentType.LEARNING_PATH,
            "title": "Učna pot",
            "short_description": "Opis.",
            "keywords": [],
        }
    ]


@pytest.mark.asyncio
async def test_search_returns_empty_list_when_repositories_return_empty_lists(
    service,
    learning_path_repository,
    module_repository,
    learning_unit_repository,
):
    # Če repository-ji ne najdejo rezultatov, search vrne prazen seznam.
    learning_path_repository.search_learning_paths.return_value = []
    module_repository.search_modules.return_value = []
    learning_unit_repository.search_learning_units.return_value = []

    result = await service.search(query="missing", types=None)

    assert result == []