import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();

function walk(node, map, excluded = false) {
  if (!node) return;
  const tag = String(node.name || '').toLowerCase();
  const skip = excluded || ['script', 'style', 'noscript', 'svg', 'code', 'pre'].includes(tag);
  if (node.type === 'text' && !skip) {
    const raw = node.data || '';
    const key = normalize(raw);
    if (key && map[key]) {
      const lead = raw.match(/^\s*/)?.[0] || '';
      const trail = raw.match(/\s*$/)?.[0] || '';
      node.data = lead + map[key] + trail;
    }
    return;
  }
  for (const child of node.children || []) walk(child, map, skip);
}

const fr = {
  'Selected realized work':'Travaux réalisés sélectionnés',
  'Built, installed':'Construits, installés', 'and operated.':'et exploités.',
  'Realized work ↗':'Travaux réalisés ↗',
  'collaborative public installation / structure / LED / realtime control':'installation publique collaborative / structure / LED / contrôle temps réel',
  'solo software / TouchDesigner / music sync / networked score':'logiciel solo / TouchDesigner / synchro musicale / score en réseau',
  'professional / SMODE / projection integration / calibration':'professionnel / SMODE / intégration projection / calibration',
  'collaborative live systems / LED / DMX / GLSL / show control':'systèmes live collaboratifs / LED / DMX / GLSL / show control',
  'professional / theatre video / touring adaptation / operation':'professionnel / vidéo théâtre / adaptation tournée / exploitation',
  'Realized work / 2016—2026':'Travaux réalisés / 2016—2026',
  'Realized projects across interactive software, public installation, live AV, theatre video, projection and stage systems.':'Projets réalisés entre logiciel interactif, installation publique, AV live, vidéo théâtre, projection et systèmes scéniques.',
  'Project archive ↗':'Archives projets ↗','Simulation + R&D ↗':'Simulation + R&D ↗',
  '01 / Installation + software':'01 / Installation + logiciel','Systems made':'Systèmes conçus','to exist.':'pour exister.',
  '02 / Stage + institutional':'02 / Scène + institutionnel','+ video systems.':'+ systèmes vidéo.',
  '03 / Live AV + stage systems':'03 / AV live + systèmes scéniques','Realtime systems':'Systèmes temps réel','under show conditions.':'en conditions de spectacle.',
  'REALIZED':'RÉALISÉ','STUDY':'ÉTUDE',
  'REALIZED / collaborative public installation / realtime systems & integration':'RÉALISÉ / installation publique collaborative / systèmes temps réel & intégration',
  'REALIZED / solo interactive software / TouchDesigner / networked score':'RÉALISÉ / logiciel interactif solo / TouchDesigner / score en réseau',
  'REALIZED / SMODE / projection integration / cues / calibration':'RÉALISÉ / SMODE / intégration projection / cues / calibration',
  'REALIZED / theatre video / creation / touring adaptation / operation':'RÉALISÉ / vidéo théâtre / création / adaptation tournée / exploitation',
  'REALIZED / collaborative AV / TouchDesigner / LED / DMX / GLSL':'RÉALISÉ / AV collaboratif / TouchDesigner / LED / DMX / GLSL',
  'REALIZED / TouchDesigner / Resolume / LED / DMX / video-light sync':'RÉALISÉ / TouchDesigner / Resolume / LED / DMX / synchro vidéo-lumière',
  'Lab / simulation + R&D':'Lab / simulation + R&D',
  'Technical simulations, image studies and experimental systems. Installed, staged and delivered projects remain in Work.':'Simulations techniques, études d’image et systèmes expérimentaux. Les projets installés, scéniques et livrés restent dans Travaux.',
  'Realized work ↗':'Travaux réalisés ↗','Full archive ↗':'Archives complètes ↗',
  'Simulation / interaction':'Simulation / interaction','Realtime image systems':'Systèmes d’image temps réel','Image / shader study':'Étude image / shader',
  'spatial tracking model / Godot / network architecture / TouchDesigner pipeline':'modèle de tracking spatial / Godot / architecture réseau / pipeline TouchDesigner',
  'Godot / mmWave tracking model / WebSocket / TouchDesigner architecture / LED systems':'Godot / modèle de tracking mmWave / WebSocket / architecture TouchDesigner / systèmes LED',
  'TouchDesigner / image reduction / computational portrait':'TouchDesigner / réduction d’image / portrait computationnel',
  'audio-reactive behaviour / cellular systems / temporal image':'comportement audio-réactif / systèmes cellulaires / image temporelle',
  'TouchDesigner / GLSL / transformed timelapse':'TouchDesigner / GLSL / timelapse transformé',
  'Project archive / 2016—2026':'Archives projets / 2016—2026',
  'A chronological record of realized work, systems, studies and simulations. Each project keeps its own case-study page as the archive grows.':'Un index chronologique des projets réalisés, systèmes, études et simulations. Chaque projet conserve sa propre fiche au fil de l’archive.',
  'Software / simulation / studies':'Logiciel / simulation / études','Public installation':'Installation publique','Opera / projection systems':'Opéra / systèmes de projection','Theatre / touring video':'Théâtre / vidéo en tournée','Live AV / image study':'AV live / étude d’image','Live AV / stage systems':'AV live / systèmes scéniques',
  'solo interactive software / TouchDesigner / music sync / networked score':'logiciel interactif solo / TouchDesigner / synchro musicale / score en réseau',
  'spatial tracking model / Godot / network architecture / TouchDesigner pipeline':'modèle de tracking spatial / Godot / architecture réseau / pipeline TouchDesigner',
  'TouchDesigner / computational image reduction':'TouchDesigner / réduction d’image computationnelle',
  'audio-reactive / cellular / temporal image systems':'audio-réactif / cellulaire / systèmes d’image temporelle',
  'collaborative installation / structure / LED / TouchDesigner / integration':'installation collaborative / structure / LED / TouchDesigner / intégration',
  'SMODE / projection integration / cues / geometry / calibration':'SMODE / intégration projection / cues / géométrie / calibration',
  'creation / cameras / routing / projection / touring adaptation / operation':'création / caméras / routing / projection / adaptation tournée / exploitation',
  'solo visual study / TouchDesigner / GLSL':'étude visuelle solo / TouchDesigner / GLSL',
  'collaborative AV / simulation / LED / DMX / GLSL / show control':'AV collaboratif / simulation / LED / DMX / GLSL / show control',
  'Simulation / R&D / 2026':'Simulation / R&D / 2026','A technical simulation for a spatial interaction system in which human movement becomes realtime data, then behaviour distributed across LED surfaces.':'Une simulation technique d’un système d’interaction spatiale où le mouvement humain devient une donnée temps réel, puis un comportement distribué sur des surfaces LED.',
  'Status':'Statut','simulation only / not installed':'simulation uniquement / non installée','Role':'Rôle','system design / simulator / realtime architecture':'conception système / simulateur / architecture temps réel','Tools':'Outils',
  'Target realtime pipeline':'Pipeline temps réel cible','network bridge':'bridge réseau','spatial data':'données spatiales','TouchDesigner behaviour':'comportement TouchDesigner','LED output':'sortie LED',
  'System idea':'Idée du système','Movement becomes signal.':'Le mouvement devient signal.','The system is conceived around people moving through a physical zone. Radar observations describe position and motion without relying on a camera image. Those measurements are turned into a shared realtime state that can influence text, motion, intensity and other behaviours across multiple outputs.':'Le système est pensé autour de personnes se déplaçant dans une zone physique. Les observations radar décrivent position et mouvement sans dépendre d’une image caméra. Ces mesures deviennent un état temps réel partagé pouvant influencer texte, mouvement, intensité et autres comportements sur plusieurs sorties.',
  'Readable at two levels':'Lisible à deux niveaux','For a visitor, the idea is simple: movement changes the environment. Technically, the work is a distributed sensing, networking and realtime-rendering pipeline.':'Pour un visiteur, l’idée est simple : le mouvement transforme l’environnement. Techniquement, le projet est un pipeline distribué de captation, réseau et rendu temps réel.',
  'Simulation layer':'Couche de simulation','Godot as a design instrument.':'Godot comme outil de conception.','The current project is a simulator, not a documentation of an installed work. It models people, sensor coverage, spatial sectors and distributed LED surfaces so interaction logic can be tested before hardware deployment.':'Le projet actuel est un simulateur, pas la documentation d’une œuvre installée. Il modélise personnes, couvertures capteurs, secteurs spatiaux et surfaces LED distribuées afin de tester la logique d’interaction avant un déploiement matériel.',
  'What is already testable':'Ce qui est déjà testable','Multi-target movement, overlapping sensing zones, screen influence, crowd states, network packets, project configurations and runtime performance can all be explored inside the simulation.':'Mouvement multi-cibles, chevauchement des zones de détection, influence des écrans, états de foule, paquets réseau, configurations projet et performances runtime peuvent déjà être explorés dans la simulation.',
  'SENSING':'CAPTEURS','mmWave radar':'Radar mmWave','Multiple 24 GHz tracking modules provide position and movement observations at sensor rate.':'Plusieurs modules de tracking 24 GHz fournissent des observations de position et de mouvement au rythme des capteurs.',
  'EDGE / NETWORK':'EDGE / RÉSEAU','ESP32 + Ethernet target':'Cible ESP32 + Ethernet','A network bridge is planned to collect sensor data and expose a stable stream. Exact hardware remains part of the implementation phase.':'Un bridge réseau est prévu pour collecter les données capteurs et exposer un flux stable. Le matériel exact reste à valider pendant la phase d’implémentation.',
  'DATA':'DONNÉES','The simulator already defines a network contract separating raw observations, spatial tracks and output states.':'Le simulateur définit déjà un contrat réseau séparant observations brutes, tracks spatiaux et états de sortie.',
  'REALTIME':'TEMPS RÉEL','TouchDesigner remains the intended final realtime layer for behaviour, rendering, mapping and system monitoring.':'TouchDesigner reste la couche temps réel finale prévue pour le comportement, le rendu, le mapping et le monitoring du système.',
  'OUTPUT':'SORTIE','The target output is a set of distributed LED surfaces addressed through a final pixel-mapping and Art-Net stage.':'La sortie cible est un ensemble de surfaces LED distribuées, adressées par une étape finale de pixel mapping et Art-Net.',
  'Current state':'État actuel','Simulation first.':'La simulation d’abord.','No physical installation is claimed here. The current value of SIGNAL is the system model: interaction logic, sensing assumptions, data architecture, visualisation and performance testing are being developed before an eventual in-situ implementation.':'Aucune installation physique n’est revendiquée ici. La valeur actuelle de SIGNAL réside dans le modèle système : logique d’interaction, hypothèses de captation, architecture de données, visualisation et tests de performance sont développés avant une éventuelle mise en œuvre in situ.',
  'Portfolio status':'Statut portfolio','R&D / technical simulation. Client, venue and deployment details are intentionally absent.':'R&D / simulation technique. Les informations client, lieu et déploiement sont volontairement absentes.','Back':'Retour','All projects':'Tous les projets','Archive':'Archives'
};

