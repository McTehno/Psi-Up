from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database


class LearningUnitAssistantRepository:
    def __init__(self, database: Database):
        self.database = database
        self.learning_units = database["learning_units"]
        self.modules = database["modules"]
        self.user_progress = database["user_progress"]
        self.sessions = database["learning_unit_assistant_sessions"]
        self.messages = database["learning_unit_assistant_messages"]
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        self.sessions.create_index("session_id", unique=True)
        self.sessions.create_index([("learning_unit_id", 1), ("user_id", 1)])
        self.messages.create_index([("session_id", 1), ("created_at", 1)])
        self.messages.create_index([("learning_unit_id", 1), ("created_at", -1)])

    def _id_filter(self, entity_id: str) -> Dict[str, Any]:
        filters: List[Dict[str, Any]] = [
            {"_id": entity_id},
            {"id": entity_id},
        ]

        try:
            filters.append({"_id": ObjectId(entity_id)})
        except (InvalidId, TypeError):
            pass

        return {"$or": filters}

    async def get_learning_unit(
        self,
        learning_unit_id: str,
    ) -> Optional[Dict[str, Any]]:
        return self.learning_units.find_one(self._id_filter(learning_unit_id))

    async def get_modules_containing_learning_unit(
        self,
        learning_unit_id: str,
    ) -> List[Dict[str, Any]]:
        filters: List[Dict[str, Any]] = [
            {"learning_units.learning_unit_id": learning_unit_id},
            {"learning_units.learningUnitId": learning_unit_id},
            {"learning_units.unit_id": learning_unit_id},
            {"learning_units.id": learning_unit_id},
            {"learning_unit_ids": learning_unit_id},
        ]

        try:
            object_id = ObjectId(learning_unit_id)
            filters.extend(
                [
                    {"learning_units.learning_unit_id": object_id},
                    {"learning_units.id": object_id},
                    {"learning_unit_ids": object_id},
                ]
            )
        except (InvalidId, TypeError):
            pass

        return list(self.modules.find({"$or": filters}))

    async def get_user_progress(
        self,
        user_id: Optional[str],
    ) -> Optional[Dict[str, Any]]:
        if not user_id:
            return None

        filters: List[Dict[str, Any]] = [
            {"user_id": user_id},
            {"userId": user_id},
            {"id": user_id},
            {"_id": user_id},
        ]

        try:
            filters.append({"_id": ObjectId(user_id)})
        except (InvalidId, TypeError):
            pass

        return self.user_progress.find_one({"$or": filters})

    async def upsert_session(
        self,
        session_id: Optional[str],
        learning_unit_id: str,
        user_id: Optional[str],
    ) -> str:
        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or str(uuid4())

        self.sessions.update_one(
            {"session_id": resolved_session_id},
            {
                "$setOnInsert": {
                    "session_id": resolved_session_id,
                    "learning_unit_id": learning_unit_id,
                    "user_id": user_id,
                    "created_at": now,
                },
                "$set": {
                    "updated_at": now,
                },
            },
            upsert=True,
        )

        return resolved_session_id

    async def save_message(
        self,
        session_id: str,
        learning_unit_id: str,
        role: str,
        content: str,
        prompt_version: str,
        model: Optional[str] = None,
    ) -> None:
        document: Dict[str, Any] = {
            "session_id": session_id,
            "learning_unit_id": learning_unit_id,
            "role": role,
            "content": content,
            "prompt_version": prompt_version,
            "created_at": datetime.now(timezone.utc),
        }

        if model:
            document["model"] = model

        self.messages.insert_one(document)

        self.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"updated_at": datetime.now(timezone.utc)}},
        )