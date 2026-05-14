from app.repositories.learning_path_repository import (
    generated_learning_path_exists,
    get_existing_generated_learning_path,
    get_learning_path_by_competency_id,
)
from app.repositories.module_repository import get_module_by_id
from app.repositories.learning_unit_repository import get_learning_unit_by_id

'''
Ta funkcija se uporablja za generiranje učne poti na podlagi izbrane kompetence in nivoja samoocene uporabnika.
Pomembno: trenutno še ne filtrira modulov glede na current_level. 
Vrednost current_level samo sprejme in vrne naprej. 
Kasneje bo uporabljena za to, da preskočimo module, ki jih uporabnik že zna.
'''

def generate_learning_path(competency_id: str, current_level: str):

    #1. Preveri, ali zgenerirana pot že obstaja.
    if generated_learning_path_exists(competency_id, current_level):
        #2. Za zdaj funkcija vedno vrne False.
        existing_path = get_existing_generated_learning_path(
            competency_id,
            current_level,
        )

        if existing_path is not None:
            return existing_path
    #3. Poišče osnovno učno pot, ki vsebuje izbrano kompetenco.
    base_learning_path = get_learning_path_by_competency_id(competency_id)

    if base_learning_path is None:
        return None

    #4. Poišče module za to kompetenco.
    competency_path = find_competency_path(
        base_learning_path,
        competency_id,
    )

    if competency_path is None:
        return None

    #5. Module razvrsti po order.
    ordered_module_ids = get_ordered_module_ids(competency_path)
    #6. Za vsak modul poišče pripadajoče učne enote.
    prepared_modules = prepare_modules_with_learning_units(ordered_module_ids)

    #7. Vrne pripravljeno učno pot.
    return {
        "competency_id": competency_id,
        "current_level": current_level,
        "title": base_learning_path["title"],
        "description": base_learning_path["description"],
        "source": "generated",
        "modules": prepared_modules,
    }


def find_competency_path(base_learning_path: dict, competency_id: str):
    for competency in base_learning_path.get("competencies", []):
        if competency.get("competency_id") == competency_id:
            return competency

    return None


def get_ordered_module_ids(competency_path: dict):
    modules = competency_path.get("modules", [])

    sorted_modules = sorted(
        modules,
        key=lambda module: module.get("order", 0),
    )

    module_ids = [
        module["module_id"]
        for module in sorted_modules
    ]

    return module_ids


def prepare_modules_with_learning_units(module_ids: list[str]):
    prepared_modules = []

    for module_id in module_ids:
        module = get_module_by_id(module_id)

        if module is None:
            continue

        learning_units = prepare_learning_units(
            module.get("learning_units", [])
        )

        prerequisites = [
            prerequisite["module_id"]
            for prerequisite in module.get("prerequisites", [])
        ]

        prepared_modules.append(
            {
                "id": module["_id"],
                "title": module["title"],
                "description": module["description"],
                "learning_units": learning_units,
                "prerequisites": prerequisites,
            }
        )

    return prepared_modules


def prepare_learning_units(learning_unit_ids: list[str]):
    prepared_learning_units = []

    for learning_unit_id in learning_unit_ids:
        learning_unit = get_learning_unit_by_id(learning_unit_id)

        if learning_unit is None:
            continue

        prepared_learning_units.append(
            {
                "id": learning_unit["_id"],
                "title": learning_unit["title"],
                "content": learning_unit["content"],
                "assessment_method": learning_unit["assessment_method"],
                "instructor": learning_unit["instructor"],
                "duration_min": learning_unit["duration_min"],
            }
        )

    return prepared_learning_units