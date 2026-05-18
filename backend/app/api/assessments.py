from fastapi import APIRouter, Depends

from app.schemas.assessment_schema import AssessmentResultResponse
from app.schemas.questionnaire_schema import QuestionnaireSubmitRequest
from app.services.assessments.assessment_service import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments"])


def get_assessment_service() -> AssessmentService:
    """
    Vrne AssessmentService instanco.

    TODO:
    - Povezati z LearningPathService.
    - Povezati z ModuleService.
    - Povezati z LearningUnitService.
    - Dodati dependency injection za database.
    """

    raise NotImplementedError("AssessmentService dependency še ni implementiran.")


@router.post("/evaluate", response_model=AssessmentResultResponse)
async def evaluate_questionnaire_answers(
    request: QuestionnaireSubmitRequest,
    assessment_service: AssessmentService = Depends(get_assessment_service),
) -> AssessmentResultResponse:
    """
    Oceni odgovore iz vprašalnika in določi začetno točko uporabnika.

    TODO:
    - Poklicati AssessmentService.
    - Na podlagi odgovorov določiti začetni modul ali učno enoto.
    - Po potrebi shraniti rezultat v user_progress.
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