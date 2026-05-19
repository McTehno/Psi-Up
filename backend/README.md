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
│   │   ├── competency_groups.py
│   │   ├── questionnaires.py
│   │   ├── recommendations.py
│   │   ├── assessments.py
│   │   ├── learning_paths.py
│   │   ├── competencies.py
│   │   ├── modules.py
│   │   └── learning_units.py
│   │
│   ├── services/
│   │   ├── competency_groups/
│   │   │   ├── __init__.py
│   │   │   └── competency_group_service.py
│   │   │
│   │   ├── competencies/
│   │   │   ├── __init__.py
│   │   │   └── competency_service.py
│   │   │
│   │   ├── questionnaires/
│   │   │   ├── __init__.py
│   │   │   └── questionnaire_service.py
│   │   │
│   │   ├── recommendations/
│   │   │   ├── __init__.py
│   │   │   └── recommendation_service.py
│   │   │
│   │   ├── assessments/
│   │   │   ├── __init__.py
│   │   │   └── assessment_service.py
│   │   │
│   │   ├── learning_paths/
│   │   │   ├── __init__.py
│   │   │   └── learning_path_service.py
│   │   │
│   │   ├── modules/
│   │   │   ├── __init__.py
│   │   │   └── module_service.py
│   │   │
│   │   └── learning_units/
│   │       ├── __init__.py
│   │       └── learning_unit_service.py
│   │
│   ├── repositories/
│   │   ├── competency_group_repository.py
│   │   ├── competency_repository.py
│   │   ├── learning_path_repository.py
│   │   ├── module_repository.py
│   │   └── learning_unit_repository.py
│   │
│   ├── schemas/
│   │   ├── competency_group_schema.py
│   │   ├── questionnaire_schema.py
│   │   ├── recommendation_schema.py
│   │   ├── competency_schema.py
│   │   ├── assessment_schema.py
│   │   ├── learning_path_schema.py
│   │   ├── module_schema.py
│   │   └── learning_unit_schema.py
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

## API endpointi

Backend uporablja **FastAPI**. Endpointi so organizirani po glavnih entitetah aplikacije: učne poti, moduli, učne enote, vprašalniki, ocenjevanje, uporabniki in napredek uporabnika.

Vsi endpointi imajo osnovni prefix:

```text
/api
```

Primer:

```text
/api/learning-units
/api/search?query=Excel
```

---

### Search

Search omogoča iskanje po učnih poteh, modulih in učnih enotah. Uporablja se kot začetna točka aplikacije, kjer uporabnik vnese ključni pojem, na primer `Excel`.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/search` | Iskanje po učnih poteh, modulih in učnih enotah |

Primer:

```text
/search?query=Excel
```

Primer z izbiro tipa vsebine:

```text
/search?query=Excel&types=module
```

Primer z več tipi vsebin:

```text
/search?query=Excel&types=learning_path&types=module
```

---

### Učne poti

Učna pot predstavlja širše učno zaporedje, sestavljeno iz več modulov. Endpointi omogočajo pridobivanje učnih poti, njihovih modulov, podrobnosti, vprašalnika in dostopnih modulov glede na predpogoje.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/learning-paths` | Pridobi vse učne poti |
| GET | `/learning-paths/{learning_path_id}` | Pridobi eno učno pot |
| GET | `/learning-paths/{learning_path_id}/detail` | Pridobi podrobnosti učne poti skupaj s podatki o modulih |
| GET | `/learning-paths/{learning_path_id}/modules` | Pridobi module znotraj učne poti |
| GET | `/learning-paths/{learning_path_id}/available-modules` | Pridobi dostopne module glede na dokončane predpogoje |
| GET | `/learning-paths/{learning_path_id}/questionnaire` | Pridobi vprašalnik za učno pot |

Primer:

```text
/learning-paths/up_002
```

Primer za dostopne module:

```text
/learning-paths/up_002/available-modules?completed_module_ids=mod_003
```

---

### Moduli

Modul je sestavljen iz več učnih enot. Endpointi omogočajo pridobivanje modulov, njihovih učnih enot, podrobnosti, vprašalnika in dostopnih učnih enot glede na predpogoje.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/modules` | Pridobi vse module |
| GET | `/modules/{module_id}` | Pridobi en modul |
| GET | `/modules/{module_id}/detail` | Pridobi podrobnosti modula skupaj s podatki o učnih enotah |
| GET | `/modules/{module_id}/learning-units` | Pridobi učne enote znotraj modula |
| GET | `/modules/{module_id}/available-learning-units` | Pridobi dostopne učne enote glede na dokončane predpogoje |
| GET | `/modules/{module_id}/questionnaire` | Pridobi vprašalnik za modul |

Primer:

```text
/modules/mod_003
```

Primer za dostopne učne enote:

```text
/modules/mod_003/available-learning-units?completed_learning_unit_ids=ue_005
```

---

### Učne enote

Učna enota je najmanjši del učne vsebine. Vsebuje osnovne podatke, spretnosti oziroma kompetence in vprašanja za samooceno.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/learning-units` | Pridobi vse učne enote |
| GET | `/learning-units/{learning_unit_id}` | Pridobi eno učno enoto |
| GET | `/learning-units/{learning_unit_id}/detail` | Pridobi podrobnosti učne enote |
| GET | `/learning-units/{learning_unit_id}/questionnaire` | Pridobi vprašalnik za učno enoto |

