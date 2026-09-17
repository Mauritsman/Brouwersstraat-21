# 🔥 BROUWERSSTRAAT 21

Kot-taken & afval-app voor Brouwersstraat 21, Leuven. Zes bewoners, drie verdiepen,
één vrijdag-deadline.

### 👉 De app staat live op **https://brouwersstraat21.netlify.app**

Open die link op je telefoon en zet hem op je startscherm (zie *Stap 3* hieronder).
Daarna staat de vlam tussen je gewone apps.

Gebouwd met **React Native + Expo** (iOS en Android) en **Supabase** als database.

---

## Wat doet de app?

- **Deze week** — wie welke taak heeft, wie al afgevinkt heeft, en een dreigende
  vrijdag-banner die roder wordt naarmate vrijdag nadert.
- **Afval** — de ophaalkalender voor de komende 8 weken, uitgerekend uit het ritme.
- **Beheer** — bewoners toevoegen of verwijderen, taken aan/uit, herinneringen instellen.

Taken roteren automatisch elke week. Je kan een taak doorgeven aan iemand anders
(bv. tijdens de examens) en de hele groep ziet wie hem nu echt heeft. Een taak die
vrijdag niet is afgevinkt komt op de **Muur van Schande** te staan.

---

## Stap 1 — Supabase opzetten (alles op je telefoon)

Zonder dit heeft elke telefoon zijn **eigen** lijst en ziet niemand elkaars
vinkjes. Supabase is de gedeelde database. Gratis, en je kan het volledig vanaf
je telefoon doen. Reken op zo'n 10 minuten.

**1. Maak een project**

