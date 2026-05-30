from app.schemas.learning_path_schema import LearningPathResponse


def test_learning_path_response_maps_mongodb_id_to_id():
    # Preverimo, da shema pravilno pretvori MongoDB _id v API polje id.
    learning_path = LearningPathResponse(
        _id="up_001",
        title="Iskanje informacij z umetno inteligenco",
        short_description="Kratek opis učne poti.",
    )

    assert learning_path.id == "up_001"


def test_learning_path_response_uses_default_empty_lists():
    # Preverimo, da manjkajoči seznami dobijo varne privzete vrednosti.
    learning_path = LearningPathResponse(
        _id="up_001",
        title="Iskanje informacij z umetno inteligenco",
        short_description="Kratek opis učne poti.",
    )

    assert learning_path.keywords == []
    assert learning_path.modules == []


def test_learning_path_response_accepts_module_references():
    # Preverimo, da učna pot sprejme reference na module.
    learning_path = LearningPathResponse(
        _id="up_001",
        title="Iskanje informacij z umetno inteligenco",
        short_description="Kratek opis učne poti.",
        modules=[
            {
                "module_id": "mod_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    )

    assert learning_path.modules[0].module_id == "mod_001"
    assert learning_path.modules[0].order == 1