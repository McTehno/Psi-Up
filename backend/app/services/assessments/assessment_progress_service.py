from typing import Any, Dict, List, Optional

from app.schemas.assessment_schema import AssessmentStatus
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class AssessmentProgressService:
    """
    Orchestrator service za oddajo vprašalnika.

    Ta service poveže:
    - pripravo vseh odgovorov,
    - shranjevanje odgovorov v users.progress.questionnaire_answers,
    - assessment izračun,
    - posodobitev completed vsebin,
    - posodobitev trenutne pozicije.

    Pomembno:
    - vprašanja niso vedno yes_no,
    - odgovori niso vedno bool,
    - neodgovorjena yes_no vprašanja se za assessment shranijo kot False,
    - neodgovorjena vprašanja drugih tipov se shranijo kot None,
    - was_answered pove, ali je uporabnik vprašanje dejansko odgovoril.
    """

    def __init__(
        self,
        assessment_service: Any,
        questionnaire_answers_service: Any,
        user_progress_service: Any,
        completed_content_service: Any,
        current_position_service: Any,
        learning_path_service: Any,
        module_service: Any,
        learning_unit_service: Any,
    ):
        """
        Inicializira service z odvisnimi service-i.

        AssessmentService ostane odgovoren za samo ocenjevanje.
        Ta service pa skrbi za celoten submit flow in posodobitev progressa.
        """

        self.assessment_service = assessment_service
        self.questionnaire_answers_service = questionnaire_answers_service
        self.user_progress_service = user_progress_service
        self.completed_content_service = completed_content_service
        self.current_position_service = current_position_service
        self.learning_path_service = learning_path_service
        self.module_service = module_service
        self.learning_unit_service = learning_unit_service

    async def evaluate_and_update_progress(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        submitted_answers: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Izvede glavni submit flow za vprašalnik.

        Koraki:
        - dopolni neodgovorjena vprašanja,
        - shrani odgovore,
        - prebere obstoječ completed progress,
        - izvede assessment,
        - označi novo dokončane vsebine,
        - določi trenutno pozicijo,
        - vrne obogaten rezultat za frontend.
        """

        all_questions = await self._get_questions_for_target(
            target_type=target_type,
            target_id=target_id,
        )

        prepared_answers = self._build_complete_answers(
            all_questions=all_questions,
            submitted_answers=submitted_answers,
        )

        await self.questionnaire_answers_service.save_questionnaire_answers(
            user_id=user_id,
            target_type=self._get_target_type_value(target_type),
            target_id=target_id,
            answers=prepared_answers,
        )

        existing_completed = await self._get_existing_completed(user_id)

        result = await self.assessment_service.evaluate_answers(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            answers=prepared_answers,
        )

        completed_learning_unit_ids = self._extract_completed_learning_unit_ids(
            result=result,
            existing_completed=existing_completed,
        )

        result = self._sync_result_with_completed_progress(
            result=result,
            completed_learning_unit_ids=completed_learning_unit_ids,
            completed_module_ids=existing_completed.get("module_ids", []),
        )

        completed_module_ids = self._extract_completed_module_ids(
            result=result,
            existing_completed=existing_completed,
        )

        result = self._sync_result_with_completed_progress(
            result=result,
            completed_learning_unit_ids=completed_learning_unit_ids,
            completed_module_ids=completed_module_ids,
        )

        completed_learning_path_ids = await self._extract_completed_learning_path_ids(
            target_type=target_type,
            target_id=target_id,
            completed_module_ids=completed_module_ids,
            completed_learning_unit_ids=completed_learning_unit_ids,
            existing_completed=existing_completed,
        )


        await self._save_completed_content(
            user_id=user_id,
            completed_learning_unit_ids=completed_learning_unit_ids,
            completed_module_ids=completed_module_ids,
            completed_learning_path_ids=completed_learning_path_ids,
            existing_completed=existing_completed,
        )

        current_position = await self._update_current_position_if_needed(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            completed_module_ids=completed_module_ids,
            completed_learning_unit_ids=completed_learning_unit_ids,
        )

        result["completed_learning_unit_ids"] = completed_learning_unit_ids
        result["completed_module_ids"] = completed_module_ids
        result["completed_learning_path_ids"] = completed_learning_path_ids
        result["current_position"] = current_position

        result = self._sync_result_with_completed_progress(
            result=result,
            completed_learning_unit_ids=completed_learning_unit_ids,
            completed_module_ids=completed_module_ids,
        )

        result = self._clear_next_recommendations_if_learning_path_completed(
            target_type=target_type,
            target_id=target_id,
            completed_learning_path_ids=completed_learning_path_ids,
            result=result,
        )

        return result

    async def _get_questions_for_target(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne vsa vprašanja, ki pripadajo targetu.

        Target je lahko:
        - learning_path,
        - module,
        - learning_unit.

        Vprašanja normaliziramo, da imajo shranjeni odgovori dovolj metapodatkov.
        """

        if target_type == QuestionnaireTargetType.LEARNING_PATH:
            questions = await self.learning_path_service.get_self_assessment_questions_for_learning_path(
                target_id
            )
            return self._normalize_question_metadata(
                questions=self._get_dict_list_value(questions),
                target_type=target_type,
                target_id=target_id,
            )

        if target_type == QuestionnaireTargetType.MODULE:
            questions = await self.module_service.get_self_assessment_questions_for_module(
                target_id
            )
            return self._normalize_question_metadata(
                questions=self._get_dict_list_value(questions),
                target_type=target_type,
                target_id=target_id,
            )

        if target_type == QuestionnaireTargetType.LEARNING_UNIT:
            questions = await self.learning_unit_service.get_self_assessment_questions_for_learning_unit(
                target_id
            )
            return self._normalize_question_metadata(
                questions=self._get_dict_list_value(questions),
                target_type=target_type,
                target_id=target_id,
            )

        return []

    def _normalize_question_metadata(
        self,
        questions: List[Dict[str, Any]],
        target_type: QuestionnaireTargetType,
        target_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira metapodatke vprašanj pred shranjevanjem odgovorov.

        Namen:
        - related_topic_id preslikamo tudi v topic_id,
        - related_competency_codes preslikamo tudi v competency_codes,
        - pri learning_unit targetu dodamo learning_unit_id,
        - pri module targetu dodamo module_id, če manjka,
        - pri learning_path targetu dodamo learning_path_id, če manjka.
        """

        normalized_questions: List[Dict[str, Any]] = []

        for question in questions:
            normalized_question = dict(question)

            if not normalized_question.get("question_id") and normalized_question.get("id"):
                normalized_question["question_id"] = normalized_question.get("id")

            if not normalized_question.get("question_type"):
                normalized_question["question_type"] = (
                    normalized_question.get("type") or "yes_no"
                )

            if not normalized_question.get("type"):
                normalized_question["type"] = normalized_question.get("question_type")

            if not normalized_question.get("topic_id"):
                normalized_question["topic_id"] = normalized_question.get("related_topic_id")

            if not normalized_question.get("competency_codes"):
                normalized_question["competency_codes"] = self._get_string_list_value(
                    normalized_question.get("related_competency_codes")
                )

            if target_type == QuestionnaireTargetType.LEARNING_PATH:
                if not normalized_question.get("learning_path_id"):
                    normalized_question["learning_path_id"] = target_id

            if target_type == QuestionnaireTargetType.MODULE:
                if not normalized_question.get("module_id"):
                    normalized_question["module_id"] = target_id

            if target_type == QuestionnaireTargetType.LEARNING_UNIT:
                if not normalized_question.get("learning_unit_id"):
                    normalized_question["learning_unit_id"] = target_id

            normalized_questions.append(normalized_question)

        return normalized_questions

    def _build_complete_answers(
        self,
        all_questions: List[Dict[str, Any]],
        submitted_answers: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Združi vsa relevantna vprašanja s poslanimi odgovori.

        Če vprašanje ni odgovorjeno:
        - yes_no dobi answer = False,
        - drugi tipi dobijo answer = None,
        - was_answered = False.

        Če je vprašanje odgovorjeno:
        - ohranimo odgovor uporabnika,
        - was_answered = True, če ni že podan.
        """

        submitted_answers_by_key: Dict[str, Dict[str, Any]] = {}

        for answer in self._get_dict_list_value(submitted_answers):
            key = self._get_answer_key(answer)

            if not key:
                continue

            prepared_answer = dict(answer)

            if "was_answered" not in prepared_answer:
                prepared_answer["was_answered"] = True

            submitted_answers_by_key[key] = prepared_answer

        complete_answers: List[Dict[str, Any]] = []

        for question in self._get_dict_list_value(all_questions):
            key = self._get_answer_key(question)

            if key and key in submitted_answers_by_key:
                complete_answers.append(
                    self._merge_question_metadata_with_answer(
                        question=question,
                        answer=submitted_answers_by_key[key],
                    )
                )
                continue

            complete_answers.append(
                self._build_unanswered_answer(question)
            )

        return complete_answers

    def _merge_question_metadata_with_answer(
        self,
        question: Dict[str, Any],
        answer: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Združi metapodatke vprašanja z odgovorom uporabnika.

        Odgovor uporabnika ima prednost pri polju answer.
        Metapodatki iz vprašanja pomagajo kasneje pri assessmentu,
        shranjevanju progressa in prikazu zgodovine odgovorov.
        """

        merged_answer = {
            **question,
            **answer,
        }

        if not merged_answer.get("question_id"):
            question_id = question.get("question_id") or question.get("id")

            if question_id:
                merged_answer["question_id"] = question_id

        if not merged_answer.get("question_type"):
            merged_answer["question_type"] = (
                question.get("question_type")
                or question.get("type")
                or "yes_no"
            )

        if not merged_answer.get("type"):
            merged_answer["type"] = merged_answer.get("question_type")

        if not merged_answer.get("topic_id"):
            merged_answer["topic_id"] = (
                question.get("topic_id")
                or question.get("related_topic_id")
            )

        if not merged_answer.get("competency_codes"):
            merged_answer["competency_codes"] = self._get_string_list_value(
                question.get("competency_codes")
                or question.get("related_competency_codes")
            )

        if not merged_answer.get("learning_path_id"):
            learning_path_id = question.get("learning_path_id")

            if learning_path_id:
                merged_answer["learning_path_id"] = learning_path_id

        if not merged_answer.get("module_id"):
            module_id = question.get("module_id")

            if module_id:
                merged_answer["module_id"] = module_id

        if not merged_answer.get("learning_unit_id"):
            learning_unit_id = question.get("learning_unit_id")

            if learning_unit_id:
                merged_answer["learning_unit_id"] = learning_unit_id

        if "was_answered" not in merged_answer:
            merged_answer["was_answered"] = True

        return merged_answer

    def _build_unanswered_answer(
        self,
        question: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Zgradi odgovor za vprašanje, ki ga uporabnik ni odgovoril.

        Pomembno:
        - yes_no vprašanja lahko varno interpretiramo kot False,
        - drugih tipov vprašanj ne smemo siliti v False,
          ker imajo lahko drugačno obliko odgovora.
        """

        question_type = self._get_question_type(question)

        answer_value: Any = None

        if question_type == "yes_no":
            answer_value = False

        unanswered_answer = dict(question)

        question_id = question.get("question_id") or question.get("id")

        if question_id:
            unanswered_answer["question_id"] = question_id

        unanswered_answer["type"] = question_type
        unanswered_answer["question_type"] = question_type
        unanswered_answer["answer"] = answer_value
        unanswered_answer["was_answered"] = False

        return unanswered_answer

    async def _get_existing_completed(
        self,
        user_id: str,
    ) -> Dict[str, List[str]]:
        """
        Prebere obstoječe completed vsebine iz users.progress.

        Če progress še ne obstaja, service/repository poskrbi za prazno strukturo.
        """

        progress = await self.user_progress_service.get_or_create_progress(user_id)

        completed = progress.get("completed", {})

        if not isinstance(completed, dict):
            completed = {}

        return {
            "learning_path_ids": self._get_string_list_value(
                completed.get("learning_path_ids")
            ),
            "module_ids": self._get_string_list_value(
                completed.get("module_ids")
            ),
            "learning_unit_ids": self._get_string_list_value(
                completed.get("learning_unit_ids")
            ),
        }

    def _extract_completed_learning_unit_ids(
        self,
        result: Dict[str, Any],
        existing_completed: Dict[str, List[str]],
    ) -> List[str]:
        """
        Iz assessment rezultata in obstoječega progressa izlušči completed učne enote.
        """

        completed_learning_unit_ids = list(
            existing_completed.get("learning_unit_ids", [])
        )

        for unit_result in self._get_dict_list_value(
            result.get("learning_unit_results")
        ):
            if not unit_result.get("is_completed_by_assessment"):
                continue

            learning_unit_id = unit_result.get("learning_unit_id")

            if (
                isinstance(learning_unit_id, str)
                and learning_unit_id
                and learning_unit_id not in completed_learning_unit_ids
            ):
                completed_learning_unit_ids.append(learning_unit_id)

        return completed_learning_unit_ids

    def _extract_completed_module_ids(
        self,
        result: Dict[str, Any],
        existing_completed: Dict[str, List[str]],
    ) -> List[str]:
        """
        Iz assessment rezultata in obstoječega progressa izlušči completed module.
        """

        completed_module_ids = list(
            existing_completed.get("module_ids", [])
        )

        for module_result in self._get_dict_list_value(
            result.get("module_results")
        ):
            status = module_result.get("status")

            if (
                status != AssessmentStatus.COMPLETED
                and status != AssessmentStatus.COMPLETED.value
            ):
                continue

            module_id = module_result.get("module_id")

            if (
                isinstance(module_id, str)
                and module_id
                and module_id not in completed_module_ids
            ):
                completed_module_ids.append(module_id)

        return completed_module_ids

    async def _extract_completed_learning_path_ids(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str,
        completed_module_ids: List[str],
        completed_learning_unit_ids: List[str],
        existing_completed: Dict[str, List[str]],
    ) -> List[str]:
        """
        Ugotovi, ali je učna pot completed.

        Učna pot je completed, če so vsi required steps completed.
        Step je lahko module ali learning_unit.
        """

        completed_learning_path_ids = list(
            existing_completed.get("learning_path_ids", [])
        )

        if target_type != QuestionnaireTargetType.LEARNING_PATH:
            return completed_learning_path_ids

        if target_id in completed_learning_path_ids:
            return completed_learning_path_ids

        steps = await self.learning_path_service.get_step_references_for_learning_path(
            target_id
        )

        required_steps = [
            step
            for step in self._get_dict_list_value(steps)
            if step.get("is_required", True)
        ]

        all_required_steps_completed = True

        for step in required_steps:
            step_type = step.get("type")
            ref_id = step.get("ref_id")

            if not isinstance(ref_id, str) or not ref_id:
                continue

            if step_type == "module" and ref_id not in completed_module_ids:
                all_required_steps_completed = False
                break

            if (
                step_type == "learning_unit"
                and ref_id not in completed_learning_unit_ids
            ):
                all_required_steps_completed = False
                break

        if all_required_steps_completed:
            completed_learning_path_ids.append(target_id)

        return completed_learning_path_ids

    async def _save_completed_content(
        self,
        user_id: str,
        completed_learning_unit_ids: List[str],
        completed_module_ids: List[str],
        completed_learning_path_ids: List[str],
        existing_completed: Dict[str, List[str]],
    ) -> None:
        """
        Shrani novo dokončane vsebine v users.progress.completed.

        Uporablja obstoječi CompletedContentService, ki interno uporablja $addToSet.
        """

        for learning_unit_id in completed_learning_unit_ids:
            if learning_unit_id in existing_completed.get("learning_unit_ids", []):
                continue

            await self.completed_content_service.complete_content(
                user_id=user_id,
                content_id=learning_unit_id,
                content_type="learning_unit",
            )

        for module_id in completed_module_ids:
            if module_id in existing_completed.get("module_ids", []):
                continue

            await self.completed_content_service.complete_content(
                user_id=user_id,
                content_id=module_id,
                content_type="module",
            )

        for learning_path_id in completed_learning_path_ids:
            if learning_path_id in existing_completed.get("learning_path_ids", []):
                continue

            await self.completed_content_service.complete_content(
                user_id=user_id,
                content_id=learning_path_id,
                content_type="learning_path",
            )

    async def _update_current_position_if_needed(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        completed_module_ids: List[str],
        completed_learning_unit_ids: List[str],
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi trenutno pozicijo po assessmentu.

        Za zdaj current position avtomatsko posodabljamo samo za learning_path,
        ker ima learning_path jasen learning_path_id.
        """

        if target_type != QuestionnaireTargetType.LEARNING_PATH:
            return None

        current_position = await self._determine_learning_path_current_position(
            learning_path_id=target_id,
            completed_module_ids=completed_module_ids,
            completed_learning_unit_ids=completed_learning_unit_ids,
        )

        await self.current_position_service.update_current_position(
            user_id=user_id,
            learning_path_id=target_id,
            current_module_id=current_position.get("current_module_id"),
            current_learning_unit_id=current_position.get("current_learning_unit_id"),
        )

        return current_position

    async def _determine_learning_path_current_position(
        self,
        learning_path_id: str,
        completed_module_ids: List[str],
        completed_learning_unit_ids: List[str],
    ) -> Dict[str, Optional[str]]:
        """
        Določi trenutno pozicijo znotraj učne poti.

        Izbere prvi required step, ki ni completed in ima izpolnjene prerequisites.
        """

        steps = await self.learning_path_service.get_step_references_for_learning_path(
            learning_path_id
        )

        completed_step_ids = set(completed_module_ids + completed_learning_unit_ids)

        for step in self._get_dict_list_value(steps):
            if not step.get("is_required", True):
                continue

            step_type = step.get("type")
            ref_id = step.get("ref_id")

            if not isinstance(ref_id, str) or not ref_id:
                continue

            if ref_id in completed_step_ids:
                continue

            prerequisites = self._get_string_list_value(
                step.get("prerequisites")
            )

            prerequisites_completed = all(
                prerequisite_id in completed_step_ids
                for prerequisite_id in prerequisites
            )

            if not prerequisites_completed:
                continue

            if step_type == "module":
                return {
                    "learning_path_id": learning_path_id,
                    "current_module_id": ref_id,
                    "current_learning_unit_id": await self._get_first_available_learning_unit_in_module(
                        module_id=ref_id,
                        completed_learning_unit_ids=completed_learning_unit_ids,
                    ),
                }

            if step_type == "learning_unit":
                return {
                    "learning_path_id": learning_path_id,
                    "current_module_id": None,
                    "current_learning_unit_id": ref_id,
                }

        return {
            "learning_path_id": learning_path_id,
            "current_module_id": None,
            "current_learning_unit_id": None,
        }

    async def _get_first_available_learning_unit_in_module(
        self,
        module_id: str,
        completed_learning_unit_ids: List[str],
    ) -> Optional[str]:
        """
        Vrne prvo nedokončano učno enoto znotraj modula,
        ki ima izpolnjene prerequisites.
        """

        learning_unit_references = await self.module_service.get_learning_unit_references_for_module(
            module_id
        )

        completed_learning_unit_set = set(completed_learning_unit_ids)

        for reference in self._get_dict_list_value(learning_unit_references):
            learning_unit_id = reference.get("learning_unit_id")

            if not isinstance(learning_unit_id, str) or not learning_unit_id:
                continue

            if learning_unit_id in completed_learning_unit_set:
                continue

            prerequisites = self._get_string_list_value(
                reference.get("prerequisites")
            )

            prerequisites_completed = all(
                prerequisite_id in completed_learning_unit_set
                for prerequisite_id in prerequisites
            )

            if prerequisites_completed:
                return learning_unit_id

        return None

    def _sync_result_with_completed_progress(
        self,
        result: Dict[str, Any],
        completed_learning_unit_ids: List[str],
        completed_module_ids: List[str],
    ) -> Dict[str, Any]:
        """
        Uskladi assessment response z že shranjenim completed progressom.

        AssessmentService oceni trenutno poslane odgovore. Pri partial submitu lahko zato
        vrne, da so stare enote/moduli not_started, čeprav so že completed v users.progress.

        Ta metoda poskrbi, da končni response vedno upošteva realno stanje progressa.
        """

        completed_learning_unit_set = set(completed_learning_unit_ids)
        completed_module_set = set(completed_module_ids)

        synced_learning_unit_results: List[Dict[str, Any]] = []

        for unit_result in self._get_dict_list_value(
            result.get("learning_unit_results")
        ):
            synced_unit_result = dict(unit_result)
            learning_unit_id = synced_unit_result.get("learning_unit_id")

            if (
                isinstance(learning_unit_id, str)
                and learning_unit_id in completed_learning_unit_set
            ):
                synced_unit_result["is_completed_by_assessment"] = True

                known_topic_ids = self._get_string_list_value(
                    synced_unit_result.get("known_topic_ids")
                )
                missing_topic_ids = self._get_string_list_value(
                    synced_unit_result.get("missing_topic_ids")
                )

                synced_unit_result["known_topic_ids"] = self._merge_unique_strings(
                    known_topic_ids,
                    missing_topic_ids,
                )
                synced_unit_result["missing_topic_ids"] = []

                known_competency_codes = self._get_string_list_value(
                    synced_unit_result.get("known_competency_codes")
                )
                missing_competency_codes = self._get_string_list_value(
                    synced_unit_result.get("missing_competency_codes")
                )

                synced_unit_result["known_competency_codes"] = self._merge_unique_strings(
                    known_competency_codes,
                    missing_competency_codes,
                )
                synced_unit_result["missing_competency_codes"] = []

            synced_learning_unit_results.append(synced_unit_result)

        result["learning_unit_results"] = synced_learning_unit_results

        synced_module_results: List[Dict[str, Any]] = []

        for module_result in self._get_dict_list_value(
            result.get("module_results")
        ):
            synced_module_result = dict(module_result)
            module_id = synced_module_result.get("module_id")

            completed_learning_units = self._get_string_list_value(
                synced_module_result.get("completed_learning_units")
            )
            missing_learning_units = self._get_string_list_value(
                synced_module_result.get("missing_learning_units")
            )

            newly_completed_learning_units = [
                learning_unit_id
                for learning_unit_id in missing_learning_units
                if learning_unit_id in completed_learning_unit_set
            ]

            synced_completed_learning_units = self._merge_unique_strings(
                completed_learning_units,
                newly_completed_learning_units,
            )

            synced_missing_learning_units = [
                learning_unit_id
                for learning_unit_id in missing_learning_units
                if learning_unit_id not in completed_learning_unit_set
            ]

            synced_module_result["completed_learning_units"] = synced_completed_learning_units
            synced_module_result["missing_learning_units"] = synced_missing_learning_units

            if (
                isinstance(module_id, str)
                and module_id in completed_module_set
            ):
                synced_module_result["status"] = AssessmentStatus.COMPLETED.value
                synced_module_result["completed_learning_units"] = self._merge_unique_strings(
                    synced_completed_learning_units,
                    synced_missing_learning_units,
                )
                synced_module_result["missing_learning_units"] = []
            elif synced_completed_learning_units and not synced_missing_learning_units:
                synced_module_result["status"] = AssessmentStatus.COMPLETED.value
            elif synced_completed_learning_units:
                synced_module_result["status"] = AssessmentStatus.PARTIALLY_COMPLETED.value
            else:
                synced_module_result["status"] = AssessmentStatus.NOT_STARTED.value

            synced_module_results.append(synced_module_result)

        result["module_results"] = synced_module_results

        result["skipped_learning_units"] = self._merge_unique_strings(
            self._get_string_list_value(result.get("skipped_learning_units")),
            completed_learning_unit_ids,
        )

        result["skipped_modules"] = self._merge_unique_strings(
            self._get_string_list_value(result.get("skipped_modules")),
            completed_module_ids,
        )

        result["recommended_next_learning_units"] = [
            learning_unit_id
            for learning_unit_id in self._get_string_list_value(
                result.get("recommended_next_learning_units")
            )
            if learning_unit_id not in completed_learning_unit_set
        ]

        result["recommended_next_modules"] = [
            module_id
            for module_id in self._get_string_list_value(
                result.get("recommended_next_modules")
            )
            if module_id not in completed_module_set
        ]

        start_learning_unit_id = result.get("start_learning_unit_id")

        if (
            isinstance(start_learning_unit_id, str)
            and start_learning_unit_id in completed_learning_unit_set
        ):
            current_position = result.get("current_position")

            if isinstance(current_position, dict):
                result["start_learning_unit_id"] = current_position.get(
                    "current_learning_unit_id"
                )
                result["start_module_id"] = current_position.get(
                    "current_module_id"
                )
            else:
                result["start_learning_unit_id"] = None

        start_module_id = result.get("start_module_id")

        if (
            isinstance(start_module_id, str)
            and start_module_id in completed_module_set
        ):
            current_position = result.get("current_position")

            if isinstance(current_position, dict):
                result["start_module_id"] = current_position.get(
                    "current_module_id"
                )
                result["start_learning_unit_id"] = current_position.get(
                    "current_learning_unit_id"
                )
            else:
                result["start_module_id"] = None

        current_position = result.get("current_position")

        if isinstance(current_position, dict):
            current_module_id = current_position.get("current_module_id")
            current_learning_unit_id = current_position.get("current_learning_unit_id")

            if (
                isinstance(current_module_id, str)
                and current_module_id not in completed_module_set
                and current_module_id not in result["recommended_next_modules"]
            ):
                result["recommended_next_modules"].append(current_module_id)

            if (
                isinstance(current_learning_unit_id, str)
                and current_learning_unit_id not in completed_learning_unit_set
                and current_learning_unit_id not in result["recommended_next_learning_units"]
            ):
                result["recommended_next_learning_units"].append(current_learning_unit_id)

        return result

    def _clear_next_recommendations_if_learning_path_completed(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str,
        completed_learning_path_ids: List[str],
        result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Počisti next recommendation podatke, če je learning path že completed.

        AssessmentService lahko še vedno zazna optional module kot naslednji možni korak.
        To je koristno za interno analizo, ampak v končnem response-u ne želimo prikazati
        optional modula kot obveznega naslednjega koraka, če je učna pot že zaključena.
        """

        if target_type != QuestionnaireTargetType.LEARNING_PATH:
            return result

        if target_id not in completed_learning_path_ids:
            return result

        result["start_module_id"] = None
        result["start_learning_unit_id"] = None
        result["recommended_next_modules"] = []
        result["recommended_next_learning_units"] = []
        result["summary"] = (
            f"Uporabnik je glede na odgovore zaključil učno pot {target_id}."
        )

        return result

    def _get_answer_key(
        self,
        value: Dict[str, Any],
    ) -> Optional[str]:
        """
        Vrne ključ za povezovanje vprašanja in odgovora.

        Najprej uporabimo question_id ali id.
        Če tega ni, uporabimo normalizirano besedilo vprašanja.
        """

        question_id = value.get("question_id") or value.get("id")

        if isinstance(question_id, str) and question_id.strip():
            return f"id:{question_id.strip()}"

        question_text = value.get("question")

        if isinstance(question_text, str) and question_text.strip():
            return f"question:{self._normalize_question_text(question_text)}"

        return None

    def _merge_unique_strings(
        self,
        first_values: List[str],
        second_values: List[str],
    ) -> List[str]:
        """
        Združi dva seznama stringov brez podvajanja in ohrani vrstni red.
        """

        merged_values: List[str] = []

        for value in first_values + second_values:
            if not isinstance(value, str) or not value:
                continue

            if value not in merged_values:
                merged_values.append(value)

        return merged_values

    def _normalize_question_text(
        self,
        question: str,
    ) -> str:
        """
        Normalizira besedilo vprašanja za primerjavo.
        """

        return " ".join(question.strip().lower().split())

    def _get_question_type(
        self,
        question: Dict[str, Any],
    ) -> str:
        """
        Vrne tip vprašanja.

        Podpiramo question_type in type, ker JSON podatki
        za self_assessment_questions uporabljajo type.
        """

        question_type = question.get("question_type") or question.get("type")

        if isinstance(question_type, str) and question_type.strip():
            return question_type.strip()

        return "yes_no"

    def _get_dict_list_value(
        self,
        value: Any,
    ) -> List[Dict[str, Any]]:
        """
        Vrne varen seznam dict objektov.
        """

        if not isinstance(value, list):
            return []

        return [
            item
            for item in value
            if isinstance(item, dict)
        ]

    def _get_string_list_value(
        self,
        value: Any,
    ) -> List[str]:
        """
        Vrne varen seznam stringov.
        """

        if not isinstance(value, list):
            return []

        return [
            item.strip()
            for item in value
            if isinstance(item, str) and item.strip()
        ]

    def _get_target_type_value(
        self,
        target_type: QuestionnaireTargetType,
    ) -> str:
        """
        Vrne string vrednost target_type.

        To je uporabno, ker Pydantic enum lahko pride kot enum ali kot string.
        """

        if hasattr(target_type, "value"):
            return target_type.value

        return str(target_type)