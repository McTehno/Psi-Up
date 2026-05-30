from conftest import get_document_id, load_json_file


def test_learning_paths_json_is_not_empty():
    # Preverimo, da imamo začetne učne poti za uvoz v MongoDB.
    learning_paths = load_json_file("learning_paths.json")

    assert isinstance(learning_paths, list)
    assert len(learning_paths) > 0


def test_learning_paths_have_unique_ids():
    # Vsaka učna pot mora imeti unikaten _id.
    learning_paths = load_json_file("learning_paths.json")

    ids = [get_document_id(learning_path) for learning_path in learning_paths]

    assert len(ids) == len(set(ids))


def test_learning_paths_have_required_fields():
    # Preverimo osnovna obvezna polja učne poti.
    learning_paths = load_json_file("learning_paths.json")

    required_fields = {
        "_id",
        "title",
        "short_description",
        "duration_hours",
        "keywords",
        "modules",
    }

    for learning_path in learning_paths:
        missing_fields = required_fields - learning_path.keys()

        assert missing_fields == set(), (
            f"Učna pot {learning_path.get('_id')} nima polj: {missing_fields}"
        )


def test_learning_path_keywords_are_lists():
    # Keywords morajo biti seznam, ker jih uporablja search logika.
    learning_paths = load_json_file("learning_paths.json")

    for learning_path in learning_paths:
        assert isinstance(learning_path["keywords"], list), (
            f"keywords mora biti list pri učni poti {learning_path['_id']}"
        )


def test_learning_path_duration_hours_is_number():
    # Trajanje učne poti mora biti številka.
    learning_paths = load_json_file("learning_paths.json")

    for learning_path in learning_paths:
        assert isinstance(learning_path["duration_hours"], int | float), (
            f"duration_hours mora biti številka pri učni poti {learning_path['_id']}"
        )


def test_learning_path_modules_are_lists():
    # Moduli znotraj učne poti morajo biti zapisani kot seznam referenc.
    learning_paths = load_json_file("learning_paths.json")

    for learning_path in learning_paths:
        assert isinstance(learning_path["modules"], list), (
            f"modules mora biti list pri učni poti {learning_path['_id']}"
        )


def test_learning_path_module_references_have_required_fields():
    # Reference modulov morajo imeti podatke za vrstni red in prerequisites logiko.
    learning_paths = load_json_file("learning_paths.json")

    required_reference_fields = {
        "module_id",
        "order",
        "parallel_group",
        "is_required",
        "prerequisites",
    }

    for learning_path in learning_paths:
        for module_reference in learning_path["modules"]:
            missing_fields = required_reference_fields - module_reference.keys()

            assert missing_fields == set(), (
                f"Referenca modula v učni poti {learning_path['_id']} nima polj: "
                f"{missing_fields}"
            )


def test_learning_paths_reference_existing_modules():
    # Vsak module_id v učni poti mora obstajati v modules.json.
    learning_paths = load_json_file("learning_paths.json")
    modules = load_json_file("modules.json")

    module_ids = {
        get_document_id(module)
        for module in modules
    }

    for learning_path in learning_paths:
        for module_reference in learning_path["modules"]:
            referenced_id = module_reference["module_id"]

            assert referenced_id in module_ids, (
                f"Učna pot {learning_path['_id']} kaže na neobstoječ modul: "
                f"{referenced_id}"
            )


def test_learning_path_module_prerequisites_reference_modules_in_same_path():
    # Prerequisites smejo kazati samo na module znotraj iste učne poti.
    learning_paths = load_json_file("learning_paths.json")

    for learning_path in learning_paths:
        learning_path_module_ids = {
            module_reference["module_id"]
            for module_reference in learning_path["modules"]
        }

        for module_reference in learning_path["modules"]:
            for prerequisite_id in module_reference["prerequisites"]:
                assert prerequisite_id in learning_path_module_ids, (
                    f"Prerequisite {prerequisite_id} v učni poti "
                    f"{learning_path['_id']} ne obstaja znotraj iste učne poti."
                )