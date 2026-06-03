from fastapi.testclient import TestClient

from app.api.learning_units import (
    get_learning_unit_service,
    get_questionnaire_service,
)
from app.main import app


class FakeLearningUnitService:
    # Fake service uporabimo, da API test preverja endpoint, ne service logike.
    async def get_all_learning_units(self):
        return [
            {
                "_id": "ue_001",
                "title": "Osnovni pojmi umetne inteligence",
                "short_description": "Uvod v osnovne pojme umetne inteligence.",
                "duration_hours": 0.5,
                "keywords": ["umetna inteligenca", "UI"],
                "content_topics": [
                    {
                        "id": "topic_ue_001_001",
                        "title": "Razumevanje pojma umetna inteligenca",
                        "related_competency_codes": ["1.2"],
                    }
                ],
                "acquired_competencies": [
                    "Udeleženec razume osnovni koncept umetne inteligence"
                ],
                "digcomp_competencies": [
                    {
                        "code": "1.2",
                        "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                        "description": "Prepoznava in razume digitalne informacije.",
                    }
                ],
                "delivery_mode": "Spletno",
                "provider": "NIDiKo demo izvajalec",
                "target_audience": "Odrasli uporabniki z osnovnim digitalnim znanjem",
                "prerequisites": ["Osnovna uporaba računalnika"],
                "knowledge_assessment": "Kratek kviz",
                "certificate": "Potrdilo o udeležbi",
                "self_assessment_questions": [
                    {
                        "id": "q_ue_001_001",
                        "question": "Razumem osnovni koncept umetne inteligence.",
                        "type": "yes_no",
                        "related_topic": "Razumevanje pojma umetna inteligenca",
                        "related_topic_id": "topic_ue_001_001",
                        "related_competency_codes": ["1.2"],
                    }
                ],
            }
        ]

    async def get_learning_unit_by_id(self, learning_unit_id: str):
        if learning_unit_id == "missing_id":
            return None

        return {
            "_id": learning_unit_id,
            "title": "Osnovni pojmi umetne inteligence",
            "short_description": "Uvod v osnovne pojme umetne inteligence.",
            "duration_hours": 0.5,
            "keywords": ["umetna inteligenca", "UI"],
            "content_topics": [
                {
                    "id": "topic_ue_001_001",
                    "title": "Razumevanje pojma umetna inteligenca",
                    "related_competency_codes": ["1.2"],
                }
            ],
            "acquired_competencies": [
                "Udeleženec razume osnovni koncept umetne inteligence"
            ],
            "digcomp_competencies": [
                {
                    "code": "1.2",
                    "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                    "description": "Prepoznava in razume digitalne informacije.",
                }
            ],
            "delivery_mode": "Spletno",
            "provider": "NIDiKo demo izvajalec",
            "target_audience": "Odrasli uporabniki z osnovnim digitalnim znanjem",
            "prerequisites": ["Osnovna uporaba računalnika"],
            "knowledge_assessment": "Kratek kviz",
            "certificate": "Potrdilo o udeležbi",
            "self_assessment_questions": [
                {
                    "id": "q_ue_001_001",
                    "question": "Razumem osnovni koncept umetne inteligence.",
                    "type": "yes_no",
                    "related_topic": "Razumevanje pojma umetna inteligenca",
                    "related_topic_id": "topic_ue_001_001",
                    "related_competency_codes": ["1.2"],
                }
            ],
        }

    async def get_learning_unit_detail(self, learning_unit_id: str):
        if learning_unit_id == "missing_id":
            return None

        return {
            "_id": learning_unit_id,
            "title": "Osnovni pojmi umetne inteligence",
            "short_description": "Uvod v osnovne pojme umetne inteligence.",
            "duration_hours": 0.5,
            "keywords": ["umetna inteligenca", "UI"],
            "content_topics": [
                {
                    "id": "topic_ue_001_001",
                    "title": "Razumevanje pojma umetna inteligenca",
                    "related_competency_codes": ["1.2"],
                }
            ],
            "acquired_competencies": [
                "Udeleženec razume osnovni koncept umetne inteligence"
            ],
            "digcomp_competencies": [
                {
                    "code": "1.2",
                    "title": "Vrednotenje podatkov, informacij in digitalnih vsebin",
                    "description": "Prepoznava in razume digitalne informacije.",
                }
            ],
            "delivery_mode": "Spletno",
            "provider": "NIDiKo demo izvajalec",
            "target_audience": "Odrasli uporabniki z osnovnim digitalnim znanjem",
            "prerequisites": ["Osnovna uporaba računalnika"],
            "knowledge_assessment": "Kratek kviz",
            "certificate": "Potrdilo o udeležbi",
            "self_assessment_questions": [
                {
                    "id": "q_ue_001_001",
                    "question": "Razumem osnovni koncept umetne inteligence.",
                    "type": "yes_no",
                    "related_topic": "Razumevanje pojma umetna inteligenca",
                    "related_topic_id": "topic_ue_001_001",
                    "related_competency_codes": ["1.2"],
                }
            ],
            "recommended_modules": [
                {
                    "_id": "mod_001",
                    "title": "Razumevanje umetne inteligence",
                    "short_description": "Modul predstavlja osnovne pojme umetne inteligence.",
                    "duration_hours": 1.75,
                    "keywords": ["umetna inteligenca", "UI"],
                    "domains": ["Umetna inteligenca"],
                }
            ],
        }


