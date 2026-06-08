# ADR-002: Uporaba MongoDB za podatkovno bazo

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo potrebuje podatkovno bazo za shranjevanje učnih vsebin, uporabnikov, uporabniškega napredka in podatkov, ki podpirajo delovanje vprašalnikov, priporočil ter glasovne pomoči.

Podatkovni model aplikacije vsebuje več vrst dokumentov:

* učne poti,
* module,
* učne enote,
* uporabnike,
* uporabniški napredek znotraj uporabniškega profila,
* odgovore vprašalnika,
* podatke za predpomnjenje glasovne pomoči.

Stranka je pri projektu poudarila potrebo po razširljivosti podatkovnega modela. Prav tako je bilo predvideno, da bo ekipa podatke prejemala oziroma pripravljala v JSON obliki. Ker podatki niso nujno imeli vedno popolnoma enake strukture in ker se lahko atributi učnih vsebin skozi razvoj spreminjajo, je bila potrebna podatkovna baza, ki dobro podpira fleksibilne dokumente.

Struktura učnih vsebin se lahko skozi razvoj spreminja. Učne enote lahko vsebujejo različna polja, vprašanja za samooceno, povezave z dodatnimi metapodatki in druge podatke, ki podpirajo prikaz ter delovanje vprašalnika. Zaradi tega je bila potrebna podatkovna baza, ki omogoča dovolj prilagodljiv podatkovni model.

## Odločitev

Za glavno podatkovno bazo aplikacije se uporablja **MongoDB Atlas**.

MongoDB je dokumentna podatkovna baza, zato omogoča shranjevanje podatkov v obliki dokumentov, ki so naravno podobni JSON strukturi, uporabljeni v aplikaciji.

Aplikacija uporablja MongoDB za shranjevanje glavnih podatkov sistema, kot so učne poti, moduli, učne enote, uporabniki in podatki, povezani z uporabniškim napredkom.

Backend komunicira z MongoDB prek repository sloja. API endpointi in service sloj ne dostopajo neposredno do podatkovne baze, ampak uporabljajo repository komponente. S tem ostane dostop do podatkov ločen od poslovne logike aplikacije.

## Posledice

### Prednosti

* MongoDB dobro podpira dokumentno strukturo podatkov.
* Podatkovni model je prilagodljiv za učne vsebine, ki se lahko širijo z dodatnimi polji.
* Struktura dokumentov je blizu JSON obliki, ki jo uporablja frontend in backend.
* MongoDB Atlas omogoča uporabo oblačne podatkovne baze brez lokalnega vzdrževanja strežnika.
* Učne vsebine, uporabniki in napredek se lahko hranijo v preglednih dokumentih.
* Repozitorijski sloj omogoča, da je dostop do MongoDB ločen od poslovne logike.
* Rešitev se dobro ujema z referenčnim pristopom med učnimi potmi, moduli in učnimi enotami.
* Rešitev podpira razširljivost, ki jo je stranka zahtevala pri podatkovnem modelu.

### Slabosti / omejitve

* MongoDB ne zagotavlja enakega relacijskega modela kot klasične SQL podatkovne baze.
* Povezave med dokumenti je treba upravljati na aplikacijskem nivoju.
* Pri referencah med dokumenti je treba paziti na konsistentnost podatkov.
* Pri kompleksnih poizvedbah je lahko potrebna dodatna logika v backendu.
* Razvijalci morajo dobro razumeti strukturo dokumentov, da ne pride do nekonsistentnega podatkovnega modela.

## Alternativne možnosti

### Relacijska podatkovna baza

Možna bi bila uporaba relacijske podatkovne baze, na primer PostgreSQL ali MySQL.

Ta možnost ni bila izbrana, ker je podatkovni model aplikacije dokumentno usmerjen in se lahko med razvojem spreminja. Relacijska baza bi zahtevala strožjo shemo in več povezovalnih tabel za učne poti, module, učne enote, vprašanja in uporabniški napredek.

Ker so bili podatki predvideni v JSON obliki in ker ni bilo nujno, da imajo vsi dokumenti vedno enake atribute, bi relacijski model zahteval več prilagajanja, dodatnih tabel in migracij ob spremembah podatkovnega modela.

### Lokalna JSON datoteka

V začetni fazi bi bilo mogoče podatke hraniti samo v lokalnih JSON datotekah.

Ta možnost ni bila izbrana kot glavna rešitev, ker ne omogoča zanesljivega trajnega shranjevanja uporabniških podatkov, uporabniškega napredka in dinamičnih sprememb. JSON datoteke so lahko uporabne za začetne podatke, testiranje ali uvoz podatkov, niso pa primerne kot glavna podatkovna baza aplikacije.

### Lokalna MongoDB instanca

Namesto MongoDB Atlas bi lahko uporabljali lokalno MongoDB instanco.

Ta možnost ni bila izbrana kot glavna rešitev, ker MongoDB Atlas poenostavi skupinski razvoj in omogoča, da ekipa uporablja skupno oblačno podatkovno bazo. Lokalna instanca bi bila lahko uporabna za testiranje, vendar bi zahtevala dodatno usklajevanje okolij med člani ekipe.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Podatkovni model](../05-podatkovni-model.md)
* [Backend README](../../backend/README.md)
* [ADR-003: Plastna struktura backenda](ADR-003-plastna-struktura-backenda.md)
* [ADR-004: Uporaba referenčnega pristopa med učnimi vsebinami v MongoDB](ADR-004-uporaba-referencnega-pristopa-med-ucnimi-vsebinami-v-mongodb.md)
