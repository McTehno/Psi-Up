from datetime import datetime

import pytest

from app.repositories.user_repository import UserRepository


class FakeInsertOneResult:
    # Minimalen fake rezultat za insert_one.
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeUpdateOneResult:
    # Minimalen fake rezultat za update_one.
    def __init__(self, modified_count):
        self.modified_count = modified_count


class FakeCollection:
    # Fake collection hrani uporabnike v spominu in posnema MongoDB metode.
    def __init__(self, documents):
        self.documents = documents
        self.last_find_one_filter = None
        self.last_inserted_document = None
        self.last_update_filter = None
        self.last_update_data = None

    def find_one(self, query_filter):
        # Shranimo zadnji filter, da preverimo pravilnost query-ja.
        self.last_find_one_filter = query_filter

        for document in self.documents:
            matches = True

            for key, value in query_filter.items():
                if document.get(key) != value:
                    matches = False
                    break

            if matches:
                return document

        return None

    def insert_one(self, document):
        # Posnemamo insert v MongoDB.
        self.last_inserted_document = document
        self.documents.append(document)

        return FakeInsertOneResult(document["_id"])

    def update_one(self, query_filter, update_data):
        # Posnemamo MongoDB update_one s $set.
        self.last_update_filter = query_filter
        self.last_update_data = update_data

        user_id = query_filter.get("_id")
        set_data = update_data.get("$set", {})

        for document in self.documents:
            if document.get("_id") == user_id:
                document.update(set_data)
                return FakeUpdateOneResult(modified_count=1)

        return FakeUpdateOneResult(modified_count=0)


class FakeDatabase:
    # Fake database omogoča dostop do kolekcije prek database["users"].
    def __init__(self, collection):
        self.collection = collection
        self.last_collection_name = None

    def __getitem__(self, collection_name):
        self.last_collection_name = collection_name
        return self.collection


@pytest.fixture
def user_documents():
    return [
        {
            "_id": "user_001",
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "created_at": datetime(2026, 5, 18),
            "updated_at": datetime(2026, 6, 1),
            "progress": {
                "saved": {
                    "learning_path_ids": [],
                    "module_ids": [],
                    "learning_unit_ids": [],
                },
                "favorites": {
                    "learning_path_ids": [],
                    "module_ids": [],
                    "learning_unit_ids": [],
                },
                "completed": {
                    "learning_path_ids": [],
                    "module_ids": [],
                    "learning_unit_ids": [],
                },
                "current_positions": [],
                "questionnaire_answers": [],
            },
        }
    ]


@pytest.fixture
def fake_collection(user_documents):
    return FakeCollection(user_documents)


@pytest.fixture
def fake_database(fake_collection):
    return FakeDatabase(fake_collection)


@pytest.fixture
def repository(fake_database):
    return UserRepository(fake_database)


def test_build_empty_progress_returns_expected_structure(repository):
    # Za novega uporabnika mora repository ustvariti prazno embedded progress strukturo.
    result = repository._build_empty_progress()

    assert result == {
        "saved": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "favorites": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "current_positions": [],
        "questionnaire_answers": [],
    }


def test_build_empty_progress_returns_independent_lists(repository):
    # Vsak nov progress mora imeti svoje sezname, da se podatki ne delijo med uporabniki.
    first_progress = repository._build_empty_progress()
    second_progress = repository._build_empty_progress()

    first_progress["saved"]["module_ids"].append("mod_001")

    assert first_progress["saved"]["module_ids"] == ["mod_001"]
    assert second_progress["saved"]["module_ids"] == []


@pytest.mark.asyncio
async def test_get_user_by_id_returns_user_when_found(
    repository,
    fake_database,
    fake_collection,
):
    # Repository poišče uporabnika po lokalnem _id.
    result = await repository.get_user_by_id("user_001")

    assert result is not None
    assert result["_id"] == "user_001"
    assert result["auth_user_id"] == "supabase_test_001"
    assert fake_database.last_collection_name == "users"
    assert fake_collection.last_find_one_filter == {"_id": "user_001"}


@pytest.mark.asyncio
async def test_get_user_by_id_returns_none_when_not_found(repository):
    # Če uporabnik ne obstaja, repository vrne None.
    result = await repository.get_user_by_id("missing_user")

    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_auth_user_id_returns_user_when_found(
    repository,
    fake_database,
    fake_collection,
):
    # Repository poišče uporabnika po zunanjem auth_user_id.
    result = await repository.get_user_by_auth_user_id("supabase_test_001")

    assert result is not None
    assert result["_id"] == "user_001"
    assert fake_database.last_collection_name == "users"
    assert fake_collection.last_find_one_filter == {
        "auth_user_id": "supabase_test_001"
    }


