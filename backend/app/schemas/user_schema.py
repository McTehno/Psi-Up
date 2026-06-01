from datetime import datetime
from typing import List, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserContentProgress(BaseModel):
    """
    Shema za shranjene, priljubljene ali dokončane vsebine uporabnika.

    Vsebuje ID-je učnih poti, modulov in učnih enot.
    """

    learning_path_ids: List[str] = Field(default_factory=list)
    module_ids: List[str] = Field(default_factory=list)
    learning_unit_ids: List[str] = Field(default_factory=list)


class UserCurrentPosition(BaseModel):
    """
    Shema za trenutno pozicijo uporabnika znotraj učne poti.

    Ne hrani topicov. Topic znanje se hrani v questionnaire_answers.
    """

    learning_path_id: str
    current_module_id: Optional[str] = None
    current_learning_unit_id: Optional[str] = None
    updated_at: Optional[datetime] = None


class UserQuestionnaireAnswer(BaseModel):
    """
    Shema za posamezen odgovor uporabnika na vprašanje.

    Odgovori se deduplicirajo po normalizirani vsebini vprašanja
    pri generiranju vprašalnika.
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


class UserQuestionnaireAnswers(BaseModel):
    """
    Shema za zadnje veljavno stanje odgovorov za določen vprašalnik.

    Za en target_type + target_id se hrani samo en zapis.
    Ne hranimo zgodovine vseh poskusov.
    """

    target_type: Literal["learning_path", "module", "learning_unit"]
    target_id: str
    last_submitted_at: Optional[datetime] = None
    answers: List[UserQuestionnaireAnswer] = Field(default_factory=list)


class UserProgress(BaseModel):
    """
    Embedded progress struktura znotraj users kolekcije.

    Nadomešča staro user_progress kolekcijo.
    """

    saved: UserContentProgress = Field(default_factory=UserContentProgress)
    favorites: UserContentProgress = Field(default_factory=UserContentProgress)
    completed: UserContentProgress = Field(default_factory=UserContentProgress)
    current_positions: List[UserCurrentPosition] = Field(default_factory=list)
    questionnaire_answers: List[UserQuestionnaireAnswers] = Field(default_factory=list)


class UserResponse(BaseModel):
    """
    Shema za uporabniški profil v aplikaciji.

    Registracija in prijava se izvajata prek zunanjega orodja.
    Backend ne hrani gesel.

    Napredek uporabnika je shranjen znotraj users dokumenta v polju progress.
    """

    id: str = Field(alias="_id")
    auth_provider: Optional[str] = None
    auth_user_id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    progress: UserProgress = Field(default_factory=UserProgress)

    model_config = ConfigDict(populate_by_name=True)


class UserCreateRequest(BaseModel):
    """
    Shema za ustvarjanje uporabniškega profila v naši aplikaciji.

    Ta request se uporabi po uspešni prijavi prek zunanjega auth sistema.
    Backend prejme zunanji ID uporabnika in ustvari lokalni profil.
    """

    auth_provider: Optional[str] = None
    auth_user_id: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserUpdateRequest(BaseModel):
    """
    Shema za posodobitev uporabniškega profila v aplikaciji.

    Ne uporablja se za spremembo gesla, ker gesla upravlja zunanji auth sistem.
    """

    name: Optional[str] = None
    email: Optional[EmailStr] = None