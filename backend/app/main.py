from fastapi import FastAPI

from app.api.competency_groups import router as competency_groups_router
from app.api.questionnaires import router as questionnaires_router

app = FastAPI(
    title="Psi-Up API",
    description="Backend API for the Psi-Up learning path recommendation system.",
    version="0.1.0",
)


app.include_router(competency_groups_router, prefix="/api")
app.include_router(questionnaires_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Psi-Up backend is running."
    }