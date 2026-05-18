from typing import Any, Dict, Optional


class CompletedContentRepository:
    """
    Repository za dokončane vsebine uporabnika.

    Skrbi samo za dodajanje in odstranjevanje dokončanih
    učnih poti, modulov in učnih enot.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "user_progress"

    async def complete_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot dokončano.

        TODO:
        - Glede na content_type izbrati pravi completed seznam.
        - Dodati content_id samo, če še ni označen kot dokončan.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_completed_field_name(content_type)

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

    async def remove_completed_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz dokončanih.

        TODO:
        - Glede na content_type izbrati pravi completed seznam.
        - Odstraniti content_id iz seznama.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_completed_field_name(content_type)

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

    def _get_completed_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime polja za dokončane vsebine glede na tip vsebine.

        TODO:
        - Po potrebi zamenjati stringe z Enum tipom.
        """

        mapping = {
            "learning_path": "completed_learning_paths",
            "module": "completed_modules",
            "learning_unit": "completed_learning_units",
        }

        return mapping.get(content_type)