from app.database.mongodb import get_database


COLLECTION_NAME = "learning_units"


def get_learning_unit_by_id(learning_unit_id: str):
    database = get_database()

    learning_unit = database[COLLECTION_NAME].find_one(
        {
            "_id": learning_unit_id
        }
    )

    return learning_unit