# ADR-006: Uporaba user_progress za napredek uporabnika

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** mora za vsakega uporabnika hraniti informacije o njegovem napredku v aplikaciji.

Uporabnik lahko:

- shrani učno pot, modul ali učno enoto,
- označi vsebino kot priljubljeno,
- dokonča učno pot, modul ali učno enoto,
- nadaljuje učenje tam, kjer je nazadnje ostal.

Osnovni uporabniški profil ne sme vsebovati vseh teh podatkov, ker ima drugačen namen. Profil uporabnika hrani predvsem identifikacijske podatke, kot so:

- lokalni ID uporabnika,
- zunanji auth ID,
- ime,
- email.

Napredek uporabnika pa predstavlja stanje uporabnika v učnem sistemu. Zato je bilo smiselno napredek hraniti ločeno od osnovnega uporabniškega profila.

---

## Odločitev

Za shranjevanje napredka uporabnika se uporablja ločena MongoDB kolekcija:

```text
user_progress
```

Vsak uporabnik ima svoj dokument napredka, ki je povezan z uporabnikom prek polja:

```text
user_id
```

Primer dokumenta:

```json
{
  "_id": "progress_user_001",
  "user_id": "user_001",
  "saved_learning_paths": ["up_002"],
  "saved_modules": ["mod_003"],
  "saved_learning_units": ["ue_005"],
  "favorite_learning_paths": ["up_002"],
  "favorite_modules": [],
  "favorite_learning_units": ["ue_006"],
  "completed_learning_paths": [],
  "completed_modules": ["mod_003"],
  "completed_learning_units": ["ue_005", "ue_006", "ue_007"],
  "current_positions": [
    {
      "learning_path_id": "up_002",
      "current_module_id": "mod_004",
      "current_learning_unit_id": "ue_008"
    }
  ]
}
```

---

## Kaj hrani user_progress

### Shranjene vsebine

Shranjene vsebine uporabniku omogočajo, da si označi vsebine za kasnejši ogled.

Uporabljena polja:

```text
saved_learning_paths
saved_modules
saved_learning_units
```

### Priljubljene vsebine

Priljubljene vsebine označujejo vsebine, ki so uporabniku posebej pomembne ali zanimive.

Uporabljena polja:

```text
favorite_learning_paths
favorite_modules
favorite_learning_units
```

### Dokončane vsebine

Dokončane vsebine označujejo, kaj je uporabnik že opravil.

Uporabljena polja:

```text
completed_learning_paths
completed_modules
completed_learning_units
```

Ta polja se uporabljajo tudi pri določanju dostopnosti naslednjih vsebin in pri logiki predpogojev.

### Trenutna pozicija

Trenutna pozicija pove, kje je uporabnik nazadnje ostal.

Uporabljeno polje:

```text
current_positions
```

Primer:

```json
{
  "learning_path_id": "up_002",
  "current_module_id": "mod_004",
  "current_learning_unit_id": "ue_008"
}
```

To omogoča funkcionalnost nadaljevanja učenja.

---

## Povezava z uporabniškim profilom

Uporabniški profil je shranjen v kolekciji:

```text
users
```

Napredek uporabnika je shranjen v kolekciji:

```text
user_progress
```

Povezava med njima je prek:

```text
users._id = user_progress.user_id
```

Ko backend ustvari novega lokalnega uporabnika, ustvari tudi začetni zapis v `user_progress`.

Začetni zapis vsebuje prazne sezname:

```json
{
  "_id": "progress_user_001",
  "user_id": "user_001",
  "saved_learning_paths": [],
  "saved_modules": [],
  "saved_learning_units": [],
  "favorite_learning_paths": [],
  "favorite_modules": [],
  "favorite_learning_units": [],
  "completed_learning_paths": [],
  "completed_modules": [],
  "completed_learning_units": [],
  "current_positions": []
}
```

---

## Validacija

Pred zapisovanjem v `user_progress` backend preveri:

- ali zapis napredka uporabnika obstaja,
- ali je `content_type` veljaven,
- ali `content_id` obstaja v ustrezni kolekciji,
- ali učna pot pri trenutni poziciji obstaja,
- ali modul pri trenutni poziciji obstaja,
- ali učna enota pri trenutni poziciji obstaja.

S tem preprečimo, da bi se v `user_progress` zapisale neobstoječe vsebine, na primer:

```text
ue_999
mod_999
up_999
```

---

## Posledice

### Prednosti

- Uporabniški profil ostane ločen od učnega napredka.
- Napredek uporabnika je zbran na enem mestu.
- Backend lahko enostavno preveri shranjene, priljubljene in dokončane vsebine.
- Frontend lahko iz enega dokumenta dobi celoten pregled uporabnikovega napredka.
- Struktura podpira nadaljevanje učenja na zadnji poziciji.
- Struktura podpira logiko predpogojev in določanje dostopnih vsebin.
- Zapis je fleksibilen in ga je mogoče kasneje razširiti z dodatnimi polji.

### Slabosti / omejitve

- Dokument `user_progress` lahko z rastjo uporabnikove aktivnosti postane večji.
- Backend mora sam preverjati, ali vsebine, zapisane v seznamih, res obstajajo.
- Če bo sistem kasneje hranil zelo podrobno zgodovino aktivnosti, bo morda potrebna dodatna kolekcija za dogodke ali activity log.
- Trenutno `assessment` rezultat še ni avtomatsko zapisan v `user_progress`.

---

## Alternativne možnosti

### Hranjenje napredka neposredno v users

Napredek bi lahko bil shranjen neposredno v dokumentu uporabnika. To bi zmanjšalo število kolekcij, vendar bi uporabniški profil postal preobremenjen z učnimi podatki.

### Ločene kolekcije za shranjene, priljubljene in dokončane vsebine

Vsaka vrsta napredka bi lahko imela svojo kolekcijo. To bi omogočilo bolj podrobne poizvedbe, vendar bi za trenutno verzijo sistema povečalo kompleksnost.

### Activity log

Napredek bi lahko bil shranjen kot zaporedje dogodkov, na primer `content_saved`, `content_completed`, `position_updated`. To bi omogočilo podrobno zgodovino, vendar je za trenutno fazo projekta preveč kompleksno.

---

## Končna odločitev

Napredek uporabnika se v trenutni verziji sistema shranjuje v ločeni kolekciji `user_progress`.

Ta odločitev omogoča jasno ločitev med uporabniškim profilom in učnim napredkom ter podpira shranjene, priljubljene, dokončane vsebine in trenutno pozicijo uporabnika.

Ta odločitev ostane veljavna za trenutno verzijo sistema.