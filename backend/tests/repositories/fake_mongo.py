import re
from typing import Any


class FakeCollection:
    # Fake MongoDB collection uporabimo, da repository teste ločimo od prave baze.
    def __init__(self, documents: list[dict[str, Any]]):
        self.documents = documents
        self.last_find_filter = None
        self.last_find_one_filter = None
        self.inserted_documents: list[dict[str, Any]] = []

    def find(self, filter_query: dict[str, Any] | None = None):
        # Podpremo osnovne MongoDB filtre, ki jih trenutno uporabljajo repository metode.
        self.last_find_filter = filter_query or {}

        if not filter_query:
            return self.documents

        if "_id" in filter_query and "$in" in filter_query["_id"]:
            selected_ids = set(filter_query["_id"]["$in"])

            return [
                document
                for document in self.documents
                if document.get("_id") in selected_ids
            ]

        if "$or" in filter_query:
            return [
                document
                for document in self.documents
                if self._matches_or_filter(document, filter_query["$or"])
            ]

        return [
            document
            for document in self.documents
            if self._matches_exact_filter(document, filter_query)
        ]

    def find_one(self, filter_query: dict[str, Any]):
        # Podpremo osnovno iskanje po poljih, npr. _id ali user_id.
        self.last_find_one_filter = filter_query

        for document in self.documents:
            if self._matches_exact_filter(document, filter_query):
                return document

        return None

    def insert_one(self, document: dict[str, Any]):
        # Simuliramo MongoDB insert_one in dokument shranimo v fake kolekcijo.
        self.documents.append(document)
        self.inserted_documents.append(document)

        return {"inserted_id": document.get("_id")}

    def _matches_exact_filter(
        self,
        document: dict[str, Any],
        filter_query: dict[str, Any],
    ) -> bool:
        return all(
            document.get(field_name) == expected_value
            for field_name, expected_value in filter_query.items()
        )

    def _matches_or_filter(
        self,
        document: dict[str, Any],
        conditions: list[dict[str, Any]],
    ) -> bool:
        for condition in conditions:
            for field_name, regex_filter in condition.items():
                pattern = regex_filter.get("$regex", "")
                options = regex_filter.get("$options", "")

                if self._field_matches(document, field_name, pattern, options):
                    return True

        return False

    def _field_matches(
        self,
        document: dict[str, Any],
        field_name: str,
        pattern: str,
        options: str,
    ) -> bool:
        values = self._get_values(document, field_name)
        flags = re.IGNORECASE if "i" in options else 0

        return any(
            re.search(pattern, str(value), flags)
            for value in values
            if value is not None
        )

    def _get_values(self, document: dict[str, Any], field_name: str) -> list[Any]:
        parts = field_name.split(".")
        values: list[Any] = [document]

        for part in parts:
            next_values: list[Any] = []

            for value in values:
                if isinstance(value, list):
                    for item in value:
                        if isinstance(item, dict):
                            next_values.append(item.get(part))
                        else:
                            next_values.append(item)

                elif isinstance(value, dict):
                    next_values.append(value.get(part))

            values = next_values

        flattened_values: list[Any] = []

        for value in values:
            if isinstance(value, list):
                flattened_values.extend(value)
            else:
                flattened_values.append(value)

        return flattened_values


class FakeDatabase:
    # Fake MongoDB database omogoča dostop do kolekcij z database["collection_name"].
    def __init__(self, collections: dict[str, FakeCollection]):
        self.collections = collections

    def __getitem__(self, collection_name: str):
        return self.collections[collection_name]