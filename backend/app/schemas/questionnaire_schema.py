from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

"""
Vprašalnik se bo kasneje generiral tako:

Če je target_type = learning_path:
backend najde vse module v učni poti,
potem najde vse učne enote v teh modulih,
potem zbere self_assessment_questions iz učnih enot.

Če je target_type = module:
backend najde vse učne enote v modulu,
potem zbere self_assessment_questions.

Če je target_type = learning_unit:
backend vzame vprašanja samo iz te učne enote.
"""


class QuestionnaireTargetType(str, Enum):
    """
    Enum za tip vsebine, za katero generiramo vprašalnik.
    """

    LEARNING_PATH = "learning_path"
    MODULE = "module"
    LEARNING_UNIT = "learning_unit"


class QuestionnaireQuestionResponse(BaseModel):
    """
    Shema za posamezno vprašanje v vprašalniku.

    Vprašanje je povezano z učno enoto in vsebinsko temo,
    da lahko kasneje ocenimo, kaj uporabnik že zna.
    """

    id: str
    question: str
    type: str = "yes_no"
    learning_unit_id: Optional[str] = None
    related_topic: Optional[str] = None


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

    Vrednost answer za zdaj hranimo kot bool:
    true pomeni, da uporabnik zna / potrdi trditev,
    false pomeni, da uporabnik ne zna / ne potrdi trditve.
    """

    question_id: str
    learning_unit_id: Optional[str] = None
    answer: bool


class QuestionnaireSubmitRequest(BaseModel):
    """
    Shema za oddajo izpolnjenega vprašalnika.

    Frontend pošlje target_type, target_id, user_id in seznam odgovorov.
    """

    user_id: str
    target_type: QuestionnaireTargetType
    target_id: str
    answers: List[QuestionnaireAnswerRequest] = Field(default_factory=list)