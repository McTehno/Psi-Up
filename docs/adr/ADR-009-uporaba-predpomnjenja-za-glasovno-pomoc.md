# ADR-009: Uporaba predpomnjenja za glasovno pomoč

## Status

Sprejeto

## Kontekst

Aplikacija NIDiKo vključuje glasovno pomoč pri izpolnjevanju vprašalnika. Namen glasovne pomoči je, da uporabniku omogoči lažje razumevanje vprašanja in možnih odgovorov tudi v zvočni obliki.

Glasovna pomoč uporablja zunanje Microsoft Azure storitve:

* **Azure OpenAI** za pripravo besedila, ki je primerno za glasovno predvajanje,
* **Microsoft Speech Service** za pretvorbo besedila v zvočno datoteko,
* **Azure Blob Storage** za shranjevanje ustvarjenih zvočnih datotek.

Brez predpomnjenja bi sistem za enako vprašanje ob vsakem zahtevku ponovno klical Azure OpenAI in Microsoft Speech Service. To bi povečalo število zunanjih klicev, podaljšalo odzivni čas in ustvarjalo nepotrebno ponovno generiranje enake vsebine.

Zato je bila sprejeta odločitev, da se za glasovno pomoč uporabi predpomnjenje.

## Odločitev

Za glasovno pomoč se uporablja predpomnjenje na podlagi hash vrednosti.

Ko frontend pošlje zahtevo za glasovno pomoč, backend najprej poišče vprašanje v MongoDB Atlas. Na podlagi vsebine vprašanja, možnih odgovorov in konfiguracije glasovne pomoči izračuna hash vrednost.

Backend nato preveri, ali za ta hash že obstaja zapis v kolekciji za predpomnjene glasovne odgovore.

Če zapis obstaja:

* backend uporabi obstoječo zvočno datoteko iz Azure Blob Storage,
* Azure OpenAI in Microsoft Speech Service se ne kličeta ponovno,
* frontend prejme zvočni stream za predvajanje.

Če zapis ne obstaja:

* backend pripravi kontekst vprašanja in možnih odgovorov,
* Azure OpenAI pripravi besedilo, ki je primerno za glasovno predvajanje,
* Microsoft Speech Service iz tega besedila ustvari zvočno datoteko,
* zvočna datoteka se shrani v Azure Blob Storage,
* backend shrani nov cache zapis v MongoDB Atlas,
* frontend prejme zvočni stream za predvajanje.

Cache zapis vsebuje:

* hash vrednost,
* ID vprašanja,
* originalno vprašanje iz vprašalnika,
* možne odgovore,
* besedilo, ki je bilo dejansko predvajano uporabniku,
* lokacijo zvočne datoteke v Azure Blob Storage,
* metapodatke o uporabljeni konfiguraciji,
* čas ustvarjanja zapisa.

Pomembno je, da se shrani tako originalno vprašanje kot tudi besedilo, ki ga je uporabnik dejansko slišal. S tem sistem ohranja sledljivost med vsebino vprašalnika in ustvarjeno glasovno vsebino.

## Posledice

### Prednosti

* Zmanjša se število ponovnih klicev na Azure OpenAI.
* Zmanjša se število ponovnih klicev na Microsoft Speech Service.
* Izboljša se odzivni čas pri vprašanjih, za katera zvočni odgovor že obstaja.
* Sistem ne generira večkrat enake zvočne vsebine.
* Zvočne datoteke so ponovno uporabne za enaka vprašanja in enako konfiguracijo.
* MongoDB Atlas omogoča sledljivost med originalnim vprašanjem, predvajanim besedilom in lokacijo zvočne datoteke.
* Rešitev je primerna za nadaljnjo razširitev, na primer za več jezikov, različne glasove ali različne konfiguracije glasovne pomoči.

### Slabosti / omejitve

* Potrebna je dodatna cache kolekcija v MongoDB Atlas.
* Če se spremeni besedilo vprašanja ali konfiguracija glasovne pomoči, mora nastati nov hash.
* Implementacija je bolj kompleksna kot neposredno generiranje zvočnega odgovora ob vsaki zahtevi.

## Alternativne možnosti

### Brez predpomnjenja

Vsaka zahteva za glasovno pomoč bi vedno sprožila nov klic na Azure OpenAI in Microsoft Speech Service.

Ta možnost je enostavnejša za implementacijo, vendar je manj učinkovita, počasnejša in povzroča nepotrebno ponovno generiranje enake vsebine.

### Shranjevanje samo zvočnih datotek brez metapodatkov

Sistem bi lahko shranil samo zvočne datoteke v Azure Blob Storage, brez dodatnega cache zapisa v MongoDB Atlas.

Ta možnost ni bila izbrana, ker ne omogoča dovolj dobre sledljivosti med originalnim vprašanjem, predvajanim besedilom in lokacijo datoteke.


## Povezani dokumenti

* [Arhitektura sistema](../03-arhitektura.md)
* [Tehnološki sklad](../02-tehnoloski-sklad.md)
* [API endpointi](../06-api-endpointi.md)
