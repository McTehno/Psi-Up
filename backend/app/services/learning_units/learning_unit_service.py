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

        if value is None:
            return fallback

        if isinstance(value, str):
            return value

        return fallback

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

    def _normalize_learning_unit(
        self,
        learning_unit: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira dokument učne enote pred vračanjem API response-a.
        """

        normalized_learning_unit = dict(learning_unit)

        normalized_learning_unit["title"] = self._get_string_value(
            normalized_learning_unit.get("title")
        )
        normalized_learning_unit["short_description"] = self._get_string_value(
            normalized_learning_unit.get("short_description")
        )

        normalized_learning_unit["keywords"] = self._get_string_list_value(
            normalized_learning_unit.get("keywords")
        )
        normalized_learning_unit["content_topics"] = self._get_string_list_value(
            normalized_learning_unit.get("content_topics")
        )
        normalized_learning_unit["acquired_competencies"] = self._get_string_list_value(
            normalized_learning_unit.get("acquired_competencies")
        )
        normalized_learning_unit["digcomp_competencies"] = self._get_list_value(
            normalized_learning_unit.get("digcomp_competencies")
        )
        normalized_learning_unit["prerequisites"] = self._get_string_list_value(
            normalized_learning_unit.get("prerequisites")
        )
        normalized_learning_unit["self_assessment_questions"] = self._get_list_value(
            normalized_learning_unit.get("self_assessment_questions")
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

        Če repository vrne None ali napačno obliko, jo obravnavamo kot prazen seznam.
        Vsakemu vprašanju dodamo learning_unit_id, če ga še nima.
        """

        questions = await self.learning_unit_repository.get_self_assessment_questions(
            learning_unit_id
        )

        prepared_questions = []

        for question in self._get_list_value(questions):
            if not isinstance(question, dict):
                continue

            prepared_question = {
                **question,
                "learning_unit_id": question.get("learning_unit_id")
                or learning_unit_id,
            }
            prepared_questions.append(prepared_question)

        return prepared_questions