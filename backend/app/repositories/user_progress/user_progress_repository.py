from datetime import datetime, timezone
from typing import Any, Dict, Optional


class UserProgressRepository:
    """
    Repository za napredek uporabnika.

    V novi strukturi ne uporabljamo več ločene user_progress kolekcije.
    Progress je shranjen znotraj users dokumenta v polju progress.

    Ta repository ostane kot abstraction layer, da service/API logika
    ne potrebuje direktnega znanja o tem, kje je progress shranjen.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "users"

    def _build_empty_progress(self) -> Dict[str, Any]:
        """
        Zgradi začetno progress strukturo za uporabnika.
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

    async def get_progress_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne progress uporabnika glede na lokalni user_id.

        Progress je shranjen znotraj users dokumenta.
        Response vseeno vsebuje user_id, da ostane združljiv z obstoječo API logiko.
        """

        collection = self.database[self.collection_name]

        user = collection.find_one({"_id": user_id})

        if not user:
            return None

        progress = user.get("progress")

        if not isinstance(progress, dict):
            progress = self._build_empty_progress()

        return {
            "_id": f"progress_{user_id}",
            "user_id": user_id,
            **progress,
        }

    async def create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Ustvari začetno progress strukturo znotraj users dokumenta.

        Če uporabnik ne obstaja, vrne prazen progress response,
        vendar ne ustvari novega users dokumenta.
        """

        collection = self.database[self.collection_name]

        new_progress = self._build_empty_progress()
        now = datetime.now(timezone.utc)

        result = collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "progress": new_progress,
                    "updated_at": now,
                }
            },
        )

        if result.matched_count == 0:
            return {
                "_id": f"progress_{user_id}",
                "user_id": user_id,
                **new_progress,
            }

        return {
            "_id": f"progress_{user_id}",
            "user_id": user_id,
            **new_progress,
        }

    async def get_or_create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Vrne obstoječ progress uporabnika ali ustvari začetnega.

        Če users dokument nima progress polja, ga doda.
        """

        existing_progress = await self.get_progress_by_user_id(user_id)

        if existing_progress:
            return existing_progress

        return await self.create_progress(user_id)