from datetime import datetime, timezone
from typing import Any, Dict, Optional


class CompletedContentRepository:
    """
    Repository za dokončane vsebine uporabnika.

    V novi strukturi ne uporabljamo več ločene user_progress kolekcije.
    Dokončane vsebine so znotraj users dokumenta:

    users.progress.completed.learning_path_ids
    users.progress.completed.module_ids
    users.progress.completed.learning_unit_ids
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

    async def complete_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot dokončano.

        content_type določi, v kateri seznam se shrani content_id.
        """

        field_name = self._get_completed_field_name(content_type)

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

    async def remove_completed_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz dokončanih.

        content_type določi, iz katerega seznama se odstrani content_id.
        """

        field_name = self._get_completed_field_name(content_type)

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

    def _get_completed_field_name(self, content_type: str) -> Optional[str]:
        """
        Vrne ime nested polja za dokončane vsebine glede na tip vsebine.
        """

        mapping = {
            "learning_path": "progress.completed.learning_path_ids",
            "module": "progress.completed.module_ids",
            "learning_unit": "progress.completed.learning_unit_ids",
        }

        return mapping.get(content_type)