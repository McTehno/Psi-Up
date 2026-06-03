from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.database.mongodb import get_database
from app.repositories.module_assistant_repository import ModuleAssistantRepository
from app.schemas.module_assistant_schema import (
    ModuleAssistantMessageRequest,
    ModuleAssistantMessageResponse,
)
from app.services.module_assistant.module_assistant_service import (
    ModuleAssistantService,
)

router = APIRouter(
    prefix="/module-assistant",
    tags=["Module assistant"],
)


def get_module_assistant_service(
    database: Database = Depends(get_database),
) -> ModuleAssistantService:
    repository = ModuleAssistantRepository(database)
    return ModuleAssistantService(repository)


@router.post(
    "/message",
    response_model=ModuleAssistantMessageResponse,
    status_code=status.HTTP_200_OK,
)
async def create_module_assistant_message(
    request: ModuleAssistantMessageRequest,
    service: ModuleAssistantService = Depends(get_module_assistant_service),
) -> ModuleAssistantMessageResponse:
    try:
        result = await service.create_message(request)
        return ModuleAssistantMessageResponse(**result)

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
            detail="Prišlo je do napake pri pomočniku za modul.",
        ) from error