from typing import Any, Dict, List, Optional


class CurrentPositionRepository:
    """
    Repository za trenutno pozicijo uporabnika.

    Skrbi za branje in posodabljanje informacije,
    kje se uporabnik trenutno nahaja.
    """

    def __init__(self, database: Any):
        """
        Inicializira repository z MongoDB povezavo.
        """

        self.database = database
        self.collection_name = "user_progress"

    async def get_current_positions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Vrne vse trenutne pozicije uporabnika.

        TODO:
        - Poiskati user_progress po user_id.
        - Vrniti current_positions seznam.
        - Če napredek ne obstaja, vrniti prazen seznam.
        """

        collection = self.database[self.collection_name]

        # TODO: Dodati pravo MongoDB read logiko.
        # Primer:
        # progress = await collection.find_one({"user_id": user_id})
        # return progress.get("current_positions", []) if progress else []

        return []

    async def update_current_position(
        self,
        user_id: str,
        learning_path_id: Optional[str] = None,
        current_module_id: Optional[str] = None,
        current_learning_unit_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi trenutno pozicijo uporabnika.

        TODO:
        - Če za learning_path_id že obstaja pozicija, jo posodobiti.
        - Če še ne obstaja, dodati novo pozicijo.
        - Vrniti posodobljen napredek uporabnika.
        """

        collection = self.database[self.collection_name]

        new_position = {
            "learning_path_id": learning_path_id,
            "current_module_id": current_module_id,
            "current_learning_unit_id": current_learning_unit_id,
        }

        # TODO:
        # Implementirati MongoDB logiko za current_positions.
        # Verjetno:
        # 1. Preberi obstoječ progress.
        # 2. Posodobi ali dodaj pozicijo.
        # 3. Shrani current_positions nazaj v dokument.
        # 4. Vrni posodobljen progress.

        return None