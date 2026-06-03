from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional

from openai import AsyncOpenAI

from app.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT,
    LEARNING_UNIT_ASSISTANT_MAX_COMPLETION_TOKENS,
    LEARNING_UNIT_ASSISTANT_PROMPT_VERSION,
    LEARNING_UNIT_ASSISTANT_REASONING_EFFORT,
)
from app.repositories.learning_unit_assistant_repository import (
    LearningUnitAssistantRepository,
)
from app.schemas.learning_unit_assistant_schema import (
    LearningUnitAssistantMessageRequest,
)
from app.services.learning_unit_assistant.learning_unit_assistant_prompt import (
    LEARNING_UNIT_ASSISTANT_SYSTEM_PROMPT,
)


class LearningUnitAssistantService:
    def __init__(self, repository: LearningUnitAssistantRepository):
        self.repository = repository

        if not AZURE_OPENAI_ENDPOINT:
            raise RuntimeError("AZURE_OPENAI_ENDPOINT ni nastavljen.")

        if not AZURE_OPENAI_API_KEY:
            raise RuntimeError("AZURE_OPENAI_API_KEY ni nastavljen.")

        self.client = AsyncOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            base_url=f"{AZURE_OPENAI_ENDPOINT.rstrip('/')}/openai/v1/",
        )

    async def create_message(
        self,
        request: LearningUnitAssistantMessageRequest,
    ) -> Dict[str, str]:
        user_message = request.user_message.strip()

        if not user_message:
            raise ValueError("Vprašanje ne sme biti prazno.")

        learning_unit = await self.repository.get_learning_unit(
            request.learning_unit_id,
        )

        if not learning_unit:
            raise ValueError("Učna enota ne obstaja ali ni dostopna.")

        session_id = await self.repository.upsert_session(
            session_id=request.session_id,
            learning_unit_id=request.learning_unit_id,
            user_id=request.user_id,
        )

        await self.repository.save_message(
            session_id=session_id,
            learning_unit_id=request.learning_unit_id,
            role="user",
            content=user_message,
            prompt_version=LEARNING_UNIT_ASSISTANT_PROMPT_VERSION,
        )

        context = await self._build_context(
            learning_unit=learning_unit,
            learning_unit_id=request.learning_unit_id,
            user_id=request.user_id,
        )

        answer = await self._generate_answer(
            context=context,
            user_message=user_message,
        )

        await self.repository.save_message(
            session_id=session_id,
            learning_unit_id=request.learning_unit_id,
            role="assistant",
            content=answer,
            prompt_version=LEARNING_UNIT_ASSISTANT_PROMPT_VERSION,
            model=AZURE_OPENAI_DEPLOYMENT,
        )

        return {
            "session_id": session_id,
            "answer": answer,
        }

    async def _build_context(
        self,
        learning_unit: Dict[str, Any],
        learning_unit_id: str,
        user_id: Optional[str],
    ) -> str:
        related_modules = await self.repository.get_modules_containing_learning_unit(
            learning_unit_id,
        )
        progress = await self.repository.get_user_progress(user_id)

        lines: List[str] = []

        lines.append("UČNA ENOTA")
        lines.append(f"- id: {self._get_document_id(learning_unit) or learning_unit_id}")
        lines.append(
            f"- naslov: {self._pick_text(learning_unit, ['title', 'name'], 'Ni navedeno')}"
        )
        lines.append(
            f"- opis: {self._pick_text(learning_unit, ['short_description', 'description', 'summary'], 'Ni navedeno')}"
        )
        lines.append(f"- trajanje: {self._duration_text(learning_unit)}")

        delivery_mode = self._first_value(learning_unit, ["delivery_mode", "deliveryMode"])
        if delivery_mode:
            lines.append(f"- način izvedbe: {delivery_mode}")

        provider = self._first_value(learning_unit, ["provider"])
        if provider:
            lines.append(f"- izvajalec: {provider}")

        target_audience = self._first_value(
            learning_unit,
            ["target_audience", "targetAudience"],
        )
        if target_audience:
            lines.append(f"- ciljna publika: {target_audience}")

        prerequisites = self._list_values(
            learning_unit,
            ["prerequisites", "requirements"],
        )
        if prerequisites:
            lines.append(f"- predpogoji: {', '.join(prerequisites)}")

        keywords = self._list_values(learning_unit, ["keywords", "tags"])
        if keywords:
            lines.append(f"- ključne besede: {', '.join(keywords)}")

        knowledge_assessment = self._first_value(
            learning_unit,
            ["knowledge_assessment", "knowledgeAssessment"],
        )
        if knowledge_assessment:
            lines.append(f"- preverjanje znanja: {knowledge_assessment}")

        certificate = self._first_value(learning_unit, ["certificate"])
        if certificate:
            lines.append(f"- potrdilo/certifikat: {certificate}")

        content_summary = self._pick_text(
            learning_unit,
            ["content_summary", "content", "body", "learning_content"],
            "",
        )
        if content_summary:
            lines.append(f"- vsebinski povzetek: {self._truncate(content_summary, 1200)}")

        lines.append("")
        lines.append("VSEBINSKE TEME")

        topics = self._content_topic_values(learning_unit)
        if topics:
            for topic in topics:
                lines.append(f"- {topic}")
        else:
            lines.append("- V kontekstu ni navedenih vsebinskih tem.")

        lines.append("")
        lines.append("KOMPETENCE / SPRETNOSTI")

        acquired_competencies = self._list_values(
            learning_unit,
            ["acquired_competencies", "acquiredCompetencies", "skills"],
        )
        if acquired_competencies:
            lines.append(f"- pridobljene kompetence: {', '.join(acquired_competencies)}")

        digcomp_competencies = self._digcomp_competency_values(learning_unit)
        if digcomp_competencies:
            lines.append("- digitalne kompetence:")
            for competency in digcomp_competencies:
                lines.append(f"  - {competency}")

        if not acquired_competencies and not digcomp_competencies:
            lines.append("- V kontekstu ni navedenih kompetenc ali spretnosti.")

        lines.append("")
        lines.append("SAMOOCENJEVALNA VPRAŠANJA")

        questions = self._self_assessment_question_values(learning_unit)
        if questions:
            for question in questions:
                lines.append(f"- {question}")
        else:
            lines.append("- V kontekstu ni navedenih samoocenjevalnih vprašanj.")

        lines.append("")
        lines.append("MODULI, KI VKLJUČUJEJO TO UČNO ENOTO")

        if related_modules:
            for module in related_modules:
                module_title = self._pick_text(module, ["title", "name"], "Neimenovan modul")
                module_id = self._get_document_id(module) or "ni navedeno"
                unit_ref = self._find_unit_ref_in_module(module, learning_unit_id)

                lines.append(f"- {module_title}")
                lines.append(f"  - module_id: {module_id}")

                if unit_ref:
                    lines.append(
                        f"  - vrstni red v modulu: {unit_ref.get('order') or 'ni navedeno'}"
                    )
                    lines.append(
                        f"  - parallel_group: {unit_ref.get('parallel_group') or 'ni navedeno'}"
                    )
                    lines.append(
                        f"  - obvezna: {self._bool_text(unit_ref.get('is_required'))}"
                    )
                    lines.append(
                        f"  - predpogoji v modulu: {self._join_or_empty(unit_ref.get('prerequisites'))}"
                    )
        else:
            lines.append("- V kontekstu ni navedenih modulov, ki vključujejo to učno enoto.")

        progress_lines = self._progress_lines(progress, learning_unit_id)
        if progress_lines:
            lines.append("")
            lines.append("NAPREDEK UPORABNIKA")
            lines.extend(progress_lines)

        return "\n".join(lines)

    async def _generate_answer(
        self,
        context: str,
        user_message: str,
    ) -> str:
        prompt = f"""
KONTEKST TRENUTNE UČNE ENOTE:
{context}

VPRAŠANJE UPORABNIKA:
{user_message}

Odgovori samo na podlagi zgornjega konteksta.
""".strip()

        response = await self.client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {
                    "role": "system",
                    "content": LEARNING_UNIT_ASSISTANT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            max_completion_tokens=LEARNING_UNIT_ASSISTANT_MAX_COMPLETION_TOKENS,
            reasoning_effort=LEARNING_UNIT_ASSISTANT_REASONING_EFFORT,
        )

        answer = ""

        if response.choices:
            answer = response.choices[0].message.content or ""

        answer = answer.strip()

        if not answer:
            return "Tega trenutno ne morem zanesljivo odgovoriti na podlagi podatkov te učne enote."

        return answer

    def _find_unit_ref_in_module(
        self,
        module: Dict[str, Any],
        learning_unit_id: str,
    ) -> Optional[Dict[str, Any]]:
        references = self._as_list(module.get("learning_units"))

        for reference in references:
            if not isinstance(reference, dict):
                continue

            reference_id = self._first_value(
                reference,
                ["learning_unit_id", "learningUnitId", "unit_id", "id", "_id"],
            )

            if reference_id and str(reference_id) == learning_unit_id:
                return reference

        return None

    def _content_topic_values(self, document: Dict[str, Any]) -> List[str]:
        topics = self._as_list(document.get("content_topics"))
        values: List[str] = []

        for topic in topics:
            if isinstance(topic, str) and topic.strip():
                values.append(topic.strip())
                continue

            if isinstance(topic, dict):
                title = self._first_value(topic, ["title", "name", "label"])
                topic_id = self._first_value(topic, ["id", "_id"])
                competencies = self._list_values(
                    topic,
                    ["related_competency_codes", "competencies"],
                )

                if title and competencies:
                    values.append(
                        f"{title} [id: {topic_id or 'ni navedeno'}, povezane kompetence: {', '.join(competencies)}]"
                    )
                elif title:
                    values.append(f"{title} [id: {topic_id or 'ni navedeno'}]")

        return values

    def _digcomp_competency_values(self, document: Dict[str, Any]) -> List[str]:
        competencies = self._as_list(document.get("digcomp_competencies"))
        values: List[str] = []

        for competency in competencies:
            if isinstance(competency, str) and competency.strip():
                values.append(competency.strip())
                continue

            if isinstance(competency, dict):
                code = self._first_value(competency, ["code", "id", "_id"])
                title = self._first_value(competency, ["title", "name", "label"])
                description = self._first_value(competency, ["description", "summary"])

                parts: List[str] = []

                if code:
                    parts.append(str(code))

                if title:
                    parts.append(str(title))

                text = " - ".join(parts) if parts else "Neimenovana kompetenca"

                if description:
                    text = f"{text}: {self._truncate(str(description), 360)}"

                values.append(text)

        return values

    def _self_assessment_question_values(
        self,
        document: Dict[str, Any],
    ) -> List[str]:
        questions = self._as_list(document.get("self_assessment_questions"))
        values: List[str] = []

        for question in questions:
            if isinstance(question, str) and question.strip():
                values.append(self._truncate(question.strip(), 280))
                continue

            if isinstance(question, dict):
                text = self._first_value(question, ["question", "text", "title"])
                question_type = self._first_value(question, ["type"])
                related_topic = self._first_value(
                    question,
                    ["related_topic", "relatedTopic"],
                )
                related_topic_id = self._first_value(
                    question,
                    ["related_topic_id", "relatedTopicId"],
                )
                related_competencies = self._list_values(
                    question,
                    ["related_competency_codes", "competencies"],
                )

                if not text:
                    continue

                meta: List[str] = []

                if question_type:
                    meta.append(f"tip: {question_type}")

                if related_topic:
                    meta.append(f"tema: {related_topic}")

                if related_topic_id:
                    meta.append(f"topic_id: {related_topic_id}")

                if related_competencies:
                    meta.append(f"kompetence: {', '.join(related_competencies)}")

                if meta:
                    values.append(
                        self._truncate(f"{text} [{'; '.join(meta)}]", 360)
                    )
                else:
                    values.append(self._truncate(str(text), 280))

        return values[:12]

    def _progress_lines(
        self,
        progress: Optional[Dict[str, Any]],
        learning_unit_id: str,
    ) -> List[str]:
        if not progress:
            return []

        lines: List[str] = []

        completed_units = self._list_values(
            progress,
            [
                "completed_learning_units",
                "completed_learning_unit_ids",
                "done_learning_units",
            ],
        )

        current_unit = self._first_value(
            progress,
            ["current_learning_unit_id", "currentLearningUnitId", "active_unit_id"],
        )

        if current_unit:
            lines.append(f"- trenutna učna enota: {current_unit}")

        if learning_unit_id in completed_units:
            lines.append("- ta učna enota je označena kot dokončana")

        if completed_units:
            lines.append(f"- dokončane učne enote: {', '.join(completed_units)}")

        return lines

    def _get_document_id(self, document: Dict[str, Any]) -> Optional[str]:
        if document.get("id") is not None:
            return str(document["id"])

        if document.get("_id") is not None:
            return str(document["_id"])

        return None

    def _first_value(
        self,
        document: Dict[str, Any],
        keys: Iterable[str],
    ) -> Optional[Any]:
        for key in keys:
            value = document.get(key)

            if value is not None and value != "":
                return value

        return None

    def _pick_text(
        self,
        document: Dict[str, Any],
        keys: Iterable[str],
        fallback: str,
    ) -> str:
        value = self._first_value(document, keys)

        if isinstance(value, str) and value.strip():
            return self._truncate(value.strip(), 1000)

        if value is not None:
            return self._truncate(str(value), 1000)

        return fallback

    def _list_values(
        self,
        document: Dict[str, Any],
        keys: Iterable[str],
    ) -> List[str]:
        values: List[str] = []

        for key in keys:
            raw_value = document.get(key)

            if raw_value is None:
                continue

            if isinstance(raw_value, str):
                if raw_value.strip():
                    values.append(raw_value.strip())
                continue

            if isinstance(raw_value, list):
                for item in raw_value:
                    if isinstance(item, str) and item.strip():
                        values.append(item.strip())
                    elif isinstance(item, dict):
                        label = self._first_value(
                            item,
                            ["title", "name", "label", "text", "code", "id", "_id"],
                        )
                        if label:
                            values.append(str(label))

        return self._unique(values)

    def _duration_text(self, document: Dict[str, Any]) -> str:
        duration = self._first_value(
            document,
            [
                "duration",
                "duration_hours",
                "duration_minutes",
                "duration_min",
                "estimated_duration",
                "estimatedDuration",
            ],
        )

        if duration is None or duration == "":
            return "Ni navedeno"

        if isinstance(duration, (int, float)):
            if "duration_minutes" in document or "duration_min" in document:
                return f"{duration} min"
            if "duration_hours" in document:
                return f"{duration} h"

        return str(duration)

    def _as_list(self, value: Any) -> List[Any]:
        if isinstance(value, list):
            return value

        return []

    def _unique(self, values: List[str]) -> List[str]:
        seen: set[str] = set()
        unique_values: List[str] = []

        for value in values:
            clean_value = str(value).strip()

            if not clean_value or clean_value in seen:
                continue

            seen.add(clean_value)
            unique_values.append(clean_value)

        return unique_values

    def _join_or_empty(self, value: Any) -> str:
        if isinstance(value, list):
            clean_values = [str(item).strip() for item in value if str(item).strip()]
            return ", ".join(clean_values) if clean_values else "ni navedeno"

        if isinstance(value, str) and value.strip():
            return value.strip()

        return "ni navedeno"

    def _truncate(self, value: str, max_length: int) -> str:
        if len(value) <= max_length:
            return value

        return f"{value[:max_length].rstrip()}..."

    def _bool_text(self, value: Any) -> str:
        if value is True:
            return "da"

        if value is False:
            return "ne"

        return "ni navedeno"