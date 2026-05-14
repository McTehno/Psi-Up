from app.repositories.competency_repository import (
    get_all_competencies,
    get_competency_by_id,
)


def get_competencies():
    return get_all_competencies()


def get_competency(competency_id: str):
    return get_competency_by_id(competency_id)