@pytest.mark.asyncio
async def test_get_user_by_auth_user_id_returns_none_when_not_found(repository):
    # Če auth_user_id ne obstaja, repository vrne None.
    result = await repository.get_user_by_auth_user_id("missing_auth_user")

    assert result is None


@pytest.mark.asyncio
async def test_create_user_profile_creates_user_with_empty_progress(
    repository,
    fake_collection,
):
    # Repository ustvari lokalni profil uporabnika z začetnim progressom.
    result = await repository.create_user_profile(
        {
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_002",
            "name": "Nov uporabnik",
            "email": "new@example.com",
        }
    )

    assert result["_id"] == "user_supabase_test_002"
    assert result["auth_provider"] == "supabase"
    assert result["auth_user_id"] == "supabase_test_002"
    assert result["name"] == "Nov uporabnik"
    assert result["email"] == "new@example.com"

    assert isinstance(result["created_at"], datetime)
    assert isinstance(result["updated_at"], datetime)

    assert result["progress"] == {
        "saved": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "favorites": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "current_positions": [],
        "questionnaire_answers": [],
    }

    assert fake_collection.last_inserted_document == result


@pytest.mark.asyncio
async def test_create_user_profile_sanitizes_auth_user_id(repository):
    # Znaki, ki niso praktični za lokalni _id, se zamenjajo z _.
    result = await repository.create_user_profile(
        {
            "auth_provider": "supabase",
            "auth_user_id": "provider|abc:123/test",
            "name": "Nov uporabnik",
            "email": "new@example.com",
        }
    )

    assert result["_id"] == "user_provider_abc_123_test"


@pytest.mark.asyncio
async def test_create_user_profile_allows_optional_profile_fields(repository):
    # auth_provider, name in email so lahko None.
    result = await repository.create_user_profile(
        {
            "auth_user_id": "supabase_test_003",
        }
    )

    assert result["_id"] == "user_supabase_test_003"
    assert result["auth_provider"] is None
    assert result["name"] is None
    assert result["email"] is None


@pytest.mark.asyncio
async def test_update_user_profile_updates_existing_user(
    repository,
    fake_collection,
):
    # Repository posodobi profil uporabnika in vrne posodobljen dokument.
    result = await repository.update_user_profile(
        user_id="user_001",
        update_data={
            "name": "Posodobljeno ime",
            "email": "updated@example.com",
        },
    )

    assert result is not None
    assert result["_id"] == "user_001"
    assert result["name"] == "Posodobljeno ime"
    assert result["email"] == "updated@example.com"
    assert isinstance(result["updated_at"], datetime)

    assert fake_collection.last_update_filter == {"_id": "user_001"}
    assert "$set" in fake_collection.last_update_data
    assert fake_collection.last_update_data["$set"]["name"] == "Posodobljeno ime"
    assert fake_collection.last_update_data["$set"]["email"] == "updated@example.com"
    assert isinstance(fake_collection.last_update_data["$set"]["updated_at"], datetime)


@pytest.mark.asyncio
async def test_update_user_profile_returns_none_when_user_missing(repository):
    # Če uporabnik ne obstaja, update nima najdenega dokumenta in get_user_by_id vrne None.
    result = await repository.update_user_profile(
        user_id="missing_user",
        update_data={
            "name": "Neobstoječ uporabnik",
        },
    )

    assert result is None


@pytest.mark.asyncio
async def test_update_user_profile_mutates_update_data_with_updated_at(repository):
    # Trenutna implementacija doda updated_at neposredno v update_data.
    update_data = {
        "name": "Novo ime",
    }

    await repository.update_user_profile(
        user_id="user_001",
        update_data=update_data,
    )

    assert "updated_at" in update_data
    assert isinstance(update_data["updated_at"], datetime)


@pytest.mark.asyncio
async def test_get_or_create_user_profile_returns_existing_user(repository):
    # Če uporabnik že obstaja, repository ne ustvari novega profila.
    result = await repository.get_or_create_user_profile(
        {
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
        }
    )

    assert result["_id"] == "user_001"
    assert result["auth_user_id"] == "supabase_test_001"


@pytest.mark.asyncio
async def test_get_or_create_user_profile_creates_user_when_missing(
    repository,
    fake_collection,
):
    # Če uporabnik še ne obstaja, repository ustvari nov profil.
    result = await repository.get_or_create_user_profile(
        {
            "auth_provider": "supabase",
            "auth_user_id": "supabase_test_999",
            "name": "Nov uporabnik",
            "email": "new@example.com",
        }
    )

    assert result["_id"] == "user_supabase_test_999"
    assert result["auth_user_id"] == "supabase_test_999"
    assert fake_collection.last_inserted_document == result