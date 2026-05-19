from typing import Any, Dict, Optional


class FavoriteContentService:
    """
    Service za priljubljene vsebine uporabnika.

    Ta razred skrbi za dodajanje in odstranjevanje
    učnih poti, modulov in učnih enot iz priljubljenih.
    """

    def __init__(self, favorite_content_repository: Any):
        """
        Inicializira service z repository-jem za priljubljene vsebine.
        """

        self.favorite_content_repository = favorite_content_repository

    async def favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot priljubljeno.

        TODO:
        - Kasneje preveriti, ali je content_type veljaven.
        - Kasneje preveriti, ali content_id obstaja.
        """

        return await self.favorite_content_repository.favorite_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )

    async def remove_favorite_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz priljubljenih.

        TODO:
        - Kasneje preveriti, ali je content_type veljaven.
        - Kasneje preveriti, ali content_id obstaja.
        """

        return await self.favorite_content_repository.remove_favorite_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )