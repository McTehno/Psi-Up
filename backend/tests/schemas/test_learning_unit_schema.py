from app.schemas.learning_unit_schema import (
    DigCompCompetencyResponse,
    LearningUnitReferenceResponse,
    LearningUnitResponse,
    SelfAssessmentQuestionResponse,
)


def test_learning_unit_response_maps_mongodb_id_to_id():
    # Preverimo, da shema pravilno pretvori MongoDB _id v API polje id.
    learning_unit = LearningUnitResponse(
        _id="ue_001",
        title="Osnove umetne inteligence",
        short_description="Kratek opis učne enote.",
    )

    assert learning_unit.id == "ue_001"


def test_learning_unit_response_uses_default_empty_lists():
    # Preverimo, da manjkajoči seznami dobijo varne privzete vrednosti.
    learning_unit = LearningUnitResponse(
        _id="ue_001",
        title="Osnove umetne inteligence",
        short_description="Kratek opis učne enote.",
    )

    assert learning_unit.keywords == []
    assert learning_unit.content_topics == []
    assert learning_unit.acquired_competencies == []
    assert learning_unit.digcomp_competencies == []
    assert learning_unit.prerequisites == []
    assert learning_unit.self_assessment_questions == []


def test_digcomp_competency_response_accepts_required_fields():
    # Preverimo osnovno strukturo DigComp kompetence.
    competency = DigCompCompetencyResponse(
        code="4.2",
        title="Varovanje osebnih podatkov",
        description="Razume pomen zaščite osebnih podatkov.",
    )

    assert competency.code == "4.2"
    assert competency.title == "Varovanje osebnih podatkov"


def test_self_assessment_question_response_uses_yes_no_as_default_type():
    # Če type ni podan, mora vprašanje privzeto uporabiti yes_no.
    question = SelfAssessmentQuestionResponse(
        id="q_001",
        question="Razumem osnovne pojme umetne inteligence.",
    )

    assert question.type == "yes_no"
    assert question.related_topic is None


def test_learning_unit_reference_response_uses_default_values():
    # Reference učnih enot imajo privzete vrednosti za prikaz in prerequisites logiko.
    reference = LearningUnitReferenceResponse(
        learning_unit_id="ue_001",
    )

    assert reference.learning_unit_id == "ue_001"
    assert reference.order is None
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []