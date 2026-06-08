# Pravila poimenovanja in pisanja kode

Ta dokument določa skupna pravila za poimenovanje in pisanje kode v projektu **NIDiKo**.
Namen dokumenta je, da frontend in backend del uporabljata enoten, razumljiv in dosleden slog. 

---

## Kazalo

- [1. Namen dokumenta](#1-namen-dokumenta)
- [2. Splošna pravila](#2-splošna-pravila)
- [3. Pravila za frontend](#3-pravila-za-frontend)
  - [3.1 Frontend mape](#31-frontend-mape)
  - [3.2 Frontend datoteke](#32-frontend-datoteke)
  - [3.3 React komponente](#33-react-komponente)
  - [3.4 Funkcije in spremenljivke](#34-funkcije-in-spremenljivke)
  - [3.5 Services](#35-services)
  - [3.6 Types](#36-types)
  - [3.7 CSS in Tailwind](#37-css-in-tailwind)
  - [3.8 Frontend komentarji](#38-frontend-komentarji)
- [4. Pravila za backend](#4-pravila-za-backend)
  - [4.1 Backend mape](#41-backend-mape)
  - [4.2 Backend datoteke](#42-backend-datoteke)
  - [4.3 Razredi](#43-razredi)
  - [4.4 Funkcije in spremenljivke](#44-funkcije-in-spremenljivke)
  - [4.5 API datoteke](#45-api-datoteke)
  - [4.6 Service datoteke](#46-service-datoteke)
  - [4.7 Repository datoteke](#47-repository-datoteke)
  - [4.8 Schema datoteke](#48-schema-datoteke)
  - [4.9 Backend komentarji in docstringi](#49-backend-komentarji-in-docstringi)
- [5. Pravila za dokumentacijo](#5-pravila-za-dokumentacijo)
- [6. Primeri dobrega in slabega poimenovanja](#6-primeri-dobrega-in-slabega-poimenovanja)
- [7. Povezani dokumenti](#7-povezani-dokumenti)

---

## 1. Namen dokumenta

Ta dokument določa osnovna pravila za pisanje in poimenovanje kode v projektu **NIDiKo**.

Uporablja se za:

- poimenovanje map,
- poimenovanje datotek,
- poimenovanje komponent,
- poimenovanje razredov,
- poimenovanje funkcij,
- poimenovanje spremenljivk,
- pisanje komentarjev,
- pisanje dokumentacije.

Za podrobnejša pravila razvoja pogledaj tudi:

- [Frontend Contribution Guide](../frontend/CONTRIBUTING.md)
- [Backend Contribution Guide](../backend/CONTRIBUTING.md)

---

## 2. Splošna pravila

V kodi uporabljamo angleška imena.

Dokumentacija je lahko napisana v slovenščini.

Pravila:

- imena naj bodo jasna in razumljiva,
- imena naj opisujejo namen,
- ne uporabljamo nepotrebnih okrajšav,
- za isti pojem vedno uporabljamo isti izraz,
- ne mešamo slovenskih in angleških imen v kodi,
- imena naj sledijo domeni projekta.

Pravilno:

```text
learning_path
learning_unit
questionnaire
assessment
user_progress
```

Napačno:

```text
ucna_pot
enota
vprasalnikData
progressPodatki
```

Dovoljena izjema so besedila, ki jih vidi uporabnik, na primer UI labeli, opisi, napake in dokumentacija.

---

## 3. Pravila za frontend

Za podrobnejša frontend pravila glej:

[Frontend Contribution Guide](../frontend/CONTRIBUTING.md)

Frontend uporablja:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

---

### 3.1 Frontend mape

Route-level strani so v:

```text
src/pages/
```

Feature-specific koda je v:

```text
src/features/
```

Reusable komponente so v:

```text
src/components/
```

API klici so v:

```text
src/services/
```

Backend request/response tipi so v:

```text
src/types/
```

Feature mape pišemo v `kebab-case`.

Primeri:

```text
learning-paths
learning-units
questionnaire
search
assistant
```

Page mape pišemo v `PascalCase`.

Primeri:

```text
HomePage
SearchPage
QuestionnairePage
LearningPathDetailPage
ModuleDetailPage
LearningUnitDetailPage
```

---

### 3.2 Frontend datoteke

React page datoteke pišemo v `PascalCase`.

Primer:

```text
HomePage.tsx
SearchPage.tsx
QuestionnairePage.tsx
LearningUnitDetailPage.tsx
```

Večje reusable komponente imajo svojo mapo in `index.ts`.

Primer:

```text
DetailHero/
├── DetailHero.tsx
└── index.ts
```

Pomožne TypeScript datoteke pišemo v `kebab-case`.

Primer:

```text
api-client.ts
search-service.ts
learning-path-service.ts
user-progress-service.ts
```

Vsaka page mapa naj ima `index.ts`.

Primer:

```ts
export { default } from './HomePage'
```

---

### 3.3 React komponente

React komponente pišemo v `PascalCase`.

Pravilno:

```tsx
LearningUnitCard
QuestionnaireForm
DetailHero
AssistantChat
```

Napačno:

```tsx
learningUnitCard
questionnaire_form
detailhero
assistant-chat
```

Komponente naj imajo jasen namen.

Če je komponenta reusable, spada v:

```text
src/components/
```

Če je vezana samo na en feature, spada v:

```text
src/features/<feature-name>/components/
```

---

### 3.4 Funkcije in spremenljivke

V TypeScript/React uporabljamo `camelCase`.

Primeri:

```ts
selectedLearningPath
currentQuestion
isLoading
hasError
getLearningUnitDetail()
submitQuestionnaire()
```

Boolean spremenljivke naj se začnejo z izrazom, ki jasno kaže, da gre za stanje.

Primeri:

```ts
isLoading
isCompleted
hasError
canContinue
shouldShowResults
```

Napačno:

```ts
loadingStatusThing
flag
data2
resultFinalMaybe
```

---

### 3.5 Services

Frontend API klici so v:

```text
src/services/
```

Service datoteke pišemo v `kebab-case` in jih končamo z `-service.ts`.

Primeri:

```text
learning-path-service.ts
learning-unit-service.ts
questionnaire-service.ts
assessment-service.ts
user-progress-service.ts
```

Funkcije v services naj jasno povedo, kateri API klic izvajajo.

Primeri:

```ts
getLearningPathDetail()
getModuleQuestionnaire()
submitAssessmentAnswers()
saveUserProgress()
```

Komponente ne smejo direktno klicati `fetch`, če za to obstaja service funkcija.

---

### 3.6 Types

Backend request/response tipi so v:

```text
src/types/
```

Type datoteke pišemo v `kebab-case`.

Primeri:

```text
learning-path.ts
learning-unit.ts
user-progress.ts
questionnaire.ts
assessment.ts
```

Type in interface imena pišemo v `PascalCase`.

Primeri:

```ts
LearningPathResponse
LearningUnitResponse
QuestionnaireResponse
AssessmentResultResponse
UserProgressResponse
```

Ne definiramo istega tipa na več mestih.

Če backend spremeni response strukturo, je treba preveriti tudi ustrezne tipe na frontendu.

---

### 3.7 CSS in Tailwind

Projekt uporablja Tailwind CSS.

Uporabljamo obstoječe barvne skupine:

```text
sand
brown
forest
terracotta
```

Pravila:

- ne uvajamo naključnih novih barv brez dogovora,
- ne podvajamo obstoječih style rešitev,
- reusable komponente naj uporabljajo konsistentne className vzorce,
- ne spreminjamo obstoječega izgleda strani, če je cilj samo refactor strukture.

CSS datoteke, kjer obstajajo, naj bodo poimenovane enako kot komponenta ali stran.

Primer:

```text
QuestionnairePage.css
```

---

### 3.8 Frontend komentarji

Komentarji naj se uporabljajo samo takrat, ko pojasnijo pomembno odločitev ali manj očitno logiko.

Ne dodajamo komentarjev, ki samo ponovijo, kaj koda očitno dela.

Dobro:

```ts
// Gostujoč uporabnik dobi začasni ID, da lahko rezultat vprašalnika ostane vezan na trenutno sejo.
```

Slabo:

```ts
// Nastavi loading na true
setIsLoading(true)
```

---

## 4. Pravila za backend

Za podrobnejša backend pravila glej:

[Backend Contribution Guide](../backend/CONTRIBUTING.md)

Backend uporablja:

- Python
- FastAPI
- Pydantic
- MongoDB
- Pytest

---

### 4.1 Backend mape

Backend koda je v:

```text
backend/app/
```

Glavne mape:

```text
app/api/
app/services/
app/repositories/
app/schemas/
app/core/
app/database/
```

Pravila:

- `app/api` vsebuje FastAPI endpoint-e,
- `app/services` vsebuje poslovno logiko,
- `app/repositories` vsebuje dostop do MongoDB,
- `app/schemas` vsebuje Pydantic modele,
- `app/core` vsebuje skupno varnostno in sistemsko logiko,
- `app/database` vsebuje povezavo z bazo.

Mape pišemo z malimi črkami.

Če je ime sestavljeno iz več besed, v Python backend delu uporabljamo `snake_case`.

Primeri:

```text
user_progress
learning_paths
learning_units
assessment_assistant
```

---

### 4.2 Backend datoteke

Python datoteke pišemo v `snake_case`.

Primeri:

```text
learning_path_service.py
learning_unit_repository.py
user_progress_schema.py
assessment_assistant_prompt.py
```

Napačno:

```text
LearningPathService.py
learning-path-service.py
userProgressSchema.py
```

Datoteka naj že z imenom pove, kateremu sloju pripada.

Primeri:

```text
module_service.py
module_repository.py
module_schema.py
module_assistant_prompt.py
```

---

### 4.3 Razredi

Python razrede pišemo v `PascalCase`.

Primeri:

```python
LearningPathService
LearningUnitRepository
UserProgressService
QuestionnaireResponse
AssessmentResultResponse
```

Razred naj ima ime, ki jasno kaže njegovo odgovornost.

Pravilno:

```python
class LearningPathService:
    ...
```

Napačno:

```python
class Manager:
    ...
```

---

### 4.4 Funkcije in spremenljivke

Python funkcije in spremenljivke pišemo v `snake_case`.

Primeri:

```python
get_learning_path_by_id
get_user_progress
completed_learning_unit_ids
current_module_id
```

Boolean spremenljivke naj jasno kažejo pomen.

Primeri:

```python
is_completed
has_access
should_update_progress
```

Napačno:

```python
flag
data2
checkThing
```

---

### 4.5 API datoteke

API datoteke so v:

```text
app/api/
```

Poimenovane so po domeni.

Primeri:

```text
learning_paths.py
modules.py
learning_units.py
questionnaires.py
assessments.py
user_progress.py
search.py
```

Pravila:

- API datoteka naj vsebuje endpoint-e za eno domeno,
- ime naj bo jasno povezano z URL področjem,
- v API datoteki ne pišemo glavne poslovne logike,
- API datoteka naj kliče ustrezen service.

---

### 4.6 Service datoteke

Service datoteke se končajo z:

```text
_service.py
```

Primeri:

```text
learning_path_service.py
module_service.py
learning_unit_service.py
questionnaire_service.py
assessment_service.py
user_progress_service.py
```

Service razredi se pišejo v `PascalCase`.

Primeri:

```python
LearningPathService
ModuleService
LearningUnitService
QuestionnaireService
AssessmentService
UserProgressService
```

Service funkcije in metode naj jasno povedo, kaj naredijo.

Primeri:

```python
get_learning_path_detail
generate_questionnaire
evaluate_answers
update_current_position
```

---

### 4.7 Repository datoteke

Repository datoteke se končajo z:

```text
_repository.py
```

Primeri:

```text
learning_path_repository.py
module_repository.py
learning_unit_repository.py
user_repository.py
user_progress_repository.py
```

Repository razredi se pišejo v `PascalCase`.

Primeri:

```python
LearningPathRepository
ModuleRepository
LearningUnitRepository
UserRepository
UserProgressRepository
```

Repository metode naj opisujejo dostop do podatkov.

Primeri:

```python
get_by_id
get_all
create
update_by_id
delete_by_id
```

---

### 4.8 Schema datoteke

Schema datoteke se končajo z:

```text
_schema.py
```

Primeri:

```text
learning_path_schema.py
module_schema.py
learning_unit_schema.py
questionnaire_schema.py
assessment_schema.py
user_progress_schema.py
```

Pydantic modeli se pišejo v `PascalCase`.

Request modeli naj se končajo z:

```text
Request
```

Response modeli naj se končajo z:

```text
Response
```

Primeri:

```python
UserCreateRequest
UserUpdateRequest
UserResponse
QuestionnaireSubmitRequest
AssessmentResultResponse
```

---

### 4.9 Backend komentarji in docstringi

Komentarje v backend kodi pišemo v slovenščini.

Komentarji naj pojasnijo:

- pomembno odločitev,
- manj očitno logiko,
- razlog za določeno implementacijo,
- posebno pravilo domene.

Dobro:

```python
# Napredek uporabnika hranimo ločeno od profila, ker se pogosteje spreminja.
```

Slabo:

```python
# Pridobi uporabnika
def get_user():
    ...
```

Docstringi so priporočeni pri:

- service metodah z več koraki,
- repository metodah z manj očitnimi MongoDB poizvedbami,
- API dependency funkcijah,
- validacijskih funkcijah.

---

## 5. Pravila za dokumentacijo

Dokumentacija je lahko napisana v slovenščini.

Datoteke v `docs/` naj imajo številko in kratek opis v `kebab-case`.

Primeri:

```text
01-pregled-projekta.md
02-tehnoloski-sklad.md
10-pravila-poimenovanja-in-pisanje-kode.md
```

Pravila:

- naslov dokumenta naj jasno pove namen,
- vsebina naj bo strukturirana s headingi,
- ne podvajamo preveč vsebine iz drugih dokumentov,
- kjer je smiselno, dodamo povezave do povezanih dokumentov,
- tehnična imena map, datotek in endpointov pišemo v code blokih ali z backticki.

Primer:

```md
Za podrobnejša backend pravila glej [Backend Contribution Guide](../backend/CONTRIBUTING.md).
```

---

## 6. Primeri dobrega in slabega poimenovanja

### Frontend

Dobro:

```text
LearningUnitDetailPage.tsx
learning-unit-service.ts
user-progress.ts
AssistantChat
getLearningUnitDetail()
```

Slabo:

```text
page2.tsx
helper.ts
data.ts
chatthing
getData()
```

---

### Backend

Dobro:

```text
learning_unit_service.py
user_progress_repository.py
questionnaire_schema.py
assessment_assistant_prompt.py
```

Slabo:

```text
service.py
repo.py
schemas2.py
promptFinal.py
```

Dobro:

```python
get_learning_unit_by_id
evaluate_answers
update_current_position
```

Slabo:

```python
do_stuff
handle_data
process
```

---

## 7. Povezani dokumenti

Za podrobnejša pravila razvoja glej:

- [Frontend Contribution Guide](../frontend/CONTRIBUTING.md)
- [Backend Contribution Guide](../backend/CONTRIBUTING.md)
- [Glavni README](../README.md)

Ta dokument se uporablja kot skupni dogovor za poimenovanje in pisanje kode v projektu **NIDiKo**.
