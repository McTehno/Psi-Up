# ADR-004: Uporaba referenčnega pristopa med učnimi vsebinami v MongoDB

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo uporablja hierarhično strukturo učnih vsebin:

```text
učna pot → modul → učna enota
```

Učna pot predstavlja širši načrt učenja. Modul predstavlja večji vsebinski sklop znotraj učne poti. Učna enota pa predstavlja najmanjši in najbolj konkreten del učne vsebine.

Pri načrtovanju podatkovnega modela v MongoDB je bilo treba določiti, ali bodo povezane učne vsebine shranjene kot vgrajeni dokumenti ali kot samostojni dokumenti, povezani z referencami.

To pomeni, da je bilo treba izbrati med dvema pristopoma:

* učna pot vsebuje celotne module, moduli pa vsebujejo celotne učne enote,
* učna pot vsebuje reference na module, moduli pa reference na učne enote.

Ker se učne vsebine lahko spreminjajo, širijo in ponovno uporabljajo, je bila sprejeta odločitev, da se uporabi referenčni pristop.

## Odločitev

Med učnimi potmi, moduli in učnimi enotami se v MongoDB uporablja referenčni pristop.

To pomeni:

* učne poti so samostojni dokumenti,
* moduli so samostojni dokumenti,
* učne enote so samostojni dokumenti,
* učna pot hrani reference oziroma ID-je modulov,
* modul hrani reference oziroma ID-je učnih enot.

Primer logične povezave:

```text
learning_path
└── module_ids / module references
    └── learning_unit_ids / learning unit references
```

S tem se osnovni podatki posamezne učne vsebine hranijo samo enkrat. Ko aplikacija potrebuje podrobnejši prikaz učne poti ali modula, backend prek service in repository sloja pridobi povezane dokumente in sestavi odgovor za frontend.

Referenčni pristop omogoča, da podatkovni model ostane bolj pregleden in da se učne vsebine ne podvajajo po različnih dokumentih.

## Posledice

### Prednosti

* Podatki o modulih in učnih enotah se ne podvajajo znotraj učnih poti.
* Posamezen modul ali učna enota se lahko lažje posodobi na enem mestu.
* Učne enote je mogoče ponovno uporabiti v različnih modulih, če bo to potrebno.
* Podatkovni model je bolj pregleden, ker ima vsaka glavna entiteta svoj dokument.
* Backend lahko za osnovni prikaz vrne samo reference, za podrobni prikaz pa sestavi razširjene podatke.
* Rešitev je primernejša za nadaljnjo rast sistema in dodajanje novih učnih vsebin.

### Slabosti / omejitve

* Za podrobni prikaz učne poti ali modula mora backend dodatno pridobiti povezane dokumente.
* Service sloj je nekoliko bolj kompleksen, ker mora sestaviti podatke iz več virov.
* Pri brisanju ali spreminjanju dokumentov je treba paziti na pravilnost referenc.

## Alternativne možnosti

### Vgrajevanje modulov znotraj učnih poti

Učna pot bi lahko vsebovala celotne module kot vgrajene dokumente.

Ta možnost ni bila izbrana, ker bi povzročila podvajanje podatkov, če bi se isti modul pojavil na več mestih ali če bi ga želeli ponovno uporabiti. Posodobitev modula bi bila zahtevnejša, ker bi bilo treba posodobiti vse dokumente, kjer je modul vgrajen.

### Vgrajevanje učnih enot znotraj modulov

Modul bi lahko vseboval celotne učne enote kot vgrajene dokumente.

Ta možnost ni bila izbrana, ker bi bile učne enote manj samostojne in težje ponovno uporabne. Prav tako bi bilo težje urejati, testirati in širiti podatkovni model, če bi bile vse učne enote vezane neposredno na en velik dokument modula.


## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Podatkovni model](../05-podatkovni-model.md)
* [API endpointi](../06-api-endpointi.md)
* [ADR-005: Vprašanja za samooceno znotraj učnih enot](ADR-005-vprasanja-za-samooceno-znotraj-ucnih-enot.md)
