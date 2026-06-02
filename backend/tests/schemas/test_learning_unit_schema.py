import pytest
from pydantic import ValidationError

from app.schemas.learning_unit_schema import (
    ContentTopicResponse,
    DigCompCompetencyResponse,
    LearningUnitDetailResponse,
    LearningUnitReferenceResponse,
    LearningUnitResponse,
    RecommendedModuleResponse,
    SelfAssessmentQuestionResponse,
)


def test_digcomp_competency_response_accepts_valid_data():
    # Preverimo, da DigComp kompetenca sprejme code, title in description.
    competency = DigCompCompetencyResponse(
        code="3.2",
        title="Ustvarjanje digitalnih vsebin",
        description="Ustvarja in ureja digitalno vsebino z digitalnimi orodji.",
    )

    assert competency.code == "3.2"
    assert competency.title == "Ustvarjanje digitalnih vsebin"
    assert competency.description == (
        "Ustvarja in ureja digitalno vsebino z digitalnimi orodji."
    )


def test_digcomp_competency_response_requires_code():
    # code je obvezno polje.
    with pytest.raises(ValidationError):
        DigCompCompetencyResponse(
            title="Ustvarjanje digitalnih vsebin",
            description="Opis.",
        )


def test_content_topic_response_accepts_valid_data():
    # Preverimo, da content topic sprejme stabilen topic id in kompetence.
    topic = ContentTopicResponse(
        id="topic_ue_001_001",
        title="Razumevanje pojma umetna inteligenca",
        related_competency_codes=["1.2"],
    )

    assert topic.id == "topic_ue_001_001"
    assert topic.title == "Razumevanje pojma umetna inteligenca"
    assert topic.related_competency_codes == ["1.2"]


def test_content_topic_response_uses_default_related_competency_codes():
    # Če related_competency_codes niso poslani, shema uporabi prazen seznam.
    topic = ContentTopicResponse(
        id="topic_ue_001_001",
        title="Razumevanje pojma umetna inteligenca",
    )

    assert topic.related_competency_codes == []


def test_content_topic_response_requires_id():
    # id je obvezen, ker se vprašanja povezujejo na topic_id.
    with pytest.raises(ValidationError):
        ContentTopicResponse(
            title="Tema brez ID",
        )


def test_self_assessment_question_response_accepts_valid_data():
    # Preverimo, da vprašanje sprejme povezavo na related_topic_id in kompetence.
    question = SelfAssessmentQuestionResponse(
        id="q_ue_001_001",
        question="Razumem osnovni koncept umetne inteligence.",
        type="yes_no",
        related_topic="Razumevanje pojma umetna inteligenca",
        related_topic_id="topic_ue_001_001",
        related_competency_codes=["1.2"],
    )

    assert question.id == "q_ue_001_001"
    assert question.question == "Razumem osnovni koncept umetne inteligence."
    assert question.type == "yes_no"
    assert question.related_topic == "Razumevanje pojma umetna inteligenca"
    assert question.related_topic_id == "topic_ue_001_001"
    assert question.related_competency_codes == ["1.2"]


def test_self_assessment_question_response_uses_default_values():
    # related_topic, related_topic_id in related_competency_codes so lahko prazni.
    question = SelfAssessmentQuestionResponse(
        id="q_ue_001_001",
        question="Razumem osnovni koncept umetne inteligence.",
    )

    assert question.type == "yes_no"
    assert question.related_topic is None
    assert question.related_topic_id is None
    assert question.related_competency_codes == []


def test_self_assessment_question_response_requires_question_text():
    # question je obvezno polje.
    with pytest.raises(ValidationError):
        SelfAssessmentQuestionResponse(
            id="q_ue_001_001",
        )


