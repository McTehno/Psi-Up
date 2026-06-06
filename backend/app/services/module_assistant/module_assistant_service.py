from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional

from openai import AsyncOpenAI

from app.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT,
    MODULE_ASSISTANT_MAX_COMPLETION_TOKENS,
    MODULE_ASSISTANT_PROMPT_VERSION,
    MODULE_ASSISTANT_REASONING_EFFORT,
)
from app.repositories.module_assistant_repository import ModuleAssistantRepository
from app.schemas.module_assistant_schema import ModuleAssistantMessageRequest
from app.services.module_assistant.module_assistant_prompt import (
    MODULE_ASSISTANT_SYSTEM_PROMPT,
)


class ModuleAssistantService:
    def __init__(self, repository: ModuleAssistantRepository):
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
        request: ModuleAssistantMessageRequest,
    ) -> Dict[str, str]:
        user_message = request.user_message.strip()

        if not user_message:
            raise ValueError("Vprašanje ne sme biti prazno.")

        module = await self.repository.get_module(request.module_id)

        if not module:
            raise ValueError("Modul ne obstaja ali ni dostopen.")

        session_id = await self.repository.upsert_session(
            session_id=request.session_id,
            module_id=request.module_id,
            user_id=request.user_id,
        )

        await self.repository.save_message(
            session_id=session_id,
            module_id=request.module_id,
            role="user",
            content=user_message,
            prompt_version=MODULE_ASSISTANT_PROMPT_VERSION,
        )

        context = await self._build_context(
            module=module,
            module_id=request.module_id,
            user_id=request.user_id,
        )

        answer = await self._generate_answer(
            context=context,
            user_message=user_message,
        )

        await self.repository.save_message(
            session_id=session_id,
            module_id=request.module_id,
            role="assistant",
            content=answer,
            prompt_version=MODULE_ASSISTANT_PROMPT_VERSION,
            model=AZURE_OPENAI_DEPLOYMENT,
        )

        return {
            "session_id": session_id,
            "answer": answer,
        }

    async def _build_context(
        self,
        module: Dict[str, Any],
        module_id: str,
        user_id: Optional[str],
    ) -> str:
        unit_refs = self._get_module_learning_unit_refs(module)
        unit_ids = [unit_ref["id"] for unit_ref in unit_refs]

        embedded_units = self._as_list(module.get("learning_unit_details"))
        fetched_units = await self.repository.get_learning_units_by_ids(
            self._unique(unit_ids),
        )

        unit_by_id = self._map_documents_by_id([*embedded_units, *fetched_units])
        progress = await self.repository.get_user_progress(user_id)

        lines: List[str] = []

        lines.append("MODUL")
        lines.append(f"- id: {self._get_document_id(module) or module_id}")
        lines.append(
            f"- naslov: {self._pick_text(module, ['title', 'name'], 'Ni navedeno')}"
        )
        lines.append(
            f"- opis: {self._pick_text(module, ['description', 'short_description', 'summary'], 'Ni navedeno')}"
        )
        lines.append(f"- trajanje: {self._duration_text(module)}")

        keywords = self._list_values(module, ["keywords", "tags"])
        if keywords:
            lines.append(f"- ključne besede: {', '.join(keywords)}")

        domains = self._list_values(module, ["domains", "domain", "categories", "category"])
        if domains:
            lines.append(f"- domene/kategorije: {', '.join(domains)}")

        module_skills = self._competency_values(module)
        if module_skills:
            lines.append(f"- spretnosti/kompetence na modulu: {', '.join(module_skills)}")

        lines.append("")
        lines.append("UČNE ENOTE V MODULU")

        competency_map: Dict[str, List[str]] = {}

        if not unit_refs:
            lines.append("- V kontekstu ni navedenih učnih enot za ta modul.")
        else:
            for unit_index, unit_ref in enumerate(unit_refs, start=1):
                unit = unit_by_id.get(unit_ref["id"])

                if not unit:
                    lines.append("")
                    lines.append(f"{unit_index}. Učna enota {unit_ref['id']} ni najdena v bazi.")
                    lines.append(f"   - order: {unit_ref.get('order', unit_index)}")
                    lines.append(
                        f"   - parallel_group: {unit_ref.get('parallel_group') or 'ni navedeno'}"
                    )
                    lines.append(f"   - obvezna: {self._bool_text(unit_ref.get('is_required'))}")
                    lines.append(
                        f"   - prerequisites: {self._join_or_empty(unit_ref.get('prerequisites'))}"
                    )
                    continue

                unit_id = self._get_document_id(unit) or unit_ref["id"]
                unit_title = self._pick_text(unit, ["title", "name"], "Neimenovana učna enota")
                unit_order = unit_ref.get("order") or unit.get("order") or unit_index
                parallel_group = (
                    unit_ref.get("parallel_group")
                    or unit.get("parallel_group")
                    or "ni navedeno"
                )
                is_required = unit_ref.get("is_required")

                if is_required is None:
                    is_required = unit.get("is_required", unit.get("required"))

                prerequisites = unit_ref.get("prerequisites")
                if prerequisites is None:
                    prerequisites = unit.get("prerequisites")

                unit_competencies = self._unit_competency_values(unit)
                content_topics = self._content_topic_values(unit)
                questions = self._self_assessment_question_values(unit)

                lines.append("")
                lines.append(f"{unit_order}. Učna enota: {unit_title}")
                lines.append(f"   - learning_unit_id: {unit_id}")
                lines.append(
                    f"   - opis: {self._pick_text(unit, ['description', 'short_description', 'summary'], 'Ni navedeno')}"
                )
                lines.append(f"   - trajanje: {self._duration_text(unit)}")
                lines.append(f"   - order: {unit_order}")
                lines.append(f"   - parallel_group: {parallel_group}")
                lines.append(f"   - obvezna: {self._bool_text(is_required)}")
                lines.append(f"   - prerequisites: {self._join_or_empty(prerequisites)}")

                keywords = self._list_values(unit, ["keywords", "tags"])
                if keywords:
                    lines.append(f"   - ključne besede: {', '.join(keywords)}")

                content_topics = self._content_topic_values(unit)
                if content_topics:
                    lines.append(f"   - vsebinske teme: {'; '.join(content_topics)}")

                unit_competencies = self._unit_competency_values(unit)
                if unit_competencies:
                    lines.append("   - digitalne kompetence / spretnosti:")
                    for competency in unit_competencies:
                        lines.append(f"     - {competency}")
                        competency_map.setdefault(competency, []).append(
                            f"učna enota: {unit_title}"
                        )

                content_summary = self._first_value(
                    unit,
                    [
                        "content_summary",
                        "contentSummary",
                        "summary",
                        "description",
                        "content",
                        "body",
                        "text",
                    ],
                )
                if content_summary:
                    lines.append(
                        f"   - vsebinski povzetek: {self._truncate(str(content_summary), 900)}"
                    )

                if unit_competencies:
                    lines.append(
                        f"   - spretnosti/digitalne kompetence: {', '.join(unit_competencies)}"
                    )
                    for competency in unit_competencies:
                        competency_map.setdefault(competency, []).append(
                            f"učna enota: {unit_title}"
                        )

                if questions:
                    lines.append(
                        f"   - samoocenjevalna vprašanja: {' | '.join(questions)}"
                    )

        lines.append("")
        lines.append("SPRETNOSTI / DIGITALNE KOMPETENCE V MODULU")
        if competency_map:
            for competency, locations in sorted(competency_map.items()):
                lines.append(f"- {competency}: {'; '.join(self._unique(locations))}")
        else:
            lines.append("- V kontekstu ni navedenih spretnosti ali digitalnih kompetenc.")

        progress_lines = self._progress_lines(progress, module_id)
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
KONTEKST TRENUTNEGA MODULA:
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
                    "content": MODULE_ASSISTANT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            max_completion_tokens=MODULE_ASSISTANT_MAX_COMPLETION_TOKENS,
            reasoning_effort=MODULE_ASSISTANT_REASONING_EFFORT,
        )

        answer = ""

        if response.choices:
            answer = response.choices[0].message.content or ""

        answer = answer.strip()

        if not answer:
            return "Tega trenutno ne morem zanesljivo odgovoriti na podlagi podatkov tega modula."

        return answer

    def _get_module_learning_unit_refs(
        self,
        module: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        refs: List[Dict[str, Any]] = []

        refs.extend(
            self._normalize_refs(
                self._as_list(module.get("learning_units")),
                id_keys=["learning_unit_id", "learningUnitId", "unit_id", "id", "_id"],
            )
        )

        refs.extend(
            self._normalize_refs(
                self._as_list(module.get("learning_unit_details")),
                id_keys=["id", "_id", "learning_unit_id", "learningUnitId", "unit_id"],
            )
        )

        unit_ids = self._as_list(module.get("learning_unit_ids"))
        refs.extend(
            {
                "id": str(unit_id),
                "order": index + 1,
            }
            for index, unit_id in enumerate(unit_ids)
            if unit_id
        )

        return self._dedupe_refs(refs)

    def _normalize_refs(
        self,
        items: List[Any],
        id_keys: Iterable[str],
    ) -> List[Dict[str, Any]]:
        refs: List[Dict[str, Any]] = []

        for index, item in enumerate(items):
            if isinstance(item, str):
                refs.append({"id": item, "order": index + 1})
                continue

            if not isinstance(item, dict):
                continue

            ref_id = self._first_value(item, id_keys)

            if not ref_id:
                continue

            refs.append(
                {
                    "id": str(ref_id),
                    "order": self._int_or_default(item.get("order"), index + 1),
                    "parallel_group": item.get("parallel_group"),
                    "is_required": item.get("is_required"),
                    "prerequisites": item.get("prerequisites"),
                }
            )

        return refs

    def _dedupe_refs(self, refs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen: set[str] = set()
        unique_refs: List[Dict[str, Any]] = []

        for ref in sorted(
            refs,
            key=lambda item: (
                item.get("order") if item.get("order") is not None else 999999,
                item.get("id", ""),
            ),
        ):
            ref_id = ref.get("id")

            if not ref_id or ref_id in seen:
                continue

            seen.add(ref_id)
            unique_refs.append(ref)

        return unique_refs

    def _map_documents_by_id(
        self,
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Dict[str, Any]]:
        mapped: Dict[str, Dict[str, Any]] = {}

        for document in documents:
            if not isinstance(document, dict):
                continue

            if document.get("_id") is not None:
                mapped[str(document["_id"])] = document

            if document.get("id") is not None:
                mapped[str(document["id"])] = document

        return mapped

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
                            ["title", "name", "label", "text", "id", "_id"],
                        )
                        if label:
                            values.append(str(label))

        return self._unique(values)

    def _competency_values(self, document: Dict[str, Any]) -> List[str]:
        return self._list_values(
            document,
            [
                "skills",
                "competencies",
                "digital_competencies",
                "digitalCompetencies",
                "learning_outcomes",
            ],
        )
    
    def _unit_competency_values(self, document: Dict[str, Any]) -> List[str]:
        return self._unique([
            *self._list_values(
                document,
                [
                    "acquired_competencies",
                    "acquiredCompetencies",
                    "skills",
                    "competencies",
                    "digital_competencies",
                    "digitalCompetencies",
                    "learning_outcomes",
                ],
            ),
            *self._digcomp_competency_values(document),
            *self._content_topic_competency_values(document),
        ])


    def _digcomp_competency_values(self, document: Dict[str, Any]) -> List[str]:
        competencies = self._as_list(document.get("digcomp_competencies"))
        values: List[str] = []

        for competency in competencies:
            if isinstance(competency, str) and competency.strip():
                values.append(competency.strip())
                continue

            if not isinstance(competency, dict):
                continue

            code = self._first_value(competency, ["code", "id", "_id"])
            title = self._first_value(competency, ["title", "name", "label"])
            description = self._first_value(competency, ["description", "summary"])
            area = self._first_value(competency, ["area", "domain", "digcomp_area"])
            level = self._first_value(competency, ["level", "proficiency_level"])

            header_parts: List[str] = []
            if code:
                header_parts.append(str(code))
            if title:
                header_parts.append(str(title))

            text = " - ".join(header_parts) if header_parts else "Neimenovana digitalna kompetenca"

            meta: List[str] = []
            if area:
                meta.append(f"področje: {area}")
            if level:
                meta.append(f"raven: {level}")

            if meta:
                text = f"{text} [{'; '.join(meta)}]"

            if description:
                text = f"{text}: {self._truncate(str(description), 360)}"

            values.append(text)

        return self._unique(values)


    def _content_topic_values(self, document: Dict[str, Any]) -> List[str]:
        topics = (
            self._as_list(document.get("content_topics"))
            or self._as_list(document.get("topics"))
            or self._as_list(document.get("learning_topics"))
        )

        values: List[str] = []

        for topic in topics:
            if isinstance(topic, str) and topic.strip():
                values.append(topic.strip())
                continue

            if not isinstance(topic, dict):
                continue

            title = self._first_value(topic, ["title", "name", "label"])
            topic_id = self._first_value(topic, ["id", "_id"])
            competencies = self._list_values(
                topic,
                ["related_competency_codes", "competencies", "digital_competencies"],
            )

            if title and competencies:
                values.append(
                    f"{title} [id: {topic_id or 'ni navedeno'}, povezane kompetence: {', '.join(competencies)}]"
                )
            elif title:
                values.append(f"{title} [id: {topic_id or 'ni navedeno'}]")

        return self._unique(values)


    def _content_topic_competency_values(self, document: Dict[str, Any]) -> List[str]:
        topics = (
            self._as_list(document.get("content_topics"))
            or self._as_list(document.get("topics"))
            or self._as_list(document.get("learning_topics"))
        )

        values: List[str] = []

        for topic in topics:
            if not isinstance(topic, dict):
                continue

            values.extend(
                self._list_values(
                    topic,
                    ["related_competency_codes", "competencies", "digital_competencies"],
                )
            )

        return self._unique(values)    

    def _self_assessment_question_values(
        self,
        document: Dict[str, Any],
    ) -> List[str]:
        questions = self._as_list(document.get("self_assessment_questions"))
        values: List[str] = []

        for question in questions:
            if isinstance(question, str) and question.strip():
                values.append(self._truncate(question.strip(), 240))
                continue

            if isinstance(question, dict):
                text = self._first_value(
                    question,
                    ["question", "text", "title", "label"],
                )
                related_topic = self._first_value(
                    question,
                    ["related_topic", "topic"],
                )

                if text and related_topic:
                    values.append(
                        self._truncate(f"{text} [tema: {related_topic}]", 280)
                    )
                elif text:
                    values.append(self._truncate(str(text), 240))

        return values[:8]

    def _duration_text(self, document: Dict[str, Any]) -> str:
        duration = self._first_value(
            document,
            [
                "duration",
                "duration_min",
                "duration_minutes",
                "duration_hours",
                "estimated_duration",
                "estimatedDuration",
            ],
        )

        if duration is None or duration == "":
            return "Ni navedeno"

        if isinstance(duration, (int, float)):
            if "duration_min" in document or "duration_minutes" in document:
                return f"{duration} min"
            if "duration_hours" in document:
                return f"{duration} h"

        return str(duration)

    def _progress_lines(
        self,
        progress: Optional[Dict[str, Any]],
        module_id: str,
    ) -> List[str]:
        if not progress:
            return []

        lines: List[str] = []

        completed_modules = self._list_values(
            progress,
            ["completed_modules", "completed_module_ids", "done_modules"],
        )
        completed_units = self._list_values(
            progress,
            [
                "completed_learning_units",
                "completed_learning_unit_ids",
                "done_learning_units",
            ],
        )

        current_module = self._first_value(
            progress,
            ["current_module_id", "currentModuleId", "active_module_id"],
        )
        current_unit = self._first_value(
            progress,
            ["current_learning_unit_id", "currentLearningUnitId", "active_unit_id"],
        )

        if current_module:
            lines.append(f"- trenutni modul: {current_module}")

        if current_unit:
            lines.append(f"- trenutna učna enota: {current_unit}")

        if module_id in completed_modules:
            lines.append("- ta modul je označen kot dokončan")

        if completed_units:
            lines.append(f"- dokončane učne enote: {', '.join(completed_units)}")

        return lines

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

    def _int_or_default(self, value: Any, default: int) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def _bool_text(self, value: Any) -> str:
        if value is True:
            return "da"

        if value is False:
            return "ne"

        return "ni navedeno"