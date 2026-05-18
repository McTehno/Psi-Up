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
    """

    user_id: str


class SaveContentRequest(BaseModel):
    """
    Shema za shranjevanje vsebine.

    Uporabi se, ko uporabnik shrani učno pot, modul ali učno enoto.
    """

    user_id: str
    content_id: str
    content_type: str


class FavoriteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot priljubljene.

    Uporabi se, ko uporabnik označi učno pot, modul ali učno enoto
    kot priljubljeno.
    """

    user_id: str
    content_id: str
    content_type: str


class CompleteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot dokončane.

    Uporabi se, ko uporabnik zaključi učno pot, modul ali učno enoto.
    """

    user_id: str
    content_id: str
    content_type: str


class UpdateCurrentPositionRequest(BaseModel):
    """
    Shema za posodobitev trenutne pozicije uporabnika.

    Uporabi se, ko želimo shraniti, kje se uporabnik trenutno nahaja.
    """

    user_id: str
    learning_path_id: Optional[str] = None
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None



'''
opomba: content_type bomo kasneje uporabljali z vrednostmi:

learning_path
module
learning_unit

Kasneje lahko to izboljšamo z Enum, ampak za scaffold je tako dovolj pregledno.

'''