const es = {
  'Selected realized work':'Trabajo realizado seleccionado','Built, installed':'Construido, instalado','and operated.':'y operado.','Realized work ↗':'Trabajo realizado ↗',
  'collaborative public installation / structure / LED / realtime control':'instalación pública colaborativa / estructura / LED / control en tiempo real','solo software / TouchDesigner / music sync / networked score':'software solo / TouchDesigner / sincronización musical / puntuación en red','professional / SMODE / projection integration / calibration':'profesional / SMODE / integración de proyección / calibración','collaborative live systems / LED / DMX / GLSL / show control':'sistemas live colaborativos / LED / DMX / GLSL / show control','professional / theatre video / touring adaptation / operation':'profesional / vídeo teatral / adaptación de gira / operación',
  'Realized work / 2016—2026':'Trabajo realizado / 2016—2026','Realized projects across interactive software, public installation, live AV, theatre video, projection and stage systems.':'Proyectos realizados entre software interactivo, instalación pública, AV en directo, vídeo teatral, proyección y sistemas escénicos.','Project archive ↗':'Archivo de proyectos ↗','Simulation + R&D ↗':'Simulación + I+D ↗',
  '01 / Installation + software':'01 / Instalación + software','Systems made':'Sistemas creados','to exist.':'para existir.','02 / Stage + institutional':'02 / Escena + institucional','+ video systems.':'+ sistemas de vídeo.','03 / Live AV + stage systems':'03 / AV en directo + sistemas escénicos','Realtime systems':'Sistemas en tiempo real','under show conditions.':'en condiciones de espectáculo.',
  'REALIZED':'REALIZADO','R&D':'I+D','STUDY':'ESTUDIO','Lab / simulation + R&D':'Lab / simulación + I+D','Technical simulations, image studies and experimental systems. Installed, staged and delivered projects remain in Work.':'Simulaciones técnicas, estudios de imagen y sistemas experimentales. Los proyectos instalados, escénicos y entregados permanecen en Trabajo.','Full archive ↗':'Archivo completo ↗',
  'Simulation / interaction':'Simulación / interacción','Realtime image systems':'Sistemas de imagen en tiempo real','Image / shader study':'Estudio de imagen / shader','Project archive / 2016—2026':'Archivo de proyectos / 2016—2026','A chronological record of realized work, systems, studies and simulations. Each project keeps its own case-study page as the archive grows.':'Un registro cronológico de trabajos realizados, sistemas, estudios y simulaciones. Cada proyecto conserva su propia ficha a medida que crece el archivo.','Software / simulation / studies':'Software / simulación / estudios','Public installation':'Instalación pública','Opera / projection systems':'Ópera / sistemas de proyección','Theatre / touring video':'Teatro / vídeo en gira','Live AV / image study':'AV en directo / estudio de imagen','Live AV / stage systems':'AV en directo / sistemas escénicos',
  'Simulation / R&D / 2026':'Simulación / I+D / 2026','A technical simulation for a spatial interaction system in which human movement becomes realtime data, then behaviour distributed across LED surfaces.':'Una simulación técnica de un sistema de interacción espacial donde el movimiento humano se convierte en datos en tiempo real y después en comportamiento distribuido sobre superficies LED.','Status':'Estado','simulation only / not installed':'solo simulación / no instalado','Role':'Rol','system design / simulator / realtime architecture':'diseño de sistema / simulador / arquitectura en tiempo real','Tools':'Herramientas','Target realtime pipeline':'Pipeline objetivo en tiempo real','network bridge':'bridge de red','spatial data':'datos espaciales','TouchDesigner behaviour':'comportamiento TouchDesigner','LED output':'salida LED',
  'System idea':'Idea del sistema','Movement becomes signal.':'El movimiento se convierte en señal.','The system is conceived around people moving through a physical zone. Radar observations describe position and motion without relying on a camera image. Those measurements are turned into a shared realtime state that can influence text, motion, intensity and other behaviours across multiple outputs.':'El sistema se concibe alrededor de personas que se mueven por una zona física. Las observaciones de radar describen posición y movimiento sin depender de una imagen de cámara. Estas medidas se convierten en un estado compartido en tiempo real capaz de influir texto, movimiento, intensidad y otros comportamientos en varias salidas.','Readable at two levels':'Legible a dos niveles','For a visitor, the idea is simple: movement changes the environment. Technically, the work is a distributed sensing, networking and realtime-rendering pipeline.':'Para un visitante la idea es simple: el movimiento modifica el entorno. Técnicamente, el proyecto es un pipeline distribuido de captación, red y renderizado en tiempo real.',
  'Simulation layer':'Capa de simulación','Godot as a design instrument.':'Godot como herramienta de diseño.','The current project is a simulator, not a documentation of an installed work. It models people, sensor coverage, spatial sectors and distributed LED surfaces so interaction logic can be tested before hardware deployment.':'El proyecto actual es un simulador, no la documentación de una obra instalada. Modela personas, cobertura de sensores, sectores espaciales y superficies LED distribuidas para probar la lógica de interacción antes del despliegue de hardware.','What is already testable':'Lo que ya puede probarse','Multi-target movement, overlapping sensing zones, screen influence, crowd states, network packets, project configurations and runtime performance can all be explored inside the simulation.':'Movimiento multiobjetivo, zonas de detección solapadas, influencia de pantallas, estados de multitud, paquetes de red, configuraciones de proyecto y rendimiento runtime pueden explorarse dentro de la simulación.',
  'SENSING':'SENSORES','mmWave radar':'Radar mmWave','Multiple 24 GHz tracking modules provide position and movement observations at sensor rate.':'Varios módulos de tracking de 24 GHz proporcionan observaciones de posición y movimiento al ritmo de los sensores.','EDGE / NETWORK':'EDGE / RED','ESP32 + Ethernet target':'Objetivo ESP32 + Ethernet','A network bridge is planned to collect sensor data and expose a stable stream. Exact hardware remains part of the implementation phase.':'Se prevé un bridge de red para recopilar datos de sensores y exponer un flujo estable. El hardware exacto sigue formando parte de la fase de implementación.','DATA':'DATOS','The simulator already defines a network contract separating raw observations, spatial tracks and output states.':'El simulador ya define un contrato de red que separa observaciones brutas, tracks espaciales y estados de salida.','REALTIME':'TIEMPO REAL','TouchDesigner remains the intended final realtime layer for behaviour, rendering, mapping and system monitoring.':'TouchDesigner sigue siendo la capa final prevista para comportamiento, renderizado, mapping y monitorización del sistema.','OUTPUT':'SALIDA','The target output is a set of distributed LED surfaces addressed through a final pixel-mapping and Art-Net stage.':'La salida objetivo es un conjunto de superficies LED distribuidas, direccionadas mediante una etapa final de pixel mapping y Art-Net.',
  'Current state':'Estado actual','Simulation first.':'Primero la simulación.','No physical installation is claimed here. The current value of SIGNAL is the system model: interaction logic, sensing assumptions, data architecture, visualisation and performance testing are being developed before an eventual in-situ implementation.':'Aquí no se afirma ninguna instalación física. El valor actual de SIGNAL está en el modelo de sistema: lógica de interacción, hipótesis de captación, arquitectura de datos, visualización y pruebas de rendimiento se desarrollan antes de una posible implementación in situ.','Portfolio status':'Estado en portfolio','R&D / technical simulation. Client, venue and deployment details are intentionally absent.':'I+D / simulación técnica. Los datos de cliente, lugar y despliegue se omiten intencionadamente.','Back':'Volver','All projects':'Todos los proyectos','Archive':'Archivo'
};

