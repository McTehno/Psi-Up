# Podatkovni model

Ta dokument opisuje trenutno podatkovno strukturo aplikacije **NIDiKo**.

NIDiKo uporablja podatkovno bazo **MongoDB**, kjer so podatki shranjeni kot dokumenti v JSON obliki. Podatkovni model je zasnovan tako, da podpira prikaz učnih poti, modulov, učnih enot, uporabniški napredek, vprašalnike, rezultate samoocene in AI pomočnika.

> Več o arhitekturni odločitvi za uporabo MongoDB je zapisano v dokumentu  
> [ADR-002: Uporaba MongoDB za podatkovno bazo](adr/ADR-002-uporaba-mongodb-za-podatkovno-bazo.md).
---

## 1. Pregled glavnih kolekcij

Trenutno se v aplikaciji uporabljajo naslednje glavne kolekcije:

```text
learning_paths
modules
learning_units
users
AI assistant kolekcije
```

---

## 2. Osnovna struktura učnih vsebin

Učne vsebine so zgrajene iz treh glavnih delov:

```text
Učna pot
Modul
Učna enota
```
> Več o uporabi referenčnega pristopa med učnimi vsebinami v MongoDB je zapisano v dokumentu: 
> [ADR-004: Uporaba referenčnega pristopa med učnimi vsebinami v MongoDB](adr/ADR-004-uporaba-referencnega-pristopa-med-ucnimi-vsebinami-v-mongodb.md).

Najmanjši del vsebine je **učna enota**. Več učnih enot lahko sestavlja **modul**. Učna pot pa je širša učna struktura, ki uporabnika vodi skozi več korakov.

V trenutni strukturi učna pot ni omejena samo na module. Posamezen korak učne poti je lahko:

- samostojna učna enota,
- modul.

Zato je osnovna struktura bolj natančno taka:

```text
Učna pot
└── Koraki
    ├── Učna enota
    └── Modul
        └── Učna enota
```

To omogoča, da je učna pot bolj prilagodljiva. Nekateri koraki so lahko manjši in neposredno kažejo na učno enoto, drugi pa so večji in kažejo na celoten modul.

---

## 3. Kolekcija `learning_units`

Kolekcija `learning_units` vsebuje učne enote.

Učna enota je najmanjši samostojni del učne vsebine. Vsebuje opis teme, ključne besede, DigComp kompetence, način izvedbe, vprašanja za samooceno in druge informacije, ki pomagajo uporabniku razumeti, kaj bo z učno enoto pridobil.

### Glavna polja

```text
_id
title
short_description
duration_hours
keywords
content_topics
acquired_competencies
digcomp_competencies
delivery_mode
provider
target_audience
prerequisites
knowledge_assessment
certificate
self_assessment_questions
```


### Primer učne enote

```json
{
  "_id": "ue_002",
  "title": "Kako deluje umetna inteligenca?",
  "short_description": "Razumevanje osnov delovanja umetne inteligence in pomena podatkov.",
  "duration_hours": 0.5,
  "keywords": [
    "umetna inteligenca",
    "UI",
    "podatki",
    "delovanje UI"
  ],
  "content_topics": [
    {
      "id": "topic_ue_002_001",
      "title": "Vloga podatkov pri umetni inteligenci",
      "related_competency_codes": ["1.3"]
    }
  ],
  "acquired_competencies": [
    "Udeleženec razume, zakaj so podatki pomembni pri umetni inteligenci"
  ],
  "digcomp_competencies": [
    {
      "code": "1.3",
      "title": "Upravljanje podatkov, informacij in digitalnih vsebin",
      "description": "Razume pomen podatkov in njihove organizacije pri digitalnih rešitvah"
    }
  ],
  "delivery_mode": "Spletno",
  "provider": "Šolski center Kungota",
  "target_audience": "Odrasli uporabniki z osnovnim digitalnim znanjem",
  "prerequisites": [
    "Poznavanje osnovnih pojmov umetne inteligence"
  ],
  "knowledge_assessment": "Kratek kviz",
  "certificate": "Potrdilo o udeležbi",
  "self_assessment_questions": [
    {
      "id": "q_ue_002_001",
      "question": "Razumem, zakaj so podatki pomembni pri umetni inteligenci.",
      "type": "yes_no",
      "related_topic": "Vloga podatkov pri umetni inteligenci",
      "related_topic_id": "topic_ue_002_001",
      "related_competency_codes": ["1.3"]
    }
  ]
}
```

