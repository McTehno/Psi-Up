from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.schemas.search_schema import (
    SearchContentType,
    SearchResponse,
)
from app.services.search.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


def get_search_service() -> SearchService:
    """
    Vrne SearchService instanco.

    TODO:
    - Povezati z dejanskimi repository-ji.
    - Dodati dependency injection za database.
    - Trenutno je funkcija pripravljena kot placeholder.
    """

    # TODO:
    # Tukaj kasneje ustvarimo:
    # - LearningPathRepository
    # - ModuleRepository
    # - LearningUnitRepository
    # - SearchService

    raise NotImplementedError("SearchService dependency še ni implementiran.")


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

    TODO:
    - Poklicati SearchService.
    - Vrniti rezultate v enotni obliki.
    - Dodati obravnavo praznega query-ja, če bo potrebno.
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