class FakeQuestionnaireService:
    # Fake questionnaire service uporabimo za endpoint /questionnaire.
    async def generate_questionnaire(self, target_type, target_id: str):
        if target_id == "missing_id":
            return None

        return {
            "target_type": target_type,
            "target_id": target_id,
            "title": "Vprašalnik za učno enoto",
            "questions": [
                {
                    "id": "q_ue_001_001",
                    "question": "Razumem osnovni koncept umetne inteligence.",
                    "type": "yes_no",
                    "learning_unit_id": target_id,
                    "related_topic": "Razumevanje pojma umetna inteligenca",
                    "related_topic_id": "topic_ue_001_001",
                    "related_competency_codes": ["1.2"],
                    "sources": [
                        {
                            "learning_unit_id": target_id,
                            "topic_id": "topic_ue_001_001",
                            "competency_codes": ["1.2"],
                        }
                    ],
                }
            ],
        }


def override_learning_unit_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake learning unit service.
    return FakeLearningUnitService()


def override_questionnaire_service():
    # FastAPI dependency override poskrbi, da endpoint uporablja fake questionnaire service.
    return FakeQuestionnaireService()


client = TestClient(app)


def setup_function():
    # Pred vsakim testom nastavimo fake service odvisnosti.
    app.dependency_overrides[get_learning_unit_service] = override_learning_unit_service
    app.dependency_overrides[get_questionnaire_service] = override_questionnaire_service


def teardown_function():
    # Po vsakem testu počistimo override, da testi ne vplivajo drug na drugega.
    app.dependency_overrides.clear()


def test_get_learning_units_returns_list():
    # Preverimo, da endpoint vrne seznam učnih enot.
    response = client.get("/api/learning-units")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["_id"] == "ue_001"
    assert data[0]["title"] == "Osnovni pojmi umetne inteligence"
    assert len(data[0]["content_topics"]) == 1
    assert len(data[0]["self_assessment_questions"]) == 1


def test_get_learning_unit_by_id_returns_learning_unit():
    # Preverimo, da endpoint vrne eno učno enoto po ID.
    response = client.get("/api/learning-units/ue_001")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "ue_001"
    assert data["title"] == "Osnovni pojmi umetne inteligence"
    assert data["content_topics"][0]["id"] == "topic_ue_001_001"
    assert data["digcomp_competencies"][0]["code"] == "1.2"


def test_get_learning_unit_by_id_returns_404_when_missing():
    # Če učna enota ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna enota ni najdena."


def test_get_learning_unit_detail_returns_detail():
    # Detail endpoint vrne učno enoto z recommended_modules.
    response = client.get("/api/learning-units/ue_001/detail")

    assert response.status_code == 200

    data = response.json()

    assert data["_id"] == "ue_001"
    assert data["title"] == "Osnovni pojmi umetne inteligence"
    assert len(data["recommended_modules"]) == 1
    assert data["recommended_modules"][0]["_id"] == "mod_001"
    assert data["recommended_modules"][0]["title"] == "Razumevanje umetne inteligence"


def test_get_learning_unit_detail_returns_404_when_missing():
    # Če učna enota za detail ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id/detail")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Učna enota ni najdena."


def test_get_learning_unit_questionnaire_returns_questionnaire():
    # Preverimo vprašalnik za izbrano učno enoto.
    response = client.get("/api/learning-units/ue_001/questionnaire")

    assert response.status_code == 200

    data = response.json()

    assert data["target_type"] == "learning_unit"
    assert data["target_id"] == "ue_001"
    assert data["title"] == "Vprašalnik za učno enoto"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["learning_unit_id"] == "ue_001"


def test_get_learning_unit_questionnaire_returns_404_when_missing():
    # Če vprašalnik ne obstaja, endpoint vrne 404.
    response = client.get("/api/learning-units/missing_id/questionnaire")

    assert response.status_code == 404

    data = response.json()

    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"] == "Vprašalnik ni najden."