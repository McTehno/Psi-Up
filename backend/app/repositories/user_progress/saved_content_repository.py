from typing import Any, Dict, Optional


class SavedContentRepository:
    """
    Repository za shranjene vsebine uporabnika.

    Skrbi za dodajanje in odstranjevanje shranjenih
    učnih poti, modulov in učnih enot v kolekciji user_progress.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "user_progress"

    async def save_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani vsebino uporabniku.

        content_type določi, v kateri seznam se shrani content_id.
        """

        field_name = self._get_saved_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"user_id": user_id},
            {"$addToSet": {field_name: content_id}}
        )

        return collection.find_one({"user_id": user_id})

    async def remove_saved_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani shranjeno vsebino uporabnika.

        content_type določi, iz katerega seznama se odstrani content_id.
        """

        field_name = self._get_saved_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"user_id": user_id},
            {"$pull": {field_name: content_id}}
        )

        return collection.find_one({"user_id": user_id})

    def _get_saved_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime polja za shranjene vsebine glede na tip vsebine.
        """

        mapping = {
            "learning_path": "saved_learning_paths",
            "module": "saved_modules",
            "learning_unit": "saved_learning_units",
        }

        return mapping.get(content_type)