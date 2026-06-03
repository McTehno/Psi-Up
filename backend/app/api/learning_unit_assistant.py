from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.database.mongodb import get_database
from app.repositories.learning_unit_assistant_repository import (
    LearningUnitAssistantRepository,
)
from app.schemas.learning_unit_assistant_schema import (
    LearningUnitAssistantMessageRequest,
    LearningUnitAssistantMessageResponse,
)
from app.services.learning_unit_assistant.learning_unit_assistant_service import (
    LearningUnitAssistantService,
)

router = APIRouter(
    prefix="/learning-unit-assistant",
    tags=["Learning unit assistant"],
)


def get_learning_unit_assistant_service(
    database: Database = Depends(get_database),
) -> LearningUnitAssistantService:
    repository = LearningUnitAssistantRepository(database)
    return LearningUnitAssistantService(repository)


@router.post(
    "/message",
    response_model=LearningUnitAssistantMessageResponse,
    status_code=status.HTTP_200_OK,
)
async def create_learning_unit_assistant_message(
    request: LearningUnitAssistantMessageRequest,
    service: LearningUnitAssistantService = Depends(
        get_learning_unit_assistant_service,
    ),
) -> LearningUnitAssistantMessageResponse:
    try:
        result = await service.create_message(request)
        return LearningUnitAssistantMessageResponse(**result)

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
            detail="Prišlo je do napake pri pomočniku za učno enoto.",
        ) from error