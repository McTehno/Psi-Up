from conftest import get_document_id, load_json_file


def test_learning_units_json_is_not_empty():
    # Preverimo, da imamo začetne učne enote za uvoz v MongoDB.
    learning_units = load_json_file("learning_units.json")

    assert isinstance(learning_units, list)
    assert len(learning_units) > 0


def test_learning_units_have_unique_ids():
    # Vsaka učna enota mora imeti unikaten _id.
    learning_units = load_json_file("learning_units.json")

    ids = [get_document_id(learning_unit) for learning_unit in learning_units]

    assert len(ids) == len(set(ids))


def test_learning_units_have_required_fields():
    # Preverimo osnovna obvezna polja učne enote.
    learning_units = load_json_file("learning_units.json")

    required_fields = {
        "_id",
        "title",
        "short_description",
        "duration_hours",
        "keywords",
        "content_topics",
        "acquired_competencies",
        "digcomp_competencies",
        "delivery_mode",
        "provider",
        "target_audience",
        "prerequisites",
        "knowledge_assessment",
        "certificate",
        "self_assessment_questions",
    }

    for learning_unit in learning_units:
        missing_fields = required_fields - learning_unit.keys()

        assert missing_fields == set(), (
            f"Učna enota {learning_unit.get('_id')} nima polj: {missing_fields}"
        )


def test_learning_unit_duration_hours_is_number():
    # Trajanje učne enote mora biti številka.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["duration_hours"], int | float), (
            f"duration_hours mora biti številka pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_keywords_are_lists():
    # Keywords morajo biti seznam, ker jih uporablja search logika.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["keywords"], list), (
            f"keywords mora biti list pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_content_topics_are_lists():
    # Content topics morajo biti seznam tem učne enote.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["content_topics"], list), (
            f"content_topics mora biti list pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_acquired_competencies_are_lists():
    # Acquired competencies morajo biti seznam pridobljenih kompetenc.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["acquired_competencies"], list), (
            f"acquired_competencies mora biti list pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_digcomp_competencies_are_lists():
    # DigComp kompetence morajo biti zapisane kot seznam.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["digcomp_competencies"], list), (
            f"digcomp_competencies mora biti list pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_prerequisites_are_lists():
    # Prerequisites pri učni enoti so opisni pogoji in morajo biti seznam.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["prerequisites"], list), (
            f"prerequisites mora biti list pri učni enoti {learning_unit['_id']}"
        )


def test_learning_unit_self_assessment_questions_are_lists():
    # Vprašanja za samooceno morajo biti seznam, tudi če je prazen.
    learning_units = load_json_file("learning_units.json")

    for learning_unit in learning_units:
        assert isinstance(learning_unit["self_assessment_questions"], list), (
            "self_assessment_questions mora biti list pri učni enoti "
            f"{learning_unit['_id']}"
        )


def test_digcomp_competencies_have_required_fields():
    # Vsaka DigComp kompetenca mora imeti osnovne opisne podatke.
    learning_units = load_json_file("learning_units.json")

    required_fields = {
        "code",
        "title",
        "description",
    }

    for learning_unit in learning_units:
        for competency in learning_unit["digcomp_competencies"]:
            missing_fields = required_fields - competency.keys()

            assert missing_fields == set(), (
                f"DigComp kompetenca v učni enoti {learning_unit['_id']} nima polj: "
                f"{missing_fields}"
            )


def test_self_assessment_questions_have_required_fields():
    # Vsako vprašanje mora imeti podatke za questionnaire in assessment logiko.
    learning_units = load_json_file("learning_units.json")

    required_question_fields = {
        "id",
        "question",
        "type",
        "related_topic",
    }

    for learning_unit in learning_units:
        for question in learning_unit["self_assessment_questions"]:
            missing_fields = required_question_fields - question.keys()

            assert missing_fields == set(), (
                f"Vprašanje v učni enoti {learning_unit['_id']} nima polj: "
                f"{missing_fields}"
            )


def test_self_assessment_question_types_are_supported():
    # Trenutno podpiramo yes_no vprašanja.
    learning_units = load_json_file("learning_units.json")

    supported_types = {
        "yes_no",
    }

    for learning_unit in learning_units:
        for question in learning_unit["self_assessment_questions"]:
            assert question["type"] in supported_types, (
                f"Vprašanje {question['id']} v učni enoti {learning_unit['_id']} "
                f"ima nepodprt type: {question['type']}"
            )