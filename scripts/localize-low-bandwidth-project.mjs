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
    ['<b>Format</b> 1 min / 1.79 MB / France / 2026','<b>Format</b> 1 min / 1,79 MB / France / 2026'],
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
    ['<b>Format</b> 1 min / 1.79 MB / France / 2026','<b>Formato</b> 1 min / 1,79 MB / Francia / 2026'],
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
console.log('Localized The Last Low-Bandwidth Message in FR and ES.');
