# WAAR HET WERK KOMT

Dit spel krijgt een eigen GitHub-repo: `roblox-heist-game` (privé). Alles wat je voor het spel maakt (dit gameplan, latere documenten, later de code) hoort daar, en nergens anders. De repo `brouwersstraat-21` is mijn huisapp en heeft niets met het spel te maken: zet daar niets in.

Kijk eerst of `roblox-heist-game` bestaat en of je er toegang toe hebt.

- **Bestaat hij en heb je toegang:** zet het document dat je maakt erin als `docs/gameplan-roblox.md`, en zet deze prompt erin als `docs/roblox-prompt.md`.
- **Bestaat hij niet, of heb je geen toegang:** begin niet aan een omweg. Geef me eerst deze stappen, in gewone taal:
  1. Ga naar github.com/new.
  2. Vul bij *Repository name* `roblox-heist-game` in.
  3. Kies **Private**.
  4. Vink **Add a README file** aan.
  5. Klik op **Create repository**.
  6. Ga naar https://claude.ai/connect-github en geef de Claude GitHub-app toegang tot de nieuwe repo. Heb ik bij het installeren gekozen voor "alleen geselecteerde repo's", dan moet ik hem daar aanvinken.

  Schrijf het document daarna gewoon in de chat, zodat ik het niet kwijtraak. Je zet het in de repo zodra ik zeg dat de toegang klaar is.

# MIJN TOOLS EN PLUGINS

Dit zijn de tools en plugins die ik wil gebruiken om het spel te bouwen. Ik heb nog niets ervan geïnstalleerd of ingesteld.

1. Rojo
2. Roblox Studio MCP
3. Claudio
4. Roblox Engineer Skill
5. Vibe Coder
6. Vibe Code City
7. Blender MCP
8. MCPBridge
9. Roblox Blender Plugin
10. Blender Animations Plugin
11. RBXMonkey

Houd in je hele ontwerp rekening met deze toolset, vooral in de bouwvolgorde. Controleer per tool wat hij precies doet. Ken je een tool niet, of weet je niet zeker of het de tool is die ik bedoel, zeg dat dan in plaats van te gokken. Geef ook aan als twee tools hetzelfde doen, zodat ik er één kan laten vallen, en als er voor mijn spel iets belangrijks ontbreekt.

# ROL

Je bent een ervaren Roblox-gamedesigner. Je hebt meerdere succesvolle co-op-games op Roblox uitgebracht en kent het platform door en door: het publiek, de leeftijdslabels, de verdienregels, de beperkingen van mobiel spelen en wat spelers wel en niet pikken. Je bent eerlijk en kritisch. Als iets uit mijn concept niet werkt op Roblox, zeg je dat en geef je een betere oplossing in plaats van het weg te poetsen.

# TAAK

Zet mijn bestaande gameconcept om naar een volledig gameplan voor Roblox. Het concept is ontworpen als gewone pc-game. Ik wil dat de kern (wat het spel uniek en leuk maakt) overeind blijft, en dat alles eromheen wordt aangepast aan Roblox. Er wordt nu nog niets gebouwd: ik wil alleen het ontwerp, geen code.

Ik ben beginner. Leg elk technisch Roblox-begrip dat je voor het eerst noemt in één korte zin uit (bijvoorbeeld: private server, game pass, developer product, TeleportService, leeftijdslabel, server/client).

Schrijf in het Nederlands. Teksten die spelers in het spel zien (knoppen, meldingen, namen van gadgets) schrijf je in het Engels, omdat het spel internationaal moet werken.

# HET CONCEPT (zoals het nu is)

Als het volledige gameplan (unpaid-gameplan.md) is bijgevoegd, is dat de bron. Hieronder staat de samenvatting van de kern; als het document en deze samenvatting elkaar tegenspreken, wint deze samenvatting, want die is nieuwer.

**Wie ben je:** vier vrienden met een busje, zonder werkgever. Jullie plegen kleine, slimme inbraken (stealth-heists) in herkenbare, Nederlands aanvoelende plekken.

**Pijler:** voorbereiding is je enige wapen. Je wint door te plannen en samen te werken, niet door te vechten.

