import pytest

from app.repositories.user_progress.current_position_repository import (
    CurrentPositionRepository,
)


class FakeUpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class FakeCollection:
    """
    Fake MongoDB collection za current position teste.
    """

    def __init__(self, documents=None):
        self.documents = documents or {}

    def find_one(self, query):
        return self.documents.get(query.get("_id"))

    def update_one(self, query, update):
        user_id = query.get("_id")

        if user_id not in self.documents:
            return FakeUpdateResult(matched_count=0)

        for field_name, value in update.get("$set", {}).items():
            self._set_nested_value(self.documents[user_id], field_name, value)

        return FakeUpdateResult(matched_count=1)

    def _set_nested_value(self, document, field_name, value):
        current = document
        parts = field_name.split(".")

        for part in parts[:-1]:
            if part not in current or not isinstance(current[part], dict):
                current[part] = {}

            current = current[part]

        current[parts[-1]] = value


class FakeDatabase:
    def __init__(self, users_collection):
        self.users_collection = users_collection

    def __getitem__(self, collection_name):
        if collection_name == "users":
            return self.users_collection

        raise KeyError(collection_name)


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
def users_collection():
    return FakeCollection()


@pytest.fixture
def repository(users_collection):
    return CurrentPositionRepository(FakeDatabase(users_collection))


@pytest.mark.asyncio
async def test_get_current_positions_returns_positions(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira branje obstoječih current positions.
    """

    progress = {
        **empty_progress,
        "current_positions": [
            {
                "learning_path_id": "up_001",
                "current_module_id": "mod_001",
                "current_learning_unit_id": "ue_001",
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.get_current_positions("user_001")

    assert len(result) == 1
    assert result[0]["learning_path_id"] == "up_001"


@pytest.mark.asyncio
async def test_get_current_positions_returns_empty_list_when_user_missing(repository):
    """
    Testira manjkajočega uporabnika.
    """

    result = await repository.get_current_positions("missing_user")

    assert result == []


@pytest.mark.asyncio
async def test_get_current_positions_creates_progress_when_missing(
    repository,
    users_collection,
):
    """
    Testira, da se progress ustvari, če manjka.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
    }

    result = await repository.get_current_positions("user_001")

    assert result == []
    assert "progress" in users_collection.documents["user_001"]


@pytest.mark.asyncio
async def test_update_current_position_adds_new_position(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira dodajanje nove current position.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": empty_progress,
    }

    result = await repository.update_current_position(
        user_id="user_001",
        learning_path_id="up_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    positions = result["current_positions"]

    assert len(positions) == 1
    assert positions[0]["learning_path_id"] == "up_001"
    assert positions[0]["current_module_id"] == "mod_001"
    assert positions[0]["current_learning_unit_id"] == "ue_001"
    assert "updated_at" in positions[0]


@pytest.mark.asyncio
async def test_update_current_position_replaces_existing_position(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira posodobitev že obstoječe pozicije za isto učno pot.
    """

    progress = {
        **empty_progress,
        "current_positions": [
            {
                "learning_path_id": "up_001",
                "current_module_id": "old_mod",
                "current_learning_unit_id": "old_ue",
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.update_current_position(
        user_id="user_001",
        learning_path_id="up_001",
        current_module_id="mod_002",
        current_learning_unit_id="ue_002",
    )

    positions = result["current_positions"]

    assert len(positions) == 1
    assert positions[0]["learning_path_id"] == "up_001"
    assert positions[0]["current_module_id"] == "mod_002"
    assert positions[0]["current_learning_unit_id"] == "ue_002"


@pytest.mark.asyncio
async def test_update_current_position_keeps_other_learning_paths(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira, da posodobitev ene učne poti ne odstrani druge.
    """

    progress = {
        **empty_progress,
        "current_positions": [
            {
                "learning_path_id": "up_001",
                "current_module_id": "mod_001",
                "current_learning_unit_id": "ue_001",
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.update_current_position(
        user_id="user_001",
        learning_path_id="up_002",
        current_module_id="mod_002",
        current_learning_unit_id="ue_002",
    )

    positions = result["current_positions"]

    assert len(positions) == 2
    assert positions[0]["learning_path_id"] == "up_001"
    assert positions[1]["learning_path_id"] == "up_002"


@pytest.mark.asyncio
async def test_update_current_position_returns_none_without_learning_path_id(
    repository,
):
    """
    Testira, da learning_path_id obvezen.
    """

    result = await repository.update_current_position(
        user_id="user_001",
        learning_path_id=None,
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    assert result is None


@pytest.mark.asyncio
async def test_update_current_position_returns_none_when_user_missing(repository):
    """
    Testira manjkajočega uporabnika pri update.
    """

    result = await repository.update_current_position(
        user_id="missing_user",
        learning_path_id="up_001",
        current_module_id="mod_001",
        current_learning_unit_id="ue_001",
    )

    assert result is None