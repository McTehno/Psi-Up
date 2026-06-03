import pytest
from pydantic import ValidationError

from app.schemas.assessment_schema import (
    AssessmentCurrentPositionResponse,
    AssessmentResultResponse,
    AssessmentStatus,
    LearningUnitAssessmentResult,
    ModuleAssessmentResult,
)
from app.schemas.questionnaire_schema import QuestionnaireTargetType


def test_assessment_status_values():
    # Assessment status podpira completed, partially_completed in not_started.
    assert AssessmentStatus.COMPLETED == "completed"
    assert AssessmentStatus.PARTIALLY_COMPLETED == "partially_completed"
    assert AssessmentStatus.NOT_STARTED == "not_started"


def test_learning_unit_assessment_result_accepts_valid_data():
    # Rezultat učne enote hrani znane/manjkajoče topic-e in kompetence.
    result = LearningUnitAssessmentResult(
        learning_unit_id="ue_001",
        known_topic_ids=["topic_001"],
        missing_topic_ids=["topic_002"],
        known_competency_codes=["1.2"],
        missing_competency_codes=["5.2"],
        is_completed_by_assessment=True,
    )

    assert result.learning_unit_id == "ue_001"
    assert result.known_topic_ids == ["topic_001"]
    assert result.missing_topic_ids == ["topic_002"]
    assert result.known_competency_codes == ["1.2"]
    assert result.missing_competency_codes == ["5.2"]
    assert result.is_completed_by_assessment is True


def test_learning_unit_assessment_result_uses_default_values():
    # Če niso podani topic-i/kompetence, so seznami prazni.
    result = LearningUnitAssessmentResult(
        learning_unit_id="ue_001",
    )

    assert result.known_topic_ids == []
    assert result.missing_topic_ids == []
    assert result.known_competency_codes == []
    assert result.missing_competency_codes == []
    assert result.is_completed_by_assessment is False


def test_learning_unit_assessment_result_requires_learning_unit_id():
    # learning_unit_id je obvezen.
    with pytest.raises(ValidationError):
        LearningUnitAssessmentResult()


def test_learning_unit_assessment_result_uses_independent_default_lists():
    # Default seznami ne smejo biti deljeni med instancami.
    first_result = LearningUnitAssessmentResult(
        learning_unit_id="ue_001",
    )
    second_result = LearningUnitAssessmentResult(
        learning_unit_id="ue_002",
    )

    first_result.known_topic_ids.append("topic_001")

    assert first_result.known_topic_ids == ["topic_001"]
    assert second_result.known_topic_ids == []


def test_module_assessment_result_accepts_valid_data():
    # Rezultat modula hrani status ter completed/missing learning units.
    result = ModuleAssessmentResult(
        module_id="mod_001",
        status=AssessmentStatus.PARTIALLY_COMPLETED,
        completed_learning_units=["ue_001"],
        missing_learning_units=["ue_002"],
    )

    assert result.module_id == "mod_001"
    assert result.status == AssessmentStatus.PARTIALLY_COMPLETED
    assert result.completed_learning_units == ["ue_001"]
    assert result.missing_learning_units == ["ue_002"]


def test_module_assessment_result_uses_default_values():
    # Modul je privzeto not_started, seznami pa so prazni.
    result = ModuleAssessmentResult(
        module_id="mod_001",
    )

    assert result.status == AssessmentStatus.NOT_STARTED
    assert result.completed_learning_units == []
    assert result.missing_learning_units == []


def test_module_assessment_result_rejects_invalid_status():
    # Neveljaven status mora pasti na validaciji.
    with pytest.raises(ValidationError):
        ModuleAssessmentResult(
            module_id="mod_001",
            status="invalid_status",
        )


def test_module_assessment_result_requires_module_id():
    # module_id je obvezen.
    with pytest.raises(ValidationError):
        ModuleAssessmentResult()


