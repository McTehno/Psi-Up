import asyncio
import hashlib
import tempfile
from datetime import datetime, timedelta, timezone
from html import escape
from typing import List, Optional

import azure.cognitiveservices.speech as speechsdk
from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)
from openai import AsyncOpenAI

from app.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT,
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    AZURE_STORAGE_CONNECTION_STRING,
    AZURE_STORAGE_CONTAINER_NAME,
    AZURE_STORAGE_SAS_EXPIRY_MINUTES,
    AZURE_STORAGE_USE_SAS_URLS,
    VOICE_HELP_PROMPT_VERSION,
    VOICE_HELP_REASONING_EFFORT,
)
from app.services.voice_help.voice_help_prompt import (
    VOICE_HELP_EXAMPLE_MESSAGES,
    VOICE_HELP_SYSTEM_PROMPT,
)


class VoiceHelpService:
    def __init__(self, repository):
        self.repository = repository
        self._validate_required_settings()

        self.openai_client = AsyncOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            base_url=f"{AZURE_OPENAI_ENDPOINT.rstrip('/')}/openai/v1/",
        )

        self.blob_service_client = BlobServiceClient.from_connection_string(
            AZURE_STORAGE_CONNECTION_STRING
        )
        self.container_client = self.blob_service_client.get_container_client(
            AZURE_STORAGE_CONTAINER_NAME
        )

        self._ensure_container_exists()

    async def get_or_create_voice_help(
        self,
        target_type: Optional[str],
        target_id: Optional[str],
        question_id: Optional[str],
        question_text: str,
        answer_options: List[str],
        locale: str,
        voice_name: str,
    ):
        cleaned_question_text = self._normalize_text(question_text)
        cleaned_answer_options = [
            self._normalize_text(option)
            for option in answer_options
            if self._normalize_text(option)
        ]

        if not cleaned_answer_options:
            cleaned_answer_options = ["Da", "Ne"]

        content_hash = self._build_content_hash(
            question_text=cleaned_question_text,
            answer_options=cleaned_answer_options,
            locale=locale,
            voice_name=voice_name,
        )

        existing = await self.repository.get_ready_by_hash(
            content_hash=content_hash,
            locale=locale,
            voice_name=voice_name,
        )

        if existing:
            return {
                "help_text": existing["help_text"],
                "audio_url": self._build_playback_url(existing["blob_name"]),
                "cached": True,
                "content_hash": content_hash,
            }

        help_text = await self._generate_help_text(
            question_text=cleaned_question_text,
            answer_options=cleaned_answer_options,
        )

        ssml = self._build_ssml(
            help_text=help_text,
            locale=locale,
            voice_name=voice_name,
        )

        audio_bytes = await asyncio.to_thread(
            self._synthesize_speech_to_mp3,
            ssml,
            locale,
            voice_name,
        )

        blob_name = self._build_blob_name(
            content_hash=content_hash,
            locale=locale,
        )

        blob_url = await asyncio.to_thread(
            self._upload_audio_to_blob,
            blob_name,
            audio_bytes,
        )

        await self.repository.save_ready(
            {
                "target_type": target_type,
                "target_id": target_id,
                "question_id": question_id,
                "question_text": cleaned_question_text,
                "answer_options": cleaned_answer_options,
                "locale": locale,
                "voice_name": voice_name,
                "model": AZURE_OPENAI_DEPLOYMENT,
                "prompt_version": VOICE_HELP_PROMPT_VERSION,
                "help_text": help_text,
                "ssml": ssml,
                "blob_name": blob_name,
                "blob_url": blob_url,
                "content_hash": content_hash,
                "audio_format": "mp3",
            }
        )

        return {
            "help_text": help_text,
            "audio_url": self._build_playback_url(blob_name),
            "cached": False,
            "content_hash": content_hash,
        }

    def _validate_required_settings(self) -> None:
        missing_settings = []

        required_settings = {
            "AZURE_OPENAI_ENDPOINT": AZURE_OPENAI_ENDPOINT,
            "AZURE_OPENAI_API_KEY": AZURE_OPENAI_API_KEY,
            "AZURE_OPENAI_DEPLOYMENT": AZURE_OPENAI_DEPLOYMENT,
            "AZURE_SPEECH_KEY": AZURE_SPEECH_KEY,
            "AZURE_SPEECH_REGION": AZURE_SPEECH_REGION,
            "AZURE_STORAGE_CONNECTION_STRING": AZURE_STORAGE_CONNECTION_STRING,
            "AZURE_STORAGE_CONTAINER_NAME": AZURE_STORAGE_CONTAINER_NAME,
        }

        for key, value in required_settings.items():
            if not value:
                missing_settings.append(key)

        if missing_settings:
            raise RuntimeError(
                "Manjkajo Azure nastavitve v .env: "
                + ", ".join(missing_settings)
            )

    def _ensure_container_exists(self) -> None:
        try:
            self.container_client.create_container()
        except ResourceExistsError:
            pass

    def _build_content_hash(
        self,
        question_text: str,
        answer_options: List[str],
        locale: str,
        voice_name: str,
    ) -> str:
        normalized_payload = "|".join(
            [
                question_text.strip(),
                ",".join([option.strip() for option in answer_options]),
                locale,
                voice_name,
                AZURE_OPENAI_DEPLOYMENT,
                VOICE_HELP_PROMPT_VERSION,
            ]
        )

        return hashlib.sha256(normalized_payload.encode("utf-8")).hexdigest()

    async def _generate_help_text(
        self,
        question_text: str,
        answer_options: List[str],
    ) -> str:
        user_prompt = f"""
Vprašanje:
{question_text}

Možni odgovori:
{", ".join(answer_options)}
""".strip()

        messages = [
            {
                "role": "system",
                "content": VOICE_HELP_SYSTEM_PROMPT,
            },
            *VOICE_HELP_EXAMPLE_MESSAGES,
            {
                "role": "user",
                "content": user_prompt,
            },
        ]

        response = await self.openai_client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=messages,
            max_completion_tokens=300,
            reasoning_effort=VOICE_HELP_REASONING_EFFORT,
        )

        generated_text = response.choices[0].message.content or ""
        cleaned_text = self._clean_generated_text(generated_text)

        if not cleaned_text:
            cleaned_text = self._build_fallback_help_text(
                question_text=question_text,
                answer_options=answer_options,
            )

        return cleaned_text

    def _build_fallback_help_text(
        self,
        question_text: str,
        answer_options: List[str],
    ) -> str:
        normalized_options = [option.strip().lower() for option in answer_options]

        if "da" in normalized_options and "ne" in normalized_options:
            return (
                f"Vprašanje se glasi: {question_text}. "
                "Če to velja za vas, izberite Da. "
                "Če to za vas še ne velja, izberite Ne."
            )

        return (
            f"Vprašanje se glasi: {question_text}. "
            "Izberite odgovor, ki najbolje opisuje vaše trenutno stanje."
        )

    def _build_ssml(
        self,
        help_text: str,
        locale: str,
        voice_name: str,
    ) -> str:
        safe_text = escape(help_text, quote=False)

        return f"""
<speak version="1.0" xml:lang="{locale}">
  <voice name="{voice_name}">
    <s>{safe_text}</s>
  </voice>
</speak>
""".strip()

    def _synthesize_speech_to_mp3(
        self,
        ssml: str,
        locale: str,
        voice_name: str,
    ) -> bytes:
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION,
        )

        speech_config.speech_synthesis_language = locale
        speech_config.speech_synthesis_voice_name = voice_name

        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
        )

        with tempfile.NamedTemporaryFile(suffix=".mp3") as temp_audio:
            audio_config = speechsdk.audio.AudioOutputConfig(
                filename=temp_audio.name
            )

            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config,
                audio_config=audio_config,
            )

            result = synthesizer.speak_ssml_async(ssml).get()

            if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
                cancellation = speechsdk.SpeechSynthesisCancellationDetails(result)
                raise RuntimeError(
                    "Speech synthesis failed: "
                    f"{cancellation.reason} - {cancellation.error_details}"
                )

            temp_audio.seek(0)
            return temp_audio.read()

    def _build_blob_name(
        self,
        content_hash: str,
        locale: str,
    ) -> str:
        return f"voice-help/{locale}/questions/{content_hash}.mp3"

    def _upload_audio_to_blob(
        self,
        blob_name: str,
        audio_bytes: bytes,
    ) -> str:
        blob_client = self.blob_service_client.get_blob_client(
            container=AZURE_STORAGE_CONTAINER_NAME,
            blob=blob_name,
        )

        blob_client.upload_blob(
            audio_bytes,
            overwrite=True,
            content_settings=ContentSettings(content_type="audio/mpeg"),
        )

        return blob_client.url

    def _build_playback_url(self, blob_name: str) -> str:
        blob_client = self.blob_service_client.get_blob_client(
            container=AZURE_STORAGE_CONTAINER_NAME,
            blob=blob_name,
        )

        if not AZURE_STORAGE_USE_SAS_URLS:
            return blob_client.url

        account_name = self._get_connection_string_value("AccountName")
        account_key = self._get_connection_string_value("AccountKey")

        if not account_name or not account_key:
            raise RuntimeError(
                "Za SAS URL manjka AccountName ali AccountKey v "
                "AZURE_STORAGE_CONNECTION_STRING."
            )

        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=AZURE_STORAGE_CONTAINER_NAME,
            blob_name=blob_name,
            account_key=account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.now(timezone.utc)
            + timedelta(minutes=AZURE_STORAGE_SAS_EXPIRY_MINUTES),
        )

        return f"{blob_client.url}?{sas_token}"

    def _get_connection_string_value(self, key: str) -> Optional[str]:
        parts = AZURE_STORAGE_CONNECTION_STRING.split(";")

        for part in parts:
            if not part or "=" not in part:
                continue

            part_key, part_value = part.split("=", 1)

            if part_key == key:
                return part_value

        return None

    def _normalize_text(self, value: str) -> str:
        return " ".join(value.strip().split())

    def _clean_generated_text(self, value: str) -> str:
        cleaned = " ".join(value.strip().split())

        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1].strip()

        if cleaned.startswith("“") and cleaned.endswith("”"):
            cleaned = cleaned[1:-1].strip()

        return cleaned