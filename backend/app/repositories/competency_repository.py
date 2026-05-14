from app.database.mongodb import get_database


COLLECTION_NAME = "competencies"


def get_all_competencies():
    database = get_database()

    competencies = list(
        database[COLLECTION_NAME].find({})
    )

    return competencies


def get_competency_by_id(competency_id: str):
    database = get_database()

    competency = database[COLLECTION_NAME].find_one(
        {"_id": competency_id}
    )

    return competency