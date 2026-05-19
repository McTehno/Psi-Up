from typing import Any, Dict

from fastapi import HTTPException


class ContentValidationService:
    """
    Service za validacijo uporabnika, napredka in učnih vsebin.

    Ta service se uporablja pred pisanjem v user_progress,
    da ne dovolimo shranjevanja neobstoječih učnih poti,
    modulov ali učnih enot.
    """

    VALID_CONTENT_TYPES = {
        "learning_path",
        "module",
        "learning_unit",
    }

    def __init__(
        self,
        user_progress_repository: Any,
        learning_path_repository: Any,
        module_repository: Any,
        learning_unit_repository: Any,
    ):
        """
        Inicializira validation service z repository-ji,
        ki jih potrebuje za preverjanje obstoja podatkov.
        """

        self.user_progress_repository = user_progress_repository
        self.learning_path_repository = learning_path_repository
        self.module_repository = module_repository
        self.learning_unit_repository = learning_unit_repository

    async def validate_user_progress_exists(self, user_id: str) -> None:
        """
        Preveri, ali obstaja user_progress za uporabnika.

        Če zapis ne obstaja, vrne 404.
        """

        progress = await self.user_progress_repository.get_progress_by_user_id(user_id)

        if not progress:
            raise HTTPException(
                status_code=404,
                detail="Napredek uporabnika ni najden."
            )

    def validate_content_type(self, content_type: str) -> None:
        """
        Preveri, ali je content_type veljaven.

        Dovoljene vrednosti so:
        - learning_path
        - module
        - learning_unit
        """

        if content_type not in self.VALID_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Neveljaven tip vsebine. Dovoljene vrednosti so: learning_path, module, learning_unit."
            )

    async def validate_content_exists(
        self,
        content_type: str,
        content_id: str
    ) -> None:
        """
        Preveri, ali content_id obstaja v pravilni kolekciji.

        Kolekcija je izbrana glede na content_type.
        """

        self.validate_content_type(content_type)

        content = None

        if content_type == "learning_path":
            content = await self.learning_path_repository.get_learning_path_by_id(
                content_id
            )

        if content_type == "module":
            content = await self.module_repository.get_module_by_id(
                content_id
            )

        if content_type == "learning_unit":
            content = await self.learning_unit_repository.get_learning_unit_by_id(
                content_id
            )

        if not content:
            raise HTTPException(
                status_code=404,
                detail=self._get_content_not_found_message(content_type)
            )

    async def validate_content_action(
        self,
        user_id: str,
        content_type: str,
        content_id: str
    ) -> None:
        """
        Validira celotno akcijo nad vsebino.

        Uporablja se za:
        - save
        - favorite
        - complete
        - remove save
        - remove favorite
        - remove complete
        """

        await self.validate_user_progress_exists(user_id)
        self.validate_content_type(content_type)
        await self.validate_content_exists(content_type, content_id)

    async def validate_learning_path_exists(self, learning_path_id: str) -> None:
        """
        Preveri, ali učna pot obstaja.
        """

        learning_path = await self.learning_path_repository.get_learning_path_by_id(
            learning_path_id
        )

        if not learning_path:
            raise HTTPException(
                status_code=404,
                detail="Učna pot ni najdena."
            )

    async def validate_module_exists(self, module_id: str) -> None:
        """
        Preveri, ali modul obstaja.
        """

        module = await self.module_repository.get_module_by_id(module_id)

        if not module:
            raise HTTPException(
                status_code=404,
                detail="Modul ni najden."
            )

    async def validate_learning_unit_exists(self, learning_unit_id: str) -> None:
        """
        Preveri, ali učna enota obstaja.
        """

        learning_unit = await self.learning_unit_repository.get_learning_unit_by_id(
            learning_unit_id
        )

        if not learning_unit:
            raise HTTPException(
                status_code=404,
                detail="Učna enota ni najdena."
            )

    async def validate_current_position(
        self,
        user_id: str,
        learning_path_id: str | None,
        current_module_id: str | None,
        current_learning_unit_id: str | None,
    ) -> None:
        """
        Validira podatke za trenutno pozicijo uporabnika.

        Preveri:
        - ali user_progress obstaja,
        - ali učna pot obstaja,
        - ali modul obstaja,
        - ali učna enota obstaja.
        """

        await self.validate_user_progress_exists(user_id)

        if learning_path_id:
            await self.validate_learning_path_exists(learning_path_id)

        if current_module_id:
            await self.validate_module_exists(current_module_id)

        if current_learning_unit_id:
            await self.validate_learning_unit_exists(current_learning_unit_id)

    def _get_content_not_found_message(self, content_type: str) -> str:
        """
        Vrne sporočilo glede na tip vsebine.
        """

        mapping: Dict[str, str] = {
            "learning_path": "Izbrana učna pot ne obstaja.",
            "module": "Izbrani modul ne obstaja.",
            "learning_unit": "Izbrana učna enota ne obstaja.",
        }

        return mapping.get(content_type, "Izbrana vsebina ne obstaja.")