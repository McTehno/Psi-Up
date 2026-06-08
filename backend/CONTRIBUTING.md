# Backend Contribution Guide — NIDiKo

Ta dokument določa pravila za razvoj backend dela projekta **NIDiKo**.

Namen dokumenta je, da lahko vsi člani ekipe in tudi LLM orodja delajo konsistentno, brez podvajanja kode, brez nepotrebnih merge konfliktov in brez spreminjanja obstoječe backend logike brez dogovora.

Projekt uporablja:

- Python
- FastAPI
- Pydantic
- MongoDB
- Pytest
- Supabase JWT avtentikacijo

---

## Kazalo

- [1. Glavno pravilo](#1-glavno-pravilo)
- [2. Trenutna glavna backend struktura](#2-trenutna-glavna-backend-struktura)
- [3. Pomen glavnih map](#3-pomen-glavnih-map)
- [4. Pravila po slojih](#4-pravila-po-slojih)
- [5. Test-first pravilo](#5-test-first-pravilo)
- [6. API pravila](#6-api-pravila)
- [7. Service pravila](#7-service-pravila)
- [8. Repository pravila](#8-repository-pravila)
- [9. Schema pravila](#9-schema-pravila)
- [10. User progress pravila](#10-user-progress-pravila)
- [11. Assistant funkcionalnosti](#11-assistant-funkcionalnosti)
- [12. Vprašalniki in ocenjevanje](#12-vprašalniki-in-ocenjevanje)
- [13. Testiranje](#13-testiranje)
- [14. Varnost in okoljske spremenljivke](#14-varnost-in-okoljske-spremenljivke)
- [15. Pravila poimenovanja in pisanja kode](#15-pravila-poimenovanja-in-pisanja-kode)
- [16. Pravila za LLM uporabo](#16-pravila-za-llm-uporabo)
- [17. LLM prompt template](#17-llm-prompt-template)
- [18. Checklist pred commitom](#18-checklist-pred-commitom)
- [19. Commit message pravila](#19-commit-message-pravila)
- [20. Najpomembnejši princip](#20-najpomembnejši-princip)

---

## 1. Glavno pravilo

Preden dodaš novo backend kodo, preveri, ali podobna logika že obstaja.

Ne podvajaj:

- API endpointov
- service logike
- repository metod
- Pydantic shem
- validacijske logike
- assistant promptov
- testnih helperjev
- MongoDB query logike

Če nekaj že obstaja, najprej razmisli, ali lahko obstoječo logiko uporabiš ali razširiš.

Preden implementiraš novo logiko, najprej napiši ali posodobi test.

---

## 2. Trenutna glavna backend struktura

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── database/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   ├── config.py
│   └── main.py
├── data/
├── tests/
├── Dockerfile
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## 3. Pomen glavnih map

### `app/api/`

Vsebuje FastAPI endpoint-e.

Primeri:

```text
app/api/learning_paths.py
app/api/modules.py
app/api/learning_units.py
app/api/questionnaires.py
app/api/assessments.py
app/api/user_progress.py
app/api/search.py
```

Pravila:

- API sloj sprejme request.
- API sloj pokliče service.
- API sloj vrne response.
- API sloj obravnava HTTP napake.
- API sloj ne vsebuje glavne poslovne logike.
- API sloj ne dostopa neposredno do MongoDB.

---

### `app/services/`

Vsebuje poslovno logiko aplikacije.

Primeri:

```text
app/services/learning_paths/
app/services/modules/
app/services/learning_units/
app/services/questionnaires/
app/services/assessments/
app/services/user_progress/
app/services/search/
```

Pravila:

- Service sloj vsebuje glavno logiko.
- Service sloj povezuje več repository razredov, kadar je potrebno.
- Service sloj pripravlja podatke za API response.
- Service sloj naj ne vsebuje FastAPI router logike.
- Service sloj naj ne uporablja `APIRouter`.
- Service sloj naj ne dostopa neposredno do MongoDB, če za to obstaja repository.

---

### `app/repositories/`

Vsebuje dostop do MongoDB.

Primeri:

```text
app/repositories/learning_path_repository.py
app/repositories/module_repository.py
app/repositories/learning_unit_repository.py
app/repositories/user_repository.py
app/repositories/user_progress/
```

Pravila:

- Repository sloj bere iz baze.
- Repository sloj piše v bazo.
- Repository sloj pripravlja MongoDB query-je.
- Repository sloj ne vsebuje HTTP logike.
- Repository sloj ne vsebuje UI ali frontend logike.
- Repository sloj ne odloča o uporabniškem toku aplikacije.

---

### `app/schemas/`

Vsebuje Pydantic modele.

Primeri:

```text
app/schemas/learning_path_schema.py
app/schemas/module_schema.py
app/schemas/learning_unit_schema.py
app/schemas/questionnaire_schema.py
app/schemas/assessment_schema.py
app/schemas/user_progress_schema.py
```

Pravila:

- Sheme določajo request in response strukturo.
- Sheme validirajo vhodne in izhodne podatke.
- Sheme ne vsebujejo poslovne logike.
- Če se spremeni backend response, preveri tudi frontend tipe.

---

### `app/core/`

Vsebuje skupno backend logiko.

Primeri:

```text
app/core/security.py
app/core/error_handlers.py
```

Sem spadajo:

- avtentikacija
- varnostna logika
- skupna obravnava napak

---

### `app/database/`

Vsebuje povezavo s podatkovno bazo.

Primer:

```text
app/database/mongodb.py
```

Pravila:

- Tu je skupna infrastruktura za MongoDB.
- Ne dodajamo domen-specific poslovne logike.

---

### `tests/`

Vsebuje avtomatske teste.

Trenutna struktura:

```text
tests/
├── api/
├── data/
├── repositories/
├── schemas/
└── services/
```

Pravila:

- Testi naj sledijo sloju, ki ga preverjajo.
- Nova logika mora imeti ustrezen test.
- Če najdeš bug, najprej dodaj test, ki bug pokaže.

---

## 4. Pravila po slojih

Backend uporablja slojno arhitekturo:

```text
API → Service → Repository → Database
```

Osnovna odgovornost slojev:

```text
API sprejme request in vrne response.
Service vsebuje poslovno logiko.
Repository dostopa do MongoDB.
Schema definira obliko podatkov.
Tests preverjajo pravilnost delovanja.
```

Pravila:

- API ne sme neposredno dostopati do MongoDB.
- API naj ne vsebuje kompleksne poslovne logike.
- Service naj ne vsebuje router logike.
- Repository naj ne vsebuje HTTP logike.
- Schema naj ne vsebuje poslovne logike.
- Testi naj preverjajo obnašanje posameznega sloja.

---

## 5. Test-first pravilo

Pri backend logiki uporabljamo pristop **test-first**.

To pomeni:

1. najprej preverimo obstoječo logiko,
2. napišemo ali posodobimo test,
3. poženemo test in preverimo, da pokaže manjkajoče ali napačno delovanje,
4. šele nato implementiramo logiko,
5. ponovno poženemo teste.

Pravilo velja za:

- nove endpoint-e,
- novo service logiko,
- nove repository metode,
- popravke bugov,
- spremembe assessment ali questionnaire logike,
- spremembe user progress logike,
- spremembe validacijske logike.

Če test-first pristop pri manjši spremembi ni smiseln, mora biti to jasno in sprememba mora biti vseeno ročno preverjena.

---

## 6. API pravila

API endpointi so v `app/api`.

Pravila:

- Vsaka domena ima svojo API datoteko.
- Endpoint naj uporablja ustrezen `response_model`, kjer je mogoče.
- Endpoint naj kliče service funkcijo ali service razred.
- Endpoint lahko obravnava osnovne HTTP napake.
- Endpoint naj ne pripravlja kompleksnih podatkovnih struktur.
- Endpoint naj ne vsebuje MongoDB query-jev.

Primer dobre odgovornosti API sloja:

```python
if not module:
    raise HTTPException(status_code=404, detail="Modul ni najden.")
```

Če endpoint postaja predolg, je to znak, da logika verjetno spada v service sloj.

---

## 7. Service pravila

Service sloj je glavno mesto za poslovno logiko.

V service sloj spada:

- generiranje vprašalnikov,
- ocenjevanje odgovorov,
- priporočanje vsebin,
- preverjanje dostopnosti vsebin,
- validacija poslovnih pravil,
- priprava detail podatkov,
- povezovanje več repository razredov.

Pravila:

- Service naj bo čim bolj ločen od FastAPI podrobnosti.
- Service naj ne vrača HTTP response objektov.
- Service naj ne uporablja `APIRouter`.
- Service naj ne podvaja repository query logike.
- Če se ista logika uporablja na več mestih, jo premakni v skupno service metodo.

---

## 8. Repository pravila

Repository sloj je namenjen delu z MongoDB.

V repository sloj spada:

- `find`
- `find_one`
- `insert_one`
- `update_one`
- `delete_one`
- priprava MongoDB filtrov
- pretvorba MongoDB dokumentov v obliko, ki jo potrebuje service

Pravila:

- Repository ne vrača HTTP napak.
- Repository ne odloča o uporabniških dovoljenjih.
- Repository ne vsebuje UI logike.
- Repository metode naj bodo poimenovane po tem, kaj naredijo.
- Če se MongoDB query ponovi na več mestih, ga premakni v repository metodo.

---

## 9. Schema pravila

Pydantic sheme so v `app/schemas`.

Pravila:

- Request modeli naj se končajo z `Request`.
- Response modeli naj se končajo z `Response`.
- Sheme naj imajo jasne tipe.
- Enum uporabimo tam, kjer je nabor vrednosti omejen.
- Sheme naj ne vsebujejo poslovne logike.
- Če se spremeni shema, preveri API teste in frontend tipe.

Primer:

```python
class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None = None
```

---

## 10. User progress pravila

`user_progress` je občutljiv del aplikacije, ker je vezan na prijavljenega uporabnika.

Sem spadajo:

- shranjene vsebine,
- priljubljene vsebine,
- dokončane vsebine,
- trenutna pozicija uporabnika,
- odgovori na vprašalnike.

Povezane mape:

```text
app/api/user_progress.py
app/services/user_progress/
app/repositories/user_progress/
app/schemas/user_progress_schema.py
```

Pravila:

- Uporabnik lahko dostopa samo do svojega napredka.
- Za zaščitene akcije se uporablja JWT avtentikacija.
- Lokalni `user_id` se pridobi na podlagi zunanjega auth uporabnika.
- Pred shranjevanjem, odstranjevanjem ali dokončanjem vsebine preverimo, ali vsebina obstaja.
- Validacija vsebin spada v validation service.
- API endpoint ne sme sam izvajati kompleksne validacije.
- Pri spremembah user progress logike je treba posodobiti teste.

---

## 11. Assistant funkcionalnosti

Backend vsebuje več assistant funkcionalnosti:

```text
assessment_assistant
learning_path_assistant
module_assistant
learning_unit_assistant
voice_help
```

Pravila:

- API endpoint je v `app/api`.
- Request in response modeli so v `app/schemas`.
- Glavna logika je v `app/services`.
- Prompti so ločeni v `*_prompt.py`.
- Prompti se ne pišejo neposredno v API endpointih.
- Service uporablja prompt datoteko, ne obratno.
- Prompt ne sme vsebovati skrivnosti, tokenov ali connection stringov.
- Prompt mora jasno določiti, da assistant ne sme izmišljati podatkov, ki niso v poslanem kontekstu.

Primer strukture:

```text
app/services/module_assistant/
├── module_assistant_prompt.py
├── module_assistant_service.py
└── __init__.py
```

---

## 12. Vprašalniki in ocenjevanje

Vprašalniki so povezani z več tipi vsebin:

- learning path,
- module,
- learning unit.

Pri delu z vprašalniki uporabljamo `QuestionnaireTargetType`.

Povezane datoteke:

```text
app/api/questionnaires.py
app/api/assessments.py
app/services/questionnaires/questionnaire_service.py
app/services/assessments/assessment_service.py
app/schemas/questionnaire_schema.py
app/schemas/assessment_schema.py
```

Pravila:

- Generiranje vprašalnika spada v `questionnaire_service.py`.
- Ocenjevanje odgovorov spada v `assessment_service.py`.
- API endpoint naj samo pokliče ustrezen service in vrne rezultat.
- Pri spremembah preveri tudi assessment in questionnaire teste.
- Pri spremembah response strukture preveri vpliv na frontend.

---

## 13. Testiranje

Backend uporablja `pytest`.

Podrobnejša pravila testiranja, organizacija testov in priporočila za pisanje testov so zapisana v dokumentu:

Teste zaženemo iz mape `backend`.

[Dokumentacija testiranja](../docs/12-testiranje.md)


```powershell
cd backend
pytest
```

Posamezen testni sklop:

```powershell
pytest tests/api
pytest tests/services
pytest tests/repositories
pytest tests/schemas
pytest tests/data
```

Primer posamezne testne datoteke:

```powershell
pytest tests/services/test_questionnaire_service.py
```

Pravila:

- Pred commitom zaženi relevantne teste.
- Pred večjim commitom zaženi vse teste.
- Če spremeniš API endpoint, preveri API teste.
- Če spremeniš service logiko, preveri service teste.
- Če spremeniš repository metodo, preveri repository teste.
- Če spremeniš shemo, preveri schema teste.

---

## 14. Varnost in okoljske spremenljivke

Dejanske okoljske spremenljivke so v datoteki `.env`.

Ta datoteka se ne commita v repozitorij.

V repozitoriju je dovoljena samo:

```text
.env.example
```

Pravila:

- Ne commitaj `.env`.
- Ne zapisuj skrivnosti v kodo.
- Ne zapisuj produkcijskih connection stringov v dokumentacijo.
- Ne zapisuj JWT skrivnosti v testne datoteke.
- `.env.example` naj vsebuje samo imena spremenljivk, ne dejanskih vrednosti.

Primer:

```env
MONGODB_URI=
DATABASE_NAME=
SUPABASE_JWT_SECRET=
```

---

## 15. Pravila poimenovanja in pisanja kode

Podrobna pravila poimenovanja in pisanja kode so zapisana v dokumentu:

```text
docs/10-pravila-poimenovanja-in-pisanje-kode.md
```

Backend naj sledi temu dokumentu.

V backend delu posebej pazimo na:

- `snake_case` za Python datoteke, funkcije in spremenljivke,
- `PascalCase` za razrede,
- končnice `_service.py` za service datoteke,
- končnice `_repository.py` za repository datoteke,
- končnice `_schema.py` za schema datoteke,

Komentarje v kodi pišemo v slovenščini.

Komentarji naj pojasnijo pomembno odločitev ali manj očitno logiko. Ne pišemo komentarjev, ki samo ponovijo ime funkcije.

---

## 16. Pravila za LLM uporabo

Če uporabljaš LLM orodje za pomoč pri backend razvoju, mu vedno prilepi ta dokument ali relevantne dele tega dokumenta.

LLM mora upoštevati:

- ne podvajaj obstoječe kode,
- najprej preveri obstoječe datoteke,
- pred novo implementacijo najprej predlagaj ali napiši test,
- poslovna logika spada v `app/services`,
- MongoDB dostop spada v `app/repositories`,
- request/response modeli spadajo v `app/schemas`,
- API endpointi spadajo v `app/api`,
- ne spreminjaj obstoječih endpointov brez zahteve,
- ne spreminjaj response struktur brez opozorila,
- ne spreminjaj auth logike brez dogovora,
- ne zapisuj skrivnosti v kodo,
- komentarje v kodi piši v slovenščini,
- predlagaj minimalne spremembe, ki ne povzročajo nepotrebnih konfliktov.

---

## 17. LLM prompt template

Pri uporabi LLM orodij za pomoč pri backend razvoju uporabljamo enotno strukturo prompta.

Namen tega je, da AI vedno razume:

- arhitekturo projekta,
- pravila po slojih,
- test-first pristop,
- da ne sme podvajati obstoječe kode,
- da ne sme spreminjati obstoječe logike brez zahteve,
- katere datoteke naj najprej preveri,
- da mora predlagati minimalne in preverljive spremembe.

Uporabljamo spodnji prompt in spreminjamo samo del **Naloga**.

```text
Delamo na backend projektu NIDiKo.

Backend uporablja Python, FastAPI, Pydantic, MongoDB in Pytest.
Frontend uporablja React in TypeScript, zato mora backend ohranjati stabilne request/response strukture.

Upoštevaj backend CONTRIBUTING.md pravila:
- ne podvajaj obstoječe kode
- pred novo implementacijo najprej preveri obstoječe api/services/repositories/schemas/tests
- nova poslovna logika spada v app/services
- API endpointi v app/api naj samo sprejmejo request, pokličejo service in vrnejo response
- dostop do MongoDB mora biti v app/repositories
- request/response modeli morajo biti v app/schemas
- pred implementacijo nove logike najprej predlagaj ali napiši test
- če popravljamo bug, najprej dodaj test, ki pokaže napako
- za teste uporabljamo pytest
- ne spreminjaj obstoječih endpointov, response struktur ali auth logike brez jasne zahteve
- ne zapisuj skrivnosti, tokenov, connection stringov ali .env vrednosti v kodo
- komentarje v kodi pišemo v slovenščini
- pravila poimenovanja in pisanja kode so v docs/10-pravila-poimenovanja-in-pisanje-kode.md

Arhitektura:
- app/api vsebuje FastAPI endpoint-e
- app/services vsebuje poslovno logiko
- app/repositories vsebuje dostop do MongoDB
- app/schemas vsebuje Pydantic modele
- app/core vsebuje varnost, avtentikacijo in skupno backend logiko
- app/database vsebuje povezavo z MongoDB
- tests vsebuje teste po slojih: api, services, repositories, schemas, data

Preden napišeš kodo:
1. povej katere obstoječe datoteke je treba preveriti
2. povej katere datoteke boš spremenil ali dodal
3. povej ali obstaja tveganje za konflikt
4. povej ali sprememba vpliva na frontend request/response strukturo
5. povej katere teste je treba dodati ali posodobiti
6. najprej predlagaj implementacijski pristop, potem šele kodo

Naloga:
[OPIŠI NALOGO]
```

Ta prompt uporabljamo kot začetni dogovor pred pisanjem backend kode z AI. S tem zmanjšamo možnost, da AI spremeni napačen sloj, podvoji obstoječo logiko ali preskoči teste.

---

## 18. Checklist pred commitom

Pred vsakim commitom preveri:

```powershell
cd backend
pytest
```

Potem preveri:

```powershell
git status
```

Checklist:

- Testi uspejo ali so ročno preverjeni relevantni testi.
- Nova logika ima test.
- API endpoint ne vsebuje poslovne logike.
- Service sloj vsebuje glavno logiko.
- Repository sloj vsebuje samo dostop do podatkov.
- Pydantic sheme so posodobljene, če se je spremenila struktura podatkov.
- Response struktura ni spremenjena brez preverjanja frontenda.
- `.env` ni dodan v commit.
- V kodi ni skrivnosti, tokenov ali connection stringov.
- Komentarji v kodi so napisani v slovenščini.
- Sprememba je majhna in preverljiva.

---

## 19. Commit message pravila

Commit message naj bo kratek in jasen.

Primeri:

```bash
git commit -m "Dodani testi za logiko uporabniskega napredka"
```

```bash
git commit -m "Popravljena validacija dokoncanih vsebin"
```

```bash
git commit -m "Dodana backend pravila za assistant prompte"
```

```bash
git commit -m "Posodobljena assessment service logika"
```

```bash
git commit -m "Dodana dokumentacija za backend prispevke"
```

---

## 20. Najpomembnejši princip

Če sprememba ni nujno potrebna, naj bo majhna.

Najprej ohrani delovanje, potem izboljšaj strukturo.

Backend sprememba mora biti:

- majhna,
- preverljiva,
- testirana,
- brez podvajanja kode,
- brez nepotrebnih sprememb response strukture,
- usklajena z obstoječo arhitekturo.

Če nisi prepričan/a, najprej preveri obstoječo kodo in se dogovori z ekipo.
