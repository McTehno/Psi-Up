import pytest
from pydantic import ValidationError

from app.schemas.module_schema import (
    ModuleDetailResponse,
    ModuleReferenceResponse,
    ModuleResponse,
    RecommendedLearningPathResponse,
)


def test_module_response_accepts_valid_module_with_alias_id():
    # Preverimo, da shema sprejme MongoDB _id in ga mapira v id.
    module = ModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Modul predstavlja osnovne pojme umetne inteligence.",
        duration_hours=1.75,
        keywords=["umetna inteligenca", "UI"],
        domains=["Umetna inteligenca"],
        learning_units=[
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    )

    assert module.id == "mod_001"
    assert module.title == "Razumevanje umetne inteligence"
    assert module.short_description == "Modul predstavlja osnovne pojme umetne inteligence."
    assert module.duration_hours == 1.75
    assert module.keywords == ["umetna inteligenca", "UI"]
    assert module.domains == ["Umetna inteligenca"]
    assert len(module.learning_units) == 1
    assert module.learning_units[0].learning_unit_id == "ue_001"


def test_module_response_accepts_id_by_field_name():
    # Zaradi populate_by_name=True lahko uporabimo tudi id namesto _id.
    module = ModuleResponse(
        id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Opis modula.",
    )

    assert module.id == "mod_001"
    assert module.duration_hours is None
    assert module.keywords == []
    assert module.domains == []
    assert module.learning_units == []


def test_module_response_uses_default_empty_lists():
    # Če seznami niso poslani, shema uporabi prazne sezname.
    module = ModuleResponse(
        _id="mod_001",
        title="Modul brez seznamov",
        short_description="Opis.",
    )

    assert module.keywords == []
    assert module.domains == []
    assert module.learning_units == []


def test_module_response_requires_id():
    # Modul brez _id ali id ni veljaven response.
    with pytest.raises(ValidationError):
        ModuleResponse(
            title="Modul brez ID",
            short_description="Opis.",
        )


def test_module_response_requires_title():
    # title je obvezno polje za prikaz modula.
    with pytest.raises(ValidationError):
        ModuleResponse(
            _id="mod_001",
            short_description="Opis.",
        )


def test_module_response_requires_short_description():
    # short_description je obvezno polje v trenutni response shemi.
    with pytest.raises(ValidationError):
        ModuleResponse(
            _id="mod_001",
            title="Modul brez opisa",
        )


def test_module_response_rejects_invalid_learning_unit_reference():
    # Če je learning unit referenca napačna, mora pasti validacija modula.
    with pytest.raises(ValidationError):
        ModuleResponse(
            _id="mod_001",
            title="Modul z napačno učno enoto",
            short_description="Opis.",
            learning_units=[
                {
                    "learning_unit_id": "ue_001",
                    "order": "not-an-int",
                    "parallel_group": None,
                    "is_required": True,
                    "prerequisites": [],
                }
            ],
        )


def test_module_response_serializes_id_as_alias_when_requested():
    # Pri by_alias=True se id serializira nazaj kot _id.
    module = ModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Opis.",
    )

    result = module.model_dump(by_alias=True)

    assert result["_id"] == "mod_001"
    assert "id" not in result


def test_recommended_learning_path_response_accepts_valid_data():
    # Preverimo kratko shemo za priporočeno učno pot na detail strani modula.
    learning_path = RecommendedLearningPathResponse(
        _id="up_001",
        title="Iskanje informacij z umetno inteligenco",
        short_description="Učna pot za uporabo umetne inteligence.",
        duration_hours=4.25,
        keywords=["umetna inteligenca", "iskanje"],
    )

    assert learning_path.id == "up_001"
    assert learning_path.title == "Iskanje informacij z umetno inteligenco"
    assert learning_path.duration_hours == 4.25
    assert learning_path.keywords == ["umetna inteligenca", "iskanje"]


def test_recommended_learning_path_response_uses_default_keywords():
    # Če keywords niso poslani, shema uporabi prazen seznam.
    learning_path = RecommendedLearningPathResponse(
        _id="up_001",
        title="Učna pot",
        short_description="Opis.",
    )

    assert learning_path.keywords == []


def test_module_detail_response_accepts_learning_unit_details_and_recommended_paths():
    # Detail shema razširi modul z learning_unit_details in recommended_learning_paths.
    module = ModuleDetailResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Opis modula.",
        duration_hours=1.75,
        keywords=["UI"],
        domains=["Umetna inteligenca"],
        learning_units=[
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
        learning_unit_details=[
            {
                "_id": "ue_001",
                "title": "Kaj je umetna inteligenca",
                "short_description": "Osnovni pojmi UI.",
                "duration_hours": 0.5,
                "keywords": ["UI"],
                "domains": ["Umetna inteligenca"],
                "content_topics": [],
                "self_assessment_questions": [],
            }
        ],
        recommended_learning_paths=[
            {
                "_id": "up_001",
                "title": "Iskanje informacij z umetno inteligenco",
                "short_description": "Opis učne poti.",
                "duration_hours": 4.25,
                "keywords": ["UI"],
            }
        ],
    )

    assert module.id == "mod_001"
    assert len(module.learning_units) == 1
    assert len(module.learning_unit_details) == 1
    assert len(module.recommended_learning_paths) == 1
    assert module.learning_unit_details[0].id == "ue_001"
    assert module.recommended_learning_paths[0].id == "up_001"


def test_module_detail_response_uses_default_detail_lists():
    # Če detail seznami niso poslani, shema uporabi prazne sezname.
    module = ModuleDetailResponse(
        _id="mod_001",
        title="Modul",
        short_description="Opis.",
    )

    assert module.learning_unit_details == []
    assert module.recommended_learning_paths == []


def test_module_reference_response_accepts_valid_reference():
    # Compatibility shema sprejme referenco modula v starejši module_id obliki.
    reference = ModuleReferenceResponse(
        module_id="mod_001",
        order=1,
        parallel_group=None,
        is_required=True,
        prerequisites=[],
    )

    assert reference.module_id == "mod_001"
    assert reference.order == 1
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []


def test_module_reference_response_uses_default_values():
    # Optional polja compatibility reference dobijo privzete vrednosti.
    reference = ModuleReferenceResponse(
        module_id="mod_001",
    )

    assert reference.module_id == "mod_001"
    assert reference.order is None
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []


def test_module_reference_response_requires_module_id():
    # module_id je obvezno polje.
    with pytest.raises(ValidationError):
        ModuleReferenceResponse(
            order=1,
        )


def test_module_reference_response_uses_independent_default_prerequisites_lists():
    # Vsaka module referenca mora dobiti svoj ločen default prerequisites seznam.
    first_reference = ModuleReferenceResponse(
        module_id="mod_001",
    )
    second_reference = ModuleReferenceResponse(
        module_id="mod_002",
    )

    first_reference.prerequisites.append("mod_000")

    assert first_reference.prerequisites == ["mod_000"]
    assert second_reference.prerequisites == []