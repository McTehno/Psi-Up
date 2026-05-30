from app.repositories.user_progress.user_progress_repository import UserProgressRepository

from tests.repositories.fake_mongo import FakeCollection, FakeDatabase


def create_repository(existing_documents=None):
    # Pripravimo repository s fake user_progress kolekcijo.
    collection = FakeCollection(existing_documents or [])

    database = FakeDatabase(
        {
            "user_progress": collection,
        }
    )

    return UserProgressRepository(database), collection


async def test_get_progress_by_user_id_returns_existing_progress():
    # Repository mora najti progress zapis po lokalnem user_id.
    repository, collection = create_repository(
        [
            {
                "_id": "progress_user_001",
                "user_id": "user_001",
                "saved_learning_paths": [],
                "saved_modules": [],
                "saved_learning_units": [],
                "favorite_learning_paths": [],
                "favorite_modules": [],
                "favorite_learning_units": [],
                "completed_learning_paths": [],
                "completed_modules": [],
                "completed_learning_units": [],
                "current_positions": [],
            }
        ]
    )

    result = await repository.get_progress_by_user_id("user_001")

    assert result is not None
    assert result["user_id"] == "user_001"
    assert collection.last_find_one_filter == {"user_id": "user_001"}


async def test_get_progress_by_user_id_returns_none_when_missing():
    # Če progress zapis ne obstaja, repository vrne None.
    repository, _ = create_repository()

    result = await repository.get_progress_by_user_id("missing_user")

    assert result is None


async def test_create_progress_creates_initial_empty_progress_document():
    # Nov progress zapis mora imeti prazne sezname za saved/favorite/completed/current_positions.
    repository, collection = create_repository()

    result = await repository.create_progress("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["saved_learning_paths"] == []
    assert result["saved_modules"] == []
    assert result["saved_learning_units"] == []
    assert result["favorite_learning_paths"] == []
    assert result["favorite_modules"] == []
    assert result["favorite_learning_units"] == []
    assert result["completed_learning_paths"] == []
    assert result["completed_modules"] == []
    assert result["completed_learning_units"] == []
    assert result["current_positions"] == []

    assert collection.inserted_documents[0] == result


async def test_get_or_create_progress_returns_existing_progress():
    # Če progress že obstaja, ga repository vrne in ne ustvari novega.
    existing_progress = {
        "_id": "progress_user_001",
        "user_id": "user_001",
        "saved_learning_paths": ["up_001"],
        "saved_modules": [],
        "saved_learning_units": [],
        "favorite_learning_paths": [],
        "favorite_modules": [],
        "favorite_learning_units": [],
        "completed_learning_paths": [],
        "completed_modules": [],
        "completed_learning_units": [],
        "current_positions": [],
    }

    repository, collection = create_repository([existing_progress])

    result = await repository.get_or_create_progress("user_001")

    assert result == existing_progress
    assert collection.inserted_documents == []


async def test_get_or_create_progress_creates_progress_when_missing():
    # Če progress še ne obstaja, repository ustvari začetni zapis.
    repository, collection = create_repository()

    result = await repository.get_or_create_progress("user_001")

    assert result["user_id"] == "user_001"
    assert result["_id"] == "progress_user_001"
    assert len(collection.inserted_documents) == 1