Primer:

```text
/learning-units/ue_005
```

---

### Vprašalniki

Vprašalniki se generirajo iz vprašanj za samooceno, ki so shranjena znotraj učnih enot. Vprašalnik se lahko pridobi za učno pot, modul ali posamezno učno enoto.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/questionnaires` | Pridobi vprašalnik za učno pot, modul ali učno enoto |

Primer za učno pot:

```text
/questionnaires?target_type=learning_path&target_id=up_002
```

Primer za modul:

```text
/questionnaires?target_type=module&target_id=mod_003
```

Primer za učno enoto:

```text
/questionnaires?target_type=learning_unit&target_id=ue_005
```

---

### Ocenjevanje

Ocenjevanje obdela odgovore uporabnika iz vprašalnika. Na podlagi odgovorov določi, katere učne enote ali module uporabnik že obvlada, katere lahko preskoči in kje naj začne z učenjem.

| Metoda | Endpoint | Namen |
|---|---|---|
| POST | `/assessments/evaluate` | Oceni odgovore in določi začetno točko uporabnika |

Primer request body:

```json
{
  "user_id": "user_001",
  "target_type": "learning_path",
  "target_id": "up_002",
  "answers": [
    {
      "question_id": "q_ue_005_001",
      "learning_unit_id": "ue_005",
      "answer": true
    }
  ]
}
```

Primer rezultata:

```json
{
  "user_id": "user_001",
  "target_type": "learning_path",
  "target_id": "up_002",
  "start_module_id": "mod_004",
  "start_learning_unit_id": "ue_009",
  "skipped_modules": ["mod_003"],
  "skipped_learning_units": ["ue_005", "ue_006", "ue_007"],
  "recommended_next_modules": ["mod_004"],
  "recommended_next_learning_units": ["ue_009"],
  "summary": "Uporabnik naj začne pri modulu mod_004."
}
```

---

### Uporabniki

Uporabniki predstavljajo lokalni aplikacijski profil. Prijava in registracija bosta izvedeni prek zunanjega auth sistema, na primer Auth0. Backend ne hrani gesel, ampak samo poveže zunanjega uporabnika z lokalnim profilom.

| Metoda | Endpoint | Namen |
|---|---|---|
| POST | `/users/profile` | Vrne ali ustvari uporabniški profil po zunanji prijavi |
| GET | `/users/by-auth/{auth_user_id}` | Pridobi uporabnika po zunanjem auth ID |
| GET | `/users/{user_id}` | Pridobi uporabnika po lokalnem ID |
| PUT | `/users/{user_id}` | Posodobi uporabniški profil |

Primer lokalnega uporabnika:

```json
{
  "_id": "user_001",
  "auth_provider": "auth0",
  "auth_user_id": "auth0|123456789",
  "name": "Testni uporabnik",
  "email": "test@example.com"
}
```

---

### Napredek uporabnika

Napredek uporabnika hrani informacije o tem, katere vsebine je uporabnik shranil, označil kot priljubljene, dokončal in kje se trenutno nahaja.

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/user-progress/{user_id}` | Pridobi napredek uporabnika |
| POST | `/user-progress/{user_id}/ensure` | Vrne obstoječ ali ustvari nov zapis napredka |
| POST | `/user-progress/save` | Shrani učno pot, modul ali učno enoto |
| DELETE | `/user-progress/save` | Odstrani shranjeno vsebino |
| POST | `/user-progress/favorite` | Označi vsebino kot priljubljeno |
| DELETE | `/user-progress/favorite` | Odstrani vsebino iz priljubljenih |
| POST | `/user-progress/complete` | Označi vsebino kot dokončano |
| DELETE | `/user-progress/complete` | Odstrani vsebino iz dokončanih |
| PUT | `/user-progress/current-position` | Posodobi trenutno pozicijo uporabnika |

Primer za shranjevanje učne poti:

```json
{
  "user_id": "user_001",
  "content_id": "up_002",
  "content_type": "learning_path"
}
```

Primer za trenutno pozicijo:

```json
{
  "user_id": "user_001",
  "learning_path_id": "up_002",
  "current_module_id": "mod_004",
  "current_learning_unit_id": "ue_008"
}
```

---

### Opomba o Auth0

Registracija in prijava uporabnika se ne izvajata neposredno v backendu. Za to bo uporabljen zunanji auth sistem, na primer Auth0.

Predviden flow:

1. Uporabnik se prijavi ali registrira na frontendu prek Auth0.
2. Frontend pridobi Auth0 podatke oziroma token.
3. Frontend pokliče backend endpoint `/users/profile`.
4. Backend preveri, ali uporabnik že obstaja v lokalni bazi.
5. Če uporabnik ne obstaja, backend ustvari lokalni profil in začetni zapis `user_progress`.
6. Gesla ostanejo v Auth0 in se ne hranijo v naši bazi.

---