from pydantic import BaseModel

# Ta schema se uporablja za vračanje vprašanj in odgovorov iz questionnaire-ja, 
# ki je del competency group. 
# Vključuje samo vprašanja in odgovore, brez ostalih informacij o competency group.

# Ta schema se uporablja za vračanje posameznega odgovora in njegove teže.
class QuestionnaireAnswerResponse(BaseModel):
    answer: str
    weight: int

#En questionnaire lahko vsebuje več vprašanj, vsako vprašanje pa lahko ima več odgovorov.
class QuestionnaireQuestionResponse(BaseModel):
    question: str
    answers: list[QuestionnaireAnswerResponse]


# Ta schema se uporablja za vračanje competency group skupaj z njenim questionnaire-jem.
class GroupQuestionnaireResponse(BaseModel):
    group_id: str
    questionnaire: list[QuestionnaireQuestionResponse]