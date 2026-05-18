from typing import Any, Dict, List

from app.schemas.search_schema import SearchContentType


class SearchService:
    """
    Service za iskanje vsebin.

    Ta razred združuje rezultate iz učnih poti, modulov in učnih enot.
    Search nima posebnega repository-ja, ker uporablja obstoječe repository-je
    za learning_paths, modules in learning_units.
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

    async def search(
        self,
        query: str,
        types: List[SearchContentType]
    ) -> List[Dict[str, Any]]:
        """
        Izvede iskanje po izbranih tipih vsebin.

        TODO:
        - Če types ni podan, iskati po vseh tipih.
        - Če je izbran learning_path, iskati po učnih poteh.
        - Če je izbran module, iskati po modulih.
        - Če je izbran learning_unit, iskati po učnih enotah.
        - Združiti rezultate v enoten seznam.
        - Vsakemu rezultatu dodati type.
        """

        results: List[Dict[str, Any]] = []

        selected_types = types or [
            SearchContentType.LEARNING_PATH,
            SearchContentType.MODULE,
            SearchContentType.LEARNING_UNIT,
        ]

        if SearchContentType.LEARNING_PATH in selected_types:
            learning_path_results = await self._search_learning_paths(query)
            results.extend(learning_path_results)

        if SearchContentType.MODULE in selected_types:
            module_results = await self._search_modules(query)
            results.extend(module_results)

        if SearchContentType.LEARNING_UNIT in selected_types:
            learning_unit_results = await self._search_learning_units(query)
            results.extend(learning_unit_results)

        return results

    async def _search_learning_paths(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne poti in jih pretvori v search result obliko.

        TODO:
        - Uporabiti learning_path_repository.search_learning_paths.
        - Vsak rezultat pretvoriti v enotno obliko za search response.
        """

        learning_paths = await self.learning_path_repository.search_learning_paths(query)

        return [
            self._to_search_result(item, SearchContentType.LEARNING_PATH)
            for item in learning_paths
        ]

    async def _search_modules(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče module in jih pretvori v search result obliko.

        TODO:
        - Uporabiti module_repository.search_modules.
        - Vsak rezultat pretvoriti v enotno obliko za search response.
        """

        modules = await self.module_repository.search_modules(query)

        return [
            self._to_search_result(item, SearchContentType.MODULE)
            for item in modules
        ]

    async def _search_learning_units(self, query: str) -> List[Dict[str, Any]]:
        """
        Poišče učne enote in jih pretvori v search result obliko.

        TODO:
        - Uporabiti learning_unit_repository.search_learning_units.
        - Vsak rezultat pretvoriti v enotno obliko za search response.
        """

        learning_units = await self.learning_unit_repository.search_learning_units(query)

        return [
            self._to_search_result(item, SearchContentType.LEARNING_UNIT)
            for item in learning_units
        ]

    def _to_search_result(
        self,
        item: Dict[str, Any],
        content_type: SearchContentType
    ) -> Dict[str, Any]:
        """
        Pretvori dokument iz baze v enotno search result obliko.

        TODO:
        - Preveriti, ali dokument uporablja id ali _id.
        - Dodati dodatna polja, če jih bo frontend potreboval.
        """

        return {
            "id": item.get("_id") or item.get("id"),
            "type": content_type,
            "title": item.get("title"),
            "short_description": item.get("short_description"),
            "keywords": item.get("keywords", []),
        }