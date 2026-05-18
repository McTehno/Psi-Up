from datetime import datetime, timezone
from typing import Any, Dict, Optional


class UserRepository:
    """
    Repository za uporabnike.

    Ta razred je odgovoren za dostop do podatkov uporabnikov.
    Registracija in prijava se izvajata prek zunanjega auth sistema,
    backend pa hrani aplikacijski profil uporabnika.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "users"

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne uporabnika glede na njegov lokalni ID.

        TODO:
        - Poiskati uporabnika po _id ali id.
        - Vrniti None, če uporabnik ne obstaja.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # return await collection.find_one({"_id": user_id})

        return None

    async def get_user_by_auth_user_id(self, auth_user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne uporabnika glede na zunanji auth_user_id.

        TODO:
        - Poiskati uporabnika po auth_user_id.
        - To polje pride iz Firebase/Auth0/Supabase Auth ali podobnega sistema.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer kasneje:
        # return await collection.find_one({"auth_user_id": auth_user_id})

        return None

    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ustvari aplikacijski profil uporabnika.

        TODO:
        - Dodati created_at.
        - Dodati updated_at.
        - Shraniti uporabnika v kolekcijo users.
        - Vrniti ustvarjenega uporabnika.
        """

        collection = self.database[self.collection_name]

        now = datetime.now(timezone.utc)

        new_user = {
            "auth_provider": user_data.get("auth_provider"),
            "auth_user_id": user_data.get("auth_user_id"),
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "created_at": now,
            "updated_at": now,
        }

        # TODO: Dodati pravo MongoDB insert logiko.
        # Primer kasneje:
        # result = await collection.insert_one(new_user)
        # new_user["_id"] = str(result.inserted_id)

        return new_user

    async def update_user_profile(
        self,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi aplikacijski profil uporabnika.

        TODO:
        - Poiskati uporabnika po ID.
        - Posodobiti samo dovoljena polja, na primer name in email.
        - Posodobiti updated_at.
        - Vrniti posodobljenega uporabnika.
        """

        collection = self.database[self.collection_name]

        update_data["updated_at"] = datetime.now(timezone.utc)

        # TODO: Dodati pravo MongoDB update logiko.
        # Primer kasneje:
        # await collection.update_one({"_id": user_id}, {"$set": update_data})
        # return await self.get_user_by_id(user_id)

        return None

    async def get_or_create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Vrne obstoječ uporabniški profil ali ustvari novega.

        TODO:
        - Najprej poiskati uporabnika po auth_user_id.
        - Če obstaja, ga vrniti.
        - Če ne obstaja, ustvariti nov profil.
        """

        auth_user_id = user_data.get("auth_user_id")

        existing_user = await self.get_user_by_auth_user_id(auth_user_id)

        if existing_user:
            return existing_user

        return await self.create_user_profile(user_data)