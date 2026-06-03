from typing import List, Optional

from openai import AsyncOpenAI

from app.config import (
    ASSESSMENT_ASSISTANT_MAX_COMPLETION_TOKENS,
    ASSESSMENT_ASSISTANT_REASONING_EFFORT,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT,
)
from app.repositories.assessment_assistant_repository import AssessmentAssistantRepository
from app.schemas.assessment_assistant_schema import AssessmentAssistantMessageRequest
from app.services.assessment_assistant.assessment_assistant_prompt import (
    ASSESSMENT_ASSISTANT_PROMPT_VERSION,
    ASSESSMENT_ASSISTANT_SYSTEM_PROMPT,
)


class AssessmentAssistantService:
    def __init__(self, repository: AssessmentAssistantRepository):
        self.repository = repository
        self._validate_required_settings()
        self.openai_client = AsyncOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            base_url=f"{AZURE_OPENAI_ENDPOINT.rstrip('/')}/openai/v1/",
        )

    async def create_message(self, request: AssessmentAssistantMessageRequest) -> dict:
        user_message = self._normalize_text(request.user_message)
        question_text = self._normalize_text(request.question_text)

        session_id = await self.repository.upsert_session(
            session_id=request.session_id,
            user_id=request.user_id,
            learning_path_id=request.learning_path_id,
            module_id=request.module_id,
            learning_unit_id=request.learning_unit_id,
            question_id=request.question_id,
        )

        await self.repository.save_message(
            session_id=session_id,
            question_id=request.question_id,
            role="user",
            content=user_message,
            prompt_version=ASSESSMENT_ASSISTANT_PROMPT_VERSION,
        )

        answer = await self._generate_answer(
            learning_path_id=request.learning_path_id,
            module_id=request.module_id,
            learning_unit_id=request.learning_unit_id,
            question_id=request.question_id,
            question_text=question_text,
            answer_options=request.answer_options,
            user_message=user_message,
        )

        await self.repository.save_message(
            session_id=session_id,
            question_id=request.question_id,
            role="assistant",
            content=answer,
            model=AZURE_OPENAI_DEPLOYMENT,
            prompt_version=ASSESSMENT_ASSISTANT_PROMPT_VERSION,
        )

        return {
            "session_id": session_id,
            "answer": answer,
        }

    async def _generate_answer(
        self,
        *,
        learning_path_id: str,
        module_id: Optional[str],
        learning_unit_id: Optional[str],
        question_id: str,
        question_text: str,
        answer_options: List[str],
        user_message: str,
    ) -> str:
        prompt = self._build_user_prompt(
            learning_path_id=learning_path_id,
            module_id=module_id,
            learning_unit_id=learning_unit_id,
            question_id=question_id,
            question_text=question_text,
            answer_options=answer_options,
            user_message=user_message,
        )

        response = await self.openai_client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": ASSESSMENT_ASSISTANT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=ASSESSMENT_ASSISTANT_MAX_COMPLETION_TOKENS,
            reasoning_effort=ASSESSMENT_ASSISTANT_REASONING_EFFORT,
        )

        content = response.choices[0].message.content if response.choices else ""
        answer = self._clean_generated_text(content)

        if not answer:
            return (
                "To vprašanje preverja, ali trenutno razumete opisano znanje ali spretnost. "
                "Lahko si pomagate z izrazom v vprašanju in premislite, ali ga znate uporabiti v praksi. "
                "Odgovor izberite sami glede na svoje trenutno stanje."
            )

        return answer

    def _build_user_prompt(
        self,
        *,
        learning_path_id: str,
        module_id: Optional[str],
        learning_unit_id: Optional[str],
        question_id: str,
        question_text: str,
        answer_options: List[str],
        user_message: str,
    ) -> str:
        options = ", ".join(answer_options or ["Da", "Ne"])
        return f"""
Kontekst vprašalnika:
- learning_path_id: {learning_path_id}
- module_id: {module_id or "ni podan"}
- learning_unit_id: {learning_unit_id or "ni podan"}
- question_id: {question_id}
- trenutno vprašanje: {question_text}
- možni odgovori: {options}

Vprašanje uporabnika:
{user_message}

Odgovori kot asistentka na strani. Pomagaj razumeti trenutno vprašanje, vendar ne izberi odgovora namesto uporabnika.
""".strip()

    def _validate_required_settings(self) -> None:
        missing_settings = []
        if not AZURE_OPENAI_ENDPOINT:
            missing_settings.append("AZURE_OPENAI_ENDPOINT")
        if not AZURE_OPENAI_API_KEY:
            missing_settings.append("AZURE_OPENAI_API_KEY")
        if not AZURE_OPENAI_DEPLOYMENT:
            missing_settings.append("AZURE_OPENAI_DEPLOYMENT")

        if missing_settings:
            raise RuntimeError(
                "Manjkajo nastavitve za Assessment assistant: "
                + ", ".join(missing_settings)
            )

    def _normalize_text(self, value: str) -> str:
        return " ".join((value or "").split())

    def _clean_generated_text(self, value: Optional[str]) -> str:
        cleaned = self._normalize_text(value or "")
        return cleaned.strip('"').strip()