from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongodb import get_database
from app.repositories.voice_help_repository import VoiceHelpRepository
from app.schemas.voice_help_schema import VoiceHelpRequest, VoiceHelpResponse
from app.services.voice_help.voice_help_service import VoiceHelpService

router = APIRouter(prefix="/voice-help", tags=["Voice help"])


def get_voice_help_service() -> VoiceHelpService:
    database = get_database()
    repository = VoiceHelpRepository(database)
    return VoiceHelpService(repository)


@router.post("/question", response_model=VoiceHelpResponse)
async def get_question_voice_help(
    request: VoiceHelpRequest,
    voice_help_service: VoiceHelpService = Depends(get_voice_help_service),
) -> VoiceHelpResponse:
    try:
        result = await voice_help_service.get_or_create_voice_help(
            target_type=request.target_type,
            target_id=request.target_id,
            question_id=request.question_id,
            question_text=request.question_text,
            answer_options=request.answer_options,
            locale=request.locale,
            voice_name=request.voice_name,
        )

        return VoiceHelpResponse(**result)

    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    except Exception as error:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{type(error).__name__}: {str(error)}",
        ) from error