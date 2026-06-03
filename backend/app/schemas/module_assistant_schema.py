from typing import Optional

from pydantic import BaseModel, Field


class ModuleAssistantMessageRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    module_id: str = Field(..., min_length=1)
    user_message: str = Field(..., min_length=1, max_length=4000)


class ModuleAssistantMessageResponse(BaseModel):
    session_id: str
    answer: str