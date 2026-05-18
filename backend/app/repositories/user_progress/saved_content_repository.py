from typing import Any, Dict, Optional


class SavedContentRepository:
    """
    Repository za shranjene vsebine uporabnika.

    Skrbi samo za dodajanje in odstranjevanje shranjenih
    učnih poti, modulov in učnih enot.
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
        Shrani učno pot, modul ali učno enoto uporabniku.

        TODO:
        - Glede na content_type izbrati pravi saved seznam.
        - Dodati content_id samo, če še ni shranjen.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_saved_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB update logiko.
        # Primer:
        # await collection.update_one(
        #     {"user_id": user_id},
        #     {"$addToSet": {field_name: content_id}}
        # )

        return None

    async def remove_saved_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani shranjeno vsebino uporabnika.

        TODO:
        - Glede na content_type izbrati pravi saved seznam.
        - Odstraniti content_id iz seznama.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_saved_field_name(content_type)

        if not field_name:
            return None

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB update logiko.
        # Primer:
        # await collection.update_one(
        #     {"user_id": user_id},
        #     {"$pull": {field_name: content_id}}
        # )

        return None

    def _get_saved_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime polja za shranjene vsebine glede na tip vsebine.

        TODO:
        - Po potrebi zamenjati stringe z Enum tipom.
        """

        mapping = {
            "learning_path": "saved_learning_paths",
            "module": "saved_modules",
            "learning_unit": "saved_learning_units",
        }

        return mapping.get(content_type)