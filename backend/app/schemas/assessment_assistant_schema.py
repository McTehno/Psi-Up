from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class AssessmentAssistantMessageRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    learning_unit_id: Optional[str] = None
    question_id: str = Field(..., min_length=1)
    question_text: str = Field(..., min_length=3)
    answer_options: List[str] = Field(default_factory=lambda: ["Da", "Ne"])
    user_message: str = Field(..., min_length=2, max_length=1000)

    @model_validator(mode="after")
    def validate_context_id(self):
        if not (
            self.learning_path_id
            or self.module_id
            or self.learning_unit_id
        ):
            raise ValueError(
                "Vsaj learning_path_id, module_id ali learning_unit_id mora biti podan."
            )

        return self


class AssessmentAssistantMessageResponse(BaseModel):
    session_id: str
    answer: str