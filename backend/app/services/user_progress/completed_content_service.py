from typing import Any, Dict, Optional


class CompletedContentService:
    """
    Service za dokončane vsebine uporabnika.

    Ta razred skrbi za označevanje in odstranjevanje
    dokončanih učnih poti, modulov in učnih enot.
    """

    def __init__(self, completed_content_repository: Any):
        """
        Inicializira service z repository-jem za dokončane vsebine.
        """

        self.completed_content_repository = completed_content_repository

    async def complete_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vsebino kot dokončano.

        TODO:
        - Kasneje preveriti, ali je content_type veljaven.
        - Kasneje preveriti, ali content_id obstaja.
        """

        return await self.completed_content_repository.complete_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )

    async def remove_completed_content(
        self,
        user_id: str,
        content_id: str,
        content_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Odstrani vsebino iz dokončanih.

        TODO:
        - Kasneje preveriti, ali je content_type veljaven.
        - Kasneje preveriti, ali content_id obstaja.
        """

        return await self.completed_content_repository.remove_completed_content(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type
        )