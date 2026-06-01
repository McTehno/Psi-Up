from typing import Any, Dict, Optional


class SavedContentService:
    """
    Service za shranjene vsebine uporabnika.

    Ta razred skrbi za shranjevanje in odstranjevanje
    učnih poti, modulov in učnih enot.

    Repository interno shranjuje podatke v users.progress.saved.
    """

    def __init__(self, saved_content_repository: Any):
        """
        Inicializira service z repository-jem za shranjene vsebine.
        """

        self.saved_content_repository = saved_content_repository

    def _is_valid_content_type(self, content_type: str) -> bool:
        """
        Preveri, ali je content_type podprt.
        """

        return content_type in {
            "learning_path",
            "module",
            "learning_unit",
        }

    def _is_valid_string(self, value: Any) -> bool:
        """
        Preveri, ali je vrednost neprazen string.
        """

        return isinstance(value, str) and bool(value.strip())

    async def save_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani vsebino uporabniku.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.saved_content_repository.save_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )

    async def remove_saved_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani shranjeno vsebino uporabnika.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.saved_content_repository.remove_saved_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )