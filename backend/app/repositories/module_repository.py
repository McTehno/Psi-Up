from typing import Any, Dict, List, Optional


class ModuleRepository:
    """
    Repository za module.

    Ta razred je odgovoren za dostop do podatkov modulov.
    Kasneje bo bral podatke iz MongoDB kolekcije modules.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "modules"

    async def get_all_modules(self) -> List[Dict[str, Any]]:
        """
        Vrne vse module.

        TODO:
        - Prebrati vse dokumente iz kolekcije modules.
        - Pretvoriti MongoDB dokumente v navadne dictionary objekte.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({})
        # return await cursor.to_list(length=None)

        return []

    async def get_module_by_id(self, module_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne en modul glede na njegov ID.

        TODO:
        - Poiskati modul po _id ali id.
        - Vrniti None, če modul ne obstaja.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # return await collection.find_one({"_id": module_id})

        return None

    async def get_modules_by_ids(self, module_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Vrne več modulov glede na seznam ID-jev.

        TODO:
        - Poiskati vse module, katerih ID je v seznamu module_ids.
        - Ohraniti vrstni red, če bo to potrebno za prikaz učne poti.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({"_id": {"$in": module_ids}})
        # return await cursor.to_list(length=None)

        return []

    async def search_modules(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče module po iskalnem nizu.

        TODO:
        - Iskati po title, short_description, keywords in domains.
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
        #         {"keywords": {"$regex": query, "$options": "i"}},
        #         {"domains": {"$regex": query, "$options": "i"}}
        #     ]
        # })

        return []

    async def get_learning_unit_references_for_module(self, module_id: str) -> List[Dict[str, Any]]:
        """
        Vrne reference učnih enot znotraj modula.

        TODO:
        - Poiskati modul po ID.
        - Iz modula vrniti learning_units.
        - Upoštevati, da learning_units vsebujejo:
          learning_unit_id, order, parallel_group, is_required, prerequisites.
        """

        module = await self.get_module_by_id(module_id)

        if not module:
            return []

        return module.get("learning_units", [])

    async def get_module_prerequisites_for_learning_unit(
        self,
        module_id: str,
        learning_unit_id: str
    ) -> List[str]:
        """
        Vrne predpogoje za določeno učno enoto znotraj modula.

        TODO:
        - Poiskati modul.
        - Najti učno enoto z learning_unit_id znotraj modula.
        - Vrniti njen seznam prerequisites.
        """

        learning_units = await self.get_learning_unit_references_for_module(module_id)

        for learning_unit in learning_units:
            if learning_unit.get("learning_unit_id") == learning_unit_id:
                return learning_unit.get("prerequisites", [])

        return []

    async def get_available_learning_units_for_module(
        self,
        module_id: str,
        completed_learning_unit_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne učne enote, ki jih uporabnik lahko začne znotraj modula.

        TODO:
        - Upoštevati prerequisites posamezne učne enote.
        - Učna enota je dostopna, če so vsi njeni prerequisites že dokončani.
        - Ta funkcija bo koristna za prikaz napredka in naslednjih korakov.
        """

        learning_units = await self.get_learning_unit_references_for_module(module_id)

        available_learning_units = []

        for learning_unit in learning_units:
            prerequisites = learning_unit.get("prerequisites", [])

            # TODO:
            # Kasneje preveriti, ali so vsi prerequisites v completed_learning_unit_ids.
            # Za zdaj pustimo osnovno strukturo.
            all_prerequisites_completed = all(
                prerequisite_id in completed_learning_unit_ids
                for prerequisite_id in prerequisites
            )

            if all_prerequisites_completed:
                available_learning_units.append(learning_unit)

        return available_learning_units