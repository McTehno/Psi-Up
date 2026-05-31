from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4


class AssessmentAssistantRepository:
    """Repository za tekstovno pomoč asistentke znotraj vprašalnika."""

    _indexes_created = False

    def __init__(self, database: Any):
        self.database = database
        self.sessions_collection = self.database["assessment_assistant_sessions"]
        self.messages_collection = self.database["assessment_assistant_messages"]

        if not AssessmentAssistantRepository._indexes_created:
            self._create_indexes()
            AssessmentAssistantRepository._indexes_created = True

    def _create_indexes(self) -> None:
        self.sessions_collection.create_index("session_id", unique=True)
        self.sessions_collection.create_index(
            [("learning_path_id", 1), ("module_id", 1), ("learning_unit_id", 1), ("question_id", 1)]
        )
        self.messages_collection.create_index([("session_id", 1), ("created_at", 1)])
        self.messages_collection.create_index([("question_id", 1), ("created_at", -1)])

    async def upsert_session(
        self,
        *,
        session_id: Optional[str],
        user_id: Optional[str],
        learning_path_id: str,
        module_id: Optional[str],
        learning_unit_id: Optional[str],
        question_id: str,
    ) -> str:
        now = datetime.now(timezone.utc)
        resolved_session_id = session_id or str(uuid4())

        self.sessions_collection.update_one(
            {"session_id": resolved_session_id},
            {
                "$set": {
                    "user_id": user_id,
                    "learning_path_id": learning_path_id,
                    "module_id": module_id,
                    "learning_unit_id": learning_unit_id,
                    "question_id": question_id,
                    "updated_at": now,
                },
                "$setOnInsert": {
                    "session_id": resolved_session_id,
                    "created_at": now,
                },
            },
            upsert=True,
        )

        return resolved_session_id

    async def save_message(
        self,
        *,
        session_id: str,
        question_id: str,
        role: str,
        content: str,
        prompt_version: str,
        model: Optional[str] = None,
    ) -> None:
        document: Dict[str, Any] = {
            "session_id": session_id,
            "question_id": question_id,
            "role": role,
            "content": content,
            "prompt_version": prompt_version,
            "created_at": datetime.now(timezone.utc),
        }

        if model:
            document["model"] = model

        self.messages_collection.insert_one(document)
