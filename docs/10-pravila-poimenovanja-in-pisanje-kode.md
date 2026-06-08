# Pravila poimenovanja in pisanja kode

Ta dokument opisuje osnovna pravila poimenovanja, organizacije in pisanja kode v projektu **NIDiKo**.

Namen dokumenta je zagotoviti, da je koda dosledna, razumljiva in lažja za vzdrževanje.

---

## 1. Splošna pravila

- Imena map, datotek, komponent, funkcij in spremenljivk v kodi pišemo v angleščini.
- Dokumentacija projekta pišemo trenutno v slovenščini.
- Imena so jasna, razumljiva in povezana z domeno projekta.
- Poimenovanje mora biti dosledno skozi celoten projekt.
- Nepotrebnih okrajšav se izogibamo.
- Za enake pojme vedno uporabljamo enake izraze.
- Ne dodajamo nove strukture, če že obstaja ustrezna mapa, komponenta, servis ali tip.

---

## 2. Poimenovanje map

Mape pišemo z malimi črkami.

Če je ime sestavljeno iz več besed, uporabimo vezaj.

Primer:

```text
learning-paths/
questionnaire/
recommendations/
digital-competencies/
```

Na frontendu so večji sklopi organizirani po namenu:

```text
pages/
features/
components/
services/
types/
```

Na backendu so sklopi ločeni po odgovornosti:

```text
routers/
schemas/
services/
repositories/
database/
core/
```

---

## 3. Poimenovanje datotek na frontendu

React komponente pišemo v **PascalCase**.

Primer:

```text
LearningPathView.tsx
QuestionnaireForm.tsx
ModuleCard.tsx
LearningUnitList.tsx
```

Pomožne TypeScript datoteke pišemo z malimi črkami in vezaji.

Primer:

```text
api-client.ts
constants.ts
questionnaire-service.ts
recommendation-service.ts
```

Datoteke za tipe so jasne in vezane na domeno.

Primer:

```text
learning-path-types.ts
module-types.ts
user-progress-types.ts
```

---

## 4. Poimenovanje datotek na backendu

Python datoteke pišemo z malimi črkami in podčrtaji.

Primer:

```text
recommendation_service.py
learning_path_service.py
database_config.py
```

Datoteke naj jasno pokažejo svojo odgovornost:

```text
learning_path_router.py
learning_path_schema.py
learning_path_service.py
learning_path_repository.py
```

---

## 5. Poimenovanje spremenljivk in funkcij

V React/TypeScript uporabljamo **camelCase**.

Primer:

```text
selectedLearningPath
getLearningPath()
submitQuestionnaire()
```

V Pythonu uporabljamo **snake_case**.

Primer:

```text
selected_learning_path
get_learning_path()
submit_questionnaire()
```

Konstante pišemo z velikimi črkami.

Primer:

```text
API_BASE_URL
DEFAULT_PAGE_SIZE
GUEST_ASSESSMENT_USER_ID_KEY
```

---

## 6. Poimenovanje React komponent

React komponente pišemo v **PascalCase**.

Primer:

```text
LearningUnitList.tsx
```

Ime komponente jasno pove, kaj komponenta prikazuje ali dela.

Dobri primeri:

```text
LearningPathCard
QuestionnaireProgress
AssessmentResultSummary
DetailActions
```

Manj primerni primeri:

```text
Box
Data
Component1
NewCard
```

---

## 7. Pravila za frontend kodo

API klici so zapisani v mapi:

```text
src/services/
```

Tipi podatkov so zapisani v mapi:

```text
src/types/
```

Komponente, ki se uporabljajo na več mestih, so v:

```text
src/components/
```

Funkcionalnosti, ki pripadajo določenemu sklopu, so v:

```text
src/features/
```

Strani so v:

```text
src/pages/
```

Pri dodajanju nove kode najprej preverimo, ali že obstaja ustrezen servis, tip, komponenta ali helper.

Ne podvajamo:

