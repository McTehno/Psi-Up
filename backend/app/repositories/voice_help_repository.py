from datetime import datetime, timezone
from typing import Any, Dict, Optional


class VoiceHelpRepository:
    """
    MongoDB cache za glasovno pomoč.

    V MongoDB hranimo samo metadata, help_text, SSML in blob_name.
    Dejanski audio je v Azure Blob Storage.
    """

    _indexes_created = False

    def __init__(self, database: Any):
        self.database = database
        self.collection = self.database["question_voice_help"]

        if not VoiceHelpRepository._indexes_created:
            self._create_indexes()
            VoiceHelpRepository._indexes_created = True

    def _create_indexes(self) -> None:
        self.collection.create_index(
            [
                ("content_hash", 1),
                ("locale", 1),
                ("voice_name", 1),
            ],
            unique=True,
            name="unique_voice_help_cache",
        )

        self.collection.create_index(
            [
                ("question_id", 1),
                ("target_type", 1),
                ("target_id", 1),
            ],
            name="voice_help_question_target_lookup",
        )

    async def get_ready_by_hash(
        self,
        content_hash: str,
        locale: str,
        voice_name: str,
    ) -> Optional[Dict[str, Any]]:
        return self.collection.find_one(
            {
                "content_hash": content_hash,
                "locale": locale,
                "voice_name": voice_name,
                "status": "ready",
            }
        )

    async def save_ready(self, document: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)

        document_to_set = {
            **document,
            "status": "ready",
            "updated_at": now,
        }

        # Pomembno:
        # created_at NE sme biti hkrati v $set in $setOnInsert.
        # Zato ga odstranimo iz $set dela.
        document_to_set.pop("created_at", None)

        filter_query = {
            "content_hash": document["content_hash"],
            "locale": document["locale"],
            "voice_name": document["voice_name"],
        }

        self.collection.update_one(
            filter_query,
            {
                "$set": document_to_set,
                "$setOnInsert": {
                    "created_at": now,
                },
            },
            upsert=True,
        )

        saved_document = self.collection.find_one(filter_query)

        return saved_document