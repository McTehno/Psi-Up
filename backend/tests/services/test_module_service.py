from app.services.modules.module_service import ModuleService


class FakeModuleRepository:
    # Fake repository omogoča testiranje ModuleService brez prave baze.
    def __init__(self):
        self.modules = [
            {
                "_id": "mod_001",
                "title": "Razumevanje umetne inteligence",
                "short_description": "Osnovni pojmi UI.",
                "learning_units": [
                    {
                        "learning_unit_id": "ue_001",
                        "order": 1,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": [],
                    },
                    {
                        "learning_unit_id": "ue_002",
                        "order": 2,
                        "parallel_group": None,
                        "is_required": True,
                        "prerequisites": ["ue_001"],
                    },
                ],
            }
        ]

    async def get_all_modules(self):
        return self.modules

    async def get_module_by_id(self, module_id: str):
        for module in self.modules:
            if module["_id"] == module_id:
                return module

        return None

    async def get_modules_by_ids(self, module_ids: list[str]):
        return [
            module
            for module in self.modules
            if module["_id"] in module_ids
        ]

    async def get_learning_unit_references_for_module(self, module_id: str):
        module = await self.get_module_by_id(module_id)

        if not module:
            return []

        return module["learning_units"]

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: list[str],
    ):
        module = await self.get_module_by_id(module_id)

        if not module:
            return []

        return [
            learning_unit_reference
            for learning_unit_reference in module["learning_units"]
            if all(
                prerequisite in completed_learning_unit_ids
                for prerequisite in learning_unit_reference["prerequisites"]
            )
        ]


class FakeLearningUnitService:
    # Fake service predstavlja že testirano logiko za učne enote.
    async def get_learning_units_by_ids(self, learning_unit_ids: list[str]):
        learning_units = {
            "ue_001": {
                "_id": "ue_001",
                "title": "Kaj je umetna inteligenca?",
            },
            "ue_002": {
                "_id": "ue_002",
                "title": "Generativna umetna inteligenca",
            },
        }

        return [
            learning_units[learning_unit_id]
            for learning_unit_id in learning_unit_ids
            if learning_unit_id in learning_units
        ]

    async def get_self_assessment_questions(self, learning_unit_id: str):
        return [
            {
                "id": f"q_{learning_unit_id}",
                "question": "Testno vprašanje.",
                "type": "yes_no",
                "learning_unit_id": learning_unit_id,
            }
        ]


def create_service():
    # Pripravimo ModuleService s fake odvisnostmi.
    return ModuleService(
        module_repository=FakeModuleRepository(),
        learning_unit_service=FakeLearningUnitService(),
    )


async def test_get_all_modules_returns_repository_result():
    # Service vrne vse module iz repository sloja.
    service = create_service()

    result = await service.get_all_modules()

    assert len(result) == 1
    assert result[0]["_id"] == "mod_001"


async def test_get_module_by_id_returns_module_when_exists():
    # Service vrne modul, če ID obstaja.
    service = create_service()

    result = await service.get_module_by_id("mod_001")

    assert result is not None
    assert result["_id"] == "mod_001"


async def test_get_module_by_id_returns_none_when_missing():
    # Če modul ne obstaja, service vrne None.
    service = create_service()

    result = await service.get_module_by_id("missing_id")

    assert result is None


async def test_get_modules_by_ids_returns_matching_modules():
    # Service pridobi več modulov po podanih ID-jih.
    service = create_service()

    result = await service.get_modules_by_ids(["mod_001"])

    assert len(result) == 1
    assert result[0]["_id"] == "mod_001"


async def test_get_module_detail_adds_learning_unit_details():
    # Detail metoda modulu doda podrobnosti učnih enot.
    service = create_service()

    result = await service.get_module_detail("mod_001")

    assert result is not None
    assert result["_id"] == "mod_001"
    assert len(result["learning_unit_details"]) == 2
    assert result["learning_unit_details"][0]["_id"] == "ue_001"


async def test_get_module_detail_returns_none_when_module_missing():
    # Če modul ne obstaja, detail metoda vrne None.
    service = create_service()

    result = await service.get_module_detail("missing_id")

    assert result is None


async def test_get_learning_unit_references_for_module_returns_references():
    # Service vrne reference učnih enot znotraj modula.
    service = create_service()

    result = await service.get_learning_unit_references_for_module("mod_001")

    assert len(result) == 2
    assert result[0]["learning_unit_id"] == "ue_001"


async def test_get_available_learning_units_for_module_respects_prerequisites():
    # Brez zaključenih predpogojev je dostopna samo prva učna enota.
    service = create_service()

    result = await service.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=[],
    )

    assert [item["learning_unit_id"] for item in result] == ["ue_001"]


async def test_get_available_learning_units_for_module_returns_next_after_completion():
    # Ko je prvi predpogoj zaključen, postane dostopna tudi druga učna enota.
    service = create_service()

    result = await service.get_available_learning_units_for_module(
        module_id="mod_001",
        completed_learning_unit_ids=["ue_001"],
    )

    assert [item["learning_unit_id"] for item in result] == ["ue_001", "ue_002"]


async def test_get_self_assessment_questions_for_module_combines_unit_questions():
    # Service združi vprašanja za samooceno iz vseh učnih enot modula.
    service = create_service()

    result = await service.get_self_assessment_questions_for_module("mod_001")

    assert len(result) == 2
    assert result[0]["learning_unit_id"] == "ue_001"
    assert result[1]["learning_unit_id"] == "ue_002"

