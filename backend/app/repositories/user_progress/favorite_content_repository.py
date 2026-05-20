from typing import Any, Dict, Optional


class FavoriteContentRepository:
    """
    Repository za priljubljene vsebine uporabnika.

    Skrbi za dodajanje in odstranjevanje priljubljenih
    učnih poti, modulov in učnih enot v kolekciji user_progress.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "user_progress"

    async def favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot priljubljeno.

        content_type določi, v kateri seznam se shrani content_id.
        """

        field_name = self._get_favorite_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"user_id": user_id},
            {"$addToSet": {field_name: content_id}}
        )

        return collection.find_one({"user_id": user_id})

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz priljubljenih.

        content_type določi, iz katerega seznama se odstrani content_id.
        """

        field_name = self._get_favorite_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"user_id": user_id},
            {"$pull": {field_name: content_id}}
        )

        return collection.find_one({"user_id": user_id})

    def _get_favorite_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime polja za priljubljene vsebine glede na tip vsebine.
        """

        mapping = {
            "learning_path": "favorite_learning_paths",
            "module": "favorite_modules",
            "learning_unit": "favorite_learning_units",
        }

        return mapping.get(content_type)