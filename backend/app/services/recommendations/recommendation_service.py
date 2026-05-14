from app.repositories.competency_group_repository import get_competency_group_by_id
from app.repositories.competency_repository import get_competency_by_id


def recommend_competencies_from_answers(group_id: str, answers: list):
    competency_group = get_competency_group_by_id(group_id)

    if competency_group is None:
        return None

    questionnaire = competency_group.get("questionnaire", [])
    total_score = calculate_total_score(questionnaire, answers)

    competency_ids = [
        item["competency_id"]
        for item in competency_group.get("competencies", [])
    ]

    recommended_competency_ids = choose_competencies_for_mvp(
        competency_ids,
        total_score,
    )

    recommended_competencies = []

    for competency_id in recommended_competency_ids:
        competency = get_competency_by_id(competency_id)

        if competency is not None:
            recommended_competencies.append(
                {
                    "competency_id": competency["_id"],
                    "title": competency["title"],
                    "description": competency["description"],
                    "level": competency["level"],
                    "reason": "Kompetenca je priporočena na podlagi odgovorov v vprašalniku.",
                }
            )

    return {
        "group_id": group_id,
        "total_score": total_score,
        "recommended_competencies": recommended_competencies,
    }


def calculate_total_score(questionnaire: list, answers: list):
    total_score = 0

    for selected_answer in answers:
        question_index = selected_answer.question_index
        answer_index = selected_answer.answer_index

        if question_index < 0 or question_index >= len(questionnaire):
            continue

        question = questionnaire[question_index]
        question_answers = question.get("answers", [])

        if answer_index < 0 or answer_index >= len(question_answers):
            continue

        total_score += question_answers[answer_index].get("weight", 0)

    return total_score


def choose_competencies_for_mvp(competency_ids: list[str], total_score: int):
    if len(competency_ids) == 0:
        return []

    if len(competency_ids) == 1:
        return [competency_ids[0]]

    sorted_competency_ids = competency_ids

    if total_score <= 4:
        return [sorted_competency_ids[0]]

    if total_score <= 7:
        middle_index = min(1, len(sorted_competency_ids) - 1)
        return [sorted_competency_ids[middle_index]]

    return [sorted_competency_ids[-1]]