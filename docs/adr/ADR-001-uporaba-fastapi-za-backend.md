# ADR-001: Uporaba FastAPI za backend

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo potrebuje backend, ki omogoča komunikacijo med frontend aplikacijo, podatkovno bazo in zunanjimi storitvami. Backend mora izpostavljati API endpoint-e za učne poti, module, učne enote, vprašalnike, ocenjevanje odgovorov, priporočila, uporabnike, uporabniški napredek, AI pomočnika in glasovno pomoč.

Ker je projekt zasnovan kot spletna aplikacija z ločenim frontend in backend delom, je bila potrebna tehnologija, ki omogoča hitro izdelavo REST API-ja, dobro strukturo endpointov, validacijo podatkov in jasen način povezovanja s servisno logiko aplikacije.

Pomembno je bilo tudi, da je backend primeren za razvoj v Pythonu, saj se v Pythonu lažje razvijajo tudi deli sistema, povezani z obdelavo podatkov, priporočilno logiko, AI podporo in testiranjem.

Pri izbiri backend tehnologije je bila upoštevana tudi možnost kasnejše razširitve sistema z AI modelom oziroma dodatnimi AI funkcionalnostmi. Ker se AI podpora, priporočilna logika in obdelava podatkov pogosto razvijajo v Python okolju, je bil Python backend s FastAPI primerna izbira za nadaljnjo razširitev sistema.

## Odločitev

Za backend aplikacije se uporablja **FastAPI**.

FastAPI se uporablja za izdelavo REST API endpointov, ki jih kliče frontend aplikacija. Backend preko FastAPI endpointov sprejema zahteve, uporablja Pydantic sheme za validacijo vhodnih in izhodnih podatkov, kliče service sloj ter vrača strukturirane odgovore frontendu.

FastAPI aplikacija je organizirana v večplastno backend strukturo. API endpointi so ločeni od poslovne logike, dostopa do podatkovne baze in podatkovnih shem. S tem FastAPI predstavlja predvsem vstopno točko za HTTP zahteve, glavna poslovna logika pa ostane v service sloju.

## Posledice

### Prednosti

* FastAPI omogoča hitro izdelavo REST API endpointov.
* Dobro se povezuje s Pydantic modeli za validacijo podatkov.
* Primeren je za Python backend in se dobro ujema z obstoječo backend strukturo projekta.
* Izbira Python okolja omogoča lažjo kasnejšo razširitev sistema z AI modeli ali dodatnimi AI funkcionalnostmi.
* Omogoča jasno ločitev endpointov po domenah, na primer učne poti, moduli, učne enote, vprašalniki in uporabniški napredek.
* Samodejno generira interaktivno API dokumentacijo, kar olajša testiranje in razumevanje endpointov.
* Podpira asinhrone funkcije, kar je uporabno pri delu s podatkovno bazo in zunanjimi storitvami.
* Rešitev je primerna za nadaljnjo širitev sistema.

### Slabosti / omejitve

* Ekipa mora poznati način dela s FastAPI, dependency injection in Pydantic shemami.
* Pri večjem številu endpointov je treba paziti na dobro organizacijo routerjev.
* FastAPI sam po sebi ne določa arhitekture projekta, zato je bilo treba posebej določiti plastno strukturo backenda.
* Za produkcijsko uporabo je treba ustrezno urediti konfiguracijo, obravnavo napak, varnost in zagon aplikacije.

## Alternativne možnosti

### Flask

Backend bi lahko bil zgrajen z uporabo Flask frameworka.

Ta možnost ni bila izbrana, ker Flask ponuja manj vgrajene podpore za tipizirane request/response modele in samodejno API dokumentacijo. Za potrebe projekta je FastAPI ponudil boljšo povezavo med endpointi, Pydantic shemami in dokumentacijo API-ja.

### Django / Django REST Framework

Backend bi lahko bil zgrajen z uporabo Django REST Frameworka.

Ta možnost ni bila izbrana, ker je Django težji framework z več vnaprej določenimi strukturami. Za NIDiKo je bil primernejši lažji pristop, kjer backend ostane osredotočen na REST API, service logiko in povezavo z MongoDB.

### Node.js / Express

Backend bi lahko bil zgrajen z uporabo Node.js in Express.

Ta možnost ni bila izbrana, ker je projekt backend del razvijal v Pythonu, Python pa je bil primernejši za načrtovano priporočilno logiko, obdelavo podatkov, testiranje in povezovanje z AI funkcionalnostmi.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Backend README](../../backend/README.md)
* [Tehnološki sklad](../02-tehnoloski-sklad.md)
* [API endpointi](../06-api-endpointi.md)
* [ADR-002: Uporaba MongoDB za podatkovno bazo](ADR-002-uporaba-mongodb-za-podatkovno-bazo.md)
