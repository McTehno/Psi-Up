from app.schemas.search_schema import (
    SearchContentType,
    SearchRequest,
    SearchResponse,
    SearchResult,
    SearchResultResponse,
)


def test_search_content_type_values_are_correct():
    # Search tipi morajo biti usklajeni s frontend filtri.
    assert SearchContentType.LEARNING_PATH == "learning_path"
    assert SearchContentType.MODULE == "module"
    assert SearchContentType.LEARNING_UNIT == "learning_unit"


def test_search_request_accepts_query_and_types():
    # Preverimo strukturo search requesta.
    request = SearchRequest(
        query="umetna inteligenca",
        types=[SearchContentType.LEARNING_UNIT],
    )

    assert request.query == "umetna inteligenca"
    assert request.types == [SearchContentType.LEARNING_UNIT]


def test_search_result_response_uses_default_keywords():
    # SearchResultResponse mora delovati tudi brez keywords.
    result = SearchResultResponse(
        id="ue_001",
        type=SearchContentType.LEARNING_UNIT,
        title="Osnove umetne inteligence",
    )

    assert result.id == "ue_001"
    assert result.type == SearchContentType.LEARNING_UNIT
    assert result.title == "Osnove umetne inteligence"
    assert result.short_description is None
    assert result.keywords == []


def test_search_result_normalizes_empty_title():
    # SearchResult nadomesti prazen naslov z varno privzeto vrednostjo.
    result = SearchResult(
        id="ue_001",
        type="learning_unit",
        title="",
    )

    assert result.title == "Brez naslova"


def test_search_result_normalizes_none_description():
    # SearchResult nadomesti None description s praznim stringom.
    result = SearchResult(
        id="ue_001",
        type="learning_unit",
        description=None,
    )

    assert result.description == ""


def test_search_result_normalizes_none_keywords():
    # SearchResult nadomesti None keywords s praznim seznamom.
    result = SearchResult(
        id="ue_001",
        type="learning_unit",
        keywords=None,
    )

    assert result.keywords == []


def test_search_result_normalizes_string_keywords():
    # SearchResult pretvori string keywords v očiščen seznam.
    result = SearchResult(
        id="ue_001",
        type="learning_unit",
        keywords="umetna inteligenca, UI, iskanje",
    )

    assert result.keywords == [
        "umetna inteligenca",
        "UI",
        "iskanje",
    ]


def test_search_result_normalizes_list_keywords():
    # SearchResult pretvori vse elemente keywords seznama v stringe in odstrani None.
    result = SearchResult(
        id="ue_001",
        type="learning_unit",
        keywords=["UI", 123, None],
    )

    assert result.keywords == ["UI", "123"]


def test_search_response_accepts_search_results():
    # Trenutni SearchResponse sprejme samo results seznam.
    response = SearchResponse(
        results=[
            {
                "id": "ue_001",
                "type": "learning_unit",
                "title": "Osnove umetne inteligence",
                "description": "Kratek opis.",
                "keywords": ["UI"],
            }
        ],
    )

    assert len(response.results) == 1
    assert response.results[0].id == "ue_001"
    assert response.results[0].type == "learning_unit"
    assert response.results[0].title == "Osnove umetne inteligence"
    assert response.results[0].description == "Kratek opis."
    assert response.results[0].keywords == ["UI"]