from typing import Any, Dict, List, Optional


class LearningUnitRepository:
    """
    Repository za učne enote.

    Ta razred je odgovoren za dostop do podatkov učnih enot
    iz MongoDB kolekcije learning_units.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "learning_units"

    async def get_all_learning_units(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne enote iz MongoDB.

        TODO:
        - Kasneje dodati paginacijo, če bo učnih enot veliko.
        - Kasneje dodati sortiranje, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return list(collection.find({}))

    async def get_learning_unit_by_id(
        self,
        learning_unit_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno enoto glede na njen _id.

        TODO:
        - Kasneje dodati dodatno validacijo ID-ja, če bo potrebno.
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"_id": learning_unit_id})

    async def get_learning_units_by_ids(
        self,
        learning_unit_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne več učnih enot glede na seznam ID-jev.

        TODO:
        - Kasneje optimizirati, če bo seznam ID-jev zelo velik.
        """

        if not learning_unit_ids:
            return []

        collection = self.database[self.collection_name]

        learning_units = list(
            collection.find({
                "_id": {
                    "$in": learning_unit_ids
                }
            })
        )

        learning_units_by_id = {
            learning_unit["_id"]: learning_unit
            for learning_unit in learning_units
        }

        return [
            learning_units_by_id[learning_unit_id]
            for learning_unit_id in learning_unit_ids
            if learning_unit_id in learning_units_by_id
        ]

    async def search_learning_units(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne enote po iskalnem nizu.

        Išče po:
        - title,
        - short_description,
        - keywords,
        - content_topics,
        - acquired_competencies,
        - digcomp_competencies,
        - delivery_mode,
        - provider,
        - target_audience,
        - knowledge_assessment,
        - certificate.

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
                {"content_topics": {"$regex": query, "$options": "i"}},
                {"acquired_competencies": {"$regex": query, "$options": "i"}},
                {"digcomp_competencies.code": {"$regex": query, "$options": "i"}},
                {"digcomp_competencies.title": {"$regex": query, "$options": "i"}},
                {"digcomp_competencies.description": {"$regex": query, "$options": "i"}},
                {"delivery_mode": {"$regex": query, "$options": "i"}},
                {"provider": {"$regex": query, "$options": "i"}},
                {"target_audience": {"$regex": query, "$options": "i"}},
                {"knowledge_assessment": {"$regex": query, "$options": "i"}},
                {"certificate": {"$regex": query, "$options": "i"}},
            ]
        }

        return list(collection.find(search_filter))

    async def get_self_assessment_questions(
        self,
        learning_unit_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za eno učno enoto.

        TODO:
        - Kasneje dodati obravnavo, če učna enota nima vprašanj.
        """

        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        if not learning_unit:
            return []

        return learning_unit.get("self_assessment_questions", [])