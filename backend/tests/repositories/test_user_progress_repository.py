from datetime import datetime

import pytest

from app.repositories.user_progress.user_progress_repository import (
    UserProgressRepository,
)


class FakeUpdateOneResult:
    # Minimalen fake rezultat za update_one.
    def __init__(self, matched_count):
        self.matched_count = matched_count


class FakeCollection:
    # Fake collection hrani users dokumente v spominu.
    # Progress je embedded znotraj user["progress"].
    def __init__(self, documents):
        self.documents = documents
        self.last_find_one_filter = None
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

    def update_one(self, query_filter, update_data):
        # Posnemamo MongoDB update_one s $set.
        self.last_update_filter = query_filter
        self.last_update_data = update_data

        user_id = query_filter.get("_id")
        set_data = update_data.get("$set", {})

        for document in self.documents:
            if document.get("_id") == user_id:
                document.update(set_data)
                return FakeUpdateOneResult(matched_count=1)

        return FakeUpdateOneResult(matched_count=0)


class FakeDatabase:
    # Fake database omogoča dostop do kolekcije prek database["users"].
    def __init__(self, collection):
        self.collection = collection
        self.last_collection_name = None

    def __getitem__(self, collection_name):
        self.last_collection_name = collection_name
        return self.collection


@pytest.fixture
def empty_progress():
    return {
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


@pytest.fixture
def user_documents(empty_progress):
    return [
        {
            "_id": "user_001",
            "auth_user_id": "supabase_test_001",
            "name": "Testni uporabnik",
            "email": "test@example.com",
            "progress": empty_progress,
            "created_at": datetime(2026, 5, 18),
            "updated_at": datetime(2026, 6, 1),
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
    return UserProgressRepository(fake_database)


def test_build_empty_progress_returns_expected_structure(repository):
    # Repository mora ustvariti prazno progress strukturo za users.progress.
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
    # Vsak progress mora imeti svoje sezname, da se podatki ne delijo med uporabniki.
    first_progress = repository._build_empty_progress()
    second_progress = repository._build_empty_progress()

    first_progress["saved"]["module_ids"].append("mod_001")

    assert first_progress["saved"]["module_ids"] == ["mod_001"]
    assert second_progress["saved"]["module_ids"] == []


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_existing_embedded_progress(
    repository,
    fake_database,
    fake_collection,
):
    # Če user dokument že ima progress dict, ga repository vrne kot progress response.
    result = await repository.get_progress_by_user_id("user_001")

    assert result == {
        "_id": "progress_user_001",
        "user_id": "user_001",
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

    assert fake_database.last_collection_name == "users"
    assert fake_collection.last_find_one_filter == {"_id": "user_001"}


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_none_when_user_missing(repository):
    # Če user dokument ne obstaja, repository vrne None.
    result = await repository.get_progress_by_user_id("missing_user")

    assert result is None


@pytest.mark.asyncio
async def test_get_progress_by_user_id_creates_empty_progress_when_progress_missing():
    # Če users dokument nima progress polja, repository doda prazno progress strukturo.
    collection = FakeCollection(
        [
            {
                "_id": "user_without_progress",
                "auth_user_id": "supabase_test_001",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = UserProgressRepository(database)

    result = await repository.get_progress_by_user_id("user_without_progress")

    assert result["_id"] == "progress_user_without_progress"
    assert result["user_id"] == "user_without_progress"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert collection.last_update_filter == {"_id": "user_without_progress"}
    assert "progress" in collection.last_update_data["$set"]
    assert "updated_at" in collection.last_update_data["$set"]
    assert isinstance(collection.last_update_data["$set"]["updated_at"], datetime)


@pytest.mark.asyncio
async def test_get_progress_by_user_id_creates_empty_progress_when_progress_is_not_dict():
    # Če progress obstaja, ampak ni dict, repository ga popravi na prazno strukturo.
    collection = FakeCollection(
        [
            {
                "_id": "user_invalid_progress",
                "auth_user_id": "supabase_test_001",
                "progress": "not-a-dict",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = UserProgressRepository(database)

    result = await repository.get_progress_by_user_id("user_invalid_progress")

    assert result["_id"] == "progress_user_invalid_progress"
    assert result["user_id"] == "user_invalid_progress"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert collection.last_update_filter == {"_id": "user_invalid_progress"}
    assert collection.last_update_data["$set"]["progress"] == {
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


@pytest.mark.asyncio
async def test_create_progress_sets_empty_progress_inside_existing_user(
    repository,
    fake_collection,
):
    # create_progress nastavi users.progress na prazno strukturo.
    result = await repository.create_progress("user_001")

    assert result == {
        "_id": "progress_user_001",
        "user_id": "user_001",
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

    assert fake_collection.last_update_filter == {"_id": "user_001"}
    assert fake_collection.last_update_data["$set"]["progress"] == {
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
    assert isinstance(fake_collection.last_update_data["$set"]["updated_at"], datetime)


@pytest.mark.asyncio
async def test_create_progress_returns_empty_progress_even_when_user_missing():
    # Če user dokument ne obstaja, repository ne ustvari users dokumenta,
    # ampak vrne prazen progress response za združljivost z API logiko.
    collection = FakeCollection([])
    database = FakeDatabase(collection)
    repository = UserProgressRepository(database)

    result = await repository.create_progress("missing_user")

    assert result == {
        "_id": "progress_missing_user",
        "user_id": "missing_user",
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

    assert collection.last_update_filter == {"_id": "missing_user"}
    assert collection.last_update_data["$set"]["progress"]["saved"]["module_ids"] == []


@pytest.mark.asyncio
async def test_get_or_create_progress_returns_existing_progress(
    repository,
    fake_collection,
):
    # Če progress že obstaja, get_or_create_progress ga samo vrne.
    result = await repository.get_or_create_progress("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["saved"]["module_ids"] == []

    # Ker progress že obstaja, ni treba klicati update_one.
    assert fake_collection.last_update_filter is None
    assert fake_collection.last_update_data is None


@pytest.mark.asyncio
async def test_get_or_create_progress_creates_progress_when_user_has_no_progress():
    # Če users dokument nima progress polja, get_progress_by_user_id ga ustvari.
    collection = FakeCollection(
        [
            {
                "_id": "user_without_progress",
                "auth_user_id": "supabase_test_001",
            }
        ]
    )
    database = FakeDatabase(collection)
    repository = UserProgressRepository(database)

    result = await repository.get_or_create_progress("user_without_progress")

    assert result["_id"] == "progress_user_without_progress"
    assert result["user_id"] == "user_without_progress"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert collection.last_update_filter == {"_id": "user_without_progress"}


@pytest.mark.asyncio
async def test_get_or_create_progress_creates_response_when_user_missing():
    # Če user ne obstaja, get_progress_by_user_id vrne None,
    # zato get_or_create_progress pokliče create_progress.
    collection = FakeCollection([])
    database = FakeDatabase(collection)
    repository = UserProgressRepository(database)

    result = await repository.get_or_create_progress("missing_user")

    assert result["_id"] == "progress_missing_user"
    assert result["user_id"] == "missing_user"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []

    assert collection.last_update_filter == {"_id": "missing_user"}