from fastapi import APIRouter, HTTPException

from app.schemas.module_schema import ModuleResponse
from app.services.modules.module_service import (
    get_modules,
    get_module,
)


router = APIRouter(
    prefix="/modules",
    tags=["Modules"],
)


@router.get("", response_model=list[ModuleResponse])
def read_modules():
    return get_modules()


@router.get("/{module_id}", response_model=ModuleResponse)
def read_module(module_id: str):
    module = get_module(module_id)

    if module is None:
        raise HTTPException(
            status_code=404,
            detail="Modul ni bil najden.",
        )

    return module