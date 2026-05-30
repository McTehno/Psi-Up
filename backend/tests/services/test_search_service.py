from app.schemas.search_schema import SearchContentType
from app.services.search.search_service import SearchService


class FakeLearningPathRepository:
    # Fake repository za učne poti.
    async def search_learning_paths(self, query: str):
        return [
            {
                "_id": "up_001",
                "title": "Iskanje informacij z umetno inteligenco",
                "short_description": "Opis učne poti.",
                "keywords": ["UI", "iskanje"],
            }
        ]


class FakeModuleRepository:
    # Fake repository za module.
    async def search_modules(self, query: str):
        return [
            {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
                "short_description": "Opis modula.",
                "keywords": ["UI"],
            }
        ]


class FakeLearningUnitRepository:
    # Fake repository za učne enote.
    async def search_learning_units(self, query: str):
        return [
            {
                "_id": "ue_001",
                "title": "Kaj je umetna inteligenca?",
                "short_description": "Opis učne enote.",
                "keywords": ["umetna inteligenca"],
            }
        ]


def create_service():
    # Pripravimo SearchService s fake repository slojem.
    return SearchService(
        learning_path_repository=FakeLearningPathRepository(),
        module_repository=FakeModuleRepository(),
        learning_unit_repository=FakeLearningUnitRepository(),
    )


async def test_search_returns_all_content_types_when_types_are_not_provided():
    # Če tipi niso podani, service išče po učnih poteh, modulih in učnih enotah.
    service = create_service()

    result = await service.search(query="umetna inteligenca", types=None)

    assert len(result) == 3
    assert result[0]["type"] == SearchContentType.LEARNING_PATH
    assert result[1]["type"] == SearchContentType.MODULE
    assert result[2]["type"] == SearchContentType.LEARNING_UNIT


async def test_search_returns_only_selected_content_type():
    # Če je izbran samo en tip, service vrne samo rezultate tega tipa.
    service = create_service()

    result = await service.search(
        query="umetna inteligenca",
        types=[SearchContentType.LEARNING_UNIT],
    )

    assert len(result) == 1
    assert result[0]["id"] == "ue_001"
    assert result[0]["type"] == SearchContentType.LEARNING_UNIT


async def test_search_result_has_common_shape():
    # Vsak search rezultat mora imeti enotno obliko za frontend.
    service = create_service()

    result = await service.search(
        query="umetna inteligenca",
        types=[SearchContentType.LEARNING_PATH],
    )

    first_result = result[0]

    assert first_result["id"] == "up_001"
    assert first_result["title"] == "Iskanje informacij z umetno inteligenco"
    assert first_result["short_description"] == "Opis učne poti."
    assert first_result["keywords"] == ["UI", "iskanje"]


async def test_search_result_uses_id_when_mongodb_id_is_missing():
    # Service podpira tudi dokumente, ki imajo id namesto _id.
    service = create_service()

    result = service._to_search_result(
        item={
            "id": "custom_001",
            "title": "Testni rezultat",
            "short_description": "Opis.",
            "keywords": [],
        },
        content_type=SearchContentType.MODULE,
    )

    assert result["id"] == "custom_001"
    assert result["type"] == SearchContentType.MODULE