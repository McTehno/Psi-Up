# Psi-Up

## 1. Vizija projekta
Vizija projekta je razviti pregleden in uporabniku prijazen priporočilni sistem, ki posamezniku pomaga izbrati ustrezno učno pot za razvoj digitalnih kompetenc. Sistem na podlagi uporabnikovega predznanja, ciljev in odgovorov v vprašalniku predlaga smiselno strukturirano učno pot, sestavljeno iz modulov in pripadajočih učnih enot.

Aplikacija uporabniku omogoča jasen vpogled v trenutno stanje, priporočene naslednje korake in končni cilj, ki ga želi doseči. Učne poti so povezane s kompetencami po standardu DigComp, kar omogoča boljše razumevanje, katere digitalne kompetence uporabnik razvija in na kateri ravni.

Rešitev naslavlja problem nepreglednosti pri izbiri izobraževalnih vsebin. Namesto ročnega iskanja posameznih učnih enot sistem uporabniku predlaga primerno pot, ki upošteva njegovo izhodiščno znanje, želje in izbran cilj.

## 2. Namen projekta
Namen projekta je izdelati priporočilni sistem, ki uporabniku na podlagi vprašalnika predlaga ustrezne module in učne enote za doseganje želene ravni digitalnih kompetenc.

Sistem je namenjen različnim skupinam uporabnikov, kot so študenti, zaposleni, profesorji, starejši uporabniki, podjetja in posamezniki brez osnovnega digitalnega znanja.
## 3. Glavne funkcionalnosti
- določanje uporabnikovega trenutnega znanja,
- izbira oziroma prepoznavanje želenih kompetenc,
- priporočanje ustrezne učne poti,
- prikaz modulov in učnih enot,
- grafični prikaz učne poti,
- prikaz napredovanja od začetnega stanja do končnega cilja.

## 4. Tehnološki sklad

Projekt je razdeljen na frontend, backend in podatkovno bazo. Spodaj so navedene glavne tehnologije in verzije, ki se trenutno uporabljajo v projektu.

### 4.1 Frontend

| Tehnologija | Verzija | Namen |
|---|---:|---|
| React | 19.2.6 | Izdelava uporabniškega vmesnika |
| React DOM | 19.2.6 | Prikaz React komponent v brskalniku |
| React Router DOM | 7.15.1 | Usmerjanje med stranmi na frontendu |
| TypeScript | 6.0.2 | Tipizacija frontend kode |
| Vite | 8.0.12 | Razvojno okolje in build orodje |
| Tailwind CSS | 4.3.0 | Stiliziranje uporabniškega vmesnika |
| Lucide React | 1.16.0 | Ikone v uporabniškem vmesniku |
| ESLint | 10.3.0 | Preverjanje kakovosti frontend kode |

### 4.2 Backend

| Tehnologija | Verzija | Namen |
|---|---:|---|
| Python | 3.13 | Backend programski jezik |
| FastAPI | 0.136.1 | Izdelava REST API endpointov |
| Uvicorn | 0.46.0 | Zagon FastAPI aplikacije |
| Pydantic | 2.13.4 | Validacija requestov in response sheme |
| PyMongo | 4.17.0 | Povezava z MongoDB |
| email-validator | 2.3.0 | Validacija email naslovov v Pydantic shemah |

### 4.3 Podatkovna baza

| Tehnologija | Verzija | Namen |
|---|---:|---|
| MongoDB Atlas | cloud storitev | Glavna podatkovna baza |
| MongoDB Compass | lokalno orodje | Pregled in uvoz podatkov v MongoDB |
| JSON | / | Začetni podatki za uvoz v MongoDB |

## 5. Struktura projekta

```text
psi-up/
├── README.md                 // glavni README za celoten projekt
├── backend/
│   ├── README.md             // README za backend
│   ├── app/
│   ├── data/mongodb/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── README.md             // README za frontend
│   ├── src/
│   ├── package.json
│   └── .env
└── docs/
    ├── besednjak.md
    └── podatkovni-model.md
```

## 6. Pravila poimenovanja in pisanja kode
### 6.1 Splošna pravila

- Imena map, datotek, komponent, funkcij in spremenljivk v kodi pišemo v angleščini.
- Dokumentacija projekta je lahko zapisana v slovenščini.
- Imena naj bodo jasna, razumljiva in povezana z domeno projekta.
- Poimenovanje mora biti dosledno skozi celoten projekt.
- Nepotrebnih okrajšav se izogibamo.
- Za enake pojme vedno uporabljamo enake izraze.

### 6.2 Poimenovanje map

Mape pišemo z malimi črkami.

Če je ime sestavljeno iz več besed, uporabimo vezaj.

Primer:
```text
learning-paths/
questionnaire/
recommendations/
digital-competencies/
```

### 6.3 Poimenovanje datotek na frontendu

- React komponente pišemo v PascalCase.
Primer:
```text
LearningPathView.tsx
QuestionnaireForm.tsx
ModuleCard.tsx
LearningUnitList.tsx
```
- Pomožne TypeScript datoteke pišemo z malimi črkami in vezaji.

Primer:
```text
api-client.ts
constants.ts
questionnaire-service.ts
recommendation-service.ts
```

### 6.4 Poimenovanje datotek na backendu

- Python datoteke pišemo z malimi črkami in podčrtaji.
Primer:
```text
recommendation_service.py
learning_path_service.py
database_config.py
```
### 6.5 Poimenovanje spremenljivk in funkcij

- V React/TypeScript uporabljamo *camelCase*.
  
Primer:

```text
selectedCompetency
getLearningPath()
submitQuestionnaire()
```

- V Pythonu uporabljamo *snake_case*.

Primer:
```text
selected_competency
get_learning_path()
submit_questionnaire()
```

### 6.6 Poimenovanje React komponent

- React komponente pišemo v *PascalCase*.

Primer:
```text
LearningUnitList.tsx
```

### 6.7 Komentarji v kodi

Komentarje uporabljamo samo tam, kjer pojasnijo pomembno logiko ali odločitev.

Dober primer:
```text
# For the initial version, the system returns one recommended learning path based on the selected competency.
```

