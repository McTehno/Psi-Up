# Podatkovni model

Ta dokument opisuje osnovne entitete podatkovnega modela za aplikacijo za priporočanje in prikaz učnih poti, modulov in učnih enot.

Podatki bodo shranjeni v MongoDB, v JSON obliki.

---

## 1. Glavne entitete

V sistemu bomo imeli naslednje glavne entitete:

1. Učna enota
2. Modul
3. Učna pot
4. Uporabnik
5. Napredek uporabnika

Po novi podatkovni strukturi sistem uporablja pet glavnih kolekcij:

- `learning_units`
- `modules`
- `learning_paths`
- `users`
- `user_progress`

Kolekciji `competencies` in `competency_groups` se ne uporabljata več kot glavni entiteti, ker so kompetence zapisane znotraj učnih enot, začetek aplikacije pa temelji na iskanju.

---

## 2. Učna enota

Učna enota predstavlja najmanjši del učne vsebine.

Učna enota vsebuje:
- identifikator,
- naslov,
- kratek opis,
- trajanje,
- ključne besede,
- kompetence oziroma spretnosti,
- vprašanja za samooceno.

Kompetence niso več shranjene kot posebna glavna entiteta, ampak so del učne enote.

### Primer strukture učne enote

```json
{
  "id": "ue_001",
  "title": "Osnovni pojmi umetne inteligence",
  "short_description": "Uvod v osnovne pojme umetne inteligence.",
  "duration_min": 30,
  "keywords": ["umetna inteligenca", "UI", "osnovni pojmi"],
  "skills": [
    "Razumevanje koncepta UI",
    "Prepoznavanje primerov UI v vsakdanjem življenju"
  ],
  "self_assessment_questions": [
    {
      "id": "q_ue_001_001",
      "question": "Razumem osnovni koncept umetne inteligence.",
      "type": "yes_no",
      "related_skill": "Razumevanje koncepta UI"
    },
    {
      "id": "q_ue_001_002",
      "question": "Znam prepoznati primere umetne inteligence v vsakdanjem življenju.",
      "type": "yes_no",
      "related_skill": "Prepoznavanje primerov UI v vsakdanjem življenju"
    }
  ]
}

```

## 3. Modul

Modul predstavlja večjo enoto učne vsebine.

Modul je sestavljen iz več učnih enot.

Modul vsebuje:
```text
- identifikator,
- naslov,
- kratek opis,
- trajanje,
- ključne besede,
- področja oziroma domene,
- seznam učnih enot,
- vrstni red učnih enot,
- informacijo, ali se učne enote izvajajo zaporedno ali vzporedno,
- predpogoje za posamezne učne enote.
```
### Pravilo za zaporedne, vzporedne učne enote in predpogoje

Za dejansko logiko vrstnega reda, dostopnosti in napredovanja uporabljamo polje `prerequisites`.

- `prerequisites` vsebuje seznam ID-jev učnih enot, ki morajo biti zaključene pred začetkom trenutne učne enote.
- Če je `prerequisites` prazen seznam, učna enota nima posebnih predpogojev in jo lahko uporabnik začne brez predhodno zaključenih učnih enot.
- Dejanski vrstni red izvajanja se določa na podlagi predpogojev.
- Če imata dve ali več učnih enot enake predpogoje, se lahko izvajata vzporedno.

Polji `order` in `parallel_group` se uporabljata kot pomoč pri trenutnem vizualnem prikazu:

- `order` pomaga določiti osnovni vrstni red prikaza na uporabniškem vmesniku.
- `parallel_group` pomaga označiti skupino učnih enot, ki se lahko vizualno prikažejo kot vzporedne.
- `order` ni glavni vir resnice za logiko napredovanja.
- Glavni vir resnice za logiko napredovanja je `prerequisites`.

### Primer strukture modula
```json
{
  "id": "mod_001",
  "title": "Razumevanje umetne inteligence",
  "short_description": "Modul predstavlja osnovne pojme, primere in delovanje umetne inteligence.",
  "duration_min": 105,
  "keywords": ["umetna inteligenca", "UI", "GenUI", "podatki"],
  "domains": ["Umetna inteligenca"],
  "learning_units": [
    {
      "learning_unit_id": "ue_001",
      "order": 1,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": []
    },
    {
      "learning_unit_id": "ue_002",
      "order": 2,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": ["ue_001"]
    },
    {
      "learning_unit_id": "ue_003",
      "order": 3,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": ["ue_001", "ue_002"]
    }
  ]
}
```
## 4. Učna pot

Učna pot predstavlja celotno priporočeno ali izbrano učno zaporedje.

Učna pot je sestavljena iz več modulov.

Učna pot vsebuje:
```text
- identifikator,
- naslov,
- kratek opis,
- trajanje,
- ključne besede,
- seznam modulov,
- vrstni red modulov,
- informacijo, ali se moduli izvajajo zaporedno ali vzporedno,
- predpogoje za posamezne module.
```
### Pravilo za zaporedne, vzporedne module in predpogoje

