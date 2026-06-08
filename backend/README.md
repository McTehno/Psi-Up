# Backend — NIDiKo

Backend del aplikacije **NIDiKo** je zgrajen z uporabo **Python**, **FastAPI**, **Pydantic** in **MongoDB**.

Backend skrbi za poslovno logiko aplikacije, API endpoint-e, povezavo s podatkovno bazo, vprašalnike, ocenjevanje odgovorov, priporočila, uporabniški napredek, avtentikacijo in povezavo z zunanjimi storitvami.

---

## Kazalo

- [1. Namen backenda](#1-namen-backenda)
- [2. Tehnološki sklad](#2-tehnološki-sklad)
- [3. Struktura backend kode](#3-struktura-backend-kode)
- [4. Arhitektura backenda](#4-arhitektura-backenda)
- [5. Okoljske spremenljivke](#5-okoljske-spremenljivke)
- [6. Lokalni zagon](#6-lokalni-zagon)
- [7. API dokumentacija](#7-api-dokumentacija)
- [8. Testiranje](#8-testiranje)
- [9. Avtentikacija](#9-avtentikacija)
- [10. Podatki](#10-podatki)
- [11. Pravila za razvoj](#11-pravila-za-razvoj)
- [12. Povezani dokumenti](#12-povezani-dokumenti)

---

## 1. Namen backenda

Backend omogoča:

- pridobivanje učnih poti, modulov in učnih enot,
- generiranje vprašalnikov za učno pot, modul ali učno enoto,
- ocenjevanje odgovorov uporabnika,
- priporočanje ustreznega naslednjega koraka,
- shranjevanje uporabniškega napredka,
- označevanje shranjenih, priljubljenih in dokončanih vsebin,
- spremljanje trenutne pozicije uporabnika,
- iskanje po učnih vsebinah,
- povezavo s kontekstualnim AI pomočnikom,
- glasovno pomoč,
- preverjanje prijavljenega uporabnika prek JWT tokena.

---

## 2. Tehnološki sklad

| Tehnologija | Namen |
|---|---|
| Python | backend programski jezik |
| FastAPI | REST API endpointi |
| Pydantic | request/response validacija |
| MongoDB Atlas | podatkovna baza |
| Pytest | avtomatsko testiranje |
| Supabase Auth + JWT | avtentikacija uporabnikov |
| Docker | zagon backend okolja |
| Azure OpenAI | kontekstualni AI pomočnik |
| Microsoft Speech Service | glasovna pomoč |
| Azure Blob Storage | shranjevanje zvočnih oziroma povezanih datotek |

Podrobnejši opis tehnologij je zapisan v dokumentu:

- [Tehnološki sklad](../docs/02-tehnoloski-sklad.md)

---

## 3. Struktura backend kode

```text
backend/
├── app/
│   ├── api/                          # FastAPI endpointi po domenah
│   │   ├── learning_paths.py          # endpointi za učne poti
│   │   ├── modules.py                 # endpointi za module
│   │   ├── learning_units.py          # endpointi za učne enote
│   │   ├── questionnaires.py          # generiranje vprašalnikov
│   │   ├── assessments.py             # ocenjevanje odgovorov
│   │   ├── recommendations.py         # priporočila na podlagi odgovorov
│   │   ├── search.py                  # iskanje po vsebinah
│   │   ├── users.py                   # uporabniški profil
│   │   ├── user_progress.py           # napredek uporabnika
│   │   └── voice_help.py              # glasovna pomoč
│   │
│   ├── core/                         # skupna sistemska logika
│   │   ├── security.py                # JWT preverjanje in auth logika
│   │   └── error_handlers.py          # skupna obravnava napak
│   │
│   ├── database/
│   │   └── mongodb.py                 # povezava z MongoDB
│   │
│   ├── repositories/                 # dostop do podatkovne baze
│   │   ├── learning_path_repository.py
│   │   ├── module_repository.py
│   │   ├── learning_unit_repository.py
│   │   ├── user_repository.py
│   │   └── user_progress/             # repository logika za uporabniški napredek
│   │
│   ├── schemas/                      # Pydantic request/response modeli
│   │   ├── learning_path_schema.py
│   │   ├── module_schema.py
│   │   ├── learning_unit_schema.py
│   │   ├── questionnaire_schema.py
│   │   ├── assessment_schema.py
│   │   ├── user_schema.py
│   │   └── user_progress_schema.py
│   │
│   ├── services/                     # poslovna logika aplikacije
│   │   ├── learning_paths/
│   │   ├── modules/
│   │   ├── learning_units/
│   │   ├── questionnaires/
│   │   ├── assessments/
│   │   ├── recommendations/
│   │   ├── search/
│   │   ├── users/
│   │   ├── user_progress/
│   │   ├── validation/
│   │   └── voice_help/
│   │
│   ├── config.py                     # konfiguracija aplikacije
│   └── main.py                       # vstopna točka FastAPI aplikacije
│
├── data/                             # začetni in testni JSON podatki
├── tests/                            # avtomatski testi
│   ├── api/                          # testi endpointov
│   ├── data/                         # testi JSON podatkov
│   ├── repositories/                 # testi repository sloja
│   ├── schemas/                      # testi Pydantic shem
│   └── services/                     # testi service logike
│
├── .env.example                      # primer okoljskih spremenljivk
├── Dockerfile                        # Docker konfiguracija za backend
├── pytest.ini                        # konfiguracija za pytest
├── requirements.txt                  # Python odvisnosti
├── CONTRIBUTING.md                   # pravila za razvoj backenda
└── README.md                         # opis backend dela projekta
```

Podrobnejša pravila za razvoj backend kode so zapisana v dokumentu:

- [Backend Contribution Guide](CONTRIBUTING.md)

---

## 4. Arhitektura backenda

Backend uporablja plastno arhitekturo:

```text
API → Service → Repository → Database
```

Pomen slojev:

- `app/api` vsebuje FastAPI endpoint-e,
- `app/services` vsebuje poslovno logiko,
- `app/repositories` vsebuje dostop do MongoDB,
- `app/schemas` vsebuje Pydantic modele,
- `app/core` vsebuje varnostno in skupno backend logiko,
- `app/database` vsebuje povezavo s podatkovno bazo.

Glavno pravilo:

```text
API sprejme request in vrne response.
Service izvaja poslovno logiko.
Repository komunicira s podatkovno bazo.
Schema določa obliko podatkov.
```

Podrobnejša arhitektura sistema je opisana v dokumentu:

- [Arhitektura sistema](../docs/03-arhitektura.md)

---

## 5. Okoljske spremenljivke

Backend uporablja okoljske spremenljivke iz datoteke:

```text
backend/.env
```

V repozitoriju je samo primer datoteke:

```text
backend/.env.example
```
---

## 6. Lokalni zagon

Backend se lahko zažene skupaj s celotnim projektom prek Docker Compose ali ročno kot samostojna FastAPI aplikacija.

Priporočen način za razvoj je zagon celotnega projekta prek Dockerja iz korenske mape repozitorija.

Podrobna navodila za:

- pripravo `.env` datotek,
- zagon z Dockerjem,
- ročni zagon frontenda in backenda,
- dostop do lokalnih URL-jev,
- reševanje pogostih težav

so zapisana v dokumentu:

- [Vzpostavitev razvojnega okolja](../docs/04-vzpostavitev-razvojnega-okolja.md)

---

## 7. API dokumentacija

FastAPI samodejno generira dokumentacijo endpointov.

Pri lokalnem zagonu je dostopna na:

```text
http://localhost:8000/docs
```

Glavne skupine endpointov vključujejo:

- učne poti,
- module,
- učne enote,
- vprašalnike,
- ocenjevanje odgovorov,
- priporočila,
- iskanje,
- uporabnike,
- uporabniški napredek,
- AI pomočnika,
- glasovno pomoč.

Podrobnejši pregled API endpointov je zapisan v dokumentu:

- [API endpointi](../docs/06-api-endpointi.md)

---

## 8. Testiranje

Backend uporablja `pytest`.

Teste zaženemo iz mape `backend`:

```powershell
pytest
```

Za zagon posameznega sklopa testov:

```powershell
pytest tests/api
pytest tests/services
pytest tests/repositories
pytest tests/schemas
pytest tests/data
```

Pri dodajanju nove backend logike najprej napišemo ali posodobimo test, nato implementiramo spremembo.

Podrobnejša pravila testiranja so zapisana v dokumentu:

- [Testiranje](../docs/12-testiranje.md)

---

## 9. Avtentikacija

Aplikacija uporablja **Supabase Auth** za prijavo uporabnikov.

Frontend pridobi JWT token iz Supabase Auth in ga pri zaščitenih zahtevah pošlje backendu. Backend token preveri in iz njega pridobi zunanji `auth_user_id`, ki se poveže z lokalnim uporabniškim profilom v MongoDB.

To pomeni, da backend loči:

```text
Supabase auth_user_id  → zunanji auth uporabnik
MongoDB user_id        → lokalni uporabnik aplikacije
```

Več o tej arhitekturni odločitvi je zapisano v dokumentu:

- [ADR-010: Uporaba Supabase Auth](../docs/adr/ADR-010-uporaba-supabase-auth-za-avtentikacijo.md)

---

## 10. Podatki

Začetni in testni podatki so shranjeni v mapi:

```text
backend/data/
```

Podatki vključujejo strukture za:

- učne poti,
- module,
- učne enote,
- uporabnike,
- uporabniški napredek.

Pri spremembah podatkovnega modela je treba preveriti tudi:

- Pydantic sheme,
- repository logiko,
- service logiko,
- teste,
- dokumentacijo podatkovnega modela.

Podrobnejši opis podatkovnega modela je zapisan v dokumentu:

- [Podatkovni model](../docs/05-podatkovni-model.md)

---

## 11. Pravila za razvoj

Pri backend razvoju upoštevamo:

- ne podvajamo obstoječe logike,
- poslovna logika spada v `app/services`,
- dostop do podatkovne baze spada v `app/repositories`,
- request/response modeli spadajo v `app/schemas`,
- API endpointi naj ne vsebujejo kompleksne poslovne logike,
- pred implementacijo nove logike najprej napišemo ali posodobimo test,
- komentarje v backend kodi pišemo v slovenščini,
- `.env` datotek ne commitamo.

Podrobna pravila so zapisana v:

- [Backend Contribution Guide](CONTRIBUTING.md)
- [Pravila poimenovanja in pisanja kode](../docs/10-pravila-poimenovanja-in-pisanje-kode.md)

---

## 12. Povezani dokumenti

- [Krovni README](../README.md)
- [Arhitektura sistema](../docs/03-arhitektura.md)
- [Tehnološki sklad](../docs/02-tehnoloski-sklad.md)
- [Vzpostavitev razvojnega okolja](../docs/04-vzpostavitev-razvojnega-okolja.md)
- [Podatkovni model](../docs/05-podatkovni-model.md)
- [API endpointi](../docs/06-api-endpointi.md)
- [Testiranje](../docs/12-testiranje.md)
- [Backend Contribution Guide](CONTRIBUTING.md)
