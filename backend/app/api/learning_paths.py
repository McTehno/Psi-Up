from fastapi import APIRouter, HTTPException

from app.schemas.learning_path_schema import (
    GenerateLearningPathRequest,
    GeneratedLearningPathResponse,
)
from app.services.learning_paths.learning_path_service import (
    generate_learning_path,
)


router = APIRouter(
    prefix="/learning-paths",
    tags=["Learning Paths"],
)


@router.post(
    "/generate",
    response_model=GeneratedLearningPathResponse,
)
def create_learning_path(request: GenerateLearningPathRequest):
    learning_path = generate_learning_path(
        competency_id=request.competency_id,
        current_level=request.current_level,
    )

    if learning_path is None:
        raise HTTPException(
            status_code=404,
            detail="Učna pot za izbrano kompetenco ni bila najdena.",
        )

    return learning_path