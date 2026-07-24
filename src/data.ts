import { DayPlan, PackingItem, Checklist } from './types';

export const itineraryData: DayPlan[] = [
  { 
    day: 1, date: "Sáb 1 Ago", title: "Aterrizaje en el Paraíso", icon: "🛬", car: false,
    desc: "Llegada al aeropuerto a las 18:20. Tras recoger el equipaje, tomad un traslado (o bus 343 si llegáis a TFS) directo hacia el norte, al Hotel Panorámica Garden en El Toscal. Es día de instalación.",
    route: ["Llegada 18:20", "Bus/Transfer hacia el Norte", "Check-in Hotel Panorámica Garden", "Cena tranquila por la zona de El Toscal"],
    tip: "No alquiles coche hoy. Un transfer o bus os saldrá mucho más barato que pagar un día de alquiler y aparcamiento para no usarlo.",
    food: "Buscad un bar local en El Toscal o Punta Brava para unas papas con mojo de bienvenida."
  },
  { 
    day: 2, date: "Dom 2 Ago", title: "Exploración Local y Loros", icon: "🦜", car: false,
    desc: "Día dedicado a conocer vuestra zona. Bajad a Puerto de la Cruz (caminando o en bus urbano). Por la mañana disfrutad del Lago Martiánez y por la tarde visitad Loro Parque, que está en la misma ciudad.",
    route: ["Paseo por Plaza del Charco y muelle", "Baño en Lago Martiánez (7€)", "Comida en Puerto de la Cruz", "Tarde en Loro Parque"],
    tip: "Comprad online el 'Twin Ticket' (Loro Parque + Siam Park) por 78€. Ahorraréis 14€ por persona respecto a comprarlos separados.",
    food: "Pescado fresco o churros de pescado en el barrio de La Ranilla en Puerto de la Cruz."
  },
  { 
    day: 3, date: "Lun 3 Ago", title: "Historia, Miradores y Playa", icon: "🏛️", car: true,
    desc: "Recogéis el coche de alquiler en Puerto de la Cruz. Conducid a La Orotava, parad en el Mirador de Humboldt. Luego id a La Laguna (Patrimonio UNESCO) y terminad la tarde relajandoos en la Playa de las Teresitas.",
    route: ["Recogida coche alquiler", "La Orotava y Mirador Humboldt", "San Cristóbal de la Laguna (Free tour ideal)", "Tarde en Playa Las Teresitas (Santa Cruz)"],
    tip: "En La Laguna suele hacer más fresco (el 'Aeropuerto de Mordor' está cerca), llevad algo de abrigo por si acaso.",
    food: "¡Día de estreno de Guachinche! A la vuelta por el norte, parad en uno (ej. Guachinche El Cubano o similar) para carne de fiesta."
  },
  { 
    day: 4, date: "Mar 4 Ago", title: "Parque Jurásico: Anaga", icon: "🌿", car: true,
    desc: "Día de pura naturaleza exuberante. Conducid por la serpenteante carretera del Macizo de Anaga. Haced alguna ruta corta por la laurisilva y acabad bajando por las vertiginosas curvas hasta la salvaje Playa de Benijo.",
    route: ["Carretera del Macizo de Anaga", "Sendero de los Sentidos (Cruz del Carmen)", "Mirador Pico del Inglés", "Atardecer en Playa de Benijo"],
    tip: "En Benijo tened MUCHO cuidado con el oleaje, es una playa preciosa pero traicionera. Usad el hotel para el bocadillo de mediodía.",
    food: "Comida de bocadillos de la cocina del hotel, y cena tardía de pescado en Roque de las Bodegas cerca de Benijo."
  },
  { 
    day: 5, date: "Mié 5 Ago", title: "El Techo de España", icon: "🌋", car: true,
    desc: "Subida al Parque Nacional del Teide por el bosque de La Esperanza. Un paisaje lunar impresionante. Visitad los Roques de García y quedaos a ver cómo el sol se esconde tras el mar de nubes.",
    route: ["Subida por Carretera de la Esperanza", "Miradores del Parque Nacional", "Roques de García", "Atardecer y observación de estrellas"],
    tip: "Llevad cortavientos y sudadera. A 2.200m de altitud las temperaturas caen drásticamente cuando se esconde el sol.",
    food: "Llevad provisiones completas hoy; arriba hay pocas opciones y son muy turísticas/caras."
  },
  { 
    day: 6, date: "Jue 6 Ago", title: "Dragos, Cuevas y Lava", icon: "🌳", car: true,
    desc: "Ruta por el noroeste. Visitad Icod de los Vinos para ver el Drago Milenario y adentraros en la Cueva del Viento. Por la tarde, baño en las piscinas naturales formadas por lava en Garachico.",
    route: ["Icod de los Vinos (Drago)", "Tubo Volcánico: Cueva del Viento", "Garachico (pueblo y fuerte)", "Baño en piscinas El Caletón"],
    tip: "La entrada a la Cueva del Viento requiere reserva online estricta con semanas de antelación.",
    food: "Es el lugar perfecto para probar las 'Quesadillas Herreñas' o un 'Barraquito' (café canario) tras la comida en Icod."
  },
  { 
    day: 7, date: "Vie 7 Ago", title: "Adrenalina en Siam Park", icon: "🎢", car: true,
    desc: "Madrugón para ir al sur. Entrad al Siam Park nada más abrir para aprovechar sin colas masivas. Cuando cerréis el parque, podéis acercaros a la elegante Playa del Duque en Costa Adeje para relajar el cuerpo.",
    route: ["Madrugar y viaje al Sur (Autopista)", "Siam Park (Día completo)", "Tarde/Noche en Costa Adeje (Playa del Duque)", "Vuelta al hotel"],
    tip: "En Siam Park podéis llevar vuestra propia comida y agua en la mochila y dejarla en las taquillas.",
    food: "Podéis permitiros un capricho cenando por Costa Adeje, o comer rápido allí y cenar tranquilamente en vuestro apartamento."
  },
  { 
    day: 8, date: "Sáb 8 Ago", title: "Gigantes y Masca", icon: "🧗", car: true,
    desc: "Impresionantes muros de roca en Los Gigantes (recomendable kayak o barco). Luego, subid al pintoresco y remoto pueblo de Masca por una carretera no apta para gente con vértigo.",
    route: ["Puerto de los Gigantes (Tour en barco)", "Vistas de los Acantilados (600m)", "Subida en coche a Masca", "Mirador del Emigrante"],
    tip: "Para Masca, id pronto porque el aparcamiento es minúsculo. Si está lleno, aparcad en Buenavista y subid en el bus/guagua local.",
    food: "Probad el 'Pollo al Salmorejo' en algún restaurante rústico bajando hacia Santiago del Teide."
  },
  { 
    day: 9, date: "Dom 9 Ago", title: "Viento, Surf y Despedida", icon: "🏄", car: true,
    desc: "Último día de exploración. Rumbo a El Médano para absorber su ambiente hippie/surfero. Pasead por la kilométrica Playa de la Tejita junto a la Montaña Roja. Al final del día, devolved el coche en Puerto de la Cruz.",
    route: ["Pueblo de El Médano", "Playa de La Tejita / Montaña Roja", "Opción tarde: Barranco del Infierno (Adeje)", "Vuelta al Norte y devolución de coche"],
    tip: "Aprovechad para comprar souvenirs o algún buen vino (Tacoronte-Acentejo) en algún mercadillo local del sur.",
    food: "Chiringuitos en El Médano, buena zona para tomar unas Doradas frías frente al mar."
  },
  { 
    day: 10, date: "Lun 10 Ago", title: "Hasta Pronto Canarias", icon: "🛫", car: false,
    desc: "Mañana de relax. Disfrutad del desayuno del hotel, daos un último baño en la piscina y preparad las maletas. El vuelo a Bilbao sale a las 15:25, así que salid hacia el aeropuerto sobre las 12:00.",
    route: ["Desayuno relajado", "Piscina del Hotel Panorámica Garden", "Check-out a las 11:30", "Bus/Traslado al Aeropuerto. Vuelo 15:25"],
    tip: "Sin coche de alquiler hoy, no hay prisas ni papeleos de devolución en el aeropuerto.",
    food: "Comida rápida en el aeropuerto o sándwiches preparados en la cocina del apartamento."
  }
];

