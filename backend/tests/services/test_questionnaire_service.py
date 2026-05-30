from app.schemas.questionnaire_schema import QuestionnaireTargetType
from app.services.questionnaires.questionnaire_service import QuestionnaireService


class FakeLearningPathService:
    # Fake service za vprašalnik učne poti.
    async def get_learning_path_by_id(self, learning_path_id: str):
        if learning_path_id != "up_001":
            return None

        return {
            "_id": "up_001",
            "title": "Iskanje informacij z umetno inteligenco",
        }

    async def get_self_assessment_questions_for_learning_path(self, learning_path_id: str):
        return [
            {
                "id": "q_path_001",
                "question": "Razumem učno pot.",
                "type": "yes_no",
                "learning_unit_id": "ue_001",
            }
        ]


class FakeModuleService:
    # Fake service za vprašalnik modula.
    async def get_module_by_id(self, module_id: str):
        if module_id != "mod_001":
            return None

        return {
            "_id": "mod_001",
            "title": "Razumevanje umetne inteligence",
        }

    async def get_self_assessment_questions_for_module(self, module_id: str):
        return [
            {
                "id": "q_module_001",
                "question": "Razumem modul.",
                "type": "yes_no",
                "learning_unit_id": "ue_001",
            }
        ]


class FakeLearningUnitService:
    # Fake service za vprašalnik učne enote.
    async def get_learning_unit_by_id(self, learning_unit_id: str):
        if learning_unit_id != "ue_001":
            return None

        return {
            "_id": "ue_001",
            "title": "Kaj je umetna inteligenca?",
        }

    async def get_self_assessment_questions(self, learning_unit_id: str):
        return [
            {
                "id": "q_unit_001",
                "question": "Razumem učno enoto.",
                "type": "yes_no",
                "learning_unit_id": "ue_001",
            }
        ]


def create_service():
    # Pripravimo QuestionnaireService s fake odvisnostmi.
    return QuestionnaireService(
        learning_path_service=FakeLearningPathService(),
        module_service=FakeModuleService(),
        learning_unit_service=FakeLearningUnitService(),
    )


async def test_generate_questionnaire_for_learning_path():
    # Service ustvari vprašalnik za učno pot.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="up_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.LEARNING_PATH
    assert result["target_id"] == "up_001"
    assert result["title"] == "Iskanje informacij z umetno inteligenco"
    assert result["questions"][0]["id"] == "q_path_001"


async def test_generate_questionnaire_for_module():
    # Service ustvari vprašalnik za modul.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="mod_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.MODULE
    assert result["target_id"] == "mod_001"
    assert result["title"] == "Razumevanje umetne inteligence"
    assert result["questions"][0]["id"] == "q_module_001"


async def test_generate_questionnaire_for_learning_unit():
    # Service ustvari vprašalnik za učno enoto.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="ue_001",
    )

    assert result is not None
    assert result["target_type"] == QuestionnaireTargetType.LEARNING_UNIT
    assert result["target_id"] == "ue_001"
    assert result["title"] == "Kaj je umetna inteligenca?"
    assert result["questions"][0]["id"] == "q_unit_001"


async def test_generate_questionnaire_returns_none_when_learning_path_missing():
    # Če učna pot ne obstaja, vprašalnik ne sme biti ustvarjen.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_PATH,
        target_id="missing_id",
    )

    assert result is None


async def test_generate_questionnaire_returns_none_when_module_missing():
    # Če modul ne obstaja, vprašalnik ne sme biti ustvarjen.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.MODULE,
        target_id="missing_id",
    )

    assert result is None


async def test_generate_questionnaire_returns_none_when_learning_unit_missing():
    # Če učna enota ne obstaja, vprašalnik ne sme biti ustvarjen.
    service = create_service()

    result = await service.generate_questionnaire(
        target_type=QuestionnaireTargetType.LEARNING_UNIT,
        target_id="missing_id",
    )

    assert result is None