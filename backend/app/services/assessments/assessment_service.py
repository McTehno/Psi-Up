from typing import Any, Dict, List, Optional

from app.schemas.assessment_schema import AssessmentStatus
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class AssessmentService:
    """
    Service za ocenjevanje odgovorov iz vprašalnika.

    Ta razred določi, katere učne enote oziroma moduli so že pokriti
    in kje naj uporabnik začne glede na odgovore.
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

        Logika:
        - true pomeni, da uporabnik spretnost zna,
        - false pomeni, da uporabniku spretnost manjka,
        - učna enota je opravljena, če so vsa njena vprašanja odgovorjena true.
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

        Učna pot se oceni tako, da se oceni vsak modul v učni poti.
        Začetna točka je prvi modul oziroma učna enota, ki še ni opravljena.
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

        module_references = await self.learning_path_service.get_module_references_for_learning_path(
            learning_path_id
        )

        skipped_modules: List[str] = []
        skipped_learning_units: List[str] = []
        recommended_next_modules: List[str] = []
        recommended_next_learning_units: List[str] = []
        module_results: List[Dict[str, Any]] = []
        learning_unit_results: List[Dict[str, Any]] = []

        start_module_id: Optional[str] = None
        start_learning_unit_id: Optional[str] = None

        completed_module_ids: List[str] = []

        for module_reference in module_references:
            module_id = module_reference.get("module_id")

            if not module_id:
                continue

            module_result = await self._evaluate_module(
                user_id=user_id,
                module_id=module_id,
                answers=answers
            )

            module_results.extend(module_result.get("module_results", []))
            learning_unit_results.extend(module_result.get("learning_unit_results", []))
            skipped_learning_units.extend(module_result.get("skipped_learning_units", []))

            module_completed = module_id in module_result.get("skipped_modules", [])

            if module_completed:
                skipped_modules.append(module_id)
                completed_module_ids.append(module_id)
                continue

            if start_module_id is None:
                prerequisites = module_reference.get("prerequisites", [])
                prerequisites_completed = all(
                    prerequisite_id in completed_module_ids
                    for prerequisite_id in prerequisites
                )

                if prerequisites_completed:
                    start_module_id = module_id
                    start_learning_unit_id = module_result.get("start_learning_unit_id")
                    recommended_next_modules.append(module_id)

                    if start_learning_unit_id:
                        recommended_next_learning_units.append(start_learning_unit_id)

        if start_module_id is None:
            summary = "Uporabnik je glede na odgovore pokril vse module v učni poti."
        else:
            summary = f"Uporabnik naj začne pri modulu {start_module_id}."

        return {
            "user_id": user_id,
            "target_type": QuestionnaireTargetType.LEARNING_PATH,
            "target_id": learning_path_id,
            "start_module_id": start_module_id,
            "start_learning_unit_id": start_learning_unit_id,
            "skipped_modules": skipped_modules,
            "skipped_learning_units": skipped_learning_units,
            "recommended_next_modules": recommended_next_modules,
            "recommended_next_learning_units": recommended_next_learning_units,
            "learning_unit_results": learning_unit_results,
            "module_results": module_results,
            "summary": summary,
        }

    async def _evaluate_module(
        self,
        user_id: str,
        module_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za modul.

        Modul je opravljen, če so vse njegove obvezne učne enote
        opravljene glede na odgovore v vprašalniku.
        """

        module = await self.module_service.get_module_by_id(module_id)

        if not module:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.MODULE,
                target_id=module_id,
                summary="Modul ne obstaja."
            )

        learning_unit_references = await self.module_service.get_learning_unit_references_for_module(
            module_id
        )

        completed_learning_units: List[str] = []
        missing_learning_units: List[str] = []
        skipped_learning_units: List[str] = []
        recommended_next_learning_units: List[str] = []
        learning_unit_results: List[Dict[str, Any]] = []

        start_learning_unit_id: Optional[str] = None

        for learning_unit_reference in learning_unit_references:
            learning_unit_id = learning_unit_reference.get("learning_unit_id")

            if not learning_unit_id:
                continue

            unit_result = await self._evaluate_learning_unit(
                user_id=user_id,
                learning_unit_id=learning_unit_id,
                answers=answers
            )

            unit_results = unit_result.get("learning_unit_results", [])
            learning_unit_results.extend(unit_results)

            is_completed = False

            if unit_results:
                is_completed = unit_results[0].get("is_completed_by_assessment", False)

            if is_completed:
                completed_learning_units.append(learning_unit_id)
                skipped_learning_units.append(learning_unit_id)
                continue

            missing_learning_units.append(learning_unit_id)

            if start_learning_unit_id is None:
                prerequisites = learning_unit_reference.get("prerequisites", [])
                prerequisites_completed = all(
                    prerequisite_id in completed_learning_units
                    for prerequisite_id in prerequisites
                )

                if prerequisites_completed:
                    start_learning_unit_id = learning_unit_id
                    recommended_next_learning_units.append(learning_unit_id)

        required_learning_units = [
            item.get("learning_unit_id")
            for item in learning_unit_references
            if item.get("is_required", True)
        ]

        required_completed = all(
            learning_unit_id in completed_learning_units
            for learning_unit_id in required_learning_units
        )

        if required_completed:
            status = AssessmentStatus.COMPLETED
            skipped_modules = [module_id]
            summary = f"Uporabnik je glede na odgovore pokril modul {module_id}."
        elif completed_learning_units:
            status = AssessmentStatus.PARTIALLY_COMPLETED
            skipped_modules = []
            summary = f"Uporabnik je delno pokril modul {module_id}."
        else:
            status = AssessmentStatus.NOT_STARTED
            skipped_modules = []
            summary = f"Uporabnik naj začne modul {module_id} od začetka."

        return {
            "user_id": user_id,
            "target_type": QuestionnaireTargetType.MODULE,
            "target_id": module_id,
            "start_module_id": None,
            "start_learning_unit_id": start_learning_unit_id,
            "skipped_modules": skipped_modules,
            "skipped_learning_units": skipped_learning_units,
            "recommended_next_modules": [],
            "recommended_next_learning_units": recommended_next_learning_units,
            "learning_unit_results": learning_unit_results,
            "module_results": [
                {
                    "module_id": module_id,
                    "status": status,
                    "completed_learning_units": completed_learning_units,
                    "missing_learning_units": missing_learning_units,
                }
            ],
            "summary": summary,
        }

    async def _evaluate_learning_unit(
        self,
        user_id: str,
        learning_unit_id: str,
        answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za eno učno enoto.

        Učna enota je opravljena, če so vsa vprašanja te učne enote
        odgovorjena z true.
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

        questions = learning_unit.get("self_assessment_questions", [])

        known_skills: List[str] = []
        missing_skills: List[str] = []

        answer_map = {
            answer.get("question_id"): answer.get("answer")
            for answer in answers
        }

        for question in questions:
            question_id = question.get("id")
            related_skill = question.get("related_skill")

            answer_value = answer_map.get(question_id)

            if answer_value is True:
                if related_skill:
                    known_skills.append(related_skill)
            else:
                if related_skill:
                    missing_skills.append(related_skill)

        is_completed_by_assessment = bool(questions) and len(missing_skills) == 0

        start_learning_unit_id = None if is_completed_by_assessment else learning_unit_id

        if is_completed_by_assessment:
            summary = f"Uporabnik je glede na odgovore pokril učno enoto {learning_unit_id}."
            skipped_learning_units = [learning_unit_id]
            recommended_next_learning_units = []
        else:
            summary = f"Uporabniku priporočamo učno enoto {learning_unit_id}."
            skipped_learning_units = []
            recommended_next_learning_units = [learning_unit_id]

        return {
            "user_id": user_id,
            "target_type": QuestionnaireTargetType.LEARNING_UNIT,
            "target_id": learning_unit_id,
            "start_module_id": None,
            "start_learning_unit_id": start_learning_unit_id,
            "skipped_modules": [],
            "skipped_learning_units": skipped_learning_units,
            "recommended_next_modules": [],
            "recommended_next_learning_units": recommended_next_learning_units,
            "learning_unit_results": [
                {
                    "learning_unit_id": learning_unit_id,
                    "known_skills": known_skills,
                    "missing_skills": missing_skills,
                    "is_completed_by_assessment": is_completed_by_assessment,
                }
            ],
            "module_results": [],
            "summary": summary,
        }

    def _empty_result(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Vrne osnovni prazen assessment rezultat.
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