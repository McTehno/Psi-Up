from typing import Any, Dict, List, Optional

from app.schemas.assessment_schema import AssessmentStatus
from app.schemas.questionnaire_schema import QuestionnaireTargetType


class AssessmentService:
    """
    Service za ocenjevanje odgovorov iz vprašalnika.

    Ta razred določi, katere učne enote oziroma moduli so že pokriti
    in kje naj uporabnik začne glede na odgovore.

    Pomembno:
    - vprašanja se lahko v vprašalniku prikažejo samo enkrat,
      čeprav pripadajo več učnim enotam,
    - zato odgovor povezujemo tudi po normalizirani vsebini vprašanja,
      ne samo po question_id,
    - uporabljamo topic_id in competency_codes, ne več samo besedila topic-a.
    """

    def __init__(
        self,
        learning_path_service: Any,
        module_service: Any,
        learning_unit_service: Any,
    ):
        """
        Inicializira service z odvisnimi service-i za učne poti, module in učne enote.
        """

        self.learning_path_service = learning_path_service
        self.module_service = module_service
        self.learning_unit_service = learning_unit_service

    def _get_list_value(
        self,
        value: Any,
    ) -> List[Any]:
        """
        Vrne varno list vrednost.
        """

        if isinstance(value, list):
            return value

        return []

    def _get_string_value(
        self,
        value: Any,
        fallback: str = "",
    ) -> str:
        """
        Vrne varno string vrednost.
        """

        if isinstance(value, str):
            return value.strip()

        return fallback

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

    def _normalize_question_text(
        self,
        question: Any,
    ) -> str:
        """
        Normalizira besedilo vprašanja.

        To uporabljamo zato, da en odgovor velja tudi za isto vprašanje,
        ki se pojavi v več učnih enotah.
        """

        if not isinstance(question, str):
            return ""

        return " ".join(question.strip().lower().split())

    def _add_unique(
        self,
        target: List[str],
        values: List[str],
    ) -> None:
        """
        V seznam doda vrednosti brez podvajanja.
        """

        for value in values:
            if value not in target:
                target.append(value)

    def _build_answer_maps(
        self,
        answers: List[Dict[str, Any]],
    ) -> Dict[str, Dict[str, Any]]:
        """
        Zgradi dva lookup-a za odgovore:
        - po question_id,
        - po normalizirani vsebini vprašanja.

        To je pomembno, ker se lahko isto vprašanje pojavi v več učnih enotah.
        Če je frontend poslal samo eno prikazano vprašanje, ga še vedno najdemo
        za vse enote z isto vsebino vprašanja.
        """

        by_question_id: Dict[str, Any] = {}
        by_question_text: Dict[str, Any] = {}

        for answer in self._get_list_value(answers):
            if not isinstance(answer, dict):
                continue

            question_id = self._get_string_value(answer.get("question_id"))
            question_text = self._normalize_question_text(answer.get("question"))

            answer_value = answer.get("answer")

            if question_id:
                by_question_id[question_id] = answer_value

            if question_text:
                by_question_text[question_text] = answer_value

        return {
            "by_question_id": by_question_id,
            "by_question_text": by_question_text,
        }

    def _get_answer_for_question(
        self,
        question: Dict[str, Any],
        answer_maps: Dict[str, Dict[str, Any]],
    ) -> Any:
        """
        Vrne odgovor za vprašanje.

        Najprej poskusi po question_id.
        Če ga ni, poskusi še po normalizirani vsebini vprašanja.
        """

        question_id = self._get_string_value(question.get("id"))
        question_text = self._normalize_question_text(question.get("question"))

        by_question_id = answer_maps.get("by_question_id", {})
        by_question_text = answer_maps.get("by_question_text", {})

        if question_id in by_question_id:
            return by_question_id.get(question_id)

        if question_text in by_question_text:
            return by_question_text.get(question_text)

        return None

    def _get_topic_id_from_topic(
        self,
        topic: Any,
    ) -> Optional[str]:
        """
        Vrne topic id iz content_topic objekta.
        """

        if not isinstance(topic, dict):
            return None

        topic_id = self._get_string_value(topic.get("id"))

        if topic_id:
            return topic_id

        return None

    def _get_topic_competency_codes(
        self,
        topic: Any,
    ) -> List[str]:
        """
        Vrne competency kode iz content_topic objekta.
        """

        if not isinstance(topic, dict):
            return []

        return self._get_string_list_value(topic.get("related_competency_codes"))

    def _get_all_topic_ids(
        self,
        content_topics: List[Any],
    ) -> List[str]:
        """
        Vrne vse topic_id-je iz content_topics.
        """

        topic_ids: List[str] = []

        for topic in self._get_list_value(content_topics):
            topic_id = self._get_topic_id_from_topic(topic)

            if topic_id and topic_id not in topic_ids:
                topic_ids.append(topic_id)

        return topic_ids

    def _get_all_topic_competency_codes(
        self,
        content_topics: List[Any],
    ) -> List[str]:
        """
        Vrne vse competency kode iz content_topics.
        """

        competency_codes: List[str] = []

        for topic in self._get_list_value(content_topics):
            self._add_unique(
                competency_codes,
                self._get_topic_competency_codes(topic),
            )

        return competency_codes

    async def evaluate_answers(
        self,
        user_id: str,
        target_type: QuestionnaireTargetType,
        target_id: str,
        answers: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Oceni odgovore uporabnika in določi začetno točko.

        Logika:
        - true pomeni, da uporabnik temo zna oziroma potrdi,
        - false pomeni, da uporabniku tema manjka,
        - učna enota je opravljena, če nima manjkajočih topicov.
        """

        if target_type == QuestionnaireTargetType.LEARNING_PATH:
            return await self._evaluate_learning_path(
                user_id=user_id,
                learning_path_id=target_id,
                answers=answers,
            )

        if target_type == QuestionnaireTargetType.MODULE:
            return await self._evaluate_module(
                user_id=user_id,
                module_id=target_id,
                answers=answers,
            )

        if target_type == QuestionnaireTargetType.LEARNING_UNIT:
            return await self._evaluate_learning_unit(
                user_id=user_id,
                learning_unit_id=target_id,
                answers=answers,
                use_progressive_logic=False,
            )

        return self._empty_result(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            summary="Neznan tip vsebine za ocenjevanje.",
        )

    async def _evaluate_learning_path(
        self,
        user_id: str,
        learning_path_id: str,
        answers: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za celotno učno pot.

        Nova struktura učne poti uporablja steps.
        Step je lahko:
        - module,
        - learning_unit.

        Začetna točka je prvi step, ki še ni opravljen in ima izpolnjene prerequisites.
        """

        learning_path = await self.learning_path_service.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.LEARNING_PATH,
                target_id=learning_path_id,
                summary="Učna pot ne obstaja.",
            )

        steps = await self.learning_path_service.get_step_references_for_learning_path(
            learning_path_id
        )

        skipped_modules: List[str] = []
        skipped_learning_units: List[str] = []
        recommended_next_modules: List[str] = []
        recommended_next_learning_units: List[str] = []

        learning_unit_results: List[Dict[str, Any]] = []
        module_results: List[Dict[str, Any]] = []

        known_competency_codes: List[str] = []
        missing_competency_codes: List[str] = []

        start_module_id: Optional[str] = None
        start_learning_unit_id: Optional[str] = None

        completed_step_ids: List[str] = []

        for step in steps:
            step_type = step.get("type")
            ref_id = step.get("ref_id")

            if not ref_id:
                continue

            if step_type == "module":
                step_result = await self._evaluate_module(
                    user_id=user_id,
                    module_id=ref_id,
                    answers=answers,
                )

                module_results.extend(step_result.get("module_results", []))
                learning_unit_results.extend(step_result.get("learning_unit_results", []))

                skipped_modules.extend(step_result.get("skipped_modules", []))
                skipped_learning_units.extend(
                    step_result.get("skipped_learning_units", [])
                )

                self._add_unique(
                    known_competency_codes,
                    step_result.get("known_competency_codes", []),
                )
                self._add_unique(
                    missing_competency_codes,
                    step_result.get("missing_competency_codes", []),
                )

                is_completed = ref_id in step_result.get("skipped_modules", [])

                if is_completed:
                    completed_step_ids.append(ref_id)
                    continue

                if start_module_id is None and start_learning_unit_id is None:
                    prerequisites = self._get_string_list_value(
                        step.get("prerequisites")
                    )

                    prerequisites_completed = all(
                        prerequisite_id in completed_step_ids
                        for prerequisite_id in prerequisites
                    )

                    if prerequisites_completed:
                        start_module_id = ref_id
                        start_learning_unit_id = step_result.get(
                            "start_learning_unit_id"
                        )
                        recommended_next_modules.append(ref_id)

                        if start_learning_unit_id:
                            recommended_next_learning_units.append(
                                start_learning_unit_id
                            )

            elif step_type == "learning_unit":
                step_result = await self._evaluate_learning_unit(
                    user_id=user_id,
                    learning_unit_id=ref_id,
                    answers=answers,
                    use_progressive_logic=True,
                )

                learning_unit_results.extend(step_result.get("learning_unit_results", []))
                skipped_learning_units.extend(
                    step_result.get("skipped_learning_units", [])
                )

                self._add_unique(
                    known_competency_codes,
                    step_result.get("known_competency_codes", []),
                )
                self._add_unique(
                    missing_competency_codes,
                    step_result.get("missing_competency_codes", []),
                )

                is_completed = ref_id in step_result.get("skipped_learning_units", [])

                if is_completed:
                    completed_step_ids.append(ref_id)
                    continue

                if start_module_id is None and start_learning_unit_id is None:
                    prerequisites = self._get_string_list_value(
                        step.get("prerequisites")
                    )

                    prerequisites_completed = all(
                        prerequisite_id in completed_step_ids
                        for prerequisite_id in prerequisites
                    )

                    if prerequisites_completed:
                        start_learning_unit_id = ref_id
                        recommended_next_learning_units.append(ref_id)

        self._add_unique(
            missing_competency_codes,
            [
                code
                for code in missing_competency_codes
                if code not in known_competency_codes
            ],
        )

        missing_competency_codes = [
            code
            for code in missing_competency_codes
            if code not in known_competency_codes
        ]

        if start_module_id is None and start_learning_unit_id is None:
            summary = "Uporabnik je glede na odgovore pokril vse korake v učni poti."
        elif start_module_id:
            summary = f"Uporabnik naj začne pri modulu {start_module_id}."
        else:
            summary = f"Uporabnik naj začne pri učni enoti {start_learning_unit_id}."

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
            "known_competency_codes": known_competency_codes,
            "missing_competency_codes": missing_competency_codes,
            "learning_unit_results": learning_unit_results,
            "module_results": module_results,
            "summary": summary,
        }

    async def _evaluate_module(
        self,
        user_id: str,
        module_id: str,
        answers: List[Dict[str, Any]],
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
                summary="Modul ne obstaja.",
            )

        learning_unit_references = await self.module_service.get_learning_unit_references_for_module(
            module_id
        )

        completed_learning_units: List[str] = []
        missing_learning_units: List[str] = []
        skipped_learning_units: List[str] = []
        recommended_next_learning_units: List[str] = []

        learning_unit_results: List[Dict[str, Any]] = []

        known_competency_codes: List[str] = []
        missing_competency_codes: List[str] = []

        start_learning_unit_id: Optional[str] = None

        for learning_unit_reference in learning_unit_references:
            learning_unit_id = learning_unit_reference.get("learning_unit_id")

            if not learning_unit_id:
                continue

            unit_result = await self._evaluate_learning_unit(
                user_id=user_id,
                learning_unit_id=learning_unit_id,
                answers=answers,
                use_progressive_logic=True,
            )

            unit_results = unit_result.get("learning_unit_results", [])
            learning_unit_results.extend(unit_results)

            self._add_unique(
                known_competency_codes,
                unit_result.get("known_competency_codes", []),
            )
            self._add_unique(
                missing_competency_codes,
                unit_result.get("missing_competency_codes", []),
            )

            is_completed = False

            if unit_results:
                is_completed = unit_results[0].get(
                    "is_completed_by_assessment",
                    False,
                )

            if is_completed:
                completed_learning_units.append(learning_unit_id)
                skipped_learning_units.append(learning_unit_id)
                continue

            missing_learning_units.append(learning_unit_id)

            if start_learning_unit_id is None:
                prerequisites = self._get_string_list_value(
                    learning_unit_reference.get("prerequisites")
                )

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
            if item.get("is_required", True) and item.get("learning_unit_id")
        ]

        required_completed = all(
            learning_unit_id in completed_learning_units
            for learning_unit_id in required_learning_units
        )

        missing_competency_codes = [
            code
            for code in missing_competency_codes
            if code not in known_competency_codes
        ]

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
            "known_competency_codes": known_competency_codes,
            "missing_competency_codes": missing_competency_codes,
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
        answers: List[Dict[str, Any]],
        use_progressive_logic: bool = False,
    ) -> Dict[str, Any]:
        """
        Oceni odgovore za eno učno enoto.

        Pri ocenjevanju posamezne učne enote se ocenjujejo content_topics.

        Če je use_progressive_logic=True:
        - prvo vprašanje učne enote obravnavamo kot osnovno vprašanje,
        - če je odgovor false, se učna enota šteje kot nepokrita,
        - vsi topic-i učne enote se štejejo kot missing_topic_ids.
        """

        learning_unit = await self.learning_unit_service.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            return self._empty_result(
                user_id=user_id,
                target_type=QuestionnaireTargetType.LEARNING_UNIT,
                target_id=learning_unit_id,
                summary="Učna enota ne obstaja.",
            )

        questions = self._get_list_value(
            learning_unit.get("self_assessment_questions")
        )
        content_topics = self._get_list_value(
            learning_unit.get("content_topics")
        )

        answer_maps = self._build_answer_maps(answers)

        known_topic_ids: List[str] = []
        missing_topic_ids: List[str] = []

        known_competency_codes: List[str] = []
        missing_competency_codes: List[str] = []

        all_topic_ids = self._get_all_topic_ids(content_topics)
        all_competency_codes = self._get_all_topic_competency_codes(content_topics)

        if use_progressive_logic and questions:
            primary_question = questions[0]
            primary_answer = self._get_answer_for_question(
                question=primary_question,
                answer_maps=answer_maps,
            )

            if primary_answer is False:
                missing_topic_ids = all_topic_ids
                missing_competency_codes = all_competency_codes

                return {
                    "user_id": user_id,
                    "target_type": QuestionnaireTargetType.LEARNING_UNIT,
                    "target_id": learning_unit_id,
                    "start_module_id": None,
                    "start_learning_unit_id": learning_unit_id,
                    "skipped_modules": [],
                    "skipped_learning_units": [],
                    "recommended_next_modules": [],
                    "recommended_next_learning_units": [learning_unit_id],
                    "known_competency_codes": [],
                    "missing_competency_codes": missing_competency_codes,
                    "learning_unit_results": [
                        {
                            "learning_unit_id": learning_unit_id,
                            "known_topic_ids": [],
                            "missing_topic_ids": missing_topic_ids,
                            "known_competency_codes": [],
                            "missing_competency_codes": missing_competency_codes,
                            "is_completed_by_assessment": False,
                        }
                    ],
                    "module_results": [],
                    "summary": f"Uporabniku priporočamo učno enoto {learning_unit_id}.",
                }

        for question in questions:
            topic_id = self._get_string_value(
                question.get("related_topic_id")
            )
            competency_codes = self._get_string_list_value(
                question.get("related_competency_codes")
            )

            if not topic_id:
                continue

            answer_value = self._get_answer_for_question(
                question=question,
                answer_maps=answer_maps,
            )

            if answer_value is True:
                self._add_unique(known_topic_ids, [topic_id])
                self._add_unique(known_competency_codes, competency_codes)
            else:
                self._add_unique(missing_topic_ids, [topic_id])
                self._add_unique(missing_competency_codes, competency_codes)

        for topic in content_topics:
            topic_id = self._get_topic_id_from_topic(topic)

            if not topic_id:
                continue

            if topic_id not in known_topic_ids and topic_id not in missing_topic_ids:
                missing_topic_ids.append(topic_id)

                self._add_unique(
                    missing_competency_codes,
                    self._get_topic_competency_codes(topic),
                )

        missing_competency_codes = [
            code
            for code in missing_competency_codes
            if code not in known_competency_codes
        ]

        is_completed_by_assessment = bool(content_topics) and len(missing_topic_ids) == 0

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
            "known_competency_codes": known_competency_codes,
            "missing_competency_codes": missing_competency_codes,
            "learning_unit_results": [
                {
                    "learning_unit_id": learning_unit_id,
                    "known_topic_ids": known_topic_ids,
                    "missing_topic_ids": missing_topic_ids,
                    "known_competency_codes": known_competency_codes,
                    "missing_competency_codes": missing_competency_codes,
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
        summary: Optional[str] = None,
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
            "known_competency_codes": [],
            "missing_competency_codes": [],
            "learning_unit_results": [],
            "module_results": [],
            "summary": summary,
        }