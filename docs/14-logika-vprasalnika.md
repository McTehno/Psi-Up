# Logika vprašalnika

Ta dokument opisuje logiko delovanja vprašalnika v aplikaciji **NIDiKo**.

Vprašalnik se uporablja za preverjanje uporabnikovega trenutnega znanja in za določanje primerne začetne točke učenja.

Vprašalnik se lahko odpre na treh ravneh:

- učna enota,
- modul,
- učna pot.

Logika prikaza vprašanj je odvisna od ravni, na kateri uporabnik odpre vprašalnik.

---

## 1. Vprašalnik za učno enoto

Če uporabnik odpre vprašalnik za posamezno učno enoto, se prikažejo vsa vprašanja, ki pripadajo tej učni enoti.

Pri vprašalniku za učno enoto odgovor **NE** ne prekine vprašalnika in ne preskoči nobenega vprašanja.

Pravilo:

```text
DA → prikaže se naslednje vprašanje
NE → prikaže se naslednje vprašanje
```

Vprašalnik se zaključi šele, ko uporabnik odgovori na zadnje vprašanje izbrane učne enote.

Ta logika se uporablja zato, ker je učna enota najmanjša vsebinska celota. Pri preverjanju posamezne učne enote želimo pridobiti celoten pregled uporabnikovega znanja znotraj te enote.

---

## 2. Vprašalnik za modul

Modul je sestavljen iz več učnih enot. Pri vprašalniku za modul se vprašanja obravnavajo po učnih enotah.

Ena skupina vprašanj predstavlja eno učno enoto.

Primer:

```text
Modul
├── učna enota 1
├── učna enota 2
└── učna enota 3
```

Vprašanja se uporabniku prikazujejo po vrstnem redu učnih enot.

### Zaporedne učne enote

Če učna enota ni del vzporedne skupine, velja naslednje pravilo:

```text
DA → uporabnik nadaljuje z naslednjim vprašanjem
NE → vprašalnik se zaključi
```

Odgovor **NE** pomeni, da uporabnik nima dovolj znanja za trenutno vsebino, zato nadaljnje preverjanje naslednjih zaporednih vsebin ni smiselno.

Pri zaporednih učnih enotah so prejšnje vsebine pogoj oziroma potrebno predznanje za razumevanje naslednjih vsebin

---

## 3. Vzporedne učne enote znotraj modula

Modul lahko vsebuje vzporedne učne enote. To so učne enote, ki imajo isti vrstni red oziroma isti `order` in isto vrednost `parallel_group`.

Primer:

```text
učna enota 0
↓
parallel_group A
├── učna enota 1
├── učna enota 2
└── učna enota 3
↓
učna enota 4
```

Vzporedne učne enote predstavljajo različne vsebine na isti stopnji modula.

Pri vzporedni skupini vprašalnik preveri vse vzporedne učne enote.

Če uporabnik znotraj trenutne vzporedne učne enote odgovori **NE**, se preostala vprašanja te učne enote preskočijo, vprašalnik pa nadaljuje s prvo naslednjo učno enoto v isti vzporedni skupini.

Primer:

```text
učna enota 1:
  vprašanje 1 = DA
  vprašanje 2 = NE

Rezultat:
  preskočijo se preostala vprašanja učne enote 1
  vprašalnik nadaljuje z učno enoto 2
```

Če uporabnik na vsa vprašanja trenutne vzporedne učne enote odgovori **DA**, se vprašalnik prav tako nadaljuje na naslednjo vzporedno učno enoto.

Primer:

```text
učna enota 1: vse DA → učna enota 2
učna enota 2: vse DA → učna enota 3
```

Ko uporabnik pride do zadnje učne enote v vzporedni skupini, sistem preveri odgovore celotne vzporedne skupine.

Če je bil znotraj vzporedne skupine vsaj en odgovor **NE**, se vprašalnik po koncu vzporedne skupine zaključi.

Če so bila vsa vprašanja v vseh vzporednih učnih enotah odgovorjena z **DA**, se vprašalnik nadaljuje na naslednjo vsebinsko stopnjo.

Primer brez negativnih odgovorov:

```text
učna enota 1: vse DA
učna enota 2: vse DA
učna enota 3: vse DA

Rezultat:
  vprašalnik nadaljuje na učno enoto 4
```

Primer z negativnim odgovorom:

```text
učna enota 1: vse DA
učna enota 2: eno vprašanje NE
učna enota 3: vse DA ali NE

Rezultat:
  po koncu vzporedne skupine se vprašalnik zaključi
```

---

## 4. Vprašalnik za učno pot

Vprašalnik za učno pot deluje podobno kot vprašalnik za modul, vendar je bolj splošen.

Učna pot je sestavljena iz korakov. Posamezen korak je lahko:

- učna enota,
- modul.

Zato se pri vprašalniku za učno pot vprašanja združujejo po trenutni vsebinski celoti oziroma koraku učne poti.

Če je korak učna enota, skupina vprašanj predstavlja to učno enoto.

Če je korak modul, skupina vprašanj predstavlja ta modul.

Primer:

```text
Učna pot
├── učna enota 1
├── modul 1
├── modul 2
└── učna enota 2
```

