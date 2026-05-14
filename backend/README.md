# Backend struktura

Backend je organiziran tako, da so ločeni API endpointi, poslovna logika, dostop do podatkov, podatkovne sheme in povezava z bazo. Takšna struktura omogoča lažje vzdrževanje, testiranje in kasnejše razširitve sistema.

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   └── competency_groups.py
│   │
│   ├── services/
│   │   └── competency_groups/
│   │       ├── __init__.py
│   │       └── competency_group_service.py
│   │
│   ├── repositories/
│   │   └── competency_group_repository.py
│   │
│   ├── schemas/
│   │   └── competency_group_schema.py
│   │
│   └── database/
│       └── mongodb.py
│
├── data/
│   └── mongodb/
│       ├── competencies.json
│       ├── competency_groups.json
│       ├── learning_paths.json
│       ├── learning_units.json
│       └── modules.json
│
├── tests/
├── .env.example
└── requirements.txt
```
## Namen datoteke
| Mapa/datoteka | Namen |
| :-- | :-- |
| `backend/` | Glavna mapa za backend del aplikacije. |
| `app/` | Vsebuje glavno Python aplikacijo in njene notranje module. |
| `app/main.py` | Vstopna točka backend aplikacije. Tukaj se zažene aplikacija in povežejo glavni deli sistema. |
| `app/config.py` | Konfiguracijske nastavitve aplikacije, na primer nastavitve okolja, povezave in osnovne vrednosti. |
| `app/api/` | Vsebuje API endpoint-e, prek katerih frontend komunicira z backendom. |
| `app/services/` | Vsebuje poslovno logiko aplikacije, na primer logiko za priporočila, vprašalnik in učne poti. |
| `app/repositories/` | Skrbi za dostop do podatkov. Ta plast loči poslovno logiko od konkretnega vira podatkov, na primer JSON datotek ali MongoDB. |
| `app/schemas/` | Vsebuje podatkovne sheme za vhodne in izhodne podatke API-ja. |
| `app/database/` | Vsebuje konfiguracijo in povezavo s podatkovno bazo. |
| `data/` | Vsebuje začasne oziroma razvojne podatke, ki se uporabljajo pred povezavo s pravo bazo podatkov. 
| `tests/` | Vsebuje teste za backend funkcionalnosti. |

# Navodila za zagon

## Povezava do MongoDB Atlas Cluster

1. Odpri MongoDB Compass.
2. Klikni New Connection.
3. V polje za povezavo prilepi connection string:
  ```text
    mongodb+srv://<username>:<password>@cluster0.g0ntvzk.mongodb.net/
  ```

4. Zamenjaj:
<username> in <password>

5. Klikni Connect.
6. Po povezavi poišči bazo: psi_up

V bazi morajo biti kolekcije:
```text
competencies
competency_groups
learning_paths
learning_units
modules
```

# Zagon backend aplikacije
1. Premik v backend mapo
```text
cd backend
```
2. Ustvarjanje virtualnega okolja
```text
python -m venv venv
```
3. Aktiviranje virtualnega okolja
```text
venv\Scripts\activate
```
4. Namestitev knjižnic
```text
pip install -r requirements.txt
```
5. Zagon backend aplikacije
```text
uvicorn app.main:app --reload
```

Backend se zažene na naslovu:
```text
http://127.0.0.1:8000
```

Dokumentacija API-ja je dostopna na:
```text
http://127.0.0.1:8000/docs
```

Izklop virtualnega okolja
```text
deactivate
```



# Trenutno zamišljen flow aplikacije

1. Uporabnik izbere skupino kompetenc.
2. Sistem prikaže vprašalnik za to skupino.
3. Uporabnik odgovori na vprašanja.
4. Backend na podlagi odgovorov določi eno ali več kompetenc znotraj te skupine.
5. Uporabnik se samooceni za izbrano kompetenco oziroma kompetence.
6. Backend določi trenutno raven znanja.
7. Backend poišče module za izbrane kompetence.
8. Backend upošteva predpogoje modulov.
9. Backend določi vrstni red modulov.
10. Backend vrne pripravljeno učno pot.


# Samoocenjevanje
Sistem ugotovi: uporabnik je najbližje kompetenci "AI podpora pri vsakdanjem delu".

Potem vpraša:
Kako bi ocenili svoje trenutno znanje uporabe AI orodij?

- Nimam izkušenj
- Znam osnovno uporabljati AI orodja
- Znam pisati jasne pozive
- Znam uporabljati AI pri kompleksnih delovnih nalogah

Backend dobi:

{
  "competency_id": "komp_4",
  "self_assessment_level": "basic"
}

Potem iz tega sestavi pot.

# Načrtovani API endpointi
GET  /api/competency-groups
GET  /api/competency-groups/{groupId}
GET  /api/competency-groups/{groupId}/questionnaire

POST /api/recommendations/competencies
POST /api/assessments/self-assessment
POST /api/learning-paths/generate

GET  /api/competencies
GET  /api/competencies/{competencyId}

GET  /api/learning-paths
GET  /api/learning-paths/{learningPathId}

GET  /api/modules
GET  /api/modules/{moduleId}

GET  /api/learning-units
GET  /api/learning-units/{learningUnitId}


