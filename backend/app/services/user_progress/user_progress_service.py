from typing import Any, Dict, Optional


class UserProgressService:
    """
    Service za osnovni napredek uporabnika.

    Ta razred skrbi za pridobivanje in ustvarjanje osnovnega
    user_progress zapisa.
    """

    def __init__(self, user_progress_repository: Any):
        """
        Inicializira service z repository-jem za osnovni napredek uporabnika.
        """

        self.user_progress_repository = user_progress_repository

    async def get_progress_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne napredek uporabnika glede na user_id.

        TODO:
        - Poklicati repository metodo za pridobivanje napredka.
        - Dodati obravnavo primera, ko napredek ne obstaja.
        """

        return await self.user_progress_repository.get_progress_by_user_id(user_id)

    async def create_empty_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Ustvari prazen napredek za uporabnika.

        TODO:
        - Poklicati repository metodo za ustvarjanje praznega napredka.
        - Kasneje preveriti, da za uporabnika še ne obstaja progress.
        """

        return await self.user_progress_repository.create_empty_progress(user_id)

    async def get_or_create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Vrne obstoječ napredek uporabnika ali ustvari novega.

        TODO:
        - Poklicati repository get_or_create logiko.
        - Po potrebi dodati dodatno validacijo uporabnika.
        """

        return await self.user_progress_repository.get_or_create_progress(user_id)