**De spil, de keten:** elke hindernis wordt opgelost in drie stappen: *zien → vrijmaken → openen*, binnen een venster van 8 tot 12 seconden. Elk gadget opent alleen een venster, nooit een heel pad. Niemand kan één stap alleen zetten. Voorbeeld: de EMP legt camera's 8 seconden plat, maar de EMP-speler ziet niet of de gang vrij is. Dat ziet de drone-operator, die moet stilstaan om te kijken. De drone ziet de bewaker, maar krijgt hem niet weg; dat doet de afleidingsspeler. De deur erachter gaat alleen open met het breekijzer, en dat maakt lawaai, dus het moet precies tijdens de afleiding gebeuren.

**De zes gadgets:**
1. LAN-drone: verkennen, bewakers en camera's zien.
2. Camera-set: vaste camera's die je zelf ophangt om een gebied in de gaten te houden.
3. Afleidingskit: geluid of beweging die bewakers weglokt.
4. EMP: legt elektronica een paar seconden plat. Ook je eigen drone en camera's! Dat is bewust: het is het belangrijkste comedy-moment van het spel.
5. Breekijzer: opent deuren, kasten en luiken, maar maakt lawaai.
6. Haspel: (kabel/lijn) om buit en spelers over obstakels of naar het busje te krijgen.

**Gear:** er zijn standaardgadgets die de crew aan het begin van een run onderling verdeelt, en extra gadgets die je met spelgeld koopt. Extra gadgets zijn zijwaarts, niet sterker: ze lossen dezelfde drie stappen op een andere manier op. Een nieuwe speler mag daardoor nooit nutteloos zijn.

**De inzet:** word je gepakt, dan raak je het gadget kwijt dat je op dat moment draagt. Een teamgenoot bevrijden betekent dus ook zijn dure gadget terughalen.

**Buit dragen:** wie buit draagt, valt uit de keten (kan zijn gadget niet gebruiken). Dragen en nuttig zijn sluiten elkaar uit.

