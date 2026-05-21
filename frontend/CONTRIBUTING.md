# Frontend Contribution Guide — Psi-Up

Ta dokument določa pravila za razvoj frontenda projekta **Psi-Up**.

Namen dokumenta je, da lahko vsi člani ekipe in tudi LLM orodja delajo konsistentno, brez podvajanja kode, brez nepotrebnih merge konfliktov in brez spreminjanja obstoječega delovanja aplikacije brez dogovora.

Projekt uporablja:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- FastAPI backend
- MongoDB backend data model

---

## 1. Glavno pravilo

Preden dodaš novo kodo, preveri, ali podobna koda že obstaja.

Ne podvajaj:

- API klicev
- podatkovnih tipov
- loading/error/empty state komponent
- detail page layouta
- search logike
- questionnaire komponent
- route/path prikaza
- assistant/chat komponent

Če nekaj že obstaja kot reusable komponenta, uporabi to komponento.

---

## 2. Trenutna glavna frontend struktura

```text
src/
├── app/
├── assets/
├── components/
├── contexts/
├── features/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
├── index.css
└── main.tsx
```
---

## 3. Pomen glavnih map

### `src/app/`

Vsebuje aplikacijski router in navigacijske konfiguracije.

Primer:

```text
src/app/
├── router.tsx
├── navigation.ts
└── App.tsx
```

Pravila:

- Tu dodajamo route samo, ko je stran že pripravljena.
- Ne dodajamo poslovne logike.
- Ne dodajamo API klicev.
- Ne dodajamo velikih komponent.
- Ne spreminjamo obstoječih URL poti brez dogovora z ekipo.

---

### `src/pages/`

Vsebuje route-level strani.

Vsaka stran mora imeti svojo mapo.

Pravilna struktura:

```text
src/pages/HomePage/
├── HomePage.tsx
├── constants.ts
└── index.ts
```

Primeri strani:

```text
src/pages/HomePage/
src/pages/SearchPage/
src/pages/QuestionnairePage/
src/pages/PathResultPage/
src/pages/DetailTemplatePage/
src/pages/LearningPathDetailPage/
src/pages/ModuleDetailPage/
src/pages/LearningUnitDetailPage/
```

Pravila:

- Page komponenta naj sestavlja obstoječe komponente.
- Page komponenta ne sme postati ogromna, če lahko logiko premaknemo v `features`.
- Page komponenta lahko kliče hooke in services.
- Page komponenta naj ne vsebuje reusable UI logike, ki bi jo lahko potrebovale druge strani.
- Vsaka page mapa mora imeti `index.ts`.
- Če se stran preimenuje, mora biti ime folderja, glavne komponente in exporta usklajeno.

Primer `index.ts`:

```ts
export { default } from './HomePage'
```

---

### `src/features/`

Vsebuje funkcionalne dele aplikacije.

Primeri:

```text
src/features/search/
src/features/questionnaire/
src/features/learning-paths/
src/features/modules/
src/features/learning-units/
src/features/assistant/
```

Pravila:

- Feature-specific komponente gredo v `features/<feature-name>/components`.
- Feature-specific hooki gredo v `features/<feature-name>/hooks`.
- Feature-specific helper funkcije gredo v `features/<feature-name>/utils`.
- Feature-specific tipi lahko gredo v `features/<feature-name>/types.ts`, če niso backend sheme.
- Backend response/request tipi morajo ostati v `src/types`.
- Feature mapa naj ne vsebuje splošnih reusable komponent, ki jih lahko uporabljajo drugi deli aplikacije.

Primer:

```text
src/features/modules/
├── components/
├── hooks/
└── utils/
```

---

### `src/components/`

Vsebuje reusable komponente, ki niso vezane samo na en feature.

Trenutna priporočena struktura:

```text
src/components/
├── common/
├── detail/
├── layout/
└── ui/
```

Pravila:

- `components/common` je za splošne UI state komponente.
- `components/layout` je za globalni layout.
- `components/detail` je za reusable detail page komponente.
- `components/ui` je za osnovne UI gradnike, če jih kasneje dodamo.
- Če komponenta pripada samo enemu feature-u, ne gre v `components`, ampak v `features/<feature>/components`.

---

## 4. `components/common`

V to mapo sodijo splošne reusable komponente.

