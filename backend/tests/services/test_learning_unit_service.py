from app.services.learning_units.learning_unit_service import LearningUnitService


class FakeLearningUnitRepository:
    # Fake repository uporabimo, da testiramo service logiko brez prave MongoDB baze.
    def __init__(self):
        self.learning_units = [
            {
                "_id": "ue_001",
                "title": "Osnove umetne inteligence",
                "short_description": "Uvod v osnovne pojme UI.",
                "keywords": ["UI", "umetna inteligenca", "", None, 123],
                "content_topics": ["Osnovni pojmi", None],
                "acquired_competencies": ["Razumevanje osnov UI", ""],
                "digcomp_competencies": [
                    {
                        "code": "1.1",
                        "title": "Brskanje in iskanje podatkov",
                        "description": "Iskanje informacij v digitalnem okolju.",
                    }
                ],
                "prerequisites": ["Osnovno digitalno znanje", None],
                "self_assessment_questions": [
                    {
                        "id": "q_001",
                        "question": "Razumem osnovne pojme UI.",
                        "type": "yes_no",
                        "related_topic": "Osnovni pojmi",
                    }
                ],
            },
            {
                "_id": "ue_002",
                "title": None,
                "short_description": None,
                "keywords": None,
                "content_topics": "napačen tip",
                "acquired_competencies": None,
                "digcomp_competencies": None,
                "prerequisites": None,
                "self_assessment_questions": None,
            },
        ]

    async def get_all_learning_units(self):
        return self.learning_units

    async def get_learning_unit_by_id(self, learning_unit_id: str):
        for learning_unit in self.learning_units:
            if learning_unit["_id"] == learning_unit_id:
                return learning_unit

        return None

    async def get_learning_units_by_ids(self, learning_unit_ids: list[str]):
        return [
            learning_unit
            for learning_unit in self.learning_units
            if learning_unit["_id"] in learning_unit_ids
        ]

    async def get_self_assessment_questions(self, learning_unit_id: str):
        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        if not learning_unit:
            return []

        return learning_unit.get("self_assessment_questions")


async def test_get_all_learning_units_returns_normalized_units():
    # Service normalizira vse učne enote, preden jih vrne API sloju.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_all_learning_units()

    assert len(result) == 2
    assert result[0]["keywords"] == ["UI", "umetna inteligenca"]
    assert result[1]["title"] == ""
    assert result[1]["keywords"] == []


async def test_get_learning_unit_by_id_returns_normalized_unit_when_exists():
    # Preverimo, da se ena učna enota normalizira tudi pri iskanju po ID.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_learning_unit_by_id("ue_001")

    assert result is not None
    assert result["_id"] == "ue_001"
    assert result["content_topics"] == ["Osnovni pojmi"]
    assert result["prerequisites"] == ["Osnovno digitalno znanje"]


async def test_get_learning_unit_by_id_returns_none_when_missing():
    # Če učna enota ne obstaja, service vrne None.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_learning_unit_by_id("missing_id")

    assert result is None


async def test_get_learning_units_by_ids_returns_normalized_units():
    # Preverimo normalizacijo pri pridobivanju več učnih enot po ID-jih.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_learning_units_by_ids(["ue_001", "ue_002"])

    assert len(result) == 2
    assert result[0]["keywords"] == ["UI", "umetna inteligenca"]
    assert result[1]["self_assessment_questions"] == []


async def test_get_learning_unit_detail_returns_same_normalized_unit():
    # Detail metoda uporablja osnovno metodo za pridobivanje učne enote.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_learning_unit_detail("ue_001")

    assert result is not None
    assert result["_id"] == "ue_001"
    assert result["title"] == "Osnove umetne inteligence"


async def test_get_learning_unit_detail_returns_none_when_missing():
    # Če učna enota za detail page ne obstaja, service vrne None.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_learning_unit_detail("missing_id")

    assert result is None


async def test_get_self_assessment_questions_adds_learning_unit_id():
    # Service doda learning_unit_id vprašanjem, ker ga assessment kasneje potrebuje.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_self_assessment_questions("ue_001")

    assert len(result) == 1
    assert result[0]["id"] == "q_001"
    assert result[0]["learning_unit_id"] == "ue_001"


async def test_get_self_assessment_questions_returns_empty_list_when_questions_are_invalid():
    # Če repository vrne None ali napačen tip, service vrne prazen seznam.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_self_assessment_questions("ue_002")

    assert result == []


async def test_get_self_assessment_questions_returns_empty_list_when_unit_missing():
    # Če učna enota ne obstaja, service vrne prazen seznam vprašanj.
    service = LearningUnitService(FakeLearningUnitRepository())

    result = await service.get_self_assessment_questions("missing_id")

    assert result == []