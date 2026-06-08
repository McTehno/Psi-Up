# ADR-010: Uporaba Supabase Auth za avtentikacijo

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo potrebuje sistem avtentikacije, ki omogoča prijavo uporabnikov in zaščito uporabniško specifičnih funkcionalnosti.

Nekateri deli aplikacije so javno dostopni, na primer pregled učnih poti, modulov, učnih enot, iskanje in osnovni vprašalniki. Drugi deli aplikacije pa so vezani na prijavljenega uporabnika, na primer:

- uporabniški profil,
- shranjene vsebine,
- priljubljene vsebine,
- dokončane vsebine,
- trenutna pozicija uporabnika,
- dolgoročno sledenje napredku.

Za te funkcionalnosti mora backend zanesljivo vedeti, kateri uporabnik izvaja zahtevo. Hkrati aplikacija ne želi sama razvijati celotnega sistema za registracijo, prijavo, varno hranjenje gesel in upravljanje sej.

Zato je bila sprejeta odločitev, da se za zunanji auth sistem uporabi **Supabase Auth**, backend pa uporablja JWT token za preverjanje prijavljenega uporabnika.

## Odločitev

Za avtentikacijo uporabnikov v projektu NIDiKo uporabljamo **Supabase Auth**.

Supabase Auth je odgovoren za:

- registracijo uporabnika,
- prijavo uporabnika,
- ustvarjanje in upravljanje auth seje,
- izdajo JWT tokena,
- identifikacijo zunanjega auth uporabnika.

Backend uporablja JWT token, ki ga frontend pošlje pri zaščitenih zahtevah.

Zaščiteni backend endpointi preverijo token in iz njega pridobijo zunanji `auth_user_id`. Ta se nato poveže z lokalnim uporabniškim profilom v aplikacijski bazi.

Lokalni uporabnik v MongoDB ostaja ločen od Supabase auth uporabnika.

To pomeni, da imamo dve ravni uporabnika:

```text
Supabase uporabnik → zunanji auth_user_id
NIDiKo uporabnik → lokalni user_id v MongoDB
```

Zunanji `auth_user_id` služi za povezavo z avtentikacijskim sistemom, lokalni `user_id` pa se uporablja za aplikacijske podatke, kot so profil in napredek uporabnika.

## Posledice

### Prednosti

- Aplikaciji ni treba sama razvijati sistema za varno prijavo in registracijo.
- Gesla in auth seje upravlja zunanji sistem, kar zmanjša varnostno tveganje.
- Backend lahko prek JWT tokena preveri, kateri uporabnik izvaja zaščiteno zahtevo.
- Lokalni uporabniški profil ostane ločen od zunanjega auth sistema.
- User progress se lahko varno poveže z lokalnim uporabnikom.
- Rešitev omogoča kasnejšo razširitev prijave, na primer z drugimi ponudniki prijave, če bo to potrebno.
- Frontend in backend imata jasno odgovornost: frontend upravlja prijavno sejo, backend pa preverja dostop do zaščitenih podatkov.

### Slabosti / omejitve

- Aplikacija je odvisna od zunanjega auth ponudnika.
- Backend mora pravilno preverjati JWT token pri vseh zaščitenih endpointih.
- Potrebno je vzdrževati povezavo med zunanjim `auth_user_id` in lokalnim `user_id`.

## Alternativne možnosti

### Lasten auth sistem

Ena možnost bi bila, da bi aplikacija sama implementirala registracijo, prijavo, hashiranje gesel s soljo, upravljanje sej in obnovitev gesla.

Ta možnost ni bila izbrana, ker bi povečala kompleksnost projekta in varnostno odgovornost ekipe.

### Auth samo na frontendu

Druga možnost bi bila, da bi frontend preverjal prijavo, backend pa ne bi preverjal JWT tokena.

Ta možnost ni bila izbrana, ker backend ne bi mogel zanesljivo zaščititi uporabniških podatkov. Za zaščitene funkcionalnosti mora backend sam preveriti, kdo izvaja zahtevo.

### Uporaba drugega zunanjega auth ponudnika

Možna bi bila tudi uporaba drugega ponudnika, na primer Firebase Auth ali Auth0.

Supabase Auth je bil izbran, ker se dobro ujema z načinom razvoja aplikacije, omogoča uporabo JWT tokenov in je dovolj enostaven za integracijo v trenutni projekt.

## Pravila za implementacijo

- Zaščiteni endpointi morajo preveriti JWT token.
- JWT token se pošilja iz frontenda v `Authorization` headerju.
- Backend iz tokena pridobi zunanji `auth_user_id`.
- Lokalni uporabnik se poišče v MongoDB na podlagi `auth_user_id`.
- Uporabnik lahko dostopa samo do svojih zaščitenih podatkov.
- `auth_user_id` in lokalni `user_id` se ne smeta zamenjevati.
- Skrivnosti, kot je JWT secret, se hranijo v `.env` datoteki.
- Dejanske `.env` vrednosti se ne commitajo v repozitorij.
- V repozitoriju je dovoljena samo `.env.example` brez dejanskih skrivnosti.

## Povezani deli sistema

Ta odločitev vpliva predvsem na:

- `app/core/security.py`
- `app/api/users.py`
- `app/api/user_progress.py`
- `app/repositories/user_repository.py`
- `app/repositories/user_progress/`
- `app/services/users/user_service.py`
- `app/services/user_progress/`
- frontend login flow
- frontend user progress akcije

## Povzetek

Za avtentikacijo v projektu NIDiKo uporabljamo **Supabase Auth**.

Supabase upravlja prijavo in izdajo JWT tokena, backend pa token preveri pri zaščitenih zahtevah. Lokalni uporabniški profil in napredek uporabnika sta shranjena v MongoDB ter povezana z zunanjim `auth_user_id`.

S tem aplikacija loči avtentikacijo od aplikacijskih uporabniških podatkov, kar poenostavi razvoj in izboljša varnost sistema.
