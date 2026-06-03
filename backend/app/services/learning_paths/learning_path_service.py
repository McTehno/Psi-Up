from typing import Any, Dict, List, Optional


class LearningPathService:
    """
    Service za učne poti.

    Ta razred vsebuje poslovno logiko za delo z učnimi potmi.
    Uporablja LearningPathRepository za dostop do učnih poti,
    ModuleService za pridobivanje podrobnosti modulov
    in LearningUnitService za pridobivanje podrobnosti samostojnih učnih enot.

    Pomembno:
    MongoDB lahko vsebuje nepopolne dokumente.
    Zato service pred vračanjem podatkov normalizira učno pot in reference korakov.
    Cilj ni spreminjanje podatkov v bazi, ampak stabilen API response.
    """

    def __init__(
        self,
        learning_path_repository: Any,
        module_service: Any,
        learning_unit_service: Any,
    ):
        """
        Inicializira service z repository-jem za učne poti,
        service-om za module in service-om za učne enote.
        """

        self.learning_path_repository = learning_path_repository
        self.module_service = module_service
        self.learning_unit_service = learning_unit_service

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

    def _normalize_step_reference(
        self,
        reference: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira en korak znotraj učne poti.

        Korak je lahko:
        - module
        - learning_unit
        """

        step_type = self._get_string_value(reference.get("type"))
        ref_id = self._get_string_value(reference.get("ref_id"))

        if step_type not in ["module", "learning_unit"]:
            return None

        if not ref_id:
            return None

        return {
            "type": step_type,
            "ref_id": ref_id,
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

    def _normalize_step_references(
        self,
        references: Any,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam korakov učne poti.

        Napačne elemente preskoči.
        Korake uredi po order, da API vrača stabilen vrstni red.
        """

        normalized_references: List[Dict[str, Any]] = []

        for reference in self._get_list_value(references):
            if not isinstance(reference, dict):
                continue

            normalized_reference = self._normalize_step_reference(reference)

            if normalized_reference:
                normalized_references.append(normalized_reference)

        return sorted(
            normalized_references,
            key=lambda step: step.get("order", 0),
        )

    def _normalize_module_reference(
        self,
        reference: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira eno referenco modula.

        Compatibility metoda za dele backend logike,
        ki še vedno pričakujejo module_id.
        """

        module_id = self._get_string_value(
            reference.get("module_id")
        )

        if not module_id and reference.get("type") == "module":
            module_id = self._get_string_value(reference.get("ref_id"))

        if not module_id:
            return None

        return {
            "module_id": module_id,
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

    def _normalize_module_references(
        self,
        references: Any,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam referenc modulov.
        """

        normalized_references: List[Dict[str, Any]] = []

        for reference in self._get_list_value(references):
            if not isinstance(reference, dict):
                continue

            normalized_reference = self._normalize_module_reference(reference)

            if normalized_reference:
                normalized_references.append(normalized_reference)

        return sorted(
            normalized_references,
            key=lambda reference: reference.get("order", 0),
        )

    def _normalize_learning_path(
        self,
        learning_path: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira učno pot pred vračanjem API response-a.
        """

        normalized_learning_path = dict(learning_path)

        normalized_learning_path["title"] = self._get_string_value(
            normalized_learning_path.get("title")
        )
        normalized_learning_path["short_description"] = self._get_string_value(
            normalized_learning_path.get("short_description")
        )

        normalized_learning_path["keywords"] = self._get_string_list_value(
            normalized_learning_path.get("keywords")
        )
        normalized_learning_path["steps"] = self._normalize_step_references(
            normalized_learning_path.get("steps")
        )

        normalized_learning_path.pop("modules", None)

        return normalized_learning_path

    def _normalize_learning_paths(
        self,
        learning_paths: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam učnih poti.
        """

        return [
            self._normalize_learning_path(learning_path)
            for learning_path in learning_paths
            if isinstance(learning_path, dict)
        ]

    def _add_learning_path_id_to_questions(
        self,
        questions: List[Dict[str, Any]],
        learning_path_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vsakemu vprašanju doda learning_path_id.

        To je pomembno za QuestionnaireService, ker sources potem hranijo
        povezavo na učno pot, modul, učno enoto, topic in kompetence.
        """

        prepared_questions: List[Dict[str, Any]] = []

        for question in self._get_list_value(questions):
            if not isinstance(question, dict):
                continue

            prepared_questions.append(
                {
                    **question,
                    "learning_path_id": learning_path_id,
                }
            )

        return prepared_questions

    async def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne poti.
        """

        learning_paths = await self.learning_path_repository.get_all_learning_paths()

        return self._normalize_learning_paths(learning_paths)

    async def get_learning_path_by_id(
        self,
        learning_path_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno pot glede na ID.
        """

        learning_path = await self.learning_path_repository.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return None

        return self._normalize_learning_path(learning_path)

    async def get_learning_path_detail(
        self,
        learning_path_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti učne poti za detail page.
        """

        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return None

        steps = self._normalize_step_references(
            learning_path.get("steps")
        )

        module_ids = [
            step["ref_id"]
            for step in steps
            if step.get("type") == "module" and step.get("ref_id")
        ]

        learning_unit_ids = [
            step["ref_id"]
            for step in steps
            if step.get("type") == "learning_unit" and step.get("ref_id")
        ]

        modules = await self.module_service.get_modules_by_ids(module_ids)
        learning_units = await self.learning_unit_service.get_learning_units_by_ids(
            learning_unit_ids
        )

        learning_path["steps"] = steps
        learning_path["module_details"] = modules
        learning_path["learning_unit_details"] = learning_units

        return learning_path

    async def get_step_references_for_learning_path(
        self,
        learning_path_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference korakov znotraj učne poti.
        """

        references = await self.learning_path_repository.get_step_references_for_learning_path(
            learning_path_id
        )

        return self._normalize_step_references(references)

    async def get_module_references_for_learning_path(
        self,
        learning_path_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne samo reference modulov znotraj učne poti.

        Compatibility metoda za endpoint/logiko, ki še vedno uporablja module.
        Nova struktura uporablja steps.
        """

        steps = await self.get_step_references_for_learning_path(learning_path_id)

        module_steps = [
            step
            for step in steps
            if step.get("type") == "module"
        ]

        return self._normalize_module_references(module_steps)

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne module, ki jih uporabnik lahko začne v učni poti.

        Compatibility metoda za starejšo logiko.
        """

        available_modules = await self.learning_path_repository.get_available_modules_for_learning_path(
            learning_path_id,
            completed_module_ids,
        )

        return self._normalize_module_references(available_modules)

    async def get_available_steps_for_learning_path(
        self,
        learning_path_id: str,
        completed_step_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne korake, ki jih uporabnik lahko začne v učni poti.

        Korak je dostopen, če so vsi njegovi prerequisites zaključeni.
        completed_step_ids lahko vsebuje ID-je modulov in učnih enot.
        """

        steps = await self.get_step_references_for_learning_path(learning_path_id)

        available_steps: List[Dict[str, Any]] = []

        for step in steps:
            prerequisites = self._get_string_list_value(
                step.get("prerequisites")
            )

            all_prerequisites_completed = all(
                prerequisite_id in completed_step_ids
                for prerequisite_id in prerequisites
            )

            if all_prerequisites_completed:
                available_steps.append(step)

        return available_steps
    
    def _add_learning_path_step_metadata_to_questions(
        self,
        questions: List[Dict[str, Any]],
        learning_path_id: str,
        step: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Vsakemu vprašanju doda learning_path_id in metapodatke koraka učne poti.
        """

        prepared_questions: List[Dict[str, Any]] = []

        for question in self._get_list_value(questions):
            if not isinstance(question, dict):
                continue

            prepared_questions.append(
                {
                    **question,
                    "learning_path_id": learning_path_id,
                    "order": step.get("order"),
                    "parallel_group": step.get("parallel_group"),
                    "is_required": step.get("is_required", True),
                    "prerequisites": step.get("prerequisites", []),
                }
            )

        return prepared_questions

    async def get_self_assessment_questions_for_learning_path(
        self,
        learning_path_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celotno učno pot.

        Koraki:
        - pridobi steps učne poti,
        - če je step module, pridobi vprašanja prek ModuleService,
        - če je step learning_unit, pridobi vprašanja prek LearningUnitService,
        - vsakemu vprašanju doda learning_path_id,
        - združi vprašanja v enoten seznam.

        Deduplikacijo vprašanj po normalizirani vsebini vprašanja
        in združevanje sources izvede QuestionnaireService.
        """

        steps = await self.get_step_references_for_learning_path(
            learning_path_id
        )

        questions: List[Dict[str, Any]] = []

        for step in steps:
            step_type = step.get("type")
            ref_id = step.get("ref_id")

            if not ref_id:
                continue

            if step_type == "module":
                module_questions = await self.module_service.get_self_assessment_questions_for_module(
                    ref_id
                )

                questions.extend(
                    self._add_learning_path_step_metadata_to_questions(
                        questions=module_questions,
                        learning_path_id=learning_path_id,
                        step=step,
                    )
                )

            elif step_type == "learning_unit":
                learning_unit_questions = await self.learning_unit_service.get_self_assessment_questions_for_learning_unit(
                    ref_id
                )

                questions.extend(
                    self._add_learning_path_step_metadata_to_questions(
                        questions=learning_unit_questions,
                        learning_path_id=learning_path_id,
                        step=step,
                    )
                )

        return questions