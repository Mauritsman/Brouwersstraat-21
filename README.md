# 🔥 BROUWERSSTRAAT 21

Kot-taken & afval-app voor Brouwersstraat 21, Leuven. Zes bewoners, drie verdiepen,
één vrijdag-deadline.

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

## Snel starten (5 minuten)

Je hebt [Node.js](https://nodejs.org) nodig en de **Expo Go**-app op je telefoon
(gratis in de App Store / Play Store).

```bash
npm install     # eenmalig: haalt alle onderdelen op
npm start       # start de app
```

Er verschijnt een QR-code in je terminal. Scan die met je telefoon:

- **iPhone** — met de gewone Camera-app
- **Android** — met de Expo Go-app

De app opent op je telefoon. **Dit werkt meteen, zonder Supabase.** Alles blijft dan
wel op je eigen toestel staan — handig om te testen, maar je huisgenoten zien je
vinkjes nog niet.

---

## De groep laten meekijken (Supabase)

Om de app met z'n zessen te gebruiken heb je een gratis Supabase-project nodig.

1. Maak een account op [supabase.com](https://supabase.com) en klik **New project**.
2. Ga in je project naar **SQL Editor → New query**.
3. Plak de inhoud van [`supabase/schema.sql`](supabase/schema.sql) en klik **Run**.
   Dit maakt de tabellen aan.
4. Doe hetzelfde met [`supabase/seed.sql`](supabase/seed.sql).
   Dit zet de 6 bewoners en de 4 taken erin.
5. Ga naar **Project Settings → API** en kopieer de **Project URL** en de
   **anon public key**.
6. Maak in de projectmap een bestand `.env` (kopieer `.env.example`) en vul in:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

7. Stop de app (`Ctrl+C`) en start opnieuw met `npm start`.

In het **Beheer**-scherm zie je nu onderaan of de database verbonden is.

> **Over veiligheid:** de app heeft bewust geen login — voor zes mensen is dat
> overkill. Dat betekent wel dat iedereen met je anon-sleutel de taken kan lezen en
> aanpassen. Zet `.env` dus nooit in een publieke repo (dat is al voorkomen via
> `.gitignore`). Voor een kot is dit prima; voor iets groters zou je echte accounts
> willen.

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

supabase/            schema.sql en seed.sql om de database op te zetten
scripts/             Controlescripts voor de rotatie en de afvalkalender
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

## Een echte app bouwen (later)

Expo Go is genoeg om de app dagelijks te gebruiken. Wil je een installeerbare app
in de App Store of Play Store, dan gebruik je [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform android
```

> **Let op:** in deze ontwikkelomgeving faalt de laatste stap van `expo export`
> (het omzetten naar Hermes-bytecode) door een te oude `hermesc` in de container —
> ook bij een volledig lege Expo-app. Dat ligt dus niet aan deze code: het bundelen
> zelf lukt (alle 1616 modules) en `npm start` werkt gewoon. Op een normale machine
> of via EAS Build speelt dit niet.
