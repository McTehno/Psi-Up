from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class SearchContentType(str, Enum):
    """
    Enum za tipe vsebin, po katerih lahko uporabnik išče.
    """

    LEARNING_PATH = "learning_path"
    MODULE = "module"
    LEARNING_UNIT = "learning_unit"


class SearchRequest(BaseModel):
    """
    Shema za search request.

    Uporabi se, ko frontend pošlje iskalni niz in izbrane filtre.
    """

    query: str = Field(..., description="Iskalni niz, ki ga vnese uporabnik.")
    types: List[SearchContentType] = Field(
        default_factory=list,
        description="Seznam tipov vsebin, po katerih iščemo."
    )


class SearchResultResponse(BaseModel):
    """
    Shema za posamezen search rezultat.

    Rezultat je lahko učna pot, modul ali učna enota.
    """

    id: str
    type: SearchContentType
    title: Optional[str] = ""
    short_description: Optional[str] = None
    keywords: Optional[List[str]] = Field(default_factory=list)


class SearchResponse(BaseModel):
    """
    Shema za search response.

    Backend vrne seznam rezultatov, ki ustrezajo iskalnemu nizu in filtrom.
    """

    query: str
    types: List[SearchContentType] = Field(default_factory=list)
    results: List[SearchResultResponse] = Field(default_factory=list)