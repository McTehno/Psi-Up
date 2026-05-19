from typing import Any, Dict, Optional


class UserProgressRepository:
    """
    Repository za osnovni zapis napredka uporabnika.

    Ta razred skrbi samo za pridobivanje in ustvarjanje
    osnovnega user_progress dokumenta.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "user_progress"

    async def get_progress_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Vrne napredek uporabnika glede na user_id.

        Če napredek za uporabnika ne obstaja, vrne None.
        """

        collection = self.database[self.collection_name]

        return collection.find_one({"user_id": user_id})

    async def create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Ustvari začetni zapis napredka za uporabnika.

        Zapis je začetni zato, ker uporabnik na začetku še nima
        shranjenih, priljubljenih ali dokončanih vsebin.
        """

        collection = self.database[self.collection_name]

        new_progress = {
            "_id": f"progress_{user_id}",
            "user_id": user_id,
            "saved_learning_paths": [],
            "saved_modules": [],
            "saved_learning_units": [],
            "favorite_learning_paths": [],
            "favorite_modules": [],
            "favorite_learning_units": [],
            "completed_learning_paths": [],
            "completed_modules": [],
            "completed_learning_units": [],
            "current_positions": [],
        }

        collection.insert_one(new_progress)

        return new_progress
    
    async def get_or_create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Vrne obstoječ napredek uporabnika ali ustvari novega.

        Če uporabnik že ima user_progress zapis, ga vrne.
        Če ga nima, ustvari začetni zapis.
        """

        existing_progress = await self.get_progress_by_user_id(user_id)

        if existing_progress:
            return existing_progress

        return await self.create_progress(user_id)