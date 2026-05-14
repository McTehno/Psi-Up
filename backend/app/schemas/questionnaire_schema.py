from pydantic import BaseModel

# primer kako sem si zamislila, da bo izgledal request ki ga bo frontend posiljal, ko bo uporabnik oddajal odgovore na vprašanja

class UserAnswer(BaseModel):
    questionId: str
    answerId: str

class QuestionnaireSubmitRequest(BaseModel):
    answers: list[UserAnswer]