Primeri:

```text
src/components/common/LoadingState/
src/components/common/ErrorState/
src/components/common/EmptyState/
```

Uporabi jih povsod, kjer stran nalaga podatke, prikaže napako ali nima podatkov.

Ne piši novega loading spinnerja v vsaki strani.

Pravilno:

```tsx
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
```

Napačno:

```tsx
<div>Loading...</div>
```

če za to že obstaja skupna komponenta.

Pravila:

- `LoadingState` uporabljamo za nalaganje podatkov.
- `ErrorState` uporabljamo za prikaz napak iz backend response ali frontend logike.
- `EmptyState` uporabljamo, ko ni podatkov za prikaz.
- Ne podvajamo teh stanj v posameznih straneh.

---

## 5. `components/layout`

V to mapo sodijo globalne layout komponente.

Primeri:

```text
src/components/layout/AppShell/
src/components/layout/Navbar/
src/components/layout/Footer/
src/components/layout/Logo/
src/components/layout/PageContainer/
```

Pravila:

- `Navbar`, `Footer`, `Logo` in `AppShell` so namenjeni skupni uporabi.
- Ne spreminjaj globalnega layouta brez dogovora z ekipo.
- Ne priklapljaj `AppShell` na vse strani, če bi to spremenilo obstoječi izgled, brez dogovora.
- `PageContainer` uporabljaj za konsistentno širino strani, kjer je to primerno.
- `Logo` naj bo enoten za vse strani.

---

## 6. `components/detail`

V to mapo sodijo reusable komponente za strani s podrobnostmi.

Primeri:

```text
src/components/detail/DetailPageShell/
src/components/detail/DetailHero/
src/components/detail/DetailMeta/
src/components/detail/DetailTags/
src/components/detail/DetailSection/
src/components/detail/DetailActions/
src/components/detail/DetailRouteMap/
```

Te komponente uporabljamo za:

```text
LearningPathDetailPage
ModuleDetailPage
LearningUnitDetailPage
DetailTemplatePage
```

Pravila:

- Ne ustvarjaj novega hero layouta za vsako detail stran.
- Ne ustvarjaj novega tags prikaza za vsako detail stran.
- Ne ustvarjaj novega route/path prikaza, če lahko uporabiš `DetailRouteMap`.
- Če potrebuješ novo reusable detail komponento, dodaj jo v `components/detail`.
- Detail komponente morajo biti generične in ne smejo biti vezane samo na learning path, module ali learning unit.

Primer uporabe:

```tsx
import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
```

---

## 7. `features/assistant`

Reusable LLM/chat UI gre v:

```text
src/features/assistant/
```

Trenutna struktura:

```text
src/features/assistant/
├── components/
│   ├── AssistantChat/
│   ├── AssistantInput/
│   └── AssistantMessage/
├── hooks/
│   └── useAssistantChat.ts
├── types.ts
└── index.ts
```

Pravila:

- Če stran potrebuje LLM chat, uporabi `AssistantChat`.
- Ne piši nove chat komponente v vsaki detail strani.
- `AssistantChat` mora podpirati različne kontekste:

```ts
'learning_path'
'module'
'learning_unit'
'general'
```

Primer:

```tsx
<AssistantChat
  contextType="learning_unit"
  contextId={learningUnit.id}
  title="Pomočnik za učno enoto"
/>
```

Za zdaj je `AssistantChat` lahko UI mock. Kasneje se poveže z backend LLM endpointom.

---

## 8. `src/services`

Vse API komunikacije z backendom morajo iti skozi `src/services`.

Trenutna struktura:

```text
src/services/
├── api-client.ts
├── search-service.ts
├── learning-path-service.ts
├── module-service.ts
├── learning-unit-service.ts
├── questionnaire-service.ts
├── assessment-service.ts
├── user-progress-service.ts
└── user-service.ts
```

Pravila:

- Komponente ne smejo direktno klicati `fetch`.
- Strani naj uporabljajo service funkcije.
- Vsi API endpointi morajo imeti centralno funkcijo v ustreznem service fajlu.
- Error handling naj gre skozi `api-client.ts`.
- Ne definiraj backend response tipov znotraj service datoteke, če že obstajajo v `src/types`.

Pravilno:

```ts
const data = await getLearningUnitDetail(learningUnitId)
```

