import uuid


def unique_user_id(prefix: str) -> str:
    return f"test_{prefix}_{uuid.uuid4()}"


def get_questionnaire(client, target_type: str, target_id: str) -> dict:
    response = client.get(
        "/api/questionnaires",
        params={
            "target_type": target_type,
            "target_id": target_id,
        },
    )

    assert response.status_code == 200
    return response.json()


def submit_assessment(
    client,
    user_id: str,
    target_type: str,
    target_id: str,
    answers: list[dict],
) -> dict:
    response = client.post(
        "/api/assessments/evaluate",
        json={
            "user_id": user_id,
            "target_type": target_type,
            "target_id": target_id,
            "answers": answers,
        },
    )

    assert response.status_code == 200
    return response.json()


def get_user_progress(client, user_id: str) -> dict:
    response = client.get(f"/api/user-progress/{user_id}")

    assert response.status_code == 200
    return response.json()


def answer_for_question(question: dict, answer: bool) -> dict:
    return {
        "question_id": question["id"],
        "question": question["question"],
        "type": question.get("type", "yes_no"),
        "answer": answer,
        "was_answered": True,
    }


def answers_for_learning_unit(
    questionnaire: dict,
    learning_unit_id: str,
    answer: bool = True,
) -> list[dict]:
    return [
        answer_for_question(question, answer)
        for question in questionnaire["questions"]
        if question.get("learning_unit_id") == learning_unit_id
    ]


def answers_for_module(
    questionnaire: dict,
    module_id: str,
    answer: bool = True,
) -> list[dict]:
    return [
        answer_for_question(question, answer)
        for question in questionnaire["questions"]
        if question.get("module_id") == module_id
    ]


def find_question(
    questionnaire: dict,
    question_id: str,
) -> dict:
    for question in questionnaire["questions"]:
        if question["id"] == question_id:
            return question

    raise AssertionError(f"Question {question_id} was not found.")


def assert_contains_all(values: list[str], expected_values: list[str]) -> None:
    for expected_value in expected_values:
        assert expected_value in values


def get_questionnaire_answer(progress: dict, target_type: str, target_id: str) -> dict:
    for item in progress["questionnaire_answers"]:
        if item["target_type"] == target_type and item["target_id"] == target_id:
            return item

    raise AssertionError(f"Questionnaire answer for {target_type}/{target_id} not found.")


def find_saved_answer(questionnaire_answer: dict, question_id: str) -> dict:
    for answer in questionnaire_answer["answers"]:
        if answer["question_id"] == question_id:
            return answer

    raise AssertionError(f"Saved answer {question_id} not found.")

#Learning unit: vsa vprašanja DA → učna enota completed
def test_learning_unit_all_yes_marks_learning_unit_completed(client):
    user_id = unique_user_id("learning_unit")
    questionnaire = get_questionnaire(client, "learning_unit", "ue_001")

    answers = [
        answer_for_question(question, True)
        for question in questionnaire["questions"]
    ]

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="learning_unit",
        target_id="ue_001",
        answers=answers,
    )

    assert result["completed_learning_unit_ids"] == ["ue_001"]
    assert result["completed_module_ids"] == []
    assert result["completed_learning_path_ids"] == []

    progress = get_user_progress(client, user_id)

    assert "ue_001" in progress["completed"]["learning_unit_ids"]

#Module partial: ena učna enota completed, modul še ne
def test_module_partial_answers_complete_only_answered_learning_unit(client):
    user_id = unique_user_id("module_partial")
    questionnaire = get_questionnaire(client, "module", "mod_001")

    answers = answers_for_learning_unit(questionnaire, "ue_001", True)

    first_ue_002_question = find_question(questionnaire, "q_ue_002_001")
    answers.append(answer_for_question(first_ue_002_question, False))

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_001",
        answers=answers,
    )

    assert "ue_001" in result["completed_learning_unit_ids"]
    assert "mod_001" not in result["completed_module_ids"]

    assert result["start_learning_unit_id"] == "ue_002"
    assert "ue_002" in result["recommended_next_learning_units"]

    module_result = result["module_results"][0]
    assert module_result["module_id"] == "mod_001"
    assert module_result["status"] == "partially_completed"
    assert "ue_001" in module_result["completed_learning_units"]
    assert "ue_002" in module_result["missing_learning_units"]


#Module all DA → modul completed
def test_module_all_yes_marks_module_completed(client):
    user_id = unique_user_id("module_completed")
    questionnaire = get_questionnaire(client, "module", "mod_001")

    answers = [
        answer_for_question(question, True)
        for question in questionnaire["questions"]
    ]

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_001",
        answers=answers,
    )

    assert_contains_all(
        result["completed_learning_unit_ids"],
        ["ue_001", "ue_002", "ue_003"],
    )
    assert "mod_001" in result["completed_module_ids"]

    module_result = result["module_results"][0]
    assert module_result["status"] == "completed"
    assert module_result["missing_learning_units"] == []

    progress = get_user_progress(client, user_id)

    assert "mod_001" in progress["completed"]["module_ids"]
    assert_contains_all(
        progress["completed"]["learning_unit_ids"],
        ["ue_001", "ue_002", "ue_003"],
    )

