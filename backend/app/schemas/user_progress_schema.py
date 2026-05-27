from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict


class CurrentPositionResponse(BaseModel):
    """
    Shema za trenutno pozicijo uporabnika.

    Hrani informacijo, kje se uporabnik trenutno nahaja
    znotraj določene učne poti, modula ali učne enote.
    """

    learning_path_id: Optional[str] = None
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None


class UserProgressResponse(BaseModel):
    """
    Shema za napredek uporabnika.

    Hrani shranjene, priljubljene in dokončane vsebine
    ter trenutno pozicijo uporabnika.
    """

    id: str = Field(alias="_id")
    user_id: str

    saved_learning_paths: List[str] = Field(default_factory=list)
    saved_modules: List[str] = Field(default_factory=list)
    saved_learning_units: List[str] = Field(default_factory=list)

    favorite_learning_paths: List[str] = Field(default_factory=list)
    favorite_modules: List[str] = Field(default_factory=list)
    favorite_learning_units: List[str] = Field(default_factory=list)

    completed_learning_paths: List[str] = Field(default_factory=list)
    completed_modules: List[str] = Field(default_factory=list)
    completed_learning_units: List[str] = Field(default_factory=list)

    current_positions: List[CurrentPositionResponse] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class UserProgressCreateRequest(BaseModel):
    """
    Shema za ustvarjanje začetnega napredka uporabnika.

    Uporabi se, ko se za novega uporabnika prvič ustvari
    prazen zapis napredka.

    Opomba:
    To shemo lahko kasneje odstranimo, če progress vedno ustvarjamo
    avtomatsko ob ustvarjanju uporabniškega profila.
    """

    user_id: str


class SaveContentRequest(BaseModel):
    """
    Shema za shranjevanje vsebine.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: str


class FavoriteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot priljubljene.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: str


class CompleteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot dokončane.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: str


class UpdateCurrentPositionRequest(BaseModel):
    """
    Shema za posodobitev trenutne pozicije uporabnika.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    learning_path_id: Optional[str] = None
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None


"""
Opomba:
content_type uporabljamo z vrednostmi:

learning_path
module
learning_unit

Kasneje lahko to izboljšamo z Enum, ampak za trenutno verzijo
je string dovolj pregleden.
"""