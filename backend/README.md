# Backend struktura

Backend je organiziran tako, da so ločeni API endpointi, poslovna logika, dostop do podatkov, podatkovne sheme in povezava z bazo. Takšna struktura omogoča lažje vzdrževanje in kasnejše razširitve sistema.

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   ├── services/
│   ├── repositories/
│   ├── schemas/
│   └── database/
│
├── data/
│   ├── competencies.json
│   ├── modules.json
│   └── learning_units.json
│
├── tests/
└── requirements.txt

```

| Mapa/datoteka | Namen |
| :-- | :-- |
| `backend/` | Glavna mapa za backend del aplikacije. |
| `app/` | Vsebuje glavno Python aplikacijo in njene notranje module. |
| `app/main.py` | Vstopna točka backend aplikacije. Tukaj se zažene aplikacija in povežejo glavni deli sistema. |
| `app/config.py` | Konfiguracijske nastavitve aplikacije, na primer nastavitve okolja, povezave in osnovne vrednosti. |
| `app/api/` | Vsebuje API endpoint-e, prek katerih frontend komunicira z backendom. |
| `app/services/` | Vsebuje poslovno logiko aplikacije, na primer logiko za priporočila, vprašalnik in učne poti. |
| `app/repositories/` | Skrbi za dostop do podatkov. Ta plast loči poslovno logiko od konkretnega vira podatkov, na primer JSON datotek ali MongoDB. |
| `app/schemas/` | Vsebuje podatkovne sheme za vhodne in izhodne podatke API-ja. |
| `app/database/` | Vsebuje konfiguracijo in povezavo s podatkovno bazo. |
| `data/` | Vsebuje začasne oziroma razvojne podatke, ki se uporabljajo pred povezavo s pravo bazo podatkov. 
| `tests/` | Vsebuje teste za backend funkcionalnosti. |