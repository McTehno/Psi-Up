# ADR-006: Shranjevanje uporabniškega napredka znotraj uporabniškega profila

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo omogoča prijavljenemu uporabniku spremljanje lastnega napredka skozi učne poti, module in učne enote.

Sistem mora za posameznega uporabnika hraniti podatke, kot so:

* shranjene vsebine,
* priljubljene vsebine,
* dokončane vsebine,
* trenutna pozicija znotraj učne poti,
* oddani odgovori vprašalnika,
* povezava med uporabnikom in njegovim napredkom.

Ti podatki so vezani na posameznega uporabnika in predstavljajo njegov odnos do učnih vsebin. Učne poti, moduli in učne enote ostanejo skupne vsebine sistema, uporabniški napredek pa je individualen.

Zato je bilo treba določiti, ali bo napredek shranjen kot ločena zbirka ali kot del uporabniškega profila.

## Odločitev

Uporabniški napredek se shrani znotraj dokumenta uporabnika, v polju `progress`.

Dokument uporabnika vsebuje osnovne podatke uporabnika, povezavo z zunanjim avtentikacijskim sistemom in aplikacijski napredek. Struktura `progress` vsebuje ločene podsklope za različne vrste napredka:

* `saved` za shranjene vsebine,
* `favorites` za priljubljene vsebine,
* `completed` za dokončane vsebine,
* `current_positions` za trenutno pozicijo uporabnika,
* `questionnaire_answers` za oddane odgovore vprašalnika.

S tem ostane napredek neposredno povezan z uporabnikom. Backend pri prijavljenem uporabniku najprej določi lokalni uporabniški profil, nato pa bere ali posodablja njegov `progress`.

Osnovne učne vsebine se pri tem ne spreminjajo. Napredek uporabnika se hrani ločeno od definicije učnih poti, modulov in učnih enot, vendar znotraj istega dokumenta kot uporabniški profil.

## Posledice

### Prednosti

* Podatki o uporabniku in njegovem napredku so zbrani na enem mestu.
* Pridobivanje profila in osnovnega napredka uporabnika je enostavnejše.
* Ni potrebna dodatna zbirka samo za napredek uporabnika.
* Učne vsebine ostanejo skupne vsem uporabnikom in se ne spreminjajo ob uporabniških akcijah.
* Struktura `progress` omogoča jasno ločitev med shranjenimi, priljubljenimi, dokončanimi vsebinami, trenutno pozicijo in odgovori vprašalnika.
* Rešitev je dovolj enostavna za trenutno velikost in potrebe projekta.

### Slabosti / omejitve

* Dokument uporabnika se lahko povečuje, če uporabnik odda veliko odgovorov vprašalnika ali ima veliko aktivnosti.
* Posodobitve napredka spreminjajo dokument uporabnika, zato je treba paziti na pravilno posodabljanje posameznih delov strukture `progress`.


## Alternativne možnosti

### Ločena zbirka za uporabniški napredek

Napredek bi lahko bil shranjen v ločeni zbirki, na primer `user_progress`.

Ta možnost trenutno ni bila izbrana, ker je za obseg projekta enostavnejše in preglednejše, da se napredek hrani neposredno znotraj dokumenta uporabnika. Ločena zbirka bi bila smiselna, če bi se količina napredka, zgodovine aktivnosti ali analitike bistveno povečala.

### Shranjevanje napredka neposredno v učne vsebine

Napredek bi lahko bil shranjen pri učnih poteh, modulih ali učnih enotah.

Ta možnost ni bila izbrana, ker so učne vsebine skupne vsem uporabnikom. Če bi se napredek shranjeval neposredno v vsebine, bi se individualni podatki uporabnikov mešali s skupno strukturo sistema.

### Brez trajnega shranjevanja napredka

Aplikacija bi lahko napredek hranila samo začasno na frontendu.

Ta možnost ni bila izbrana, ker uporabnik ne bi mogel zanesljivo nadaljevati dela med različnimi sejami, napravami ali prijavami.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Podatkovni model](../05-podatkovni-model.md)
* [API endpointi](../06-api-endpointi.md)
* [ADR-010: Uporaba Supabase Auth za avtentikacijo](ADR-010-uporaba-supabase-auth-za-avtentikacijo.md)
