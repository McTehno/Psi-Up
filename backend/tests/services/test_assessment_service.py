from app.schemas.assessment_schema import AssessmentStatus
from app.schemas.questionnaire_schema import QuestionnaireTargetType
from app.services.assessments.assessment_service import AssessmentService


class FakeLearningUnitService:
    # Fake service za učne enote z vprašanji in content_topics.
    async def get_learning_unit_by_id(self, learning_unit_id: str):
        learning_units = {
            "ue_001": {
                "_id": "ue_001",
                "title": "Kaj je umetna inteligenca?",
                "content_topics": ["Osnovni pojmi", "Primeri uporabe"],
                "self_assessment_questions": [
                    {
                        "id": "q_001",
                        "question": "Razumem osnovne pojme.",
                        "type": "yes_no",
                        "related_topic": "Osnovni pojmi",
                    },
                    {
                        "id": "q_002",
                        "question": "Poznam primere uporabe.",
                        "type": "yes_no",
                        "related_topic": "Primeri uporabe",
                    },
                ],
            },
            "ue_002": {
                "_id": "ue_002",
                "title": "Generativna umetna inteligenca",
                "content_topics": ["Generativna UI"],
                "self_assessment_questions": [
                    {
                        "id": "q_003",
                        "question": "Razumem generativno UI.",
                        "type": "yes_no",
                        "related_topic": "Generativna UI",
                    }
                ],
            },
        }

        return learning_units.get(learning_unit_id)


class FakeModuleService:
    # Fake service za module in reference učnih enot.
    async def get_module_by_id(self, module_id: str):
        if module_id != "mod_001":
            return None

        return {
            "_id": "mod_001",
            "title": "Razumevanje umetne inteligence",
        }

    async def get_learning_unit_references_for_module(self, module_id: str):
        if module_id != "mod_001":
            return []

        return [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "is_required": True,
                "prerequisites": [],
            },
            {
                "learning_unit_id": "ue_002",
                "order": 2,
                "is_required": True,
                "prerequisites": ["ue_001"],
            },
        ]


class FakeLearningPathService:
    # Fake service za učno pot in reference modulov.
    async def get_learning_path_by_id(self, learning_path_id: str):
        if learning_path_id != "up_001":
            return None

        return {
            "_id": "up_001",
            "title": "Iskanje informacij z umetno inteligenco",
        }

    async def get_module_references_for_learning_path(self, learning_path_id: str):
        if learning_path_id != "up_001":
            return []

        return [
            {
                "module_id": "mod_001",
                "order": 1,
                "is_required": True,
                "prerequisites": [],
            }
        ]


def create_service():
    # Pripravimo AssessmentService s fake odvisnostmi.
    return AssessmentService(
        learning_path_service=FakeLearningPathService(),
        module_service=FakeModuleService(),
        learning_unit_service=FakeLearningUnitService(),
    )


async def test_evaluate_learning_unit_marks_unit_completed_when_all_answers_true():
    # Če so vsa vprašanja odgovorjena true, je učna enota pokrita.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "q_001",
                "learning_unit_id": "ue_001",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "learning_unit_id": "ue_001",
                "answer": True,
            },
        ],
    )

    unit_result = result["learning_unit_results"][0]

    assert result["start_learning_unit_id"] is None
    assert result["skipped_learning_units"] == ["ue_001"]
    assert unit_result["is_completed_by_assessment"] is True
    assert unit_result["missing_topics"] == []


async def test_evaluate_learning_unit_recommends_unit_when_answer_is_false():
    # Če vsaj ena tema manjka, service priporoči isto učno enoto.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
        answers=[
            {
                "question_id": "q_001",
                "learning_unit_id": "ue_001",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "learning_unit_id": "ue_001",
                "answer": False,
            },
        ],
    )

    unit_result = result["learning_unit_results"][0]

    assert result["start_learning_unit_id"] == "ue_001"
    assert result["recommended_next_learning_units"] == ["ue_001"]
    assert unit_result["known_topics"] == ["Osnovni pojmi"]
    assert unit_result["missing_topics"] == ["Primeri uporabe"]


async def test_evaluate_learning_unit_returns_empty_result_when_unit_missing():
    # Če učna enota ne obstaja, service vrne prazen rezultat.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="missing_id",
        answers=[],
    )

    assert result["learning_unit_results"] == []
    assert result["summary"] == "Učna enota ne obstaja."


async def test_evaluate_module_marks_module_completed_when_required_units_are_completed():
    # Če so vse obvezne učne enote pokrite, je modul completed.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "learning_unit_id": "ue_001",
                "answer": True,
            },
            {
                "question_id": "q_002",
                "learning_unit_id": "ue_001",
                "answer": True,
            },
            {
                "question_id": "q_003",
                "learning_unit_id": "ue_002",
                "answer": True,
            },
        ],
    )

    module_result = result["module_results"][0]

    assert module_result["status"] == AssessmentStatus.COMPLETED
    assert result["skipped_modules"] == ["mod_001"]
    assert result["start_learning_unit_id"] is None


async def test_evaluate_module_recommends_first_missing_available_unit():
    # Če prva učna enota ni pokrita, service priporoči začetek pri njej.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
        answers=[
            {
                "question_id": "q_001",
                "learning_unit_id": "ue_001",
                "answer": False,
            }
        ],
    )

    module_result = result["module_results"][0]

    assert module_result["status"] == AssessmentStatus.NOT_STARTED
    assert result["start_learning_unit_id"] == "ue_001"
    assert result["recommended_next_learning_units"] == ["ue_001"]


async def test_evaluate_learning_path_recommends_first_missing_module():
    # Pri učni poti service določi prvi modul, kjer mora uporabnik začeti.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_001",
        answers=[
            {
                "question_id": "q_001",
                "learning_unit_id": "ue_001",
                "answer": False,
            }
        ],
    )

    assert result["start_module_id"] == "mod_001"
    assert result["start_learning_unit_id"] == "ue_001"
    assert result["recommended_next_modules"] == ["mod_001"]


async def test_evaluate_answers_returns_empty_result_for_unknown_target_type():
    # Neznan target_type ne sme povzročiti napake, ampak vrne prazen rezultat.
    service = create_service()

    result = await service.evaluate_answers(
        user_id="user_001",
        target_type="unknown",
        target_id="x_001",
        answers=[],
    )

    assert result["target_type"] == "unknown"
    assert result["summary"] == "Neznan tip vsebine za ocenjevanje."