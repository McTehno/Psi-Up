# ADR-003: Plastna struktura backenda

## Status

Sprejeto

## Kontekst

Backend aplikacije NIDiKo je zgrajen z uporabo FastAPI. Backend ne skrbi samo za sprejemanje HTTP zahtev, ampak tudi za poslovno logiko, validacijo, dostop do podatkovne baze, uporabniški napredek, vprašalnike, priporočila in povezave z zunanjimi storitvami.

Če bi bila vsa logika zapisana neposredno v API endpointih, bi koda hitro postala težje berljiva, težje testirljiva in težje vzdrževana. Prav tako bi bilo težje ločiti odgovornosti med sprejemom zahteve, obdelavo podatkov, poslovnimi pravili in dostopom do MongoDB.

Zato je bila sprejeta odločitev, da backend uporablja plastno strukturo.

## Odločitev

Backend uporablja plastno arhitekturo, kjer ima vsak sloj svojo odgovornost.

Osnovni tok je:

```text
API → Service → Repository → Database
```

Pomen glavnih slojev:

* `app/api` vsebuje FastAPI endpoint-e in sprejema HTTP zahteve,
* `app/services` vsebuje poslovno logiko aplikacije,
* `app/repositories` vsebuje dostop do podatkovne baze,
* `app/database` vsebuje povezavo z MongoDB,
* `app/schemas` vsebuje Pydantic modele za vhodne in izhodne podatke,
* `app/core` vsebuje skupno sistemsko logiko, kot sta varnost in obravnava napak.

API sloj ne vsebuje kompleksne poslovne logike. Njegova naloga je, da sprejme zahtevo, uporabi ustrezne request/response sheme, pokliče service sloj in vrne odgovor.

Service sloj vsebuje glavno poslovno logiko. Tukaj se izvajajo pravila aplikacije, povezovanje več repositoryjev, priprava vprašalnikov, ocenjevanje odgovorov, priporočila, uporabniški napredek in povezovanje z zunanjimi storitvami.

Repository sloj je odgovoren za komunikacijo s podatkovno bazo. API in service sloj ne dostopata neposredno do MongoDB, ampak uporabljata repository komponente.

Schema sloj določa obliko podatkov, ki jih backend sprejme in vrne. S tem je komunikacija med frontend in backend delom bolj predvidljiva.

## Posledice

### Prednosti

* Koda je bolj pregledna, ker so odgovornosti ločene po slojih.
* Poslovna logika ni zapisana neposredno v API endpointih.
* Dostop do podatkovne baze je ločen v repository sloju.
* Service sloj je lažje testirati neodvisno od API endpointov.
* Repository sloj je lažje testirati ločeno od poslovne logike.
* Pydantic sheme omogočajo jasno obliko requestov in responseov.
* Struktura omogoča lažje dodajanje novih funkcionalnosti.
* Arhitektura je bolj skladna s produkcijskim načinom razvoja kot ena sama monolitna datoteka z vso logiko.

### Slabosti / omejitve

* Za manjše funkcionalnosti je potrebnih več datotek.
* Razvijalec mora razumeti, v kateri sloj spada posamezna logika.

## Alternativne možnosti

### Logika neposredno v API endpointih

Vsa logika bi lahko bila zapisana neposredno v FastAPI endpointih.

Ta možnost ni bila izbrana, ker bi endpointi hitro postali preveliki in težko vzdrževani. Prav tako bi bilo težje testirati poslovno logiko ločeno od HTTP sloja.

### Neposreden dostop do MongoDB iz service sloja

Service sloj bi lahko neposredno komuniciral z MongoDB.

Ta možnost ni bila izbrana, ker bi se poslovna logika mešala z logiko dostopa do podatkov. Repository sloj omogoča jasnejšo ločitev in lažje testiranje dostopa do baze.

### Ena skupna datoteka za posamezno funkcionalnost

Za vsako funkcionalnost bi lahko obstajala ena datoteka, ki vsebuje endpoint, validacijo, poslovno logiko in dostop do podatkov.

Ta možnost ni bila izbrana, ker bi bila na začetku enostavna, kasneje pa bi se težje vzdrževala in širila.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Backend README](../../backend/README.md)
* [Pravila poimenovanja in pisanja kode](../10-pravila-poimenovanja-in-pisanje-kode.md)
* [ADR-004: Uporaba referenčnega pristopa med učnimi vsebinami v MongoDB](ADR-004-uporaba-referencnega-pristopa-med-ucnimi-vsebinami-v-mongodb.md)
