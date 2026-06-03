from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.database.mongodb import get_database
from app.repositories.learning_path_assistant_repository import (
    LearningPathAssistantRepository,
)
from app.schemas.learning_path_assistant_schema import (
    LearningPathAssistantMessageRequest,
    LearningPathAssistantMessageResponse,
)
from app.services.learning_path_assistant.learning_path_assistant_service import (
    LearningPathAssistantService,
)

router = APIRouter(
    prefix="/learning-path-assistant",
    tags=["Learning path assistant"],
)


def get_learning_path_assistant_service(
    database: Database = Depends(get_database),
) -> LearningPathAssistantService:
    repository = LearningPathAssistantRepository(database)
    return LearningPathAssistantService(repository)


@router.post(
    "/message",
    response_model=LearningPathAssistantMessageResponse,
    status_code=status.HTTP_200_OK,
)
async def create_learning_path_assistant_message(
    request: LearningPathAssistantMessageRequest,
    service: LearningPathAssistantService = Depends(
        get_learning_path_assistant_service,
    ),
) -> LearningPathAssistantMessageResponse:
    try:
        result = await service.create_message(request)
        return LearningPathAssistantMessageResponse(**result)

    except ValueError as error:
        message = str(error)
        status_code = (
            status.HTTP_404_NOT_FOUND
            if "ne obstaja" in message.lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(
            status_code=status_code,
            detail=message,
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prišlo je do napake pri pomočniku za učno pot.",
        ) from error