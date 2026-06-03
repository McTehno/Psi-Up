import pytest
from unittest.mock import AsyncMock

from app.services.learning_paths.learning_path_service import LearningPathService


# Mock repository-ja za učne poti.
# Tako testiramo service logiko brez povezave z MongoDB.
@pytest.fixture
def learning_path_repository():
    return AsyncMock()


# Mock service-a za module.
# Uporablja se pri detail prikazu in vprašanjih za samooceno.
@pytest.fixture
def module_service():
    return AsyncMock()


# Mock service-a za učne enote.
# Uporablja se pri detail prikazu in vprašanjih za samooceno.
@pytest.fixture
def learning_unit_service():
    return AsyncMock()


# Glavni fixture za LearningPathService.
# Vsak test dobi svežo instanco service-a z mock dependency-ji.
@pytest.fixture
def service(
    learning_path_repository,
    module_service,
    learning_unit_service,
):
    return LearningPathService(
        learning_path_repository=learning_path_repository,
        module_service=module_service,
        learning_unit_service=learning_unit_service,
    )


def test_normalize_step_reference_returns_valid_module_step(service):
    # Arrange: pripravimo veljaven module step z odvečnimi presledki in nečistimi prerequisites.
    reference = {
        "type": "module",
        "ref_id": " mod_001 ",
        "order": 2,
        "parallel_group": " group_a ",
        "is_required": False,
        "prerequisites": [" mod_000 ", "", 123, "mod_099"],
    }

    # Act: normaliziramo en step znotraj učne poti.
    result = service._normalize_step_reference(reference)

    # Assert: step je očiščen, neveljavni prerequisites so odstranjeni.
    assert result == {
        "type": "module",
        "ref_id": "mod_001",
        "order": 2,
        "parallel_group": "group_a",
        "is_required": False,
        "prerequisites": ["mod_000", "mod_099"],
    }


def test_normalize_step_reference_returns_valid_learning_unit_step(service):
    # Arrange: pripravimo veljaven learning_unit step.
    reference = {
        "type": "learning_unit",
        "ref_id": "ue_001",
        "order": 1,
        "parallel_group": None,
        "is_required": True,
        "prerequisites": [],
    }

    # Act: normaliziramo step.
    result = service._normalize_step_reference(reference)

    # Assert: learning_unit step ostane veljaven in ima stabilno strukturo.
    assert result == {
        "type": "learning_unit",
        "ref_id": "ue_001",
        "order": 1,
        "parallel_group": None,
        "is_required": True,
        "prerequisites": [],
    }


def test_normalize_step_reference_skips_invalid_type(service):
    # Arrange: step ima napačen type.
    reference = {
        "type": "invalid",
        "ref_id": "mod_001",
    }

    # Act: poskusimo normalizirati neveljaven step.
    result = service._normalize_step_reference(reference)

    # Assert: neveljaven step se preskoči.
    assert result is None


def test_normalize_step_reference_skips_missing_ref_id(service):
    # Arrange: step nima veljavnega ref_id.
    reference = {
        "type": "module",
        "ref_id": "",
    }

    # Act: poskusimo normalizirati step brez ref_id.
    result = service._normalize_step_reference(reference)

    # Assert: step brez ref_id se preskoči.
    assert result is None


def test_normalize_step_references_skips_invalid_items_and_sorts_by_order(service):
    # Arrange: seznam vsebuje veljavne, neveljavne in napačno urejene step-e.
    references = [
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
        },
        "invalid-item",
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
        },
        {
            "type": "module",
            "ref_id": "",
            "order": 3,
        },
    ]

    # Act: normaliziramo seznam step referenc.
    result = service._normalize_step_references(references)

    # Assert: neveljavni elementi so odstranjeni, veljavni pa urejeni po order.
    assert result == [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
    ]


def test_normalize_learning_path_removes_old_modules_field_and_normalizes_steps(service):
    # Arrange: learning path vsebuje staro polje modules in novo polje steps.
    learning_path = {
        "_id": "up_001",
        "title": " Osnove digitalnih kompetenc ",
        "short_description": None,
        "keywords": [" digitalno ", "", 123, "kompetence"],
        "modules": [
            {
                "module_id": "old_mod_001",
            }
        ],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_002",
                "order": 2,
            },
            {
                "type": "learning_unit",
                "ref_id": "ue_001",
                "order": 1,
            },
        ],
    }

    # Act: normaliziramo learning path.
    result = service._normalize_learning_path(learning_path)

    # Assert: response uporablja novo steps strukturo in ne vrača starega modules polja.
    assert result["_id"] == "up_001"
    assert result["title"] == "Osnove digitalnih kompetenc"
    assert result["short_description"] == ""
    assert result["keywords"] == ["digitalno", "kompetence"]
    assert "modules" not in result
    assert result["steps"] == [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
    ]


