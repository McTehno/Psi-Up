from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Query

from app.database.mongodb import get_database
from app.schemas.search_schema import SearchResponse, SearchResult

router = APIRouter(prefix="/search", tags=["Search"])


SEARCH_COLLECTIONS = {
    "learning_path": {
        "collection": "learning_paths",
        "title_fields": ["title", "name"],
        "description_fields": ["description", "summary"],
    },
    "module": {
        "collection": "modules",
        "title_fields": ["title", "name"],
        "description_fields": ["description", "summary"],
    },
    "learning_unit": {
        "collection": "learning_units",
        "title_fields": ["title", "name"],
        "description_fields": ["description", "summary", "content"],
    },
}


def normalize_object_id(value: Any) -> str:
    if isinstance(value, ObjectId):
        return str(value)

    if value is None:
        return ""

    return str(value)


def first_non_empty(document: Dict[str, Any], fields: List[str], fallback: str = "") -> str:
    for field in fields:
        value = document.get(field)

        if value is not None and str(value).strip():
            return str(value).strip()

    return fallback


def normalize_keywords(value: Any) -> List[str]:
    if value is None:
        return []

    if isinstance(value, list):
        return [str(item).strip() for item in value if item is not None and str(item).strip()]

    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]

    return []


def parse_types(types: Optional[str]) -> List[str]:
    if not types:
        return list(SEARCH_COLLECTIONS.keys())

    requested_types = [
        item.strip()
        for item in types.split(",")
        if item.strip()
    ]

    valid_types = [
        item
        for item in requested_types
        if item in SEARCH_COLLECTIONS
    ]

    return valid_types or list(SEARCH_COLLECTIONS.keys())


def build_search_filter(query: str) -> Dict[str, Any]:
    cleaned_query = query.strip()

    if not cleaned_query:
        return {}

    regex_filter = {"$regex": cleaned_query, "$options": "i"}

    return {
        "$or": [
            {"title": regex_filter},
            {"name": regex_filter},
            {"description": regex_filter},
            {"summary": regex_filter},
            {"content": regex_filter},
            {"keywords": regex_filter},
        ]
    }


def map_document_to_search_result(
    document: Dict[str, Any],
    result_type: str,
    title_fields: List[str],
    description_fields: List[str],
) -> SearchResult:
    document_id = (
        document.get("id")
        or document.get("_id")
        or document.get("path_id")
        or document.get("module_id")
        or document.get("unit_id")
    )

    title = first_non_empty(
        document=document,
        fields=title_fields,
        fallback="Brez naslova",
    )

    description = first_non_empty(
        document=document,
        fields=description_fields,
        fallback="",
    )

    return SearchResult(
        id=normalize_object_id(document_id),
        type=result_type,
        title=title,
        description=description,
        keywords=normalize_keywords(document.get("keywords")),
    )


@router.get("", response_model=SearchResponse)
async def search_content(
    query: str = Query(default=""),
    types: Optional[str] = Query(default=None),
) -> SearchResponse:
    database = get_database()

    selected_types = parse_types(types)
    search_filter = build_search_filter(query)

    results: List[SearchResult] = []

    for result_type in selected_types:
        config = SEARCH_COLLECTIONS[result_type]
        collection = database[config["collection"]]

        documents = collection.find(search_filter)

        for document in documents:
            results.append(
                map_document_to_search_result(
                    document=document,
                    result_type=result_type,
                    title_fields=config["title_fields"],
                    description_fields=config["description_fields"],
                )
            )

    return SearchResponse(results=results)