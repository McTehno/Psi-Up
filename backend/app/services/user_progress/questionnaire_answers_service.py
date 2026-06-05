from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException


class QuestionnaireAnswersService:
    """
    Service za shranjevanje odgovorov vprašalnika v uporabnikov progress.

    Odgovori se hranijo znotraj:

    users.progress.questionnaire_answers

    Pomembno:
    - type ni vedno yes_no.
    - answer ni vedno bool.
    - yes/no logika mora ostati ločena od drugih tipov vprašanj.
    - Pri drugih tipih odgovorov ne uporabljamo bool pravil.
    """

    VALID_TARGET_TYPES = {
        "learning_path",
        "module",
        "learning_unit",
    }

    def __init__(self, questionnaire_answers_repository: Any):
        """
        Inicializira service z repository-jem za odgovore vprašalnika.
        """

        self.questionnaire_answers_repository = questionnaire_answers_repository

    async def save_questionnaire_answers(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        answers: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani odgovore vprašalnika za določen target_type + target_id.

        Za isti target_type + target_id hranimo samo zadnje veljavno stanje.
        """

        self._validate_request_data(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            answers=answers,
        )

        existing_entry = await self.questionnaire_answers_repository.get_questionnaire_answers(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
        )

        existing_answers = []

        if existing_entry and isinstance(existing_entry, dict):
            raw_existing_answers = existing_entry.get("answers", [])

            if isinstance(raw_existing_answers, list):
                existing_answers = [
                    answer
                    for answer in raw_existing_answers
                    if isinstance(answer, dict)
                ]

        prepared_answers = self._merge_answers(
            existing_answers=existing_answers,
            new_answers=answers,
        )

        return await self.questionnaire_answers_repository.save_questionnaire_answers(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            answers=prepared_answers,
        )

    def _validate_request_data(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        answers: List[Dict[str, Any]],
    ) -> None:
        """
        Validira osnovne podatke za shranjevanje odgovorov.
        """

        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="Manjka user_id.",
            )

        if target_type not in self.VALID_TARGET_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Neveljaven target_type. Dovoljene vrednosti so: learning_path, module, learning_unit.",
            )

        if not target_id:
            raise HTTPException(
                status_code=400,
                detail="Manjka target_id.",
            )

        if not isinstance(answers, list):
            raise HTTPException(
                status_code=400,
                detail="answers mora biti seznam odgovorov.",
            )

    def _merge_answers(
        self,
        existing_answers: List[Dict[str, Any]],
        new_answers: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Združi stare in nove odgovore.

        Odgovori se ujemajo po question_id, če obstaja.
        Če question_id manjka, uporabimo normalizirano besedilo vprašanja.

        Pomembno:
        - yes/no logika je omejena samo na bool odgovore.
        - Pri drugih tipih odgovorov nov odgovor zamenja starega.
        """

        merged_answers_by_key: Dict[str, Dict[str, Any]] = {}

        for existing_answer in existing_answers:
            key = self._get_answer_key(existing_answer)

            if not key:
                continue

            merged_answers_by_key[key] = existing_answer

        for new_answer in new_answers:
            if not isinstance(new_answer, dict):
                continue

            key = self._get_answer_key(new_answer)

            if not key:
                continue

            existing_answer = merged_answers_by_key.get(key)

            if existing_answer:
                merged_answers_by_key[key] = self._merge_single_answer(
                    existing_answer=existing_answer,
                    new_answer=new_answer,
                )
            else:
                merged_answers_by_key[key] = self._prepare_new_answer(new_answer)

        return list(merged_answers_by_key.values())

    def _merge_single_answer(
        self,
        existing_answer: Dict[str, Any],
        new_answer: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Združi en obstoječ odgovor z novim odgovorom.

        Pravilo:
        - če je novi odgovor ekspliciten, prepiše starega;
        - če je novi odgovor samo backend fallback, ne sme prepisati
        že obstoječega eksplicitnega odgovora.
        """

        if (
            new_answer.get("was_answered") is False
            and existing_answer.get("was_answered") is True
        ):
            return existing_answer

        merged_answer = {
            **existing_answer,
            **new_answer,
        }

        old_value = existing_answer.get("answer")
        new_value = new_answer.get("answer")

        merged_answer["answer"] = self._merge_answer_value(
            old_answer=old_value,
            new_answer=new_value,
        )

        if new_answer.get("was_answered") is True:
            merged_answer["answered_at"] = datetime.now(timezone.utc)

        if "was_answered" not in merged_answer:
            merged_answer["was_answered"] = True

        return merged_answer

    def _prepare_new_answer(self, answer: Dict[str, Any]) -> Dict[str, Any]:
            """
            Pripravi nov odgovor za shranjevanje.

            Če answered_at ni podan, ga nastavimo na trenutni čas.
            Če was_answered ni podan, ga nastavimo na True, ker odgovor
            prihaja iz dejansko oddanih odgovorov uporabnika.

            Backend-dodana neodgovorjena vprašanja bodo posebej označena z:
            was_answered = False.
            """

            prepared_answer = dict(answer)

            if not prepared_answer.get("answered_at"):
                prepared_answer["answered_at"] = datetime.now(timezone.utc)

            if "was_answered" not in prepared_answer:
                prepared_answer["was_answered"] = True

            return prepared_answer

    def _merge_answer_value(self, old_answer: Any, new_answer: Any) -> Any:
        """
        Vrne novo vrednost odgovora.

        Novo poslovno pravilo:
        - DA -> NE je dovoljeno, če uporabnik eksplicitno odgovori NE.
        - Completed status se zaradi tega ne briše.
        - Ta service skrbi samo za zadnje shranjene odgovore.
        """

        return new_answer

    async def get_latest_explicit_answer_maps(
        self,
        user_id: str,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Vrne mapo zadnjih eksplicitnih odgovorov uporabnika.

        Upoštevamo samo odgovore z was_answered=True.
        Če isto vprašanje obstaja v več targetih, zmaga odgovor z najnovejšim answered_at.
        """

        if not user_id:
            return {}

        questionnaire_answers = (
            await self.questionnaire_answers_repository.get_all_questionnaire_answers(
                user_id=user_id
            )
        )

        latest_answers_by_key: Dict[str, Dict[str, Any]] = {}

        for entry in questionnaire_answers:
            if not isinstance(entry, dict):
                continue

            answers = entry.get("answers", [])

            if not isinstance(answers, list):
                continue

            for answer in answers:
                if not isinstance(answer, dict):
                    continue

                if answer.get("was_answered") is not True:
                    continue

                keys = self._get_answer_keys(answer)

                if not keys:
                    continue

                for key in keys:
                    existing_answer = latest_answers_by_key.get(key)

                    if not existing_answer:
                        latest_answers_by_key[key] = dict(answer)
                        continue

                    if self._is_newer_answer(
                        new_answer=answer,
                        existing_answer=existing_answer,
                    ):
                        latest_answers_by_key[key] = dict(answer)

        return latest_answers_by_key

    def _is_newer_answer(
        self,
        new_answer: Dict[str, Any],
        existing_answer: Dict[str, Any],
    ) -> bool:
        """
        Preveri, ali je novi odgovor novejši od že shranjenega odgovora.
        """

        new_answered_at = self._parse_datetime_value(new_answer.get("answered_at"))
        existing_answered_at = self._parse_datetime_value(
            existing_answer.get("answered_at")
        )

        if new_answered_at is None and existing_answered_at is None:
            return True

        if new_answered_at is None:
            return False

        if existing_answered_at is None:
            return True

        return new_answered_at >= existing_answered_at
    
    
    def _parse_datetime_value(
        self,
        value: Any,
    ) -> Optional[datetime]:
        """
        Varno pretvori datetime vrednost.

        MongoDB lahko vrne datetime objekt, API/podatki pa lahko vsebujejo string.
        """

        if isinstance(value, datetime):
            return value

        if isinstance(value, str) and value.strip():
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None

        return None
    def _get_answer_keys(
        self,
        answer: Dict[str, Any],
    ) -> List[str]:
        """
        Vrne vse možne ključe za odgovor.

        Uporabimo:
        - question_id oziroma id;
        - normalizirano besedilo vprašanja.
        """

        keys: List[str] = []

        question_id = answer.get("question_id") or answer.get("id")

        if isinstance(question_id, str) and question_id.strip():
            keys.append(f"id:{question_id.strip()}")

        question = answer.get("question")

        if isinstance(question, str) and question.strip():
            keys.append(f"question:{self._normalize_question_text(question)}")

        return keys

    def _get_answer_key(self, answer: Dict[str, Any]) -> Optional[str]:
        """
        Vrne ključ za primerjavo odgovorov.

        Najprej uporabimo question_id.
        Če question_id manjka, uporabimo normalizirano besedilo vprašanja.
        """

        question_id = answer.get("question_id")

        if isinstance(question_id, str) and question_id.strip():
            return f"id:{question_id.strip()}"

        question = answer.get("question")

        if isinstance(question, str) and question.strip():
            return f"question:{self._normalize_question_text(question)}"

        return None

    def _normalize_question_text(self, question: str) -> str:
        """
        Normalizira besedilo vprašanja za primerjavo.

        To pomaga pri primerih, ko se isto vprašanje pojavi v več učnih enotah.
        """

        return " ".join(question.lower().strip().split())
    
    async def save_assessment_result_snapshot(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
        assessment_result: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani assessment result snapshot brez spreminjanja odgovorov vprašalnika.
        """

        self._validate_target_lookup_data(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
        )

        return await self.questionnaire_answers_repository.save_assessment_result_snapshot(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            assessment_result=assessment_result,
        )
    
    async def get_questionnaire_answers(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne zadnji shranjeni questionnaire_answers zapis za target.

        Uporablja se za branje shranjenega assessment_result snapshota.
        """

        self._validate_target_lookup_data(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
        )

        return await self.questionnaire_answers_repository.get_questionnaire_answers(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
        )
    
    def _validate_target_lookup_data(
        self,
        user_id: str,
        target_type: str,
        target_id: str,
    ) -> None:
        """
        Validira podatke za branje target zapisa.
        """

        if not user_id:
            raise HTTPException(status_code=400, detail="Manjka user_id.")

        if target_type not in self.VALID_TARGET_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Neveljaven target_type.",
            )

        if not target_id:
            raise HTTPException(status_code=400, detail="Manjka target_id.")