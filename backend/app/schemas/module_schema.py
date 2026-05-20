from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.learning_unit_schema import LearningUnitReferenceResponse


class ModuleResponse(BaseModel):
    """
    Shema za modul.

    Modul predstavlja večjo enoto učne vsebine.
    V novi strukturi je modul sestavljen iz več učnih enot.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_min: Optional[int] = None
    keywords: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)
    learning_units: List[LearningUnitReferenceResponse] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True) # pomeni, da lahko schema sprejme podatke tako z imenom polja kot tudi z aliasom.


class ModuleReferenceResponse(BaseModel):
    """
    Shema za referenco modula znotraj učne poti.

    Ta shema se uporablja v learning_paths.json, kjer učna pot vsebuje seznam modulov.
    Polje prerequisites je glavni vir resnice za logiko vrstnega reda in dostopnosti.
    Polji order in parallel_group sta pomoč za vizualni prikaz.
    """

    module_id: str
    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True

    #primer  "prerequisites": ["mod_003", "mod_004"]
    prerequisites: List[str] = Field(default_factory=list)