from app.repositories.competency_group_repository import (
    get_questionnaire_by_group_id,
)


def get_questionnaire_for_group(group_id: str):
    competency_group = get_questionnaire_by_group_id(group_id)

    if competency_group is None:
        return None

    return {
        "group_id": competency_group["_id"],
        "questionnaire": competency_group.get("questionnaire", []),
    }