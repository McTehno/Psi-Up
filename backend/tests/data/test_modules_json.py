import json
from pathlib import Path


MODULES_JSON_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "nova_verzija_data"
    / "modules.json"
)


def load_modules():
    # Preberemo modules.json iz nove data mape.
    with MODULES_JSON_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def test_modules_json_file_exists():
    # Preverimo, da modules.json obstaja na pričakovani lokaciji.
    assert MODULES_JSON_PATH.exists()


def test_modules_json_contains_list():
    # Glavna struktura modules.json mora biti seznam modulov.
    modules = load_modules()

    assert isinstance(modules, list)
    assert len(modules) > 0


def test_each_module_has_required_fields():
    # Vsak modul mora imeti osnovna obvezna polja.
    modules = load_modules()

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
        assert required_fields.issubset(module.keys())


def test_each_module_has_valid_basic_values():
    # Osnovna polja modula morajo imeti pravilne tipe in ne smejo biti prazna.
    modules = load_modules()

    for module in modules:
        assert isinstance(module["_id"], str)
        assert module["_id"].strip()

        assert isinstance(module["title"], str)
        assert module["title"].strip()

        assert isinstance(module["short_description"], str)
        assert module["short_description"].strip()

        assert isinstance(module["duration_hours"], (int, float))
        assert module["duration_hours"] > 0

        assert isinstance(module["keywords"], list)
        assert len(module["keywords"]) > 0

        assert isinstance(module["domains"], list)
        assert len(module["domains"]) > 0

        assert isinstance(module["learning_units"], list)
        assert len(module["learning_units"]) > 0


def test_module_ids_are_unique():
    # Vsak modul mora imeti unikaten _id.
    modules = load_modules()

    module_ids = [
        module["_id"]
        for module in modules
    ]

    assert len(module_ids) == len(set(module_ids))


def test_module_keywords_are_valid_strings():
    # Keywords morajo biti neprazni stringi.
    modules = load_modules()

    for module in modules:
        for keyword in module["keywords"]:
            assert isinstance(keyword, str)
            assert keyword.strip()


def test_module_domains_are_valid_strings():
    # Domains morajo biti neprazni stringi.
    modules = load_modules()

    for module in modules:
        for domain in module["domains"]:
            assert isinstance(domain, str)
            assert domain.strip()


def test_each_learning_unit_reference_has_required_fields():
    # Vsaka learning unit referenca mora imeti polja, ki jih pričakuje modul.
    modules = load_modules()

    required_learning_unit_fields = {
        "learning_unit_id",
        "order",
        "parallel_group",
        "is_required",
        "prerequisites",
    }

    for module in modules:
        for learning_unit in module["learning_units"]:
            assert required_learning_unit_fields.issubset(learning_unit.keys())


def test_each_learning_unit_reference_has_valid_values():
    # Learning unit reference morajo imeti pravilne tipe in veljavne vrednosti.
    modules = load_modules()

    for module in modules:
        for learning_unit in module["learning_units"]:
            assert isinstance(learning_unit["learning_unit_id"], str)
            assert learning_unit["learning_unit_id"].strip()

            assert isinstance(learning_unit["order"], int)
            assert learning_unit["order"] > 0

            assert learning_unit["parallel_group"] is None or isinstance(
                learning_unit["parallel_group"],
                str,
            )

            assert isinstance(learning_unit["is_required"], bool)

            assert isinstance(learning_unit["prerequisites"], list)


def test_learning_unit_prerequisites_are_valid_strings():
    # Prerequisites morajo biti seznam nepraznih learning unit ID stringov.
    modules = load_modules()

    for module in modules:
        for learning_unit in module["learning_units"]:
            for prerequisite in learning_unit["prerequisites"]:
                assert isinstance(prerequisite, str)
                assert prerequisite.strip()


def test_learning_unit_ids_are_unique_inside_module():
    # Znotraj enega modula se ista učna enota ne sme ponoviti.
    modules = load_modules()

    for module in modules:
        learning_unit_ids = [
            learning_unit["learning_unit_id"]
            for learning_unit in module["learning_units"]
        ]

        assert len(learning_unit_ids) == len(set(learning_unit_ids))


def test_learning_unit_orders_are_positive_and_non_decreasing():
    # Order mora biti pozitiven in urejen naraščajoče ali vzporedno z enako vrednostjo.
    modules = load_modules()

    for module in modules:
        orders = [
            learning_unit["order"]
            for learning_unit in module["learning_units"]
        ]

        assert all(order > 0 for order in orders)
        assert orders == sorted(orders)


def test_parallel_learning_units_with_same_order_have_parallel_group_when_needed():
    # Če ima več učnih enot enak order, naj imajo parallel_group.
    modules = load_modules()

    for module in modules:
        order_counts = {}

        for learning_unit in module["learning_units"]:
            order = learning_unit["order"]
            order_counts[order] = order_counts.get(order, 0) + 1

        repeated_orders = {
            order
            for order, count in order_counts.items()
            if count > 1
        }

        for learning_unit in module["learning_units"]:
            if learning_unit["order"] in repeated_orders:
                assert learning_unit["parallel_group"] is not None
                assert learning_unit["parallel_group"].strip()


def test_prerequisites_reference_existing_previous_learning_units():
    # Prerequisites morajo kazati na učne enote, ki obstajajo prej v istem modulu.
    modules = load_modules()

    for module in modules:
        learning_units_by_id = {
            learning_unit["learning_unit_id"]: learning_unit
            for learning_unit in module["learning_units"]
        }

        for learning_unit in module["learning_units"]:
            for prerequisite_id in learning_unit["prerequisites"]:
                assert prerequisite_id in learning_units_by_id
                assert learning_units_by_id[prerequisite_id]["order"] < learning_unit["order"]


def test_optional_learning_units_have_valid_structure():
    # Optional učne enote so dovoljene, ampak morajo imeti veljaven order in prerequisites.
    modules = load_modules()

    optional_learning_units = [
        learning_unit
        for module in modules
        for learning_unit in module["learning_units"]
        if learning_unit["is_required"] is False
    ]

    for learning_unit in optional_learning_units:
        assert learning_unit["order"] > 0
        assert isinstance(learning_unit["prerequisites"], list)


def test_modules_include_expected_example_ids():
    # Preverimo, da so prisotni pričakovani začetni moduli iz nove data verzije.
    modules = load_modules()

    module_ids = {
        module["_id"]
        for module in modules
    }

    assert "mod_001" in module_ids
    assert "mod_002" in module_ids
    assert "mod_003" in module_ids
    assert "mod_004" in module_ids
    assert "mod_005" in module_ids
    assert "mod_006" in module_ids