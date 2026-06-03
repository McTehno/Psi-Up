from typing import Any, Dict, List, Optional


class ModuleRepository:
    """
    Repository za module.

    Ta razred je odgovoren za dostop do podatkov modulov
    iz MongoDB kolekcije modules.

    Repository vrača surove podatke iz baze.
    Normalizacija za API response se izvaja v ModuleService.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "modules"

    async def get_all_modules(self) -> List[Dict[str, Any]]:
        """
        Vrne vse module iz MongoDB.

        TODO:
        - Kasneje dodati paginacijo, če bo modulov veliko.
        - Kasneje dodati sortiranje, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return list(collection.find({}))

    async def get_module_by_id(
        self,
        module_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne en modul glede na njegov _id.

        TODO:
        - Kasneje dodati dodatno validacijo ID-ja, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"_id": module_id})

    async def get_modules_by_ids(
        self,
        module_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne več modulov glede na seznam ID-jev.

        Vrstni red rezultata sledi vrstnemu redu module_ids.
        """

        if not module_ids:
            return []

        collection = self.database[self.collection_name]

        modules = list(
            collection.find(
                {
                    "_id": {
                        "$in": module_ids,
                    }
                }
            )
        )

        modules_by_id = {
            module["_id"]: module
            for module in modules
            if "_id" in module
        }

        return [
            modules_by_id[module_id]
            for module_id in module_ids
            if module_id in modules_by_id
        ]

    async def get_modules_by_learning_unit_id(
        self,
        learning_unit_id: str,
        limit: int = 6,
    ) -> List[Dict[str, Any]]:
        """
        Vrne module, ki vsebujejo izbrano učno enoto.

        Uporablja se za prikaz priporočenih oziroma povezanih modulov
        na detail strani učne enote.
        """

        if not learning_unit_id:
            return []

        collection = self.database[self.collection_name]

        return list(
            collection.find(
                {
                    "learning_units.learning_unit_id": learning_unit_id,
                }
            ).limit(limit)
        )

    async def search_modules(
        self,
        query: str,
    ) -> List[Dict[str, Any]]:
        """
        Poišče module po iskalnem nizu.

        Išče po:
        - title,
        - short_description,
        - keywords,
        - domains,
        - learning_units.learning_unit_id.
        """

        collection = self.database[self.collection_name]

        if not query:
            return list(collection.find({}))

        search_filter = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"short_description": {"$regex": query, "$options": "i"}},
                {"keywords": {"$regex": query, "$options": "i"}},
                {"domains": {"$regex": query, "$options": "i"}},
                {"learning_units.learning_unit_id": {"$regex": query, "$options": "i"}},
            ]
        }

        return list(collection.find(search_filter))

    async def get_learning_unit_references_for_module(
        self,
        module_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne reference učnih enot znotraj modula.
        """

        module = await self.get_module_by_id(module_id)

        if not module:
            return []

        learning_units = module.get("learning_units", [])

        if not isinstance(learning_units, list):
            return []

        return learning_units

    async def get_module_prerequisites_for_learning_unit(
        self,
        module_id: str,
        learning_unit_id: str,
    ) -> List[str]:
        """
        Vrne predpogoje za določeno učno enoto znotraj modula.
        """

        learning_units = await self.get_learning_unit_references_for_module(module_id)

        for learning_unit in learning_units:
            if not isinstance(learning_unit, dict):
                continue

            if learning_unit.get("learning_unit_id") != learning_unit_id:
                continue

            prerequisites = learning_unit.get("prerequisites", [])

            if not isinstance(prerequisites, list):
                return []

            return [
                prerequisite
                for prerequisite in prerequisites
                if isinstance(prerequisite, str) and prerequisite.strip()
            ]

        return []

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: List[str],
    ) -> List[Dict[str, Any]]:
        """
        Vrne učne enote, ki jih uporabnik lahko začne znotraj modula.

        Učna enota je dostopna, če so vsi njeni prerequisites že dokončani.
        """

        learning_units = await self.get_learning_unit_references_for_module(module_id)

        available_learning_units = []

        for learning_unit in learning_units:
            if not isinstance(learning_unit, dict):
                continue

            prerequisites = learning_unit.get("prerequisites", [])

            if not isinstance(prerequisites, list):
                prerequisites = []

            all_prerequisites_completed = all(
                prerequisite_id in completed_learning_unit_ids
                for prerequisite_id in prerequisites
                if isinstance(prerequisite_id, str)
            )

            if all_prerequisites_completed:
                available_learning_units.append(learning_unit)

        return available_learning_units