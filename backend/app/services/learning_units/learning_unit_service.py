from typing import Any, Dict, List, Optional


class LearningUnitService:
    """
    Service za učne enote.

    Ta razred vsebuje poslovno logiko za delo z učnimi enotami.
    Uporablja LearningUnitRepository za dostop do podatkov.
    """

    def __init__(self, learning_unit_repository: Any):
        """
        Inicializira service z repository-jem za učne enote.
        """

        self.learning_unit_repository = learning_unit_repository

    async def get_all_learning_units(self) -> List[Dict[str, Any]]:
        """
        Vrne vse učne enote.

        TODO:
        - Poklicati repository metodo za pridobivanje vseh učnih enot.
        - Po potrebi urediti ali filtrirati podatke pred vračanjem.
        """

        return await self.learning_unit_repository.get_all_learning_units()

    async def get_learning_unit_by_id(
        self,
        learning_unit_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne eno učno enoto glede na ID.

        TODO:
        - Poklicati repository metodo za pridobivanje učne enote.
        - Dodati obravnavo primera, ko učna enota ne obstaja.
        """

        return await self.learning_unit_repository.get_learning_unit_by_id(
            learning_unit_id
        )

    async def get_learning_units_by_ids(
        self,
        learning_unit_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Vrne več učnih enot glede na seznam ID-jev.

        TODO:
        - Poklicati repository metodo za pridobivanje več učnih enot.
        - Po potrebi ohraniti vrstni red glede na vhodni seznam ID-jev.
        """

        return await self.learning_unit_repository.get_learning_units_by_ids(
            learning_unit_ids
        )

    async def get_learning_unit_detail(
        self,
        learning_unit_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Vrne podrobnosti učne enote za detail page.

        TODO:
        - Pridobiti osnovne podatke učne enote.
        - Dodati dodatne podatke, če jih bo frontend potreboval.
        - Kasneje lahko vključimo tudi napredek uporabnika za to učno enoto.
        """

        learning_unit = await self.get_learning_unit_by_id(learning_unit_id)

        if not learning_unit:
            return None

        return learning_unit

    async def get_self_assessment_questions(
        self,
        learning_unit_id: str
    ) -> List[Dict[str, Any]]:
        """
        Vrne vprašanja za samooceno za izbrano učno enoto.

        TODO:
        - Pridobiti self_assessment_questions iz učne enote.
        - Dodati learning_unit_id k vsakemu vprašanju, če ga še nima.
        """

        questions = await self.learning_unit_repository.get_self_assessment_questions(
            learning_unit_id
        )

        prepared_questions = []

        for question in questions:
            prepared_question = {
                **question,
                "learning_unit_id": question.get("learning_unit_id") or learning_unit_id,
            }
            prepared_questions.append(prepared_question)

        return prepared_questions