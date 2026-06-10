# API endpointi

Ta dokument opisuje glavne REST API endpointe aplikacije **NIDiKo**.

Backend je zgrajen s FastAPI. API pokriva učne vsebine, vprašalnike, samooceno, iskanje, uporabniški profil, uporabniški napredek, AI pomočnika in glasovno pomoč.

Podrobna interaktivna dokumentacija je pri lokalnem zagonu dostopna na:

```text
http://localhost:8000/docs
```


## 2. Osnovni URL in API prefix

Pri lokalnem razvoju backend običajno teče na naslovu:

```text
http://localhost:8000
```

Vsi backend endpointi imajo krovni API prefiks:

```text
/api
```

Zato je osnovni API URL:

```text
http://localhost:8000/api
```

Primer celotnega API klica:

```text
http://localhost:8000/api/learning-paths
```

V nadaljevanju dokumenta so endpointi zapisani brez krovnega prefiksa `/api`.

Frontend uporablja naslov backenda prek okoljske spremenljivke:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 3. Learning paths


| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/learning-paths` | Vrne vse učne poti | Ne |
| GET | `/learning-paths/{learning_path_id}` | Vrne eno učno pot po ID | Ne |
| GET | `/learning-paths/{learning_path_id}/detail` | Vrne podrobnosti učne poti | Ne |
| GET | `/learning-paths/{learning_path_id}/modules` | Vrne reference modulov znotraj učne poti | Ne |
| GET | `/learning-paths/{learning_path_id}/available-modules` | Vrne module, ki so dostopni glede na zaključene predpogoje | Ne |
| GET | `/learning-paths/{learning_path_id}/questionnaire` | Vrne vprašalnik za učno pot | Ne |

---

## 4. Modules


| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/modules` | Vrne vse module | Ne |
| GET | `/modules/{module_id}` | Vrne en modul po ID | Ne |
| GET | `/modules/{module_id}/detail` | Vrne podrobnosti modula | Ne |
| GET | `/modules/{module_id}/learning-units` | Vrne reference učnih enot znotraj modula | Ne |
| GET | `/modules/{module_id}/available-learning-units` | Vrne učne enote, ki so dostopne glede na zaključene predpogoje | Ne |
| GET | `/modules/{module_id}/questionnaire` | Vrne vprašalnik za modul | Ne |


## 5. Learning units

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/learning-units` | Vrne vse učne enote | Ne |
| GET | `/learning-units/{learning_unit_id}` | Vrne eno učno enoto po ID | Ne |
| GET | `/learning-units/{learning_unit_id}/detail` | Vrne podrobnosti učne enote | Ne |
| GET | `/learning-units/{learning_unit_id}/questionnaire` | Vrne vprašalnik za učno enoto | Ne |

---

## 6. Questionnaires

Endpointi za vprašalnike.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/questionnaires` | Vrne vprašalnik za izbrano vsebino | Ne |

Endpoint uporablja query parametre:

| Parameter | Namen |
|---|---|
| `target_type` | Tip vsebine |
| `target_id` | ID vsebine |

Možne vrednosti za `target_type`:

```text
learning_path
module
learning_unit
```

Primer:

```text
/questionnaires?target_type=learning_path&target_id=up_002
```

---

## 7. Assessments

Endpointi za samooceno oziroma ocenjevanje odgovorov vprašalnika.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| POST | `/assessments/evaluate` | Oceni odgovore in določi priporočeno začetno točko | Ne |

Endpoint prejme odgovore uporabnika in vrne rezultat samoocene.

Rezultat lahko vsebuje:

- priporočeni začetni modul,
- priporočeno začetno učno enoto,
- preskočene module,
- preskočene učne enote,
- znane kompetence,
- manjkajoče kompetence,
- rezultate po učnih enotah,
- rezultate po modulih,
- trenutno pozicijo.

---

## 8. Search

