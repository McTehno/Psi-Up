from enum import Enum
from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field

"""
Vprašalnik se generira glede na target_type:

Če je target_type = learning_path:
backend najde vse korake v učni poti.
Če je korak module, zbere vprašanja iz učnih enot tega modula.
Če je korak learning_unit, zbere vprašanja direktno iz te učne enote.

Če je target_type = module:
backend najde vse učne enote v modulu,
potem zbere self_assessment_questions.

Če je target_type = learning_unit:
backend vzame vprašanja samo iz te učne enote.

Vprašanja se deduplicirajo po normalizirani vsebini vprašanja.
Uporabniku se isto vprašanje prikaže enkrat, sources pa hranijo vse povezane
učne poti, module, učne enote, topic-e in kompetence.
"""


class QuestionnaireTargetType(str, Enum):
    """
    Enum za tip vsebine, za katero generiramo vprašalnik.
    """

    LEARNING_PATH = "learning_path"
    MODULE = "module"
    LEARNING_UNIT = "learning_unit"


class QuestionnaireQuestionSourceResponse(BaseModel):
    """
    Shema za en vir vprašanja.

    Če se isto vprašanje pojavi v več učnih enotah ali modulih,
    se vprašanje v vprašalniku prikaže samo enkrat, sources pa povejo,
    na katere vsebine se ta odgovor nanaša.
    """

    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    learning_unit_id: Optional[str] = None

    topic_id: Optional[str] = None
    related_topic: Optional[str] = None
    competency_codes: List[str] = Field(default_factory=list)

    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = Field(default_factory=list)


class QuestionnaireQuestionResponse(BaseModel):
    """
    Shema za posamezno vprašanje v vprašalniku.

    Vprašanje je povezano z učno potjo, modulom, učno enoto,
    topicom in kompetencami, da lahko kasneje ocenimo,
    kaj uporabnik že zna.

    Polje type ostane fleksibilno, ker lahko vprašanja v JSON podatkih
    kasneje dobijo tudi druge tipe, ne samo yes_no.
    """

    id: str
    question: str
    type: str = "yes_no"

    answer: Optional[Any] = None
    is_prefilled: bool = False
    prefill_source: Optional[str] = None
    
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    learning_unit_id: Optional[str] = None

    related_topic: Optional[str] = None
    related_topic_id: Optional[str] = None
    related_competency_codes: List[str] = Field(default_factory=list)

    sources: List[QuestionnaireQuestionSourceResponse] = Field(default_factory=list)
    
    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = Field(default_factory=list)


class QuestionnaireResponse(BaseModel):
    """
    Shema za celoten vprašalnik.

    Vprašalnik se lahko ustvari za učno pot, modul ali učno enoto.
    """

    target_type: QuestionnaireTargetType
    target_id: str
    title: Optional[str] = None
    questions: List[QuestionnaireQuestionResponse] = Field(default_factory=list)


class QuestionnaireAnswerRequest(BaseModel):
    """
    Shema za posamezen odgovor uporabnika.

    Tip odgovora je fleksibilen, ker se lahko tipi vprašanj v prihodnosti razširijo.

    Za yes_no vprašanja pričakujemo bool vrednost:
    true pomeni, da uporabnik zna / potrdi trditev,
    false pomeni, da uporabnik ne zna / ne potrdi trditve.

    Za druge tipe vprašanj lahko backend kasneje doda posebno validacijo.
    """

    question_id: str
    question: str
    type: str = "yes_no"
    answer: Union[bool, str, int, float, List[str], None] = None

    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    learning_unit_id: Optional[str] = None

    topic_id: Optional[str] = None
    competency_codes: List[str] = Field(default_factory=list)


class QuestionnaireSubmitRequest(BaseModel):
    """
    Shema za oddajo izpolnjenega vprašalnika.

    Frontend pošlje target_type, target_id, user_id in seznam odgovorov.
    """

    user_id: str
    target_type: QuestionnaireTargetType
    target_id: str
    answers: List[QuestionnaireAnswerRequest] = Field(default_factory=list)