def test_learning_unit_response_accepts_valid_learning_unit_with_alias_id():
    # Preverimo, da shema sprejme MongoDB _id in ga mapira v id.
    learning_unit = LearningUnitResponse(
        _id="ue_001",
        title="Osnovni pojmi umetne inteligence",
        short_description="Uvod v osnovne pojme umetne inteligence.",
        duration_hours=0.5,
        keywords=["umetna inteligenca", "UI"],
        content_topics=[
            {
                "id": "topic_ue_001_001",
                "title": "Razumevanje pojma umetna inteligenca",
                "related_competency_codes": ["1.2"],
            }
        ],
        acquired_competencies=[
            "Udeleženec razume osnovni koncept umetne inteligence"
        ],
        digcomp_competencies=[
            {
                "code": "1.2",
                "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                "description": "Prepoznava in razume digitalne informacije.",
            }
        ],
        delivery_mode="Spletno",
        provider="NIDiKo demo izvajalec",
        target_audience="Odrasli uporabniki z osnovnim digitalnim znanjem",
        prerequisites=["Osnovna uporaba računalnika"],
        knowledge_assessment="Kratek kviz",
        certificate="Potrdilo o udeležbi",
        self_assessment_questions=[
            {
                "id": "q_ue_001_001",
                "question": "Razumem osnovni koncept umetne inteligence.",
                "type": "yes_no",
                "related_topic": "Razumevanje pojma umetna inteligenca",
                "related_topic_id": "topic_ue_001_001",
                "related_competency_codes": ["1.2"],
            }
        ],
    )

    assert learning_unit.id == "ue_001"
    assert learning_unit.title == "Osnovni pojmi umetne inteligence"
    assert learning_unit.short_description == "Uvod v osnovne pojme umetne inteligence."
    assert learning_unit.duration_hours == 0.5
    assert learning_unit.keywords == ["umetna inteligenca", "UI"]
    assert len(learning_unit.content_topics) == 1
    assert len(learning_unit.acquired_competencies) == 1
    assert len(learning_unit.digcomp_competencies) == 1
    assert learning_unit.delivery_mode == "Spletno"
    assert learning_unit.provider == "NIDiKo demo izvajalec"
    assert learning_unit.target_audience == "Odrasli uporabniki z osnovnim digitalnim znanjem"
    assert learning_unit.prerequisites == ["Osnovna uporaba računalnika"]
    assert learning_unit.knowledge_assessment == "Kratek kviz"
    assert learning_unit.certificate == "Potrdilo o udeležbi"
    assert len(learning_unit.self_assessment_questions) == 1


def test_learning_unit_response_accepts_id_by_field_name():
    # Zaradi populate_by_name=True lahko uporabimo tudi id namesto _id.
    learning_unit = LearningUnitResponse(
        id="ue_001",
        title="Osnovni pojmi umetne inteligence",
        short_description="Opis učne enote.",
    )

    assert learning_unit.id == "ue_001"
    assert learning_unit.duration_hours is None
    assert learning_unit.keywords == []
    assert learning_unit.content_topics == []
    assert learning_unit.acquired_competencies == []
    assert learning_unit.digcomp_competencies == []
    assert learning_unit.delivery_mode is None
    assert learning_unit.provider is None
    assert learning_unit.target_audience is None
    assert learning_unit.prerequisites == []
    assert learning_unit.knowledge_assessment is None
    assert learning_unit.certificate is None
    assert learning_unit.self_assessment_questions == []


def test_learning_unit_response_requires_id():
    # Učna enota brez _id ali id ni veljavna.
    with pytest.raises(ValidationError):
        LearningUnitResponse(
            title="Učna enota brez ID",
            short_description="Opis.",
        )


def test_learning_unit_response_requires_title():
    # title je obvezno polje za prikaz učne enote.
    with pytest.raises(ValidationError):
        LearningUnitResponse(
            _id="ue_001",
            short_description="Opis.",
        )


def test_learning_unit_response_requires_short_description():
    # short_description je obvezno polje v trenutni response shemi.
    with pytest.raises(ValidationError):
        LearningUnitResponse(
            _id="ue_001",
            title="Učna enota brez opisa",
        )


def test_learning_unit_response_rejects_invalid_content_topic():
    # Če je content topic napačen, mora pasti validacija učne enote.
    with pytest.raises(ValidationError):
        LearningUnitResponse(
            _id="ue_001",
            title="Učna enota",
            short_description="Opis.",
            content_topics=[
                {
                    "title": "Tema brez ID",
                    "related_competency_codes": ["1.2"],
                }
            ],
        )


