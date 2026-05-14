from app.database.mongodb import get_database


COLLECTION_NAME = "competency_groups"

# pridobimo vse skupine kompetenc, brez questionnaire polja, ker ga ne potrebujemo za prikaz skupin kompetenc na frontend strani.
def get_all_competency_groups():
    database = get_database()

    competency_groups = list(
        database[COLLECTION_NAME].find(
            {},
            {"questionnaire": 0}
        )
    )

    return competency_groups

# pridobimo questionnaire za izbrano skupino kompetenc

def get_questionnaire_by_group_id(group_id: str):
    database = get_database()

    competency_group = database[COLLECTION_NAME].find_one(
        {"_id": group_id},
        {"_id": 1, "questionnaire": 1}
    )

    return competency_group


# pridobimo skupino kompetenc po id-ju, da preverimo, ali obstaja,
# ko uporabnik zahteva questionnaire za skupino kompetenc, ki ne obstaja.
def get_competency_group_by_id(group_id: str):
    database = get_database()

    competency_group = database[COLLECTION_NAME].find_one(
        {"_id": group_id}
    )

    return competency_group