const configs = {
  fr: {
    map: fr,
    pages: {
      'index.html': {},
      'work.html': {title:'Travaux réalisés — Installations, AV temps réel, projection & systèmes vidéo — DATA C0RE', description:'Projets réalisés par DATA C0RE : logiciel interactif, installation publique, AV temps réel, vidéo théâtre, projection, LED, DMX et systèmes scéniques.', h1:'PROJETS<br>RÉALISÉS'},
      'lab.html': {title:'Lab — Simulation, TouchDesigner, GLSL & R&D systèmes temps réel — DATA C0RE', description:'Simulation et recherche autour du tracking spatial, TouchDesigner, GLSL, systèmes d’image temps réel, capteurs, réseaux et média interactif.', h1:'SYSTÈMES<br>EN DÉVELOPPEMENT'},
      'archive.html': {title:'Archives projets — AV temps réel, installations, systèmes scéniques & R&D — DATA C0RE', description:'Archives chronologiques DATA C0RE : installations et systèmes scéniques réalisés, logiciel interactif, AV live, simulations et études média temps réel.', h1:'ARCHIVES<br>PROJETS'},
      'projects/signal.html': {title:'SIGNAL — Simulation de tracking spatial & système LED temps réel — DATA C0RE', description:'Simulation technique anonymisée d’un système d’interaction spatiale : Godot, tracking mmWave, WebSocket, architecture TouchDesigner et comportements LED distribués.', h1:'SIGNAL<br>Système spatial'}
    }
  },
  es: {
    map: es,
    pages: {
      'index.html': {},
      'work.html': {title:'Trabajo realizado — Instalaciones, AV en tiempo real, proyección y sistemas de vídeo — DATA C0RE', description:'Proyectos realizados por DATA C0RE: software interactivo, instalación pública, AV en directo, vídeo teatral, proyección, LED, DMX y sistemas escénicos.', h1:'TRABAJO<br>REALIZADO'},
      'lab.html': {title:'Lab — Simulación, TouchDesigner, GLSL e I+D de sistemas en tiempo real — DATA C0RE', description:'Simulación e investigación sobre tracking espacial, TouchDesigner, GLSL, imagen en tiempo real, sensores, redes y medios interactivos.', h1:'SISTEMAS<br>EN DESARROLLO'},
      'archive.html': {title:'Archivo de proyectos — AV en tiempo real, instalaciones, sistemas escénicos e I+D — DATA C0RE', description:'Archivo cronológico DATA C0RE: instalaciones y sistemas escénicos realizados, software interactivo, AV en directo, simulaciones y estudios de medios en tiempo real.', h1:'ARCHIVO<br>DE PROYECTOS'},
      'projects/signal.html': {title:'SIGNAL — Simulación de tracking espacial y sistema LED en tiempo real — DATA C0RE', description:'Simulación técnica anonimizada de un sistema de interacción espacial: Godot, tracking mmWave, WebSocket, arquitectura TouchDesigner y comportamiento LED distribuido.', h1:'SIGNAL<br>Sistema espacial'}
    }
  }
};

