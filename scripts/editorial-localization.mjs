import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = process.cwd();
const locales = ['fr', 'es'];

const T = {
  fr: {
    home: {
      statement: 'Je crée des systèmes audiovisuels temps réel où le son, les données et le code deviennent image, lumière et comportement dans l’espace.',
      statementCopy: 'La pratique relie creative coding, live AV, lumière interactive et intégration média — du logiciel aux installations architecturales et aux dispositifs scéniques.',
      fields: ['creative coding', 'live AV', 'lumière interactive', 'projection', 'Annecy / Genève / Europe'],
      workTitle: 'Systèmes, études<br>et installations.',
      direction: 'Pratique solo, légère.<br>Le logiciel comme point de départ.<br>Son, projection et espace à l’échelle du festival.',
      directionCopy: 'Les prochains projets sont conçus pour tourner léger : un cœur logiciel temps réel compact, transportable seul, qui s’étend avec le son, la projection et l’infrastructure disponible sur place.',
      rows: [
        'projet solo / TouchDesigner / synchro musicale / score partagé en réseau',
        'étude solo / réduction d’image / portrait computationnel',
        'installation collaborative / lumière / architecture / contrôle temps réel',
        'recherche solo / son / mouvement / traitements temporels de l’image',
        'systèmes collaboratifs / scène / LED / GLSL / show control'
      ]
    },
    work: {
      intro: 'Sélection de projets solo, installations collaboratives et systèmes vidéo / scéniques professionnels autour du temps réel, de la lumière interactive, de la projection et du live AV.',
      labels: ['01 / Projets artistiques sélectionnés', '02 / Installations collaboratives + live', '03 / Vidéo scénique + institutions'],
      titles: ['Projets solo<br>+ recherche.', 'Installations<br>+ systèmes live.', 'Vidéo scénique<br>+ intégration média.'],
      rows: [
        'Projet solo / TouchDesigner / synchro musicale / score partagé en réseau',
        'Étude solo / système d’image générative',
        'Recherche solo / audio-réactif / systèmes cellulaires',
        'Étude solo / traitement d’image anisotrope',
        'Installation publique collaborative / temps réel / intégration',
        'Systèmes AV collaboratifs / LED / DMX / GLSL',
        'SMODE / projection / calibration',
        'Création / adaptation tournée / exploitation / passation régie',
        'TouchDesigner / Resolume / LED / DMX / synchro vidéo-lumière'
      ]
    },
    about: {
      heroTitle: 'ARTISTE +<br>CREATIVE TECHNOLOGIST',
      heroCopy: 'DATA C0RE développe une pratique d’artiste numérique et de creative technologist autour des systèmes audiovisuels temps réel. Code, son, données, image et lumière sont articulés pour produire des comportements qui prennent forme à l’écran, sur scène ou dans l’espace.',
      practiceTitle: 'Des systèmes<br>plutôt que<br>des images fixes.',
      practiceCopy: [
        'Le travail part de comportements, de relations et de structures de contrôle plutôt que d’une image prédéfinie. Les systèmes peuvent réagir au son, aux données, aux interprètes, aux contraintes du lieu ou à leur propre logique.',
        'TouchDesigner est au cœur de cette pratique, avec le graphisme temps réel, GLSL, Python et le contrôle réseau. Selon le projet, la logique reste dans le logiciel ou se prolonge dans la projection, les LED, la lumière et l’architecture.'
      ],
      systemOutput: 'Vidéo / projection / LED / lumière / intégration dans l’espace.',
      methodIndex: 'Construire / Tester / Connecter / Adapter',
      methodTitle: 'Construire.<br>Tester.<br>Connecter.<br>Adapter.',
      methodCopy: 'L’expérience du spectacle vivant, de la tournée, de la fabrication et des systèmes média a construit une pratique où expérimentation et fiabilité avancent ensemble. Un projet peut passer du prototype logiciel à l’installation ou à la scène sans séparer intention artistique et intégration technique.',
      methodCards: [
        ['Construire', 'Développer le système depuis sa logique : logiciel, interfaces, comportements et contrôle.'],
        ['Tester', 'Prototyper en conditions réelles, révéler les failles et itérer par l’usage.'],
        ['Connecter', 'Relier logiciel, son, réseaux, caméras, projection, LED, lumière et espace.'],
        ['Adapter', 'Concevoir pour des configurations variables, du laptop à l’installation et à la tournée.']
      ],
      directionIndex: 'Software-first / tournée légère',
      directionTitle: 'Pratique solo.<br>Légère.<br>Transportable.',
      directionCopy: 'La direction 2027 se concentre sur des œuvres audiovisuelles autonomes conçues pour tourner léger : un cœur logiciel compact, transportable seul, qui peut s’étendre grâce au son, à la projection et à l’infrastructure disponible sur place.',
      directionTag: 'Transport compact / déploiement sur site<br>Son / projection / espace à l’échelle du festival',
      workLink: 'Travail ↗'
    },
    services: {
      title: 'TOUCHDESIGNER<br>SYSTÈMES VIDÉO<br>PROJECTION',
      intro: 'DATA C0RE intervient comme creative technologist et technicien vidéo sur la programmation TouchDesigner, la vidéo temps réel, la projection, les médias interactifs, les LED / DMX et l’intégration média scénique pour le théâtre, l’opéra, les festivals, les installations et le spectacle vivant.',
      meta: ['Basé à Annecy', 'Actif à Genève', 'France / Suisse / Europe / international'],
      sectionTitle: 'TouchDesigner<br>+ show control.',
      cards: [
        ['Programmation', 'TouchDesigner / realtime', 'Systèmes TouchDesigner sur mesure, intégration GLSL et Python, comportements réactifs au son ou aux données, OSC / Art-Net / DMX, médias interactifs et logique de show control.'],
        ['Systèmes vidéo', 'Projection / médias', 'SMODE, géométrie de projection, mapping, edge blending, caméras, routing, media servers, conception des sorties et calibration sur site pour la scène et l’installation.'],
        ['Production live', 'Théâtre / opéra / tournée', 'Préparation et adaptation des systèmes vidéo, cues, surtitrage, tests, dépannage, coordination des équipes locales et passation régie pour les tournées et productions institutionnelles.'],
        ['Intégration physique', 'LED / lumière / installation', 'LED adressables, DMX / Art-Net, planification réseau, Fusion 360, coordination de fabrication et intégration du logiciel temps réel avec la lumière et les systèmes architecturaux.']
      ],
      mobilityLabel: '02 / Mobilité + zone d’intervention',
      mobility: 'Basé à Annecy, avec une expérience de production régulière à Genève. Disponible sur site à Lyon, Grenoble et Paris, en France, en Suisse, en Europe et à l’international. La tournée d’Entre chien et loup avec la Comédie de Genève / Christiane Jatahy inclut notamment São Paulo, au Brésil.',
      locations: ['Annecy', 'Genève', 'Lyon', 'Grenoble', 'Paris', 'France', 'Suisse', 'Europe', 'Brésil', 'International'],
      contextTitle: 'Contextes<br>de production.'
    },
    cv: {
      intro: 'Artiste numérique et creative technologist travaillant entre systèmes audiovisuels temps réel, vidéo scénique, lumière interactive, projection et intégration physique.',
      profile: 'Plus de dix-huit ans de pratique professionnelle dans le spectacle vivant et les médias numériques. Je développe et exploite des systèmes allant de la logique logicielle à la projection, aux LED, à la lumière et à l’installation physique, avec une attention particulière à la fiabilité, à l’intégration sur site et à la collaboration avec les équipes artistiques et techniques.',
      statuses: ['Programmation SMODE / intégration de projection', 'Systèmes vidéo / contribution interactive en tournée', 'AV temps réel / systèmes lumière + vidéo', 'Activité technique indépendante'],
      details: [
        'Programmation SMODE, cues, projection multi-plans, edge blending, surfaces déformées et calibration sur site pour de grands dispositifs scéniques.',
        'Préparation et adaptation du système vidéo en tournée, coordination des équipes locales, surtitrage multilingue, tests, dépannage et passation régie.',
        'Systèmes audiovisuels collaboratifs pour la musique électronique et la scène : développement TouchDesigner, simulation 3D temps réel, intégration LED / DMX, GLSL, Resolume et show control.',
        'Conception, installation, exploitation et dépannage de systèmes vidéo, lumière, projection et streaming en contexte de spectacle vivant.'
      ],
      times: ['2023—24', '2021—23', '2013—aujourd’hui', '2006—aujourd’hui'],
      productionTitle: 'Installations + scène'
    },
    contact: {
      title: 'PARLONS<br>PROJET.',
      lead: 'Pour les projets artistiques, le développement TouchDesigner, les systèmes vidéo temps réel, la projection, le théâtre / opéra, le live AV, les installations et les collaborations techniques.'
    },
    lab: {
      title: 'RECHERCHE<br>ET EXPÉRIMENTATION',
      intro: 'Recherche continue autour de TouchDesigner, GLSL, du rendu temps réel, des capteurs, des réseaux et des systèmes génératifs, directement reliée aux installations, aux systèmes scéniques et au travail audiovisuel.'
    }
  },
  es: {
    home: {
      statement: 'Creo sistemas audiovisuales en tiempo real donde sonido, datos y código se transforman en imagen, luz y comportamiento en el espacio.',
      statementCopy: 'La práctica cruza creative coding, live AV, luz interactiva e integración multimedia — del software a instalaciones arquitectónicas y dispositivos escénicos.',
      fields: ['creative coding', 'live AV', 'luz interactiva', 'proyección', 'Annecy / Ginebra / Europa'],
      workTitle: 'Sistemas, estudios<br>e instalaciones.',
      direction: 'Práctica en solitario, ligera.<br>Software como punto de partida.<br>Sonido, proyección y espacio a escala de festival.',
      directionCopy: 'Los próximos proyectos están pensados para girar con una infraestructura ligera: un núcleo de software en tiempo real, compacto y transportable por una sola persona, que se amplía con el sonido, la proyección y la infraestructura disponible en cada lugar.',
      rows: [
        'proyecto solo / TouchDesigner / sincronización musical / puntuación compartida en red',
        'estudio solo / reducción de imagen / retrato computacional',
        'instalación colaborativa / luz / arquitectura / control en tiempo real',
        'investigación / sonido / movimiento / procesamiento temporal de imagen',
        'sistemas colaborativos / escena / LED / GLSL / show control'
      ]
    },
    work: {
      intro: 'Selección de proyectos en solitario, instalaciones colaborativas y sistemas profesionales de vídeo / escena alrededor del tiempo real, la luz interactiva, la proyección y el live AV.',
      labels: ['01 / Proyectos artísticos seleccionados', '02 / Instalaciones colaborativas + live', '03 / Vídeo escénico + instituciones'],
      titles: ['Proyectos solo<br>+ investigación.', 'Instalaciones<br>+ sistemas live.', 'Vídeo escénico<br>+ integración multimedia.'],
      rows: [
        'Proyecto solo / TouchDesigner / sincronización musical / puntuación compartida en red',
        'Estudio solo / sistema de imagen generativa',
        'Investigación / audio-reactivo / sistemas celulares',
        'Estudio solo / procesamiento anisotrópico de imagen',
        'Instalación pública colaborativa / tiempo real / integración',
        'Sistemas AV colaborativos / LED / DMX / GLSL',
        'SMODE / proyección / calibración',
        'Creación / adaptación de gira / operación / traspaso técnico',
        'TouchDesigner / Resolume / LED / DMX / sincronización vídeo-luz'
      ]
    },
    about: {
      heroTitle: 'ARTISTA +<br>CREATIVE TECHNOLOGIST',
      heroCopy: 'DATA C0RE desarrolla una práctica de artista digital y creative technologist centrada en sistemas audiovisuales en tiempo real. Código, sonido, datos, imagen y luz se articulan para producir comportamientos que toman forma en pantalla, en escena o en el espacio.',
      practiceTitle: 'Sistemas<br>en lugar de<br>imágenes fijas.',
      practiceCopy: [
        'El trabajo parte de comportamientos, relaciones y estructuras de control, no de una imagen predeterminada. Los sistemas pueden reaccionar al sonido, los datos, intérpretes, las condiciones del espacio o su propia lógica interna.',
        'TouchDesigner ocupa un lugar central en esta práctica, junto con gráficos en tiempo real, GLSL, Python y control en red. Según el proyecto, la lógica puede permanecer en el software o extenderse a proyección, LED, iluminación y arquitectura.'
      ],
      systemOutput: 'Vídeo / proyección / LED / luz / integración en el espacio.',
      methodIndex: 'Construir / Probar / Conectar / Adaptar',
      methodTitle: 'Construir.<br>Probar.<br>Conectar.<br>Adaptar.',
      methodCopy: 'La experiencia en directo, gira, fabricación y sistemas multimedia ha construido una práctica donde experimentación y fiabilidad avanzan juntas. Un proyecto puede pasar del prototipo de software a la instalación o al escenario sin separar intención artística e integración técnica.',
      methodCards: [
        ['Construir', 'Desarrollar el sistema desde su lógica: software, interfaces, comportamientos y control.'],
        ['Probar', 'Prototipar en condiciones reales, detectar fallos e iterar a través del uso.'],
        ['Conectar', 'Conectar software, sonido, redes, cámaras, proyección, LED, iluminación y espacio.'],
        ['Adaptar', 'Diseñar para configuraciones variables, del portátil a la instalación y la gira.']
      ],
      directionIndex: 'Software-first / gira ligera',
      directionTitle: 'Práctica en solitario.<br>Ligera.<br>Transportable.',
      directionCopy: 'La dirección para 2027 se centra en obras audiovisuales autónomas pensadas para girar con una infraestructura ligera: un núcleo de software compacto, transportable por una sola persona, que puede ampliarse con sonido, proyección y la infraestructura disponible en cada lugar.',
      directionTag: 'Transporte compacto / despliegue in situ<br>Sonido / proyección / espacio a escala de festival',
      workLink: 'Trabajo ↗'
    },
    services: {
      title: 'TOUCHDESIGNER<br>SISTEMAS DE VÍDEO<br>PROYECCIÓN',
      intro: 'DATA C0RE trabaja como creative technologist y técnico de vídeo en programación TouchDesigner, vídeo en tiempo real, proyección, medios interactivos, LED / DMX e integración multimedia escénica para teatro, ópera, festivales, instalaciones y espectáculo en vivo.',
      meta: ['Base en Annecy', 'Actividad en Ginebra', 'Francia / Suiza / Europa / internacional'],
      sectionTitle: 'TouchDesigner<br>+ show control.',
      cards: [
        ['Programación', 'TouchDesigner / realtime', 'Sistemas TouchDesigner a medida, integración GLSL y Python, comportamientos reactivos al sonido o a los datos, OSC / Art-Net / DMX, medios interactivos y lógica de show control.'],
        ['Sistemas de vídeo', 'Proyección / medios', 'SMODE, geometría de proyección, mapping, edge blending, cámaras, routing, media servers, diseño de salidas y calibración in situ para escena e instalación.'],
        ['Producción live', 'Teatro / ópera / gira', 'Preparación y adaptación de sistemas de vídeo, cues, sobretítulos, pruebas, resolución de incidencias, coordinación de equipos locales y traspaso de operación para giras y producciones institucionales.'],
        ['Integración física', 'LED / luz / instalación', 'LED direccionables, DMX / Art-Net, planificación de red, Fusion 360, coordinación de fabricación e integración del software en tiempo real con iluminación y sistemas arquitectónicos.']
      ],
      mobilityLabel: '02 / Movilidad + zona de trabajo',
      mobility: 'Con base en Annecy y experiencia de producción regular en Ginebra. Disponible para trabajo in situ en Lyon, Grenoble y París, en Francia, Suiza, Europa y a nivel internacional. La gira de Entre chien et loup con la Comédie de Genève / Christiane Jatahy incluye, entre otras ciudades, São Paulo, Brasil.',
      locations: ['Annecy', 'Ginebra', 'Lyon', 'Grenoble', 'París', 'Francia', 'Suiza', 'Europa', 'Brasil', 'Internacional'],
      contextTitle: 'Contextos<br>de producción.'
    },
    cv: {
      intro: 'Artista digital y creative technologist que trabaja entre sistemas audiovisuales en tiempo real, vídeo escénico, luz interactiva, proyección e integración física.',
      profile: 'Más de dieciocho años de práctica profesional entre espectáculo en vivo y medios digitales. Desarrollo y opero sistemas desde la lógica de software hasta proyección, LED, iluminación e instalación física, con especial atención a la fiabilidad, la integración in situ y la colaboración con equipos artísticos y técnicos.',
      statuses: ['Programación SMODE / integración de proyección', 'Sistemas de vídeo / contribución interactiva en gira', 'AV en tiempo real / sistemas de luz + vídeo', 'Actividad técnica independiente'],
      details: [
        'Programación SMODE, cues, proyección multiplano, edge blending, superficies deformadas y calibración in situ para grandes dispositivos escénicos.',
        'Preparación y adaptación del sistema de vídeo en gira, coordinación de equipos locales, sobretítulos multilingües, pruebas, resolución de incidencias y traspaso técnico.',
        'Sistemas audiovisuales colaborativos para música electrónica y escena: desarrollo TouchDesigner, simulación 3D en tiempo real, integración LED / DMX, GLSL, Resolume y show control.',
        'Diseño, instalación, operación y resolución de incidencias de sistemas de vídeo, iluminación, proyección y streaming en contextos de espectáculo en vivo.'
      ],
      times: ['2023—24', '2021—23', '2013—actualidad', '2006—actualidad'],
      productionTitle: 'Instalaciones + escena'
    },
    contact: {
      title: 'HABLEMOS<br>DE PROYECTOS.',
      lead: 'Para proyectos artísticos, desarrollo TouchDesigner, sistemas de vídeo en tiempo real, proyección, teatro / ópera, live AV, instalaciones y colaboraciones técnicas.'
    },
    lab: {
      title: 'INVESTIGACIÓN<br>Y EXPERIMENTACIÓN',
      intro: 'Investigación continua con TouchDesigner, GLSL, renderizado en tiempo real, sensores, redes y sistemas generativos, conectada directamente con instalaciones, sistemas escénicos y trabajo audiovisual.'
    }
  }
};

