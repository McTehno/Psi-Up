# Uporabniški tokovi

Ta dokument opisuje glavne uporabniške tokove v aplikaciji **NIDiKo**.

Namen dokumenta je na razumljiv način prikazati, kako uporabnik uporablja aplikacijo od prvega obiska do izbire učne vsebine, reševanja vprašalnika in nadaljevanja učenja.

---

## 1. Glavni uporabniški tok

Osnovni tok uporabnika v aplikaciji je:

```text
Začetna stran → iskanje → izbira učne poti → stran podrobnosti → vprašalnik → rezultat → nadaljevanje učenja
```

Uporabnik najprej pregleda začetno stran, poišče vsebino, ki ga zanima, odpre stran podrobnosti in se nato lahko odloči za reševanje vprašalnika. Na podlagi odgovorov dobi rezultat, ki mu pomaga razumeti, kje začeti oziroma kako nadaljevati z učenjem.

---

## 2. Glavne strani aplikacije

Aplikacija trenutno vključuje naslednje glavne strani:

- začetna stran,
- iskanje,
- stran »O nas«,
- prijava,
- registracija,
- stran podrobnosti učne poti,
- stran podrobnosti modula,
- stran podrobnosti učne enote,
- vprašalnik.

Strani podrobnosti so namenjene pregledu posamezne učne vsebine. Uporabnik lahko pregleda osnovne podatke, strukturo vsebine, povezane učne enote ali module, napredek in podporo AI pomočnika.

---

## 3. Tok neprijavljenega uporabnika

Neprijavljen uporabnik lahko uporablja večino raziskovalnih in učnih funkcionalnosti aplikacije.

Lahko:

- pregleduje začetno stran,
- uporablja iskanje,
- odpira strani podrobnosti učnih poti, modulov in učnih enot,
- izpolni vprašalnik,
- uporablja glasovno pomoč pri vprašalniku,
- uporablja AI pomočnika pri vprašalniku,
- uporablja AI pomočnika na straneh podrobnosti učnih vsebin.

Neprijavljen uporabnik ne more:

- shranjevati učnih vsebin,
- označevati vsebin kot priljubljene,
- označevati vsebin kot dokončane.

Če uporabnik želi uporabljati funkcionalnosti za osebni napredek, se mora prijaviti oziroma registrirati.

---

## 4. Tok prijavljenega uporabnika

Prijavljen uporabnik lahko uporablja vse funkcionalnosti, ki so na voljo neprijavljenemu uporabniku.

Poleg tega lahko:

- shrani učno pot, modul ali učno enoto,
- označi učno vsebino kot priljubljeno,
- označi modul ali učno enoto kot dokončano (ročno preko  gumba ali preko vprašalnika),
- označi učno pot, modul ali učno enoto kot dokončano (kot rezultat vprašalnika),
- spremlja svoj napredek,
- ima shranjene podatke o napredku v svojem uporabniškem profilu.

---

## 5. Tok iskanja vsebin

Iskanje uporabniku omogoča hitro odkrivanje učnih poti, modulov in učnih enot.

Osnovni tok iskanja:

```text
Uporabnik vnese iskalni niz → aplikacija prikaže rezultate → uporabnik izbere vsebino → odpre se stran podrobnosti
```

Iskanje je pomembno, ker uporabniku omogoča, da ne začne nujno z vnaprej določeno kategorijo, ampak lahko neposredno poišče področje, ki ga zanima.


---

## 6. Tok pregleda učne poti

Učna pot predstavlja širši načrt učenja.

Uporabnik na strani podrobnosti učne poti vidi osnovne informacije o učni poti in njeno strukturo. Učna pot je sestavljena iz korakov, kjer je lahko posamezen korak modul ali samostojna učna enota.

Osnovni tok:

```text
Uporabnik izbere učno pot → pregleda opis in strukturo → po potrebi odpre vprašalnik → dobi priporočeno začetno točko
```

Na tej strani lahko prijavljen uporabnik tudi shrani učno pot, jo označi kot priljubljeno ali spremlja napredek.

---

## 7. Tok pregleda modula

Modul predstavlja vsebinsko zaokrožen del učne poti.

Uporabnik na strani podrobnosti modula vidi osnovne podatke o modulu, povezane učne enote in napredek znotraj modula.

Osnovni tok:

```text
Uporabnik izbere modul → pregleda opis → pregleda učne enote → nadaljuje na izbrano učno enoto ali vprašalnik
```

