import pytest

from app.main import app


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    """
    Počisti FastAPI dependency overrides pred in po vsakem testu.

    To prepreči, da bi override iz enega API testa vplival na drug test.
    """

    app.dependency_overrides.clear()

    yield

    app.dependency_overrides.clear()


@pytest.fixture
def sample_user_id():
    """
    Skupni testni user_id.
    """

    return "user_001"


@pytest.fixture
def sample_learning_path_id():
    """
    Skupni testni learning path ID.
    """

    return "lp_001"


@pytest.fixture
def sample_module_id():
    """
    Skupni testni module ID.
    """

    return "mod_001"


@pytest.fixture
def sample_learning_unit_id():
    """
    Skupni testni learning unit ID.
    """

    return "ue_001"


@pytest.fixture
def sample_topic_id():
    """
    Skupni testni topic ID.
    """

    return "topic_001"


@pytest.fixture
def sample_competency_code():
    """
    Skupna testna DigComp competency code vrednost.
    """

    return "1.2"


@pytest.fixture
def sample_progress_response():
    """
    Osnovna stabilna user progress struktura za API/service teste.
    """

    return {
        "_id": "progress_user_001",
        "user_id": "user_001",
        "saved": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "favorites": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "completed": {
            "learning_path_ids": [],
            "module_ids": [],
            "learning_unit_ids": [],
        },
        "current_positions": [],
        "questionnaire_answers": [],
    }


@pytest.fixture
def sample_questionnaire_answer():
    """
    Osnovni odgovor iz vprašalnika.
    """

    return {
        "question_id": "q_001",
        "question": "Razumem osnovne pojme.",
        "type": "yes_no",
        "answer": True,
        "learning_path_id": "lp_001",
        "module_id": "mod_001",
        "learning_unit_id": "ue_001",
        "topic_id": "topic_001",
        "competency_codes": ["1.2"],
    }


@pytest.fixture
def sample_learning_unit_document():
    """
    Osnovni dokument učne enote za service teste.
    """

    return {
        "_id": "ue_001",
        "title": "Osnovni pojmi umetne inteligence",
        "short_description": "Kratek uvod v osnovne pojme umetne inteligence.",
        "keywords": ["umetna inteligenca", "osnove"],
        "content_topics": [
            {
                "id": "topic_001",
                "title": "Osnovni pojmi",
                "related_competency_codes": ["1.2"],
            }
        ],
        "digcomp_competencies": [
            {
                "code": "1.2",
                "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                "area": "Informacijska in podatkovna pismenost",
            }
        ],
        "self_assessment_questions": [
            {
                "id": "q_001",
                "question": "Razumem osnovne pojme.",
                "type": "yes_no",
                "related_topic": "Osnovni pojmi",
                "related_topic_id": "topic_001",
                "related_competency_codes": ["1.2"],
            }
        ],
    }


@pytest.fixture
def sample_module_document():
    """
    Osnovni dokument modula za service/repository teste.
    """

    return {
        "_id": "mod_001",
        "title": "Razumevanje umetne inteligence",
        "short_description": "Modul za osnovno razumevanje umetne inteligence.",
        "keywords": ["umetna inteligenca", "modul"],
        "learning_units": [
            {
                "learning_unit_id": "ue_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    }


@pytest.fixture
def sample_learning_path_document():
    """
    Osnovni dokument učne poti za service/repository teste.
    """

    return {
        "_id": "lp_001",
        "title": "Učna pot digitalnih kompetenc",
        "short_description": "Učna pot za razvoj digitalnih kompetenc.",
        "keywords": ["digitalne kompetence", "učna pot"],
        "steps": [
            {
                "type": "module",
                "ref_id": "mod_001",
                "order": 1,
                "parallel_group": None,
                "is_required": True,
                "prerequisites": [],
            }
        ],
    }