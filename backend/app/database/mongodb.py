from pymongo import MongoClient
from app.config import MONGODB_URI, DATABASE_NAME

client = MongoClient(MONGODB_URI)
database = client[DATABASE_NAME]


def get_database():
    return database