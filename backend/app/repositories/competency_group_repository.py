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


def get_questionnaire_by_group_id(group_id: str):
    database = get_database()

    competency_group = database[COLLECTION_NAME].find_one(
        {"_id": group_id},
        {"_id": 1, "questionnaire": 1}
    )

    return competency_group