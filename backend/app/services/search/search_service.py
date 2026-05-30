from typing import Any, Dict, List, Optional

from app.schemas.search_schema import SearchContentType


class SearchService:
    """
    Service za iskanje vsebin.

    Ta razred združuje rezultate iz učnih poti, modulov in učnih enot.
    Search nima posebnega repository-ja, ker uporablja obstoječe repository-je
    za learning_paths, modules in learning_units.

    Pomembno:
    SearchResponse schema pričakuje, da ima vsak rezultat veljaven title
    in keywords seznam. Če MongoDB dokument vsebuje None vrednosti
    ali napačne elemente v seznamih, jih tukaj pretvorimo v varne fallback
    vrednosti.
    """

    def __init__(
        self,
        learning_path_repository: Any,
        module_repository: Any,
        learning_unit_repository: Any
    ):
        """
        Inicializira search service z repository-ji za vsebine.
        """

        self.learning_path_repository = learning_path_repository
        self.module_repository = module_repository
        self.learning_unit_repository = learning_unit_repository

    def _get_string_value(
        self,
        value: Any,
        fallback: str = "",
    ) -> str:
        """
        Vrne varno string vrednost.

        Če je vrednost None ali napačnega tipa, vrne fallback.
        Napačnih tipov ne pretvarjamo na silo v string.
        """

        if isinstance(value, str):
            return value

        return fallback

    def _get_string_list_value(
        self,
        value: Any,
    ) -> List[str]:
        """
        Vrne varen seznam stringov.

        Če vrednost ni list, vrne prazen seznam.
        Iz seznama odstrani elemente, ki niso string,
        in prazne stringe.

        Primer:
        [None, 123, "Excel", ""] -> ["Excel"]

        Uporablja se za keywords v search rezultatih.
        """

        if not isinstance(value, list):
            return []

        return [
            item.strip()
            for item in value
            if isinstance(item, str) and item.strip()
        ]

    async def search(
        self,
        query: str,
        types: Optional[List[SearchContentType]] = None
    ) -> List[Dict[str, Any]]:
        """
        Izvede iskanje po izbranih tipih vsebin.
        """

        results: List[Dict[str, Any]] = []

        selected_types = types or [
            SearchContentType.LEARNING_PATH,
            SearchContentType.MODULE,
            SearchContentType.LEARNING_UNIT,
        ]

        if SearchContentType.LEARNING_PATH in selected_types:
            results.extend(await self._search_learning_paths(query))

        if SearchContentType.MODULE in selected_types:
            results.extend(await self._search_modules(query))

        if SearchContentType.LEARNING_UNIT in selected_types:
            results.extend(await self._search_learning_units(query))

        return results

    async def _search_learning_paths(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne poti in jih pretvori v search result obliko.
        """

        learning_paths = await self.learning_path_repository.search_learning_paths(query)

        return [
            self._to_search_result(item, SearchContentType.LEARNING_PATH)
            for item in learning_paths
            if isinstance(item, dict)
        ]

    async def _search_modules(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče module in jih pretvori v search result obliko.
        """

        modules = await self.module_repository.search_modules(query)

        return [
            self._to_search_result(item, SearchContentType.MODULE)
            for item in modules
            if isinstance(item, dict)
        ]

    async def _search_learning_units(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne enote in jih pretvori v search result obliko.
        """

        learning_units = await self.learning_unit_repository.search_learning_units(query)

        return [
            self._to_search_result(item, SearchContentType.LEARNING_UNIT)
            for item in learning_units
            if isinstance(item, dict)
        ]

    def _to_search_result(
        self,
        item: Dict[str, Any],
        content_type: SearchContentType
    ) -> Dict[str, Any]:
        """
        Pretvori dokument iz baze v enotno search result obliko.

        Tukaj je glavna zaščita za SearchResponse:
        - id None ali napačen tip -> ""
        - title None ali napačen tip -> ""
        - short_description None ali napačen tip -> ""
        - keywords None ali napačni elementi -> []

        Tako en nepopoln dokument ne povzroči 500 napake pri search endpointu.
        """

        return {
            "id": self._get_string_value(item.get("_id") or item.get("id")),
            "type": content_type,
            "title": self._get_string_value(item.get("title")),
            "short_description": self._get_string_value(
                item.get("short_description")
            ),
            "keywords": self._get_string_list_value(item.get("keywords")),
        }