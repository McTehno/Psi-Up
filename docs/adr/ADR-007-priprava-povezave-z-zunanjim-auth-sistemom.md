# ADR-007: Priprava povezave z zunanjim auth sistemom

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** potrebuje uporabniške račune, ker mora sistem za vsakega uporabnika hraniti:

- uporabniški profil,
- shranjene vsebine,
- priljubljene vsebine,
- dokončane vsebine,
- trenutno pozicijo uporabnika,
- napredek skozi učne poti, module in učne enote.

Prijava in registracija uporabnikov sta varnostno občutljiv del sistema. Backend zato ne sme neposredno hraniti gesel uporabnikov, saj bi to povečalo odgovornost aplikacije za varno hranjenje, preverjanje in obnovo gesel.

Zato je bilo smiselno predvideti uporabo zunanjega auth sistema, na primer **Auth0**.

---

## Odločitev

Registracija in prijava uporabnika se ne izvajata neposredno v backendu aplikacije Psi-Up.

Za prijavo in registracijo je predviden zunanji auth sistem, na primer:

```text
Auth0
```

Backend hrani samo lokalni aplikacijski profil uporabnika.

Lokalni uporabnik vsebuje:

```text
_id
auth_provider
auth_user_id
name
email
created_at
updated_at
```

Primer:

```json
{
  "_id": "user_auth0_test_001",
  "auth_provider": "auth0",
  "auth_user_id": "auth0|test_001",
  "name": "Testni uporabnik Auth0",
  "email": "test.auth0@example.com",
  "created_at": "2026-05-19T15:03:49.952505Z",
  "updated_at": "2026-05-19T15:03:49.952505Z"
}
```

Polje `auth_user_id` predstavlja povezavo med zunanjim auth sistemom in lokalnim uporabnikom v naši bazi.

---

## Predviden flow

Predviden flow prijave je:

1. Uporabnik se prijavi ali registrira na frontendu prek zunanjega auth sistema.
2. Frontend prejme podatke o prijavljenem uporabniku in auth token.
3. Frontend pokliče backend endpoint:

```text
POST /api/users/profile
```

4. Backend preveri, ali uporabnik z danim `auth_user_id` že obstaja.
5. Če uporabnik obstaja, backend vrne obstoječi lokalni profil.
6. Če uporabnik ne obstaja, backend ustvari nov lokalni profil.
7. Backend ob novem uporabniku ustvari tudi začetni `user_progress`.
8. Geslo ostane v zunanjem auth sistemu in se ne hrani v naši bazi.

---

## Trenutno implementirano

Trenutno je implementirana priprava za povezavo z zunanjim auth sistemom.

Implementirano je:

- lokalni uporabniški profil,
- polje `auth_provider`,
- polje `auth_user_id`,
- pridobivanje uporabnika po lokalnem `_id`,
- pridobivanje uporabnika po `auth_user_id`,
- endpoint za ustvarjanje ali vračanje profila,
- ustvarjanje začetnega `user_progress` zapisa ob novem uporabniku.

Uporabljeni endpointi:

| Metoda | Endpoint | Namen |
|---|---|---|
| POST | `/api/users/profile` | Vrne ali ustvari lokalni uporabniški profil |
| GET | `/api/users/{user_id}` | Pridobi uporabnika po lokalnem ID |
| GET | `/api/users/by-auth/{auth_user_id}` | Pridobi uporabnika po zunanjem auth ID |
| PUT | `/api/users/{user_id}` | Posodobi lokalni uporabniški profil |

---

## Še ni implementirano

Prava varnostna integracija z Auth0 še ni implementirana.

Še ni implementirano:

- konfiguracija Auth0 tenant-a,
- preverjanje Auth0 JWT tokena na backendu,
- zaščita endpointov glede na prijavljenega uporabnika,
- preverjanje, da lahko uporabnik ureja samo svoj `user_progress`,
- uporaba auth podatkov iz tokena namesto ročno poslanega `user_id`.

Trenutno se `auth_user_id` pri testiranju pošilja ročno prek Postmana. To simulira podatke, ki jih bo kasneje frontend prejel iz Auth0.

---

## Posledice

### Prednosti

- Backend ne hrani uporabniških gesel.
- Prijava in registracija sta ločeni od poslovne logike aplikacije.
- Sistem je pripravljen na integracijo z Auth0 ali podobnim auth sistemom.
- Lokalni uporabniški profil ostane povezan z zunanjim auth uporabnikom prek `auth_user_id`.
- Ob ustvarjanju lokalnega uporabnika se ustvari tudi začetni `user_progress`.
- Kasneje bo mogoče zaščititi endpoint-e na podlagi Auth0 tokena.

### Slabosti / omejitve

- Sistem trenutno še ni auth zaščiten.
- Backend trenutno še ne preverja, ali request res prihaja od prijavljenega uporabnika.
- Trenutno je mogoče v Postmanu ročno poslati `user_id`, zato prava varnost še ni vzpostavljena.
- Za popolno integracijo bo treba dodati preverjanje JWT tokena in pravila dostopa.
- Ekipa bo morala uskladiti frontend Auth0 flow z backend endpointom `/api/users/profile`.

---

## Alternativne možnosti

### Lastna prijava in registracija

Backend bi lahko sam upravljal registracijo, prijavo in gesla. To bi pomenilo več nadzora, vendar tudi veliko več varnostne odgovornosti.

Potrebno bi bilo implementirati:

- hranjenje gesel,
- hashiranje gesel,
- resetiranje gesla,
- email verifikacijo,
- varnostne mehanizme,
- zaščito pred napadi.

Za trenutno verzijo projekta to ni smiselno.

### Firebase Authentication

Firebase Authentication je alternativa Auth0. Omogoča prijavo, registracijo in upravljanje uporabnikov. Lahko bi bil primeren, vendar se je ekipa odločila pripraviti strukturo bolj splošno prek `auth_provider` in `auth_user_id`, da sistem ni vezan samo na eno rešitev.

### Supabase Auth

Supabase Auth je prav tako možna alternativa. Podobno kot Firebase ponuja auth sistem, vendar bi zahteval drugačno integracijo. Trenutna struktura še vedno omogoča kasnejšo uporabo Supabase Auth, ker lokalni profil ni vezan izključno na Auth0.

---

## Končna odločitev

Backend aplikacije Psi-Up ne bo neposredno upravljal gesel uporabnikov.

Za prijavo in registracijo je predvidena uporaba zunanjega auth sistema, na primer Auth0. Backend hrani samo lokalni aplikacijski profil in povezavo z zunanjim uporabnikom prek `auth_provider` in `auth_user_id`.

Ta odločitev omogoča bolj varno in fleksibilno upravljanje uporabnikov ter pripravi sistem na kasnejšo polno Auth0 integracijo.

Ta odločitev ostane veljavna za trenutno verzijo sistema.