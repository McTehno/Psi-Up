from app.database.mongodb import get_database


COLLECTION_NAME = "learning_paths"


def get_learning_path_by_competency_id(competency_id: str):
    database = get_database()

    learning_path = database[COLLECTION_NAME].find_one(
        {
            "competencies.competency_id": competency_id
        }
    )

    return learning_path


def generated_learning_path_exists(competency_id: str, current_level: str):
    # Za MVP verzijo še ne preverjamo dejansko zgeneriranih poti v bazi.
    # Kasneje bo tukaj MongoDB poizvedba po competency_id in current_level.
    return False


def get_existing_generated_learning_path(competency_id: str, current_level: str):
    # Za zdaj še ne vračamo že zgenerirane poti.
    # Funkcija obstaja zaradi lažje nadgradnje.
    return None