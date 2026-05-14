from app.database.mongodb import get_database


COLLECTION_NAME = "modules"


def get_module_by_id(module_id: str):
    database = get_database()

    module = database[COLLECTION_NAME].find_one(
        {
            "_id": module_id
        }
    )

    return module

def get_all_modules():
    database = get_database()

    modules = list(
        database[COLLECTION_NAME].find({})
    )

    return modules