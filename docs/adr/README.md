# Architecture Decision Records

Ta mapa vsebuje ADR dokumente oziroma zapise arhitekturnih odločitev za projekt NIDiKo.

ADR dokumenti opisujejo pomembne tehnične in arhitekturne odločitve, ki vplivajo na strukturo, razvoj in vzdrževanje aplikacije. Namen ADR-jev je, da ekipa ne dokumentira samo tega, kaj je bilo narejeno, ampak tudi zakaj je bila določena odločitev sprejeta.

## Seznam ADR dokumentov

| ADR | Naslov | Status |
|---|---|---|
| ADR-001 | Uporaba FastAPI za backend | Sprejeto |
| ADR-002 | Uporaba MongoDB za podatkovno bazo | Sprejeto |
| ADR-003 | Plastna struktura backenda | Sprejeto |
| ADR-004 | Uporaba predpogojev in vrstnega reda za dostopnost vsebin | Sprejeto |
| ADR-005 | Vprašanja za samooceno znotraj učnih enot | Sprejeto |
| ADR-006 | Uporaba user_progress za napredek uporabnika | Sprejeto |
| ADR-007 | Priprava povezave z zunanjim auth sistemom | Sprejeto |
| ADR-008 | Assessment kot read-only logika | Sprejeto |

## Predloga ADR dokumenta

Vsak ADR naj uporablja približno enako strukturo:

```md
# ADR-XXX: Naslov odločitve

## Status

Sprejeto

## Kontekst

Opis problema, situacije ali potrebe, zaradi katere je bila odločitev sprejeta.

## Odločitev

Opis sprejete arhitekturne ali tehnične odločitve.

## Posledice

### Prednosti

- ...

### Slabosti / omejitve

- ...

## Alternativne možnosti

- ...

## Pravila pisanja ADR-jev
- ADR-ji so zapisani v slovenščini.
- Naslovi naj bodo kratki in jasni.
- Vsak ADR naj opisuje eno pomembno odločitev.
- ADR naj ne opisuje samo končne rešitve, ampak tudi razlog za odločitev.
- Če se odločitev kasneje spremeni, se obstoječ ADR ne izbriše, ampak se doda nov ADR, ki opisuje novo odločitev.