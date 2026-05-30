from conftest import get_document_id, load_json_file


def test_modules_json_is_not_empty():
    # Preverimo, da imamo začetne module za uvoz v MongoDB.
    modules = load_json_file("modules.json")

    assert isinstance(modules, list)
    assert len(modules) > 0


def test_modules_have_unique_ids():
    # Vsak modul mora imeti unikaten _id.
    modules = load_json_file("modules.json")

    ids = [get_document_id(module) for module in modules]

    assert len(ids) == len(set(ids))


def test_modules_have_required_fields():
    # Preverimo osnovna obvezna polja modula.
    modules = load_json_file("modules.json")

    required_fields = {
        "_id",
        "title",
        "short_description",
        "duration_hours",
        "keywords",
        "domains",
        "learning_units",
    }

    for module in modules:
        missing_fields = required_fields - module.keys()

        assert missing_fields == set(), (
            f"Modul {module.get('_id')} nima polj: {missing_fields}"
        )


def test_module_keywords_are_lists():
    # Keywords morajo biti seznam, ker jih uporablja search logika.
    modules = load_json_file("modules.json")

    for module in modules:
        assert isinstance(module["keywords"], list), (
            f"keywords mora biti list pri modulu {module['_id']}"
        )


def test_module_domains_are_lists():
    # Domains morajo biti seznam področij, ki jih modul pokriva.
    modules = load_json_file("modules.json")

    for module in modules:
        assert isinstance(module["domains"], list), (
            f"domains mora biti list pri modulu {module['_id']}"
        )


def test_module_duration_hours_is_number():
    # Trajanje modula mora biti številka.
    modules = load_json_file("modules.json")

    for module in modules:
        assert isinstance(module["duration_hours"], int | float), (
            f"duration_hours mora biti številka pri modulu {module['_id']}"
        )


def test_module_learning_units_are_lists():
    # Učne enote znotraj modula morajo biti zapisane kot seznam referenc.
    modules = load_json_file("modules.json")

    for module in modules:
        assert isinstance(module["learning_units"], list), (
            f"learning_units mora biti list pri modulu {module['_id']}"
        )


def test_module_learning_unit_references_have_required_fields():
    # Reference učnih enot morajo imeti podatke za vrstni red in prerequisites logiko.
    modules = load_json_file("modules.json")

    required_reference_fields = {
        "learning_unit_id",
        "order",
        "parallel_group",
        "is_required",
        "prerequisites",
    }

    for module in modules:
        for learning_unit_reference in module["learning_units"]:
            missing_fields = required_reference_fields - learning_unit_reference.keys()

            assert missing_fields == set(), (
                f"Referenca učne enote v modulu {module['_id']} nima polj: "
                f"{missing_fields}"
            )


def test_modules_reference_existing_learning_units():
    # Vsak learning_unit_id v modulu mora obstajati v learning_units.json.
    modules = load_json_file("modules.json")
    learning_units = load_json_file("learning_units.json")

    learning_unit_ids = {
        get_document_id(learning_unit)
        for learning_unit in learning_units
    }

    for module in modules:
        for learning_unit_reference in module["learning_units"]:
            referenced_id = learning_unit_reference["learning_unit_id"]

            assert referenced_id in learning_unit_ids, (
                f"Modul {module['_id']} kaže na neobstoječo učno enoto: "
                f"{referenced_id}"
            )


def test_module_learning_unit_prerequisites_reference_units_in_same_module():
    # Prerequisites smejo kazati samo na učne enote znotraj istega modula.
    modules = load_json_file("modules.json")

    for module in modules:
        module_learning_unit_ids = {
            learning_unit_reference["learning_unit_id"]
            for learning_unit_reference in module["learning_units"]
        }

        for learning_unit_reference in module["learning_units"]:
            for prerequisite_id in learning_unit_reference["prerequisites"]:
                assert prerequisite_id in module_learning_unit_ids, (
                    f"Prerequisite {prerequisite_id} v modulu {module['_id']} "
                    "ne obstaja znotraj istega modula."
                )