def test_learning_unit_response_rejects_invalid_digcomp_competency():
    # Če DigComp kompetenca nima obveznih polj, mora pasti validacija.
    with pytest.raises(ValidationError):
        LearningUnitResponse(
            _id="ue_001",
            title="Učna enota",
            short_description="Opis.",
            digcomp_competencies=[
                {
                    "code": "1.2",
                    "title": "Kompetenca brez opisa",
                }
            ],
        )


def test_learning_unit_response_serializes_id_as_alias_when_requested():
    # Pri by_alias=True se id serializira nazaj kot _id.
    learning_unit = LearningUnitResponse(
        _id="ue_001",
        title="Osnovni pojmi umetne inteligence",
        short_description="Opis.",
    )

    result = learning_unit.model_dump(by_alias=True)

    assert result["_id"] == "ue_001"
    assert "id" not in result


def test_recommended_module_response_accepts_valid_data():
    # Preverimo kratko shemo za priporočeni modul na detail strani učne enote.
    module = RecommendedModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Opis modula.",
        duration_hours=1.75,
        keywords=["UI"],
        domains=["Umetna inteligenca"],
    )

    assert module.id == "mod_001"
    assert module.title == "Razumevanje umetne inteligence"
    assert module.duration_hours == 1.75
    assert module.keywords == ["UI"]
    assert module.domains == ["Umetna inteligenca"]


def test_recommended_module_response_uses_default_lists():
    # Če keywords in domains niso poslani, shema uporabi prazna seznama.
    module = RecommendedModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Opis modula.",
    )

    assert module.keywords == []
    assert module.domains == []


def test_learning_unit_detail_response_accepts_recommended_modules():
    # Detail shema razširi učno enoto z recommended_modules.
    learning_unit = LearningUnitDetailResponse(
        _id="ue_001",
        title="Osnovni pojmi umetne inteligence",
        short_description="Opis.",
        recommended_modules=[
            {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
                "short_description": "Opis modula.",
                "duration_hours": 1.75,
                "keywords": ["UI"],
                "domains": ["Umetna inteligenca"],
            }
        ],
    )

    assert learning_unit.id == "ue_001"
    assert len(learning_unit.recommended_modules) == 1
    assert learning_unit.recommended_modules[0].id == "mod_001"


def test_learning_unit_detail_response_uses_default_recommended_modules():
    # Če recommended_modules niso poslani, shema uporabi prazen seznam.
    learning_unit = LearningUnitDetailResponse(
        _id="ue_001",
        title="Osnovni pojmi umetne inteligence",
        short_description="Opis.",
    )

    assert learning_unit.recommended_modules == []


def test_learning_unit_reference_response_accepts_valid_reference():
    # Shema sprejme referenco učne enote znotraj modula.
    reference = LearningUnitReferenceResponse(
        learning_unit_id="ue_001",
        order=1,
        parallel_group=None,
        is_required=True,
        prerequisites=[],
    )

    assert reference.learning_unit_id == "ue_001"
    assert reference.order == 1
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []


def test_learning_unit_reference_response_uses_default_values():
    # Optional polja reference dobijo privzete vrednosti.
    reference = LearningUnitReferenceResponse(
        learning_unit_id="ue_001",
    )

    assert reference.learning_unit_id == "ue_001"
    assert reference.order is None
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []


def test_learning_unit_reference_response_requires_learning_unit_id():
    # learning_unit_id je obvezno polje.
    with pytest.raises(ValidationError):
        LearningUnitReferenceResponse(
            order=1,
        )


def test_learning_unit_reference_response_uses_independent_default_prerequisites_lists():
    # Vsaka referenca mora dobiti svoj ločen default prerequisites seznam.
    first_reference = LearningUnitReferenceResponse(
        learning_unit_id="ue_001",
    )
    second_reference = LearningUnitReferenceResponse(
        learning_unit_id="ue_002",
    )

    first_reference.prerequisites.append("ue_000")

    assert first_reference.prerequisites == ["ue_000"]
    assert second_reference.prerequisites == []