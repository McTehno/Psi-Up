from app.schemas.module_schema import ModuleReferenceResponse, ModuleResponse


def test_module_response_maps_mongodb_id_to_id():
    # Preverimo, da shema pravilno pretvori MongoDB _id v API polje id.
    module = ModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Kratek opis modula.",
    )

    assert module.id == "mod_001"


def test_module_response_uses_default_empty_lists():
    # Preverimo, da manjkajoči seznami dobijo varne privzete vrednosti.
    module = ModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Kratek opis modula.",
    )

    assert module.keywords == []
    assert module.domains == []
    assert module.learning_units == []


def test_module_response_accepts_learning_unit_references():
    # Preverimo, da modul sprejme reference na učne enote.
    module = ModuleResponse(
        _id="mod_001",
        title="Razumevanje umetne inteligence",
        short_description="Kratek opis modula.",
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

    assert module.learning_units[0].learning_unit_id == "ue_001"
    assert module.learning_units[0].order == 1


def test_module_reference_response_uses_default_values():
    # Reference modulov imajo privzete vrednosti za prikaz in prerequisites logiko.
    reference = ModuleReferenceResponse(
        module_id="mod_001",
    )

    assert reference.module_id == "mod_001"
    assert reference.order is None
    assert reference.parallel_group is None
    assert reference.is_required is True
    assert reference.prerequisites == []