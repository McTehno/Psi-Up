import pytest

from app.repositories.user_progress.questionnaire_answers_repository import (
    QuestionnaireAnswersRepository,
)


class FakeUpdateResult:
    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class FakeCollection:
    """
    Fake MongoDB collection za questionnaire answers teste.
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
    return QuestionnaireAnswersRepository(FakeDatabase(users_collection))


@pytest.mark.asyncio
async def test_get_questionnaire_answers_returns_matching_entry(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira branje odgovorov za target_type + target_id.
    """

    progress = {
        **empty_progress,
        "questionnaire_answers": [
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "q_001",
                        "answer": True,
                    }
                ],
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.get_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
    )

    assert result["target_type"] == "module"
    assert result["target_id"] == "mod_001"
    assert result["answers"][0]["question_id"] == "q_001"


@pytest.mark.asyncio
async def test_get_questionnaire_answers_returns_none_when_entry_missing(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira primer, ko za target še ni odgovorov.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": empty_progress,
    }

    result = await repository.get_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
    )

    assert result is None


@pytest.mark.asyncio
async def test_get_questionnaire_answers_returns_none_when_user_missing(repository):
    """
    Testira manjkajočega uporabnika.
    """

    result = await repository.get_questionnaire_answers(
        user_id="missing_user",
        target_type="module",
        target_id="mod_001",
    )

    assert result is None


@pytest.mark.asyncio
async def test_save_questionnaire_answers_adds_new_entry(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira shranjevanje novega questionnaire answer zapisa.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": empty_progress,
    }

    result = await repository.save_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "answer": True,
            }
        ],
    )

    entries = result["questionnaire_answers"]

    assert len(entries) == 1
    assert entries[0]["target_type"] == "module"
    assert entries[0]["target_id"] == "mod_001"
    assert entries[0]["answers"][0]["question_id"] == "q_001"
    assert entries[0]["answers"][0]["answer"] is True
    assert "last_submitted_at" in entries[0]


@pytest.mark.asyncio
async def test_save_questionnaire_answers_overrides_same_target(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira override za isti target_type + target_id.

    Ne sme dodati novega zapisa, ampak zamenja obstoječega.
    """

    progress = {
        **empty_progress,
        "questionnaire_answers": [
            {
                "target_type": "module",
                "target_id": "mod_001",
                "answers": [
                    {
                        "question_id": "old_question",
                        "answer": False,
                    }
                ],
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.save_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
        answers=[
            {
                "question_id": "new_question",
                "answer": True,
            }
        ],
    )

    entries = result["questionnaire_answers"]

    assert len(entries) == 1
    assert entries[0]["target_type"] == "module"
    assert entries[0]["target_id"] == "mod_001"
    assert entries[0]["answers"][0]["question_id"] == "new_question"
    assert entries[0]["answers"][0]["answer"] is True


@pytest.mark.asyncio
async def test_save_questionnaire_answers_keeps_other_targets(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira, da override enega targeta ne izbriše drugih targetov.
    """

    progress = {
        **empty_progress,
        "questionnaire_answers": [
            {
                "target_type": "learning_unit",
                "target_id": "ue_001",
                "answers": [
                    {
                        "question_id": "q_ue_001",
                        "answer": True,
                    }
                ],
            }
        ],
    }

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": progress,
    }

    result = await repository.save_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_mod_001",
                "answer": True,
            }
        ],
    )

    entries = result["questionnaire_answers"]

    assert len(entries) == 2
    assert entries[0]["target_type"] == "learning_unit"
    assert entries[1]["target_type"] == "module"


@pytest.mark.asyncio
async def test_save_questionnaire_answers_creates_progress_when_missing(
    repository,
    users_collection,
):
    """
    Testira, da se progress ustvari, če manjka.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
    }

    result = await repository.save_questionnaire_answers(
        user_id="user_001",
        target_type="module",
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "answer": True,
            }
        ],
    )

    assert result["user_id"] == "user_001"
    assert len(result["questionnaire_answers"]) == 1
    assert result["questionnaire_answers"][0]["target_id"] == "mod_001"


@pytest.mark.asyncio
async def test_save_questionnaire_answers_returns_none_when_user_missing(repository):
    """
    Testira manjkajočega uporabnika pri save.
    """

    result = await repository.save_questionnaire_answers(
        user_id="missing_user",
        target_type="module",
        target_id="mod_001",
        answers=[],
    )

    assert result is None