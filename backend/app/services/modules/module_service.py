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
        learning_unit_service: Any
    ):
        """
        Inicializira service z repository-jem za module
        in service-om za učne enote.
        """

        self.module_repository = module_repository
        self.learning_unit_service = learning_unit_service

    def _get_string_value(
        self,
        value: Any,
        fallback: str = "",
    ) -> str:
        """
        Vrne varno string vrednost.

        Če je vrednost None ali napačnega tipa, vrne fallback.
        Napačnih tipov ne pretvarjamo na silo v string,
        ker bi s tem lahko skrili napake v podatkih.
        """

        if value is None:
            return fallback

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

        Uporablja se za order pri referencah učnih enot.
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

        Uporablja se za sezname, ki niso nujno samo stringi.
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

        Če vrednost ni list, vrne prazen seznam.
        Iz seznama odstrani elemente, ki niso string,
        in prazne stringe.

        Primer:
        [None, 123, "modul", ""] -> ["modul"]

        Uporablja se za keywords, domains in prerequisites.
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

        Primer reference v MongoDB:
        {
            "learning_unit_id": "ue_001",
            "order": 1,
            "parallel_group": null,
            "is_required": true,
            "prerequisites": []
        }

        Če reference nima veljavnega learning_unit_id, je ne vračamo,
        ker se iz nje ne more varno pridobiti učne enote.
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
        To prepreči napake pri pridobivanju learning_unit_ids
        in pri frontend vizualizaciji modula.
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

        return normalized_references

    def _normalize_module(
        self,
        module: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Normalizira modul pred vračanjem API response-a.

        Namen:
        - title in short_description ne smeta biti None
        - keywords in domains morata biti seznama stringov
        - learning_units mora biti varen seznam referenc
        - dodatna polja se ohranijo
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

        Tako en nepopoln modul ne povzroči padca celotnega response-a.
        """

        return [
            self._normalize_module(module)
            for module in modules
            if isinstance(module, dict)
        ]

    async def get_all_modules(self) -> List[Dict[str, Any]]:
        """
        Vrne vse module.

        Pred vračanjem podatke normalizira, da API response ostane stabilen.
        """

        modules = await self.module_repository.get_all_modules()

        return self._normalize_modules(modules)

    async def get_module_by_id(
        self,
        module_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne en modul glede na ID.

        Če modul obstaja, ga pred vračanjem normalizira.
        Če ne obstaja, vrne None, da API layer lahko vrne 404.
        """

        module = await self.module_repository.get_module_by_id(module_id)

        if not module:
            return None

        return self._normalize_module(module)

    async def get_modules_by_ids(
        self,
        module_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne več modulov glede na seznam ID-jev.

        Pred vračanjem normalizira vse najdene module.
        """

        modules = await self.module_repository.get_modules_by_ids(module_ids)

        return self._normalize_modules(modules)

    async def get_module_detail(
        self,
        module_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti modula za detail page.

        Koraki:
        - pridobi modul
        - normalizira osnovne podatke modula
        - iz varnih referenc pridobi learning_unit_ids
        - pridobi podrobnosti učnih enot prek LearningUnitService
        - doda learning_unit_details v response

        LearningUnitService že normalizira učne enote,
        zato so tudi learning_unit_details bolj stabilni.
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

        module["learning_units"] = learning_unit_references
        module["learning_unit_details"] = learning_units

        return module

    async def get_learning_unit_references_for_module(
        self,
        module_id: str
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
        completed_learning_unit_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne učne enote, ki jih uporabnik lahko začne v modulu.

        Repository trenutno izvaja logiko dostopnosti.
        Tukaj rezultat dodatno normaliziramo, če gre za reference učnih enot.
        """

        available_learning_units = await self.module_repository.get_available_learning_units_for_module(
            module_id,
            completed_learning_unit_ids
        )

        return self._normalize_learning_unit_references(
            available_learning_units
        )

    async def get_self_assessment_questions_for_module(
        self,
        module_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celoten modul.

        Koraki:
        - pridobi varne reference učnih enot
        - za vsako učno enoto pridobi vprašanja
        - združi vprašanja v enoten seznam
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

            questions.extend(unit_questions)

        return questions