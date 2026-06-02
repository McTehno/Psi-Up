# Logika vprašalnika v aplikaciji NIDiKo

## Namen vprašalnika

Vprašalnik pomaga uporabniku ugotoviti, katera znanja že obvlada in kje naj nadaljuje z učenjem.  
Na podlagi odgovorov sistem določi:

- katere učne enote so že dokončane,
- kateri moduli so že dokončani,
- ali je učna pot dokončana,
- katera je priporočena naslednja vsebina za uporabnika.

Vprašalnik se lahko rešuje na treh nivojih:

- učna enota,
- modul,
- učna pot.

---

## Shranjevanje odgovorov

Ko prijavljen uporabnik reši vprašalnik, se njegovi odgovori shranijo v bazo.

Za vsako vsebino se hrani samo zadnji oddani vprašalnik.  
Če uporabnik isti vprašalnik reši ponovno, se prejšnji odgovori prepišejo z novimi.

Sistem omogoča, da uporabnik svoje znanje izboljša:

- odgovor se lahko spremeni iz **NE** v **DA**,
- že dokončane vsebine pa se ne morejo poslabšati nazaj iz **DA** v **NE**.

Če je neka vsebina že dokončana, jo sistem pri novih vprašalnikih upošteva kot že znano.

---

## Vprašalnik za učno enoto

Pri vprašalniku za učno enoto uporabnik odgovori na vprašanja, vezana na vsebine in kompetence te učne enote.

Če uporabnik na vsa vprašanja odgovori z **DA**, se učna enota označi kot dokončana.

Če je vsaj eno vprašanje odgovorjeno z **NE**, učna enota ni označena kot dokončana.

---

## Vprašalnik za modul

Modul je sestavljen iz več učnih enot.

Vprašalnik za modul preverja znanje po učnih enotah znotraj modula.

Če so vsa vprašanja določene učne enote odgovorjena z **DA**, se ta učna enota označi kot dokončana.

Če so dokončane vse obvezne učne enote modula, se kot dokončan označi tudi celoten modul.

Če uporabnik ne zna določene učne enote, sistem določi, katera učna enota je priporočena za začetek ali nadaljevanje učenja.

---

## Vzporedne učne enote v modulu

Modul lahko vsebuje tudi vzporedne učne enote.

Če uporabnik pri eni vzporedni učni enoti odgovori z **NE**, sistem še vedno preveri tudi ostale učne enote v isti vzporedni skupini.

Tako lahko uporabnik na primer eno vzporedno učno enoto že obvlada, drugo pa še ne.

Modul je dokončan šele takrat, ko so dokončane vse obvezne učne enote.

---

## Vprašalnik za učno pot

Učna pot je sestavljena iz modulov in lahko vsebuje tudi neposredne učne enote.

Vprašalnik za učno pot deluje podobno kot vprašalnik za modul, vendar na višjem nivoju.

Sistem preveri:

- neposredne učne enote v učni poti,
- module v učni poti,
- učne enote znotraj teh modulov.

Če so dokončani vsi obvezni deli učne poti, se učna pot označi kot dokončana.

Učna pot se ne označuje ročno kot dokončana, ampak samo na podlagi rezultatov vprašalnika in napredka uporabnika.

---

## Vzporedni moduli v učni poti

Učna pot lahko vsebuje vzporedne module.

Če je vzporedni modul označen kot obvezen, mora biti dokončan, da se zaključi celotna učna pot.

Če je vzporedni modul neobvezen, se lahko shrani kot dokončan, vendar ne blokira zaključka učne poti.

Sistem razlikuje med obveznimi in neobveznimi vsebinami.

---

## Podvajanje učnih enot

Ista učna enota se lahko pojavi v več modulih ali na več mestih znotraj učne poti.

V takem primeru se vprašanja za to učno enoto uporabniku prikažejo samo enkrat.

Odgovori za to učno enoto pa se upoštevajo povsod, kjer se ta učna enota pojavi.

---

## Trenutna pozicija uporabnika

Po oddaji vprašalnika backend določi trenutno priporočeno pozicijo uporabnika.

To pomeni, da sistem vrne:

- kateri modul naj uporabnik začne ali nadaljuje,
- katero učno enoto naj uporabnik začne ali nadaljuje.

Če je vsebina dokončana, trenutna pozicija nima več naslednjega modula ali učne enote.

---

## Neprijavljeni uporabniki

Za neprijavljene uporabnike se rezultati ne shranjujejo v bazo uporabniškega napredka.

Rezultat vprašalnika se lahko uporabi samo začasno na strani, na primer za prikaz priporočila po reševanju vprašalnika.

---

## Povzetek

Implementirana logika omogoča, da sistem:

- shrani zadnje odgovore uporabnika,
- upošteva že dokončane vsebine,
- prepreči poslabšanje dokončanega znanja,
- določi dokončane učne enote, module in učne poti,
- podpira zaporedne in vzporedne vsebine,
- podpira obvezne in neobvezne vsebine,
- preprečuje podvajanje vprašanj,
- določi priporočeno naslednjo vsebino za uporabnika.