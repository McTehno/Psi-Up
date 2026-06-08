# Frontend — NIDiKo

Frontend del aplikacije **NIDiKo** je zgrajen z uporabo **React**, **TypeScript**, **Vite** in **Tailwind CSS**.


---

## Kazalo

- [1. Namen frontenda](#1-namen-frontenda)
- [2. Tehnološki sklad](#2-tehnološki-sklad)
- [3. Struktura frontend kode](#3-struktura-frontend-kode)
- [4. Arhitektura frontenda](#4-arhitektura-frontenda)
- [5. Okoljske spremenljivke](#5-okoljske-spremenljivke)
- [6. Lokalni zagon](#6-lokalni-zagon)
- [7. Komunikacija z backendom](#7-komunikacija-z-backendom)
- [8. Avtentikacija](#8-avtentikacija)
- [9. Glavni uporabniški sklopi](#9-glavni-uporabniški-sklopi)
- [10. Styling in vizualni sistem](#10-styling-in-vizualni-sistem)
- [11. Build in preverjanje](#11-build-in-preverjanje)
- [12. Pravila za razvoj](#12-pravila-za-razvoj)
- [13. Povezani dokumenti](#13-povezani-dokumenti)

---

## 1. Namen frontenda

Frontend omogoča uporabniku:

- pregled učnih poti, modulov in učnih enot,
- iskanje po učnih vsebinah,
- izpolnjevanje samoocenjevalnega vprašalnika,
- uporabo glasovne pomoči pri vprašalniku,
- pregled rezultatov in priporočene začetne pozicije,
- shranjevanje, označevanje priljubljenih in zaključevanje vsebin,
- spremljanje napredka znotraj učne poti,
- uporabo kontekstualnega AI pomočnika,
- prijavo, registracijo in upravljanje uporabniškega profila,
- uporabo aplikacije na namizju, tablici in mobilnih napravah.

---

## 2. Tehnološki sklad

| Tehnologija | Namen |
|---|---|
| React | izdelava uporabniškega vmesnika |
| TypeScript | tipizacija frontend kode |
| Vite | razvojno okolje in build orodje |
| Tailwind CSS | stiliziranje uporabniškega vmesnika |
| React Router | usmerjanje med stranmi |
| Supabase Auth | prijava, registracija in uporabniška seja |
| FastAPI backend | API podatki in poslovna logika |
| Docker | zagon frontend okolja |

Podrobnejši opis tehnologij je zapisan v dokumentu:

- [Tehnološki sklad](../docs/02-tehnoloski-sklad.md)

---

## 3. Struktura frontend kode

```text
frontend/
├── public/                           # javne statične datoteke
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── app/                          # router, root layout in osnovna konfiguracija aplikacije
│   │   ├── router.tsx                # definicija frontend route poti
│   │   ├── RootLayout.tsx            # osnovni layout aplikacije
│   │   ├── navigation.ts             # navigacijske nastavitve
│   │   └── PageTitleManager.tsx      # upravljanje naslovov strani
│   │
│   ├── assets/                       # slike, ilustracije in vizualni elementi
│   │
│   ├── components/                   # reusable komponente
│   │   ├── common/                   # LoadingState, ErrorState, EmptyState in podobno
│   │   ├── detail/                   # skupne komponente za detail strani
│   │   ├── layout/                   # Navbar, Footer, Logo, PageContainer
│   │   ├── ui/                       # osnovni UI gradniki
│   │   └── voice-help/               # komponente za glasovno pomoč
│   │
│   ├── contexts/                     # React context providerji in globalna stanja
│   │
│   ├── design/                       # skupne design nastavitve in helperji
│   │
│   ├── features/                     # funkcionalni sklopi aplikacije
│   │   ├── assistant/                # reusable AI/chat funkcionalnosti
│   │   ├── auth/                     # prijava, registracija in auth context
│   │   ├── dashboard/                # uporabniška nadzorna plošča
│   │   ├── detail/                   # helperji za detail prikaze
│   │   ├── learning-paths/           # učne poti
│   │   ├── learning-units/           # učne enote
│   │   ├── modules/                  # moduli
│   │   ├── questionnaire/            # vprašalnik in assessment UI
│   │   └── search/                   # iskanje po vsebinah
│   │
│   ├── hooks/                        # skupni custom React hooki
│   │
│   ├── pages/                        # route-level strani
│   │   ├── HomePage/
│   │   ├── SearchPage/
│   │   ├── QuestionnairePage/
│   │   ├── LearningPathDetailPage/
│   │   ├── ModuleDetailPage/
│   │   ├── LearningUnitDetailPage/
│   │   ├── LoginPage/
│   │   └── DashboardPage/
│   │
│   ├── services/                     # API komunikacija z backendom in zunanjimi storitvami
│   │   ├── api-client.ts             # skupni API client
│   │   ├── supabase-client.ts        # povezava s Supabase Auth
│   │   ├── learning-path-service.ts
│   │   ├── module-service.ts
│   │   ├── learning-unit-service.ts
│   │   ├── questionnaire-service.ts
│   │   ├── assessment-service.ts
│   │   ├── user-progress-service.ts
│   │   └── voice-help-service.ts
│   │
│   ├── types/                        # TypeScript tipi za backend request/response podatke
│   │   ├── api.ts
│   │   ├── assessment.ts
│   │   ├── learning-path.ts
│   │   ├── learning-unit.ts
│   │   ├── module.ts
│   │   ├── questionnaire.ts
│   │   ├── search.ts
│   │   ├── user-progress.ts
│   │   └── user.ts
│   │
│   ├── utils/                        # pomožne funkcije
│   ├── index.css                     # globalni Tailwind in theme slog
│   └── main.tsx                      # vstopna točka React aplikacije
│
├── .env.example                      # primer frontend okoljskih spremenljivk
├── Dockerfile                        # produkcijska Docker konfiguracija
├── Dockerfile.dev                    # razvojna Docker konfiguracija
├── package.json                      # odvisnosti in npm skripte
├── vite.config.ts                    # Vite konfiguracija
├── CONTRIBUTING.md                   # pravila za razvoj frontenda
└── README.md                         # opis frontend dela projekta
```

Podrobnejša pravila za razvoj frontend kode so zapisana v dokumentu:

- [Frontend Contribution Guide](CONTRIBUTING.md)

---

## 4. Arhitektura frontenda

Frontend je organiziran po odgovornostih.

Glavno pravilo:

```text
Pages sestavljajo stran.
Features vsebujejo funkcionalne sklope.
Components vsebujejo reusable UI gradnike.
Services komunicirajo z backendom.
Types definirajo backend request/response podatke.
```

Tipičen tok podatkov:

```text
Page → feature/component → service → backend API
backend API → service → type → page/component
```

Pravila:

- route-level strani so v `src/pages`,
- funkcionalna logika posameznih sklopov je v `src/features`,
- reusable komponente so v `src/components`,
- API klici gredo skozi `src/services`,
- backend tipi so v `src/types`,
- skupni helperji so v `src/utils` ali feature-specific `utils`.

Podrobnejša arhitektura sistema je opisana v dokumentu:

- [Arhitektura sistema](../docs/03-arhitektura.md)

---

## 5. Okoljske spremenljivke

Frontend uporablja okoljske spremenljivke iz datoteke:

```text
frontend/.env
```

V repozitoriju je samo primer datoteke:

```text
frontend/.env.example
```

---

## 6. Lokalni zagon

Frontend se lahko zažene skupaj s celotnim projektom prek Docker Compose ali ročno kot samostojna Vite aplikacija.

Priporočen način za razvoj celotnega projekta je zagon prek Dockerja iz korenske mape repozitorija.

Podrobna navodila za:

- pripravo `.env` datotek,
- zagon z Dockerjem,
- ročni zagon frontenda in backenda,
- dostop do lokalnih URL-jev,
- reševanje pogostih težav

so zapisana v dokumentu:

- [Vzpostavitev razvojnega okolja](../docs/04-vzpostavitev-razvojnega-okolja.md)

---

## 7. Komunikacija z backendom

Vsa komunikacija z backendom poteka prek datotek v:

```text
src/services/
```

Centralni API client je:

```text
src/services/api-client.ts
```

Pravila:

- komponente ne kličejo direktno `fetch`,
- API klici so organizirani po domenah,
- response/request tipi so definirani v `src/types`,
- error handling naj gre skozi skupni API client,
- protected requesti pošljejo JWT token, kadar je to potrebno.

Primeri service datotek:

```text
learning-path-service.ts
module-service.ts
learning-unit-service.ts
questionnaire-service.ts
assessment-service.ts
user-progress-service.ts
voice-help-service.ts
```

Podrobnejši pregled API endpointov je zapisan v dokumentu:

- [API endpointi](../docs/06-api-endpointi.md)

---

## 8. Avtentikacija

Aplikacija uporablja **Supabase Auth** za prijavo in registracijo uporabnikov.

Frontend je odgovoren za:

- registracijo,
- prijavo,
- odjavo,
- pridobitev uporabniške seje,
- pridobitev JWT tokena,
- pošiljanje tokena backendu pri zaščitenih zahtevah.

Povezane datoteke:

```text
src/services/supabase-client.ts
src/features/auth/
src/pages/LoginPage/
src/pages/DashboardPage/
```

Backend pri zaščitenih zahtevah preveri JWT token in uporabnika poveže z lokalnim profilom v MongoDB.

Več o tej arhitekturni odločitvi je zapisano v dokumentu:

- [ADR-010: Uporaba Supabase Auth](../docs/adr/ADR-010-uporaba-supabase-auth-za-avtentikacijo.md)

---

## 9. Glavni uporabniški sklopi

Frontend vključuje več glavnih uporabniških sklopov:

| Sklop | Namen |
|---|---|
| Home page | začetni pregled, predstavitev sistema in iskanje |
| Search | iskanje po učnih poteh, modulih in učnih enotah |
| Detail strani | prikaz podrobnosti učne poti, modula ali učne enote |
| Questionnaire | izpolnjevanje samoocenjevalnega vprašalnika |
| Assessment result | prikaz rezultata in priporočene začetne pozicije |
| User progress | shranjene, priljubljene in dokončane vsebine |
| Auth | prijava, registracija in uporabniški profil |
| AI pomočnik | pomoč pri razumevanju vsebin in vprašanj |
| Glasovna pomoč | podpora pri bolj dostopnem izpolnjevanju vprašalnika |

Povezani dokumenti:

- [Uporabniški tokovi](../docs/07-uporabniski-tokovi.md)
- [Logika vprašalnika](../docs/14-logika-vprasalnika.md)
- [Zaslonski prikazi](../docs/08-zaslonski-prikazi.md)

---

## 10. Styling in vizualni sistem

Projekt uporablja Tailwind CSS in skupni vizualni slog aplikacije NIDiKo.

Glavne usmeritve:

- uporaba obstoječih barvnih skupin,
- odziven prikaz za desktop, tablet in mobile,
- ponovno uporabljanje skupnih komponent,
- enoten izgled detail strani,
- enoten izgled login in dashboard delov,
- izogibanje naključnim novim barvam ali nepovezanim stilom.

Podrobnejša pravila poimenovanja, komponent in pisanja kode so zapisana v:

- [Frontend Contribution Guide](CONTRIBUTING.md)
- [Pravila poimenovanja in pisanja kode](../docs/10-pravila-poimenovanja-in-pisanje-kode.md)

---

## 11. Build in preverjanje

Pred commitom je priporočljivo preveriti, ali se frontend uspešno zgradi.

Iz mape `frontend`:

```powershell
npm run build
```

Za razvojni zagon se uporablja:

```powershell
npm run dev
```

Če se uporablja Docker, so podrobna navodila zapisana v dokumentu:

- [Vzpostavitev razvojnega okolja](../docs/04-vzpostavitev-razvojnega-okolja.md)

---

## 12. Pravila za razvoj

Pri frontend razvoju upoštevamo:

- ne podvajamo obstoječe kode,
- API klici spadajo v `src/services`,
- backend tipi spadajo v `src/types`,
- route-level strani spadajo v `src/pages`,
- feature-specific komponente spadajo v `src/features/<feature>/components`,
- reusable komponente spadajo v `src/components`,
- ne spreminjamo obstoječih route URL-jev brez dogovora,
- ne spreminjamo obstoječega izgleda brez zahteve,
- pred commitom preverimo `npm run build`.

Podrobna pravila so zapisana v:

- [Frontend Contribution Guide](CONTRIBUTING.md)
- [Pravila poimenovanja in pisanja kode](../docs/10-pravila-poimenovanja-in-pisanje-kode.md)

---

## 13. Povezani dokumenti

- [Krovni README](../README.md)
- [Arhitektura sistema](../docs/03-arhitektura.md)
- [Tehnološki sklad](../docs/02-tehnoloski-sklad.md)
- [Vzpostavitev razvojnega okolja](../docs/04-vzpostavitev-razvojnega-okolja.md)
- [API endpointi](../docs/06-api-endpointi.md)
- [Uporabniški tokovi](../docs/07-uporabniski-tokovi.md)
- [Logika vprašalnika](../docs/14-logika-vprasalnika.md)
- [Zaslonski prikazi](../docs/08-zaslonski-prikazi.md)
- [Frontend Contribution Guide](CONTRIBUTING.md)