Pri takšni strukturi lahko vprašalnik najprej prikaže vprašanja za učno enoto, nato vprašanja za modul, nato vprašanja za naslednji modul in tako naprej.

---

## 5. Vzporedne vsebine znotraj učne poti

Učna pot lahko vsebuje tudi vzporedne vsebine. Pri učni poti vzporedna vsebina ni nujno učna enota. Lahko je tudi modul.

Primer:

```text
učna enota 0
↓
modul 1
↓
parallel_group A
├── modul 2
└── modul 3
↓
učna enota 4
```

V tem primeru sta `modul 2` in `modul 3` vzporedni vsebini znotraj učne poti.

Pravilo je enako kot pri vzporednih učnih enotah v modulu:

```text
NE znotraj trenutne vzporedne vsebine
→ preskočijo se preostala vprašanja trenutne vsebine
→ vprašalnik nadaljuje pri naslednji vzporedni vsebini
```

Če so vse vzporedne vsebine odgovorjene samo z **DA**, se vprašalnik nadaljuje na naslednjo stopnjo učne poti.

Če je v vzporedni skupini vsaj en odgovor **NE**, se vprašalnik po koncu vzporedne skupine zaključi.

---

### Podvajanje vprašanj

Pri vprašalniku za učno pot se lahko ista učna enota pojavi v več modulih. Posledično bi se lahko ista vprašanja pojavila večkrat.

Sistem zato pri sestavljanju vprašalnika odstrani podvojena vprašanja. Vprašanje se upošteva samo enkrat, tudi če je njegova učna enota vključena v več modulov znotraj iste učne poti.


## 6. Določanje skupin vprašanj

Backend vrne vprašalnik kot seznam vprašanj. Vsako vprašanje vsebuje podatke, ki določajo, kateri vsebini pripada:

```text
learning_path_id
module_id
learning_unit_id
order
parallel_group
```

Frontend iz teh podatkov sestavi skupine vprašanj.

Pri vprašalniku za učno enoto:

```text
skupina = učna enota
```

Pri vprašalniku za modul:

```text
skupina = učna enota znotraj modula
```

Pri vprašalniku za učno pot:

```text
skupina = trenutni korak učne poti
```

Pri učni poti je trenutni korak lahko modul ali učna enota.

To pomeni:

```text
če vprašanje pripada modulu → skupina je modul
če vprašanje pripada učni enoti → skupina je učna enota
```

Na ta način lahko ista frontend logika podpira vprašalnike na različnih ravneh.

---

## 7. Določanje vzporednih skupin

Vprašanje oziroma vsebina je del vzporedne skupine, če ima določeno vrednost `parallel_group`.

Za pravilno ločevanje vzporednih skupin se poleg `parallel_group` upošteva tudi vrstni red oziroma `order`.

Pri učni poti se upošteva tudi `learning_path_id`, pri modulu pa kontekst modula.

To prepreči, da bi se dve različni vzporedni skupini z enakim imenom napačno obravnavali kot ista skupina.

---

## 8. Povzetek pravil

| Raven vprašalnika | Kaj predstavlja skupina vprašanj | Kaj se zgodi pri DA | Kaj se zgodi pri NE |
|---|---|---|---|
| Učna enota | Učna enota | Prikaže se naslednje vprašanje | Prikaže se naslednje vprašanje |
| Modul | Učna enota znotraj modula | Prikaže se naslednje vprašanje ali naslednja učna enota | Če ni vzporedna: vprašalnik se zaključi. Če je vzporedna: nadaljuje pri naslednji vzporedni učni enoti. |
| Učna pot | Korak učne poti: modul ali učna enota | Prikaže se naslednje vprašanje ali naslednji korak | Če ni vzporedna: vprašalnik se zaključi. Če je vzporedna: nadaljuje pri naslednji vzporedni vsebini. |

---

## 9. Namen take logike

Tak način delovanja omogoča, da vprašalnik ostane smiseln in uporabniku ne prikazuje nepotrebnih vprašanj.

Če uporabnik pri zaporedni vsebini odgovori **NE**, nadaljevanje pogosto ni več smiselno, ker naslednje vsebine temeljijo na predznanju iz trenutne vsebine.

Pri vzporednih vsebinah odgovor **NE** ne pomeni takojšnjega zaključka, ker lahko uporabnik še vedno pozna drugo vzporedno vsebino na isti stopnji. Zato vprašalnik preveri vse vzporedne možnosti in se šele po koncu vzporedne skupine odloči, ali se lahko nadaljuje na naslednjo stopnjo.

---

## 10. Povzetek

Vprašalnik v aplikaciji NIDiKo podpira različne ravni preverjanja znanja: učno enoto, modul in učno pot.

Pri učni enoti se vedno preverijo vsa vprašanja. Pri modulu in učni poti pa vprašalnik upošteva zaporedje vsebin in vzporedne skupine, zato lahko ob negativnem odgovoru preskoči nepotrebna vprašanja ali zaključi preverjanje.

Takšna logika omogoča bolj prilagojeno, krajše in uporabniku prijaznejše preverjanje znanja.
