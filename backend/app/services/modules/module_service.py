from app.repositories.module_repository import (
    get_all_modules,
    get_module_by_id,
)


def get_modules():
    return get_all_modules()


def get_module(module_id: str):
    return get_module_by_id(module_id)