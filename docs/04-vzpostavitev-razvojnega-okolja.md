# Vzpostavitev razvojnega okolja

Ta dokument opisuje, kako pripraviti in lokalno zagnati razvojno okolje za projekt **NIDiKo**.

Projekt je sestavljen iz treh glavnih delov:

- **frontend** – uporabniški vmesnik v Reactu,
- **backend** – REST API v FastAPI,
- **MongoDB Atlas** – podatkovna baza v oblaku.

Za zagon projekta je priporočena uporaba **Docker Compose**, ker omogoča enostaven zagon frontenda in backenda iz enega mesta.

---

## 1. Predpogoji

Pred začetkom naj bodo na računalniku nameščena naslednja orodja:

- Git,
- Docker Desktop,
- Node.js,
- Python,
- Visual Studio Code ali drug urejevalnik kode.

Za priporočeni zagon zadostujeta Git in Docker Desktop. Node.js in Python sta potrebna predvsem za ročni zagon brez Dockerja.

---

## 2. Kloniranje repozitorija

Repozitorij najprej kloniramo lokalno:

```bash
git clone https://github.com/McTehno/NIDiKo.git
cd NIDiKo
```

---

## 3. Okoljske spremenljivke

Projekt uporablja ločene okoljske spremenljivke za backend in frontend.

Pred prvim zagonom pripravi okoljske datoteke na podlagi primerov:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Nato dopolni vrednosti v `.env` datotekah.

---

## 4. Backend okoljske spremenljivke

V mapi `backend` ustvarimo datoteko `.env` na podlagi `backend/.env.example`.

## 5. Frontend okoljske spremenljivke

V mapi `frontend` ustvarimo datoteko `.env` na podlagi `frontend/.env.example`.

Za lokalni razvoj je običajna vrednost backend API-ja:

```env
VITE_API_BASE_URL=http://localhost:8000
```
---

## 6. Priporočeni zagon z Docker Compose

Za razvojni zagon se uporablja datoteka:

```text
docker-compose.dev.yml
```

Projekt zaženemo iz korenske mape projekta:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Po uspešnem zagonu so deli aplikacije dostopni na:

| Del aplikacije | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8000` |
| Swagger dokumentacija API-ja | `http://localhost:8000/docs` |

Razvojni Docker zagon omogoča hitrejše delo, ker uporablja live reload za backend in frontend.

---

## 7. Ustavitev Docker okolja

Okolje ustavimo z ukazom:

```bash
docker compose -f docker-compose.dev.yml down
```

Če želimo ponovno zgraditi slike, uporabimo:

```bash
docker compose -f docker-compose.dev.yml up --build
```
---

## 8. Ročni zagon brez Dockerja

Če Docker ni na voljo, lahko frontend in backend zaženemo ločeno.

### 8.1 Backend

Najprej se premaknemo v mapo `backend`:

```bash
cd backend
```

Ustvarimo virtualno okolje:

```bash
python -m venv venv
```

Aktiviramo virtualno okolje.

Na Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Namestimo odvisnosti:

```bash
pip install -r requirements.txt
```

Zaženemo backend:

```bash
uvicorn app.main:app --reload
```

Backend je nato dostopen na:

```text
http://localhost:8000
```

API dokumentacija je dostopna na:

```text
http://localhost:8000/docs
```

### 8.2 Frontend

V drugem terminalu se premaknemo v mapo `frontend`:

```bash
cd frontend
```

Namestimo odvisnosti:

```bash
npm install
```

Zaženemo frontend:

```bash
npm run dev
```

Frontend je nato dostopen na:

```text
http://localhost:5173
```

---

## 9. Preverjanje delovanja

Po zagonu preverimo:

- ali se frontend odpre v brskalniku,
- ali backend API deluje na `http://localhost:8000`,
- ali se odpre Swagger dokumentacija na `http://localhost:8000/docs`,
- ali frontend uspešno pridobi podatke iz backenda,
- ali prijava in zaščiteni uporabniški podatki delujejo,
- ali so okoljske spremenljivke pravilno nastavljene.

---

## 10. Pogoste težave

### Frontend se ne poveže z backendom

Preverimo vrednost:

```env
VITE_API_BASE_URL=
```

Za lokalni razvoj mora kazati na backend, običajno:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend se ne poveže z MongoDB

Preverimo:

```env
MONGODB_URI=
DATABASE_NAME=
```

Povezava mora biti pravilna, uporabnik baze pa mora imeti ustrezna dovoljenja.

### Prijava ne deluje pravilno

Preverimo Supabase nastavitve na frontendu in backendu:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
```

Frontend uporablja Supabase podatke za prijavo, backend pa JWT skrivnost za preverjanje tokena.

### Glasovna pomoč ali AI pomočnik ne deluje

Preverimo Azure nastavitve:

```env
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
AZURE_STORAGE_CONNECTION_STRING=
```

Če katera od teh vrednosti manjka, funkcionalnosti, povezane z AI pomočnikom ali glasovno pomočjo, ne bodo delovale pravilno.


---

## 11. Povzetek

Za običajen razvoj je priporočeno uporabiti Docker Compose, ker z enim ukazom zažene frontend in backend. Pred zagonom je treba pripraviti datoteki `backend/.env` in `frontend/.env`, ki temeljita na `.env.example` predlogah.

Če Docker ni na voljo, se lahko backend in frontend zaženeta ločeno, vendar je treba ročno namestiti Python in Node.js odvisnosti.