export const defaultPackingList: PackingItem[] = [
  { id: 'p1', label: 'Protector solar alto (50+)', checked: false, category: 'Playa & Sol' },
  { id: 'p2', label: 'Bañador y toalla microfibra', checked: false, category: 'Playa & Sol' },
  { id: 'p3', label: 'Gafas de buceo (Snorkel)', checked: false, category: 'Playa & Sol' },
  { id: 'p4', label: 'Escarpines (Charcos y rocas)', checked: false, category: 'Playa & Sol' },
  { id: 'p5', label: 'Sudadera/Cortavientos (Teide)', checked: false, category: 'Montaña' },
  { id: 'p6', label: 'Calzado deportivo o botas', checked: false, category: 'Montaña' },
  { id: 'p7', label: 'Mochila pequeña excursiones', checked: false, category: 'Montaña' },
  { id: 'p8', label: 'Carnet de conducir', checked: false, category: 'Documentos' },
  { id: 'p9', label: 'DNI y Tarjeta Sanitaria', checked: false, category: 'Documentos' },
  { id: 'p10', label: 'Entradas Loro/Siam Park', checked: false, category: 'Documentos' },
  { id: 'p11', label: 'Batería externa (Powerbank)', checked: false, category: 'Electrónica' },
];

export const defaultChecklists: Checklist[] = [
  {
    id: 'c1',
    name: 'Equipaje',
    items: defaultPackingList
  }
];

export const TOTAL_BUDGET = 1576;
