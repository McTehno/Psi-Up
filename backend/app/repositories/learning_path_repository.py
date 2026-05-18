from typing import Any, Dict, List, Optional


class LearningPathRepository:
    """
    Repository za učne poti.

    Ta razred je odgovoren za dostop do podatkov učnih poti.
    Kasneje bo bral podatke iz MongoDB kolekcije learning_paths.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "learning_paths"

    async def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne poti.

        TODO:
        - Prebrati vse dokumente iz kolekcije learning_paths.
        - Pretvoriti MongoDB dokumente v navadne dictionary objekte.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({})
        # return await cursor.to_list(length=None)

        return []

    async def get_learning_path_by_id(self, learning_path_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno pot glede na njen ID.

        TODO:
        - Poiskati učno pot po _id ali id.
        - Vrniti None, če učna pot ne obstaja.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # return await collection.find_one({"_id": learning_path_id})

        return None

    async def search_learning_paths(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne poti po iskalnem nizu.

        TODO:
        - Iskati po title, short_description in keywords.
        - Dodati case-insensitive search.
        - Kasneje lahko dodamo MongoDB text index.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo search poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({
        #     "$or": [
        #         {"title": {"$regex": query, "$options": "i"}},
        #         {"short_description": {"$regex": query, "$options": "i"}},
        #         {"keywords": {"$regex": query, "$options": "i"}}
        #     ]
        # })

        return []

    async def get_module_references_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference modulov znotraj učne poti.

        TODO:
        - Poiskati učno pot po ID.
        - Iz učne poti vrniti modules.
        - Upoštevati, da modules vsebujejo:
          module_id, order, parallel_group, is_required, prerequisites.
        """

        learning_path = await self.get_learning_path_by_id(learning_path_id)

        if not learning_path:
            return []

        return learning_path.get("modules", [])

    async def get_learning_path_prerequisites_for_module(
        self,
        learning_path_id: str,
        module_id: str
    ) -> List[str]:
        """
        Vrne predpogoje za določen modul znotraj učne poti.

        TODO:
        - Poiskati učno pot.
        - Najti modul z module_id znotraj učne poti.
        - Vrniti njegov seznam prerequisites.
        """

        modules = await self.get_module_references_for_learning_path(learning_path_id)

        for module in modules:
            if module.get("module_id") == module_id:
                return module.get("prerequisites", [])

        return []

    async def get_available_modules_for_learning_path(
        self,
        learning_path_id: str,
        completed_module_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne module, ki jih uporabnik lahko začne znotraj učne poti.

        TODO:
        - Upoštevati prerequisites posameznega modula.
        - Modul je dostopen, če so vsi njegovi prerequisites že dokončani.
        - Ta funkcija bo koristna za prikaz napredka in naslednjih korakov.
        """

        modules = await self.get_module_references_for_learning_path(learning_path_id)

        available_modules = []

        for module in modules:
            prerequisites = module.get("prerequisites", [])

            # TODO:
            # Kasneje preveriti, ali so vsi prerequisites v completed_module_ids.
            # To je osnovna priprava logike, ki že upošteva predpogoje.
            all_prerequisites_completed = all(
                prerequisite_id in completed_module_ids
                for prerequisite_id in prerequisites
            )

            if all_prerequisites_completed:
                available_modules.append(module)

        return available_modules