from conftest import get_document_id, load_json_file


def test_users_json_is_not_empty():
    # Preverimo, da imamo začetne testne uporabnike.
    users = load_json_file("users.json")

    assert isinstance(users, list)
    assert len(users) > 0


def test_users_have_unique_ids():
    # Vsak uporabnik mora imeti unikaten lokalni _id.
    users = load_json_file("users.json")

    ids = [get_document_id(user) for user in users]

    assert len(ids) == len(set(ids))


def test_users_have_unique_auth_user_ids():
    # auth_user_id mora biti unikaten, ker povezuje zunanji auth sistem z lokalnim profilom.
    users = load_json_file("users.json")

    auth_user_ids = [user["auth_user_id"] for user in users]

    assert len(auth_user_ids) == len(set(auth_user_ids))


def test_users_have_required_fields():
    # Preverimo osnovna obvezna polja uporabnika.
    users = load_json_file("users.json")

    required_fields = {
        "_id",
        "auth_user_id",
        "name",
        "email",
        "created_at",
    }

    for user in users:
        missing_fields = required_fields - user.keys()

        assert missing_fields == set(), (
            f"Uporabnik {user.get('_id')} nima polj: {missing_fields}"
        )


def test_user_email_contains_at_sign():
    # Osnovno preverimo, da email izgleda kot email naslov.
    users = load_json_file("users.json")

    for user in users:
        assert "@" in user["email"], (
            f"Uporabnik {user['_id']} nima veljavnega email naslova."
        )