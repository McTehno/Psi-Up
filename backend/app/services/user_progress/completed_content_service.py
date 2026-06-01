from typing import Any, Dict, Optional


class CompletedContentService:
    """
    Service za dokončane vsebine uporabnika.

    Ta razred skrbi za označevanje in odstranjevanje
    dokončanih učnih poti, modulov in učnih enot.

    Repository interno shranjuje podatke v users.progress.completed.
    """

    def __init__(self, completed_content_repository: Any):
        """
        Inicializira service z repository-jem za dokončane vsebine.
        """

        self.completed_content_repository = completed_content_repository

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

    async def complete_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot dokončano.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.completed_content_repository.complete_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )

    async def remove_completed_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz dokončanih.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.completed_content_repository.remove_completed_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )