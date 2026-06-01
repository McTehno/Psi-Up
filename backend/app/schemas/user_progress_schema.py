from datetime import datetime
from typing import List, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field


ContentType = Literal["learning_path", "module", "learning_unit"]
QuestionnaireTargetType = Literal["learning_path", "module", "learning_unit"]


class ContentProgressResponse(BaseModel):
    """
    Shema za shranjene, priljubljene ali dokončane vsebine.

    V novi strukturi so ID-ji organizirani po tipu vsebine.
    """

    learning_path_ids: List[str] = Field(default_factory=list)
    module_ids: List[str] = Field(default_factory=list)
    learning_unit_ids: List[str] = Field(default_factory=list)


class CurrentPositionResponse(BaseModel):
    """
    Shema za trenutno pozicijo uporabnika.

    Hrani informacijo, kje uporabnik nadaljuje učenje
    znotraj določene učne poti.
    """

    learning_path_id: str
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None
    updated_at: Optional[datetime] = None


class QuestionnaireAnswerResponse(BaseModel):
    """
    Shema za posamezen shranjen odgovor uporabnika.

    Vprašanja se pri generiranju vprašalnika deduplicirajo po normalizirani
    vsebini vprašanja. V uporabnikov progress shranimo vprašanje, odgovor
    in povezave na učno pot, modul, učno enoto, topic in kompetence.
    
    """

    question_id: str
    question: str
    question_type: str = "yes_no"
    answer: Union[bool, str, int, float, List[str], None] = None

    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    learning_unit_id: Optional[str] = None

    topic_id: Optional[str] = None
    competency_codes: List[str] = Field(default_factory=list)

    answered_at: Optional[datetime] = None


class QuestionnaireAnswersResponse(BaseModel):
    """
    Shema za zadnje veljavno stanje odgovorov za določen vprašalnik.

    Za en target_type + target_id hranimo samo en zapis.
    Ne hranimo zgodovine vseh poskusov.
    """

    target_type: QuestionnaireTargetType
    target_id: str
    last_submitted_at: Optional[datetime] = None
    answers: List[QuestionnaireAnswerResponse] = Field(default_factory=list)


class UserProgressResponse(BaseModel):
    """
    Shema za napredek uporabnika.

    Ta response predstavlja progress strukturo, ki je shranjena
    znotraj users dokumenta.
    """

    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str

    saved: ContentProgressResponse = Field(default_factory=ContentProgressResponse)
    favorites: ContentProgressResponse = Field(default_factory=ContentProgressResponse)
    completed: ContentProgressResponse = Field(default_factory=ContentProgressResponse)

    current_positions: List[CurrentPositionResponse] = Field(default_factory=list)
    questionnaire_answers: List[QuestionnaireAnswersResponse] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class UserProgressCreateRequest(BaseModel):
    """
    Shema za ustvarjanje začetnega napredka uporabnika.

    V novi strukturi se progress praviloma ustvari avtomatsko
    znotraj users dokumenta.
    """

    user_id: str


class SaveContentRequest(BaseModel):
    """
    Shema za shranjevanje vsebine.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: ContentType


class FavoriteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot priljubljene.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: ContentType


class CompleteContentRequest(BaseModel):
    """
    Shema za označevanje vsebine kot dokončane.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    content_id: str
    content_type: ContentType


class UpdateCurrentPositionRequest(BaseModel):
    """
    Shema za posodobitev trenutne pozicije uporabnika.

    Uporabnik se ne pošilja v request body.
    Backend ga določi iz JWT tokena.
    """

    learning_path_id: str
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None