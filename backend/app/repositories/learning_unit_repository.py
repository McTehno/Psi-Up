from typing import Any, Dict, List, Optional


class LearningUnitRepository:
    """
    Repository za učne enote.

    Ta razred je odgovoren za dostop do podatkov učnih enot.
    Kasneje bo bral podatke iz MongoDB kolekcije learning_units.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "learning_units"

    async def get_all_learning_units(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne enote.

        TODO:
        - Prebrati vse dokumente iz kolekcije learning_units.
        - Pretvoriti MongoDB dokumente v navadne dictionary objekte.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({})
        # return await cursor.to_list(length=None)

        return []

    async def get_learning_unit_by_id(self, learning_unit_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno enoto glede na njen ID.

        TODO:
        - Poiskati učno enoto po _id ali id.
        - Vrniti None, če učna enota ne obstaja.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # return await collection.find_one({"_id": learning_unit_id})

        return None

    async def get_learning_units_by_ids(self, learning_unit_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Vrne več učnih enot glede na seznam ID-jev.

        TODO:
        - Poiskati vse učne enote, katerih ID je v seznamu learning_unit_ids.
        - Ohraniti vrstni red, če bo to potrebno za prikaz.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # cursor = collection.find({"_id": {"$in": learning_unit_ids}})
        # return await cursor.to_list(length=None)

        return []

    async def search_learning_units(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne enote po iskalnem nizu.

        TODO:
        - Iskati po title, short_description, keywords in skills.
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
        #         {"skills": {"$regex": query, "$options": "i"}}
        #     ]
        # })

        return []

    async def get_self_assessment_questions(self, learning_unit_id: str) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za eno učno enoto.

        TODO:
        - Najti učno enoto po ID.
        - Iz nje vrniti self_assessment_questions.
        - Če vprašanj ni, vrniti prazen seznam.
        """

        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        # TODO:
        # Ko bo get_learning_unit_by_id implementiran,
        # vrniti learning_unit.get("self_assessment_questions", []).

        if not learning_unit:
            return []

        return learning_unit.get("self_assessment_questions", [])