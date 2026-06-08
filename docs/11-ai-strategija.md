# AI strategija

Ta dokument opisuje, kako je bila umetna inteligenca uporabljena pri razvoju projekta **NIDiKo**.

AI podpora je bila uporabljena premišljeno, sistematično in pod nadzorom razvojne ekipe.

---

## 1. Namen uporabe AI

AI orodja so bila uporabljena kot podpora pri:

- vzdrževanju že dogovorjene strukture projekta,
- razvoju frontend in backend funkcionalnosti,
- razlagi napak in iskanju možnih rešitev,
- izboljšanju uporabniške izkušnje,
- oblikovanju jasnejših besedil v aplikaciji.

AI ni bil uporabljen kot edini vir rešitev. Vsak predlog je bil pregledan, prilagojen projektu in preverjen pred uporabo.

---

## 2. Sistematičen način dela

AI smo uporabljali z vnaprej pripravljenimi in usmerjenimi prompti.

Prompti so običajno vsebovali:

- opis naloge,
- kontekst projekta,
- relevantne datoteke,
- omejitve,
- pričakovani način odgovora,
- zahtevo po minimalnih spremembah.

Pri razvoju smo upoštevali tudi prispevna navodila:

- [Frontend CONTRIBUTING.md](../frontend/CONTRIBUTING.md)
- [Backend CONTRIBUTING.md](../backend/CONTRIBUTING.md)

To pomeni, da AI predlogi niso smeli podvajati obstoječe kode, spreminjati obstoječih poti, uvajati direktnih API klicev v komponente ali spreminjati izgleda brez potrebe.

---

## 3. Vzdrževanje dogovorjene strukture

AI je bil uporabljen kot pomoč pri ohranjanju že dogovorjene strukture projekta.

Pri tem smo posebej preverjali, da predlogi:

- ne podvajajo reusable komponent,
- ne spreminjajo route URL-jev brez dogovora,
- ne spreminjajo obstoječega izgleda brez zahteve,
- ostanejo skladni z obstoječo frontend in backend arhitekturo.

AI ni samostojno določal arhitekture projekta. Uporabljen je bil kot pomoč pri doslednem upoštevanju že sprejetih pravil.

---

## 4. Uporaba AI pri razvoju kode

AI je bil uporabljen kot pomoč pri razvoju frontend in backend funkcionalnosti.

Uporabljen je bil za:

- pripravo možnih rešitev,
- izboljšanje in optimizacija posameznih funkcij,
- usklajevanje frontend in backend podatkovnih struktur,
- preverjanje TypeScript in Python logike,
- iskanje rešitev brez podvajanja kode.

Pri uporabi AI za razvoj kode smo upoštevali projektna pravila iz navodil:

- [Frontend CONTRIBUTING.md](../frontend/CONTRIBUTING.md)
- [Backend CONTRIBUTING.md](../backend/CONTRIBUTING.md)

---

## 5. Uporaba AI pri razlagi napak

AI je bil uporabljen pri razlagi napak iz terminala, TypeScript napak, build napak in težav pri prikazu komponent.

Primer prompta:

```text
Razloži spodnjo napako.

Najprej napiši:
1. kaj napaka pomeni,
2. zakaj nastane,
3. kateri je najmanjši varen popravek.

Napaka:
[besedilo napake]
```

---

## 6. Uporaba AI pri uporabniški izkušnji

AI je bil uporabljen pri izboljšanju uporabniške izkušnje, predvsem pri besedilih in razlagi funkcionalnosti.

Primeri uporabe:

- bolj razumljive UX oznake,
- bolj jasna sporočila,
- poenotenje izrazov,
- izboljšanje opisov rezultatov vprašalnika,
- krajšanje predolgih razlag.

Primer prompta:

```text
Preoblikuj besedilo tako, da bo bolj jasno, kratko in uporabniku prijazno.
Ne dodajaj novih informacij.

Besedilo:
[besedilo]
```

---

## 7. Preverjanje AI predlogov

Vsak AI predlog je bil pred uporabo pregledan.

Preverili smo:

- skladnost z obstoječo strukturo,
- uporabo obstoječih `services`, tipov in komponent,
- vpliv na obstoječi izgled,
- tveganje za konflikt,
- odsotnost občutljivih podatkov,
- uspešen zagon oziroma build.

Za frontend:

```bash
npm run build
```

Za backend:

```bash
pytest
```

---

## 8. Omejitve uporabe AI

Pri uporabi AI smo upoštevali naslednje omejitve:

- AI lahko predlaga prevelike spremembe,
- AI lahko predlaga rešitev, ki ni skladna s projektom,
- AI ne pozna vedno celotnega konteksta,
- AI predlogi zahtevajo ročni pregled,
- občutljivi podatki se ne vpisujejo v prompte.

AI je bil zato uporabljen kot pomoč pri razvoju, ne kot nadomestilo za razvojno odločanje.