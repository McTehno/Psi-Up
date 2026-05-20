# ADR-004: Uporaba predpogojev in vrstnega reda za dostopnost vsebin

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** uporabniku prikazuje učne poti, module in učne enote. Te vsebine niso vedno neodvisne med seboj. Pogosto mora uporabnik najprej dokončati osnovno vsebino, preden lahko nadaljuje na naslednjo.

Primer:

- uporabnik mora najprej dokončati osnovne učne enote,
- šele nato lahko nadaljuje na naprednejše učne enote,
- nekateri moduli so lahko zaporedni,
- nekateri moduli ali učne enote so lahko vzporedni ali alternativni.

Stranka je povedala, da bodo podatki vsebovali tako:

- `order`,
- `prerequisites`.

Zato je bilo treba določiti, kako se bosta ti dve polji uporabljali v sistemu.

---

## Odločitev

Sistem uporablja **kombinacijo vrstnega reda in predpogojev**.

Polje `order` se uporablja za:

- prikaz vrstnega reda vsebin,
- osnovno urejanje modulov znotraj učne poti,
- osnovno urejanje učnih enot znotraj modula,
- pomoč frontendu pri prikazu učne strukture.

Polje `prerequisites` se uporablja za:

- določanje dejanske dostopnosti vsebine,
- preverjanje, ali uporabnik lahko začne določen modul,
- preverjanje, ali uporabnik lahko začne določeno učno enoto,
- določanje naslednjega koraka glede na dokončane vsebine.

To pomeni:

```text
order = vrstni red za prikaz
prerequisites = poslovna logika dostopnosti
```

Backend pri določanju dostopnosti ne uporablja samo `order`, ampak preveri, ali so vsi predpogoji dokončani.

---

## Primer pri učnih enotah

Primer učne enote znotraj modula:

```json
{
  "learning_unit_id": "ue_006",
  "order": 2,
  "parallel_group": null,
  "is_required": true,
  "prerequisites": ["ue_005"]
}
```

To pomeni:

- `ue_006` se v prikazu nahaja po `ue_005`,
- uporabnik lahko začne `ue_006` šele, ko je `ue_005` dokončana.

---

## Primer pri modulih

Primer modula znotraj učne poti:

```json
{
  "module_id": "mod_004",
  "order": 2,
  "parallel_group": null,
  "is_required": true,
  "prerequisites": ["mod_003"]
}
```

To pomeni:

- `mod_004` se v prikazu nahaja po `mod_003`,
- uporabnik lahko začne `mod_004` šele, ko je `mod_003` dokončan.

---

## Parallel group

Polje `parallel_group` omogoča, da ima več modulov ali učnih enot enak nivo oziroma isto skupino.

To je uporabno, kadar:

- lahko uporabnik izbere med več vsebinami,
- se vsebine izvajajo vzporedno,
- več vsebin pripada istemu koraku v učni poti.

Primer:

```json
{
  "module_id": "mod_005",
  "order": 3,
  "parallel_group": "excel_advanced_parallel",
  "is_required": true,
  "prerequisites": ["mod_004"]
}
```

```json
{
  "module_id": "mod_006",
  "order": 3,
  "parallel_group": "excel_advanced_parallel",
  "is_required": false,
  "prerequisites": ["mod_004"]
}
```

To pomeni, da sta modula na istem nivoju, vendar se lahko razlikujeta po tem, ali sta obvezna.

---

## Posledice

### Prednosti

- Sistem jasno loči prikaz od poslovne logike.
- Frontend lahko uporablja `order` za lep prikaz učne poti.
- Backend uporablja `prerequisites` za pravilno preverjanje dostopnosti.
- Podpira zaporedne, vzporedne in alternativne učne vsebine.
- Logika je fleksibilna in se lahko prilagodi različnim učnim potem.
- Če se vrstni red prikaza spremeni, ni nujno, da se spremeni tudi logika dostopnosti.
- Če ima več vsebin isti `order`, lahko še vedno uporabimo `prerequisites` in `parallel_group` za pravilno interpretacijo.

### Slabosti / omejitve

- Podatki morajo biti pravilno pripravljeni.
- Če `prerequisites` niso pravilno zapisani, lahko backend napačno določi dostopnost.
- Frontend in backend morata enako razumeti pomen polj `order`, `prerequisites` in `parallel_group`.
- Backend trenutno preverja osnovno dostopnost, kasneje pa bo morda treba dodati še strožjo validacijo povezav med učnimi potmi, moduli in učnimi enotami.

---

## Alternativne možnosti

### Uporaba samo `order`

Sistem bi lahko določal dostopnost samo na podlagi vrstnega reda. To bi bilo enostavnejše, vendar ne bi podpiralo kompleksnejših primerov, kot so vzporedne vsebine, alternativni moduli ali vsebine z več predpogoji.

### Uporaba samo `prerequisites`

Sistem bi lahko uporabljal samo predpogoje. To bi bilo dovolj za poslovno logiko, vendar frontend ne bi imel jasnega podatka za prikaz vrstnega reda vsebin.

### Ročno določanje naslednje vsebine

Sistem bi lahko za vsako vsebino hranil samo naslednjo vsebino. To bi bilo manj fleksibilno in težje za vzdrževanje, še posebej pri vzporednih ali alternativnih poteh.

---

## Končna odločitev

Sistem Psi-Up uporablja **`order` za prikaz vrstnega reda** in **`prerequisites` za določanje dejanske dostopnosti vsebin**.

Ta odločitev omogoča jasen prikaz učne poti in hkrati pravilno poslovno logiko za določanje, katere module ali učne enote lahko uporabnik začne glede na svoj napredek.

Ta odločitev ostane veljavna za trenutno verzijo sistema.