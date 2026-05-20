from typing import Any, Dict, Optional


class UserService:
    """
    Service za uporabniški profil.

    Ta razred skrbi za aplikacijski profil uporabnika.
    Prijava in registracija se izvajata prek zunanjega auth sistema,
    na primer Firebase, Auth0 ali podobno.
    """

    def __init__(
        self,
        user_repository: Any,
        user_progress_repository: Any
    ):
        """
        Inicializira service z repository-jem za uporabnike
        in repository-jem za osnovni napredek uporabnika.
        """

        self.user_repository = user_repository
        self.user_progress_repository = user_progress_repository

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne uporabnika glede na lokalni ID.

        TODO:
        - Poklicati repository metodo za pridobivanje uporabnika.
        - Dodati obravnavo primera, ko uporabnik ne obstaja.
        """

        return await self.user_repository.get_user_by_id(user_id)

    async def get_user_by_auth_user_id(
        self,
        auth_user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne uporabnika glede na zunanji auth_user_id.

        TODO:
        - Poklicati repository metodo za iskanje po auth_user_id.
        - auth_user_id pride iz Firebase/Auth0/Supabase Auth ali podobnega sistema.
        """

        return await self.user_repository.get_user_by_auth_user_id(auth_user_id)

    async def get_or_create_user_profile(
        self,
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Vrne obstoječ uporabniški profil ali ustvari novega.

        TODO:
        - Po uspešni prijavi prek zunanjega auth sistema preveriti,
          ali uporabnik že obstaja v naši bazi.
        - Če uporabnik ne obstaja, ustvariti lokalni profil.
        - Ob ustvarjanju uporabnika ustvariti tudi prazen user_progress zapis.
        """

        user = await self.user_repository.get_or_create_user_profile(user_data)

        user_id = user.get("_id") or user.get("id")

        if user_id:
            await self.user_progress_repository.get_or_create_progress(user_id)

        return user

    async def update_user_profile(
        self,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi aplikacijski profil uporabnika.

        TODO:
        - Dovoliti posodobitev samo polj, ki jih lahko ureja naša aplikacija.
        - Ne posodabljati gesla, ker geslo upravlja zunanji auth sistem.
        """

        allowed_fields = {"name", "email"}

        filtered_update_data = {
            key: value
            for key, value in update_data.items()
            if key in allowed_fields
        }

        if not filtered_update_data:
            return await self.get_user_by_id(user_id)

        return await self.user_repository.update_user_profile(
            user_id,
            filtered_update_data
        )