for (const [lang, config] of Object.entries(configs)) {
  for (const [rel, page] of Object.entries(config.pages)) {
    const file = path.join(ROOT, lang, rel);
    if (!fs.existsSync(file)) continue;
    const $ = load(fs.readFileSync(file, 'utf8'), { decodeEntities: false });
    walk($('body')[0], config.map);
    if (page.h1) {
      const h1 = rel === 'projects/signal.html' ? $('.project-hero h1').first() : $('.page-intro h1').first();
      if (h1.length) h1.html(page.h1);
    }
    if (page.title) {
      $('title').text(page.title);
      $('meta[property="og:title"]').attr('content', page.title);
      $('meta[name="twitter:title"]').attr('content', page.title);
    }
    if (page.description) {
      $('meta[name="description"]').attr('content', page.description);
      $('meta[property="og:description"]').attr('content', page.description);
      $('meta[name="twitter:description"]').attr('content', page.description);
    }
    fs.writeFileSync(file, $.html(), 'utf8');
  }
}

// Source-page polish that should survive future production generation.
const archiveFile = path.join(ROOT, 'archive.html');
if (fs.existsSync(archiveFile)) {
  let html = fs.readFileSync(archiveFile, 'utf8');
  html = html.replace('DATA C0RE / LAB', 'DATA C0RE / ARCHIVE');
  fs.writeFileSync(archiveFile, html, 'utf8');
}
const signalFile = path.join(ROOT, 'projects/signal.html');
if (fs.existsSync(signalFile)) {
  let html = fs.readFileSync(signalFile, 'utf8');
  html = html.replace(/<meta property="og:image" content="[^"]*">/i, '<meta property="og:image" content="https://datac0re.is-a.dev/assets/img/og-cover.jpg">');
  fs.writeFileSync(signalFile, html, 'utf8');
}
for (const lang of ['en','fr','es']) {
  const file = path.join(ROOT, lang, 'archive.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('DATA C0RE / LAB', lang === 'fr' ? 'DATA C0RE / ARCHIVES' : lang === 'es' ? 'DATA C0RE / ARCHIVO' : 'DATA C0RE / ARCHIVE');
  fs.writeFileSync(file, html, 'utf8');
}

console.log('Portfolio architecture copy, archive footer and SIGNAL metadata polished.');
