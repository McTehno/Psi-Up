from typing import Any, Dict, List, Optional

from app.schemas.questionnaire_schema import QuestionnaireTargetType


class AssessmentService:
    """
    Service za ocenjevanje odgovorov iz vprašalnika.

    Ta razred bo določil začetno točko uporabnika glede na njegove odgovore.
    Assessment se lahko izvede za učno pot, modul ali učno enoto.
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

    async def evaluate_answers(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore uporabnika in določi začetno točko.

        TODO:
        - Pretvoriti odgovore v znane in manjkajoče spretnosti.
        - Ugotoviti, katere učne enote uporabnik že zna.
        - Ugotoviti, katere module uporabnik lahko preskoči.
        - Določiti start_module_id in start_learning_unit_id.
        - Vrniti strukturiran assessment result.
        """

        if target_type == QuestionnaireTargetType.LEARNING_PATH:
            return await self._evaluate_learning_path(
                user_id=user_id,
                learning_path_id=target_id,
                answers=answers
            )

        if target_type == QuestionnaireTargetType.MODULE:
            return await self._evaluate_module(
                user_id=user_id,
                module_id=target_id,
                answers=answers
            )

        if target_type == QuestionnaireTargetType.LEARNING_UNIT:
            return await self._evaluate_learning_unit(
                user_id=user_id,
                learning_unit_id=target_id,
                answers=answers
            )

        return self._empty_result(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            summary="Neznan tip vsebine za ocenjevanje."
        )

    async def _evaluate_learning_path(
        self,
        user_id: str,
        learning_path_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za celotno učno pot.

        TODO:
        - Pridobiti vse module v učni poti.
        - Pridobiti vse učne enote iz teh modulov.
        - Primerjati odgovore z vprašanji in spretnostmi.
        - Določiti, kateri moduli so že pokriti.
        - Določiti prvi modul oziroma učno enoto, kjer naj uporabnik začne.
        - Upoštevati prerequisites kot glavno logiko dostopnosti.
        """

        learning_path = await self.learning_path_service.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.LEARNING_PATH,
                target_id=learning_path_id,
                summary="Učna pot ne obstaja."
            )

        # TODO:
        # Tukaj kasneje implementiramo pravo logiko za:
        # - skipped_modules,
        # - skipped_learning_units,
        # - start_module_id,
        # - start_learning_unit_id,
        # - recommended_next_modules.

        return self._empty_result(
            user_id=user_id,
            target_type=QuestionnaireTargetType.LEARNING_PATH,
            target_id=learning_path_id,
            summary="Assessment za učno pot še ni implementiran."
        )

    async def _evaluate_module(
        self,
        user_id: str,
        module_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za modul.

        TODO:
        - Pridobiti vse učne enote v modulu.
        - Primerjati odgovore z vprašanji in spretnostmi.
        - Določiti, katere učne enote uporabnik že zna.
        - Določiti prvo učno enoto, kjer naj uporabnik začne.
        - Upoštevati prerequisites učnih enot.
        """

        module = await self.module_service.get_module_by_id(module_id)

        if not module:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.MODULE,
                target_id=module_id,
                summary="Modul ne obstaja."
            )

        # TODO:
        # Tukaj kasneje implementiramo pravo logiko za:
        # - skipped_learning_units,
        # - start_learning_unit_id,
        # - recommended_next_learning_units.

        return self._empty_result(
            user_id=user_id,
            target_type=QuestionnaireTargetType.MODULE,
            target_id=module_id,
            summary="Assessment za modul še ni implementiran."
        )

    async def _evaluate_learning_unit(
        self,
        user_id: str,
        learning_unit_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za eno učno enoto.

        TODO:
        - Pridobiti učno enoto.
        - Primerjati odgovore z njenimi self_assessment_questions.
        - Ugotoviti, ali uporabnik to učno enoto že zna.
        - Vrniti rezultat za eno učno enoto.
        """

        learning_unit = await self.learning_unit_service.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.LEARNING_UNIT,
                target_id=learning_unit_id,
                summary="Učna enota ne obstaja."
            )

        # TODO:
        # Tukaj kasneje implementiramo pravo logiko za:
        # - known_skills,
        # - missing_skills,
        # - is_completed_by_assessment.

        return self._empty_result(
            user_id=user_id,
            target_type=QuestionnaireTargetType.LEARNING_UNIT,
            target_id=learning_unit_id,
            summary="Assessment za učno enoto še ni implementiran."
        )

    def _empty_result(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Vrne osnovni prazen assessment rezultat.

        TODO:
        - Po potrebi razširiti rezultat z dodatnimi polji,
          ko bo znana končna assessment logika.
        """

        return {
            "user_id": user_id,
            "target_type": target_type,
            "target_id": target_id,
            "start_module_id": None,
            "start_learning_unit_id": None,
            "skipped_modules": [],
            "skipped_learning_units": [],
            "recommended_next_modules": [],
            "recommended_next_learning_units": [],
            "learning_unit_results": [],
            "module_results": [],
            "summary": summary,
        }