- API klicev,
- tipov,
- loading/error/empty prikazov,
- detail komponent,
- logike za iskanje,
- logike za vprašalnik,
- logike za uporabniški napredek.

---

## 8. Pravila za backend kodo

Backend je razdeljen po odgovornostih.

### Routerji

Routerji skrbijo za API endpoint.

Primer:

```text
learning_paths.py
modules.py
users.py
```

Router ne sme vsebovati preveč poslovne logike. Poslovna logika je v servisih.

### Sheme

Sheme skrbijo za validacijo requestov in response podatkov.

Primer:

```text
learning_path_schema.py
module_schema.py
user_schema.py
```

### Servisi

Servisi vsebujejo glavno poslovno logiko.

Primer:

```text
learning_path_service.py
assessment_service.py
user_service.py
```

### Repozitoriji

Repozitoriji skrbijo za komunikacijo s podatkovno bazo.

Primer:

```text
learning_path_repository.py
module_repository.py
user_repository.py
```

---

## 9. Pravila za API klice

Frontend ne kliče backenda neposredno iz komponent, če za to obstaja servis.

Namesto tega:

```text
komponenta → service → api-client → backend
```

To omogoča boljšo organizacijo kode in lažje popravljanje API klicev.

Primer poimenovanja servisov:

```text
learning-path-service.ts
module-service.ts
assessment-service.ts
user-progress-service.ts
```

---

## 10. Pravila za stiliziranje

Za stiliziranje uporabljamo Tailwind CSS.

Pri oblikovanju uporabljamo obstoječe barve in vizualni slog projekta.

Prednost imajo barve iz oblikovalskega sistema projekta, na primer:

```text
sand
brown
forest
terracotta
```

Ne dodajamo naključnih novih barv, če za to ni jasnega razloga.

Pri spremembah uporabniškega vmesnika pazimo, da ne spreminjamo obstoječega izgleda, postavitve ali logike, če to ni namen naloge.

---

## 11. Komentarji v kodi

Komentarje uporabljamo samo tam, kjer pojasnijo pomembno logiko ali odločitev.

Komentar razloži, zakaj nekaj obstaja, ne samo kaj dela posamezna vrstica.

Dober primer:

```python
# Uporabimo prerequisites, ker predstavljajo glavni vir resnice za dostopnost učnih enot.
```

Manj primeren primer:

```python
# Nastavi spremenljivko na true.
```

---

## 12. Okoljske spremenljivke

Občutljivih podatkov ne zapisujemo neposredno v kodo.

Za lokalne nastavitve uporabljamo datoteke:

```text
backend/.env
frontend/.env
```

V Git dodamo samo predloge:

```text
backend/.env.example
frontend/.env.example
```

---

## 13. Commit sporočila

Commit sporočila so kratka, jasna in zapisana v slovenščini.

Primeri:

```text
Dodana dokumentacija tehnoloskega sklada
Posodobljen podatkovni model
Izboljsan prikaz uporabniskega napredka
Dodana predloga okoljskih spremenljivk
```

Commit opisuje dejansko spremembo.

Manj primerni primeri:

```text
fix
spremembe
test
update
```

---

## 14. Preverjanje pred commitom

Pred commitom preverimo:

- ali se projekt zažene,
- ali ni dodanih občutljivih podatkov,
- ali so imena datotek in funkcij dosledna,
- ali ni podvojene kode,
- ali so povezave v dokumentaciji pravilne,
- ali sprememba ne pokvari obstoječe funkcionalnosti.

Za frontend je priporočljivo preveriti:

```bash
npm run build
```

Za backend je priporočljivo preveriti teste, če so pripravljeni:

```bash
pytest
```

---

## 15. Povzetek

Glavno pravilo projekta NIDiKo je doslednost.

Koda je organizirana, poimenovanja so jasna, občutljivi podatki ostanejo izven repozitorija, nova funkcionalnost pa se doda na mesto, ki ustreza obstoječi arhitekturi projekta.
