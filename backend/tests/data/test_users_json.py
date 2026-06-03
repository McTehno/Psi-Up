import json
from datetime import datetime
from pathlib import Path


USERS_JSON_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "nova_verzija_data"
    / "users.json"
)


def load_users():
    # Preberemo users.json iz nove data mape.
    with USERS_JSON_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def test_users_json_file_exists():
    # Preverimo, da users.json obstaja na pričakovani lokaciji.
    assert USERS_JSON_PATH.exists()


def test_users_json_contains_list():
    # Glavna struktura users.json mora biti seznam uporabnikov.
    users = load_users()

    assert isinstance(users, list)
    assert len(users) > 0


def test_each_user_has_required_fields():
    # Vsak uporabnik mora imeti osnovna obvezna polja.
    users = load_users()

    required_fields = {
        "_id",
        "auth_user_id",
        "name",
        "email",
        "created_at",
        "updated_at",
        "progress",
    }

    for user in users:
        assert required_fields.issubset(user.keys())


def test_each_user_has_valid_basic_values():
    # Osnovna polja uporabnika morajo imeti pravilne tipe in neprazne vrednosti.
    users = load_users()

    for user in users:
        assert isinstance(user["_id"], str)
        assert user["_id"].strip()

        assert isinstance(user["auth_user_id"], str)
        assert user["auth_user_id"].strip()

        assert isinstance(user["name"], str)
        assert user["name"].strip()

        assert isinstance(user["email"], str)
        assert user["email"].strip()
        assert "@" in user["email"]

        assert isinstance(user["created_at"], str)
        assert user["created_at"].strip()

        assert isinstance(user["updated_at"], str)
        assert user["updated_at"].strip()

        assert isinstance(user["progress"], dict)


def test_user_ids_are_unique():
    # Vsak uporabnik mora imeti unikaten _id.
    users = load_users()

    user_ids = [
        user["_id"]
        for user in users
    ]

    assert len(user_ids) == len(set(user_ids))


def test_auth_user_ids_are_unique():
    # Vsak Supabase auth_user_id mora biti unikaten.
    users = load_users()

    auth_user_ids = [
        user["auth_user_id"]
        for user in users
    ]

    assert len(auth_user_ids) == len(set(auth_user_ids))


def test_user_emails_are_unique():
    # Email uporabnika mora biti unikaten.
    users = load_users()

    emails = [
        user["email"]
        for user in users
    ]

    assert len(emails) == len(set(emails))


def test_user_dates_are_valid_iso_dates():
    # created_at in updated_at morata biti veljavna ISO datuma.
    users = load_users()

    for user in users:
        created_at = user["created_at"].replace("Z", "+00:00")
        updated_at = user["updated_at"].replace("Z", "+00:00")

        parsed_created_at = datetime.fromisoformat(created_at)
        parsed_updated_at = datetime.fromisoformat(updated_at)

        assert parsed_created_at <= parsed_updated_at


def test_user_progress_has_required_sections():
    # progress mora vsebovati vse glavne sekcije nove strukture.
    users = load_users()

    required_progress_sections = {
        "saved",
        "favorites",
        "completed",
        "current_positions",
        "questionnaire_answers",
    }

    for user in users:
        progress = user["progress"]

        assert required_progress_sections.issubset(progress.keys())


def test_user_progress_saved_has_required_lists():
    # progress.saved mora imeti sezname za učne poti, module in učne enote.
    users = load_users()

    required_saved_fields = {
        "learning_path_ids",
        "module_ids",
        "learning_unit_ids",
    }

    for user in users:
        saved = user["progress"]["saved"]

        assert isinstance(saved, dict)
        assert required_saved_fields.issubset(saved.keys())

        assert isinstance(saved["learning_path_ids"], list)
        assert isinstance(saved["module_ids"], list)
        assert isinstance(saved["learning_unit_ids"], list)


