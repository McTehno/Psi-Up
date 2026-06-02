from fastapi.testclient import TestClient

from app.api.search import (
    normalize_search_types,
    normalize_single_search_type,
    get_search_service,
)
from app.main import app
from app.schemas.search_schema import SearchContentType


class FakeSearchService:
    # Fake service uporabimo, da API test preverja endpoint in normalizacijo,
    # ne pa dejanske search logike ali MongoDB.
    async def search(self, query: str, types):
        return []


def override_search_service():
    return FakeSearchService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake SearchService.
    app.dependency_overrides[get_search_service] = override_search_service


def teardown_function():
    # Po vsakem testu počistimo dependency override.
    app.dependency_overrides.clear()


def test_normalize_single_search_type_accepts_learning_path_aliases():
    # Learning path aliasi se normalizirajo v SearchContentType.LEARNING_PATH.
    aliases = [
        "learning_path",
        "learning_paths",
        "learningpath",
        "learningpaths",
        "ucna_pot",
        "ucne_poti",
        "učna_pot",
        "učne_poti",
        "Learning paths",
        "learning-path",
    ]

    for alias in aliases:
        result = normalize_single_search_type(alias)

        assert result == SearchContentType.LEARNING_PATH


def test_normalize_single_search_type_accepts_module_aliases():
    # Module aliasi se normalizirajo v SearchContentType.MODULE.
    aliases = [
        "module",
        "modules",
        "modul",
        "moduli",
        "Modules",
    ]

    for alias in aliases:
        result = normalize_single_search_type(alias)

        assert result == SearchContentType.MODULE


def test_normalize_single_search_type_accepts_learning_unit_aliases():
    # Learning unit aliasi se normalizirajo v SearchContentType.LEARNING_UNIT.
    aliases = [
        "learning_unit",
        "learning_units",
        "learningunit",
        "learningunits",
        "ucna_enota",
        "ucne_enote",
        "učna_enota",
        "učne_enote",
        "Learning units",
        "learning-unit",
    ]

    for alias in aliases:
        result = normalize_single_search_type(alias)

        assert result == SearchContentType.LEARNING_UNIT


def test_normalize_single_search_type_rejects_invalid_type():
    # Napačen search type mora vrniti HTTPException 422.
    try:
        normalize_single_search_type("invalid_type")
    except Exception as error:
        assert error.status_code == 422
        assert "Neveljaven search type" in error.detail
    else:
        raise AssertionError("Expected HTTPException was not raised.")


def test_normalize_search_types_returns_none_when_raw_types_missing():
    # Če types niso podani, SearchService kasneje išče po vseh tipih.
    result = normalize_search_types(None)

    assert result is None


def test_normalize_search_types_returns_none_when_raw_types_empty():
    # Prazen seznam types se obravnava kot None.
    result = normalize_search_types([])

    assert result is None


def test_normalize_search_types_accepts_single_type():
    # En type se normalizira v seznam z enim SearchContentType.
    result = normalize_search_types(["module"])

    assert result == [SearchContentType.MODULE]


def test_normalize_search_types_accepts_multiple_type_params():
    # Podpira format ?types=module&types=learning_unit.
    result = normalize_search_types(["module", "learning_unit"])

    assert result == [
        SearchContentType.MODULE,
        SearchContentType.LEARNING_UNIT,
    ]


def test_normalize_search_types_accepts_comma_separated_types():
    # Podpira format ?types=module,learning_unit.
    result = normalize_search_types(["module,learning_unit"])

    assert result == [
        SearchContentType.MODULE,
        SearchContentType.LEARNING_UNIT,
    ]


def test_normalize_search_types_removes_duplicates():
    # Če se isti type pojavi večkrat, ostane samo enkrat.
    result = normalize_search_types(["module", "modules", "modul"])

    assert result == [SearchContentType.MODULE]


def test_normalize_search_types_ignores_empty_values():
    # Prazne vrednosti znotraj types se ignorirajo.
    result = normalize_search_types(["", "module", ""])

    assert result == [SearchContentType.MODULE]


def test_search_content_without_types_returns_results():
    # Endpoint deluje tudi brez types parametra.
    response = client.get(
        "/api/search",
        params={
            "query": "excel",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert data["results"] == []


def test_search_content_with_single_type_returns_results():
    # Endpoint sprejme en search type.
    response = client.get(
        "/api/search",
        params={
            "query": "excel",
            "types": "module",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert data["results"] == []


def test_search_content_with_multiple_types_returns_results():
    # Endpoint sprejme več types parametrov.
    response = client.get(
        "/api/search",
        params=[
            ("query", "excel"),
            ("types", "module"),
            ("types", "learning_unit"),
        ],
    )

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert data["results"] == []


def test_search_content_with_comma_separated_types_returns_results():
    # Endpoint sprejme comma-separated types.
    response = client.get(
        "/api/search",
        params={
            "query": "excel",
            "types": "module,learning_unit",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert data["results"] == []


def test_search_content_accepts_slovenian_type_aliases():
    # Endpoint sprejme slovenske alias-e za tipe vsebin.
    response = client.get(
        "/api/search",
        params={
            "query": "excel",
            "types": "učne_enote",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "results" in data
    assert data["results"] == []


def test_search_content_returns_422_for_invalid_type():
    # Napačen type se zavrne z 422.
    response = client.get(
        "/api/search",
        params={
            "query": "excel",
            "types": "invalid_type",
        },
    )

    assert response.status_code == 422

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "Neveljaven search type" in data["error"]["message"]