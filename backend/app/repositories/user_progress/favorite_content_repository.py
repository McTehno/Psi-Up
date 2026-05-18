from typing import Any, Dict, Optional


class FavoriteContentRepository:
    """
    Repository za priljubljene vsebine uporabnika.

    Skrbi samo za dodajanje in odstranjevanje priljubljenih
    učnih poti, modulov in učnih enot.
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

        TODO:
        - Glede na content_type izbrati pravi favorite seznam.
        - Dodati content_id samo, če še ni označen kot priljubljen.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_favorite_field_name(content_type)

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

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz priljubljenih.

        TODO:
        - Glede na content_type izbrati pravi favorite seznam.
        - Odstraniti content_id iz seznama.
        - Vrniti posodobljen napredek uporabnika.
        """

        field_name = self._get_favorite_field_name(content_type)

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

    def _get_favorite_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime polja za priljubljene vsebine glede na tip vsebine.

        TODO:
        - Po potrebi zamenjati stringe z Enum tipom.
        """

        mapping = {
            "learning_path": "favorite_learning_paths",
            "module": "favorite_modules",
            "learning_unit": "favorite_learning_units",
        }

        return mapping.get(content_type)