def test_user_progress_favorites_has_required_lists():
    # progress.favorites mora imeti sezname za učne poti, module in učne enote.
    users = load_users()

    required_favorites_fields = {
        "learning_path_ids",
        "module_ids",
        "learning_unit_ids",
    }

    for user in users:
        favorites = user["progress"]["favorites"]

        assert isinstance(favorites, dict)
        assert required_favorites_fields.issubset(favorites.keys())

        assert isinstance(favorites["learning_path_ids"], list)
        assert isinstance(favorites["module_ids"], list)
        assert isinstance(favorites["learning_unit_ids"], list)


def test_user_progress_completed_has_required_lists():
    # progress.completed mora imeti sezname za učne poti, module in učne enote.
    users = load_users()

    required_completed_fields = {
        "learning_path_ids",
        "module_ids",
        "learning_unit_ids",
    }

    for user in users:
        completed = user["progress"]["completed"]

        assert isinstance(completed, dict)
        assert required_completed_fields.issubset(completed.keys())

        assert isinstance(completed["learning_path_ids"], list)
        assert isinstance(completed["module_ids"], list)
        assert isinstance(completed["learning_unit_ids"], list)


def test_user_progress_id_lists_contain_only_valid_strings():
    # Vsi ID seznami v saved, favorites in completed morajo vsebovati samo neprazne stringe.
    users = load_users()

    progress_sections = [
        "saved",
        "favorites",
        "completed",
    ]

    id_fields = [
        "learning_path_ids",
        "module_ids",
        "learning_unit_ids",
    ]

    for user in users:
        progress = user["progress"]

        for section_name in progress_sections:
            section = progress[section_name]

            for field_name in id_fields:
                for item_id in section[field_name]:
                    assert isinstance(item_id, str)
                    assert item_id.strip()


def test_user_progress_current_positions_is_list():
    # current_positions je seznam trenutnih pozicij uporabnika.
    users = load_users()

    for user in users:
        current_positions = user["progress"]["current_positions"]

        assert isinstance(current_positions, list)


def test_user_progress_questionnaire_answers_is_list():
    # questionnaire_answers je seznam odgovorov uporabnika na vprašalnike.
    users = load_users()

    for user in users:
        questionnaire_answers = user["progress"]["questionnaire_answers"]

        assert isinstance(questionnaire_answers, list)


def test_current_positions_have_valid_structure_when_present():
    # Če current_positions vsebuje elemente, morajo imeti stabilno strukturo.
    users = load_users()

    for user in users:
        for position in user["progress"]["current_positions"]:
            assert isinstance(position, dict)

            assert "target_type" in position
            assert "target_id" in position
            assert "current_item_id" in position
            assert "updated_at" in position

            assert isinstance(position["target_type"], str)
            assert position["target_type"].strip()

            assert isinstance(position["target_id"], str)
            assert position["target_id"].strip()

            assert isinstance(position["current_item_id"], str)
            assert position["current_item_id"].strip()

            assert isinstance(position["updated_at"], str)
            assert position["updated_at"].strip()


def test_questionnaire_answers_have_valid_structure_when_present():
    # Če questionnaire_answers vsebuje elemente, morajo imeti stabilno strukturo.
    users = load_users()

    for user in users:
        for answer in user["progress"]["questionnaire_answers"]:
            assert isinstance(answer, dict)

            assert "question_id" in answer
            assert "answer" in answer
            assert "target_type" in answer
            assert "target_id" in answer
            assert "answered_at" in answer

            assert isinstance(answer["question_id"], str)
            assert answer["question_id"].strip()

            assert isinstance(answer["answer"], str)
            assert answer["answer"].strip()

            assert isinstance(answer["target_type"], str)
            assert answer["target_type"].strip()

            assert isinstance(answer["target_id"], str)
            assert answer["target_id"].strip()

            assert isinstance(answer["answered_at"], str)
            assert answer["answered_at"].strip()


def test_users_include_expected_demo_user():
    # Preverimo, da je prisoten osnovni testni uporabnik iz seed podatkov.
    users = load_users()

    user_ids = {
        user["_id"]
        for user in users
    }

    assert "user_001" in user_ids