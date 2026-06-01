from typing import Any, Dict, List, Optional


class LearningUnitService:
    """
    Service za učne enote.

    Ta razred vsebuje poslovno logiko za delo z učnimi enotami.
    Uporablja LearningUnitRepository za dostop do podatkov.

    Pomembno:
    MongoDB lahko vsebuje nepopolne ali delno napačne dokumente.
    FastAPI pa pred vračanjem response-a preveri response_model.
    Če service vrne None za polje, kjer schema pričakuje string ali list,
    lahko pride do ResponseValidationError.

    Zato v tem service-u normaliziramo podatke pred vračanjem.
    Cilj ni spremeniti podatkov v bazi, ampak zagotoviti stabilen API response.
    """

    def __init__(
        self,
        learning_unit_repository: Any,
        module_repository: Optional[Any] = None,
    ):
        """
        Inicializira service z repository-jem za učne enote.

        Opcijsko prejme tudi repository za module, kadar service potrebuje
        povezane module za detail prikaz učne enote.
        """

        self.learning_unit_repository = learning_unit_repository
        self.module_repository = module_repository

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

    def _normalize_content_topic(
        self,
        topic: Any,
        learning_unit_id: str,
        index: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira en content topic.

        Nova struktura pričakuje:
        {
            "id": "topic_ue_001_001",
            "title": "...",
            "related_competency_codes": ["1.2"]
        }

        Zaradi varnosti začasno podpremo tudi staro obliko string.
        """

        if isinstance(topic, str) and topic.strip():
            topic_number = index + 1

            return {
                "id": f"topic_{learning_unit_id}_{topic_number:03d}",
                "title": topic.strip(),
                "related_competency_codes": [],
            }

        if not isinstance(topic, dict):
            return None

        topic_id = self._get_string_value(topic.get("id"))
        title = self._get_string_value(topic.get("title"))

        if not title:
            return None

        if not topic_id:
            topic_number = index + 1
            topic_id = f"topic_{learning_unit_id}_{topic_number:03d}"

        return {
            "id": topic_id,
            "title": title,
            "related_competency_codes": self._get_string_list_value(
                topic.get("related_competency_codes")
            ),
        }

    def _normalize_content_topics(
        self,
        topics: Any,
        learning_unit_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam content topicov.
        """

        normalized_topics: List[Dict[str, Any]] = []

        for index, topic in enumerate(self._get_list_value(topics)):
            normalized_topic = self._normalize_content_topic(
                topic=topic,
                learning_unit_id=learning_unit_id,
                index=index,
            )

            if normalized_topic:
                normalized_topics.append(normalized_topic)

        return normalized_topics

    def _build_topic_lookup(
        self,
        content_topics: List[Dict[str, Any]],
    ) -> Dict[str, Dict[str, Any]]:
        """
        Zgradi lookup po topic id in topic title.

        To pomaga povezati vprašanja z ustreznim topicom.
        """

        topic_lookup: Dict[str, Dict[str, Any]] = {}

        for topic in content_topics:
            topic_id = topic.get("id")
            topic_title = topic.get("title")

            if isinstance(topic_id, str) and topic_id:
                topic_lookup[topic_id] = topic

            if isinstance(topic_title, str) and topic_title:
                topic_lookup[topic_title] = topic

        return topic_lookup

    def _normalize_self_assessment_question(
        self,
        question: Any,
        learning_unit_id: str,
        topic_lookup: Dict[str, Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira eno vprašanje za samooceno.

        Vprašanje povežemo z:
        - learning_unit_id,
        - related_topic_id,
        - related_topic,
        - related_competency_codes.
        """

        if not isinstance(question, dict):
            return None

        question_id = self._get_string_value(question.get("id"))
        question_text = self._get_string_value(question.get("question"))

        if not question_id or not question_text:
            return None

        question_type = self._get_string_value(
            question.get("type"),
            fallback="yes_no",
        )

        if not question_type:
            question_type = "yes_no"

        related_topic_id = self._get_optional_string_value(
            question.get("related_topic_id")
        )
        related_topic = self._get_optional_string_value(
            question.get("related_topic")
        )

        topic = None

        if related_topic_id and related_topic_id in topic_lookup:
            topic = topic_lookup[related_topic_id]

        if topic is None and related_topic and related_topic in topic_lookup:
            topic = topic_lookup[related_topic]

        if topic is not None:
            if not related_topic_id:
                related_topic_id = self._get_optional_string_value(topic.get("id"))

            if not related_topic:
                related_topic = self._get_optional_string_value(topic.get("title"))

        related_competency_codes = self._get_string_list_value(
            question.get("related_competency_codes")
        )

        if not related_competency_codes and topic is not None:
            related_competency_codes = self._get_string_list_value(
                topic.get("related_competency_codes")
            )

        return {
            "id": question_id,
            "question": question_text,
            "type": question_type,
            "learning_unit_id": learning_unit_id,
            "related_topic": related_topic,
            "related_topic_id": related_topic_id,
            "related_competency_codes": related_competency_codes,
        }

    def _normalize_self_assessment_questions(
        self,
        questions: Any,
        learning_unit_id: str,
        content_topics: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam vprašanj za samooceno.
        """

        topic_lookup = self._build_topic_lookup(content_topics)
        normalized_questions: List[Dict[str, Any]] = []

        for question in self._get_list_value(questions):
            normalized_question = self._normalize_self_assessment_question(
                question=question,
                learning_unit_id=learning_unit_id,
                topic_lookup=topic_lookup,
            )

            if normalized_question:
                normalized_questions.append(normalized_question)

        return normalized_questions

    def _normalize_learning_unit(
        self,
        learning_unit: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira dokument učne enote pred vračanjem API response-a.
        """

        normalized_learning_unit = dict(learning_unit)

        learning_unit_id = self._get_string_value(
            normalized_learning_unit.get("_id")
        )

        normalized_learning_unit["title"] = self._get_string_value(
            normalized_learning_unit.get("title")
        )
        normalized_learning_unit["short_description"] = self._get_string_value(
            normalized_learning_unit.get("short_description")
        )

        normalized_learning_unit["keywords"] = self._get_string_list_value(
            normalized_learning_unit.get("keywords")
        )

        normalized_content_topics = self._normalize_content_topics(
            topics=normalized_learning_unit.get("content_topics"),
            learning_unit_id=learning_unit_id,
        )

        normalized_learning_unit["content_topics"] = normalized_content_topics

        normalized_learning_unit["acquired_competencies"] = self._get_string_list_value(
            normalized_learning_unit.get("acquired_competencies")
        )
        normalized_learning_unit["digcomp_competencies"] = self._get_list_value(
            normalized_learning_unit.get("digcomp_competencies")
        )
        normalized_learning_unit["prerequisites"] = self._get_string_list_value(
            normalized_learning_unit.get("prerequisites")
        )

        normalized_learning_unit["self_assessment_questions"] = (
            self._normalize_self_assessment_questions(
                questions=normalized_learning_unit.get("self_assessment_questions"),
                learning_unit_id=learning_unit_id,
                content_topics=normalized_content_topics,
            )
        )

        return normalized_learning_unit

    def _normalize_learning_units(
        self,
        learning_units: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam učnih enot.
        """

        return [
            self._normalize_learning_unit(learning_unit)
            for learning_unit in learning_units
            if isinstance(learning_unit, dict)
        ]

    def _normalize_recommended_module(
        self,
        module: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira kratek prikaz modula za recommended_modules.
        """

        return {
            "_id": self._get_string_value(module.get("_id")),
            "title": self._get_string_value(module.get("title")),
            "short_description": self._get_string_value(
                module.get("short_description")
            ),
            "duration_hours": module.get("duration_hours"),
            "keywords": self._get_string_list_value(module.get("keywords")),
            "domains": self._get_string_list_value(module.get("domains")),
        }

    def _normalize_recommended_modules(
        self,
        modules: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam priporočenih modulov.
        """

        return [
            self._normalize_recommended_module(module)
            for module in modules
            if isinstance(module, dict)
        ]

    async def get_all_learning_units(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne enote.
        """

        learning_units = await self.learning_unit_repository.get_all_learning_units()

        return self._normalize_learning_units(learning_units)

    async def get_learning_unit_by_id(
        self,
        learning_unit_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno enoto glede na ID.
        """

        learning_unit = await self.learning_unit_repository.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            return None

        return self._normalize_learning_unit(learning_unit)

    async def get_learning_units_by_ids(
        self,
        learning_unit_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne več učnih enot glede na seznam ID-jev.
        """

        learning_units = await self.learning_unit_repository.get_learning_units_by_ids(
            learning_unit_ids
        )

        return self._normalize_learning_units(learning_units)

    async def get_learning_unit_detail(
        self,
        learning_unit_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti učne enote za detail page.

        Poleg osnovnih podatkov učne enote doda tudi priporočene module,
        ki vsebujejo to učno enoto.
        """

        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        if not learning_unit:
            return None

        recommended_modules: List[Dict[str, Any]] = []

        if self.module_repository is not None:
            modules = await self.module_repository.get_modules_by_learning_unit_id(
                learning_unit_id=learning_unit_id,
                limit=6,
            )
            recommended_modules = self._normalize_recommended_modules(modules)

        return {
            **learning_unit,
            "recommended_modules": recommended_modules,
        }

    async def get_self_assessment_questions(
        self,
        learning_unit_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za izbrano učno enoto.

        Vsakemu vprašanju dodamo learning_unit_id, related_topic_id
        in related_competency_codes, če jih lahko pridobimo iz content_topics.
        """

        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        if not learning_unit:
            return []

        return self._get_list_value(
            learning_unit.get("self_assessment_questions")
        )

    async def get_self_assessment_questions_for_learning_unit(
        self,
        learning_unit_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Alias metoda za skladnost z LearningPathService.

        Vrne vprašanja za samooceno za izbrano učno enoto.
        """

        return await self.get_self_assessment_questions(learning_unit_id)