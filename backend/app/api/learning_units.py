from fastapi import APIRouter, HTTPException

from app.schemas.learning_unit_schema import LearningUnitResponse
from app.services.learning_units.learning_unit_service import (
    get_learning_units,
    get_learning_unit,
)


router = APIRouter(
    prefix="/learning-units",
    tags=["Learning Units"],
)


@router.get("", response_model=list[LearningUnitResponse])
def read_learning_units():
    return get_learning_units()


@router.get("/{learning_unit_id}", response_model=LearningUnitResponse)
def read_learning_unit(learning_unit_id: str):
    learning_unit = get_learning_unit(learning_unit_id)

    if learning_unit is None:
        raise HTTPException(
            status_code=404,
            detail="Učna enota ni bila najdena.",
        )

    return learning_unit