from app.database.mongodb import get_database


COLLECTION_NAME = "competencies"


def get_competency_by_id(competency_id: str):
    database = get_database()

    competency = database[COLLECTION_NAME].find_one(
        {"_id": competency_id}
    )

    return competency