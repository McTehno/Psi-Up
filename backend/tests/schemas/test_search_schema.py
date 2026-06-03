import pytest
from pydantic import ValidationError

from app.schemas.search_schema import (
    SearchContentType,
    SearchRequest,
    SearchResponse,
    SearchResult,
    SearchResultResponse,
)


def test_search_content_type_values():
    # Enum mora imeti tri tipe vsebin, ki jih search podpira.
    assert SearchContentType.LEARNING_PATH == "learning_path"
    assert SearchContentType.MODULE == "module"
    assert SearchContentType.LEARNING_UNIT == "learning_unit"


def test_search_request_accepts_valid_data():
    # SearchRequest sprejme query in seznam tipov.
    request = SearchRequest(
        query="excel",
        types=[
            SearchContentType.MODULE,
            SearchContentType.LEARNING_UNIT,
        ],
    )

    assert request.query == "excel"
    assert request.types == [
        SearchContentType.MODULE,
        SearchContentType.LEARNING_UNIT,
    ]


def test_search_request_uses_default_empty_types():
    # Če types niso podani, je seznam prazen.
    request = SearchRequest(
        query="excel",
    )

    assert request.query == "excel"
    assert request.types == []


def test_search_request_requires_query():
    # query je obvezen v SearchRequest.
    with pytest.raises(ValidationError):
        SearchRequest()


def test_search_request_rejects_invalid_type():
    # Neveljaven type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        SearchRequest(
            query="excel",
            types=["invalid_type"],
        )


def test_search_result_response_accepts_valid_data():
    # SearchResultResponse je starejša/ločena response shema za en rezultat.
    result = SearchResultResponse(
        id="mod_001",
        type=SearchContentType.MODULE,
        title="Osnove Excela",
        short_description="Modul za osnovno uporabo Excela.",
        keywords=["Excel", "preglednice"],
    )

    assert result.id == "mod_001"
    assert result.type == SearchContentType.MODULE
    assert result.title == "Osnove Excela"
    assert result.short_description == "Modul za osnovno uporabo Excela."
    assert result.keywords == ["Excel", "preglednice"]


def test_search_result_response_uses_default_values():
    # short_description je optional, keywords pa privzeto prazen seznam.
    result = SearchResultResponse(
        id="mod_001",
        type=SearchContentType.MODULE,
        title="Osnove Excela",
    )

    assert result.short_description is None
    assert result.keywords == []


def test_search_result_response_requires_id_type_and_title():
    # id, type in title so obvezni.
    with pytest.raises(ValidationError):
        SearchResultResponse(
            type=SearchContentType.MODULE,
            title="Osnove Excela",
        )

    with pytest.raises(ValidationError):
        SearchResultResponse(
            id="mod_001",
            title="Osnove Excela",
        )

    with pytest.raises(ValidationError):
        SearchResultResponse(
            id="mod_001",
            type=SearchContentType.MODULE,
        )


def test_search_result_accepts_valid_data():
    # SearchResult je trenutna shema, ki jo uporablja zadnji SearchResponse.
    result = SearchResult(
        id="mod_001",
        type="module",
        title="Osnove Excela",
        description="Modul za osnovno uporabo Excela.",
        keywords=["Excel", "preglednice"],
    )

    assert result.id == "mod_001"
    assert result.type == "module"
    assert result.title == "Osnove Excela"
    assert result.description == "Modul za osnovno uporabo Excela."
    assert result.keywords == ["Excel", "preglednice"]


def test_search_result_normalizes_missing_title_to_default():
    # Če title pride kot None, validator nastavi "Brez naslova".
    result = SearchResult(
        id="mod_001",
        type="module",
        title=None,
    )

    assert result.title == "Brez naslova"


def test_search_result_uses_default_title_when_missing():
    # Če title sploh ni podan, se uporabi default vrednost.
    result = SearchResult(
        id="mod_001",
        type="module",
    )

    assert result.title == "Brez naslova"


def test_search_result_normalizes_missing_description_to_empty_string():
    # Če description pride kot None, validator nastavi prazen string.
    result = SearchResult(
        id="mod_001",
        type="module",
        description=None,
    )

    assert result.description == ""


def test_search_result_uses_default_description_when_missing():
    # Če description ni podan, je privzeto prazen string.
    result = SearchResult(
        id="mod_001",
        type="module",
    )

    assert result.description == ""


def test_search_result_normalizes_none_keywords_to_empty_list():
    # Če keywords pride kot None, validator nastavi prazen seznam.
    result = SearchResult(
        id="mod_001",
        type="module",
        keywords=None,
    )

    assert result.keywords == []


def test_search_result_accepts_keywords_as_list_and_converts_items_to_strings():
    # Če keywords pride kot list, se vrednosti pretvorijo v stringe, None se odstrani.
    result = SearchResult(
        id="mod_001",
        type="module",
        keywords=["Excel", 123, None],
    )

    assert result.keywords == ["Excel", "123"]


def test_search_result_accepts_keywords_as_comma_separated_string():
    # Če keywords pride kot string, se razdeli po vejici.
    result = SearchResult(
        id="mod_001",
        type="module",
        keywords="Excel, preglednice, podatki",
    )

    assert result.keywords == ["Excel", "preglednice", "podatki"]


def test_search_result_normalizes_invalid_keywords_to_empty_list():
    # Če keywords ni list/string/None, validator vrne prazen seznam.
    result = SearchResult(
        id="mod_001",
        type="module",
        keywords=123,
    )

    assert result.keywords == []


def test_search_result_requires_id_and_type():
    # id in type sta obvezna.
    with pytest.raises(ValidationError):
        SearchResult(
            type="module",
        )

    with pytest.raises(ValidationError):
        SearchResult(
            id="mod_001",
        )


def test_search_response_accepts_results():
    # Trenutni SearchResponse vsebuje samo results.
    response = SearchResponse(
        results=[
            {
                "id": "mod_001",
                "type": "module",
                "title": "Osnove Excela",
                "description": "Opis modula.",
                "keywords": ["Excel"],
            }
        ]
    )

    assert len(response.results) == 1
    assert response.results[0].id == "mod_001"
    assert response.results[0].type == "module"
    assert response.results[0].title == "Osnove Excela"


def test_search_response_uses_default_empty_results():
    # Če results niso podani, je seznam prazen.
    response = SearchResponse()

    assert response.results == []


def test_search_response_uses_independent_default_results_lists():
    # Default results seznam ne sme biti deljen med instancami.
    first_response = SearchResponse()
    second_response = SearchResponse()

    first_response.results.append(
        SearchResult(
            id="mod_001",
            type="module",
        )
    )

    assert len(first_response.results) == 1
    assert second_response.results == []