function fileFor(locale, rel) {
  return path.join(ROOT, locale, rel);
}

function setTexts($, selector, values) {
  $(selector).each((i, el) => {
    if (values[i] !== undefined) $(el).text(values[i]);
  });
}

function edit(locale, rel, mutator) {
  const file = fileFor(locale, rel);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const $ = load(before, { decodeEntities: false });
  mutator($, T[locale]);
  const after = $.html();
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
}

for (const locale of locales) {
  edit(locale, 'index.html', ($, c) => {
    $('.home-statement h2').text(c.home.statement);
    $('.home-statement-copy').text(c.home.statementCopy);
    setTexts($, '.field-line span', c.home.fields);
    $('.section-head h2').first().html(c.home.workTitle);
    $('.home-direction h2').html(c.home.direction);
    $('.home-direction p').last().text(c.home.directionCopy);
    setTexts($, '.home-work .index-row small', c.home.rows);
  });

  edit(locale, 'work.html', ($, c) => {
    $('.page-intro > p').last().text(c.work.intro);
    $('.work-screen').each((i, el) => {
      const block = $(el);
      if (c.work.labels[i]) block.find('.work-screen-head p').text(c.work.labels[i]);
      if (c.work.titles[i]) block.find('.work-screen-head h2').html(c.work.titles[i]);
    });
    setTexts($, '.work-screen .index-row small', c.work.rows);
    $('.index-preview img').each((_, el) => $(el).attr('alt', locale === 'fr' ? 'Aperçu du projet sélectionné' : 'Vista previa del proyecto seleccionado'));
  });

  edit(locale, 'about.html', ($, c) => {
    $('#profile h1').html(c.about.heroTitle);
    $('#profile .about-hero > p').text(c.about.heroCopy);
    $('#practice .about-display').html(c.about.practiceTitle);
    setTexts($, '#practice .about-copy', c.about.practiceCopy);
    $('#practice .system-detail div').eq(2).find('p').text(c.about.systemOutput);
    $('#method .about-panel-index span').eq(1).text(c.about.methodIndex);
    $('#method .about-display').html(c.about.methodTitle);
    $('#method .about-copy').text(c.about.methodCopy);
    $('#method .method-grid article').each((i, el) => {
      const card = c.about.methodCards[i];
      if (!card) return;
      $(el).find('h3').text(card[0]);
      $(el).find('p').text(card[1]);
    });
    $('#direction .about-panel-index span').eq(1).text(c.about.directionIndex);
    $('#direction .about-display').html(c.about.directionTitle);
    $('#direction .direction-copy > p').text(c.about.directionCopy);
    $('#direction .direction-tag').html(c.about.directionTag);
    $('#direction .about-links a').first().text(c.about.workLink);
  });

  edit(locale, 'services.html', ($, c) => {
    $('.services-intro h1').html(c.services.title);
    $('.services-intro > p').last().text(c.services.intro);
    setTexts($, '.services-meta span', c.services.meta);
    $('.services-section').eq(0).find('.services-head h2').html(c.services.sectionTitle);
    $('.service-grid article').each((i, el) => {
      const card = c.services.cards[i];
      if (!card) return;
      $(el).find('span').first().text(card[0]);
      $(el).find('h3').text(card[1]);
      $(el).find('p').text(card[2]);
    });
    $('.mobility-grid .label').text(c.services.mobilityLabel);
    $('.mobility-copy').text(c.services.mobility);
    setTexts($, '.location-line span', c.services.locations);
    $('.services-section').eq(2).find('.services-head h2').html(c.services.contextTitle);
    if (locale === 'es') {
      $('.proof-list a').eq(1).find('small').text('SMODE / proyección / calibración ↗');
      $('.proof-list a').eq(2).find('small').text('sistemas de vídeo / gira / São Paulo, Brasil ↗');
    }
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).html();
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
        for (const node of graph) {
          if (node['@type'] === 'Person') node.jobTitle = ['Digital artist', 'Creative technologist', 'Video systems technician', 'TouchDesigner programmer', 'Realtime audiovisual systems designer'];
        }
        $(el).text(JSON.stringify(data));
      } catch {}
    });
  });

  edit(locale, 'cv.html', ($, c) => {
    $('.cv-intro > p').last().text(c.cv.intro);
    $('.profile-copy').text(c.cv.profile);
    $('.cv-row').each((i, el) => {
      if (c.cv.times[i]) $(el).find('time').text(c.cv.times[i]);
      if (c.cv.statuses[i]) $(el).find('.cv-status').text(c.cv.statuses[i]);
      if (c.cv.details[i]) $(el).find('.cv-detail p').first().text(c.cv.details[i]);
    });
    $('.cv-head').eq(1).find('h2').text(c.cv.productionTitle);
  });

  edit(locale, 'contact.html', ($, c) => {
    $('#contact-title').html(c.contact.title);
    $('.contact-lead').text(c.contact.lead);
    if (locale === 'es') {
      $('#contact-message').attr('placeholder', 'Contexto, lugar, fechas y lo que quieres plantear.');
      $('.contact-privacy').text('Tus datos se utilizan únicamente para responder a tu consulta. No hay lista de correo ni dirección de email pública. La protección automatizada contra abusos utiliza Cloudflare Turnstile.');
    }
  });

  edit(locale, 'lab.html', ($, c) => {
    $('.page-intro h1').html(c.lab.title);
    $('.page-intro > p').last().text(c.lab.intro);
  });

  // Small terminology fixes shared by project pages. Technical terms that are standard
  // in AV/stage work (TouchDesigner, GLSL, cues, routing, mapping, edge blending,
  // show control, media server, live AV) are intentionally kept when useful.
  const projectDir = path.join(ROOT, locale, 'projects');
  if (fs.existsSync(projectDir)) {
    for (const name of fs.readdirSync(projectDir).filter(name => name.endsWith('.html'))) {
      edit(locale, `projects/${name}`, $ => {
        const replacements = locale === 'fr'
          ? [
              [/média spatial/gi, 'intégration dans l’espace'],
              [/travaux spatiaux/gi, 'installations']
            ]
          : [
              [/medios espaciales/gi, 'integración en el espacio'],
              [/trabajos espaciales/gi, 'instalaciones'],
              [/entrega de control/gi, 'traspaso técnico'],
              [/transferencia de régie/gi, 'traspaso de operación']
            ];
        const walker = $('body').find('*').addBack().contents().filter((_, node) => node.type === 'text');
        walker.each((_, node) => {
          let next = node.data;
          for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
          node.data = next;
        });
      });
    }
  }
}

console.log('Applied editorial French/Spanish localization across portfolio pages.');