**Tegenstanders:** bewakers (NPC's), camera's, een hond die op de drone jaagt, en Asset Recovery, een dreiging die op actieve elektronica afkomt. Je eigen gadgets verraden je dus; uitzetten betekent blind gaan. Er is een alarmladder die oploopt naarmate je meer opvalt.

**Dekmantel:** je draagt werkkleding. De informatie uit de verkenning helpt je een aanspreking door een NPC te overleven.

**Sporen:** je laat sporen achter (voetstappen, kapot glas, verplaatste spullen) die bewakers kunnen vinden. Sporen wissen kost een verbruiksspul. Er is een NPC Karel die hierin een rol speelt.

**Geweld:** er is een klein beetje geweld en bloed waar het past, onder één regel: geweld is nooit een oplossing, altijd een gevolg. Bloed is informatie (een spoor), geen spektakel.

# ROBLOX-VOORWAARDEN WAAR JE REKENING MEE MOET HOUDEN

Controleer elk punt hieronder zelf; als iets niet meer klopt met de huidige Roblox-regels, zeg dat.

- **Publiek:** veel spelers zijn 9 tot 15 jaar. Kies een leeftijdslabel (Minimal, Mild, Moderate of Restricted) en leg uit wat dat betekent voor het geweld en het bloed. Mijn voorkeur: zo jong mogelijk publiek, met bloed als cartoonachtig spoor of helemaal geen bloed. Zeg wat de beste keuze is.
- **Geen voicechat voor iedereen:** spelers onder 13 hebben geen voicechat. De keten draait om overleg, dus ontwerp een uitgebreid ping- en snelcommunicatiesysteem (bijvoorbeeld op een bewaker tikken, knoppen als "NOW!" en "WAIT").
- **Mobiel eerst:** meer dan de helft speelt op telefoon of tablet. Ontwerp de besturing voor touchscreen, met per gadget één duidelijke knop. Geef aan of het venster van 8 tot 12 seconden op mobiel langer moet worden.
- **Korte sessies:** runs van ongeveer 10 tot 15 minuten.
- **Vrienden en vreemden:** het spel moet werken met vier vrienden in een private server, maar ook met vreemden via matchmaking en met minder dan vier spelers (1, 2 of 3). Hoe vang je dat op zonder de keten te breken?
- **Verdienen:** spullen die met Robux (echt geld) zijn gekocht mogen nooit kwijtraken. Ontwerp de inzet zo dat alleen gear die met spelgeld is gekocht verloren kan gaan. Geen pay-to-win: met Robux verkoop je bij voorkeur uiterlijk (skins voor drone, busje, outfits) en gemak. Houd je aan de Roblox-regels over betaalde willekeurige items.
- **Concurrentie:** Entry Point en Notoriety zijn bestaande stealth-heistgames op Roblox. Leg uit waarin mijn spel duidelijk anders moet zijn en hoe je dat in de eerste minuut laat zien.
- **Roblox-stijl:** wat moet er aan de art-stijl, de sfeer en de Nederlandse setting veranderen om in de Roblox-catalogus op te vallen?
- **Haalbaarheid:** ik ben beginner en werk (bijna) alleen. Geef aan wat realistisch is om eerst te bouwen en wat later kan.

# WAT IK VAN JE TERUG WIL

Lever één samenhangend document met deze onderdelen, in deze volgorde:

1. **Samenvatting in vijf zinnen:** wat is dit spel op Roblox, voor wie, en waarom zou iemand het spelen in plaats van Entry Point.
2. **Wat blijft, wat verandert, wat vervalt:** een tabel met elk onderdeel van het concept en per onderdeel: blijft / past aan / vervalt, met reden.
3. **De keten op Roblox:** hoe de drie stappen werken met touchscreen, zonder voice, en met 1 tot 4 spelers. Inclusief het ping-systeem.
4. **De zes gadgets op Roblox:** per gadget hoe je het gebruikt (pc, mobiel, controller), wat het doet in de keten, en hoe het kan falen. Plus twee of drie voorbeelden van extra gadgets die zijwaarts zijn.
5. **Geweld, bloed en leeftijdslabel:** jouw advies, en hoe de sporen dan werken.
6. **Spellus en sessie:** van lobby naar busje naar run naar terug, met tijden in minuten.
7. **Inzet, progressie en economie:** wat je verdient, wat je kunt verliezen, hoe een nieuwe speler meteen nuttig is.
8. **Verdienmodel:** game passes en developer products met voorbeeldprijzen in Robux, en wat je bewust niet verkoopt.
9. **Tegenstanders en alarmladder:** bewakers, camera's, de hond, Asset Recovery, aangepast aan korte runs.
10. **Eerste map:** één concrete eerste locatie met plattegrond in woorden, zodat de keten er drie keer in voorkomt.
11. **De eerste 5 minuten van een nieuwe speler:** stap voor stap, inclusief hoe het spel de keten uitlegt zonder lange tutorial.
12. **Bouwvolgorde voor een beginner:** fases (prototype → speelbare test met vrienden → eerste release → updates), met per fase wat erin zit, welke tools uit mijn lijst ik daarvoor gebruik, en hoe je weet dat de fase klaar is.
13. **Risico's:** de vijf grootste redenen waarom dit op Roblox zou kunnen mislukken, en per risico wat je eraan doet.
14. **Titelopties:** tien namen die werken op Roblox (kort, Engels, goed zoekbaar), met per naam één zin waarom. De werktitel UNPAID past niet meer bij het concept.
15. **Opzetplan voor mijn tools:** een tabel met per tool uit de lijst bovenaan: wat hij doet, waarvoor ik hem in dit spel gebruik, in welke bouwfase ik hem nodig heb, en of ik hem kan overslaan. Daarna de installatievolgorde in stappen voor een beginner: wat eerst moet (bijvoorbeeld Roblox Studio en Blender zelf), welke tools van elkaar afhangen, en hoe ik per tool controleer of hij werkt. Zet bij elke plugin die ik uit de Roblox Creator Store of van internet haal hoe ik controleer of hij betrouwbaar is: plugins kunnen schadelijke scripts bevatten.

# REGELS VOOR JE ANTWOORD

- Wees concreet: getallen, seconden, prijzen, voorbeelden. Geen vage zinnen als "zorg voor een goede balans".
- Zoek actief naar tegenstrijdigheden in mijn concept en benoem ze.
- Als je iets niet zeker weet over de huidige Roblox-regels, zeg dat en geef aan waar ik het kan controleren.
- Schrijf geen code.
- Stel aan het eind maximaal drie vragen aan mij over keuzes die jij niet voor mij kunt maken.
