# ADR-003: Plastna struktura backenda

## Status

**Sprejeto**

---

## Kontekst

Backend projekta **Psi-Up** vsebuje več različnih vrst logike:

- API endpoint-e za komunikacijo s frontend aplikacijo,
- poslovno logiko za učne poti, module, učne enote in vprašalnike,
- dostop do MongoDB podatkovne baze,
- validacijo vhodnih in izhodnih podatkov,
- obdelavo odgovorov iz vprašalnika,
- shranjevanje napredka uporabnika.

Če bi bila vsa logika zapisana neposredno v API endpointih, bi backend hitro postal nepregleden in težje vzdrževan. Prav tako bi bilo težje testirati posamezne dele sistema in kasneje dodajati nove funkcionalnosti.

Zato je bilo treba določiti jasno strukturo backenda, kjer ima vsak sloj svojo odgovornost.

---

## Odločitev

Backend je organiziran v plastno strukturo.

Glavni sloji so:

```text
api
services
repositories
schemas
database
```

Struktura se nahaja v mapi:

```text
backend/app/
```

### API sloj

API sloj se nahaja v:

```text
backend/app/api/
```

Ta sloj je odgovoren za:

- definiranje endpointov,
- sprejem requestov iz frontenda,
- klic ustreznega service sloja,
- vračanje response podatkov,
- osnovno obravnavo napak.

Primeri API datotek:

```text
learning_units.py
modules.py
learning_paths.py
questionnaires.py
assessments.py
users.py
user_progress.py
search.py
```

### Service sloj

Service sloj se nahaja v:

```text
backend/app/services/
```

Ta sloj vsebuje poslovno logiko aplikacije.

Primeri:

- določanje dostopnih modulov glede na predpogoje,
- določanje dostopnih učnih enot glede na predpogoje,
- generiranje vprašalnikov,
- obdelava odgovorov iz vprašalnika,
- določanje začetne točke uporabnika,
- shranjevanje napredka uporabnika,
- validacija podatkov pred zapisovanjem.

### Repository sloj

Repository sloj se nahaja v:

```text
backend/app/repositories/
```

Ta sloj je odgovoren za dostop do MongoDB kolekcij.

Repository sloj omogoča, da service sloj ne dela neposredno z MongoDB poizvedbami, ampak uporablja metode, kot so:

- `get_learning_unit_by_id`,
- `get_module_by_id`,
- `get_learning_path_by_id`,
- `search_learning_units`,
- `get_progress_by_user_id`.

### Schema sloj

Schema sloj se nahaja v:

```text
backend/app/schemas/
```

Ta sloj vsebuje Pydantic sheme za:

- request body,
- response modele,
- validacijo podatkov,
- enotno strukturo podatkov med backendom in frontend aplikacijo.

### Database sloj

Database sloj se nahaja v:

```text
backend/app/database/
```

Ta sloj vsebuje povezavo z MongoDB podatkovno bazo.

Trenutno je povezava definirana v:

```text
backend/app/database/mongodb.py
```

---

## Posledice

### Prednosti

- Koda je bolj pregledna in lažje razumljiva.
- Vsak sloj ima jasno odgovornost.
- API endpointi ostanejo krajši in ne vsebujejo neposredne poslovne logike.
- Poslovna logika je ločena od dostopa do baze.
- Repository sloj omogoča lažje spreminjanje načina dostopa do podatkov.
- Pydantic sheme omogočajo bolj jasno komunikacijo med frontend in backend delom.
- Struktura omogoča lažje dodajanje novih funkcionalnosti.
- Testiranje posameznih delov sistema je lažje, ker so odgovornosti ločene.

### Slabosti / omejitve

- Za manjše funkcionalnosti je potrebnih več datotek.
- Ekipa mora razumeti, v kateri sloj spada določena logika.
- Če se struktura ne uporablja dosledno, lahko pride do podvajanja kode.
- Dependency povezave med repository, service in API slojem lahko postanejo daljše.

---

## Alternativne možnosti

### Vsa logika neposredno v API endpointih

Ta možnost bi bila hitrejša na začetku, vendar bi backend postal težje vzdrževan. API datoteke bi vsebovale preveč logike, MongoDB poizvedb in validacije.

### Ločitev samo na API in database sloj

Ta možnost bi bila enostavnejša, vendar ne bi dovolj jasno ločila poslovne logike od dostopa do podatkov.

### Uporaba več ločenih mikroservisov

Mikroservisna arhitektura bi bila za trenutno fazo projekta preveč kompleksna. Sistem trenutno še ne potrebuje ločenih storitev za učne vsebine, uporabnike, assessment in priporočila.

---

## Končna odločitev

Backend projekta Psi-Up uporablja plastno strukturo z ločenimi sloji:

- `api`,
- `services`,
- `repositories`,
- `schemas`,
- `database`.

Ta odločitev omogoča bolj pregledno organizacijo kode, lažje vzdrževanje in boljšo pripravljenost za kasnejše razširitve sistema.

Ta odločitev ostane veljavna za trenutno verzijo sistema.