def test_assessment_current_position_response_accepts_valid_data():
    # Current position pove, kje naj uporabnik nadaljuje po assessmentu.
    position = AssessmentCurrentPositionResponse(
        learning_path_id="lp_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    assert position.learning_path_id == "lp_001"
    assert position.current_module_id == "mod_001"
    assert position.current_learning_unit_id == "ue_001"


def test_assessment_current_position_response_uses_default_values():
    # Vsa current position polja so optional.
    position = AssessmentCurrentPositionResponse()

    assert position.learning_path_id is None
    assert position.current_module_id is None
    assert position.current_learning_unit_id is None


def test_assessment_result_response_accepts_valid_learning_path_result():
    # Celoten assessment response za učno pot.
    result = AssessmentResultResponse(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="lp_001",
        start_module_id="mod_001",
        start_learning_unit_id="ue_001",
        skipped_modules=["mod_000"],
        skipped_learning_units=["ue_000"],
        recommended_next_modules=["mod_002"],
        recommended_next_learning_units=["ue_002"],
        known_competency_codes=["1.2"],
        missing_competency_codes=["5.2"],
        learning_unit_results=[
            {
                "learning_unit_id": "ue_001",
                "known_topic_ids": ["topic_001"],
                "missing_topic_ids": [],
                "known_competency_codes": ["1.2"],
                "missing_competency_codes": [],
                "is_completed_by_assessment": True,
            }
        ],
        module_results=[
            {
                "module_id": "mod_001",
                "status": "completed",
                "completed_learning_units": ["ue_001"],
                "missing_learning_units": [],
            }
        ],
        completed_learning_unit_ids=["ue_001"],
        completed_module_ids=["mod_001"],
        completed_learning_path_ids=["lp_001"],
        current_position={
            "learning_path_id": "lp_001",
            "current_module_id": "mod_001",
            "current_learning_unit_id": "ue_001",
        },
        summary="Uporabnik lahko začne pri modulu mod_001.",
    )

    assert result.user_id == "user_001"
    assert result.target_type == QuestionnaireTargetType.LEARNING_PATH
    assert result.target_id == "lp_001"
    assert result.start_module_id == "mod_001"
    assert result.start_learning_unit_id == "ue_001"
    assert result.skipped_modules == ["mod_000"]
    assert result.skipped_learning_units == ["ue_000"]
    assert result.recommended_next_modules == ["mod_002"]
    assert result.recommended_next_learning_units == ["ue_002"]
    assert result.known_competency_codes == ["1.2"]
    assert result.missing_competency_codes == ["5.2"]
    assert len(result.learning_unit_results) == 1
    assert len(result.module_results) == 1
    assert result.completed_learning_unit_ids == ["ue_001"]
    assert result.completed_module_ids == ["mod_001"]
    assert result.completed_learning_path_ids == ["lp_001"]
    assert result.current_position is not None
    assert result.current_position.learning_path_id == "lp_001"
    assert result.summary == "Uporabnik lahko začne pri modulu mod_001."


def test_assessment_result_response_accepts_allowed_target_types():
    # Assessment result podpira vse questionnaire target tipe.
    for target_type in [
        QuestionnaireTargetType.LEARNING_PATH,
        QuestionnaireTargetType.MODULE,
        QuestionnaireTargetType.LEARNING_UNIT,
    ]:
        result = AssessmentResultResponse(
            user_id="user_001",
            target_type=target_type,
            target_id="target_001",
        )

        assert result.target_type == target_type


def test_assessment_result_response_uses_default_values():
    # Če optional polja niso podana, dobijo prazne sezname ali None.
    result = AssessmentResultResponse(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
    )

    assert result.start_module_id is None
    assert result.start_learning_unit_id is None

    assert result.skipped_modules == []
    assert result.skipped_learning_units == []

    assert result.recommended_next_modules == []
    assert result.recommended_next_learning_units == []

    assert result.known_competency_codes == []
    assert result.missing_competency_codes == []

    assert result.learning_unit_results == []
    assert result.module_results == []

    assert result.completed_learning_unit_ids == []
    assert result.completed_module_ids == []
    assert result.completed_learning_path_ids == []

    assert result.current_position is None
    assert result.summary is None


def test_assessment_result_response_rejects_invalid_target_type():
    # Neveljaven target_type mora pasti na validaciji.
    with pytest.raises(ValidationError):
        AssessmentResultResponse(
            user_id="user_001",
            target_type="invalid_target",
            target_id="target_001",
        )


def test_assessment_result_response_requires_user_id():
    # user_id je obvezen.
    with pytest.raises(ValidationError):
        AssessmentResultResponse(
            target_type=QuestionnaireTargetType.MODULE,
            target_id="mod_001",
        )


def test_assessment_result_response_requires_target_type():
    # target_type je obvezen.
    with pytest.raises(ValidationError):
        AssessmentResultResponse(
            user_id="user_001",
            target_id="mod_001",
        )


def test_assessment_result_response_requires_target_id():
    # target_id je obvezen.
    with pytest.raises(ValidationError):
        AssessmentResultResponse(
            user_id="user_001",
            target_type=QuestionnaireTargetType.MODULE,
        )