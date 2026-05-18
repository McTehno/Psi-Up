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

        TODO:
        - Poiskati dokument v kolekciji user_progress po user_id.
        - Vrniti None, če napredek še ne obstaja.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB poizvedbo.
        # Primer:
        # return await collection.find_one({"user_id": user_id})

        return None

    async def create_empty_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Ustvari prazen zapis napredka za novega uporabnika.

        TODO:
        - Ustvariti začetni dokument za user_progress.
        - Shraniti ga v kolekcijo user_progress.
        - Vrniti ustvarjen dokument.
        """

        collection = self.database[self.collection_name]

        new_progress = {
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

        # TODO: Dodati pravo MongoDB insert logiko.
        # Primer:
        # result = await collection.insert_one(new_progress)
        # new_progress["_id"] = str(result.inserted_id)

        return new_progress

    async def get_or_create_progress(self, user_id: str) -> Dict[str, Any]:
        """
        Vrne obstoječ napredek uporabnika ali ustvari novega.

        TODO:
        - Najprej poiskati napredek po user_id.
        - Če obstaja, ga vrniti.
        - Če ne obstaja, ustvariti prazen napredek.
        """

        existing_progress = await self.get_progress_by_user_id(user_id)

        if existing_progress:
            return existing_progress

        return await self.create_empty_progress(user_id)