@pytest.mark.asyncio
async def test_get_all_learning_paths_returns_normalized_learning_paths(
    service,
    learning_path_repository,
):
    # Arrange: repository vrne en veljaven learning path in en neveljaven element.
    learning_path_repository.get_all_learning_paths.return_value = [
        {
            "_id": "up_001",
            "title": " Pot 1 ",
            "short_description": None,
            "keywords": [" test "],
            "steps": [],
            "modules": [],
        },
        "invalid-item",
    ]

    # Act: service pridobi vse učne poti.
    result = await service.get_all_learning_paths()

    # Assert: service vrne samo normalizirane learning path dokumente.
    assert result == [
        {
            "_id": "up_001",
            "title": "Pot 1",
            "short_description": "",
            "keywords": ["test"],
            "steps": [],
        }
    ]

    # Assert: preverimo, da je bil repository res poklican.
    learning_path_repository.get_all_learning_paths.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_learning_path_by_id_returns_none_when_not_found(
    service,
    learning_path_repository,
):
    # Arrange: repository ne najde učne poti.
    learning_path_repository.get_learning_path_by_id.return_value = None

    # Act: poskusimo pridobiti neobstoječo učno pot.
    result = await service.get_learning_path_by_id("up_missing")

    # Assert: service vrne None, ker learning path ne obstaja.
    assert result is None
    learning_path_repository.get_learning_path_by_id.assert_awaited_once_with(
        "up_missing"
    )


@pytest.mark.asyncio
async def test_get_learning_path_by_id_returns_normalized_learning_path(
    service,
    learning_path_repository,
):
    # Arrange: repository vrne learning path z odvečnimi presledki in starim modules poljem.
    learning_path_repository.get_learning_path_by_id.return_value = {
        "_id": "up_001",
        "title": " Pot 1 ",
        "short_description": " Opis ",
        "keywords": [" a ", "b"],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_001",
                "order": 1,
            }
        ],
        "modules": [],
    }

    # Act: pridobimo learning path po ID-ju.
    result = await service.get_learning_path_by_id("up_001")

    # Assert: learning path je normaliziran pred vračanjem response-a.
    assert result == {
        "_id": "up_001",
        "title": "Pot 1",
        "short_description": "Opis",
        "keywords": ["a", "b"],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    }


@pytest.mark.asyncio
async def test_get_learning_path_detail_adds_module_and_learning_unit_details(
    service,
    learning_path_repository,
    module_service,
    learning_unit_service,
):
    # Arrange: learning path ima en module step in en samostojen learning_unit step.
    learning_path_repository.get_learning_path_by_id.return_value = {
        "_id": "up_001",
        "title": "Pot 1",
        "short_description": "",
        "keywords": [],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_001",
                "order": 2,
            },
            {
                "type": "learning_unit",
                "ref_id": "ue_001",
                "order": 1,
            },
        ],
    }

    # Arrange: mock module service vrne podrobnosti modula.
    module_service.get_modules_by_ids.return_value = [
        {
            "_id": "mod_001",
            "title": "Modul 1",
        }
    ]

    # Arrange: mock learning unit service vrne podrobnosti učne enote.
    learning_unit_service.get_learning_units_by_ids.return_value = [
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
        }
    ]

    # Act: pridobimo detail podatke učne poti.
    result = await service.get_learning_path_detail("up_001")

    # Assert: detail response vsebuje normalizirane steps, module_details in learning_unit_details.
    assert result is not None
    assert result["_id"] == "up_001"
    assert result["steps"] == [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
    ]
    assert result["module_details"] == [
        {
            "_id": "mod_001",
            "title": "Modul 1",
        }
    ]
    assert result["learning_unit_details"] == [
        {
            "_id": "ue_001",
            "title": "Učna enota 1",
        }
    ]

    # Assert: service pokliče dependency-je samo z ID-ji, ki jih najde v steps.
    module_service.get_modules_by_ids.assert_awaited_once_with(["mod_001"])
    learning_unit_service.get_learning_units_by_ids.assert_awaited_once_with(["ue_001"])


@pytest.mark.asyncio
async def test_get_learning_path_detail_returns_none_when_learning_path_not_found(
    service,
    learning_path_repository,
    module_service,
    learning_unit_service,
):
    # Arrange: repository ne najde učne poti.
    learning_path_repository.get_learning_path_by_id.return_value = None

    # Act: poskusimo pridobiti detail za neobstoječo učno pot.
    result = await service.get_learning_path_detail("up_missing")

    # Assert: service vrne None in ne kliče dodatnih service-ov.
    assert result is None
    module_service.get_modules_by_ids.assert_not_called()
    learning_unit_service.get_learning_units_by_ids.assert_not_called()


@pytest.mark.asyncio
async def test_get_step_references_for_learning_path_returns_normalized_steps(
    service,
    learning_path_repository,
):
    # Arrange: repository vrne step-e v napačnem vrstnem redu.
    learning_path_repository.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
        },
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 1,
        },
    ]

    # Act: pridobimo step reference za učno pot.
    result = await service.get_step_references_for_learning_path("up_001")

    # Assert: service vrne normalizirane step-e, urejene po order.
    assert [step["ref_id"] for step in result] == ["mod_001", "mod_002"]

    learning_path_repository.get_step_references_for_learning_path.assert_awaited_once_with(
        "up_001"
    )