Napačno:

```ts
const response = await fetch('http://localhost:8000/api/learning-units/...')
```

---

## 9. `src/types`

Backend response/request tipi so definirani v `src/types`.

Trenutna struktura:

```text
src/types/
├── api.ts
├── assessment.ts
├── domain.ts
├── learning-path.ts
├── learning-unit.ts
├── module.ts
├── questionnaire.ts
├── search.ts
├── user-progress.ts
└── user.ts
```

Pravila:

- Backend sheme se mapirajo v TypeScript tipe tukaj.
- Ne definiraj istega tipa ponovno v komponenti.
- Ne definiraj response tipa v service fajlu, če že obstaja v `src/types`.
- `domain.ts` je še vedno lahko uporabljen za stare/prototipne tipe, dokler se koda postopoma ne refactorira.
- Če backend doda novo shemo, naj se najprej doda ali posodobi ustrezen tip v `src/types`.

Primer:

```ts
import type { LearningUnitResponse } from '../../types/learning-unit'
```

---

## 10. Naming pravila

### Pages

Page folderji uporabljajo PascalCase:

```text
HomePage
SearchPage
QuestionnairePage
LearningUnitDetailPage
```

Vsaka page mapa ima:

```text
PageName/
├── PageName.tsx
└── index.ts
```

Če ima stran lokalni CSS:

```text
QuestionnairePage/
├── QuestionnairePage.tsx
├── QuestionnairePage.css
└── index.ts
```

---

### Components

Večje reusable komponente imajo folder:

```text
ComponentName/
├── ComponentName.tsx
└── index.ts
```

Primer:

```text
DetailHero/
├── DetailHero.tsx
└── index.ts
```

---

### Services

Services uporabljajo kebab-case:

```text
learning-unit-service.ts
learning-path-service.ts
user-progress-service.ts
```

---

### Types

Types uporabljajo kebab-case:

```text
learning-unit.ts
learning-path.ts
user-progress.ts
```

---

### Features

Feature mape uporabljajo kebab-case in plural, kjer je smiselno:

```text
learning-paths
learning-units
modules
search
questionnaire
assistant
```

---

## 11. Routing pravila

Router je v:

```text
src/app/router.tsx
```

Trenutne glavne poti:

```text
/                               -> HomePage
/search                         -> SearchPage
/assessment                     -> QuestionnairePage
/path                           -> PathResultPage
/detail-template                -> DetailTemplatePage
/learning-paths/:learningPathId -> LearningPathDetailPage
/modules/:moduleId              -> ModuleDetailPage
/learning-units/:learningUnitId -> LearningUnitDetailPage
```

Pravila:

- Ne spreminjaj obstoječih URL-jev brez dogovora.
- Če interno preimenujemo komponento, route lahko ostane enak.
- Nove strani naj imajo najprej svojo page mapo in `index.ts`.
- Route dodaj šele, ko stran builda brez napak.
- Če dodajaš novo route, preveri, da je import v `router.tsx` pravilen.

---

## 12. Detail page standard

Detail strani naj uporabljajo skupne detail komponente.

Za:

```text
LearningPathDetailPage
ModuleDetailPage
LearningUnitDetailPage
```

uporabljamo:

```tsx
DetailPageShell
DetailHero
DetailMeta
DetailTags
DetailSection
DetailRouteMap
AssistantChat
LoadingState
ErrorState
EmptyState
```

### LearningPathDetailPage

Naj prikazuje:

```text
title
short_description
duration_min
keywords
modules
```

Za `modules` uporabimo `DetailRouteMap`.

---

### ModuleDetailPage

Naj prikazuje:

```text
title
short_description
duration_min
keywords
domains
learning_units
```

Za `learning_units` uporabimo `DetailRouteMap`.

---

### LearningUnitDetailPage

Naj prikazuje:

```text
title
short_description
duration_min
keywords
skills
self_assessment_questions
```

Za chat uporablja:

```tsx
<AssistantChat contextType="learning_unit" contextId={learningUnit.id} />
```

---

## 13. Search pravila

Search feature je v:

```text
src/features/search/
```

Search page je v:

```text
src/pages/SearchPage/
```

Search API klici morajo biti v:

```text
src/services/search-service.ts
```

Search tipi so v:

```text
src/types/search.ts
```

Pravila:

- Ne piši nove search logike v `HomePage`, če lahko uporabiš obstoječi search hook/context.
- Search filterji morajo biti usklajeni z backend tipi:

```ts
'learning_path'
'module'
'learning_unit'
```

Frontend labeli:

```text
Vse
Učne poti
Moduli
Učne enote
```

Ne uporabljaj več `Kompetence` kot search filter, če backend ne podpira `competency`.

---

## 14. Questionnaire pravila

Questionnaire page je:

```text
src/pages/QuestionnairePage/
```

Questionnaire feature je:

```text
src/features/questionnaire/
```

Pravila:

- UI komponente vprašalnika naj ostanejo v `features/questionnaire/components`.
- API za questionnaire naj gre skozi `questionnaire-service.ts`, kadar se uporablja nova backend logika.
- Assessment/evaluation request naj gre skozi `assessment-service.ts`.
- Ne mešaj starega competency flowa z novo questionnaire logiko brez jasnega dogovora.

Backend nova logika uporablja:

```text
GET /api/questionnaires?target_type=...&target_id=...
POST /api/assessments/evaluate
```

---

## 15. API client pravila

Centralni API client je:

```text
src/services/api-client.ts
```

Uporabljaj:

```ts
apiGet<T>()
apiPost<TResponse, TBody>()
apiPut<TResponse, TBody>()
apiDelete<T>()
apiDeleteWithBody<TResponse, TBody>()
```

Pravila:

- Ne hardcodaj `http://localhost:8000` v komponentah.
- Base URL naj gre skozi env spremenljivko ali `api-client`.
- Backend error response ima obliko:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Učna enota ni najdena.",
    "details": null
  }
}
```

Frontend naj prikaže `error.message`.

---

## 16. Tailwind in styling pravila

Projekt uporablja Tailwind CSS.

Barve so definirane v theme sistemu v `src/index.css`.

Uporabljaj obstoječe barvne skupine:

```text
sand
brown
forest
terracotta
```

Pravila:

- Ne uvajaj naključnih novih barv brez dogovora.
- Ne piši novega design sistema, če Tailwind theme že obstaja.
- Za nove reusable komponente uporabljaj Tailwind `className`.
- Stare CSS fajle lahko ostanejo, dokler se postopoma ne refactorajo.
- Ne spreminjaj izgleda obstoječih strani, če je cilj samo refactor strukture.

---

## 17. Kaj narediti pred dodajanjem nove kode

Pred pisanjem nove kode preveri:

- Ali podobna komponenta že obstaja?
- Ali obstaja ustrezen service?
- Ali obstaja ustrezen type?
- Ali je komponenta splošna ali feature-specific?
- Ali sprememba vpliva na obstoječ izgled?
- Ali bo sprememba povzročila merge konflikt?

---

## 18. Kam kaj spada?

### Nova stran

Gre v:

```text
src/pages/NewPage/
```

Primer:

```text
src/pages/ProfilePage/
├── ProfilePage.tsx
└── index.ts
```

---

### Nova reusable UI komponenta

Gre v eno izmed teh map:

```text
src/components/common/
src/components/detail/
src/components/layout/
src/components/ui/
```

Odvisno od namena.

---

### Nova feature komponenta

Gre v:

```text
src/features/<feature-name>/components/
```

Primer:

```text
src/features/modules/components/ModuleLearningUnitRoute.tsx
```

---

### Nov API klic

Gre v:

```text
src/services/<domain>-service.ts
```

Primer:

```text
src/services/module-service.ts
```

---

### Nov backend tip

Gre v:

```text
src/types/
```

Primer:

```text
src/types/module.ts
```

---

### Nov custom hook

Če je splošen:

```text
src/hooks/
```

Če je feature-specific:

```text
src/features/<feature-name>/hooks/
```

---

## 19. Pravila za LLM uporabo

Če uporabljaš LLM za pisanje kode, mu vedno prilepi ta dokument ali relevantne dele tega dokumenta.

LLM mora upoštevati:

- Ne podvajaj obstoječe kode.
- Ne uporabljaj direktnega `fetch` v komponentah.
- Uporabi `services` za API.
- Uporabi tipe iz `src/types`.
- Uporabi reusable `common/detail/layout` komponente.
- Ne spreminjaj izgleda obstoječih strani brez zahteve.
- Ne spreminjaj obstoječih route URL-jev brez dogovora.
- Vsaka page mora imeti svojo mapo in `index.ts`.
- Vsaka večja reusable komponenta mora imeti folder in `index.ts`.
- Predlagaj minimalne spremembe, ki ne povzročajo konfliktov.

---

## 20. LLM prompt template

Ko prosiš LLM za pomoč pri projektu, uporabi tak prompt:

```text
Delamo na frontend projektu Psi-Up.

