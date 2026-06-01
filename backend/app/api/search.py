from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

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


SEARCH_TYPE_ALIASES = {
    "learning_path": SearchContentType.LEARNING_PATH,
    "learning_paths": SearchContentType.LEARNING_PATH,
    "learningpath": SearchContentType.LEARNING_PATH,
    "learningpaths": SearchContentType.LEARNING_PATH,
    "ucna_pot": SearchContentType.LEARNING_PATH,
    "ucne_poti": SearchContentType.LEARNING_PATH,
    "učna_pot": SearchContentType.LEARNING_PATH,
    "učne_poti": SearchContentType.LEARNING_PATH,

    "module": SearchContentType.MODULE,
    "modules": SearchContentType.MODULE,
    "modul": SearchContentType.MODULE,
    "moduli": SearchContentType.MODULE,

    "learning_unit": SearchContentType.LEARNING_UNIT,
    "learning_units": SearchContentType.LEARNING_UNIT,
    "learningunit": SearchContentType.LEARNING_UNIT,
    "learningunits": SearchContentType.LEARNING_UNIT,
    "ucna_enota": SearchContentType.LEARNING_UNIT,
    "ucne_enote": SearchContentType.LEARNING_UNIT,
    "učna_enota": SearchContentType.LEARNING_UNIT,
    "učne_enote": SearchContentType.LEARNING_UNIT,
}


def get_search_service() -> SearchService:
    """
    Vrne SearchService instanco.

    API layer ne bere direktno MongoDB collectionov.
    Namesto tega ustvari repository-je in jih preda SearchService-u.
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


def normalize_search_types(
    raw_types: Optional[List[str]],
) -> Optional[List[SearchContentType]]:
    """
    Normalizira query parameter types.

    Podprti formati:
    - ?types=learning_path
    - ?types=module
    - ?types=module&types=learning_unit
    - ?types=module,learning_unit
    - ?types=Learning paths&types=Modules

    Če types ni podan, vrnemo None, da SearchService uporabi privzeto iskanje po vseh tipih.
    """

    if not raw_types:
        return None

    normalized_types: List[SearchContentType] = []

    for raw_type_group in raw_types:
        if not raw_type_group:
            continue

        raw_type_parts = raw_type_group.split(",")

        for raw_type in raw_type_parts:
            normalized_type = normalize_single_search_type(raw_type)

            if normalized_type not in normalized_types:
                normalized_types.append(normalized_type)

    return normalized_types or None


def normalize_single_search_type(
    raw_type: str,
) -> SearchContentType:
    """
    Pretvori eno poslano vrednost v SearchContentType.

    Namen:
    - frontend lahko pošlje backend vrednost: learning_path
    - frontend lahko pošlje label: Learning paths
    - backend vse pretvori v enoten enum
    """

    normalized_type = raw_type.strip().lower()

    normalized_type = normalized_type.replace("-", "_")
    normalized_type = normalized_type.replace(" ", "_")

    if normalized_type in SEARCH_TYPE_ALIASES:
        return SEARCH_TYPE_ALIASES[normalized_type]

    valid_types = ", ".join(sorted(SEARCH_TYPE_ALIASES.keys()))

    raise HTTPException(
        status_code=422,
        detail=(
            f"Neveljaven search type '{raw_type}'. "
            f"Dovoljene vrednosti so: {valid_types}."
        ),
    )


@router.get("", response_model=SearchResponse)
async def search_content(
    query: str = Query(
        default="",
        description="Iskalni niz, ki ga vnese uporabnik.",
    ),
    types: Optional[List[str]] = Query(
        default=None,
        description="Tipi vsebin, po katerih iščemo.",
    ),
    search_service: SearchService = Depends(get_search_service),
) -> SearchResponse:
    """
    Izvede iskanje po učnih poteh, modulih in učnih enotah.

    API layer:
    - sprejme query parametre,
    - normalizira types,
    - kliče SearchService.

    Dejanska search logika ostane v SearchService.
    """

    normalized_types = normalize_search_types(types)

    results = await search_service.search(
        query=query,
        types=normalized_types,
    )

    return SearchResponse(results=results)