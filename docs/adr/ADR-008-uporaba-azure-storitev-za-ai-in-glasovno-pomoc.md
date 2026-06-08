# ADR-008: Uporaba Azure storitev za AI in glasovno pomoč

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo vključuje funkcionalnosti, ki presegajo osnovni prikaz učnih poti, modulov in učnih enot. Sistem uporabniku omogoča tudi kontekstualno pomoč pri razumevanju učnih vsebin in vprašanj ter glasovno pomoč pri izpolnjevanju vprašalnika.

Za te funkcionalnosti aplikacija potrebuje zunanje storitve, ki omogočajo:

* pripravo kontekstualnih AI odgovorov,
* pripravo besedila, primernega za glasovno predvajanje,
* pretvorbo besedila v govor,
* shranjevanje ustvarjenih zvočnih datotek oziroma povezanih datotek.

Ker bi lastna implementacija takšnih funkcionalnosti zahtevala veliko dodatne infrastrukture, modelov, vzdrževanja in optimizacije, je bila sprejeta odločitev, da se za ta del sistema uporabijo Microsoft Azure storitve.

## Odločitev

Za AI pomočnika in glasovno pomoč se uporabljajo Microsoft Azure storitve:

* **Azure OpenAI** za kontekstualnega AI pomočnika in pripravo besedila za glasovno predvajanje,
* **Microsoft Speech Service** za pretvorbo besedila v govor,
* **Azure Blob Storage** za shranjevanje zvočnih datotek oziroma povezanih datotek.

Izbira Azure storitev je bila sprejeta tudi zato, ker je ekipa imela dostop do Azure okolja, kar je omogočilo hitrejšo integracijo in manjše dodatne stroške v razvojni fazi.

Backend je osrednji del sistema, ki komunicira z Azure storitvami. Frontend ne kliče Azure storitev neposredno, ampak pošlje zahtevo backendu. Backend pripravi ustrezen kontekst, izvede klic na zunanjo storitev in rezultat vrne frontendu v obliki, ki je primerna za prikaz ali predvajanje.

Pri AI pomočniku backend pripravi kontekst glede na trenutno vsebino, vprašanje ali del aplikacije, v katerem se uporabnik nahaja. Azure OpenAI nato pripravi odgovor, ki uporabniku pomaga razumeti vsebino ali vprašanje.

Pri glasovni pomoči backend pripravi besedilo, ki je primerno za glasovno predvajanje. To besedilo se nato posreduje storitvi Microsoft Speech Service, ki ustvari zvočno datoteko. Ustvarjena zvočna datoteka se shrani v Azure Blob Storage, backend pa frontendu vrne zvočni stream oziroma podatke, potrebne za predvajanje.

## Posledice

### Prednosti

* Sistem lahko uporablja zmogljive zunanje storitve brez razvoja lastnih AI in govornih modelov.
* Backend ostane osrednja točka za komunikacijo z zunanjimi storitvami.
* Frontend ni neposredno povezan z Azure storitvami, kar izboljša ločevanje odgovornosti.
* Lažje je nadzorovati, katere podatke sistem pošilja zunanjim storitvam.
* Azure Blob Storage omogoča shranjevanje in ponovno uporabo ustvarjenih zvočnih datotek.
* Rešitev je razširljiva za prihodnje funkcionalnosti, kot so dodatni jeziki, različni glasovi ali naprednejši AI pomočnik.

### Slabosti / omejitve

* Sistem je odvisen od zunanjih Microsoft Azure storitev.
* Zunanji klici lahko vplivajo na odzivni čas.
* V primeru nedostopnosti zunanje storitve mora aplikacija ustrezno obravnavati napako.

## Alternativne možnosti

### Neposredno klicanje Azure storitev iz frontenda

Frontend bi lahko neposredno komuniciral z Azure storitvami.

Ta možnost ni bila izbrana, ker bi frontend postal preveč odvisen od zunanjih storitev, težje bi bilo nadzorovati podatke in konfiguracijo, hkrati pa bi se povečalo tveganje za izpostavljanje občutljivih nastavitev.

### Uporaba drugih zunanjih ponudnikov

Možna bi bila tudi uporaba drugih zunanjih ponudnikov za AI pomočnika, pretvorbo besedila v govor in shranjevanje datotek, na primer ločena uporaba OpenAI API, drugih text-to-speech storitev ali drugega sistema za shranjevanje datotek.

Ta možnost ni bila izbrana, ker je ekipa imela dostop do Microsoft Azure okolja, Azure OpenAI, Microsoft Speech Service in Azure Blob Storage pa omogočajo povezano rešitev znotraj istega ekosistema. S tem se zmanjša kompleksnost integracije, razvoj je hitrejši, stroški v razvojni fazi pa ostanejo bolj obvladljivi.

### Brez AI in glasovne pomoči

Aplikacija bi lahko delovala samo kot klasičen priporočilni sistem brez dodatnega AI pomočnika in glasovne podpore.

Ta možnost ni bila izbrana, ker AI pomočnik in glasovna pomoč izboljšata uporabniško izkušnjo, razumljivost vprašanj in dostopnost aplikacije.

## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Tehnološki sklad](../02-tehnoloski-sklad.md)
* [API endpointi](../06-api-endpointi.md)
* [ADR-009: Uporaba predpomnjenja za glasovno pomoč](ADR-009-uporaba-predpomnjenja-za-glasovno-pomoc.md)
