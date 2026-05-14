from fastapi import FastAPI

from app.api.competency_groups import router as competency_groups_router
from app.api.questionnaires import router as questionnaires_router
from app.api.recommendations import router as recommendations_router
from app.api.assessments import router as assessments_router
from app.api.learning_paths import router as learning_paths_router
from app.api.competencies import router as competencies_router
from app.api.modules import router as modules_router
from app.api.learning_units import router as learning_units_router



app = FastAPI(
    title="Psi-Up API",
    description="Backend API for the Psi-Up learning path recommendation system.",
    version="0.1.0",
)


app.include_router(competency_groups_router, prefix="/api")
app.include_router(questionnaires_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")
app.include_router(learning_paths_router, prefix="/api")
app.include_router(competencies_router, prefix="/api")
app.include_router(modules_router, prefix="/api")
app.include_router(learning_units_router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": "Psi-Up backend is running."
    }