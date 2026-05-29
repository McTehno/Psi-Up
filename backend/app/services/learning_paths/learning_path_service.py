from typing import Any, Dict, List, Optional


class LearningPathService:
    """
    Service za učne poti.

    Ta razred vsebuje poslovno logiko za delo z učnimi potmi.
    Uporablja LearningPathRepository za dostop do učnih poti
    in ModuleService za pridobivanje podrobnosti modulov.

    Pomembno:
    MongoDB lahko vsebuje nepopolne dokumente.
    Zato service pred vračanjem podatkov normalizira učno pot in reference modulov.
    Cilj ni spreminjanje podatkov v bazi, ampak stabilen API response.
    """

    def __init__(
        self,
        learning_path_repository: Any,
        module_service: Any
    ):
        """
        Inicializira service z repository-jem za učne poti
        in service-om za module.
        """

        self.learning_path_repository = learning_path_repository
        self.module_service = module_service

    def _get_string_value(
        self,
        value: Any,
        fallback: str = "",
    ) -> str:
        """
        Vrne varno string vrednost.

        Če je vrednost None ali napačnega tipa, vrne fallback.
        Napačnih tipov ne pretvarjamo na silo v string.
        """

        if isinstance(value, str):
            return value

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

        if value is None:
            return None

        if isinstance(value, str):
            return value

        return None

    def _get_bool_value(
        self,
        value: Any,
        fallback: bool = True,
    ) -> bool:
        """
        Vrne varno boolean vrednost.

        Če vrednost ni boolean, vrne fallback.
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

        Uporablja se za order pri referencah modulov.
        Če order manjka ali ni integer, vrnemo fallback.
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

        Če vrednost ni list, vrne prazen seznam.
        """

        if isinstance(value, list):
            return value

        return []

    def _normalize_module_reference(
        self,
        reference: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Normalizira eno referenco modula znotraj učne poti.

        Primer reference v MongoDB:
        {
            "module_id": "mod_001",
            "order": 1,
            "parallel_group": null,
            "is_required": true,
            "prerequisites": []
        }

        Če reference nima veljavnega module_id, je ne vračamo,
        ker se iz nje ne more varno pridobiti modula.
        """

        module_id = self._get_string_value(
            reference.get("module_id")
        )

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
            "prerequisites": self._get_list_value(
                reference.get("prerequisites")
            ),
        }

    def _normalize_module_references(
        self,
        references: Any,
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam referenc modulov.

        Napačne elemente preskoči.
        To prepreči napake pri pridobivanju module_ids
        in pri frontend vizualizaciji učne poti.
        """

        normalized_references: List[Dict[str, Any]] = []

        for reference in self._get_list_value(references):
            if not isinstance(reference, dict):
                continue

            normalized_reference = self._normalize_module_reference(reference)

            if normalized_reference:
                normalized_references.append(normalized_reference)

        return normalized_references

    def _normalize_learning_path(
        self,
        learning_path: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira učno pot pred vračanjem API response-a.

        Namen:
        - title in short_description ne smeta biti None
        - keywords mora biti seznam
        - modules mora biti varen seznam referenc
        - dodatna polja se ohranijo
        """

        normalized_learning_path = dict(learning_path)

        normalized_learning_path["title"] = self._get_string_value(
            normalized_learning_path.get("title")
        )
        normalized_learning_path["short_description"] = self._get_string_value(
            normalized_learning_path.get("short_description")
        )

        normalized_learning_path["keywords"] = self._get_list_value(
            normalized_learning_path.get("keywords")
        )
        normalized_learning_path["modules"] = self._normalize_module_references(
            normalized_learning_path.get("modules")
        )

        return normalized_learning_path

    def _normalize_learning_paths(
        self,
        learning_paths: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Normalizira seznam učnih poti.

        Tako ena nepopolna učna pot ne povzroči padca celotnega response-a.
        """

        return [
            self._normalize_learning_path(learning_path)
            for learning_path in learning_paths
            if isinstance(learning_path, dict)
        ]

    async def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne poti.

        Pred vračanjem podatke normalizira, da API response ostane stabilen.
        """

        learning_paths = await self.learning_path_repository.get_all_learning_paths()

        return self._normalize_learning_paths(learning_paths)

    async def get_learning_path_by_id(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno pot glede na ID.

        Če učna pot obstaja, jo pred vračanjem normalizira.
        Če ne obstaja, vrne None, da API layer lahko vrne 404.
        """

        learning_path = await self.learning_path_repository.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            return None

        return self._normalize_learning_path(learning_path)

    async def get_learning_path_detail(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti učne poti za detail page.

        Koraki:
        - pridobi učno pot
        - normalizira osnovne podatke učne poti
        - iz varnih referenc pridobi module_ids
        - pridobi podrobnosti modulov prek ModuleService
        - doda module_details v response

        ModuleService že normalizira module,
        zato so tudi module_details bolj stabilni.
        """

        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return None

        module_references = self._normalize_module_references(
            learning_path.get("modules")
        )

        module_ids = [
            reference["module_id"]
            for reference in module_references
            if reference.get("module_id")
        ]

        modules = await self.module_service.get_modules_by_ids(module_ids)

        learning_path["modules"] = module_references
        learning_path["module_details"] = modules

        return learning_path

    async def get_module_references_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference modulov znotraj učne poti.

        Reference se pred vračanjem normalizirajo.
        """

        references = await self.learning_path_repository.get_module_references_for_learning_path(
            learning_path_id
        )

        return self._normalize_module_references(references)

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne module, ki jih uporabnik lahko začne v učni poti.

        Repository trenutno izvaja logiko dostopnosti.
        Tukaj rezultat dodatno normaliziramo, če gre za reference modulov.
        """

        available_modules = await self.learning_path_repository.get_available_modules_for_learning_path(
            learning_path_id,
            completed_module_ids
        )

        return self._normalize_module_references(available_modules)

    async def get_self_assessment_questions_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celotno učno pot.

        Koraki:
        - pridobi varne reference modulov
        - za vsak modul pridobi vprašanja za samooceno
        - združi vprašanja v enoten seznam
        """

        module_references = await self.get_module_references_for_learning_path(
            learning_path_id
        )

        questions: List[Dict[str, Any]] = []

        for reference in module_references:
            module_id = reference.get("module_id")

            if not module_id:
                continue

            module_questions = await self.module_service.get_self_assessment_questions_for_module(
                module_id
            )

            questions.extend(module_questions)

        return questions