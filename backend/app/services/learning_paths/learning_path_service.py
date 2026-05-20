from typing import Any, Dict, List, Optional


class LearningPathService:
    """
    Service za učne poti.

    Ta razred vsebuje poslovno logiko za delo z učnimi potmi.
    Uporablja LearningPathRepository za dostop do učnih poti
    in ModuleService za pridobivanje podrobnosti modulov.
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

    async def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne poti.

        TODO:
        - Poklicati repository metodo za pridobivanje vseh učnih poti.
        - Po potrebi urediti ali filtrirati podatke pred vračanjem.
        """

        return await self.learning_path_repository.get_all_learning_paths()

    async def get_learning_path_by_id(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno pot glede na ID.

        TODO:
        - Poklicati repository metodo za pridobivanje učne poti.
        - Dodati obravnavo primera, ko učna pot ne obstaja.
        """

        return await self.learning_path_repository.get_learning_path_by_id(
            learning_path_id
        )

    async def get_learning_path_detail(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti učne poti za detail page.

        TODO:
        - Pridobiti osnovne podatke učne poti.
        - Pridobiti podrobnosti modulov, ki pripadajo učni poti.
        - Združiti reference modulov z njihovimi podrobnostmi.
        - Kasneje lahko vključimo tudi napredek uporabnika.
        """

        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return None

        module_references = learning_path.get("modules", [])
        module_ids = [
            item.get("module_id")
            for item in module_references
            if item.get("module_id")
        ]

        modules = await self.module_service.get_modules_by_ids(module_ids)

        # TODO:
        # Kasneje urediti združevanje tako, da se ohrani order,
        # parallel_group, is_required in prerequisites iz reference.
        learning_path["module_details"] = modules

        return learning_path

    async def get_module_references_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference modulov znotraj učne poti.

        TODO:
        - Poklicati repository metodo.
        - Po potrebi urediti vrstni red za vizualni prikaz.
        """

        return await self.learning_path_repository.get_module_references_for_learning_path(
            learning_path_id
        )

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne module, ki jih uporabnik lahko začne v učni poti.

        TODO:
        - Uporabiti prerequisites kot glavni vir logike.
        - Vrnejo se samo moduli, katerih predpogoji so zaključeni.
        """

        return await self.learning_path_repository.get_available_modules_for_learning_path(
            learning_path_id,
            completed_module_ids
        )

    async def get_self_assessment_questions_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za celotno učno pot.

        TODO:
        - Pridobiti vse module znotraj učne poti.
        - Za vsak modul pridobiti vprašanja za samooceno.
        - Združiti vprašanja v enoten seznam.
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