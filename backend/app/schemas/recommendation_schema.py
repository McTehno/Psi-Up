from pydantic import BaseModel


# Ta schema se uporablja za vračanje priporočil kompetenc na podlagi odgovorov uporabnika na questionnaire.

#Request data, ki jo dobimo iz frontenda, da pridobi priporočila.
class SelectedAnswer(BaseModel):
    question_index: int
    answer_index: int


class CompetencyRecommendationRequest(BaseModel):
    group_id: str
    answers: list[SelectedAnswer]


#Response data, ki jo pošljemo nazaj na frontend, da prikaže priporočena kompetenca.
class RecommendedCompetencyResponse(BaseModel):
    competency_id: str
    title: str
    description: str
    level: str
    reason: str


class CompetencyRecommendationResponse(BaseModel):
    group_id: str
    total_score: int
    recommended_competencies: list[RecommendedCompetencyResponse]