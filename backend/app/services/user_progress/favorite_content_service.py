from typing import Any, Dict, Optional


class FavoriteContentService:
    """
    Service za priljubljene vsebine uporabnika.

    Ta razred skrbi za dodajanje in odstranjevanje
    učnih poti, modulov in učnih enot iz priljubljenih.

    Repository interno shranjuje podatke v users.progress.favorites.
    """

    def __init__(self, favorite_content_repository: Any):
        """
        Inicializira service z repository-jem za priljubljene vsebine.
        """

        self.favorite_content_repository = favorite_content_repository

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

    async def favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot priljubljeno.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.favorite_content_repository.favorite_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz priljubljenih.

        Vrne posodobljen progress uporabnika ali None,
        če so vhodni podatki neveljavni.
        """

        if not self._is_valid_string(user_id):
            return None

        if not self._is_valid_string(content_id):
            return None

        if not self._is_valid_content_type(content_type):
            return None

        return await self.favorite_content_repository.remove_favorite_content(
            user_id=user_id.strip(),
            content_id=content_id.strip(),
            content_type=content_type,
        )