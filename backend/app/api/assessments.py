from fastapi import APIRouter, Depends

from app.database.mongodb import get_database

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository

from app.schemas.assessment_schema import AssessmentResultResponse
from app.schemas.questionnaire_schema import QuestionnaireSubmitRequest

from app.services.assessments.assessment_service import AssessmentService
from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.modules.module_service import ModuleService


router = APIRouter(prefix="/assessments", tags=["Assessments"])


def get_assessment_service() -> AssessmentService:
    """
    Vrne AssessmentService instanco.

    Ustvari povezavo:
    database -> repositories -> services -> AssessmentService.
    """

    database = get_database()

    learning_unit_repository = LearningUnitRepository(database)
    module_repository = ModuleRepository(database)
    learning_path_repository = LearningPathRepository(database)

    learning_unit_service = LearningUnitService(learning_unit_repository)

    module_service = ModuleService(
        module_repository=module_repository,
        learning_unit_service=learning_unit_service,
        learning_path_repository=learning_path_repository,
    )

    learning_path_service = LearningPathService(
        learning_path_repository=learning_path_repository,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )

    return AssessmentService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


@router.post("/evaluate", response_model=AssessmentResultResponse)
async def evaluate_questionnaire_answers(
    request: QuestionnaireSubmitRequest,
    assessment_service: AssessmentService = Depends(get_assessment_service),
) -> AssessmentResultResponse:
    """
    Oceni odgovore iz vprašalnika in določi začetno točko uporabnika.
    """

    result = await assessment_service.evaluate_answers(
        user_id=request.user_id,
        target_type=request.target_type,
        target_id=request.target_id,
        answers=[
            answer.model_dump()
            for answer in request.answers
        ],
    )

    return result