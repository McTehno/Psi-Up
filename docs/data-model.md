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
identifikator,
naslov,
kratek opis,
trajanje,
ključne besede,
področja oziroma domene,
seznam učnih enot,
vrstni red učnih enot,
informacijo, ali se učne enote izvajajo zaporedno ali vzporedno.
```
### Pravilo za zaporedne in vzporedne učne enote

Za zaporednost in vzporednost uporabljamo kombinacijo polj order in parallel_group.

order določa zaporedni korak.
parallel_group določa, ali več elementov znotraj istega koraka pripada isti vzporedni skupini.
Če je parallel_group enak null, se element obravnava kot samostojen korak.
Če imata dve ali več učnih enot enak order in enak parallel_group, se lahko izvajata vzporedno.
Primer strukture modula
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
      "is_required": true
    },
    {
      "learning_unit_id": "ue_002",
      "order": 2,
      "parallel_group": null,
      "is_required": true
    },
    {
      "learning_unit_id": "ue_003",
      "order": 3,
      "parallel_group": null,
      "is_required": true
    }
  ]
}
```
## 4. Učna pot

Učna pot predstavlja celotno priporočeno ali izbrano učno zaporedje.

Učna pot je sestavljena iz več modulov.

Učna pot vsebuje:
```text
identifikator,
naslov,
kratek opis,
trajanje,
ključne besede,
seznam modulov,
vrstni red modulov,
informacijo, ali se moduli izvajajo zaporedno ali vzporedno.
```
### Pravilo za zaporedne in vzporedne module

Za zaporednost in vzporednost uporabljamo kombinacijo polj order in parallel_group.

order določa zaporedni korak.
parallel_group določa, ali več modulov znotraj istega koraka pripada isti vzporedni skupini.
Če je parallel_group enak null, se modul obravnava kot samostojen korak.
Če imata dva ali več modulov enak order in enak parallel_group, se lahko izvajata vzporedno.
Primer strukture učne poti
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
      "is_required": true
    },
    {
      "module_id": "mod_004",
      "order": 2,
      "parallel_group": null,
      "is_required": true
    },
    {
      "module_id": "mod_005",
      "order": 3,
      "parallel_group": "excel_advanced_parallel",
      "is_required": true
    },
    {
      "module_id": "mod_006",
      "order": 3,
      "parallel_group": "excel_advanced_parallel",
      "is_required": false
    }
  ]
}

```
*V tem primeru sta mod_005 in mod_006 vzporedna, ker imata enak order in enak parallel_group.*

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