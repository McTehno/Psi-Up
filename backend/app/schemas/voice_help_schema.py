from typing import List, Optional
from pydantic import BaseModel, Field


class VoiceHelpRequest(BaseModel):
    target_type: Optional[str] = Field(
        default=None,
        description="learning_path, module ali learning_unit",
    )
    target_id: Optional[str] = None
    question_id: Optional[str] = None

    question_text: str = Field(..., min_length=3)
    answer_options: List[str] = Field(default_factory=lambda: ["Da", "Ne"])

    locale: str = "sl-SI"
    voice_name: str = "sl-SI-PetraNeural"


class VoiceHelpResponse(BaseModel):
    help_text: str
    audio_url: str
    cached: bool
    content_hash: str