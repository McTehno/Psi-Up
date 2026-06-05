from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class QuestionnaireAnswersRepository:
    """
    Repository za shranjene odgovore vprašalnika uporabnika.

    V novi strukturi ne uporabljamo več ločene user_progress kolekcije.
    Odgovori vprašalnikov so znotraj users dokumenta:

    users.progress.questionnaire_answers

    Repository skrbi samo za branje in pisanje v MongoDB.
    Poslovna pravila glede združevanja odgovorov so v service layerju,
    ker answer ni vedno bool in type ni vedno yes_no.
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

    async def get_all_questionnaire_answers(
        self,
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Vrne vse shranjene odgovore vprašalnikov za uporabnika.

        Uporablja se za prefill vprašalnika z zadnjimi eksplicitnimi odgovori.
        """

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return []

        questionnaire_answers = progress.get("questionnaire_answers", [])

        if not isinstance(questionnaire_answers, list):
            return []

        return [
            entry
            for entry in questionnaire_answers
            if isinstance(entry, dict)
        ]

    async def get_questionnaire_answers(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne shranjene odgovore za določen target_type + target_id.

        Za en target_type + target_id obstaja največ en zapis.
        """

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        questionnaire_answers = progress.get("questionnaire_answers", [])

        if not isinstance(questionnaire_answers, list):
            return None

        for entry in questionnaire_answers:
            if not isinstance(entry, dict):
                continue

            if (
                entry.get("target_type") == target_type
                and entry.get("target_id") == target_id
            ):
                return entry

        return None

    async def save_questionnaire_answers(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        answers: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani odgovore vprašalnika v users.progress.questionnaire_answers.

        Za isti target_type + target_id se obstoječ zapis zamenja
        z novo pripravljeno verzijo odgovorov.

        Pomembno:
        - Ta metoda ne izvaja yes/no poslovne logike.
        - Ta metoda ne predpostavlja, da je answer vedno bool.
        - Združevanje starih in novih odgovorov pripravi service layer.
        """

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        questionnaire_answers = progress.get("questionnaire_answers", [])

        if not isinstance(questionnaire_answers, list):
            questionnaire_answers = []

        now = datetime.now(timezone.utc)

        new_entry = {
            "target_type": target_type,
            "target_id": target_id,
            "last_submitted_at": now,
            "answers": answers,
        }

        updated_entries: List[Dict[str, Any]] = []
        entry_updated = False

        for entry in questionnaire_answers:
            if not isinstance(entry, dict):
                continue

            if (
                entry.get("target_type") == target_type
                and entry.get("target_id") == target_id
            ):
                updated_entries.append(new_entry)
                entry_updated = True
            else:
                updated_entries.append(entry)

        if not entry_updated:
            updated_entries.append(new_entry)

        collection = self.database[self.collection_name]

        collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "progress.questionnaire_answers": updated_entries,
                    "updated_at": now,
                }
            },
        )

        return await self._get_progress_response(user_id)
    
    async def save_assessment_result_snapshot(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        assessment_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani zadnji assessment result snapshot v obstoječ questionnaire_answers zapis.

        Pomembno:
        - ne spreminja answers,
        - ne spreminja was_answered,
        - ne dela merge logike,
        - samo doda/posodobi assessment_result.
        """

        progress = await self._ensure_progress_exists(user_id)

        if progress is None:
            return None

        now = datetime.now(timezone.utc)

        collection = self.database[self.collection_name]

        update_result = collection.update_one(
            {
                "_id": user_id,
                "progress.questionnaire_answers": {
                    "$elemMatch": {
                        "target_type": target_type,
                        "target_id": target_id,
                    }
                },
            },
            {
                "$set": {
                    "progress.questionnaire_answers.$.assessment_result": assessment_result,
                    "progress.questionnaire_answers.$.assessment_result_saved_at": now,
                    "updated_at": now,
                }
            },
        )

        if update_result.matched_count == 0:
            return None

        return await self._get_progress_response(user_id)