Prijavljen uporabnik lahko modul shrani, označi kot priljubljen ali dokončan.

---

## 8. Tok pregleda učne enote

Učna enota je najmanjši samostojni del učne vsebine.

Uporabnik na strani podrobnosti učne enote vidi opis, teme, kompetence, podatke o izvedbi in druga pomembna pojasnila.

Osnovni tok:

```text
Uporabnik izbere učno enoto → pregleda vsebino → po potrebi uporabi AI pomočnika
```

Prijavljen uporabnik lahko učno enoto shrani, označi kot priljubljeno ali dokončano.

---

## 9. Tok vprašalnika

Vprašalnik uporabniku pomaga oceniti trenutno znanje.

Trenutno je vprašalnik zasnovan kot niz vprašanj tipa **DA/NE**. Vprašanja se pripravijo glede na vsebino, za katero uporabnik rešuje vprašalnik.

Vprašalnik se lahko nanaša na:

- učno pot,
- modul,
- učno enoto.

Osnovni tok vprašalnika:

```text
Uporabnik odpre vprašalnik → odgovarja na DA/NE vprašanja → odda odgovore → aplikacija prikaže rezultat
```

Rezultat vprašalnika uporabniku pomaga razumeti:

- katere vsebine že pozna,
- katere vsebine še potrebuje,
- kje je smiselno začeti,
- kateri modul ali učna enota sta priporočena kot naslednji korak.

Podrobna logika vprašalnika je dokumentirana ločeno:

- [Logika vprašalnika](14-logika-vprasalnika.md)

---

## 10. Tok rezultata samoocene

Po oddaji vprašalnika aplikacija pripravi rezultat samoocene.

Rezultat lahko vsebuje:

- začetni modul,
- začetno učno enoto,
- preskočene module,
- preskočene učne enote,
- priporočene naslednje module,
- priporočene naslednje učne enote,
- znane kompetence,
- manjkajoče kompetence,
- povzetek rezultata.

Če uporabnik na določena vprašanja odgovori z **DA**, sistem razume, da določena znanja že ima. Če odgovori z **NE**, sistem ta področja obravnava kot vsebine, ki jih mora uporabnik še predelati.

Pri prijavljenem uporabniku se rezultat samoocene shrani v njegov napredek.

---

## 11. Tok uporabniškega napredka

Napredek uporabnika prikazuje, kaj je uporabnik že shranil, označil kot priljubljeno, dokončal in kje se trenutno nahaja.

### Trenutna pozicija

Trenutna pozicija pomeni zadnje priporočeno ali izbrano mesto uporabnika znotraj učne poti.

Vključuje lahko:

- učno pot,
- trenutni modul,
- trenutno učno enoto,
- čas zadnje posodobitve.

Primer:

```text
Uporabnik je na učni poti up_002 trenutno usmerjen v modul mod_004 in učno enoto ue_008.
```

Trenutna pozicija uporabniku pomaga, da se lahko vrne na pravo mesto in nadaljuje učenje brez ponovnega iskanja.

### Dokončanje vsebin

Vsebina se lahko označi kot dokončana na dva načina:

1. uporabnik ročno označi modul ali učno enoto kot dokončano,
2. sistem po rešenem vprašalniku določi, katere vsebine so že osvojene.

### Prikaz napredka

Napredek se prikaže na straneh učnih poti, modulov in učnih enot. Uporabniku pomaga razumeti, katere vsebine je že opravil in katere ga še čakajo.

---

## 12. Tok AI pomočnika

AI pomočnik je namenjen podpori pri razumevanju učnih vsebin in vprašanj.

Prikazan je:

- na straneh podrobnosti učnih poti,
- na straneh podrobnosti modulov,
- na straneh podrobnosti učnih enot,
- pri vprašalniku.

Na straneh podrobnosti se lahko uporabnik pogovarja z AI pomočnikom o prikazani vsebini in dobi dodatno razlago.

Pri vprašalniku AI pomočnik pomaga uporabniku razumeti vprašanje, kontekst vprašanja ali pomen določene učne vsebine.

---

## 13. Tok glasovne pomoči

Glasovna pomoč je vključena pri vprašalniku.

Uporabniku omogoča bolj dostopno in prijazno izpolnjevanje vprašalnika, posebej v primerih, ko želi vprašanja poslušati ali dobiti glasovno podporo.

Osnovni namen glasovne pomoči je izboljšati dostopnost in uporabniško izkušnjo pri samoocenjevanju.

---
