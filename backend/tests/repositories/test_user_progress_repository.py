import pytest

from app.repositories.user_progress.user_progress_repository import (
    UserProgressRepository,
)


class FakeUpdateResult:
    """
    Fake rezultat za MongoDB update_one.
    """

    def __init__(self, matched_count: int):
        self.matched_count = matched_count


class FakeCollection:
    """
    Fake MongoDB collection za unit teste.

    Namen:
    - ne uporabljamo prave MongoDB baze,
    - hranimo users dokumente v navadnem dict-u,
    - podpiramo samo metode, ki jih UserProgressRepository uporablja.
    """

    def __init__(self, documents=None):
        self.documents = documents or {}
        self.last_update_filter = None
        self.last_update_query = None

    def find_one(self, query):
        """
        Vrne users dokument po _id.
        """

        user_id = query.get("_id")
        return self.documents.get(user_id)

    def update_one(self, query, update):
        """
        Posodobi users dokument.

        Podpira samo $set, ker ga ta repository uporablja.
        """

        self.last_update_filter = query
        self.last_update_query = update

        user_id = query.get("_id")

        if user_id not in self.documents:
            return FakeUpdateResult(matched_count=0)

        set_values = update.get("$set", {})

        for field_name, value in set_values.items():
            self._set_nested_value(
                document=self.documents[user_id],
                field_name=field_name,
                value=value,
            )

        return FakeUpdateResult(matched_count=1)

    def _set_nested_value(self, document, field_name, value):
        """
        Nastavi vrednost tudi za nested polja, npr. progress.completed.module_ids.
        """

        parts = field_name.split(".")
        current = document

        for part in parts[:-1]:
            if part not in current or not isinstance(current[part], dict):
                current[part] = {}

            current = current[part]

        current[parts[-1]] = value


class FakeDatabase:
    """
    Fake database objekt.

    Omogoča uporabo database["users"], tako kot MongoDB.
    """

    def __init__(self, users_collection):
        self.users_collection = users_collection

    def __getitem__(self, collection_name):
        if collection_name == "users":
            return self.users_collection

        raise KeyError(collection_name)


@pytest.fixture
def empty_progress():
    """
    Osnovna prazna progress struktura.
    """

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
    """
    Fake users collection.
    """

    return FakeCollection()


@pytest.fixture
def repository(users_collection):
    """
    UserProgressRepository z fake database.
    """

    database = FakeDatabase(users_collection)

    return UserProgressRepository(database)


def test_build_empty_progress_returns_stable_structure(repository):
    """
    Testira, da prazna progress struktura vsebuje vsa potrebna polja.
    """

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


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_existing_progress(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira branje obstoječega progressa iz users dokumenta.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "email": "test@example.com",
        "progress": {
            **empty_progress,
            "completed": {
                "learning_path_ids": ["up_001"],
                "module_ids": ["mod_001"],
                "learning_unit_ids": ["ue_001"],
            },
        },
    }

    result = await repository.get_progress_by_user_id("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["completed"]["learning_path_ids"] == ["up_001"]
    assert result["completed"]["module_ids"] == ["mod_001"]
    assert result["completed"]["learning_unit_ids"] == ["ue_001"]


@pytest.mark.asyncio
async def test_get_progress_by_user_id_returns_none_when_user_missing(repository):
    """
    Testira, da repository vrne None, če users dokument ne obstaja.
    """

    result = await repository.get_progress_by_user_id("missing_user")

    assert result is None


@pytest.mark.asyncio
async def test_get_progress_by_user_id_creates_empty_progress_when_missing(
    repository,
    users_collection,
):
    """
    Testira, da se progress doda uporabniku, če progress polje manjka.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "email": "test@example.com",
    }

    result = await repository.get_progress_by_user_id("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"

    assert result["saved"] == {
        "learning_path_ids": [],
        "module_ids": [],
        "learning_unit_ids": [],
    }
    assert result["favorites"] == {
        "learning_path_ids": [],
        "module_ids": [],
        "learning_unit_ids": [],
    }
    assert result["completed"] == {
        "learning_path_ids": [],
        "module_ids": [],
        "learning_unit_ids": [],
    }
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert "progress" in users_collection.documents["user_001"]
    assert users_collection.last_update_filter == {"_id": "user_001"}
    assert "progress" in users_collection.last_update_query["$set"]
    assert "updated_at" in users_collection.last_update_query["$set"]


@pytest.mark.asyncio
async def test_get_progress_by_user_id_replaces_invalid_progress(
    repository,
    users_collection,
):
    """
    Testira, da neveljaven progress ni uporabljen in se zamenja s prazno strukturo.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": "invalid-progress",
    }

    result = await repository.get_progress_by_user_id("user_001")

    assert result["user_id"] == "user_001"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert isinstance(users_collection.documents["user_001"]["progress"], dict)


@pytest.mark.asyncio
async def test_create_progress_sets_empty_progress_for_existing_user(
    repository,
    users_collection,
):
    """
    Testira ročno ustvarjanje praznega progressa za obstoječega uporabnika.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "email": "test@example.com",
    }

    result = await repository.create_progress("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert "progress" in users_collection.documents["user_001"]
    assert "updated_at" in users_collection.documents["user_001"]


@pytest.mark.asyncio
async def test_create_progress_returns_empty_response_when_user_missing(repository):
    """
    Testira, da create_progress vrne prazen response tudi če uporabnik ne obstaja.

    Repository pri tem ne ustvari novega users dokumenta.
    """

    result = await repository.create_progress("missing_user")

    assert result["_id"] == "progress_missing_user"
    assert result["user_id"] == "missing_user"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []


@pytest.mark.asyncio
async def test_get_or_create_progress_returns_existing_progress(
    repository,
    users_collection,
    empty_progress,
):
    """
    Testira, da get_or_create_progress vrne obstoječ progress.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
        "progress": {
            **empty_progress,
            "saved": {
                "learning_path_ids": ["up_001"],
                "module_ids": [],
                "learning_unit_ids": [],
            },
        },
    }

    result = await repository.get_or_create_progress("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["saved"]["learning_path_ids"] == ["up_001"]


@pytest.mark.asyncio
async def test_get_or_create_progress_creates_progress_when_missing(
    repository,
    users_collection,
):
    """
    Testira, da get_or_create_progress ustvari progress, če ga uporabnik še nima.
    """

    users_collection.documents["user_001"] = {
        "_id": "user_001",
    }

    result = await repository.get_or_create_progress("user_001")

    assert result["_id"] == "progress_user_001"
    assert result["user_id"] == "user_001"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []

    assert "progress" in users_collection.documents["user_001"]


@pytest.mark.asyncio
async def test_get_or_create_progress_returns_empty_response_when_user_missing(
    repository,
):
    """
    Testira fallback za primer, ko users dokument ne obstaja.
    """

    result = await repository.get_or_create_progress("missing_user")

    assert result["_id"] == "progress_missing_user"
    assert result["user_id"] == "missing_user"
    assert result["saved"]["learning_path_ids"] == []
    assert result["favorites"]["module_ids"] == []
    assert result["completed"]["learning_unit_ids"] == []
    assert result["current_positions"] == []
    assert result["questionnaire_answers"] == []