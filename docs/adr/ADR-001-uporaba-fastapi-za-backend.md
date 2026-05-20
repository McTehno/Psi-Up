# ADR-001: Uporaba FastAPI za backend

## Status

**Sprejeto**

---

## Kontekst

Projekt **Psi-Up** potrebuje backend, ki omogoča komunikacijo med frontend aplikacijo, podatkovno bazo in poslovno logiko sistema.

Backend mora omogočati:

- REST API endpoint-e za frontend,
- pridobivanje učnih poti, modulov in učnih enot,
- generiranje vprašalnikov,
- obdelavo odgovorov iz vprašalnika,
- določanje začetne točke uporabnika,
- shranjevanje napredka uporabnika,
- povezavo z MongoDB podatkovno bazo,
- kasnejšo povezavo z zunanjim auth sistemom, na primer Auth0,
- možnost kasnejše razširitve sistema z AI modelom.

Ker je projekt razvit v Python okolju, je bilo smiselno izbrati backend framework, ki dobro podpira:

- hitro izdelavo API-jev,
- validacijo podatkov,
- strukturirane response podatke,
- avtomatsko dokumentacijo API-ja,
- jasno ločitev API sloja od poslovne logike,
- morebitno kasnejšo integracijo z AI ali priporočilnimi modeli.

Python je naravna izbira za backend tega projekta tudi zato, ker ima zelo dobro podporo za področja, ki so lahko pomembna pri nadaljnjem razvoju sistema, na primer:

- obdelavo podatkov,
- priporočilne algoritme,
- strojno učenje,
- integracijo z AI modeli,
- analizo uporabnikovih odgovorov,
- kasnejše izboljšanje priporočil učnih poti.

Če bo projekt kasneje razširjen z AI modelom, bo uporaba Pythona olajšala povezavo med obstoječo backend logiko in AI delom sistema. Tako se lahko assessment, priporočila in obdelava uporabniških podatkov razvijajo v istem tehnološkem okolju.

---

## Odločitev

Za backend framework se uporabi **FastAPI**.

FastAPI se uporablja za:

- definiranje API endpointov,
- povezavo requestov s service slojem,
- validacijo vhodnih podatkov prek Pydantic shem,
- vračanje strukturiranih response podatkov,
- avtomatsko generiranje Swagger dokumentacije,
- pripravo backend strukture, ki jo je mogoče kasneje razširiti z AI ali priporočilno logiko.

Backend endpointi so organizirani v mapi:

```text
backend/app/api/
```

Primeri API datotek:

```text
learning_units.py
modules.py
learning_paths.py
questionnaires.py
assessments.py
users.py
user_progress.py
search.py
```

---

## Posledice

### Prednosti

- FastAPI omogoča hitro izdelavo REST API endpointov.
- Ima dobro podporo za Pydantic validacijo.
- Samodejno ustvari Swagger dokumentacijo na `/docs`.
- Koda je pregledna in primerna za ločevanje na:
  - API sloj,
  - service sloj,
  - repository sloj,
  - schema sloj.
- Dobro se ujema s trenutno Python backend strukturo.
- Primeren je za nadaljnjo povezavo z Auth0 ali drugim zunanjim auth sistemom.
- Omogoča jasne response modele, kar olajša povezavo s frontend aplikacijo.
- Python omogoča naravno kasnejšo razširitev sistema z AI modeli, priporočilnimi algoritmi ali naprednejšo analizo podatkov.
- Če bo sistem kasneje uporabljal AI za boljše priporočanje učnih poti, bo integracija enostavnejša, ker backend že uporablja Python okolje.

### Slabosti / omejitve

- Ekipa mora poznati osnovno strukturo FastAPI aplikacije.
- Pri uporabi **PyMongo** je treba paziti, da MongoDB klici niso `await`, ker PyMongo ni async driver.
- Če bo projekt kasneje potreboval popolnoma asinhrono MongoDB komunikacijo, bo morda treba razmisliti o uporabi Motor driverja.
- Backend še ne vsebuje prave Auth0 zaščite endpointov; za zdaj je pripravljena samo struktura za povezavo uporabnika z zunanjim auth sistemom.
- Če bo AI model zelo zahteven, bo morda kasneje potrebna ločena storitev za AI del sistema.

---

## Alternativne možnosti

### Flask

Flask je enostaven Python framework, vendar ne ponuja toliko vgrajene podpore za validacijo podatkov in avtomatsko API dokumentacijo kot FastAPI. Za manjši API bi bil dovolj, vendar je FastAPI bolj primeren za strukturiran backend z več endpointi in Pydantic shemami.

### Django / Django REST Framework

Django REST Framework je močna možnost za večje sisteme, vendar bi bil za trenutno strukturo projekta bolj kompleksen, kot je potrebno. Projekt trenutno ne potrebuje celotnega Django ekosistema, ampak predvsem pregleden REST API.

### Node.js / Express

Express bi bil primeren, če bi bil backend razvit v JavaScript/TypeScript okolju. Ker pa projekt lahko kasneje vključuje AI model, priporočilne algoritme ali naprednejšo obdelavo podatkov, je Python bolj naravna izbira. Python ima močnejši ekosistem za podatkovno analizo, strojno učenje in AI integracije.

---

## Končna odločitev

Za backend aplikacije Psi-Up se uporablja **FastAPI**, ker omogoča hitro izdelavo REST API endpointov, dobro podporo za validacijo podatkov in jasno strukturo kode.

Odločitev za Python backend je smiselna tudi zato, ker lahko projekt kasneje razširimo z AI modelom ali naprednejšo priporočilno logiko. Python omogoča bolj naravno integracijo takšnih rešitev, zato je bolj primeren za dolgoročni razvoj sistema kot backend v JavaScript okolju.

Ta odločitev ostane veljavna za trenutno verzijo sistema.