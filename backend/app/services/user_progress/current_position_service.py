from typing import Any, Dict, List, Optional


class CurrentPositionService:
    """
    Service za trenutno pozicijo uporabnika.

    Ta razred skrbi za pridobivanje in posodabljanje informacije,
    kje se uporabnik trenutno nahaja.
    """

    def __init__(self, current_position_repository: Any):
        """
        Inicializira service z repository-jem za trenutno pozicijo.
        """

        self.current_position_repository = current_position_repository

    async def get_current_positions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Vrne trenutne pozicije uporabnika.

        TODO:
        - Poklicati repository metodo za pridobivanje trenutnih pozicij.
        - Po potrebi filtrirati po learning_path_id.
        """

        return await self.current_position_repository.get_current_positions(user_id)

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
        - Preveriti, da je vsaj ena pozicija podana.
        - Poklicati repository metodo za posodobitev trenutne pozicije.
        - Vrniti posodobljen napredek uporabnika.
        """

        return await self.current_position_repository.update_current_position(
            user_id=user_id,
            learning_path_id=learning_path_id,
            current_module_id=current_module_id,
            current_learning_unit_id=current_learning_unit_id
        )