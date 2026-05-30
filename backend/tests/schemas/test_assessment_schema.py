from app.schemas.assessment_schema import (
    AssessmentResultResponse,
    AssessmentStatus,
    LearningUnitAssessmentResult,
    ModuleAssessmentResult,
)
from app.schemas.questionnaire_schema import QuestionnaireTargetType


def test_assessment_status_values_are_correct():
    # Status vrednosti morajo ostati stabilne za assessment logiko.
    assert AssessmentStatus.COMPLETED == "completed"
    assert AssessmentStatus.PARTIALLY_COMPLETED == "partially_completed"
    assert AssessmentStatus.NOT_STARTED == "not_started"


def test_learning_unit_assessment_result_uses_default_values():
    # Rezultat učne enote mora imeti varne privzete vrednosti.
    result = LearningUnitAssessmentResult(
        learning_unit_id="ue_001",
    )

    assert result.known_topics == []
    assert result.missing_topics == []
    assert result.is_completed_by_assessment is False


def test_module_assessment_result_uses_default_values():
    # Modul je privzeto označen kot še nezačet.
    result = ModuleAssessmentResult(
        module_id="mod_001",
    )

    assert result.status == AssessmentStatus.NOT_STARTED
    assert result.completed_learning_units == []
    assert result.missing_learning_units == []


def test_assessment_result_response_uses_default_lists():
    # Celoten assessment response mora delovati tudi brez priporočil.
    result = AssessmentResultResponse(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_001",
    )

    assert result.start_module_id is None
    assert result.start_learning_unit_id is None
    assert result.skipped_modules == []
    assert result.skipped_learning_units == []
    assert result.recommended_next_modules == []
    assert result.recommended_next_learning_units == []
    assert result.learning_unit_results == []
    assert result.module_results == []