@pytest.mark.asyncio
async def test_get_module_references_for_learning_path_returns_only_modules(
    service,
    learning_path_repository,
):
    # Arrange: learning path vsebuje module in learning_unit step.
    learning_path_repository.get_step_references_for_learning_path.return_value = [
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 1,
        },
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 2,
            "is_required": False,
            "prerequisites": ["mod_000"],
        },
    ]

    # Act: pridobimo compatibility module reference.
    result = await service.get_module_references_for_learning_path("up_001")

    # Assert: metoda vrne samo module, pretvorjene v staro module_id obliko.
    assert result == [
        {
            "module_id": "mod_001",
            "order": 2,
            "parallel_group": None,
            "is_required": False,
            "prerequisites": ["mod_000"],
        }
    ]


@pytest.mark.asyncio
async def test_get_available_steps_for_learning_path_returns_steps_with_completed_prerequisites(
    service,
    learning_path_repository,
):
    # Arrange: mod_002 je odklenjen šele, ko je mod_001 completed.
    learning_path_repository.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 1,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
            "prerequisites": ["mod_001"],
        },
        {
            "type": "learning_unit",
            "ref_id": "ue_003",
            "order": 3,
            "prerequisites": ["mod_999"],
        },
    ]

    # Act: preverimo, kateri step-i so dostopni, ko je mod_001 zaključen.
    result = await service.get_available_steps_for_learning_path(
        learning_path_id="up_001",
        completed_step_ids=["mod_001"],
    )

    # Assert: dostopni so step-i brez prerequisites in step-i z izpolnjenimi prerequisites.
    assert [step["ref_id"] for step in result] == ["mod_001", "mod_002"]


@pytest.mark.asyncio
async def test_get_available_steps_for_learning_path_keeps_completed_steps_available(
    service,
    learning_path_repository,
):
    # Arrange: oba modula sta že completed.
    learning_path_repository.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 1,
            "prerequisites": [],
        },
        {
            "type": "module",
            "ref_id": "mod_002",
            "order": 2,
            "prerequisites": ["mod_001"],
        },
    ]

    # Act: pridobimo available step-e za že zaključene step-e.
    result = await service.get_available_steps_for_learning_path(
        learning_path_id="up_001",
        completed_step_ids=["mod_001", "mod_002"],
    )

    # Assert: completed vsebine ostanejo available, ker available pomeni dostopno, ne nedokončano.
    assert [step["ref_id"] for step in result] == ["mod_001", "mod_002"]


@pytest.mark.asyncio
async def test_get_self_assessment_questions_for_learning_path_collects_questions_from_modules_and_learning_units(
    service,
    learning_path_repository,
    module_service,
    learning_unit_service,
):
    # Arrange: learning path vsebuje modul in samostojno učno enoto.
    learning_path_repository.get_step_references_for_learning_path.return_value = [
        {
            "type": "module",
            "ref_id": "mod_001",
            "order": 1,
        },
        {
            "type": "learning_unit",
            "ref_id": "ue_001",
            "order": 2,
        },
    ]

    # Arrange: modul vrne svoja vprašanja za samooceno.
    module_service.get_self_assessment_questions_for_module.return_value = [
        {
            "id": "q_mod_001_001",
            "question": "Znam osnovo modula.",
            "module_id": "mod_001",
        }
    ]

    # Arrange: učna enota vrne svoja vprašanja za samooceno.
    learning_unit_service.get_self_assessment_questions_for_learning_unit.return_value = [
        {
            "id": "q_ue_001_001",
            "question": "Znam osnovo učne enote.",
            "learning_unit_id": "ue_001",
        }
    ]

    # Act: pridobimo vprašanja za celotno učno pot.
    result = await service.get_self_assessment_questions_for_learning_path("up_001")

    # Assert: vprašanja iz modula in učne enote dobijo learning_path_id.
    assert result == [
        {
            "id": "q_mod_001_001",
            "question": "Znam osnovo modula.",
            "module_id": "mod_001",
            "learning_path_id": "up_001",
            "order": 1,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
        {
            "id": "q_ue_001_001",
            "question": "Znam osnovo učne enote.",
            "learning_unit_id": "ue_001",
            "learning_path_id": "up_001",
            "order": 2,
            "parallel_group": None,
            "is_required": True,
            "prerequisites": [],
        },
    ]

    # Assert: service pravilno pokliče module in learning unit service.
    module_service.get_self_assessment_questions_for_module.assert_awaited_once_with(
        "mod_001"
    )
    learning_unit_service.get_self_assessment_questions_for_learning_unit.assert_awaited_once_with(
        "ue_001"
    )