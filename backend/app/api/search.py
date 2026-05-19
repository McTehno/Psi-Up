from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.database.mongodb import get_database
from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository
from app.schemas.search_schema import (
    SearchContentType,
    SearchResponse,
)
from app.services.search.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


def get_search_service() -> SearchService:
    """
    Vrne SearchService instanco.

    Ustvari povezavo:
    database -> repositories -> SearchService.
    """

    database = get_database()

    learning_path_repository = LearningPathRepository(database)
    module_repository = ModuleRepository(database)
    learning_unit_repository = LearningUnitRepository(database)

    return SearchService(
        learning_path_repository=learning_path_repository,
        module_repository=module_repository,
        learning_unit_repository=learning_unit_repository,
    )


@router.get("", response_model=SearchResponse)
async def search_content(
    query: str = Query(..., description="Iskalni niz, ki ga vnese uporabnik."),
    types: Optional[List[SearchContentType]] = Query(
        default=None,
        description="Tipi vsebin, po katerih iščemo."
    ),
    search_service: SearchService = Depends(get_search_service),
) -> SearchResponse:
    """
    Izvede iskanje po učnih poteh, modulih in učnih enotah.
    """

    results = await search_service.search(query=query, types=types)

    return SearchResponse(
        query=query,
        types=types or [
            SearchContentType.LEARNING_PATH,
            SearchContentType.MODULE,
            SearchContentType.LEARNING_UNIT,
        ],
        results=results,
    )