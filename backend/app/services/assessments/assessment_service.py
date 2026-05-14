#Ta funkcija se uporablja za obdelavo samoocene uporabnika
# glede na izbrano kompetenco in nivo samoocene, 
# ki ga je uporabnik izbral na frontend strani. Funkcija preveri, 
# ali je nivo samoocene veljaven, in vrne ustrezno sporočilo o uspehu ali napaki.

ALLOWED_LEVELS = ["none", "basic", "intermediate", "advanced"]


def process_self_assessment(competency_id: str, self_assessment_level: str):
    if self_assessment_level not in ALLOWED_LEVELS:
        return None

    return {
        "competency_id": competency_id,
        "current_level": self_assessment_level,
        "message": "Samoocena je bila uspešno obdelana.",
    }