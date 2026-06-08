# ADR-005: Vprašanja za samooceno znotraj učnih enot

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo uporablja vprašalnik za oceno uporabnikovega trenutnega znanja. Na podlagi odgovorov sistem lažje določi, katera učna pot, modul ali učna enota je za uporabnika primerna.

Vprašanja za samooceno so vsebinsko povezana s konkretnim znanjem, ki ga uporabnik razvija znotraj učnih enot. Učna enota predstavlja najmanjši del učne strukture, zato je naravno mesto za vprašanja, ki preverjajo razumevanje posamezne teme, koncepta ali spretnosti.

Sistem mora omogočati, da se vprašalnik lahko pripravi za različne nivoje:

* za posamezno učno enoto,
* za modul,
* za celotno učno pot.

Zato je bilo treba določiti, kje bodo vprašanja shranjena, da jih bo mogoče ponovno uporabiti pri različnih vrstah vprašalnikov.

## Odločitev

Vprašanja za samooceno se hranijo znotraj učnih enot.

Vsaka učna enota lahko vsebuje seznam vprašanj, ki so vezana na njeno vsebino. Ta vprašanja predstavljajo osnovni vir za generiranje vprašalnikov.

Ko uporabnik izpolnjuje vprašalnik za posamezno učno enoto, sistem uporabi vprašanja iz te učne enote.

Ko uporabnik izpolnjuje vprašalnik za modul, sistem zbere vprašanja iz učnih enot, ki pripadajo temu modulu.

Ko uporabnik izpolnjuje vprašalnik za učno pot, sistem zbere vprašanja iz učnih enot, ki pripadajo modulom znotraj te učne poti.

S tem vprašanja ostanejo povezana z najmanjšo vsebinsko enoto, hkrati pa jih je mogoče sestaviti v širše vprašalnike za module in učne poti.

## Posledice

### Prednosti

* Vprašanja so neposredno povezana z vsebino učne enote.
* Ista vprašanja se lahko uporabijo pri vprašalniku za učno enoto, modul ali učno pot.
* Učne enote ostanejo glavni vir konkretnega znanja in preverjanja razumevanja.
* Lažje je dodajati, urejati ali odstranjevati vprašanja skupaj z vsebino učne enote.
* Sistem lahko generira širše vprašalnike z združevanjem vprašanj iz več učnih enot.
* Struktura je skladna z osnovnim modelom: učna pot → modul → učna enota.

### Slabosti / omejitve

* Pri vprašalniku za celotno učno pot se lahko zbere veliko vprašanj, če ima pot veliko modulov in učnih enot.
* Potrebna je dodatna logika za izbiro, omejevanje ali razvrščanje vprašanj, če jih je preveč.
* Kakovost vprašalnika je odvisna od kakovosti vprašanj, zapisanih v posameznih učnih enotah.

## Alternativne možnosti

### Ločena zbirka vprašanj

Vprašanja bi lahko bila shranjena v ločeni zbirki in povezana z učnimi enotami prek ID-jev.

Ta možnost ni bila izbrana, ker bi za trenutno strukturo projekta dodala več kompleksnosti. Ker so vprašanja neposredno vezana na vsebino učne enote, je bolj pregledno, da so shranjena skupaj z njo.

### Vprašanja na ravni modulov

Vprašanja bi lahko bila shranjena neposredno znotraj modulov.

Ta možnost ni bila izbrana, ker je modul širši vsebinski sklop. Vprašanja so običajno bolj natančno vezana na posamezne teme in spretnosti, ki so predstavljene v učnih enotah.

### Vprašanja na ravni učnih poti

Vprašanja bi lahko bila shranjena neposredno znotraj učnih poti.

Ta možnost ni bila izbrana, ker je učna pot najširši nivo strukture. Tak pristop bi otežil ponovno uporabo vprašanj pri modulih in učnih enotah ter zmanjšal povezavo med vprašanjem in konkretno vsebino.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Podatkovni model](../05-podatkovni-model.md)
* [API endpointi](../06-api-endpointi.md)
* [ADR-006: Shranjevanje uporabniškega napredka znotraj uporabniškega profila](ADR-006-shranjevanje-napredka-znotraj-uporabniskega-profila.md)
