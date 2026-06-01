from datetime import datetime, timezone
from typing import Any, Dict, Optional


class FavoriteContentRepository:
    """
    Repository za priljubljene vsebine uporabnika.

    V novi strukturi ne uporabljamo več ločene user_progress kolekcije.
    Priljubljene vsebine so znotraj users dokumenta:

    users.progress.favorites.learning_path_ids
    users.progress.favorites.module_ids
    users.progress.favorites.learning_unit_ids
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "users"

    def _build_empty_progress(self) -> Dict[str, Any]:
        """
        Zgradi začetno progress strukturo.
        """

        return {
            "saved": {
                "learning_path_ids": [],
                "module_ids": [],
                "learning_unit_ids": [],
            },
            "favorites": {
                "learning_path_ids": [],
                "module_ids": [],
                "learning_unit_ids": [],
            },
            "completed": {
                "learning_path_ids": [],
                "module_ids": [],
                "learning_unit_ids": [],
            },
            "current_positions": [],
            "questionnaire_answers": [],
        }

    def _format_progress_response(
        self,
        user_id: str,
        progress: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Vrne progress response v obliki, ki jo uporablja API.
        """

        return {
            "_id": f"progress_{user_id}",
            "user_id": user_id,
            **progress,
        }

    async def _ensure_progress_exists(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Zagotovi, da users dokument vsebuje progress strukturo.
        """

        collection = self.database[self.collection_name]

        user = collection.find_one({"_id": user_id})

        if not user:
            return None

        progress = user.get("progress")

        if isinstance(progress, dict):
            return progress

        progress = self._build_empty_progress()

        collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "progress": progress,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        return progress

    async def _get_progress_response(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne posodobljen progress response.
        """

        collection = self.database[self.collection_name]

        user = collection.find_one({"_id": user_id})

        if not user:
            return None

        progress = user.get("progress")

        if not isinstance(progress, dict):
            progress = self._build_empty_progress()

        return self._format_progress_response(
            user_id=user_id,
            progress=progress,
        )

    async def favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot priljubljeno.

        content_type določi, v kateri seznam se shrani content_id.
        """

        field_name = self._get_favorite_field_name(content_type)

        if not field_name:
            return None

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"_id": user_id},
            {
                "$addToSet": {
                    field_name: content_id,
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )

        return await self._get_progress_response(user_id)

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz priljubljenih.

        content_type določi, iz katerega seznama se odstrani content_id.
        """

        field_name = self._get_favorite_field_name(content_type)

        if not field_name:
            return None

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        collection = self.database[self.collection_name]

        collection.update_one(
            {"_id": user_id},
            {
                "$pull": {
                    field_name: content_id,
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )

        return await self._get_progress_response(user_id)

    def _get_favorite_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime nested polja za priljubljene vsebine glede na tip vsebine.
        """

        mapping = {
            "learning_path": "progress.favorites.learning_path_ids",
            "module": "progress.favorites.module_ids",
            "learning_unit": "progress.favorites.learning_unit_ids",
        }

        return mapping.get(content_type)