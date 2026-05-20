from typing import Any, Dict, List, Optional

from app.schemas.questionnaire_schema import QuestionnaireTargetType


class QuestionnaireService:
    """
    Service za vprašalnike.

    Ta razred pripravi vprašalnik za učno pot, modul ali učno enoto.
    Vprašanja se zbirajo iz self_assessment_questions znotraj učnih enot.
    """

    def __init__(
        self,
        learning_path_service: Any,
        module_service: Any,
        learning_unit_service: Any
    ):
        """
        Inicializira service z odvisnimi service-i za učne poti, module in učne enote.
        """

        self.learning_path_service = learning_path_service
        self.module_service = module_service
        self.learning_unit_service = learning_unit_service

    async def generate_questionnaire(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za izbrano vsebino.

        TODO:
        - Če je target_type learning_path, zbrati vprašanja iz vseh modulov in učnih enot.
        - Če je target_type module, zbrati vprašanja iz vseh učnih enot v modulu.
        - Če je target_type learning_unit, zbrati vprašanja samo iz ene učne enote.
        - Dodati naslov vprašalnika.
        """

        if target_type == QuestionnaireTargetType.LEARNING_PATH:
            return await self._generate_for_learning_path(target_id)

        if target_type == QuestionnaireTargetType.MODULE:
            return await self._generate_for_module(target_id)

        if target_type == QuestionnaireTargetType.LEARNING_UNIT:
            return await self._generate_for_learning_unit(target_id)

        return None

    async def _generate_for_learning_path(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za učno pot.

        TODO:
        - Pridobiti učno pot.
        - Pridobiti vprašanja iz vseh modulov znotraj učne poti.
        - Vrniti enoten vprašalnik.
        """

        learning_path = await self.learning_path_service.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return None

        questions = await self.learning_path_service.get_self_assessment_questions_for_learning_path(
            learning_path_id
        )

        return {
            "target_type": QuestionnaireTargetType.LEARNING_PATH,
            "target_id": learning_path_id,
            "title": learning_path.get("title"),
            "questions": questions,
        }

    async def _generate_for_module(
        self,
        module_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za modul.

        TODO:
        - Pridobiti modul.
        - Pridobiti vprašanja iz vseh učnih enot znotraj modula.
        - Vrniti enoten vprašalnik.
        """

        module = await self.module_service.get_module_by_id(module_id)

        if not module:
            return None

        questions = await self.module_service.get_self_assessment_questions_for_module(
            module_id
        )

        return {
            "target_type": QuestionnaireTargetType.MODULE,
            "target_id": module_id,
            "title": module.get("title"),
            "questions": questions,
        }

    async def _generate_for_learning_unit(
        self,
        learning_unit_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za učno enoto.

        TODO:
        - Pridobiti učno enoto.
        - Pridobiti vprašanja samo iz te učne enote.
        - Vrniti vprašalnik za eno učno enoto.
        """

        learning_unit = await self.learning_unit_service.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            return None

        questions = await self.learning_unit_service.get_self_assessment_questions(
            learning_unit_id
        )

        return {
            "target_type": QuestionnaireTargetType.LEARNING_UNIT,
            "target_id": learning_unit_id,
            "title": learning_unit.get("title"),
            "questions": questions,
        }