Endpoint za iskanje po učnih vsebinah.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/search` | Išče po učnih poteh, modulih in učnih enotah | Ne |

Endpoint uporablja query parametre:

| Parameter | Namen |
|---|---|
| `query` | Iskalni niz |
| `types` | Izbirni filter tipov vsebin |

Primer osnovnega iskanja:

```text
/search?query=excel
```

Primer iskanja z omejitvijo tipov:

```text
/search?query=excel&types=learning_path&types=module
```

---

## 9. Users

Endpointi za uporabniški profil.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| POST | `/users/profile` | Vrne ali ustvari uporabniški profil po prijavi | Da |
| GET | `/users/by-auth/{auth_user_id}` | Vrne uporabniški profil po zunanjem auth ID | Da |
| GET | `/users/{user_id}` | Vrne uporabniški profil po lokalnem ID | Ne |
| PUT | `/users/{user_id}` | Posodobi uporabniški profil | Ne |


---

## 10. User progress

Endpointi za uporabniški napredek.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| GET | `/user-progress/{user_id}` | Vrne napredek prijavljenega uporabnika | Da |
| POST | `/user-progress/{user_id}/ensure` | Vrne obstoječ napredek ali ustvari praznega | Da |
| POST | `/user-progress/save` | Shrani učno pot, modul ali učno enoto | Da |
| DELETE | `/user-progress/save` | Odstrani vsebino iz shranjenih | Da |
| POST | `/user-progress/favorite` | Označi vsebino kot priljubljeno | Da |
| DELETE | `/user-progress/favorite` | Odstrani vsebino iz priljubljenih | Da |
| POST | `/user-progress/complete` | Označi vsebino kot dokončano | Da |
| DELETE | `/user-progress/complete` | Odstrani vsebino iz dokončanih | Da |
| PUT | `/user-progress/current-position` | Posodobi trenutno pozicijo uporabnika | Da |

### Vrste vsebin

Endpointi za napredek delujejo nad tremi tipi vsebin:

```text
learning_path
module
learning_unit
```
---

## 11. AI pomočnik in glasovna pomoč

Aplikacija uporablja več ločenih endpointov za AI pomočnika.

Pomočniki so ločeni glede na kontekst, v katerem uporabnik potrebuje pomoč.

| Metoda | Pot | Namen | Prijava |
|---|---|---|---|
| POST | `/assessment-assistant/message` | Pošlje sporočilo AI pomočniku pri vprašalniku | Ne |
| POST | `/learning-path-assistant/message` | Pošlje sporočilo AI pomočniku na strani učne poti | Ne |
| POST | `/module-assistant/message` | Pošlje sporočilo AI pomočniku na strani modula | Ne |
| POST | `/learning-unit-assistant/message` | Pošlje sporočilo AI pomočniku na strani učne enote | Ne |
| POST | `/voice-help/question` | Pripravi oziroma vrne glasovno pomoč za vprašanje | Ne |

### Assessment assistant

Endpoint:

```text
POST /assessment-assistant/message
```

Namenjen je AI pomoči pri vprašalniku. Uporabnik lahko pošlje vprašanje ali prošnjo za razlago, pomočnik pa odgovori glede na trenutno vprašanje in kontekst samoocene.

Uporablja se predvsem za:

- razlago vprašanja,
- pojasnitev pomena odgovora,
- pomoč pri razumevanju vsebine, povezane z vprašanjem.

### Learning path assistant

Endpoint:

```text
POST /learning-path-assistant/message
```

Namenjen je AI pomoči na strani podrobnosti učne poti.

Uporabnik lahko pomočnika vpraša o:

- namenu učne poti,
- strukturi učne poti,
- korakih znotraj učne poti,
- priporočeni smeri učenja.

### Module assistant

Endpoint:

```text
POST /module-assistant/message
```

Namenjen je AI pomoči na strani podrobnosti modula.

Uporabnik lahko pomočnika vpraša o:

- vsebini modula,
- povezanih učnih enotah,
- predpogojih,
- temah, ki jih modul pokriva.

### Learning unit assistant

Endpoint:

```text
POST /learning-unit-assistant/message
```

Namenjen je AI pomoči na strani podrobnosti učne enote.

Uporabnik lahko pomočnika vpraša o:

- vsebini učne enote,
- posameznih temah,
- DigComp kompetencah,
- vprašanjih za samooceno,
- dodatni razlagi pojmov.

### Voice help

Endpoint:

```text
POST /voice-help/question
```

Namenjen je glasovni pomoči pri vprašalniku.

Endpoint prejme podatke o vprašanju, možnih odgovorih, jeziku in glasu. Sistem nato pripravi oziroma vrne glasovno pomoč za izbrano vprašanje.

Uporablja se za:

- bolj dostopno izpolnjevanje vprašalnika,
- glasovno razlago vprašanja,
- izboljšanje uporabniške izkušnje pri samooceni.

### Obravnava napak pri AI endpointih

AI in glasovni endpointi lahko vrnejo različne tipe napak.

| Status | Pomen |
|---|---|
| `400 Bad Request` | Zahteva ni pravilna ali manjkajo podatki |
| `404 Not Found` | Zahtevana učna vsebina ne obstaja |
| `502 Bad Gateway` | Napaka pri zunanji AI oziroma glasovni storitvi |
| `500 Internal Server Error` | Nepričakovana napaka na backendu |

---

## 12. Povezani dokumenti

- [Vzpostavitev razvojnega okolja](04-vzpostavitev-razvojnega-okolja.md)
- [Podatkovni model](05-podatkovni-model.md)
- [Uporabniški tokovi](07-uporabniski-tokovi.md)
- [Tehnološki sklad](02-tehnoloski-sklad.md)

---

## 13. Opombe

- Ta dokument predstavlja pregled glavnih endpointov in ni zamenjava za Swagger dokumentacijo.
- Swagger dokumentacija je uporabna za natančne request in response sheme.
- Zaščiteni endpointi uporabljajo JWT avtentikacijo.
- AI pomočniki so ločeni po kontekstu, zato ima vsak večji del aplikacije svoj endpoint.
