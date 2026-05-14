from app.database.mongodb import get_database


def test_connection():
    db = get_database()
    collections = db.list_collection_names()

    print("Connected to MongoDB")
    print("Database:", db.name)
    print("Collections:", collections)


if __name__ == "__main__":
    test_connection()