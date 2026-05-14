from pydantic import BaseModel


class SelfAssessmentRequest(BaseModel):
    competency_id: str
    self_assessment_level: str


class SelfAssessmentResponse(BaseModel):
    competency_id: str
    current_level: str
    message: str