### Pomembno

Vprašanja za samooceno so shranjena znotraj učne enote. To pomeni, da se vprašalnik sestavlja iz vprašanj, ki pripadajo učnim enotam znotraj modula ali učne poti.

---

## 4. Kolekcija `modules`

Kolekcija `modules` vsebuje module.

Modul predstavlja večji vsebinski sklop. Sestavljen je iz več učnih enot, ki so med seboj povezane z vrstnim redom, predpogoji in morebitnimi vzporednimi skupinami.

### Glavna polja

```text
_id
title
short_description
duration_hours
keywords
domains
learning_units
```

### Primer modula

```json
{
  "_id": "mod_002",
  "title": "Umetna inteligenca v praksi",
  "short_description": "Modul povezuje razumevanje umetne inteligence s praktično in odgovorno uporabo.",
  "duration_hours": 2.5,
  "keywords": [
    "umetna inteligenca",
    "UI",
    "GenUI",
    "etika",
    "digitalne vsebine"
  ],
  "domains": [
    "Umetna inteligenca",
    "Ustvarjanje in uporaba digitalnih vsebin"
  ],
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
      "parallel_group": "skupina_A",
      "is_required": true,
      "prerequisites": ["ue_001", "ue_002"]
    },
    {
      "learning_unit_id": "ue_004",
      "order": 3,
      "parallel_group": "skupina_A",
      "is_required": true,
      "prerequisites": ["ue_001", "ue_002"]
    }
  ]
}
```

### Kako razumemo `learning_units` v modulu?

Vsak element v seznamu `learning_units` pove, katera učna enota je del modula in kako je umeščena v strukturo.

```text
learning_unit_id  → ID učne enote
order             → vrstni red za prikaz
parallel_group    → skupina za vzporedni prikaz
is_required       → ali je učna enota obvezna
prerequisites     → katere učne enote morajo biti prej zaključene
```

### Pomembno pravilo

Glavni vir resnice za dostopnost učne enote je polje `prerequisites`.

Polji `order` in `parallel_group` pomagata predvsem pri vizualnem prikazu.

Primer:

```json
{
  "learning_unit_id": "ue_003",
  "order": 3,
  "parallel_group": "skupina_A",
  "is_required": true,
  "prerequisites": ["ue_001", "ue_002"]
}
```

To pomeni:

- učna enota `ue_003` se vizualno prikaže v tretjem koraku,
- spada v vzporedno skupino `skupina_A`,
- začne se lahko šele po zaključenih učnih enotah `ue_001` in `ue_002`.

---

## 5. Kolekcija `learning_paths`

Kolekcija `learning_paths` vsebuje učne poti.

Učna pot je širši načrt učenja. Vodi uporabnika skozi zaporedje korakov, ki so lahko moduli ali samostojne učne enote.

### Glavna polja

```text
_id
title
short_description
duration_hours
keywords
steps
```

### Primer učne poti

```json
{
  "_id": "up_13",
  "title": "Temelji digitalnega delovanja",
  "short_description": "Učna pot uporabnika vodi skozi osnovne digitalne spretnosti, razumevanje spletnih storitev, varno uporabo digitalnih orodij in učinkovito organizacijo digitalnega dela.",
  "duration_hours": 8,
  "keywords": [
    "digitalne osnove",
    "spletne storitve",
    "digitalna orodja",
    "varnost",
    "organizacija",
    "digitalne kompetence"
  ],
  "steps": [
    {
      "type": "learning_unit",
      "ref_id": "ue_001",
      "order": 1,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": []
    },
    {
      "type": "module",
      "ref_id": "mod_001",
      "order": 2,
      "parallel_group": null,
      "is_required": true,
      "prerequisites": ["ue_001"]
    },
    {
      "type": "learning_unit",
      "ref_id": "ue_004",
      "order": 3,
      "parallel_group": "digital_foundations_parallel_A",
      "is_required": true,
      "prerequisites": ["ue_001", "mod_001"]
    }
  ]
}
```

### Kako razumemo `steps`?

Polje `steps` je seznam korakov učne poti.

