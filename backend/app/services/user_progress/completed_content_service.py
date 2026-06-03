from typing import Any, Dict, Optional


class CompletedContentService:
    """
    Service za dokončane vsebine uporabnika.

    Ta razred skrbi za označevanje in odstranjevanje
    dokončanih učnih poti, modulov in učnih enot.

    Repository interno shranjuje podatke v users.progress.completed.
    """

    def __init__(
        self,
        completed_content_repository: Any,
        module_service: Any,
    ):
        """
        Inicializira service z repository-jem za dokončane vsebine
        in service-om za module.

        module_service se uporablja pri dokončanju modula,
        da lahko dokončamo tudi vse učne enote znotraj modula.
        """

        self.completed_content_repository = completed_content_repository
        self.module_service = module_service

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
    async def _complete_module_learning_units(
        self,
        user_id: str,
        module_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Označi vse učne enote znotraj modula kot dokončane.

        Vrne zadnji posodobljen progress.
        """

        learning_unit_references = (
            await self.module_service.get_learning_unit_references_for_module(module_id)
        )

        updated_progress = None

        for learning_unit_reference in learning_unit_references:
            learning_unit_id = learning_unit_reference.get("learning_unit_id")

            if not self._is_valid_string(learning_unit_id):
                continue

            updated_progress = await self.completed_content_repository.complete_content(
                user_id=user_id,
                content_id=learning_unit_id.strip(),
                content_type="learning_unit",
            )

        return updated_progress

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

        normalized_user_id = user_id.strip()
        normalized_content_id = content_id.strip()

        progress = await self.completed_content_repository.complete_content(
            user_id=normalized_user_id,
            content_id=normalized_content_id,
            content_type=content_type,
        )

        if content_type == "module":
            module_progress = await self._complete_module_learning_units(
                user_id=normalized_user_id,
                module_id=normalized_content_id,
            )

            if module_progress:
                return module_progress

        return progress

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