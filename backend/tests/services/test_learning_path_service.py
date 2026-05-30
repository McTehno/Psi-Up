from app.services.learning_paths.learning_path_service import LearningPathService


class FakeLearningPathRepository:
    # Fake repository omogoča testiranje LearningPathService brez prave baze.
    def __init__(self):
        self.learning_paths = [
            {
                "_id": "up_001",
                "title": "Iskanje informacij z umetno inteligenco",
                "short_description": "Učna pot za uporabo UI pri iskanju informacij.",
                "modules": [
                    {
                        "module_id": "mod_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    },
                    {
                        "module_id": "mod_002",
                        "order": 2,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": ["mod_001"],
                    },
                ],
            }
        ]

    async def get_all_learning_paths(self):
        return self.learning_paths

    async def get_learning_path_by_id(self, learning_path_id: str):
        for learning_path in self.learning_paths:
            if learning_path["_id"] == learning_path_id:
                return learning_path

        return None

    async def get_module_references_for_learning_path(self, learning_path_id: str):
        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return []

        return learning_path["modules"]

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: list[str],
    ):
        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return []

        return [
            module_reference
            for module_reference in learning_path["modules"]
            if all(
                prerequisite in completed_module_ids
                for prerequisite in module_reference["prerequisites"]
            )
        ]


class FakeModuleService:
    # Fake service predstavlja že testirano logiko za module.
    async def get_modules_by_ids(self, module_ids: list[str]):
        modules = {
            "mod_001": {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
            },
            "mod_002": {
                "_id": "mod_002",
                "title": "Iskanje informacij z UI",
            },
        }

        return [
            modules[module_id]
            for module_id in module_ids
            if module_id in modules
        ]

    async def get_self_assessment_questions_for_module(self, module_id: str):
        return [
            {
                "id": f"q_{module_id}",
                "question": "Testno vprašanje.",
                "type": "yes_no",
                "module_id": module_id,
            }
        ]


def create_service():
    # Pripravimo LearningPathService s fake odvisnostmi.
    return LearningPathService(
        learning_path_repository=FakeLearningPathRepository(),
        module_service=FakeModuleService(),
    )


async def test_get_all_learning_paths_returns_repository_result():
    # Service vrne vse učne poti iz repository sloja.
    service = create_service()

    result = await service.get_all_learning_paths()

    assert len(result) == 1
    assert result[0]["_id"] == "up_001"


async def test_get_learning_path_by_id_returns_path_when_exists():
    # Service vrne učno pot, če ID obstaja.
    service = create_service()

    result = await service.get_learning_path_by_id("up_001")

    assert result is not None
    assert result["_id"] == "up_001"


async def test_get_learning_path_by_id_returns_none_when_missing():
    # Če učna pot ne obstaja, service vrne None.
    service = create_service()

    result = await service.get_learning_path_by_id("missing_id")

    assert result is None


async def test_get_learning_path_detail_adds_module_details():
    # Detail metoda učni poti doda podrobnosti modulov.
    service = create_service()

    result = await service.get_learning_path_detail("up_001")

    assert result is not None
    assert result["_id"] == "up_001"
    assert len(result["module_details"]) == 2
    assert result["module_details"][0]["_id"] == "mod_001"


async def test_get_learning_path_detail_returns_none_when_path_missing():
    # Če učna pot ne obstaja, detail metoda vrne None.
    service = create_service()

    result = await service.get_learning_path_detail("missing_id")

    assert result is None


async def test_get_module_references_for_learning_path_returns_references():
    # Service vrne reference modulov znotraj učne poti.
    service = create_service()

    result = await service.get_module_references_for_learning_path("up_001")

    assert len(result) == 2
    assert result[0]["module_id"] == "mod_001"


async def test_get_available_modules_for_learning_path_respects_prerequisites():
    # Brez zaključenih predpogojev je dostopen samo prvi modul.
    service = create_service()

    result = await service.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=[],
    )

    assert [item["module_id"] for item in result] == ["mod_001"]


async def test_get_available_modules_for_learning_path_returns_next_after_completion():
    # Ko je prvi predpogoj zaključen, postane dostopen tudi drugi modul.
    service = create_service()

    result = await service.get_available_modules_for_learning_path(
        learning_path_id="up_001",
        completed_module_ids=["mod_001"],
    )

    assert [item["module_id"] for item in result] == ["mod_001", "mod_002"]


async def test_get_self_assessment_questions_for_learning_path_combines_module_questions():
    # Service združi vprašanja za samooceno iz vseh modulov učne poti.
    service = create_service()

    result = await service.get_self_assessment_questions_for_learning_path("up_001")

    assert len(result) == 2
    assert result[0]["module_id"] == "mod_001"
    assert result[1]["module_id"] == "mod_002"