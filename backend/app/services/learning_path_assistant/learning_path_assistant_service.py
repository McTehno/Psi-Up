from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional

from openai import AsyncOpenAI

from app.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT,
    LEARNING_PATH_ASSISTANT_MAX_COMPLETION_TOKENS,
    LEARNING_PATH_ASSISTANT_REASONING_EFFORT,
)
from app.repositories.learning_path_assistant_repository import (
    LearningPathAssistantRepository,
)
from app.schemas.learning_path_assistant_schema import (
    LearningPathAssistantMessageRequest,
)
from app.services.learning_path_assistant.learning_path_assistant_prompt import (
    LEARNING_PATH_ASSISTANT_PROMPT_VERSION,
    LEARNING_PATH_ASSISTANT_SYSTEM_PROMPT,
)


class LearningPathAssistantService:
    def __init__(self, repository: LearningPathAssistantRepository):
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
        request: LearningPathAssistantMessageRequest,
    ) -> Dict[str, str]:
        user_message = request.user_message.strip()

        if not user_message:
            raise ValueError("Vprašanje ne sme biti prazno.")

        learning_path = await self.repository.get_learning_path(
            request.learning_path_id,
        )

        if not learning_path:
            raise ValueError("Učna pot ne obstaja ali ni dostopna.")

        session_id = await self.repository.upsert_session(
            session_id=request.session_id,
            learning_path_id=request.learning_path_id,
            user_id=request.user_id,
        )

        await self.repository.save_message(
            session_id=session_id,
            learning_path_id=request.learning_path_id,
            role="user",
            content=user_message,
            prompt_version=LEARNING_PATH_ASSISTANT_PROMPT_VERSION,
        )

        context = await self._build_context(
            learning_path=learning_path,
            learning_path_id=request.learning_path_id,
            user_id=request.user_id,
        )

        answer = await self._generate_answer(
            context=context,
            user_message=user_message,
        )

        await self.repository.save_message(
            session_id=session_id,
            learning_path_id=request.learning_path_id,
            role="assistant",
            content=answer,
            prompt_version=LEARNING_PATH_ASSISTANT_PROMPT_VERSION,
            model=AZURE_OPENAI_DEPLOYMENT,
        )

        return {
            "session_id": session_id,
            "answer": answer,
        }

    async def _build_context(
        self,
        learning_path: Dict[str, Any],
        learning_path_id: str,
        user_id: Optional[str],
    ) -> str:
        module_refs = self._get_learning_path_module_refs(learning_path)
        module_ids = [module_ref["id"] for module_ref in module_refs]

        fetched_modules = await self.repository.get_modules_by_ids(module_ids)
        embedded_modules = self._as_list(learning_path.get("module_details"))

        module_by_id = self._map_documents_by_id(
            [*embedded_modules, *fetched_modules],
        )

        ordered_modules: List[Dict[str, Any]] = []
        for module_ref in module_refs:
            module = module_by_id.get(module_ref["id"])

            if not module:
                module = {
                    "id": module_ref["id"],
                    "title": f"Modul {module_ref['id']}",
                    "_missing": True,
                }

            module["_path_order"] = module_ref.get("order")
            module["_path_parallel_group"] = module_ref.get("parallel_group")
            module["_path_is_required"] = module_ref.get("is_required")
            ordered_modules.append(module)

        if not ordered_modules and embedded_modules:
            ordered_modules = embedded_modules

        learning_unit_ids: List[str] = []
        embedded_units: List[Dict[str, Any]] = []

        for module in ordered_modules:
            unit_refs = self._get_module_learning_unit_refs(module)
            learning_unit_ids.extend(unit_ref["id"] for unit_ref in unit_refs)
            embedded_units.extend(self._as_list(module.get("learning_unit_details")))

        fetched_units = await self.repository.get_learning_units_by_ids(
            self._unique(learning_unit_ids),
        )

        unit_by_id = self._map_documents_by_id([*embedded_units, *fetched_units])
        progress = await self.repository.get_user_progress(user_id)

        lines: List[str] = []

        lines.append("UČNA POT")
        lines.append(f"- id: {self._get_document_id(learning_path) or learning_path_id}")
        lines.append(
            f"- naslov: {self._pick_text(learning_path, ['title', 'name'], 'Ni navedeno')}"
        )
        lines.append(
            f"- opis: {self._pick_text(learning_path, ['description', 'short_description', 'summary'], 'Ni navedeno')}"
        )
        lines.append(f"- trajanje: {self._duration_text(learning_path)}")

        goals = self._list_values(
            learning_path,
            ["goals", "objectives", "learning_goals", "outcomes"],
        )
        if goals:
            lines.append(f"- cilji: {', '.join(goals)}")

        tags = self._list_values(
            learning_path,
            ["keywords", "tags", "categories", "category"],
        )
        if tags:
            lines.append(f"- tagi/kategorije: {', '.join(tags)}")

        lines.append("")
        lines.append("MODULI IN UČNE ENOTE")

        competency_map: Dict[str, List[str]] = {}

        for module_index, module in enumerate(ordered_modules, start=1):
            module_id = self._get_document_id(module) or str(module.get("id", ""))
            module_title = self._pick_text(module, ["title", "name"], "Neimenovan modul")
            module_order = module.get("_path_order") or module.get("order") or module_index
            module_parallel_group = (
                module.get("_path_parallel_group")
                or module.get("parallel_group")
                or "ni navedeno"
            )
            module_is_required = module.get("_path_is_required")

            if module_is_required is None:
                module_is_required = module.get("is_required", module.get("required"))

            lines.append("")
            lines.append(f"{module_order}. Modul: {module_title}")
            lines.append(f"   - module_id: {module_id}")
            lines.append(
                f"   - opis: {self._pick_text(module, ['description', 'short_description', 'summary'], 'Ni navedeno')}"
            )
            lines.append(f"   - trajanje: {self._duration_text(module)}")
            lines.append(f"   - obvezen: {self._bool_text(module_is_required)}")
            lines.append(f"   - parallel_group: {module_parallel_group}")

            module_competencies = self._competency_values(module)
            if module_competencies:
                lines.append(
                    f"   - kompetence na modulu: {', '.join(module_competencies)}"
                )
                for competency in module_competencies:
                    competency_map.setdefault(competency, []).append(
                        f"modul: {module_title}"
                    )

            unit_refs = self._get_module_learning_unit_refs(module)

            if not unit_refs:
                lines.append("   - učne enote: Ni navedenih učnih enot.")
                continue

            lines.append("   - učne enote:")

            for unit_index, unit_ref in enumerate(unit_refs, start=1):
                unit = unit_by_id.get(unit_ref["id"])

                if not unit:
                    lines.append(
                        f"     {unit_index}. Učna enota {unit_ref['id']} ni najdena v bazi."
                    )
                    continue

                unit_id = self._get_document_id(unit) or unit_ref["id"]
                unit_title = self._pick_text(unit, ["title", "name"], "Neimenovana učna enota")
                unit_order = unit_ref.get("order") or unit.get("order") or unit_index
                unit_competencies = self._competency_values(unit)

                lines.append(f"     {unit_order}. {unit_title}")
                lines.append(f"        - learning_unit_id: {unit_id}")
                lines.append(
                    f"        - opis: {self._pick_text(unit, ['description', 'short_description', 'summary'], 'Ni navedeno')}"
                )
                lines.append(f"        - trajanje: {self._duration_text(unit)}")

                content_summary = self._pick_text(
                    unit,
                    ["content_summary", "content", "body", "learning_content"],
                    "",
                )
                if content_summary:
                    lines.append(
                        f"        - vsebinski povzetek: {self._truncate(content_summary, 900)}"
                    )

                if unit_competencies:
                    lines.append(
                        f"        - digitalne kompetence/spretnosti: {', '.join(unit_competencies)}"
                    )
                    for competency in unit_competencies:
                        competency_map.setdefault(competency, []).append(
                            f"modul: {module_title}, učna enota: {unit_title}"
                        )

        lines.append("")
        lines.append("DIGITALNE KOMPETENCE / SPRETNOSTI")
        if competency_map:
            for competency, locations in sorted(competency_map.items()):
                unique_locations = self._unique(locations)
                lines.append(f"- {competency}: {'; '.join(unique_locations)}")
        else:
            lines.append("- V kontekstu ni navedenih digitalnih kompetenc ali spretnosti.")

        progress_lines = self._progress_lines(progress)
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
KONTEKST TRENUTNE UČNE POTI:
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
                    "content": LEARNING_PATH_ASSISTANT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            max_completion_tokens=LEARNING_PATH_ASSISTANT_MAX_COMPLETION_TOKENS,
            reasoning_effort=LEARNING_PATH_ASSISTANT_REASONING_EFFORT,
        )

        answer = ""

        if response.choices:
            answer = response.choices[0].message.content or ""

        answer = answer.strip()

        if not answer:
            return "Tega trenutno ne morem zanesljivo odgovoriti na podlagi podatkov te učne poti."

        return answer

    def _get_learning_path_module_refs(
        self,
        learning_path: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        steps = self._as_list(learning_path.get("steps"))
        refs: List[Dict[str, Any]] = []

        for index, step in enumerate(steps):
            if not isinstance(step, dict):
                continue

            step_kind = self._first_value(
                step,
                ["kind", "type", "step_type", "content_type"],
            )

            if step_kind and str(step_kind).lower() not in {"module", "learning_module"}:
                continue

            module_id = self._first_value(
                step,
                ["module_id", "moduleId", "content_id", "ref_id", "id"],
            )

            if not module_id:
                continue

            refs.append(
                {
                    "id": str(module_id),
                    "order": self._int_or_default(step.get("order"), index + 1),
                    "parallel_group": step.get("parallel_group"),
                    "is_required": step.get("is_required"),
                }
            )

        if refs:
            return self._dedupe_refs(refs)

        modules = self._as_list(learning_path.get("modules"))
        refs.extend(
            self._normalize_refs(
                modules,
                id_keys=["module_id", "moduleId", "id", "_id", "ref_id"],
            )
        )

        module_ids = self._as_list(learning_path.get("module_ids"))
        refs.extend(
            {
                "id": str(module_id),
                "order": index + 1,
            }
            for index, module_id in enumerate(module_ids)
            if module_id
        )

        module_details = self._as_list(learning_path.get("module_details"))
        refs.extend(
            self._normalize_refs(
                module_details,
                id_keys=["id", "_id", "module_id", "moduleId"],
            )
        )

        return self._dedupe_refs(refs)

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
                            ["title", "name", "label", "id", "_id"],
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

    def _duration_text(self, document: Dict[str, Any]) -> str:
        duration = self._first_value(
            document,
            [
                "duration",
                "duration_hours",
                "duration_minutes",
                "estimated_duration",
                "estimatedDuration",
            ],
        )

        if duration is None or duration == "":
            return "Ni navedeno"

        if isinstance(duration, (int, float)):
            if "duration_minutes" in document:
                return f"{duration} min"
            if "duration_hours" in document:
                return f"{duration} h"

        return str(duration)

    def _progress_lines(
        self,
        progress: Optional[Dict[str, Any]],
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

        if completed_modules:
            lines.append(f"- dokončani moduli: {', '.join(completed_modules)}")

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