Vsak korak ima:

```text
type
ref_id
order
parallel_group
is_required
prerequisites
```

Polje `type` pove, na katero kolekcijo kaže korak.

Če je `type` enak `learning_unit`, potem `ref_id` kaže na dokument iz kolekcije `learning_units`.

```json
{
  "type": "learning_unit",
  "ref_id": "ue_001"
}
```

Če je `type` enak `module`, potem `ref_id` kaže na dokument iz kolekcije `modules`.

```json
{
  "type": "module",
  "ref_id": "mod_001"
}
```

### Pomembno pravilo

Tudi pri učni poti je glavni vir resnice za dostopnost polje `prerequisites`.

Polji `order` in `parallel_group` se uporabljata za lažji in lepši prikaz poti na uporabniškem vmesniku.

---

## 6. Kolekcija `users`

Kolekcija `users` vsebuje uporabniške profile, podatke o prijavi in napredek uporabnika.

V trenutni strukturi ni ločene kolekcije `user_progress`. Vse informacije o napredku so shranjene znotraj polja `progress` v dokumentu uporabnika.

### Glavna polja

```text
_id
auth_provider
auth_user_id
name
email
progress
created_at
updated_at
```

### Struktura polja `progress`

```text
progress
├── saved
├── favorites
├── completed
├── current_positions
└── questionnaire_answers
```

### `progress.saved`

Hrani vsebine, ki jih je uporabnik shranil.

```json
{
  "learning_path_ids": [],
  "module_ids": [],
  "learning_unit_ids": []
}
```

### `progress.favorites`

Hrani vsebine, ki jih je uporabnik označil kot priljubljene.

```json
{
  "learning_path_ids": [],
  "module_ids": [],
  "learning_unit_ids": []
}
```

### `progress.completed`

Hrani vsebine, ki jih je uporabnik dokončal.

```json
{
  "learning_path_ids": [],
  "module_ids": ["mod_003"],
  "learning_unit_ids": ["ue_005", "ue_006", "ue_007"]
}
```

### `progress.current_positions`

Hrani trenutno pozicijo uporabnika znotraj učne poti.

```json
{
  "learning_path_id": "up_002",
  "current_module_id": "mod_004",
  "current_learning_unit_id": "ue_008",
  "updated_at": "2026-06-07T15:19:38.869Z"
}
```

To pomeni, da je uporabnik trenutno na učni poti `up_002`, v modulu `mod_004`, pri učni enoti `ue_008`.

### `progress.questionnaire_answers`

Hrani oddane odgovore vprašalnika in rezultat samoocene.

Vsak zapis vsebuje:

```text
target_type
target_id
last_submitted_at
answers
assessment_result
assessment_result_saved_at
```

---

## 7. Rezultat samoocene

Rezultat samoocene je shranjen znotraj uporabnikovega napredka, v polju:

```text
progress.questionnaire_answers.assessment_result
```

Rezultat samoocene pove, kaj uporabnik že zna, česa še ne zna in kje naj začne z učenjem.

### Pomembna polja

```text
user_id
target_type
target_id
start_module_id
start_learning_unit_id
skipped_modules
skipped_learning_units
recommended_next_modules
recommended_next_learning_units
known_competency_codes
missing_competency_codes
learning_unit_results
module_results
summary
completed_learning_unit_ids
completed_module_ids
completed_learning_path_ids
current_position
```

### Kratka razlaga

- `start_module_id` pove, pri katerem modulu naj uporabnik začne.
- `start_learning_unit_id` pove, pri kateri učni enoti naj uporabnik začne.
- `skipped_modules` so moduli, ki jih sistem preskoči, ker jih uporabnik že zna.
- `skipped_learning_units` so učne enote, ki jih sistem preskoči, ker jih uporabnik že zna.
- `recommended_next_modules` so priporočeni naslednji moduli.
- `recommended_next_learning_units` so priporočene naslednje učne enote.
- `known_competency_codes` so kompetence, ki jih uporabnik že obvlada.
- `missing_competency_codes` so kompetence, ki jih uporabnik še mora razviti.
- `learning_unit_results` vsebuje rezultat po posameznih učnih enotah.
- `module_results` vsebuje rezultat po modulih.
- `current_position` določi novo trenutno pozicijo uporabnika.

---

