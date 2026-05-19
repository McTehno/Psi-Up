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
        """

        collection = self.database[self.collection_name]
        progress = collection.find_one({"user_id": user_id})

        if not progress:
            return []

        return progress.get("current_positions", [])

    async def update_current_position(
        self,
        user_id: str,
        learning_path_id: Optional[str] = None,
        current_module_id: Optional[str] = None,
        current_learning_unit_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Posodobi trenutno pozicijo uporabnika.

        Če za learning_path_id že obstaja pozicija, jo posodobi.
        Če še ne obstaja, doda novo pozicijo.
        """

        collection = self.database[self.collection_name]

        progress = collection.find_one({"user_id": user_id})

        if not progress:
            return None

        current_positions = progress.get("current_positions", [])

        new_position = {
            "learning_path_id": learning_path_id,
            "current_module_id": current_module_id,
            "current_learning_unit_id": current_learning_unit_id,
        }

        updated = False

        for index, position in enumerate(current_positions):
            if position.get("learning_path_id") == learning_path_id:
                current_positions[index] = new_position
                updated = True
                break

        if not updated:
            current_positions.append(new_position)

        collection.update_one(
            {"user_id": user_id},
            {"$set": {"current_positions": current_positions}}
        )

        return collection.find_one({"user_id": user_id})