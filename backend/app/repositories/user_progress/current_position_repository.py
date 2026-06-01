from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class CurrentPositionRepository:
    """
    Repository za trenutno pozicijo uporabnika.

    V novi strukturi ne uporabljamo več ločene user_progress kolekcije.
    Trenutne pozicije so znotraj users dokumenta:

    users.progress.current_positions
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

    async def get_current_positions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Vrne vse trenutne pozicije uporabnika.
        """

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return []

        current_positions = progress.get("current_positions", [])

        if not isinstance(current_positions, list):
            return []

        return [
            position
            for position in current_positions
            if isinstance(position, dict)
        ]

    async def update_current_position(
        self,
        user_id: str,
        learning_path_id: Optional[str] = None,
        current_module_id: Optional[str] = None,
        current_learning_unit_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi trenutno pozicijo uporabnika.

        Če za learning_path_id že obstaja pozicija, jo posodobi.
        Če še ne obstaja, doda novo pozicijo.

        learning_path_id je glavni ključ pozicije, ker uporabnik lahko ima
        različno trenutno pozicijo v različnih učnih poteh.
        """

        if not learning_path_id:
            return None

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        current_positions = progress.get("current_positions", [])

        if not isinstance(current_positions, list):
            current_positions = []

        now = datetime.now(timezone.utc)

        new_position = {
            "learning_path_id": learning_path_id,
            "current_module_id": current_module_id,
            "current_learning_unit_id": current_learning_unit_id,
            "updated_at": now,
        }

        updated_positions: List[Dict[str, Any]] = []
        position_updated = False

        for position in current_positions:
            if not isinstance(position, dict):
                continue

            if position.get("learning_path_id") == learning_path_id:
                updated_positions.append(new_position)
                position_updated = True
            else:
                updated_positions.append(position)

        if not position_updated:
            updated_positions.append(new_position)

        collection = self.database[self.collection_name]

        collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "progress.current_positions": updated_positions,
                    "updated_at": now,
                }
            },
        )

        return await self._get_progress_response(user_id)