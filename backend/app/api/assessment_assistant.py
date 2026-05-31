import traceback

from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongodb import get_database
from app.repositories.assessment_assistant_repository import AssessmentAssistantRepository
from app.schemas.assessment_assistant_schema import (
    AssessmentAssistantMessageRequest,
    AssessmentAssistantMessageResponse,
)
from app.services.assessment_assistant.assessment_assistant_service import (
    AssessmentAssistantService,
)

router = APIRouter(prefix="/assessment-assistant", tags=["Assessment assistant"])


def get_assessment_assistant_service() -> AssessmentAssistantService:
    database = get_database()
    repository = AssessmentAssistantRepository(database)
    return AssessmentAssistantService(repository)


@router.post("/message", response_model=AssessmentAssistantMessageResponse)
async def create_assessment_assistant_message(
    request: AssessmentAssistantMessageRequest,
    service: AssessmentAssistantService = Depends(get_assessment_assistant_service),
) -> AssessmentAssistantMessageResponse:
    try:
        result = await service.create_message(request)
        return AssessmentAssistantMessageResponse(**result)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        print("Napaka pri tekstovni pomoči asistentke:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Asistentka trenutno ne more odgovoriti. Poskusite znova čez nekaj trenutkov.",
        ) from exc
