from app.database.mongodb import get_database


COLLECTION_NAME = "competency_groups"


def get_all_competency_groups():
    database = get_database()

    competency_groups = list(
        database[COLLECTION_NAME].find(
            {},
            {"questionnaire": 0}
        )
    )

    return competency_groups