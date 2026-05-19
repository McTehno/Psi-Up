from typing import Any, Dict, List, Optional


class LearningPathRepository:
    """
    Repository za učne poti.

    Ta razred je odgovoren za dostop do podatkov učnih poti
    iz MongoDB kolekcije learning_paths.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "learning_paths"

    async def get_all_learning_paths(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne poti iz MongoDB.

        TODO:
        - Kasneje dodati paginacijo, če bo učnih poti veliko.
        - Kasneje dodati sortiranje, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return list(collection.find({}))

    async def get_learning_path_by_id(
        self,
        learning_path_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno pot glede na njen _id.

        TODO:
        - Kasneje dodati dodatno validacijo ID-ja, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"_id": learning_path_id})

    async def search_learning_paths(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne poti po iskalnem nizu.

        Išče po:
        - title,
        - short_description,
        - keywords.

        TODO:
        - Kasneje lahko dodamo MongoDB text index za boljše iskanje.
        """

        if not query:
            return []

        collection = self.database[self.collection_name]

        search_filter = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"short_description": {"$regex": query, "$options": "i"}},
                {"keywords": {"$regex": query, "$options": "i"}},
            ]
        }

        return list(collection.find(search_filter))

    async def get_module_references_for_learning_path(
        self,
        learning_path_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference modulov znotraj učne poti.

        TODO:
        - Kasneje po potrebi urediti prikaz glede na order.
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
        - Kasneje dodati obravnavo, če module_id ni del učne poti.
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

        Modul je dostopen, če so vsi njegovi prerequisites že dokončani.
        """

        modules = await self.get_module_references_for_learning_path(learning_path_id)

        available_modules = []

        for module in modules:
            prerequisites = module.get("prerequisites", [])

            all_prerequisites_completed = all(
                prerequisite_id in completed_module_ids
                for prerequisite_id in prerequisites
            )

            if all_prerequisites_completed:
                available_modules.append(module)

        return available_modules