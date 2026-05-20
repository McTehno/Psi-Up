from typing import Any, Dict, List, Optional


class ModuleService:
    """
    Service za module.

    Ta razred vsebuje poslovno logiko za delo z moduli.
    Uporablja ModuleRepository za dostop do modulov
    in LearningUnitService za pridobivanje podrobnosti učnih enot.
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

    async def get_all_modules(self) -> List[Dict[str, Any]]:
        """
        Vrne vse module.

        TODO:
        - Poklicati repository metodo za pridobivanje vseh modulov.
        - Po potrebi urediti ali filtrirati podatke pred vračanjem.
        """

        return await self.module_repository.get_all_modules()

    async def get_module_by_id(
        self,
        module_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne en modul glede na ID.

        TODO:
        - Poklicati repository metodo za pridobivanje modula.
        - Dodati obravnavo primera, ko modul ne obstaja.
        """

        return await self.module_repository.get_module_by_id(module_id)

    async def get_modules_by_ids(
        self,
        module_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne več modulov glede na seznam ID-jev.

        TODO:
        - Poklicati repository metodo za pridobivanje več modulov.
        - Po potrebi ohraniti vrstni red glede na vhodni seznam ID-jev.
        """

        return await self.module_repository.get_modules_by_ids(module_ids)

    async def get_module_detail(
        self,
        module_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti modula za detail page.

        TODO:
        - Pridobiti osnovne podatke modula.
        - Pridobiti podrobnosti učnih enot, ki pripadajo modulu.
        - Združiti reference učnih enot z njihovimi podrobnostmi.
        - Kasneje lahko vključimo tudi napredek uporabnika.
        """

        module = await self.get_module_by_id(module_id)

        if not module:
            return None

        learning_unit_references = module.get("learning_units", [])
        learning_unit_ids = [
            item.get("learning_unit_id")
            for item in learning_unit_references
            if item.get("learning_unit_id")
        ]

        learning_units = await self.learning_unit_service.get_learning_units_by_ids(
            learning_unit_ids
        )

        # TODO:
        # Kasneje urediti združevanje tako, da se ohrani order,
        # parallel_group, is_required in prerequisites iz reference.
        module["learning_unit_details"] = learning_units

        return module

    async def get_learning_unit_references_for_module(
        self,
        module_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference učnih enot znotraj modula.

        TODO:
        - Poklicati repository metodo.
        - Po potrebi urediti vrstni red za vizualni prikaz.
        """

        return await self.module_repository.get_learning_unit_references_for_module(
            module_id
        )

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne učne enote, ki jih uporabnik lahko začne v modulu.

        TODO:
        - Uporabiti prerequisites kot glavni vir logike.
        - Vrnejo se samo učne enote, katerih predpogoji so zaključeni.
        """

        return await self.module_repository.get_available_learning_units_for_module(
            module_id,
            completed_learning_unit_ids
        )

    async def get_self_assessment_questions_for_module(
        self,
        module_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celoten modul.

        TODO:
        - Pridobiti vse učne enote znotraj modula.
        - Za vsako učno enoto pridobiti self_assessment_questions.
        - Združiti vprašanja v enoten seznam.
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