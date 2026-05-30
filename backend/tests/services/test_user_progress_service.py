from app.services.user_progress.user_progress_service import UserProgressService


class FakeUserProgressRepository:
    # Fake repository omogoča testiranje service sloja brez prave baze.
    def __init__(self):
        self.progress_documents = {
            "user_001": {
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
        }
        self.created_user_ids: list[str] = []

    async def get_progress_by_user_id(self, user_id: str):
        return self.progress_documents.get(user_id)

    async def create_progress(self, user_id: str):
        self.created_user_ids.append(user_id)

        progress = {
            "_id": f"progress_{user_id}",
            "user_id": user_id,
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

        self.progress_documents[user_id] = progress

        return progress

    async def get_or_create_progress(self, user_id: str):
        existing_progress = await self.get_progress_by_user_id(user_id)

        if existing_progress:
            return existing_progress

        return await self.create_progress(user_id)


def test_create_service_repository():
    # Helper test za pripravo fake repository-ja.
    repository = FakeUserProgressRepository()
    service = UserProgressService(repository)

    assert service.user_progress_repository == repository


async def test_get_progress_by_user_id_returns_existing_progress():
    # Service vrne obstoječ progress zapis.
    repository = FakeUserProgressRepository()
    service = UserProgressService(repository)

    result = await service.get_progress_by_user_id("user_001")

    assert result is not None
    assert result["user_id"] == "user_001"


async def test_get_progress_by_user_id_returns_none_when_missing():
    # Če progress ne obstaja, service vrne None.
    service = UserProgressService(FakeUserProgressRepository())

    result = await service.get_progress_by_user_id("missing_user")

    assert result is None


async def test_create_progress_delegates_to_repository():
    # Service ustvari začetni progress prek repository sloja.
    repository = FakeUserProgressRepository()
    service = UserProgressService(repository)

    result = await service.create_progress("user_002")

    assert result["user_id"] == "user_002"
    assert repository.created_user_ids == ["user_002"]


async def test_get_or_create_progress_returns_existing_progress():
    # Če progress obstaja, ga service vrne brez ustvarjanja novega.
    repository = FakeUserProgressRepository()
    service = UserProgressService(repository)

    result = await service.get_or_create_progress("user_001")

    assert result["user_id"] == "user_001"
    assert repository.created_user_ids == []


async def test_get_or_create_progress_creates_when_missing():
    # Če progress ne obstaja, ga service ustvari.
    repository = FakeUserProgressRepository()
    service = UserProgressService(repository)

    result = await service.get_or_create_progress("user_002")

    assert result["user_id"] == "user_002"
    assert repository.created_user_ids == ["user_002"]