Uporabljamo React, TypeScript, Vite, Tailwind CSS in React Router.
Backend je FastAPI z /api prefixom.

Upoštevaj CONTRIBUTING.md pravila:
- ne podvajaj kode
- API klici morajo iti skozi src/services
- backend tipi morajo biti v src/types
- reusable detail komponente so v src/components/detail
- common loading/error/empty komponente so v src/components/common
- layout komponente so v src/components/layout
- feature-specific komponente gredo v src/features/<feature>/components
- ne spreminjaj izgleda obstoječih strani brez zahteve
- ne spreminjaj obstoječih route URL-jev brez dogovora

Naloga:
[OPIŠI NALOGO]

Preden napišeš kodo:
1. povej katere datoteke boš spremenil
2. povej ali obstaja tveganje za konflikt
3. povej ali bo sprememba vplivala na izgled
4. uporabi obstoječe services/types/components, če obstajajo
```

---

## 21. Checklist pred commitom

Pred vsakim commitom preveri:

```bash
npm run build
```

Potem preveri:

```bash
git status
```

Checklist:

- Build uspe.
- Ni TypeScript napak.
- Ni direktnega `fetch` v komponentah.
- Novi API klici so v `src/services`.
- Novi tipi so v `src/types`.
- Nova stran ima svojo mapo in `index.ts`.
- Reusable komponenta je v `components/common`, `components/detail` ali `components/layout`.
- Feature-specific komponenta je v `features/<feature>/components`.
- Nisem po nepotrebnem spremenil/a obstoječega izgleda.
- Nisem po nepotrebnem spremenil/a obstoječih route URL-jev.
- Nisem podvojil/a že obstoječe komponente.

---

## 22. Commit message pravila

Commit message naj bo kratek in jasen.

Primeri:

```bash
git commit -m "Refaktorirana pages struktura z HomePage in QuestionnairePage"
```

```bash
git commit -m "Dodane detail page poti in predloga za podrobnosti vsebine"
```

```bash
git commit -m "Dodane reusable detail komponente za strani s podrobnostmi"
```

```bash
git commit -m "Dodana reusable assistant chat komponenta"
```

```bash
git commit -m "Povezana stran podrobnosti učne enote z backend service"
```

---

## 23. Merge pravila

Pred začetkom dela:

```bash
git pull
```

Po končanem delu:

```bash
npm run build
git status
git add .
git commit -m "Opis spremembe"
git pull
git push
```

Če pride do merge konfliktov:

- Ne paničari.
- Ne briši kode, če nisi prepričan/a.
- Najprej preveri, katera datoteka ima konflikt.
- Reši konflikt ročno.
- Zaženi `npm run build`.
- Šele potem commit/push.

---

## 24. Kaj trenutno še ni dokončano

Ta dokument opisuje trenutno refaktorirano smer, ampak nekaj delov je še v postopku.

Potencialni prihodnji koraki:

- Povezati `ModuleDetailPage` z backend service.
- Povezati `LearningPathDetailPage` z backend service.
- Postopno refactorati `QuestionnairePage` v manjše feature komponente.
- Postopno refactorati `SearchPage` v hook + komponente.
- Po dogovoru priključiti `AppShell`, `Navbar` in `Footer` na več strani.
- Odstraniti `placeholder.txt` datoteke, ko mape dobijo realno vsebino.
- Zamenjati stare direktne `fetch` klice s services, kjer še obstajajo.

---

## 25. Najpomembnejši princip

Če sprememba ni nujno potrebna, naj bo majhna.

Najprej ohrani delovanje, potem izboljšaj strukturo.

Refactor mora biti:

- majhen
- preverljiv
- brez spremembe izgleda
- brez podvajanja kode
- usklajen z obstoječo arhitekturo