import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const file='projects/last-low-bandwidth-message.html';

const maps={
  fr:[
    ['The Last Low-Bandwidth Message — Small-file film / Official Selection — DATA C0RE','The Last Low-Bandwidth Message — Film small-file / Sélection officielle — DATA C0RE'],
    ['One-minute small-file moving-image work selected for the 2026 Small File Media Festival in The Chaos of Quantity, Part One: Alien Capitalism.','Œuvre d’image en mouvement small-file d’une minute sélectionnée au Small File Media Festival 2026 dans The Chaos of Quantity, Part One: Alien Capitalism.'],
    ['Small-file film / official selection / 2026','Film small-file / sélection officielle / 2026'],
    ['A one-minute moving-image work made for low-bandwidth circulation, where file size and transmission become part of the work’s frame rather than a delivery afterthought.','Une œuvre d’image en mouvement d’une minute conçue pour une circulation à faible bande passante, où la taille du fichier et la transmission deviennent une composante de l’œuvre plutôt qu’une contrainte ajoutée après coup.'],
    ['<b>Work</b> DATA C0RE / moving image','<b>Œuvre</b> DATA C0RE / image en mouvement'],
    ['<b>Format</b> 1 min / 1.79 MB / France / 2026','<b>Format</b> 1 min / 1,79 MB / Vancouver, Canada / 2026'],
    ['<b>Selection</b> Small File Media Festival 2026 / Alien Capitalism','<b>Sélection</b> Small File Media Festival 2026 / Alien Capitalism'],
    ['Small-file work data','Données du film small-file'],['>duration<','>durée<'],['>1.79 MB<','>1,79 MB<'],['>festival file size<','>taille du fichier festival<'],['>LOW BANDWIDTH<','>FAIBLE BANDE PASSANTE<'],['>small-file circulation<','>circulation small-file<'],
    ['>Small-file condition<','>Condition small-file<'],['Transmission is part of the image.','La transmission fait partie de l’image.'],
    ['The Small File Media Festival frames small-file media as an intervention into bandwidth-heavy streaming infrastructures. Its 2026 call foregrounds work that can circulate through precarious infrastructure and treats compression as both a practical and aesthetic strategy.','Le Small File Media Festival présente le small-file comme une intervention face aux infrastructures lourdes du streaming. Son appel 2026 insiste sur des œuvres capables de circuler dans des contextes d’infrastructure précaire et considère la compression comme une stratégie à la fois pratique et esthétique.'],
    ['Festival framework','Cadre du festival'],
    ['Small-File Ecomedia is the festival’s term for low-bandwidth moving-image practice. The festival was founded to question the carbon and infrastructural costs of high-resolution streaming.','Small-File Ecomedia est le terme utilisé par le festival pour désigner une pratique d’image en mouvement à faible bande passante. Le festival a été fondé pour interroger les coûts carbone et infrastructurels du streaming haute résolution.'],
    ['Official festival ↗','Festival officiel ↗'],['Official selection','Sélection officielle'],
    ['Official Selection — Small File Media Festival 2026. Curated by Mena El Shazly &amp; Radek Przedpełski. Presented at The Cinematheque, Vancouver. Within Alien Capitalism, the film sits in a program concerned with accumulation, commodities, infrastructure and the political conditions of contemporary media.','Sélection officielle — Small File Media Festival 2026. Programme curaté par Mena El Shazly &amp; Radek Przedpełski. Présenté à The Cinematheque, Vancouver. Dans Alien Capitalism, le film prend place dans un programme qui aborde l’accumulation, les marchandises, les infrastructures et les conditions politiques des médias contemporains.'],
    ['>All projects<','>Tous les projets<'],['>Context<','>Contexte<']
  ],
  es:[
    ['The Last Low-Bandwidth Message — Small-file film / Official Selection — DATA C0RE','The Last Low-Bandwidth Message — Película small-file / Selección oficial — DATA C0RE'],
    ['One-minute small-file moving-image work selected for the 2026 Small File Media Festival in The Chaos of Quantity, Part One: Alien Capitalism.','Obra small-file de imagen en movimiento de un minuto seleccionada para el Small File Media Festival 2026 en The Chaos of Quantity, Part One: Alien Capitalism.'],
    ['Small-file film / official selection / 2026','Película small-file / selección oficial / 2026'],
    ['A one-minute moving-image work made for low-bandwidth circulation, where file size and transmission become part of the work’s frame rather than a delivery afterthought.','Una obra de imagen en movimiento de un minuto concebida para circular con poco ancho de banda, donde el tamaño del archivo y la transmisión forman parte de la obra en lugar de ser una limitación añadida al final.'],
    ['<b>Work</b> DATA C0RE / moving image','<b>Obra</b> DATA C0RE / imagen en movimiento'],
    ['<b>Format</b> 1 min / 1.79 MB / France / 2026','<b>Formato</b> 1 min / 1,79 MB / Vancouver, Canadá / 2026'],
    ['<b>Selection</b> Small File Media Festival 2026 / Alien Capitalism','<b>Selección</b> Small File Media Festival 2026 / Alien Capitalism'],
    ['Small-file work data','Datos de la película small-file'],['>duration<','>duración<'],['>1.79 MB<','>1,79 MB<'],['>festival file size<','>tamaño del archivo del festival<'],['>LOW BANDWIDTH<','>BAJO ANCHO DE BANDA<'],['>small-file circulation<','>circulación small-file<'],
    ['>Small-file condition<','>Condición small-file<'],['Transmission is part of the image.','La transmisión forma parte de la imagen.'],
    ['The Small File Media Festival frames small-file media as an intervention into bandwidth-heavy streaming infrastructures. Its 2026 call foregrounds work that can circulate through precarious infrastructure and treats compression as both a practical and aesthetic strategy.','El Small File Media Festival plantea el small-file como una intervención frente a las infraestructuras pesadas del streaming. Su convocatoria de 2026 destaca obras capaces de circular en contextos de infraestructura precaria y entiende la compresión como una estrategia práctica y estética.'],
    ['Festival framework','Marco del festival'],
    ['Small-File Ecomedia is the festival’s term for low-bandwidth moving-image practice. The festival was founded to question the carbon and infrastructural costs of high-resolution streaming.','Small-File Ecomedia es el término que utiliza el festival para una práctica de imagen en movimiento de bajo ancho de banda. El festival nació para cuestionar los costes de carbono e infraestructura del streaming de alta resolución.'],
    ['Official festival ↗','Festival oficial ↗'],['Official selection','Selección oficial'],
    ['Official Selection — Small File Media Festival 2026. Curated by Mena El Shazly &amp; Radek Przedpełski. Presented at The Cinematheque, Vancouver. Within Alien Capitalism, the film sits in a program concerned with accumulation, commodities, infrastructure and the political conditions of contemporary media.','Selección oficial — Small File Media Festival 2026. Programa comisariado por Mena El Shazly &amp; Radek Przedpełski. Presentado en The Cinematheque, Vancouver. Dentro de Alien Capitalism, la película forma parte de un programa sobre acumulación, mercancías, infraestructura y las condiciones políticas de los medios contemporáneos.'],
    ['>All projects<','>Todos los proyectos<'],['>Context<','>Contexto<']
  ]
};

