# Logika za gostovske odgovore vprašalnikov

Ta dokument opisuje dogovorjeno logiko za shranjevanje odgovorov iz vprašalnikov, kadar uporabnik uporablja aplikacijo kot gost.

Namen rešitve je, da lahko gost izpolnjuje vprašalnike brez prijave, po prijavi ali registraciji pa se sam odloči, ali želi te odgovore shraniti v svoj profil.

---

## 1. Gost uporabnik

Gost lahko uporablja vprašalnike brez prijave.

Med uporabo kot gost se njegovi odgovori iz vprašalnikov začasno shranjujejo v `sessionStorage`.

Gost lahko:

- rešuje vprašalnike
- začasno hrani odgovore vprašalnikov v `sessionStorage`

Gost ne more:

- shranjevati učnih poti, modulov ali učnih enot
- všečkati vsebin
- označevati vsebin kot dokončane

Te akcije ostanejo dovoljene samo prijavljenim uporabnikom.

---

## 2. Prijava ali registracija uporabnika

Ko se gost registrira in prijavi ali se samo prijavi, aplikacija preveri, ali v `sessionStorage` obstajajo odgovori iz vprašalnikov.

Če odgovori obstajajo, se uporabniku prikaže popup.

Popup se prikaže samo, če obstaja vsaj en odgovorjen vprašalnik, shranjen v `sessionStorage`.

---

## 3. Besedilo popup-a

Besedilo popup-a:

```text
Med uporabo kot gost si odgovoril/a na nekaj vprašalnikov.
Želiš te odgovore shraniti v svoj profil?
```

Popup ima dva gumba:

- gumb z ikono floppy disk
- gumb z ikono trash can

Pomen gumbov:

| Ikona | Pomen |
|---|---|
| Floppy disk | Shrani gostovske odgovore v profil |
| Trash can | Zavrzi gostovske odgovore |

Gumba sta lahko prikazana samo kot ikoni, brez dodatnega besedila, da popup ostane preprost.

---

## 4. Če uporabnik izbere shranjevanje

Če uporabnik klikne gumb z ikono floppy disk:

- shranijo se samo odgovorjeni vprašalniki
- odgovori iz `sessionStorage` se prenesejo v profil uporabnika
- obstoječi odgovori za iste vprašalnike se posodobijo
- ostali podatki uporabnika ostanejo nespremenjeni

To pomeni, da se override izvede samo nad odgovorjenimi vprašalniki.

Ne spreminjajo se:

- shranjene vsebine
- všečkane vsebine
- dokončane vsebine
- učne poti
- moduli
- učne enote

Po uspešnem shranjevanju se gostovski odgovori izbrišejo iz `sessionStorage`.

---

## 5. Če uporabnik izbere zavrženje

Če uporabnik klikne gumb z ikono trash can:

- odgovori iz `sessionStorage` se ne shranijo v profil
- obstoječi podatki uporabnika ostanejo nespremenjeni
- gostovski odgovori se izbrišejo iz `sessionStorage`

---

## 6. Merge logika

Merge logika velja samo za odgovore vprašalnikov.

Ne izvajamo merge logike za:

- shranjene vsebine
- všečkane vsebine
- dokončane vsebine

Razlog je, da gost teh akcij ne more izvajati.

Zato ni konfliktov med gostovskim in uporabniškim stanjem pri shranjenih, všečkanih ali dokončanih vsebinah.

---

## 7. Pravilo za override

Pri prenosu gostovskih odgovorov velja naslednje pravilo:

```text
Gostovski odgovori override-ajo samo iste odgovorjene vprašalnike v profilu.
```

Primer:

1. Uporabnik ima že shranjen odgovor za vprašalnik A.
2. Kot gost ponovno odgovori na vprašalnik A.
3. Po prijavi izbere shranjevanje.
4. Odgovor za vprašalnik A v profilu se posodobi z gostovskim odgovorom.

Če vprašalnik ni bil odgovorjen kot gost, se obstoječi odgovor v profilu ne spremeni.

---

## 8. Kaj se ne sme zgoditi

Pri tej logiki se ne sme zgoditi, da bi gostovski podatki prepisali celoten uporabniški profil.

Prav tako se ne sme zgoditi, da bi gostovski odgovori vplivali na:

- dokončanost učne poti
- dokončanost modula
- dokončanost učne enote
- shranjene vsebine
- všečkane vsebine

Shranjujejo oziroma posodabljajo se samo odgovori vprašalnikov.

---

## 9. Namen rešitve

Namen te logike je:

- omogočiti uporabo vprašalnikov brez prijave
- preprečiti izgubo odgovorov po prijavi
- uporabniku dati izbiro
- ne spreminjati drugih delov profila
- preprečiti nepotrebne merge konflikte
- ohraniti obstoječo logiko za shranjevanje, všečkanje in dokončanje vsebin

---

## 10. Povzetek

Gost lahko rešuje vprašalnike, njegovi odgovori pa se začasno hranijo v `sessionStorage`.

Po prijavi ali registraciji aplikacija preveri, ali obstajajo gostovski odgovori.

Če obstajajo, se uporabniku prikaže vprašanje:

```text
Med uporabo kot gost si odgovoril/a na nekaj vprašalnikov.
Želiš te odgovore shraniti v svoj profil?
```

Če uporabnik klikne gumb z ikono floppy disk, se odgovorjeni vprašalniki shranijo v profil.

Če uporabnik klikne gumb z ikono trash can, se gostovski odgovori zavržejo.

Shranjujejo oziroma prepisujejo se samo odgovorjeni vprašalniki.
