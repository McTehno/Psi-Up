from app.repositories.competency_group_repository import get_all_competency_groups


def get_competency_groups():
    competency_groups = get_all_competency_groups()

    return competency_groups