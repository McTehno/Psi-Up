import json
from pathlib import Path


LEARNING_UNITS_JSON_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "nova_verzija_data"
    / "learning_units.json"
)


def load_learning_units():
    # Preberemo learning_units.json iz nove data mape.
    with LEARNING_UNITS_JSON_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def test_learning_units_json_file_exists():
    # Preverimo, da learning_units.json obstaja na pričakovani lokaciji.
    assert LEARNING_UNITS_JSON_PATH.exists()


def test_learning_units_json_contains_list():
    # Glavna struktura learning_units.json mora biti seznam učnih enot.
    learning_units = load_learning_units()

    assert isinstance(learning_units, list)
    assert len(learning_units) > 0


def test_each_learning_unit_has_required_fields():
    # Vsaka učna enota mora imeti osnovna obvezna polja.
    learning_units = load_learning_units()

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
        assert required_fields.issubset(learning_unit.keys())


def test_each_learning_unit_has_valid_basic_values():
    # Osnovna polja učne enote morajo imeti pravilne tipe in ne smejo biti prazna.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        assert isinstance(learning_unit["_id"], str)
        assert learning_unit["_id"].strip()

        assert isinstance(learning_unit["title"], str)
        assert learning_unit["title"].strip()

        assert isinstance(learning_unit["short_description"], str)
        assert learning_unit["short_description"].strip()

        assert isinstance(learning_unit["duration_hours"], (int, float))
        assert learning_unit["duration_hours"] > 0

        assert isinstance(learning_unit["keywords"], list)
        assert len(learning_unit["keywords"]) > 0

        assert isinstance(learning_unit["content_topics"], list)
        assert len(learning_unit["content_topics"]) > 0

        assert isinstance(learning_unit["acquired_competencies"], list)
        assert len(learning_unit["acquired_competencies"]) > 0

        assert isinstance(learning_unit["digcomp_competencies"], list)
        assert len(learning_unit["digcomp_competencies"]) > 0

        assert isinstance(learning_unit["delivery_mode"], str)
        assert learning_unit["delivery_mode"].strip()

        assert isinstance(learning_unit["provider"], str)
        assert learning_unit["provider"].strip()

        assert isinstance(learning_unit["target_audience"], str)
        assert learning_unit["target_audience"].strip()

        assert isinstance(learning_unit["prerequisites"], list)

        assert isinstance(learning_unit["knowledge_assessment"], str)
        assert learning_unit["knowledge_assessment"].strip()

        assert isinstance(learning_unit["certificate"], str)
        assert learning_unit["certificate"].strip()

        assert isinstance(learning_unit["self_assessment_questions"], list)
        assert len(learning_unit["self_assessment_questions"]) > 0


def test_learning_unit_ids_are_unique():
    # Vsaka učna enota mora imeti unikaten _id.
    learning_units = load_learning_units()

    learning_unit_ids = [
        learning_unit["_id"]
        for learning_unit in learning_units
    ]

    assert len(learning_unit_ids) == len(set(learning_unit_ids))


def test_learning_unit_keywords_are_valid_strings():
    # Keywords morajo biti neprazni stringi.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for keyword in learning_unit["keywords"]:
            assert isinstance(keyword, str)
            assert keyword.strip()


def test_learning_unit_prerequisites_are_valid_strings():
    # Prerequisites na učni enoti morajo biti neprazni stringi.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for prerequisite in learning_unit["prerequisites"]:
            assert isinstance(prerequisite, str)
            assert prerequisite.strip()


def test_acquired_competencies_are_valid_strings():
    # Acquired competencies morajo biti neprazni opisi kompetenc.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for competency in learning_unit["acquired_competencies"]:
            assert isinstance(competency, str)
            assert competency.strip()


def test_each_content_topic_has_required_fields():
    # Vsak content topic mora imeti id, title in related_competency_codes.
    learning_units = load_learning_units()

    required_topic_fields = {
        "id",
        "title",
        "related_competency_codes",
    }

    for learning_unit in learning_units:
        for topic in learning_unit["content_topics"]:
            assert required_topic_fields.issubset(topic.keys())


def test_each_content_topic_has_valid_values():
    # Content topic mora imeti veljavne tipe in neprazne vrednosti.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for topic in learning_unit["content_topics"]:
            assert isinstance(topic["id"], str)
            assert topic["id"].strip()

            assert isinstance(topic["title"], str)
            assert topic["title"].strip()

            assert isinstance(topic["related_competency_codes"], list)
            assert len(topic["related_competency_codes"]) > 0

            for code in topic["related_competency_codes"]:
                assert isinstance(code, str)
                assert code.strip()


