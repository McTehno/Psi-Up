# ADR-007: Uporaba lahkega AI modela za glasovno pomoč

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo vključuje glasovno pomoč pri izpolnjevanju vprašalnika. Namen glasovne pomoči je, da uporabniku pomaga razumeti vprašanje in možne odgovore v bolj naravni zvočni obliki.

Pri tem AI model ne sprejema glavnih pedagoških odločitev in ne izbira učne poti za uporabnika. Njegova naloga je omejena in jasno določena: na podlagi obstoječega vprašanja in možnih odgovorov pripravi besedilo, ki je primerno za glasovno predvajanje.

Za takšno nalogo ni potreben najzmogljivejši model, saj sistem ne potrebuje kompleksnega sklepanja, ampak predvsem jasno, kratko in razumljivo preoblikovanje že obstoječe vsebine.

## Odločitev

Za pripravo besedila za glasovno pomoč se uporablja lahek AI model oziroma nano model.

Model se uporablja za pripravo besedila, ki ga uporabnik kasneje sliši kot glasovno pomoč. Backend modelu posreduje dejansko vprašanje iz vprašalnika, možne odgovore in navodilo, da pripravi jasno besedilo za zvočno predvajanje.

Rezultat modela se nato posreduje storitvi za pretvorbo besedila v govor. Ustvarjena zvočna datoteka se shrani in se lahko ponovno uporabi prek mehanizma predpomnjenja.

S tem model ostane omejen na podporno nalogo, glavna struktura vprašalnika, logika ocenjevanja in priporočilna logika pa ostanejo del aplikacijske logike backenda.

## Posledice

### Prednosti

* Lahek model je primeren za kratke in dobro definirane naloge.
* Odzivni čas je lahko krajši kot pri uporabi večjih modelov.
* Stroški uporabe so nižji kot pri večjih modelih.
* Model je uporabljen samo za pripravo zvočnega besedila, ne za odločanje o rezultatih uporabnika.
* Glavna logika vprašalnika in priporočanja ostane v backendu.
* Rešitev se dobro povezuje s predpomnjenjem, saj se ustvarjeno besedilo in zvočna datoteka lahko ponovno uporabita.

### Slabosti / omejitve

* Lahek model ima lahko manjšo sposobnost razumevanja kompleksnih navodil kot večji modeli.
* Kakovost pripravljenega besedila je treba preverjati pri različnih tipih vprašanj.
* Če bi glasovna pomoč kasneje zahtevala bolj kompleksno razlago, bi bilo treba ponovno oceniti izbiro modela.

## Alternativne možnosti

### Uporaba večjega AI modela

Za pripravo glasovnih besedil bi lahko uporabili večji in zmogljivejši model.

Ta možnost ni bila izbrana, ker naloga ni dovolj kompleksna, da bi zahtevala večji model. Večji model bi lahko povečal stroške in odzivni čas, brez sorazmerne koristi za ta del sistema.

### Priprava glasovnih besedil brez AI modela

Besedilo za glasovno pomoč bi lahko bilo ustvarjeno s statičnimi pravili ali ročno pripravljenimi predlogami.

Ta možnost ni bila izbrana, ker bi bila manj prilagodljiva pri različnih tipih vprašanj in možnih odgovorov. AI model omogoča bolj naravno oblikovanje besedila za zvočno predvajanje.

### Ročno pripravljena zvočna besedila

Za vsako vprašanje bi bilo mogoče vnaprej ročno pripraviti besedilo za glasovno predvajanje.

Ta možnost ni bila izbrana, ker bi zahtevala več ročnega dela in bi bila težje vzdrževana pri spremembah vprašanj ali dodajanju novih vsebin.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Tehnološki sklad](../02-tehnoloski-sklad.md)
* [ADR-008: Uporaba Azure storitev za AI in glasovno pomoč](ADR-008-uporaba-azure-storitev-za-ai-in-glasovno-pomoc.md)
* [ADR-009: Uporaba predpomnjenja za glasovno pomoč](ADR-009-uporaba-predpomnjenja-za-glasovno-pomoc.md)
