# Backend dokumentacija

Backend je zgrajen z uporabo **FastAPI** in služi kot API plast za aplikacijo Psi-Up. Namen backenda je pridobivanje učnih poti, modulov, učnih enot, generiranje vprašalnikov, obdelava odgovorov, določanje začetne točke uporabnika ter hranjenje uporabniškega napredka.

Backend uporablja **MongoDB** kot podatkovno bazo.

---

## Backend struktura

Backend je organiziran po slojih, da je koda bolj pregledna, lažja za vzdrževanje in pripravljena za nadaljnje razširitve.

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── assessments.py
│   │   ├── learning_paths.py
│   │   ├── learning_units.py
│   │   ├── modules.py
│   │   ├── questionnaires.py
│   │   ├── search.py
│   │   ├── users.py
│   │   └── user_progress.py
│   │
│   ├── services/
│   │   ├── assessments/
│   │   ├── learning_paths/
│   │   ├── learning_units/
│   │   ├── modules/
│   │   ├── questionnaires/
│   │   ├── search/
│   │   ├── users/
│   │   ├── user_progress/
│   │   └── validation/
│   │
│   ├── repositories/
│   │   ├── learning_path_repository.py
│   │   ├── learning_unit_repository.py
│   │   ├── module_repository.py
│   │   ├── user_repository.py
│   │   └── user_progress/
│   │
│   ├── schemas/
│   │   ├── assessment_schema.py
│   │   ├── learning_path_schema.py
│   │   ├── learning_unit_schema.py
│   │   ├── module_schema.py
│   │   ├── questionnaire_schema.py
│   │   ├── search_schema.py
│   │   ├── user_schema.py
│   │   └── user_progress_schema.py
│   │
│   └── database/
│       └── mongodb.py
│
├── data/
│   └── nova_verzija_data/
│       ├── learning_paths.json
│       ├── learning_units.json
│       ├── modules.json
│       ├── user_progress.json
│       └── users.json
│
├── tests/
├── .env.example
└── requirements.txt
```

---

## Namen glavnih map

| Mapa/datoteka | Namen |
|---|---|
| `app/main.py` | Glavna vstopna točka aplikacije. Tukaj se registrirajo routerji in middleware. |
| `app/api/` | API endpointi, prek katerih frontend komunicira z backendom. |
| `app/services/` | Poslovna logika aplikacije. |
| `app/repositories/` | Dostop do MongoDB kolekcij. |
| `app/schemas/` | Pydantic sheme za requeste in response. |
| `app/database/` | Povezava z MongoDB. |
| `app/services/validation/` | Validacija podatkov pred zapisovanjem v bazo. |
| `data/nova_verzija_data/` | JSON podatki za uvoz v MongoDB Compass. |
| `tests/` | Testi za backend funkcionalnosti. |

---

## Podatkovni model

Podatkovni model je podrobno opisan v glavnem dokumentu projekta:

```text
../podatkovni-model.md
```

Backend trenutno uporablja naslednje glavne MongoDB kolekcije:

```text
learning_units
modules
learning_paths
users
user_progress
```

Kolekciji `competencies` in `competency_groups` se v novi strukturi ne uporabljata več kot glavni entiteti. Kompetence oziroma spretnosti so zapisane znotraj učnih enot.

---

## MongoDB kolekcije

### `learning_units`

Hrani učne enote. Učna enota je najmanjši del učne vsebine.

Vsebuje:
- `_id`
- `title`
- `short_description`
- `duration_min`
- `keywords`
- `skills`
- `self_assessment_questions`

### `modules`

Hrani module. Modul je sestavljen iz več učnih enot.

Vsebuje:
- `_id`
- `title`
- `short_description`
- `duration_min`
- `keywords`
- `domains`
- `learning_units`

Vsaka učna enota znotraj modula ima tudi:
- `learning_unit_id`
- `order`
- `parallel_group`
- `is_required`
- `prerequisites`

### `learning_paths`

Hrani učne poti. Učna pot je sestavljena iz več modulov.

Vsebuje:
- `_id`
- `title`
- `short_description`
- `duration_min`
- `keywords`
- `modules`

Vsak modul znotraj učne poti ima tudi:
- `module_id`
- `order`
- `parallel_group`
- `is_required`
- `prerequisites`

### `users`

Hrani lokalne uporabniške profile.

Prijava in registracija se izvajata prek zunanjega auth sistema, na primer Auth0. Backend ne hrani gesel.

### `user_progress`

Hrani napredek uporabnika.

Vsebuje:
- shranjene učne poti, module in učne enote,
- priljubljene učne poti, module in učne enote,
- dokončane učne poti, module in učne enote,
- trenutno pozicijo uporabnika.

---

## Prerequisites logika

Polje `prerequisites` določa, kateri elementi morajo biti dokončani, preden lahko uporabnik začne naslednjo vsebino.

Primer pri učnih enotah v modulu:

```json
{
  "learning_unit_id": "ue_006",
  "order": 2,
  "parallel_group": null,
  "is_required": true,
  "prerequisites": ["ue_005"]
}
```

To pomeni, da mora uporabnik najprej dokončati `ue_005`, preden lahko začne `ue_006`.

Primer pri modulih v učni poti:

```json
{
  "module_id": "mod_004",
  "order": 2,
  "parallel_group": null,
  "is_required": true,
  "prerequisites": ["mod_003"]
}
```

To pomeni, da mora uporabnik najprej dokončati `mod_003`, preden lahko začne `mod_004`.

`order` ostaja kot pomoč za prikaz vrstnega reda, glavna logika dostopnosti pa temelji na `prerequisites`.

---

## Search logika

Search omogoča iskanje po:

```text
learning_paths
modules
learning_units
```

Iskanje preverja:
- naslov,
- kratek opis,
- ključne besede,
- pri modulih tudi področja,
- pri učnih enotah tudi spretnosti.

Primer:

```text
/api/search?query=Excel
```

Primer iskanja samo po modulih:

```text
/api/search?query=Excel&types=module
```

Primer iskanja po več tipih vsebin:

```text
/api/search?query=Excel&types=learning_path&types=module
```

---

## Assessment logika

Assessment obdela odgovore uporabnika iz vprašalnika.

Osnovna logika:

```text
answer = true  → uporabnik spretnost zna
answer = false → uporabniku spretnost manjka
```

Učna enota je pokrita, če so vsa njena vprašanja odgovorjena z `true`.

Modul je pokrit, če so pokrite vse njegove obvezne učne enote.

Učna pot določi:
- kateri moduli se lahko preskočijo,
- katere učne enote se lahko preskočijo,
- pri katerem modulu naj uporabnik začne,
- pri kateri učni enoti naj uporabnik začne.

Assessment trenutno ne zapisuje rezultata neposredno v `user_progress`. Za zdaj samo vrne rezultat, frontend ali kasnejša backend logika pa lahko rezultat uporabi za posodobitev napredka.

---

## User progress logika

`user_progress` hrani stanje uporabnika v aplikaciji.

Omogoča:
- shranjevanje vsebin,
- označevanje priljubljenih vsebin,
- označevanje dokončanih vsebin,
- posodobitev trenutne pozicije uporabnika.

Primer:

```json
{
  "_id": "progress_user_001",
  "user_id": "user_001",
  "saved_learning_paths": ["up_002"],
  "saved_modules": ["mod_003"],
  "saved_learning_units": ["ue_005"],
  "favorite_learning_paths": ["up_002"],
  "favorite_modules": [],
  "favorite_learning_units": ["ue_006"],
  "completed_learning_paths": [],
  "completed_modules": ["mod_003"],
  "completed_learning_units": ["ue_005", "ue_006", "ue_007"],
  "current_positions": [
    {
      "learning_path_id": "up_002",
      "current_module_id": "mod_004",
      "current_learning_unit_id": "ue_008"
    }
  ]
}
```

---

## Validacija podatkov

Pred zapisovanjem v `user_progress` backend preveri:

- ali `user_progress` za uporabnika obstaja,
- ali je `content_type` veljaven,
- ali `content_id` obstaja v pravilni kolekciji,
- ali trenutna učna pot obstaja,
- ali trenutni modul obstaja,
- ali trenutna učna enota obstaja.

Dovoljene vrednosti za `content_type` so:

```text
learning_path
module
learning_unit
```

Primer napačne zahteve:

```json
{
  "user_id": "user_001",
  "content_id": "ue_999",
  "content_type": "learning_unit"
}
```

Backend v tem primeru ne shrani podatka in vrne napako, ker `ue_999` ne obstaja.

---

# Navodila za zagon backend-a

## 1. Premik v backend mapo

```bash
cd backend
```

## 2. Ustvarjanje virtualnega okolja

```bash
python -m venv venv
```

## 3. Aktiviranje virtualnega okolja

Windows:

```bash
venv\Scripts\activate
```

## 4. Namestitev knjižnic

```bash
pip install -r requirements.txt
```

## 5. Nastavitev `.env`

V backend mapi mora obstajati `.env` datoteka.

Primer:

```text
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.g0ntvzk.mongodb.net/
DATABASE_NAME=psi_up
```

## 6. Zagon backend aplikacije

```bash
uvicorn app.main:app --reload
```

Backend se zažene na naslovu:

```text
http://127.0.0.1:8000
```

Swagger dokumentacija je dostopna na:

```text
http://127.0.0.1:8000/docs
```

---

# API endpointi

Backend uporablja osnovni prefix:

```text
/api
```

Primer:

```text
/api/learning-units
/api/search?query=Excel
```

---

## Search

| Metoda | Endpoint | Namen |
|---|---|---|
| GET | `/search` | Iskanje po učnih poteh, modulih in učnih enotah |

Primer:

```text
/search?query=Excel
```

Primer:

```text
/search?query=Excel&types=module
```

---

## Učne poti

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

## Moduli

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

## Učne enote

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

## Vprašalniki

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

## Ocenjevanje

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

Primer response:

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

## Uporabniki

| Metoda | Endpoint | Namen |
|---|---|---|
| POST | `/users/profile` | Vrne ali ustvari uporabniški profil po zunanji prijavi |
| GET | `/users/by-auth/{auth_user_id}` | Pridobi uporabnika po zunanjem auth ID |
| GET | `/users/{user_id}` | Pridobi uporabnika po lokalnem ID |
| PUT | `/users/{user_id}` | Posodobi uporabniški profil |

Primer request body:

```json
{
  "auth_provider": "auth0",
  "auth_user_id": "auth0|test_001",
  "name": "Testni uporabnik Auth0",
  "email": "test.auth0@example.com"
}
```

---

## Napredek uporabnika

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

Primer za shranjevanje, priljubljene ali dokončane vsebine:

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

# Auth0 opomba

Registracija in prijava uporabnika se ne izvajata neposredno v backendu. Za to bo uporabljen zunanji auth sistem, na primer Auth0.

Predviden flow:

1. Uporabnik se prijavi ali registrira na frontendu prek Auth0.
2. Frontend pridobi Auth0 podatke oziroma token.
3. Frontend pokliče backend endpoint `/users/profile`.
4. Backend preveri, ali uporabnik že obstaja v lokalni bazi.
5. Če uporabnik ne obstaja, backend ustvari lokalni profil in začetni zapis `user_progress`.
6. Gesla ostanejo v Auth0 in se ne hranijo v naši bazi.

Trenutno je pripravljena lokalna povezava prek:

```text
auth_provider
auth_user_id
```

Prava Auth0 token validacija še ni implementirana.

---

# Testiranje backend-a

Backend se lahko testira na dva načina:

## 1. Swagger

Po zagonu backend-a odpri:

```text
http://127.0.0.1:8000/docs
```

Tam lahko testiraš vse API endpoint-e.

## 2. Postman

Za testiranje je pripravljena Postman kolekcija z API requesti.

V Postmanu so requesti organizirani po sklopih:

```text
Learning Units
Modules
Learning Paths
Search
Questionnaires
Assessments
Users
User Progress
Errors / Validation
```

Primeri testiranja:
- pridobivanje učnih enot,
- iskanje po vsebinah,
- pridobivanje vprašalnikov,
- assessment logika,
- shranjevanje/priljubljene/dokončane vsebine,
- trenutna pozicija uporabnika,
- validacija napačnih podatkov.

Primer error testa:

```json
{
  "user_id": "user_001",
  "content_id": "ue_999",
  "content_type": "learning_unit"
}
```

Pričakovano: backend vrne napako, ker učna enota `ue_999` ne obstaja.

---

# Trenutno stanje implementacije

Implementirano:

- osnovni API za učne enote,
- osnovni API za module,
- osnovni API za učne poti,
- search API,
- vprašalniki,
- assessment logika,
- user progress API,
- uporabniški profil,
- validacija za user progress,
- povezava z MongoDB.

Delno implementirano:

- povezava z zunanjim auth sistemom prek `auth_provider` in `auth_user_id`.

Še ni implementirano:

- prava Auth0 konfiguracija,
- preverjanje Auth0 tokena,
- zaščita endpointov glede na prijavljenega uporabnika,
- avtomatsko zapisovanje assessment rezultata v `user_progress`.

---