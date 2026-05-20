# ADR-002: Uporaba MongoDB za podatkovno bazo

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** potrebuje podatkovno bazo za shranjevanje učnih vsebin, uporabnikov in njihovega napredka.

Sistem trenutno uporablja naslednje glavne tipe podatkov:

- učne poti,
- module,
- učne enote,
- vprašanja za samooceno,
- uporabniške profile,
- napredek uporabnika.

Podatki v projektu imajo hierarhično in dokumentno strukturo. Na primer:

- učna pot vsebuje seznam modulov,
- modul vsebuje seznam učnih enot,
- učna enota vsebuje seznam spretnosti in vprašanj za samooceno,
- uporabniški napredek vsebuje več seznamov shranjenih, priljubljenih in dokončanih vsebin.

Zato je bilo smiselno uporabiti podatkovno bazo, ki dobro podpira dokumentni model in fleksibilno strukturo podatkov.

---

## Odločitev

Za podatkovno bazo se uporabi **MongoDB**.

MongoDB se uporablja za shranjevanje glavnih kolekcij:

```text
learning_units
modules
learning_paths
users
user_progress
```

Backend z MongoDB komunicira prek **PyMongo** knjižnice.

Povezava z bazo je ločena v datoteki:

```text
backend/app/database/mongodb.py
```

Dostop do posameznih kolekcij je organiziran v repository sloju:

```text
backend/app/repositories/
```

Primeri repository datotek:

```text
learning_unit_repository.py
module_repository.py
learning_path_repository.py
user_repository.py
user_progress/
```

---

## Posledice

### Prednosti

- MongoDB dobro podpira dokumentno strukturo podatkov.
- Učne poti, moduli in učne enote se lahko shranjujejo v obliki, ki je blizu JSON strukturi.
- Podatkovni model je fleksibilen in ga je mogoče razširjati brez zahtevnih migracij.
- Učna enota lahko neposredno vsebuje spretnosti in vprašanja za samooceno.
- `user_progress` lahko hrani več seznamov podatkov znotraj enega dokumenta.
- JSON datoteke iz razvojne faze je enostavno uvoziti v MongoDB Compass.
- MongoDB Atlas omogoča uporabo baze v oblaku.
- MongoDB Compass omogoča lažji pregled, uvoz in ročno preverjanje podatkov.

### Slabosti / omejitve

- MongoDB ne zagotavlja enakih relacijskih omejitev kot SQL baze.
- Backend mora sam preverjati, ali reference med podatki obstajajo.
- Če bo podatkovni model kasneje zahteval veliko kompleksnih relacij, bo potrebna dodatna previdnost pri načrtovanju poizvedb.

---

## Alternativne možnosti

### PostgreSQL

PostgreSQL bi bil primeren za strogo relacijski podatkovni model. Omogoča močne relacije, tuje ključe in strukturirane poizvedbe. Vendar bi bil za trenutno dokumentno strukturo učnih poti, modulov, učnih enot in vprašanj manj neposreden, saj bi bilo treba podatke razdeliti v več tabel.

### MySQL

MySQL bi bil prav tako primeren za relacijski model, vendar ima podobne omejitve kot PostgreSQL glede fleksibilnosti dokumentnih struktur. Za trenutno fazo projekta bi zahteval več dodatnega modeliranja relacij.

### Shranjevanje v JSON datotekah

JSON datoteke so bile primerne za začetno načrtovanje podatkovnega modela in pripravo testnih podatkov. Niso pa primerne kot glavna podatkovna baza, ker ne omogočajo varnega večuporabniškega dostopa, iskanja, posodabljanja in dolgoročnega shranjevanja podatkov.

---

## Končna odločitev

Za podatkovno bazo projekta Psi-Up se uporablja **MongoDB**, ker se dobro ujema z dokumentno strukturo podatkov in omogoča fleksibilno shranjevanje učnih poti, modulov, učnih enot ter napredka uporabnika.

MongoDB je primeren za trenutno fazo projekta, ker omogoča enostaven uvoz JSON podatkov, pregled prek MongoDB Compass in povezavo z backendom prek PyMongo.

Ta odločitev ostane veljavna za trenutno verzijo sistema.