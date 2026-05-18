from typing import Any, Dict, Optional


class SavedContentService:
    """
    Service za shranjene vsebine uporabnika.

    Ta razred skrbi za shranjevanje in odstranjevanje
    učnih poti, modulov in učnih enot.
    """

    def __init__(self, saved_content_repository: Any):
        """
        Inicializira service z repository-jem za shranjene vsebine.
        """

        self.saved_content_repository = saved_content_repository

    async def save_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Shrani vsebino uporabniku.

        TODO:
        - Preveriti, ali je content_type veljaven.
        - Poklicati repository metodo za shranjevanje.
        - Vrniti posodobljen napredek uporabnika.
        """

        return await self.saved_content_repository.save_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )

    async def remove_saved_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani shranjeno vsebino uporabnika.

        TODO:
        - Preveriti, ali je content_type veljaven.
        - Poklicati repository metodo za odstranjevanje.
        - Vrniti posodobljen napredek uporabnika.
        """

        return await self.saved_content_repository.remove_saved_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )