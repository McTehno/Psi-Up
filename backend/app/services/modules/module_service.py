from typing import Any, Dict, List, Optional


class ModuleService:
    """
    Service za module.

    Ta razred vsebuje poslovno logiko za delo z moduli.
    Uporablja ModuleRepository za dostop do modulov
    in LearningUnitService za pridobivanje podrobnosti učnih enot.

    Pomembno:
    MongoDB lahko vsebuje nepopolne dokumente.
    Zato service pred vračanjem podatkov normalizira modul in reference učnih enot.
    Cilj ni spreminjanje podatkov v bazi, ampak stabilen API response.
    """

    def __init__(
        self,
        module_repository: Any,
        learning_unit_service: Any,
        learning_path_repository: Optional[Any] = None,
    ):
        """
        Inicializira service z repository-jem za module
        in service-om za učne enote.

        Opcijsko prejme tudi repository za učne poti, kadar service potrebuje
        povezane učne poti za detail prikaz modula.
        """

        self.module_repository = module_repository
        self.learning_unit_service = learning_unit_service
        self.learning_path_repository = learning_path_repository

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

        Uporablja se za polja, kjer je None dovoljen,
        na primer parallel_group.
        """

        if isinstance(value, str) and value.strip():
            return value.strip()

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

    def _get_int_value(
        self,
        value: Any,
        fallback: int = 0,
    ) -> int:
        """
        Vrne varno integer vrednost.

        Uporablja se za order pri referencah učnih enot.
        """

        if isinstance(value, int):
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

    def _normalize_learning_unit_reference(
        self,
        reference: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira eno referenco učne enote znotraj modula.
        """

        learning_unit_id = self._get_string_value(
            reference.get("learning_unit_id")
        )

        if not learning_unit_id:
            return None

        return {
            "learning_unit_id": learning_unit_id,
            "order": self._get_int_value(reference.get("order")),
            "parallel_group": self._get_optional_string_value(
                reference.get("parallel_group")
            ),
            "is_required": self._get_bool_value(
                reference.get("is_required")
            ),
            "prerequisites": self._get_string_list_value(
                reference.get("prerequisites")
            ),
        }

    def _normalize_learning_unit_references(
        self,
        references: Any,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam referenc učnih enot.

        Napačne elemente preskoči.
        Rezultat uredi po order, da API vrača stabilen vrstni red.
        """

        normalized_references: List[Dict[str, Any]] = []

        for reference in self._get_list_value(references):
            if not isinstance(reference, dict):
                continue

            normalized_reference = self._normalize_learning_unit_reference(
                reference
            )

            if normalized_reference:
                normalized_references.append(normalized_reference)

        return sorted(
            normalized_references,
            key=lambda reference: reference.get("order", 0),
        )

    def _normalize_module(
        self,
        module: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira modul pred vračanjem API response-a.
        """

        normalized_module = dict(module)

        normalized_module["title"] = self._get_string_value(
            normalized_module.get("title")
        )
        normalized_module["short_description"] = self._get_string_value(
            normalized_module.get("short_description")
        )

        normalized_module["keywords"] = self._get_string_list_value(
            normalized_module.get("keywords")
        )
        normalized_module["domains"] = self._get_string_list_value(
            normalized_module.get("domains")
        )
        normalized_module["learning_units"] = self._normalize_learning_unit_references(
            normalized_module.get("learning_units")
        )

        return normalized_module

    def _normalize_modules(
        self,
        modules: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam modulov.
        """

        return [
            self._normalize_module(module)
            for module in modules
            if isinstance(module, dict)
        ]

    def _normalize_recommended_learning_path(
        self,
        learning_path: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira kratek prikaz učne poti za recommended_learning_paths.
        """

        return {
            "_id": self._get_string_value(learning_path.get("_id")),
            "title": self._get_string_value(learning_path.get("title")),
            "short_description": self._get_string_value(
                learning_path.get("short_description")
            ),
            "duration_hours": learning_path.get("duration_hours"),
            "keywords": self._get_string_list_value(learning_path.get("keywords")),
        }

    def _normalize_recommended_learning_paths(
        self,
        learning_paths: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam priporočenih učnih poti.
        """

        return [
            self._normalize_recommended_learning_path(learning_path)
            for learning_path in learning_paths
            if isinstance(learning_path, dict)
        ]

    async def get_all_modules(self) -> List[Dict[str, Any]]:
        """
        Vrne vse module.
        """

        modules = await self.module_repository.get_all_modules()

        return self._normalize_modules(modules)

    async def get_module_by_id(
        self,
        module_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne en modul glede na ID.
        """

        module = await self.module_repository.get_module_by_id(module_id)

        if not module:
            return None

        return self._normalize_module(module)

    async def get_modules_by_ids(
        self,
        module_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne več modulov glede na seznam ID-jev.
        """

        modules = await self.module_repository.get_modules_by_ids(module_ids)

        return self._normalize_modules(modules)

    async def get_module_detail(
        self,
        module_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti modula za detail page.
        """

        module = await self.get_module_by_id(module_id)

        if not module:
            return None

        learning_unit_references = self._normalize_learning_unit_references(
            module.get("learning_units")
        )

        learning_unit_ids = [
            reference["learning_unit_id"]
            for reference in learning_unit_references
            if reference.get("learning_unit_id")
        ]

        learning_units = await self.learning_unit_service.get_learning_units_by_ids(
            learning_unit_ids
        )

        recommended_learning_paths: List[Dict[str, Any]] = []

        if self.learning_path_repository is not None:
            learning_paths = await self.learning_path_repository.get_learning_paths_by_module_id(
                module_id=module_id,
                limit=6,
            )
            recommended_learning_paths = self._normalize_recommended_learning_paths(
                learning_paths
            )

        module["learning_units"] = learning_unit_references
        module["learning_unit_details"] = learning_units
        module["recommended_learning_paths"] = recommended_learning_paths

        return module

    async def get_learning_unit_references_for_module(
        self,
        module_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference učnih enot znotraj modula.

        Reference se pred vračanjem normalizirajo.
        """

        references = await self.module_repository.get_learning_unit_references_for_module(
            module_id
        )

        return self._normalize_learning_unit_references(references)

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne učne enote, ki jih uporabnik lahko začne v modulu.
        """

        available_learning_units = await self.module_repository.get_available_learning_units_for_module(
            module_id,
            completed_learning_unit_ids,
        )

        return self._normalize_learning_unit_references(
            available_learning_units
        )

    async def get_self_assessment_questions_for_module(
        self,
        module_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celoten modul.

        Koraki:
        - pridobi varne reference učnih enot,
        - za vsako učno enoto pridobi vprašanja,
        - vsakemu vprašanju doda module_id,
        - združi vprašanja v enoten seznam.

        To je pomembno za QuestionnaireService, ker potem lahko pri sources
        ohrani povezavo na modul in učno enoto.
        """

        learning_unit_references = await self.get_learning_unit_references_for_module(
            module_id
        )

        questions: List[Dict[str, Any]] = []

        for reference in learning_unit_references:
            learning_unit_id = reference.get("learning_unit_id")

            if not learning_unit_id:
                continue

            unit_questions = await self.learning_unit_service.get_self_assessment_questions(
                learning_unit_id
            )

            for question in self._get_list_value(unit_questions):
                if not isinstance(question, dict):
                    continue

                prepared_question = {
                    **question,
                    "module_id": module_id,
                    "learning_unit_id": question.get("learning_unit_id")
                    or learning_unit_id,
                    "order": reference.get("order"),
                    "parallel_group": reference.get("parallel_group"),
                    "is_required": reference.get("is_required", True),
                    "prerequisites": reference.get("prerequisites", []),
                }

                questions.append(prepared_question)

        return questions