import os
from dotenv import load_dotenv

load_dotenv()


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "psi_up")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5.4-nano")

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "westeurope")
AZURE_SPEECH_VOICE_NAME = os.getenv("AZURE_SPEECH_VOICE_NAME", "sl-SI-PetraNeural")

AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_STORAGE_CONTAINER_NAME = os.getenv(
    "AZURE_STORAGE_CONTAINER_NAME",
    "psiup-voice-help",
)
AZURE_STORAGE_USE_SAS_URLS = get_bool_env("AZURE_STORAGE_USE_SAS_URLS", True)
AZURE_STORAGE_SAS_EXPIRY_MINUTES = int(
    os.getenv("AZURE_STORAGE_SAS_EXPIRY_MINUTES", "60")
)

VOICE_HELP_PROMPT_VERSION = os.getenv(
    "VOICE_HELP_PROMPT_VERSION",
    "voice_help_v1",
)
VOICE_HELP_LOCALE = os.getenv("VOICE_HELP_LOCALE", "sl-SI")
VOICE_HELP_REASONING_EFFORT = os.getenv("VOICE_HELP_REASONING_EFFORT", "low")

ASSESSMENT_ASSISTANT_REASONING_EFFORT = os.getenv(
    "ASSESSMENT_ASSISTANT_REASONING_EFFORT",
    "low",
)
ASSESSMENT_ASSISTANT_MAX_COMPLETION_TOKENS = int(
    os.getenv("ASSESSMENT_ASSISTANT_MAX_COMPLETION_TOKENS", "200")
)

LEARNING_PATH_ASSISTANT_PROMPT_VERSION = os.getenv(
    "LEARNING_PATH_ASSISTANT_PROMPT_VERSION",
    "learning_path_assistant_v1",
)
LEARNING_PATH_ASSISTANT_REASONING_EFFORT = os.getenv(
    "LEARNING_PATH_ASSISTANT_REASONING_EFFORT",
    "low",
)
LEARNING_PATH_ASSISTANT_MAX_COMPLETION_TOKENS = int(
    os.getenv("LEARNING_PATH_ASSISTANT_MAX_COMPLETION_TOKENS", "900")
)