Za dejansko logiko vrstnega reda, dostopnosti in napredovanja uporabljamo polje `prerequisites`.

- `prerequisites` vsebuje seznam ID-jev modulov, ki morajo biti zaključeni pred začetkom trenutnega modula.
- Če je `prerequisites` prazen seznam, modul nima posebnih predpogojev in ga lahko uporabnik začne brez predhodno zaključenih modulov.
- Dejanski vrstni red izvajanja se določa na podlagi predpogojev.
- Če imata dva ali več modulov enake predpogoje, se lahko izvajata vzporedno.

Polji `order` in `parallel_group` se uporabljata kot pomoč pri trenutnem vizualnem prikazu:

- `order` pomaga določiti osnovni vrstni red prikaza na uporabniškem vmesniku.
- `parallel_group` pomaga označiti skupino modulov, ki se lahko vizualno prikažejo kot vzporedni.
- `order` ni glavni vir resnice za logiko napredovanja.
- Glavni vir resnice za logiko napredovanja je `prerequisites`.

### Primer strukture učne poti
```json
{
  "id": "up_002",
  "title": "Ustvarjanje vrtilnih tabel v Excel",
  "short_description": "Učna pot za pripravo podatkov in uporabo vrtilnih tabel v Excelu.",
  "duration_min": 335,
  "keywords": ["Excel", "vrtilne tabele", "podatki", "analiza"],
  "modules": [
    {
      "module_id": "mod_003",
      "order": 1,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": []
    },
    {
      "module_id": "mod_004",
      "order": 2,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": ["mod_003"]
    },
    {
      "module_id": "mod_005",
      "order": 3,
      "parallel_group": "excel_advanced_parallel",
      "is_required": true,
      "prerequisites": ["mod_003", "mod_004"]
    },
    {
      "module_id": "mod_006",
      "order": 3,
      "parallel_group": "excel_advanced_parallel",
      "is_required": false,
      "prerequisites": ["mod_003", "mod_004"]
    }
  ]
}

```
*V tem primeru sta `mod_005` in `mod_006` vzporedna, ker imata enak `order` in enak `parallel_group`. Oba imata tudi enake predpogoje, zato se lahko začneta šele po zaključenih modulih `mod_003` in `mod_004`.*

### Razlika med `order`, `parallel_group` in `prerequisites`

- `prerequisites` določa dejansko logiko dostopnosti, vrstnega reda in napredovanja.
- `order` se uporablja kot pomoč pri trenutnem vizualnem prikazu.
- `parallel_group` se uporablja kot pomoč za vizualno označevanje vzporednih elementov.
- Če pride do razlike med `order` in `prerequisites`, ima prednost `prerequisites`.

Primer:

```json
{
  "module_id": "mod_005",
  "order": 3,
  "parallel_group": "excel_advanced_parallel",
  "is_required": true,
  "prerequisites": ["mod_003", "mod_004"]
}
```
To pomeni:

- mod_005 se vizualno prikaže v tretjem koraku,
- mod_005 je del vzporedne skupine excel_advanced_parallel,
- mod_005 se dejansko lahko začne šele po zaključenih modulih mod_003 in mod_004.

Zaključek: **dejanska logika po predpogojih**, `order` pa kot pomoč za prikaz.

## 5. Uporabnik

Uporabnik predstavlja osebo, ki uporablja aplikacijo.

Uporabnik se hrani v podatkovni bazi.

Uporabnik vsebuje:

```text
identifikator,
ime,
email,
datum ustvarjanja profila.
```
Primer strukture uporabnika

```json
{
  "id": "user_001",
  "name": "Testni uporabnik",
  "email": "test@example.com",
  "created_at": "2026-05-18T00:00:00Z"
}
```
## 6. Napredek uporabnika

Napredek uporabnika hrani informacije o tem, kaj je uporabnik shranil, označil kot priljubljeno, dokončal in kje se trenutno nahaja.

Napredek uporabnika vsebuje:
```text
identifikator,
identifikator uporabnika,
shranjene učne poti,
shranjene module,
shranjene učne enote,
priljubljene učne poti,
priljubljene module,
priljubljene učne enote,
dokončane učne poti,
dokončane module,
dokončane učne enote,
trenutno pozicijo uporabnika.
```

Primer strukture napredka uporabnika

```json
{
  "id": "progress_001",
  "user_id": "user_001",
  "saved_learning_paths": ["up_001"],
  "saved_modules": ["mod_001"],
  "saved_learning_units": ["ue_001"],
  "favorite_learning_paths": ["up_001"],
  "favorite_modules": [],
  "favorite_learning_units": ["ue_001"],
  "completed_learning_units": ["ue_001"],
  "completed_modules": [],
  "completed_learning_paths": [],
  "current_positions": [
    {
      "learning_path_id": "up_001",
      "current_module_id": "mod_001",
      "current_learning_unit_id": "ue_002"
    }
  ]
}

```