for(const [lang,replacements] of Object.entries(maps)){
  const target=path.join(ROOT,lang,file);
  if(!fs.existsSync(target))continue;
  let html=fs.readFileSync(target,'utf8');
  for(const [from,to] of replacements)html=html.replaceAll(from,to);
  fs.writeFileSync(target,html,'utf8');
}

// Current case-study copy: the original older mapping above targets superseded text.
// Keep these exact replacements in the generator so a future localization build
// does not publish English paragraphs under FR / ES hreflang and metadata.
const currentCopy = [
  [
    "Original small-file film built at 320×240 and 10 fps through a fully generated Python, edge-tts and FFmpeg pipeline; official selection at Small File Media Festival 2026.",
    "Film original de petit format (320 × 240, 10 images/s), créé avec Python, edge-tts et FFmpeg ; sélection officielle au Small File Media Festival 2026.",
    "Película original de pequeño formato (320 × 240, 10 fotogramas/s), creada con Python, edge-tts y FFmpeg; selección oficial en el Small File Media Festival 2026."
  ],
  [
    "Solo moving-image work / small-file / 2026",
    "Œuvre audiovisuelle solo / petit fichier / 2026",
    "Obra audiovisual en solitario / archivo pequeño / 2026"
  ],
  [
    "A final transmission moves through failing infrastructure as the last archivist of Relay Seven tries to preserve proof that human life was here. Low resolution, packet loss, degraded voice and residual noise become the material of memory.",
    "Une ultime transmission traverse une infrastructure défaillante. La dernière archiviste de Relay Seven tente de préserver la preuve d’une vie humaine passée. Basse résolution, pertes de paquets, voix dégradée et bruit résiduel deviennent la matière de la mémoire.",
    "Una última transmisión atraviesa una infraestructura que falla. La última archivista de Relay Seven intenta conservar una prueba de la vida humana pasada. Baja resolución, pérdida de paquetes, voz degradada y ruido residual se convierten en materia de la memoria."
  ],
  [
    "Solo work / concept, code, image &amp; sound system",
    "Œuvre solo / concept, code, image et système sonore",
    "Obra en solitario / concepto, código, imagen y sistema sonoro"
  ],
  [
    "Still frame / readable final-message state",
    "Image fixe / message final encore lisible",
    "Fotograma / mensaje final todavía legible"
  ],
  [
    "actual runtime",
    "durée réelle",
    "duración real"
  ],
  [
    "final festival file",
    "fichier final pour le festival",
    "archivo final para el festival"
  ],
  [
    "native image",
    "image native",
    "imagen nativa"
  ],
  [
    "native frame rate",
    "cadence native",
    "frecuencia de fotogramas nativa"
  ],
  [
    "Narrative system",
    "Système narratif",
    "Sistema narrativo"
  ],
  [
    "A transmission designed to fail without disappearing.",
    "Une transmission conçue pour défaillir sans disparaître.",
    "Una transmisión concebida para fallar sin desaparecer."
  ],
  [
    "The film follows four states rather than treating glitch as surface decoration. A relay boots, fragments of ordinary life are sent as proof, the station loses coherence, then a final readable memory survives the collapse.",
    "Le film traverse quatre états, sans réduire le glitch à un effet décoratif. Un relais démarre, transmet des fragments de vie quotidienne comme preuves, puis la station perd sa cohérence ; un dernier souvenir lisible survit à l’effondrement.",
    "La película recorre cuatro estados sin reducir el glitch a un efecto decorativo. Se inicia un repetidor, se transmiten fragmentos de la vida cotidiana como prueba y la estación pierde coherencia; un último recuerdo legible sobrevive al colapso."
  ],
  [
    "Mara / Relay Seven / transmission cue",
    "Mara / Relay Seven / signal de transmission",
    "Mara / Relay Seven / señal de transmisión"
  ],
  [
    "relay context",
    "mise en route du relais",
    "activación del repetidor"
  ],
  [
    "lived fragments",
    "fragments de vie",
    "fragmentos de vida"
  ],
  [
    "signal failure",
    "défaillance du signal",
    "fallo de la señal"
  ],
  [
    "memory holds",
    "la mémoire résiste",
    "la memoria persiste"
  ],
  [
    "Built from generated image, generated sound and a synthetic voice.",
    "Créé à partir d’images et de sons générés, et d’une voix synthétique.",
    "Creada a partir de imágenes y sonidos generados, y de una voz sintética."
  ],
  [
    "No live-action footage or field recording is used in the final work. Frames, ambience, signal events, typing, narration and their degradation are produced inside the pipeline, with the bandwidth limit shaping the film from the first frame.",
    "L’œuvre finale n’utilise ni prise de vues réelles ni enregistrement de terrain. Images, ambiances, événements de signal, frappe, narration et dégradations sont produits dans le même pipeline ; la contrainte de bande passante détermine le film dès la première image.",
    "La obra final no utiliza imágenes filmadas ni grabaciones de campo. Fotogramas, ambientes, eventos de señal, tecleo, narración y degradaciones se producen en un mismo proceso; el límite de ancho de banda determina la película desde el primer fotograma."
  ],
  [
    "Programmatic scenes, terminal graphics, monitor surface, scanlines, dropout and image degradation.",
    "Scènes programmées, graphismes de terminal, surface d’écran, lignes de balayage, pertes de signal et dégradation de l’image.",
    "Escenas programadas, gráficos de terminal, superficie de monitor, líneas de barrido, pérdidas de señal y degradación de imagen."
  ],
  [
    "The visual system is generated directly at the final low-resolution frame scale.",
    "Le système visuel est généré directement à sa résolution finale réduite.",
    "El sistema visual se genera directamente a su baja resolución final."
  ],
  [
    "Hum, air, pulses, bursts, glitch clicks, typing, data whispers, crackle, hiss and final tones are synthesized in code.",
    "Bourdonnements, souffles, pulsations, salves, clics de glitch, frappes, murmures de données, craquements et tonalités finales sont synthétisés par le code.",
    "Zumbidos, aire, pulsos, ráfagas, clics de glitch, tecleo, susurros de datos, chasquidos y tonos finales se sintetizan mediante código."
  ],
  [
    "The English narration is synthesized cue by cue, then divided into clean, failing and burn states.",
    "La narration anglaise est synthétisée séquence par séquence, puis déclinée en états intact, défaillant et saturé.",
    "La narración en inglés se sintetiza secuencia por secuencia y se divide en estados limpio, degradado y saturado."
  ],
  [
    "Filters, crushing, resampling, tremolo, echo, delays and mono mixing make the voice fail with the relay.",
    "Filtrage, réduction de résolution audio, rééchantillonnage, trémolo, écho, retards et mixage mono font se dégrader la voix avec le relais.",
    "Filtros, reducción de resolución de audio, remuestreo, trémolo, eco, retardos y mezcla mono degradan la voz al mismo tiempo que el repetidor."
  ],
  [
    "The master is encoded to the festival file while preserving the narrative signal under the size limit.",
    "Le master est encodé au format demandé par le festival tout en préservant la lisibilité du récit dans la limite de taille.",
    "El máster se codifica en el formato exigido por el festival, conservando la legibilidad narrativa dentro del límite de tamaño."
  ],
  [
    "GENERATED SOURCE",
    "SOURCE GÉNÉRÉE",
    "FUENTE GENERADA"
  ],
  [
    "Image and soundtrack are generated rather than captured: Python/PIL/NumPy build the frames and sound bed, edge-tts produces the voice, and FFmpeg performs the mix, degradation and final encoding.",
    "Image et bande-son sont générées, non captées : Python/PIL/NumPy produisent les images et les textures sonores, edge-tts crée la voix et FFmpeg assure le mixage, la dégradation et l’encodage final.",
    "La imagen y la banda sonora se generan, no se capturan: Python/PIL/NumPy producen los fotogramas y el ambiente sonoro, edge-tts crea la voz y FFmpeg realiza la mezcla, la degradación y la codificación final."
  ],
  [
    "Official Selection — Small File Media Festival 2026. Curated by Mena El Shazly &amp; Radek Przedpełski and presented at The Cinematheque, Vancouver. The project meets the festival’s Small-File Ecomedia constraint by making low bandwidth a production condition rather than a delivery format.",
    "Sélection officielle du Small File Media Festival 2026. Programme conçu par Mena El Shazly et Radek Przedpełski, présenté à The Cinematheque, Vancouver. Le film répond à la contrainte Small-File Ecomedia en faisant de la faible bande passante une condition de création plutôt qu’un simple format de diffusion.",
    "Selección oficial del Small File Media Festival 2026. Programa comisariado por Mena El Shazly y Radek Przedpełski, presentado en The Cinematheque de Vancouver. La película responde a la condición Small-File Ecomedia convirtiendo el bajo ancho de banda en una decisión de producción y no solo de distribución."
  ],
  [
    "The festival defines Small-File Ecomedia around a 1.44 MB-per-minute limit and explicitly asks artists to make aesthetic decisions for compressed, precarious infrastructure.",
    "Le festival définit le Small-File Ecomedia autour d’une limite de 1,44 Mo par minute et invite les artistes à faire des choix esthétiques adaptés à des infrastructures compressées et précaires.",
    "El festival define Small-File Ecomedia en torno a un límite de 1,44 MB por minuto e invita a los artistas a tomar decisiones estéticas adaptadas a infraestructuras comprimidas y precarias."
  ],
  [
    "Final state / memory survived / begin again",
    "État final / la mémoire a survécu / recommencer",
    "Estado final / la memoria sobrevivió / volver a empezar"
  ]
];
for (const [lang, column] of [['fr', 1], ['es', 2]]) {
  const target = path.join(ROOT, lang, file);
  if (!fs.existsSync(target)) continue;
  let html = fs.readFileSync(target, 'utf8');
  for (const entry of currentCopy) html = html.replaceAll(entry[0], entry[column]);
  fs.writeFileSync(target, html, 'utf8');
}

console.log('Localized The Last Low-Bandwidth Message in FR and ES.');
