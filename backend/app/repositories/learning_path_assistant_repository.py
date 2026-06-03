from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.database import Database


class LearningPathAssistantRepository:
    def __init__(self, database: Database):
        self.database = database
        self.learning_paths = database["learning_paths"]
        self.modules = database["modules"]
        self.learning_units = database["learning_units"]
        self.user_progress = database["user_progress"]
        self.sessions = database["learning_path_assistant_sessions"]
        self.messages = database["learning_path_assistant_messages"]
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        self.sessions.create_index("session_id", unique=True)
        self.sessions.create_index([("learning_path_id", 1), ("user_id", 1)])
        self.messages.create_index([("session_id", 1), ("created_at", 1)])
        self.messages.create_index([("learning_path_id", 1), ("created_at", -1)])

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

    def _object_ids(self, ids: List[str]) -> List[ObjectId]:
        object_ids: List[ObjectId] = []

        for entity_id in ids:
            try:
                object_ids.append(ObjectId(entity_id))
            except (InvalidId, TypeError):
                continue

        return object_ids

    def _bulk_id_filter(self, ids: List[str]) -> Dict[str, Any]:
        object_ids = self._object_ids(ids)

        filters: List[Dict[str, Any]] = [
            {"_id": {"$in": ids}},
            {"id": {"$in": ids}},
        ]

        if object_ids:
            filters.append({"_id": {"$in": object_ids}})

        return {"$or": filters}

    def _order_documents_by_ids(
        self,
        documents: List[Dict[str, Any]],
        ids: List[str],
    ) -> List[Dict[str, Any]]:
        by_id: Dict[str, Dict[str, Any]] = {}

        for document in documents:
            if "_id" in document:
                by_id[str(document["_id"])] = document

            if document.get("id"):
                by_id[str(document["id"])] = document

        ordered: List[Dict[str, Any]] = []
        seen: set[str] = set()

        for entity_id in ids:
            document = by_id.get(entity_id)

            if document and entity_id not in seen:
                ordered.append(document)
                seen.add(entity_id)

        return ordered

    async def get_learning_path(
        self,
        learning_path_id: str,
    ) -> Optional[Dict[str, Any]]:
        return self.learning_paths.find_one(self._id_filter(learning_path_id))

    async def get_modules_by_ids(
        self,
        module_ids: List[str],
    ) -> List[Dict[str, Any]]:
        clean_ids = [module_id for module_id in module_ids if module_id]

        if not clean_ids:
            return []

        documents = list(self.modules.find(self._bulk_id_filter(clean_ids)))
        return self._order_documents_by_ids(documents, clean_ids)

    async def get_learning_units_by_ids(
        self,
        learning_unit_ids: List[str],
    ) -> List[Dict[str, Any]]:
        clean_ids = [unit_id for unit_id in learning_unit_ids if unit_id]

        if not clean_ids:
            return []

        documents = list(self.learning_units.find(self._bulk_id_filter(clean_ids)))
        return self._order_documents_by_ids(documents, clean_ids)

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
        learning_path_id: str,
        user_id: Optional[str],
    ) -> str:
        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or str(uuid4())

        self.sessions.update_one(
            {"session_id": resolved_session_id},
            {
                "$setOnInsert": {
                    "session_id": resolved_session_id,
                    "learning_path_id": learning_path_id,
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
        learning_path_id: str,
        role: str,
        content: str,
        prompt_version: str,
        model: Optional[str] = None,
    ) -> None:
        document: Dict[str, Any] = {
            "session_id": session_id,
            "learning_path_id": learning_path_id,
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