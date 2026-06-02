import pytest
from pydantic import ValidationError

from app.schemas.learning_path_schema import (
    LearningPathResponse,
    LearningPathStepReference,
)


def test_learning_path_step_reference_accepts_valid_module_step():
    # Arrange: pripravimo veljaven korak tipa module.
    step_data = {
        "type": "module",
        "ref_id": "mod_001",
        "order": 1,
        "parallel_group": "group_a",
        "is_required": False,
        "prerequisites": ["mod_000"],
    }

    # Act: ustvarimo Pydantic objekt iz podatkov.
    step = LearningPathStepReference(**step_data)

    # Assert: shema pravilno shrani vse vrednosti.
    assert step.type == "module"
    assert step.ref_id == "mod_001"
    assert step.order == 1
    assert step.parallel_group == "group_a"
    assert step.is_required is False
    assert step.prerequisites == ["mod_000"]


def test_learning_path_step_reference_accepts_valid_learning_unit_step():
    # Arrange: pripravimo veljaven korak tipa learning_unit.
    step_data = {
        "type": "learning_unit",
        "ref_id": "ue_001",
        "order": 2,
    }

    # Act: ustvarimo Pydantic objekt.
    step = LearningPathStepReference(**step_data)

    # Assert: optional/default polja dobijo pravilne privzete vrednosti.
    assert step.type == "learning_unit"
    assert step.ref_id == "ue_001"
    assert step.order == 2
    assert step.parallel_group is None
    assert step.is_required is True
    assert step.prerequisites == []


def test_learning_path_step_reference_rejects_invalid_step_type():
    # Arrange: step type mora biti samo module ali learning_unit.
    step_data = {
        "type": "invalid",
        "ref_id": "mod_001",
        "order": 1,
    }

    # Act + Assert: napačen type mora sprožiti ValidationError.
    with pytest.raises(ValidationError):
        LearningPathStepReference(**step_data)


def test_learning_path_step_reference_requires_ref_id():
    # Arrange: ref_id je obvezno polje.
    step_data = {
        "type": "module",
        "order": 1,
    }

    # Act + Assert: brez ref_id shema ni veljavna.
    with pytest.raises(ValidationError):
        LearningPathStepReference(**step_data)


def test_learning_path_step_reference_requires_order():
    # Arrange: order je obvezno polje za stabilen vrstni red korakov.
    step_data = {
        "type": "module",
        "ref_id": "mod_001",
    }

    # Act + Assert: brez order shema ni veljavna.
    with pytest.raises(ValidationError):
        LearningPathStepReference(**step_data)


def test_learning_path_step_reference_uses_independent_default_prerequisites_lists():
    # Arrange: ustvarimo dva step-a brez prerequisites.
    first_step = LearningPathStepReference(
        type="module",
        ref_id="mod_001",
        order=1,
    )
    second_step = LearningPathStepReference(
        type="module",
        ref_id="mod_002",
        order=2,
    )

    # Act: spremenimo prerequisites samo pri prvem step-u.
    first_step.prerequisites.append("mod_000")

    # Assert: drugi step mora imeti svoj ločen prazen seznam.
    assert first_step.prerequisites == ["mod_000"]
    assert second_step.prerequisites == []


def test_learning_path_response_accepts_valid_learning_path_with_alias_id():
    # Arrange: API/baza uporablja _id, response shema pa ga mapira v id.
    learning_path_data = {
        "_id": "up_001",
        "title": "Osnove digitalnih kompetenc",
        "short_description": "Učna pot za osnovne digitalne kompetence.",
        "duration_hours": 12.5,
        "keywords": ["digitalno", "kompetence"],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_001",
                "order": 1,
            },
            {
                "type": "learning_unit",
                "ref_id": "ue_001",
                "order": 2,
                "prerequisites": ["mod_001"],
            },
        ],
    }

    # Act: ustvarimo LearningPathResponse iz podatkov.
    learning_path = LearningPathResponse(**learning_path_data)

    # Assert: _id se pravilno prebere kot id, steps pa se validirajo kot nested sheme.
    assert learning_path.id == "up_001"
    assert learning_path.title == "Osnove digitalnih kompetenc"
    assert learning_path.short_description == "Učna pot za osnovne digitalne kompetence."
    assert learning_path.duration_hours == 12.5
    assert learning_path.keywords == ["digitalno", "kompetence"]
    assert len(learning_path.steps) == 2
    assert learning_path.steps[0].type == "module"
    assert learning_path.steps[1].type == "learning_unit"
    assert learning_path.steps[1].prerequisites == ["mod_001"]