def test_content_topic_ids_are_unique_inside_learning_unit():
    # Znotraj ene učne enote se isti content topic id ne sme ponoviti.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        topic_ids = [
            topic["id"]
            for topic in learning_unit["content_topics"]
        ]

        assert len(topic_ids) == len(set(topic_ids))


def test_each_digcomp_competency_has_required_fields():
    # Vsaka DigComp kompetenca mora imeti code, title in description.
    learning_units = load_learning_units()

    required_competency_fields = {
        "code",
        "title",
        "description",
    }

    for learning_unit in learning_units:
        for competency in learning_unit["digcomp_competencies"]:
            assert required_competency_fields.issubset(competency.keys())


def test_each_digcomp_competency_has_valid_values():
    # DigComp kompetence morajo imeti veljavne neprazne vrednosti.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for competency in learning_unit["digcomp_competencies"]:
            assert isinstance(competency["code"], str)
            assert competency["code"].strip()

            assert isinstance(competency["title"], str)
            assert competency["title"].strip()

            assert isinstance(competency["description"], str)
            assert competency["description"].strip()


def test_digcomp_codes_from_topics_exist_in_digcomp_competencies():
    # Vsaka kompetenca, uporabljena v content_topics, mora obstajati v digcomp_competencies.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        digcomp_codes = {
            competency["code"]
            for competency in learning_unit["digcomp_competencies"]
        }

        topic_codes = {
            code
            for topic in learning_unit["content_topics"]
            for code in topic["related_competency_codes"]
        }

        assert topic_codes.issubset(digcomp_codes)


def test_each_self_assessment_question_has_required_fields():
    # Vsako samoocenjevalno vprašanje mora imeti osnovna obvezna polja.
    learning_units = load_learning_units()

    required_question_fields = {
        "id",
        "question",
        "type",
        "related_topic",
        "related_topic_id",
        "related_competency_codes",
    }

    for learning_unit in learning_units:
        for question in learning_unit["self_assessment_questions"]:
            assert required_question_fields.issubset(question.keys())


def test_each_self_assessment_question_has_valid_values():
    # Samoocenjevalna vprašanja morajo imeti pravilne tipe in trenutno yes_no tip.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        for question in learning_unit["self_assessment_questions"]:
            assert isinstance(question["id"], str)
            assert question["id"].strip()

            assert isinstance(question["question"], str)
            assert question["question"].strip()

            assert question["type"] == "yes_no"

            assert isinstance(question["related_topic"], str)
            assert question["related_topic"].strip()

            assert isinstance(question["related_topic_id"], str)
            assert question["related_topic_id"].strip()

            assert isinstance(question["related_competency_codes"], list)
            assert len(question["related_competency_codes"]) > 0

            for code in question["related_competency_codes"]:
                assert isinstance(code, str)
                assert code.strip()


def test_self_assessment_question_ids_are_unique_inside_learning_unit():
    # Znotraj ene učne enote se isti question id ne sme ponoviti.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        question_ids = [
            question["id"]
            for question in learning_unit["self_assessment_questions"]
        ]

        assert len(question_ids) == len(set(question_ids))


def test_self_assessment_questions_reference_existing_content_topics():
    # Vsako vprašanje mora kazati na obstoječ content topic iste učne enote.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        topic_ids = {
            topic["id"]
            for topic in learning_unit["content_topics"]
        }

        for question in learning_unit["self_assessment_questions"]:
            assert question["related_topic_id"] in topic_ids


def test_self_assessment_question_topic_title_matches_content_topic_title():
    # related_topic naj se ujema z naslovom content topic-a, na katerega vprašanje kaže.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        topics_by_id = {
            topic["id"]: topic
            for topic in learning_unit["content_topics"]
        }

        for question in learning_unit["self_assessment_questions"]:
            topic = topics_by_id[question["related_topic_id"]]

            assert question["related_topic"] == topic["title"]


def test_self_assessment_question_codes_match_related_topic_codes():
    # Kompetence pri vprašanju naj se ujemajo s kompetencami povezanega content topic-a.
    learning_units = load_learning_units()

    for learning_unit in learning_units:
        topics_by_id = {
            topic["id"]: topic
            for topic in learning_unit["content_topics"]
        }

        for question in learning_unit["self_assessment_questions"]:
            topic = topics_by_id[question["related_topic_id"]]

            assert set(question["related_competency_codes"]) == set(
                topic["related_competency_codes"]
            )


def test_learning_units_include_expected_example_ids():
    # Preverimo, da so prisotne pričakovane začetne učne enote iz nove data verzije.
    learning_units = load_learning_units()

    learning_unit_ids = {
        learning_unit["_id"]
        for learning_unit in learning_units
    }

    assert "ue_001" in learning_unit_ids
    assert "ue_005" in learning_unit_ids
    assert "ue_012" in learning_unit_ids