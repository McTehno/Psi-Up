import json
from pathlib import Path


LEARNING_PATHS_JSON_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "nova_verzija_data"
    / "learning_paths.json"
)


def load_learning_paths():
    # Preberemo learning_paths.json iz data mape.
    with LEARNING_PATHS_JSON_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def test_learning_paths_json_file_exists():
    # Preverimo, da learning_paths.json obstaja na pričakovani lokaciji.
    assert LEARNING_PATHS_JSON_PATH.exists()


def test_learning_paths_json_contains_list():
    # Preverimo, da je glavna struktura JSON datoteke seznam učnih poti.
    learning_paths = load_learning_paths()

    assert isinstance(learning_paths, list)
    assert len(learning_paths) > 0


def test_each_learning_path_has_required_fields():
    # Vsaka učna pot mora imeti osnovna obvezna polja.
    learning_paths = load_learning_paths()

    required_fields = {
        "_id",
        "title",
        "short_description",
        "duration_hours",
        "keywords",
        "steps",
    }

    for learning_path in learning_paths:
        assert required_fields.issubset(learning_path.keys())


def test_each_learning_path_has_valid_basic_values():
    # Osnovna polja morajo imeti pravilne tipe in ne smejo biti prazna.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        assert isinstance(learning_path["_id"], str)
        assert learning_path["_id"].strip()

        assert isinstance(learning_path["title"], str)
        assert learning_path["title"].strip()

        assert isinstance(learning_path["short_description"], str)
        assert learning_path["short_description"].strip()

        assert isinstance(learning_path["duration_hours"], (int, float))
        assert learning_path["duration_hours"] > 0

        assert isinstance(learning_path["keywords"], list)
        assert len(learning_path["keywords"]) > 0

        assert isinstance(learning_path["steps"], list)
        assert len(learning_path["steps"]) > 0


def test_learning_path_ids_are_unique():
    # Vsaka učna pot mora imeti unikaten _id.
    learning_paths = load_learning_paths()

    learning_path_ids = [
        learning_path["_id"]
        for learning_path in learning_paths
    ]

    assert len(learning_path_ids) == len(set(learning_path_ids))


def test_learning_path_keywords_are_valid_strings():
    # Keywords morajo biti neprazni stringi.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        for keyword in learning_path["keywords"]:
            assert isinstance(keyword, str)
            assert keyword.strip()


def test_each_step_has_required_fields():
    # Vsak step mora imeti polja, ki jih pričakuje nova learning path struktura.
    learning_paths = load_learning_paths()

    required_step_fields = {
        "type",
        "ref_id",
        "order",
        "parallel_group",
        "is_required",
        "prerequisites",
    }

    for learning_path in learning_paths:
        for step in learning_path["steps"]:
            assert required_step_fields.issubset(step.keys())


def test_each_step_has_valid_values():
    # Step je lahko samo module ali learning_unit in mora imeti veljavne vrednosti.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        for step in learning_path["steps"]:
            assert step["type"] in ["module", "learning_unit"]

            assert isinstance(step["ref_id"], str)
            assert step["ref_id"].strip()

            assert isinstance(step["order"], int)
            assert step["order"] > 0

            assert step["parallel_group"] is None or isinstance(
                step["parallel_group"],
                str,
            )

            assert isinstance(step["is_required"], bool)

            assert isinstance(step["prerequisites"], list)


def test_step_prerequisites_are_valid_strings():
    # Prerequisites morajo biti seznam nepraznih stringov.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        for step in learning_path["steps"]:
            for prerequisite in step["prerequisites"]:
                assert isinstance(prerequisite, str)
                assert prerequisite.strip()


def test_step_ref_ids_are_unique_inside_learning_path():
    # Znotraj ene učne poti se isti step ref_id ne sme ponoviti.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        step_ref_ids = [
            step["ref_id"]
            for step in learning_path["steps"]
        ]

        assert len(step_ref_ids) == len(set(step_ref_ids))


def test_step_orders_are_positive_and_non_decreasing():
    # Order mora biti pozitiven in urejen naraščajoče ali vzporedno z enako vrednostjo.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        orders = [
            step["order"]
            for step in learning_path["steps"]
        ]

        assert all(order > 0 for order in orders)
        assert orders == sorted(orders)


def test_parallel_steps_with_same_order_have_same_parallel_group_when_needed():
    # Če ima več step-ov enak order, naj imajo parallel_group, da je vzporednost jasna.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        order_counts = {}

        for step in learning_path["steps"]:
            order = step["order"]
            order_counts[order] = order_counts.get(order, 0) + 1

        repeated_orders = {
            order
            for order, count in order_counts.items()
            if count > 1
        }

        for step in learning_path["steps"]:
            if step["order"] in repeated_orders:
                assert step["parallel_group"] is not None
                assert step["parallel_group"].strip()


def test_prerequisites_reference_existing_previous_steps():
    # Prerequisites morajo kazati na step-e, ki obstajajo prej v isti učni poti.
    learning_paths = load_learning_paths()

    for learning_path in learning_paths:
        steps_by_ref_id = {
            step["ref_id"]: step
            for step in learning_path["steps"]
        }

        for step in learning_path["steps"]:
            for prerequisite_id in step["prerequisites"]:
                assert prerequisite_id in steps_by_ref_id
                assert steps_by_ref_id[prerequisite_id]["order"] < step["order"]


def test_optional_steps_do_not_block_required_path_structure():
    # Optional step-i so dovoljeni, ampak morajo še vedno imeti veljaven order in prerequisites.
    learning_paths = load_learning_paths()

    optional_steps = [
        step
        for learning_path in learning_paths
        for step in learning_path["steps"]
        if step["is_required"] is False
    ]

    for step in optional_steps:
        assert step["order"] > 0
        assert isinstance(step["prerequisites"], list)


def test_learning_paths_include_expected_example_ids():
    # Preverimo, da so prisotne pričakovane začetne učne poti iz testnih podatkov.
    learning_paths = load_learning_paths()

    learning_path_ids = {
        learning_path["_id"]
        for learning_path in learning_paths
    }

    assert "up_001" in learning_path_ids
    assert "up_002" in learning_path_ids
    assert "up_003" in learning_path_ids