#Completed vsebina se ne sme poslabšati iz DA v NE
def test_completed_learning_unit_cannot_be_downgraded_to_no(client):
    user_id = unique_user_id("no_downgrade")

    questionnaire = get_questionnaire(client, "module", "mod_002")

    all_yes_answers = [
        answer_for_question(question, True)
        for question in questionnaire["questions"]
    ]

    submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_002",
        answers=all_yes_answers,
    )

    downgrade_question = find_question(questionnaire, "q_ue_003_001")

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_002",
        answers=[
            answer_for_question(downgrade_question, False),
        ],
    )

    assert "ue_003" in result["completed_learning_unit_ids"]
    assert "mod_002" in result["completed_module_ids"]
    assert result["recommended_next_learning_units"] == []

    progress = get_user_progress(client, user_id)
    questionnaire_answer = get_questionnaire_answer(progress, "module", "mod_002")
    saved_answer = find_saved_answer(questionnaire_answer, "q_ue_003_001")

    assert saved_answer["answer"] is True

#questionnaire_answers se override-a, ne dodaja novega poskusa

def test_questionnaire_answers_are_overridden_for_same_target(client):
    user_id = unique_user_id("override")
    questionnaire = get_questionnaire(client, "module", "mod_002")

    first_question = find_question(questionnaire, "q_ue_003_001")
    second_question = find_question(questionnaire, "q_ue_004_001")

    submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_002",
        answers=[
            answer_for_question(first_question, True),
        ],
    )

    first_progress = get_user_progress(client, user_id)
    first_questionnaire_answer = get_questionnaire_answer(
        first_progress,
        "module",
        "mod_002",
    )
    first_submitted_at = first_questionnaire_answer["last_submitted_at"]

    submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_002",
        answers=[
            answer_for_question(second_question, True),
        ],
    )

    second_progress = get_user_progress(client, user_id)

    matching_answers = [
        item
        for item in second_progress["questionnaire_answers"]
        if item["target_type"] == "module" and item["target_id"] == "mod_002"
    ]

    assert len(matching_answers) == 1

    second_questionnaire_answer = matching_answers[0]
    assert second_questionnaire_answer["last_submitted_at"] != first_submitted_at

    saved_second_answer = find_saved_answer(
        second_questionnaire_answer,
        "q_ue_004_001",
    )

    assert saved_second_answer["answer"] is True
    assert saved_second_answer["was_answered"] is True

#parallel_group znotraj modula
def test_module_parallel_group_completes_one_parallel_unit_and_recommends_missing_one(client):
    user_id = unique_user_id("module_parallel")
    questionnaire = get_questionnaire(client, "module", "mod_002")

    answers = []
    answers.extend(answers_for_learning_unit(questionnaire, "ue_001", True))
    answers.extend(answers_for_learning_unit(questionnaire, "ue_002", True))

    ue_003_first_question = find_question(questionnaire, "q_ue_003_001")
    answers.append(answer_for_question(ue_003_first_question, False))

    answers.extend(answers_for_learning_unit(questionnaire, "ue_004", True))

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="module",
        target_id="mod_002",
        answers=answers,
    )

    assert_contains_all(
        result["completed_learning_unit_ids"],
        ["ue_001", "ue_002", "ue_004"],
    )
    assert "ue_003" not in result["completed_learning_unit_ids"]
    assert result["completed_module_ids"] == []

    assert result["start_learning_unit_id"] == "ue_003"
    assert result["recommended_next_learning_units"] == ["ue_003"]

    module_result = result["module_results"][0]
    assert module_result["status"] == "partially_completed"
    assert "ue_003" in module_result["missing_learning_units"]


#parallel_group znotraj learning path: optional modul ne blokira, required blokira
def test_learning_path_parallel_required_module_blocks_optional_does_not_block(client):
    user_id = unique_user_id("learning_path_parallel")
    questionnaire = get_questionnaire(client, "learning_path", "up_002")

    answers = []
    answers.extend(answers_for_module(questionnaire, "mod_003", True))
    answers.extend(answers_for_module(questionnaire, "mod_004", True))

    mod_005_first_question = find_question(questionnaire, "q_ue_010_001")
    answers.append(answer_for_question(mod_005_first_question, False))

    answers.extend(answers_for_module(questionnaire, "mod_006", True))

    result = submit_assessment(
        client=client,
        user_id=user_id,
        target_type="learning_path",
        target_id="up_002",
        answers=answers,
    )

    assert_contains_all(
        result["completed_module_ids"],
        ["mod_003", "mod_004", "mod_006"],
    )
    assert "mod_005" not in result["completed_module_ids"]
    assert result["completed_learning_path_ids"] == []

    assert result["start_module_id"] == "mod_005"
    assert result["start_learning_unit_id"] == "ue_010"
    assert result["recommended_next_modules"] == ["mod_005"]
    assert result["recommended_next_learning_units"] == ["ue_010"]