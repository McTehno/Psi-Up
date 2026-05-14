from app.repositories.learning_unit_repository import (
    get_all_learning_units,
    get_learning_unit_by_id,
)


def get_learning_units():
    return get_all_learning_units()


def get_learning_unit(learning_unit_id: str):
    return get_learning_unit_by_id(learning_unit_id)