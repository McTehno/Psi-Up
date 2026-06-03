from typing import Any, Dict, List, Optional

from app.schemas.questionnaire_schema import QuestionnaireTargetType


class QuestionnaireService:
    """
    Service za vprašalnike.

    Ta razred pripravi vprašalnik za učno pot, modul ali učno enoto.
    Vprašanja se zbirajo iz self_assessment_questions znotraj učnih enot.

    Pomembno:
    - uporabniku se isto vprašanje prikaže samo enkrat,
    - backend pa pri tem vprašanju ohrani vse vire oziroma sources,
      kjer se vprašanje pojavi,
    - zato se odgovor lahko kasneje uporabi za vse povezane učne enote,
      topic-e in kompetence.
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

    def _normalize_question_text(
        self,
        question: Any,
    ) -> str:
        """
        Normalizira besedilo vprašanja za deduplikacijo.

        Namen:
        - odstrani presledke na začetku in koncu,
        - pretvori v male črke,
        - več zaporednih presledkov združi v en presledek.

        Primer:
        "  Znam uporabljati Excel.  "
        -> "znam uporabljati excel."
        """

        if not isinstance(question, str):
            return ""

        return " ".join(question.strip().lower().split())
    def _get_optional_int_value(
        self,
        value: Any,
    ) -> Optional[int]:
        """
        Vrne optional integer vrednost.
        """

        if isinstance(value, int):
            return value

        return None


    def _get_bool_value(
        self,
        value: Any,
        fallback: bool = True,
    ) -> bool:
        """
        Vrne varno boolean vrednost.
        """

        if isinstance(value, bool):
            return value

        return fallback

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

    def _get_optional_string_value(
        self,
        value: Any,
    ) -> Optional[str]:
        """
        Vrne optional string vrednost.
        """

        if isinstance(value, str) and value.strip():
            return value.strip()

        return None

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

    def _build_question_source(
        self,
        question: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Zgradi en source za vprašanje.

        Source pove, kje se vprašanje pojavi:
        - v kateri učni poti,
        - v katerem modulu,
        - v kateri učni enoti,
        - pri katerem topicu,
        - pri katerih kompetencah.

        To omogoča, da se en odgovor uporabi za vse povezane vsebine.
        """

        return {
            "learning_path_id": self._get_optional_string_value(
                question.get("learning_path_id")
            ),
            "module_id": self._get_optional_string_value(
                question.get("module_id")
            ),
            "learning_unit_id": self._get_optional_string_value(
                question.get("learning_unit_id")
            ),
            "topic_id": self._get_optional_string_value(
                question.get("related_topic_id")
            ),
            "related_topic": self._get_optional_string_value(
                question.get("related_topic")
            ),
            "competency_codes": self._get_string_list_value(
                question.get("related_competency_codes")
            ),
            "order": self._get_optional_int_value(question.get("order")),
            "parallel_group": self._get_optional_string_value(
                question.get("parallel_group")
            ),
            "is_required": self._get_bool_value(
                question.get("is_required")
            ),
            "prerequisites": self._get_string_list_value(
                question.get("prerequisites")
            ),
        }

    def _normalize_question(
        self,
        question: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira eno vprašanje za response vprašalnika.

        Tip vprašanja ostane fleksibilen, ker bodo vprašanja v prihodnosti
        lahko imela tudi druge tipe, ne samo yes_no.
        """

        if not isinstance(question, dict):
            return None

        question_id = self._get_string_value(question.get("id"))
        question_text = self._get_string_value(question.get("question"))

        if not question_id or not question_text:
            return None

        type = self._get_string_value(
            question.get("type"),
            fallback="yes_no",
        )

        if not type:
            type = "yes_no"

        related_competency_codes = self._get_string_list_value(
            question.get("related_competency_codes")
        )

        return {
            "id": question_id,
            "question": question_text,
            "type": type,
            "learning_path_id": self._get_optional_string_value(
                question.get("learning_path_id")
            ),
            "module_id": self._get_optional_string_value(
                question.get("module_id")
            ),
            "learning_unit_id": self._get_optional_string_value(
                question.get("learning_unit_id")
            ),
            "order": self._get_optional_int_value(question.get("order")
            ),
            "parallel_group": self._get_optional_string_value(
                question.get("parallel_group")
            ),
            "is_required": self._get_bool_value(
                question.get("is_required")
            ),
            "prerequisites": self._get_string_list_value(
                question.get("prerequisites")
            ),
            "related_topic": self._get_optional_string_value(
                question.get("related_topic")
            ),
            "related_topic_id": self._get_optional_string_value(
                question.get("related_topic_id")
            ),
            "related_competency_codes": related_competency_codes,
            "sources": [
                self._build_question_source(question)
            ],
        }

    def _merge_question_sources(
        self,
        existing_question: Dict[str, Any],
        duplicate_question: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Pri podvojenem vprašanju ne dodamo novega vprašanja v prikaz,
        ampak dodamo njegov source k že obstoječemu vprašanju.

        Tako uporabnik vidi vprašanje samo enkrat,
        backend pa ne izgubi povezav na ostale učne enote/topic-e.
        """

        existing_sources = existing_question.get("sources", [])

        if not isinstance(existing_sources, list):
            existing_sources = []

        duplicate_sources = duplicate_question.get("sources", [])

        if not isinstance(duplicate_sources, list):
            duplicate_sources = []

        existing_sources.extend(duplicate_sources)

        existing_question["sources"] = existing_sources

        return existing_question

    def _deduplicate_questions_with_sources(
        self,
        questions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Deduplicira vprašanja po normalizirani vsebini vprašanja.

        Če se isto vprašanje pojavi večkrat:
        - v prikazu ostane samo prvo vprašanje,
        - vsi ostali pojavi se dodajo v sources.
        """

        question_map: Dict[str, Dict[str, Any]] = {}

        for question in questions:
            normalized_question = self._normalize_question_text(
                question.get("question")
            )

            if not normalized_question:
                continue

            if normalized_question not in question_map:
                question_map[normalized_question] = question
                continue

            question_map[normalized_question] = self._merge_question_sources(
                existing_question=question_map[normalized_question],
                duplicate_question=question,
            )

        return list(question_map.values())

    def _normalize_questions(
        self,
        questions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira in deduplicira seznam vprašanj.

        Najprej odstranimo neveljavna vprašanja,
        nato podvojena vprašanja združimo po vsebini in ohranimo sources.
        """

        normalized_questions: List[Dict[str, Any]] = []

        for question in questions:
            normalized_question = self._normalize_question(question)

            if normalized_question:
                normalized_questions.append(normalized_question)

        return self._deduplicate_questions_with_sources(normalized_questions)

    async def generate_questionnaire(
        self,
        target_type: QuestionnaireTargetType,
        target_id: str,
        latest_explicit_answers: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za izbrano vsebino.
        """

        if target_type == QuestionnaireTargetType.LEARNING_PATH:
            return await self._generate_for_learning_path(
                learning_path_id=target_id,
                latest_explicit_answers=latest_explicit_answers,
            )

        if target_type == QuestionnaireTargetType.MODULE:
            return await self._generate_for_module(
                module_id=target_id,
                latest_explicit_answers=latest_explicit_answers,
            )

        if target_type == QuestionnaireTargetType.LEARNING_UNIT:
            return await self._generate_for_learning_unit(
                learning_unit_id=target_id,
                latest_explicit_answers=latest_explicit_answers,
            )

        return None

    async def _generate_for_learning_path(
        self,
        learning_path_id: str,
        latest_explicit_answers: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za učno pot.

        Učna pot lahko vsebuje steps tipa:
        - module,
        - learning_unit.

        LearningPathService poskrbi, da se vprašanja zberejo iz obeh tipov.
        """

        learning_path = await self.learning_path_service.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return None

        questions = await self.learning_path_service.get_self_assessment_questions_for_learning_path(
            learning_path_id
        )

        normalized_questions = self._normalize_questions(questions)
        normalized_questions = self._apply_answer_prefill(
            questions=normalized_questions,
            latest_explicit_answers=latest_explicit_answers,
        )
        return {
            "target_type": QuestionnaireTargetType.LEARNING_PATH,
            "target_id": learning_path_id,
            "title": learning_path.get("title"),
            "questions": normalized_questions,
        }

    async def _generate_for_module(
        self,
        module_id: str,
        latest_explicit_answers: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za modul.

        Vprašanja se zberejo iz vseh učnih enot znotraj modula.
        Če se isto vprašanje pojavi večkrat, se prikaže samo enkrat,
        sources pa hranijo vse povezane učne enote/topic-e.
        """

        module = await self.module_service.get_module_by_id(module_id)

        if not module:
            return None

        questions = await self.module_service.get_self_assessment_questions_for_module(
            module_id
        )

        normalized_questions = self._normalize_questions(questions)

        normalized_questions = self._apply_answer_prefill(
            questions=normalized_questions,
            latest_explicit_answers=latest_explicit_answers,
        )

        return {
            "target_type": QuestionnaireTargetType.MODULE,
            "target_id": module_id,
            "title": module.get("title"),
            "questions": normalized_questions,
        }

    async def _generate_for_learning_unit(
        self,
        learning_unit_id: str,
        latest_explicit_answers: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Ustvari vprašalnik za učno enoto.

        Vprašanja se vzamejo samo iz izbrane učne enote.
        """

        learning_unit = await self.learning_unit_service.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            return None

        questions = await self.learning_unit_service.get_self_assessment_questions(
            learning_unit_id
        )

        normalized_questions = self._normalize_questions(questions)
        normalized_questions = self._apply_answer_prefill(
            questions=normalized_questions,
            latest_explicit_answers=latest_explicit_answers,
        )
        return {
            "target_type": QuestionnaireTargetType.LEARNING_UNIT,
            "target_id": learning_unit_id,
            "title": learning_unit.get("title"),
            "questions": normalized_questions,
        }
    def _get_answer_keys(
        self,
        value: Dict[str, Any],
    ) -> List[str]:
        """
        Vrne vse možne ključe za vprašanje.
        """

        keys: List[str] = []

        question_id = value.get("question_id") or value.get("id")

        if isinstance(question_id, str) and question_id.strip():
            keys.append(f"id:{question_id.strip()}")

        question_text = value.get("question")

        if isinstance(question_text, str) and question_text.strip():
            keys.append(f"question:{self._normalize_question_text(question_text)}")

        return keys
    
    def _get_answer_key(
        self,
        value: Dict[str, Any],
    ) -> Optional[str]:
        """
        Vrne ključ za povezovanje vprašanja in odgovora.

        Najprej uporabimo id/question_id.
        Če tega ni, uporabimo normalizirano besedilo vprašanja.
        """

        question_id = value.get("question_id") or value.get("id")

        if isinstance(question_id, str) and question_id.strip():
            return f"id:{question_id.strip()}"

        question_text = value.get("question")

        if isinstance(question_text, str) and question_text.strip():
            return f"question:{self._normalize_question_text(question_text)}"

        return None
    
    def _apply_answer_prefill(
        self,
        questions: List[Dict[str, Any]],
        latest_explicit_answers: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Doda prefill podatke na vprašanja glede na zadnje eksplicitne odgovore.
        """

        latest_explicit_answers = latest_explicit_answers or {}

        prefilled_questions: List[Dict[str, Any]] = []

        for question in questions:
            prepared_question = dict(question)
            keys = self._get_answer_keys(prepared_question)

            latest_answer = None

            for key in keys:
                if key in latest_explicit_answers:
                    latest_answer = latest_explicit_answers[key]
                    break

            if latest_answer:
                prepared_question["answer"] = latest_answer.get("answer")
                prepared_question["is_prefilled"] = True
                prepared_question["prefill_source"] = "last_answer"
            else:
                prepared_question["answer"] = None
                prepared_question["is_prefilled"] = False
                prepared_question["prefill_source"] = None

            prefilled_questions.append(prepared_question)

        return prefilled_questions