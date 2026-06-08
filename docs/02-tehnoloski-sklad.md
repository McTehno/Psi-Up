# Tehnološki sklad

Ta dokument opisuje glavne tehnologije, ki se uporabljajo pri razvoju aplikacije **NIDiKo**.

Projekt je razdeljen na frontend, backend in podatkovno bazo. Za prijavo uporabnikov, AI pomočnika, glasovno pomoč, shranjevanje datotek ter lokalni zagon se uporabljajo tudi zunanje storitve in razvojna orodja.

---

## 1. Pregled tehnološkega sklada

| Del sistema | Tehnologije |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| Podatkovna baza | MongoDB Atlas |
| Avtentikacija | Supabase Auth, JWT |
| AI podpora | Microsoft Azure OpenAI |
| Glasovna pomoč | Microsoft Speech Service |
| Shranjevanje datotek | Azure Blob Storage |
| Zagon in namestitev | Docker, Docker Compose |
| Testiranje | Pytest |

---

## 2. Frontend


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



---

## 3. Backend

| Tehnologija | Verzija | Namen |
|---|---:|---|
| Python | 3.13 | Backend programski jezik |
| FastAPI | 0.136.1 | Izdelava REST API endpointov |
| Uvicorn | 0.46.0 | Zagon FastAPI aplikacije |
| Pydantic | 2.13.4 | Validacija requestov in response sheme |
| PyMongo | 4.17.0 | Povezava z MongoDB |
| email-validator | 2.3.0 | Validacija email naslovov v Pydantic shemah |
| Pytest | / | Testiranje backend logike |


---

## 4. Podatkovna baza


| Tehnologija | Verzija | Namen |
|---|---:|---|
| MongoDB Atlas | cloud storitev | Glavna podatkovna baza |
| MongoDB Compass | lokalno orodje | Pregled in uvoz podatkov v MongoDB |
| JSON | / | Začetni podatki za uvoz v MongoDB |

Več o tej arhitekturni odločitvi je zapisano v dokumentu:

- [ADR-002: Uporaba MongoDB za podatkovno bazo](adr/ADR-002-uporaba-mongodb-za-podatkovno-bazo.md)

---

## 5. Avtentikacija

Za prijavo in registracijo uporabnikov se uporablja **Supabase Auth**. Backend uporablja JWT za preverjanje prijavljenega uporabnika.

| Tehnologija | Verzija | Namen |
|---|---:|---|
| Supabase Auth | cloud storitev | Prijava in registracija uporabnikov |
| JWT | / | Preverjanje uporabniškega dostopa na backendu |

Frontend uporabnika prijavi prek Supabase. Backend nato na podlagi JWT tokena preveri, ali ima uporabnik dostop do zaščitenih podatkov, kot so shranjene vsebine, priljubljene vsebine, dokončane vsebine in trenutna pozicija.

Več o tej arhitekturni odločitvi je zapisano v dokumentu:

- [ADR-010: Uporaba Supabase Auth](adr\ADR-010-uporaba-supabase-auth-za-avtentikacijo.md)

---

## 6. AI pomočnik in glasovna pomoč

Aplikacija uporablja dodatne Microsoft Azure storitve za kontekstualnega AI pomočnika, glasovno pomoč in shranjevanje zvočnih datotek.

| Tehnologija | Verzija | Namen |
|---|---:|---|
| Microsoft Azure OpenAI | cloud storitev | Kontekstualni AI pomočnik |
| Microsoft Speech Service | cloud storitev | Glasovna pomoč in zvočni odgovori |
| Azure Blob Storage | cloud storitev | Shranjevanje zvočnih datotek oziroma povezanih datotek |

AI pomočnik uporabniku pomaga pri razumevanju vprašanj in učnih vsebin. Glasovna pomoč temelji na storitvi Microsoft Speech Service in je namenjena bolj dostopnemu izpolnjevanju vprašalnika. Zvočne datoteke oziroma povezane datoteke se shranjujejo z uporabo Azure Blob Storage.

Če bo za AI pomočnika pripravljen poseben ADR dokument, se lahko tukaj kasneje doda povezava do te arhitekturne odločitve.

---

## 7. Zagon in namestitev

Za lokalni razvoj in zagon aplikacije se uporablja Docker Compose.

| Tehnologija | Verzija | Namen |
|---|---:|---|
| Docker | / | Pakiranje frontenda in backenda v ločena okolja |
| Docker Compose | / | Skupni zagon frontenda in backenda |
| Dockerfile | / | Navodila za gradnjo posameznega dela aplikacije |

Projekt ima ločeni konfiguraciji za razvojni in produkcijski zagon:

```text
docker-compose.dev.yml
docker-compose.prod.yml
```

Podrobnejša navodila za zagon so zapisana v dokumentu:

- [Vzpostavitev razvojnega okolja](04-vzpostavitev-razvojnega-okolja.md)

Če bo za Docker oziroma Docker Compose pripravljen poseben ADR dokument, se lahko tukaj kasneje doda povezava do te arhitekturne odločitve.

---

## 8. Povezava med tehnologijami

Osnovna povezava med deli sistema je naslednja:

```text
Uporabnik
   ↓
Frontend: React + TypeScript + Vite
   ↓
Backend: FastAPI
   ↓
MongoDB Atlas
```

Dodatne zunanje storitve se uporabljajo za prijavo, AI pomočnika, glasovno pomoč in shranjevanje datotek:

```text
Supabase Auth
Microsoft Azure OpenAI
Microsoft Speech Service
Azure Blob Storage
```

---

## 9. Opombe

- Verzije tehnologij so zapisane glede na trenutno stanje projekta.
- Podrobnosti za zagon projekta so zapisane v dokumentu [Vzpostavitev razvojnega okolja](04-vzpostavitev-razvojnega-okolja.md).
- Arhitekturne odločitve so dokumentirane v mapi `docs/adr`.
