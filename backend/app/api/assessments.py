from fastapi import APIRouter, Depends

from app.database.mongodb import get_database
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.questionnaire_schema import QuestionnaireTargetType

from app.core.security import get_current_user
from app.repositories.user_repository import UserRepository

from app.repositories.learning_path_repository import LearningPathRepository
from app.repositories.learning_unit_repository import LearningUnitRepository
from app.repositories.module_repository import ModuleRepository
from app.repositories.user_progress.completed_content_repository import (
    CompletedContentRepository,
)
from app.repositories.user_progress.current_position_repository import (
    CurrentPositionRepository,
)
from app.repositories.user_progress.questionnaire_answers_repository import (
    QuestionnaireAnswersRepository,
)
from app.repositories.user_progress.user_progress_repository import (
    UserProgressRepository,
)

from app.schemas.assessment_schema import AssessmentResultResponse
from app.schemas.questionnaire_schema import QuestionnaireSubmitRequest

from app.services.assessments.assessment_progress_service import (
    AssessmentProgressService,
)
from app.services.assessments.assessment_service import AssessmentService
from app.services.learning_paths.learning_path_service import LearningPathService
from app.services.learning_units.learning_unit_service import LearningUnitService
from app.services.modules.module_service import ModuleService
from app.services.user_progress.completed_content_service import (
    CompletedContentService,
)
from app.services.user_progress.current_position_service import (
    CurrentPositionService,
)
from app.services.user_progress.questionnaire_answers_service import (
    QuestionnaireAnswersService,
)
from app.services.user_progress.user_progress_service import UserProgressService


router = APIRouter(prefix="/assessments", tags=["Assessments"])

async def get_authenticated_local_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """
    Vrne lokalni user_id na podlagi prijavljenega uporabnika iz JWT tokena.
    """

    auth_user_id = current_user.get("sub")

    if not auth_user_id:
        raise HTTPException(status_code=401, detail="Neveljaven uporabniški token.")

    database = get_database()
    user_repository = UserRepository(database)

    user = await user_repository.get_user_by_auth_user_id(auth_user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Uporabniški profil ne obstaja. Najprej ustvarite profil.",
        )

    return user["_id"]

def get_assessment_progress_service() -> AssessmentProgressService:
    """
    Vrne AssessmentProgressService instanco.

    Ustvari povezavo:
    database
    -> repositories
    -> domain services
    -> AssessmentService
    -> progress services
    -> AssessmentProgressService.

    AssessmentProgressService je glavni submit flow za vprašalnik.
    """

    database = get_database()

    learning_unit_repository = LearningUnitRepository(database)
    module_repository = ModuleRepository(database)
    learning_path_repository = LearningPathRepository(database)

    user_progress_repository = UserProgressRepository(database)
    questionnaire_answers_repository = QuestionnaireAnswersRepository(database)
    completed_content_repository = CompletedContentRepository(database)
    current_position_repository = CurrentPositionRepository(database)

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

    assessment_service = AssessmentService(
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )

    user_progress_service = UserProgressService(user_progress_repository)

    questionnaire_answers_service = QuestionnaireAnswersService(
        questionnaire_answers_repository=questionnaire_answers_repository,
    )

    completed_content_service = CompletedContentService(
        completed_content_repository=completed_content_repository,
        module_service=module_service,
    )

    current_position_service = CurrentPositionService(
        current_position_repository=current_position_repository,
    )

    return AssessmentProgressService(
        assessment_service=assessment_service,
        questionnaire_answers_service=questionnaire_answers_service,
        user_progress_service=user_progress_service,
        completed_content_service=completed_content_service,
        current_position_service=current_position_service,
        learning_path_service=learning_path_service,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


@router.post("/evaluate", response_model=AssessmentResultResponse)
async def evaluate_questionnaire_answers(
    request: QuestionnaireSubmitRequest,
    assessment_progress_service: AssessmentProgressService = Depends(
        get_assessment_progress_service
    ),
) -> AssessmentResultResponse:
    """
    Oceni odgovore iz vprašalnika in določi začetno točko uporabnika.

    Glavni submit flow:
    - dopolni neodgovorjena vprašanja,
    - shrani odgovore v users.progress.questionnaire_answers,
    - izvede assessment,
    - posodobi completed vsebine,
    - posodobi current position,
    - vrne rezultat za frontend.
    """

    result = await assessment_progress_service.evaluate_and_update_progress(
        user_id=request.user_id,
        target_type=request.target_type,
        target_id=request.target_id,
        submitted_answers=[
            answer.model_dump()
            for answer in request.answers
        ],
    )

    return result

@router.get("/latest", response_model=Optional[AssessmentResultResponse])
async def get_latest_assessment_result(
    target_type: QuestionnaireTargetType = Query(...),
    target_id: str = Query(...),
    user_id: str = Depends(get_authenticated_local_user_id),
    assessment_progress_service: AssessmentProgressService = Depends(
        get_assessment_progress_service
    ),
) -> Optional[AssessmentResultResponse]:
    return await assessment_progress_service.get_latest_assessment_result(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
    )