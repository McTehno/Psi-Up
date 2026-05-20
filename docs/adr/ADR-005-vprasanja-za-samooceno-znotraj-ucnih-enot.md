# ADR-005: Vprašanja za samooceno znotraj učnih enot

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** uporablja vprašalnike za ugotavljanje uporabnikovega predznanja. Na podlagi odgovorov sistem določi:

- katere spretnosti uporabnik že obvlada,
- katere spretnosti mu manjkajo,
- katere učne enote lahko preskoči,
- pri kateri učni enoti ali modulu naj začne.

Vprašanja za samooceno so neposredno povezana z učnimi enotami, ker je učna enota najmanjši del učne vsebine. Vsaka učna enota vsebuje določene spretnosti, ki jih uporabnik razvija, zato je smiselno, da so vprašanja za preverjanje teh spretnosti zapisana neposredno znotraj učne enote.

---

## Odločitev

Vprašanja za samooceno se shranjujejo znotraj dokumenta učne enote.

Primer strukture učne enote:

```json
{
  "_id": "ue_005",
  "title": "Osnove Excela",
  "short_description": "Uvod v uporabo Excela in osnovno delo s preglednicami.",
  "duration_min": 45,
  "keywords": ["Excel", "preglednice", "podatki"],
  "skills": [
    "Razumevanje in učinkovita uporaba programskega vmesnika",
    "Vnašanje, urejanje in hramba podatkov"
  ],
  "self_assessment_questions": [
    {
      "id": "q_ue_005_001",
      "question": "Znam uporabljati osnovni programski vmesnik Excela.",
      "type": "yes_no",
      "related_skill": "Razumevanje in učinkovita uporaba programskega vmesnika"
    }
  ]
}
```

Vsako vprašanje vsebuje:

- `id`,
- `question`,
- `type`,
- `related_skill`.

Polje `related_skill` poveže vprašanje s spretnostjo, ki jo uporabnik ocenjuje.

---

## Uporaba v vprašalnikih

Vprašalnik za eno učno enoto uporabi vprašanja iz te učne enote.

Vprašalnik za modul zbere vprašanja iz vseh učnih enot znotraj modula.

Vprašalnik za učno pot zbere vprašanja iz vseh učnih enot, ki pripadajo modulom v tej učni poti.

Trenutna logika je:

```text
learning_path → modules → learning_units → self_assessment_questions
```

---

## Uporaba v assessment logiki

Pri obdelavi odgovorov sistem uporablja povezavo med vprašanjem in spretnostjo.

Osnovna interpretacija je:

```text
answer = true  → uporabnik spretnost zna
answer = false → uporabniku spretnost manjka
```

Če so vsa vprašanja določene učne enote odgovorjena z `true`, se učna enota šteje kot pokrita glede na samooceno.

Če ima učna enota vsaj eno vprašanje odgovorjeno z `false`, sistem uporabniku priporoči to učno enoto oziroma jo določi kot začetno točko.

---

## Posledice

### Prednosti

- Vprašanja so neposredno povezana z učno enoto.
- Podatkovni model ostane pregleden in enostaven za razumevanje.
- Ni potrebna dodatna kolekcija za vprašanja v trenutni verziji sistema.
- Generiranje vprašalnikov je enostavno, ker backend bere vprašanja iz učnih enot.
- Assessment logika lahko neposredno poveže odgovore s spretnostmi.
- Učno enoto je mogoče samostojno uporabiti za vprašalnik, assessment in prikaz vsebine.
- Struktura je primerna za trenutno fazo projekta in za manjše število vprašanj.

### Slabosti / omejitve

- Vprašanja so vezana na učno enoto, zato je ponovno uporabljanje istih vprašanj med več učnimi enotami manj neposredno.
- Če bo sistem kasneje potreboval kompleksnejše tipe vprašanj, bo morda potrebna ločena kolekcija za vprašanja.

---

## Alternativne možnosti

### Ločena kolekcija za vprašanja

Vprašanja bi lahko bila shranjena v ločeni kolekciji, na primer `questions`. To bi omogočilo večjo fleksibilnost, ponovno uporabo vprašanj in lažje urejanje večjih količin vprašanj.

Za trenutno verzijo sistema bi to povečalo kompleksnost, ker bi bilo treba dodatno povezovati vprašanja z učnimi enotami.

### Vprašanja na nivoju modula

Vprašanja bi lahko bila shranjena na nivoju modula. To bi poenostavilo vprašalnik za modul, vendar bi bilo težje natančno določiti, katera učna enota pokriva manjkajočo spretnost.

### Vprašanja na nivoju učne poti

Vprašanja bi lahko bila shranjena na nivoju učne poti. To bi omogočilo krajši začetni vprašalnik za celotno učno pot, vendar bi zmanjšalo natančnost pri določanju začetne učne enote.

---

## Končna odločitev

Vprašanja za samooceno se v trenutni verziji sistema shranjujejo znotraj učnih enot v polju `self_assessment_questions`.

Ta odločitev omogoča jasno povezavo med spretnostmi, vprašanji, assessment logiko in priporočeno začetno točko uporabnika.

Če bo sistem kasneje potreboval večje število vprašanj, kompleksnejše tipe vprašanj ali ponovno uporabo vprašanj med različnimi učnimi enotami, se lahko uvede ločena kolekcija za vprašanja.

Ta odločitev ostane veljavna za trenutno verzijo sistema.