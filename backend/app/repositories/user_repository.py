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
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"_id": user_id})

    async def get_user_by_auth_user_id(self, auth_user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne uporabnika glede na zunanji auth_user_id.
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"auth_user_id": auth_user_id})

    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ustvari aplikacijski profil uporabnika.

        Lokalni _id za zdaj ustvarimo iz auth_user_id.
        To omogoča enostavno povezavo med users in user_progress.
        """

        collection = self.database[self.collection_name]

        now = datetime.now(timezone.utc)
        auth_user_id = user_data.get("auth_user_id")

        safe_auth_user_id = (
            auth_user_id
            .replace("|", "_")
            .replace(":", "_")
            .replace("/", "_")
        )

        new_user = {
            "_id": f"user_{safe_auth_user_id}",
            "auth_provider": user_data.get("auth_provider"),
            "auth_user_id": auth_user_id,
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "created_at": now,
            "updated_at": now,
        }

        collection.insert_one(new_user)

        return new_user

    async def update_user_profile(
        self,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi aplikacijski profil uporabnika.
        """

        collection = self.database[self.collection_name]

        update_data["updated_at"] = datetime.now(timezone.utc)

        collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )

        return await self.get_user_by_id(user_id)

    async def get_or_create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Vrne obstoječ uporabniški profil ali ustvari novega.
        """

        auth_user_id = user_data.get("auth_user_id")

        existing_user = await self.get_user_by_auth_user_id(auth_user_id)

        if existing_user:
            return existing_user

        return await self.create_user_profile(user_data)