def test_learning_path_response_accepts_id_by_field_name():
    # Arrange: zaradi populate_by_name=True lahko uporabimo tudi id namesto _id.
    learning_path_data = {
        "id": "up_001",
        "title": "Osnove digitalnih kompetenc",
        "short_description": "Opis učne poti.",
    }

    # Act: ustvarimo response objekt z id poljem.
    learning_path = LearningPathResponse(**learning_path_data)

    # Assert: shema sprejme id in napolni privzeta polja.
    assert learning_path.id == "up_001"
    assert learning_path.duration_hours is None
    assert learning_path.keywords == []
    assert learning_path.steps == []


def test_learning_path_response_uses_default_empty_lists():
    # Arrange: keywords in steps nista poslana.
    learning_path_data = {
        "_id": "up_001",
        "title": "Pot brez dodatnih seznamov",
        "short_description": "Opis.",
    }

    # Act: ustvarimo response objekt.
    learning_path = LearningPathResponse(**learning_path_data)

    # Assert: default_factory pripravi prazne sezname.
    assert learning_path.keywords == []
    assert learning_path.steps == []


def test_learning_path_response_requires_id():
    # Arrange: learning path brez _id/id ni veljaven response.
    learning_path_data = {
        "title": "Pot brez ID",
        "short_description": "Opis.",
    }

    # Act + Assert: manjka obvezni identifikator.
    with pytest.raises(ValidationError):
        LearningPathResponse(**learning_path_data)


def test_learning_path_response_requires_title():
    # Arrange: title je obvezno polje za prikaz učne poti.
    learning_path_data = {
        "_id": "up_001",
        "short_description": "Opis.",
    }

    # Act + Assert: brez title shema ni veljavna.
    with pytest.raises(ValidationError):
        LearningPathResponse(**learning_path_data)


def test_learning_path_response_requires_short_description():
    # Arrange: short_description je obvezno polje v trenutni response shemi.
    learning_path_data = {
        "_id": "up_001",
        "title": "Pot brez opisa",
    }

    # Act + Assert: brez short_description shema ni veljavna.
    with pytest.raises(ValidationError):
        LearningPathResponse(**learning_path_data)


def test_learning_path_response_rejects_invalid_step_inside_steps():
    # Arrange: learning path ima step z napačnim type.
    learning_path_data = {
        "_id": "up_001",
        "title": "Pot z napačnim stepom",
        "short_description": "Opis.",
        "steps": [
            {
                "type": "invalid",
                "ref_id": "mod_001",
                "order": 1,
            }
        ],
    }

    # Act + Assert: nested step validacija mora zavrniti celoten response.
    with pytest.raises(ValidationError):
        LearningPathResponse(**learning_path_data)


def test_learning_path_response_serializes_id_as_alias_when_requested():
    # Arrange: ustvarimo response iz MongoDB oblike z _id.
    learning_path = LearningPathResponse(
        _id="up_001",
        title="Osnove digitalnih kompetenc",
        short_description="Opis.",
    )

    # Act: serializiramo z aliasi, kot jih lahko pričakuje API/baza.
    result = learning_path.model_dump(by_alias=True)

    # Assert: id se pri by_alias=True izpiše kot _id.
    assert result["_id"] == "up_001"
    assert "id" not in result