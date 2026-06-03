import pytest

from app.repositories.user_progress.completed_content_repository import (
    CompletedContentRepository,
)


class FakeUpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class FakeCollection:
    """
    Fake MongoDB collection za completed content teste.
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

        for field_name, value in update.get("$addToSet", {}).items():
            current = self._get_nested_value(self.documents[user_id], field_name)

            if not isinstance(current, list):
                self._set_nested_value(self.documents[user_id], field_name, [])
                current = self._get_nested_value(self.documents[user_id], field_name)

            if value not in current:
                current.append(value)

        for field_name, value in update.get("$pull", {}).items():
            current = self._get_nested_value(self.documents[user_id], field_name)

            if isinstance(current, list) and value in current:
                current.remove(value)

        return FakeUpdateResult(matched_count=1)

    def _get_nested_value(self, document, field_name):
        current = document

        for part in field_name.split("."):
            if not isinstance(current, dict):
                return None

            current = current.get(part)

        return current

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
    return CompletedContentRepository(FakeDatabase(users_collection))


def test_get_completed_field_name_returns_correct_nested_field(repository):
    """
    Testira mapping content_type -> completed nested field.
    """

    assert (
        repository._get_completed_field_name("learning_path")
        == "progress.completed.learning_path_ids"
    )
    assert (
        repository._get_completed_field_name("module")
        == "progress.completed.module_ids"
    )
    assert (
        repository._get_completed_field_name("learning_unit")
        == "progress.completed.learning_unit_ids"
    )


def test_get_completed_field_name_returns_none_for_invalid_type(repository):
    """
    Testira neveljaven content_type.
    """

    assert repository._get_completed_field_name("invalid") is None


@pytest.mark.asyncio
async def test_complete_content_adds_learning_unit(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira dodajanje dokončane učne enote.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": empty_progress,
    }

    result = await repository.complete_content(
        user_id="user_001",
        content_id="ue_001",
        content_type="learning_unit",
    )

    assert result["user_id"] == "user_001"
    assert result["completed"]["learning_unit_ids"] == ["ue_001"]


@pytest.mark.asyncio
async def test_complete_content_does_not_duplicate_existing_id(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira $addToSet logiko brez podvajanja.
    """

    progress = {
        **empty_progress,
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": ["ue_001"],
        },
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.complete_content(
        user_id="user_001",
        content_id="ue_001",
        content_type="learning_unit",
    )

    assert result["completed"]["learning_unit_ids"] == ["ue_001"]


@pytest.mark.asyncio
async def test_complete_content_returns_none_for_invalid_type(repository):
    """
    Testira, da neveljaven content_type ne spremeni progressa.
    """

    result = await repository.complete_content(
        user_id="user_001",
        content_id="x_001",
        content_type="invalid",
    )

    assert result is None


@pytest.mark.asyncio
async def test_complete_content_returns_none_when_user_missing(repository):
    """
    Testira, da manjkajoč user vrne None.
    """

    result = await repository.complete_content(
        user_id="missing_user",
        content_id="ue_001",
        content_type="learning_unit",
    )

    assert result is None


@pytest.mark.asyncio
async def test_remove_completed_content_removes_module(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira odstranjevanje dokončanega modula.
    """

    progress = {
        **empty_progress,
        "completed": {
            "learning_path_ids": [],
            "module_ids": ["mod_001"],
            "learning_unit_ids": [],
        },
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.remove_completed_content(
        user_id="user_001",
        content_id="mod_001",
        content_type="module",
    )

    assert result["completed"]["module_ids"] == []


@pytest.mark.asyncio
async def test_remove_completed_content_returns_none_for_invalid_type(repository):
    """
    Testira neveljaven content_type pri odstranjevanju.
    """

    result = await repository.remove_completed_content(
        user_id="user_001",
        content_id="x_001",
        content_type="invalid",
    )

    assert result is None