Ga naar [supabase.com](https://supabase.com), maak een account en klik
**New project**. Kies een naam (bv. `brouwersstraat21`) en een regio in Europa
(bv. Frankfurt). Verzin een databasewachtwoord — je hebt het verder niet nodig,
maar bewaar het.

Het opstarten duurt een paar minuten.

**2. Zet de tabellen klaar**

Open [`supabase/setup.sql`](supabase/setup.sql) — of, makkelijker op een telefoon,
de [kale tekstversie](https://raw.githubusercontent.com/Mauritsman/Brouwersstraat-21/claude/kot-taken-afval-app-nl3zbr/supabase/setup.sql).
Selecteer alles en kopieer het.

Ga in Supabase naar **SQL Editor → New query**, plak, en klik **Run**.

Je zou `Success. No rows returned` moeten zien. Daarmee staan de vier tabellen
klaar, inclusief de 6 bewoners en de 4 taken. Je mag dit gerust nog eens draaien,
er gaat niets stuk.

**3. Haal je twee sleutels op**

Ga naar **Project Settings → API** en kopieer:

- de **Project URL** (ziet eruit als `https://xxxxx.supabase.co`)
- de **anon public** key (een lange tekst die met `eyJ` begint)

Die twee heb je nodig bij stap 2 hieronder.

> **Over veiligheid:** de anon-key hoort thuis in de app — dat is precies waar hij
> voor gemaakt is, elke Supabase-app heeft hem in de code staan. Wat hem
> normaal beschermt zijn de toegangsregels (RLS). Deze app heeft bewust geen
> login, dus die regels staan open: wie de link én de sleutel heeft, kan de
> takenlijst lezen en aanpassen. Voor een kot met zes mensen en een afwasbeurt is
> dat prima. Zet er dus geen dingen in die echt privé zijn.

Controleren of de SQL klopt (als je later iets aanpast):

```bash
npm run check:sql
```

Dat draait `setup.sql` in een echte Postgres en controleert de tabellen, de
toegangsregels en of het twee keer draaien goed gaat.

---

## Stap 2 — De app online zetten

De webversie wordt gratis gehost op [Netlify](https://netlify.com). Ook dit kan
volledig vanaf je telefoon.

1. Maak een account op netlify.com (kan met je GitHub-account).
2. Kies **Add new site → Import an existing project → GitHub** en selecteer
   deze repo, branch `claude/kot-taken-afval-app-nl3zbr`.
3. De buildinstellingen staan al klaar in [`netlify.toml`](netlify.toml), dus daar
   hoef je niets in te vullen.
4. Ga vóór de eerste build naar **Site configuration → Environment variables** en
   voeg de twee sleutels uit stap 1 toe:

   | Key | Value |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | je Project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | je anon public key |

5. Klik **Deploy**. Na een paar minuten krijg je een link.

> Voeg je de sleutels pas later toe? Klik dan op **Deploys → Trigger deploy →
> Clear cache and deploy site**, anders zit de oude versie er nog in.

---

## Stap 3 — Op het startscherm van je huisgenoten

Stuur de link naar de groep. Iedereen doet één keer dit:

**iPhone (Safari)** — open de link, tik op het deel-icoon onderaan, scroll naar
**Zet op beginscherm**.

**Android (Chrome)** — open de link, tik op de drie puntjes rechtsboven, kies
**App installeren** of **Toevoegen aan startscherm**.

Daarna staat de vlam tussen hun gewone apps, opent hij zonder browserbalk en
kunnen ze hun naam kiezen. Vanaf dan ziet iedereen dezelfde taken en vinkjes.

> **Wat je hier inlevert:** push-herinneringen werken niet in de webversie.
> De taken, de afvalkalender, het afvinken, ruilen en de Muur van Schande werken
> allemaal wel. Wil je de herinneringen toch, lees dan *Een echte app maken*
> onderaan — daarvoor heb je wel één keer een computer nodig.

---

## Met een computer werken (optioneel)

Heb je geen computer? Sla dit over — de app werkt zonder. Dit heb je alleen
nodig als je zelf iets in de code wil aanpassen.

### De code binnenhalen

De code staat op GitHub, niet op je pc. Je moet hem dus eerst binnenhalen.

**Stap 1 — Node.js installeren** (eenmalig)
Download de LTS-versie op [nodejs.org](https://nodejs.org) en installeer die.
Controleer daarna in een terminal (Windows: PowerShell, Mac: Terminal):

```bash
node -v
```

Je moet een versienummer zien, bv. `v22.x.x`.

**Stap 2 — de code downloaden**

```bash
git clone -b claude/kot-taken-afval-app-nl3zbr https://github.com/Mauritsman/Brouwersstraat-21.git
cd Brouwersstraat-21
```

Geen `git` op je pc? Ga dan naar
[de branch op GitHub](https://github.com/Mauritsman/Brouwersstraat-21/tree/claude/kot-taken-afval-app-nl3zbr),
klik op de groene knop **Code → Download ZIP**, en pak het uit.
Open daarna een terminal in die map.

---

### Testen zonder online te zetten

Dit is de snelste manier. Je hebt de **Expo Go**-app nodig — gratis in de
App Store en de Play Store.

```bash
npm install     # eenmalig: haalt alle onderdelen op (duurt ~1 minuut)
npm start       # start de app
```

Er verschijnt een QR-code in je terminal. Scan die met je telefoon:

- **iPhone** — met de gewone Camera-app
- **Android** — met de Expo Go-app zelf

De app opent op je telefoon. Je pc en je telefoon moeten wel op **hetzelfde
wifi-netwerk** zitten. Lukt dat niet, probeer dan `npx expo start --tunnel`.

**Dit werkt meteen, zonder Supabase.** Alles blijft dan wel op je eigen toestel
staan — handig om te testen, maar je huisgenoten zien je vinkjes nog niet.

> Zolang je Expo Go gebruikt moet `npm start` op je pc draaien om de app te
> openen. Voor een app die los werkt, zie *Een echte app maken* onderaan.

---

## Hoe de rotatie werkt

Er staat **nergens een lijst met "week 38 = Bas"**. De app rekent het elke keer
opnieuw uit op basis van het weeknummer. Daardoor klopt hij tot in het oneindige,
ook zonder internet, en komt elk toestel tot exact hetzelfde antwoord.

De regels (in [`src/lib/rotation.ts`](src/lib/rotation.ts)):

1. **Duo-taken** (afwas + keuken) draaien per verdiep:
   gelijkvloers → 1ste → 2de → gelijkvloers → …
2. **Solo-taken** gaan naar mensen die die week géén duo-taak hebben.
   Met 6 bewoners blijven er dus 4 over voor 3 solo-taken — elke week valt er één
   persoon vrij.
3. Het startpunt schuift elke week op, zodat niemand twee weken na elkaar dezelfde
   taak krijgt.

Controleren of dat klopt:

```bash
npm run check:rotation
```

Dat print een jaar aan taakverdelingen en telt na of iedereen even vaak aan de beurt
komt. Nu: 43–44 taken per persoon over 52 weken, en nul herhalingen.

---

## Hoe de afvalkalender werkt

Ook hier staan **geen losse datums** in de code, alleen het ritme
(in [`src/config/waste.ts`](src/config/waste.ts)):

| Fractie | Dag | Ritme |
|---|---|---|
| Restafval | vrijdag | elke week |
| GFT *(nog te bevestigen)* | vrijdag | elke week |
| PMD | donderdag | om de 2 weken |
| Papier & karton | donderdag | om de 2 weken, afwisselend met PMD |

De app rekent daaruit zelf elke ophaaldag uit, dus de kalender blijft ook na 2026
correct zonder dat je iets moet bijwerken.

Controleren:

```bash
npm run check:waste
```

### Nog uit te zoeken

Twee dingen staan nog open (de app toont ze zelf in het Afval-scherm, als open vraag
in plaats van een gok):

- Het **groene bolletje** op vrijdag naast restafval — vermoedelijk GFT, nog na te
  kijken in de legende van de Recycle!-app.
- Het **bruine bolletje** dat ongeveer 1× per maand verschijnt — betekenis onbekend.

Weet je het? Voeg het toe als regel in `COLLECTION_RULES`.

### Kerst en nieuwjaar

Rond de feestdagen schuift het schema. Kijk eind december in de Recycle!-app (die
zet er een waarschuwingsicoon bij) en vul de verschoven datums in bij
`WASTE_EXCEPTIONS` in `src/config/waste.ts`:

```ts
export const WASTE_EXCEPTIONS: WasteException[] = [
  { from: '2026-12-25', to: '2026-12-24', reason: 'Kerstmis' },
];
```

De app toont zo'n verschoven ophaling dan met een ⚠-markering.

---

## Herinneringen

De app plant de notificaties **lokaal op je toestel** in. Dat werkt zonder server en
kost niets. Telkens je de app opent worden ze opnieuw ingepland, zodat ze kloppen
met de actuele rotatie en met eventuele ruilen.

| Wanneer | Wat |
|---|---|
| Maandag 18:00 | "Jij bent aan de beurt" (alleen als je een taak hebt) |
| Donderdag 20:00 | "Laatste kans — morgen is de deadline" |
| Vrijdag 09:00 | "Alles moet proper zijn" |
| Avond voor een ophaling, 19:00 | "Zet de zak buiten" |

Aan- en uitzetten doe je per soort in het **Beheer**-scherm.

> Notificaties werken **niet** in een simulator, alleen op een echte telefoon.

---

## Iets aanpassen

| Ik wil… | Bewerk dit |
|---|---|
| Een bewoner toevoegen of verwijderen | In de app: **Beheer** |
| Een taak tijdelijk uitzetten | In de app: **Beheer** |
| Een nieuwe taak toevoegen | [`src/config/tasks.ts`](src/config/tasks.ts) — de rotatie neemt hem vanzelf mee |
| Het afvalritme wijzigen | [`src/config/waste.ts`](src/config/waste.ts) |
| Kleuren of lettertypes | [`src/theme/theme.ts`](src/theme/theme.ts) |
| De rotatieregels zelf | [`src/lib/rotation.ts`](src/lib/rotation.ts) |

Na een wijziging in `src/config/` of `src/lib/` altijd even:

```bash
npm run typecheck        # controleert op fouten
npm run check:rotation   # controleert de taakverdeling
```

---

## Mapindeling

```
app/                 De schermen (expo-router: elk bestand = één scherm)
  _layout.tsx          Start, lettertypes, naamkeuze-check
  onboarding.tsx       "Wie ben jij?" — eenmalige naamkeuze
  (tabs)/index.tsx     Deze week: taken + afval
  (tabs)/afval.tsx     Afvalkalender, legende, open vragen
  (tabs)/beheer.tsx    Bewoners, taken, herinneringen

src/
  config/            Wat je mag aanpassen: bewoners, taken, afvalritme
  lib/               De logica: datums, rotatie, afval, notificaties
  components/        Herbruikbare stukjes scherm (TaskCard, vlammen, …)
  store/             De centrale data + synchronisatie met Supabase
  theme/             Kleuren, lettertypes, afstanden

supabase/            setup.sql: één bestand dat de database opzet
scripts/             Controlescripts (rotatie, afval, SQL) en de iconen
```

---

## Design

Donker, hard, vuur. Zwarte achtergrond, oranje-rode gradients, opstijgende vonken.
Titels in **Anton** (zwaar en condensed, altijd in hoofdletters), gewone tekst in
**Barlow Condensed**. Scherpe hoeken overal — geen ronde, vriendelijke vormen.

Elke bewoner heeft een eigen vlam-kleur voor z'n naam, avatar en taken.

Een taak afvinken geeft een vonkenregen, een schermschudding, een "KLAAR!"-stempel
die inslaat, en een stevige trilling. Een gemiste taak krijgt een uitgedoofde vlam
en een knipperende rode balk met de naam erbij.

---

## Een echte app maken

Expo Go is genoeg om de app dagelijks te gebruiken, maar dan moet `npm start`
altijd op je pc draaien. Wil je een app die **los op je telefoon staat**, met een
eigen icoon, dan bouw je hem met [EAS Build](https://docs.expo.dev/build/introduction/).
Dat draait in de cloud van Expo — je hebt geen Android Studio of Xcode nodig.

```bash
npm install -g eas-cli          # eenmalig
eas login                       # gratis Expo-account aanmaken
eas build --platform android --profile preview
```

Na ~10 minuten krijg je een link naar een `.apk`-bestand. Dat stuur je door naar je
huisgenoten; zij openen het op hun Android-toestel en installeren de app.
De instellingen hiervoor staan al klaar in [`eas.json`](eas.json).

### En op iPhone? (het `.ipa`-verhaal)

iOS heeft wel degelijk een eigen versie van het `.apk`-bestand: dat heet een
**`.ipa`**. Maar daar heb je weinig aan, en dat ligt niet aan het bestand.

Het verschil is **ondertekening**. Een `.apk` kan je op Android gewoon aantikken
en installeren. Een `.ipa` moet ondertekend zijn met een *provisioning profile*
dat het toestel waarop het draait bij naam kent. Zonder die handtekening weigert
iOS het te openen — hoe je het bestand ook bij iemand krijgt.

De mogelijke routes, en waarom ze hier niet passen:

| Route | Kost | Waarom het hier strandt |
|---|---|---|
| **TestFlight** | 99 euro/jaar | Werkt prima en is het netst: huisgenoten krijgen een link, geen UDID-gedoe. Enige nadeel is de prijs. |
| **Ad hoc `.ipa`** | 99 euro/jaar | Je hebt van elke iPhone het UDID nodig. Expo's eigen documentatie noemt dit "challenging if you try to share with someone who is not a developer". |
| **Gratis Apple ID (AltStore, Sideloadly)** | gratis | De handtekening vervalt na 7 dagen. Voor zes telefoons betekent dat elke week opnieuw aansluiten op een computer. |
| **EU web distribution** | 99 euro/jaar | Sinds de EU-regels mag je in principe buiten de App Store om verdelen, maar Apple eist daarbovenop dat je bedrijf aan één van hun criteria voldoet: een miljoen installaties vorig jaar, durfkapitaal, of een bankgarantie van een miljoen dollar. Niet haalbaar voor een kot. |

**Als je ooit toch 99 euro/jaar wil uitgeven** is TestFlight de beste keuze. Je
hebt daarvoor geen Mac nodig: EAS Build maakt de iOS-build in de cloud. Je hebt
wel één keer een computer nodig (Windows of Linux volstaat) om de eerste build
op te zetten.

**Tot dan** is de webversie op het startscherm de enige manier waarop zowel
iPhone- als Android-gebruikers meedoen. Dat is geen noodoplossing van tweede
rang: hij heeft een eigen icoon, opent zonder browserbalk, en iedereen ziet
dezelfde taken. Je levert alleen de push-herinneringen in.

### Werken de herinneringen in Expo Go?

Ja. De app plant de notificaties lokaal op je toestel in, en dat werkt gewoon in
Expo Go. Wel twee dingen:

- Notificaties werken **niet** in een simulator, alleen op een echte telefoon.
- Je moet de app af en toe openen, zodat de herinneringen opnieuw ingepland worden.

---

## Bekend probleem in de ontwikkelomgeving

In de cloud-container waarin deze code geschreven is, faalt de laatste stap van
`expo export` (het omzetten naar Hermes-bytecode) door een te oude `hermesc`.
Dat is nagegaan met een volledig lege Expo-app: die faalt identiek. Het ligt dus
niet aan deze code — het bundelen zelf lukt volledig, en `npm start` en EAS Build
werken gewoon. Op een normale pc speelt dit niet.
