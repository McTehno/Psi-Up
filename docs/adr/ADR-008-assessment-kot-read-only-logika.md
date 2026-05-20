# ADR-008: Assessment kot read-only logika

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** uporablja vprašalnike za ugotavljanje uporabnikovega predznanja. Uporabnik odgovori na vprašanja za samooceno, sistem pa na podlagi odgovorov določi:

- katere spretnosti uporabnik že obvlada,
- katere spretnosti uporabniku manjkajo,
- katere učne enote lahko preskoči,
- kateri moduli so že pokriti,
- pri katerem modulu naj uporabnik začne,
- pri kateri učni enoti naj uporabnik začne.

Ta logika je pomembna, ker vpliva na priporočeno učno pot uporabnika. Zato mora biti rezultat assessmenta najprej preverljiv in razumljiv, preden se začne avtomatsko zapisovati v `user_progress`.

---

## Odločitev

Assessment se v trenutni verziji sistema uporablja kot **read-only logika**.

To pomeni, da endpoint:

```text
POST /api/assessments/evaluate
```

samo obdela odgovore in vrne rezultat, ne zapisuje pa samodejno sprememb v `user_progress`.

Assessment trenutno vrne podatke, kot so:

- `known_skills`,
- `missing_skills`,
- `start_module_id`,
- `start_learning_unit_id`,
- `skipped_modules`,
- `skipped_learning_units`,
- `recommended_next_modules`,
- `recommended_next_learning_units`,
- `summary`.

Primer rezultata:

```json
{
  "user_id": "user_001",
  "target_type": "learning_path",
  "target_id": "up_002",
  "start_module_id": "mod_004",
  "start_learning_unit_id": "ue_009",
  "skipped_modules": ["mod_003"],
  "skipped_learning_units": ["ue_005", "ue_006", "ue_007"],
  "recommended_next_modules": ["mod_004"],
  "recommended_next_learning_units": ["ue_009"],
  "summary": "Uporabnik naj začne pri modulu mod_004."
}
```

---

## Zakaj rezultat ni takoj zapisan v user_progress

Assessment rezultat lahko pomembno vpliva na stanje uporabnika.

Če bi backend takoj samodejno zapisoval rezultat v `user_progress`, bi se lahko zgodilo, da bi napačno ocenjen ali testni odgovor takoj spremenil uporabnikov napredek.

Zato je trenutna odločitev:

```text
assessment = izračun rezultata
user_progress = ločen zapis napredka
```

To pomeni, da lahko frontend najprej prikaže rezultat uporabniku, nato pa se kasneje odloči, ali bo rezultat uporabljen za posodobitev napredka.

---

## Trenutna interpretacija odgovorov

Assessment trenutno uporablja preprosto in razumljivo logiko:

```text
answer = true  → uporabnik spretnost zna
answer = false → uporabniku spretnost manjka
```

Učna enota je pokrita, če so vsa njena vprašanja odgovorjena z `true`.

Modul je pokrit, če so pokrite vse njegove obvezne učne enote.

Učna pot določi prvo primerno začetno točko glede na module in učne enote, ki še niso pokriti.

---

## Posledice

### Prednosti

- Assessment logiko je mogoče testirati brez spreminjanja podatkov v bazi.
- Napačni ali testni odgovori ne spremenijo uporabnikovega napredka.
- Frontend lahko najprej prikaže rezultat uporabniku.
- Sistem jasno loči izračun priporočila od trajnega shranjevanja napredka.
- Lažje je preveriti, ali assessment pravilno določa začetno točko.
- Kasneje je mogoče dodati ločen korak za potrjevanje rezultata.
- Logika je primerna za trenutno fazo razvoja, ko se podatkovni model in zahteve še lahko spreminjajo.

### Slabosti / omejitve

- Assessment rezultat se trenutno ne shrani samodejno.
- Če želi aplikacija rezultat uporabiti za napredek, bo potrebna dodatna logika.
- Frontend ali dodaten backend endpoint bo moral odločiti, kdaj se rezultat zapiše v `user_progress`.
- Uporabnikovo stanje se po assessmentu samo od sebe še ne spremeni.
- Potrebna bo dodatna odločitev, kako ravnati z rezultati assessmenta v končni verziji aplikacije.

---

## Možne kasnejše razširitve

Kasneje se lahko doda dodatna logika, na primer:

```text
POST /api/user-progress/apply-assessment-result
```

Ta endpoint bi lahko:

- prejel assessment rezultat,
- posodobil `completed_learning_units`,
- posodobil `completed_modules`,
- posodobil `current_positions`,
- shranil priporočeno začetno točko.

Možna je tudi rešitev z dodatnim parametrom:

```text
save_result=true
```

pri assessment endpointu, vendar je ločen endpoint bolj pregleden in varnejši.

---

## Alternativne možnosti

### Takojšnje zapisovanje v user_progress

Assessment bi lahko takoj po obdelavi odgovorov zapisal rezultat v `user_progress`.

To bi bilo hitrejše za uporabnika, vendar manj varno v trenutni fazi, ker bi vsak testni ali napačen odgovor takoj spremenil napredek.

### Shranjevanje vsakega assessment rezultata v zgodovino

Sistem bi lahko hranil zgodovino vseh assessment rezultatov. To bi omogočilo analizo sprememb skozi čas, vendar je za trenutno verzijo sistema dodatna kompleksnost.

### Assessment samo na frontendu

Frontend bi lahko sam izračunal rezultat. To ni priporočljivo, ker bi se pomembna poslovna logika preselila iz backenda na frontend in bi jo bilo težje nadzorovati.

---

## Končna odločitev

Assessment se v trenutni verziji sistema izvaja kot **read-only logika**.

Backend na podlagi odgovorov izračuna rezultat in določi začetno točko uporabnika, vendar rezultata ne zapisuje samodejno v `user_progress`.

Ta odločitev omogoča varnejše testiranje, jasnejšo ločitev odgovornosti in lažje kasnejše razširitve sistema.

Ta odločitev ostane veljavna za trenutno verzijo sistema.