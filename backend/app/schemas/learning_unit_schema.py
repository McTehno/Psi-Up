from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DigCompCompetencyResponse(BaseModel):
    """
    Shema za DigComp kompetenco, povezano z učno enoto.

    Uporablja se za prikaz kode, naziva in opisa DigComp kompetence,
    ki jo učna enota pokriva.
    """

    code: str
    title: str
    description: str


class ContentTopicResponse(BaseModel):
    """
    Shema za vsebinsko temo znotraj učne enote.

    Tema ima stabilen ID, da se lahko odgovori vprašalnika povežejo
    na topic_id namesto na besedilo teme.
    """

    id: str
    title: str
    related_competency_codes: List[str] = Field(default_factory=list)


class SelfAssessmentQuestionResponse(BaseModel):
    """
    Shema za posamezno vprašanje za samooceno znotraj učne enote.

    Vprašanje je povezano z vsebinsko temo prek related_topic_id.
    related_topic ostane začasno podprt zaradi združljivosti s starejšimi podatki.
    """

    id: str
    question: str
    type: str = "yes_no"
    related_topic: Optional[str] = None
    related_topic_id: Optional[str] = None
    related_competency_codes: List[str] = Field(default_factory=list)


class LearningUnitResponse(BaseModel):
    """
    Shema za učno enoto.

    Učna enota je najmanjši del učne vsebine.
    V novi strukturi vsebuje vsebinske teme z ID-ji, pridobljene kompetence,
    DigComp kompetence, podatke o izvedbi in vprašanja za samooceno.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)

    content_topics: List[ContentTopicResponse] = Field(default_factory=list)
    acquired_competencies: List[str] = Field(default_factory=list)
    digcomp_competencies: List[DigCompCompetencyResponse] = Field(default_factory=list)

    delivery_mode: Optional[str] = None
    provider: Optional[str] = None
    target_audience: Optional[str] = None
    prerequisites: List[str] = Field(default_factory=list)
    knowledge_assessment: Optional[str] = None
    certificate: Optional[str] = None

    self_assessment_questions: List[SelfAssessmentQuestionResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(populate_by_name=True)


class RecommendedModuleResponse(BaseModel):
    """
    Shema za kratek prikaz priporočenega modula na detail strani učne enote.

    Definirana je tukaj, da se izognemo circular importu med
    learning_unit_schema.py in module_schema.py.
    """

    id: str = Field(alias="_id")
    title: str
    short_description: str
    duration_hours: Optional[float] = None
    keywords: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class LearningUnitDetailResponse(LearningUnitResponse):
    """
    Shema za detail prikaz učne enote.

    Razširi osnovno učno enoto s priporočenimi moduli, ki vsebujejo to učno enoto.
    Rezultat je namenjen detail strani učne enote.
    """

    recommended_modules: List[RecommendedModuleResponse] = Field(default_factory=list)


class LearningUnitReferenceResponse(BaseModel):
    """
    Shema za referenco učne enote znotraj modula.

    Ta shema se uporablja v modules.json, kjer modul vsebuje seznam učnih enot.
    """

    learning_unit_id: str
    order: Optional[int] = None
    parallel_group: Optional[str] = None
    is_required: bool = True
    prerequisites: List[str] = Field(default_factory=list)