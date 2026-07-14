import { Club, Stadium, Player, Official, Match, UserProfile, Series, Phase, Standing, DisciplinarySanction } from '../types';

// Helper to generate simple IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Series Definition
export const mockSeries: Series[] = [
  { id: 'series-a', name: 'Serie A', slug: 'serie-a', num_clubs: 16, season_year: 2026 },
  { id: 'series-b', name: 'Serie B', slug: 'serie-b', num_clubs: 10, season_year: 2026 }
];

// Phases Definition
export const mockPhases: Phase[] = [
  { id: 'phase-a-1', series_id: 'series-a', name: 'Fase Uno', phase_order: 1, resets_points: false, resets_yellow_cards: false },
  { id: 'phase-a-2', series_id: 'series-a', name: 'Fase Dos', phase_order: 2, resets_points: true, resets_yellow_cards: true },
  { id: 'phase-a-final', series_id: 'series-a', name: 'Fase Final', phase_order: 3, resets_points: true, resets_yellow_cards: true },
  { id: 'phase-b-1', series_id: 'series-b', name: 'Fase de Clasificación', phase_order: 1, resets_points: false, resets_yellow_cards: false }
];

// Stadiums
export const mockStadiums: Stadium[] = [
  { id: 'stad-monumental', name: 'Estadio Monumental Banco Pichincha', city: 'Guayaquil', altitude_m: 4, capacity: 59283, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-rodrigo-paz', name: 'Estadio Rodrigo Paz Delgado', city: 'Quito', altitude_m: 2726, capacity: 41575, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-capwell', name: 'Estadio George Capwell', city: 'Guayaquil', altitude_m: 4, capacity: 40000, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-chucho-benitez', name: 'Estadio Christian Benítez Betancourt', city: 'Guayaquil', altitude_m: 5, capacity: 10150, turf_type: 'artificial', turf_height_mm: 22, quality_pro_certified: true, quality_pro_expiry: '2027-12-31', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-atahualpa', name: 'Estadio Olímpico Atahualpa', city: 'Quito', altitude_m: 2783, capacity: 35258, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-banco-guayaquil', name: 'Estadio Banco Guayaquil', city: 'Sangolquí', altitude_m: 2500, capacity: 12000, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-bellavista', name: 'Estadio Bellavista', city: 'Ambato', altitude_m: 2620, capacity: 16467, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-jocay', name: 'Estadio Jocay', city: 'Manta', altitude_m: 6, capacity: 22000, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-reina-del-cisne', name: 'Estadio Reina del Cisne', city: 'Loja', altitude_m: 2060, capacity: 14935, turf_type: 'natural', var_infrastructure_ok: false, is_qualified: true },
  { id: 'stad-alejandro-serrano', name: 'Estadio Alejandro Serrano Aguilar', city: 'Cuenca', altitude_m: 2560, capacity: 16500, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-9-mayo', name: 'Estadio 9 de Mayo', city: 'Machala', altitude_m: 6, capacity: 16500, turf_type: 'natural', var_infrastructure_ok: true, is_qualified: true },
  { id: 'stad-olimpico-ibarra', name: 'Estadio Olímpico de Ibarra', city: 'Ibarra', altitude_m: 2225, capacity: 17300, turf_type: 'natural', var_infrastructure_ok: false, is_qualified: true }
];

// Clubs
export const mockClubs: Club[] = [
  // Serie A Clubs (16)
  { id: 'club-barcelona', name: 'Barcelona Sporting Club', short_name: 'Barcelona SC', crest_url: 'https://placehold.co/100x100/ffe600/000000?text=BSC', primary_color: '#ffe600', secondary_color: '#d60000', alt_kit_colors: ['#000000', '#ffffff'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-monumental', founded_year: 1925 },
  { id: 'club-ldu', name: 'Liga Deportiva Universitaria', short_name: 'LDU Quito', crest_url: 'https://placehold.co/100x100/ffffff/d60000?text=LDU', primary_color: '#ffffff', secondary_color: '#d60000', alt_kit_colors: ['#000000', '#001f3f'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-rodrigo-paz', founded_year: 1918 },
  { id: 'club-emelec', name: 'Club Sport Emelec', short_name: 'Emelec', crest_url: 'https://placehold.co/100x100/004b93/ffffff?text=CSE', primary_color: '#004b93', secondary_color: '#9ca3af', alt_kit_colors: ['#000000', '#ffffff'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-capwell', founded_year: 1929 },
  { id: 'club-idv', name: 'Independiente del Valle', short_name: 'Ind. del Valle', crest_url: 'https://placehold.co/100x100/000033/ff007f?text=IDV', primary_color: '#000033', secondary_color: '#ff007f', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-banco-guayaquil', founded_year: 1958 },
  { id: 'club-elnacional', name: 'Club Deportivo El Nacional', short_name: 'El Nacional', crest_url: 'https://placehold.co/100x100/d60000/0000cd?text=NAC', primary_color: '#d60000', secondary_color: '#0000cd', alt_kit_colors: ['#ffffff', '#4b5563'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1964 },
  { id: 'club-delfin', name: 'Delfín Sporting Club', short_name: 'Delfín SC', crest_url: 'https://placehold.co/100x100/0000cd/ffe600?text=DEL', primary_color: '#0000cd', secondary_color: '#ffe600', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-jocay', founded_year: 1989 },
  { id: 'club-ucatolica', name: 'Club Deportivo Universidad Católica', short_name: 'U. Católica', crest_url: 'https://placehold.co/100x100/87ceeb/0000cd?text=UC', primary_color: '#87ceeb', secondary_color: '#0000cd', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1963 },
  { id: 'club-aucas', name: 'Sociedad Deportiva Aucas', short_name: 'Aucas', crest_url: 'https://placehold.co/100x100/ffe600/d60000?text=SDA', primary_color: '#ffe600', secondary_color: '#d60000', alt_kit_colors: ['#000000', '#ffffff'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1945 },
  { id: 'club-mushucruna', name: 'Mushuc Runa Sporting Club', short_name: 'Mushuc Runa', crest_url: 'https://placehold.co/100x100/008000/ffffff?text=MRU', primary_color: '#008000', secondary_color: '#ffffff', alt_kit_colors: ['#d60000', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-chucho-benitez', founded_year: 2003 },
  { id: 'club-macara', name: 'Club Social y Deportivo Macará', short_name: 'Macará', crest_url: 'https://placehold.co/100x100/00bfff/ffffff?text=MAC', primary_color: '#00bfff', secondary_color: '#ffffff', alt_kit_colors: ['#000080', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-bellavista', founded_year: 1939 },
  { id: 'club-tecnico', name: 'Club Técnico Universitario', short_name: 'Técnico Univ.', crest_url: 'https://placehold.co/100x100/d60000/ffffff?text=TEC', primary_color: '#d60000', secondary_color: '#ffffff', alt_kit_colors: ['#000000', '#ffe600'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-bellavista', founded_year: 1954 },
  { id: 'club-orense', name: 'Orense Sporting Club', short_name: 'Orense SC', crest_url: 'https://placehold.co/100x100/006400/ffe600?text=ORE', primary_color: '#006400', secondary_color: '#ffe600', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-9-mayo', founded_year: 2009 },
  { id: 'club-cumbaya', name: 'Cumbayá Fútbol Club', short_name: 'Cumbayá FC', crest_url: 'https://placehold.co/100x100/4b0082/ffffff?text=CUM', primary_color: '#4b0082', secondary_color: '#ffffff', alt_kit_colors: ['#008080', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1970 },
  { id: 'club-libertad', name: 'Libertad Fútbol Club', short_name: 'Libertad FC', crest_url: 'https://placehold.co/100x100/ffa500/ffffff?text=LIB', primary_color: '#ffa500', secondary_color: '#ffffff', alt_kit_colors: ['#000000', '#000080'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-reina-del-cisne', founded_year: 2017 },
  { id: 'club-cuenca', name: 'Club Deportivo Cuenca', short_name: 'Dep. Cuenca', crest_url: 'https://placehold.co/100x100/d60000/000000?text=CUE', primary_color: '#d60000', secondary_color: '#000000', alt_kit_colors: ['#ffffff', '#ffe600'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-alejandro-serrano', founded_year: 1971 },
  { id: 'club-imbabura', name: 'Imbabura Sporting Club', short_name: 'Imbabura SC', crest_url: 'https://placehold.co/100x100/0000cd/ffffff?text=IMB', primary_color: '#0000cd', secondary_color: '#ffffff', alt_kit_colors: ['#ff8c00', '#000000'], series_id: 'series-a', is_filial: false, is_enabled: true, home_stadium_id: 'stad-olimpico-ibarra', founded_year: 1993 },

  // Serie B Clubs (10)
  { id: 'club-manta', name: 'Manta Fútbol Club', short_name: 'Manta FC', crest_url: 'https://placehold.co/100x100/00bfff/ffe600?text=MAN', primary_color: '#00bfff', secondary_color: '#ffe600', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-jocay', founded_year: 1998 },
  { id: 'club-gqcity', name: 'Guayaquil City Fútbol Club', short_name: 'Guayaquil City', crest_url: 'https://placehold.co/100x100/87ceeb/ffffff?text=GQC', primary_color: '#87ceeb', secondary_color: '#ffffff', alt_kit_colors: ['#000080', '#000000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-chucho-benitez', founded_year: 2007 },
  { id: 'club-cuniburo', name: 'Cuniburo Fútbol Club', short_name: 'Cuniburo FC', crest_url: 'https://placehold.co/100x100/d60000/ffe600?text=CUN', primary_color: '#d60000', secondary_color: '#ffe600', alt_kit_colors: ['#008000', '#ffffff'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1967 },
  { id: 'club-chacaritas', name: 'Chacaritas Fútbol Club', short_name: 'Chacaritas', crest_url: 'https://placehold.co/100x100/000080/ffe600?text=CHA', primary_color: '#000080', secondary_color: '#ffe600', alt_kit_colors: ['#d60000', '#ffffff'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-bellavista', founded_year: 1960 },
  { id: 'club-leones', name: 'Club Deportivo Leones del Norte', short_name: 'Leones del Norte', crest_url: 'https://placehold.co/100x100/ffa500/000000?text=LEO', primary_color: '#ffa500', secondary_color: '#000000', alt_kit_colors: ['#ffffff', '#0000cd'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-olimpico-ibarra', founded_year: 2018 },
  { id: 'club-vargastorres', name: 'Club Deportivo Vargas Torres', short_name: 'Vargas Torres', crest_url: 'https://placehold.co/100x100/008000/ffffff?text=VTO', primary_color: '#008000', secondary_color: '#ffffff', alt_kit_colors: ['#ffff00', '#000000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-atahualpa', founded_year: 1983 },
  { id: 'club-9octubre', name: '9 de Octubre Fútbol Club', short_name: '9 de Octubre', crest_url: 'https://placehold.co/100x100/00bfff/ffffff?text=9OC', primary_color: '#00bfff', secondary_color: '#ffffff', alt_kit_colors: ['#d60000', '#000000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-chucho-benitez', founded_year: 1912 },
  { id: 'club-sanantonio', name: 'San Antonio Fútbol Club', short_name: 'San Antonio', crest_url: 'https://placehold.co/100x100/ffffff/d60000?text=SAN', primary_color: '#ffffff', secondary_color: '#d60000', alt_kit_colors: ['#0000cd', '#000000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-olimpico-ibarra', founded_year: 1957 },
  { id: 'club-gualaceo', name: 'Gualaceo Sporting Club', short_name: 'Gualaceo SC', crest_url: 'https://placehold.co/100x100/008080/ffe600?text=GUA', primary_color: '#008080', secondary_color: '#ffe600', alt_kit_colors: ['#ffffff', '#d60000'], series_id: 'series-b', is_filial: false, is_enabled: true, home_stadium_id: 'stad-alejandro-serrano', founded_year: 2000 },
  { id: 'club-idjuniors', name: 'Independiente Juniors', short_name: 'Ind. Juniors', crest_url: 'https://placehold.co/100x100/000033/ff007f?text=IDJ', primary_color: '#000033', secondary_color: '#ff007f', alt_kit_colors: ['#ffffff', '#000000'], series_id: 'series-b', is_filial: true, is_enabled: true, home_stadium_id: 'stad-banco-guayaquil', founded_year: 2017 }
];

// Officials
export const mockOfficials: Official[] = [
  { id: 'off-damián-diaz', full_name: 'Damián Díaz', official_type: 'arbitro', is_foreign: false, credential_status: 'active' },
  { id: 'off-augusto-aragon', full_name: 'Augusto Aragón', official_type: 'arbitro', is_foreign: false, credential_status: 'active' },
  { id: 'off-alex-cajas', full_name: 'Álex Cajas', official_type: 'arbitro', is_foreign: false, credential_status: 'active' },
  { id: 'off-wilmar-roldan', full_name: 'Wilmar Roldán', official_type: 'arbitro', is_foreign: true, credential_status: 'active' },
  { id: 'off-carlos-ortega', full_name: 'Carlos Ortega', official_type: 'arbitro', is_foreign: false, credential_status: 'active' },
  { id: 'off-com-1', full_name: 'Pedro Romero', official_type: 'comisario_juego', is_foreign: false, credential_status: 'active' },
  { id: 'off-com-2', full_name: 'Mariana Acosta', official_type: 'comisario_juego', is_foreign: false, credential_status: 'active' },
  { id: 'off-seg-1', full_name: 'General Luis Flores', official_type: 'delegado_seguridad', is_foreign: false, credential_status: 'active' },
  { id: 'off-pat-1', full_name: 'Gabriela Jaramillo', official_type: 'oficial_patrocinio', is_foreign: false, credential_status: 'active' },
  { id: 'off-var-1', full_name: 'Jefferson Macías', official_type: 'oficial_var', is_foreign: false, credential_status: 'active' },
  { id: 'off-var-2', full_name: 'Luis Quiroz', official_type: 'oficial_var', is_foreign: false, credential_status: 'active' }
];

// Generate Players for LDU, Barcelona, Emelec and IDV (the big ones)
const createMockPlayers = (): Player[] => {
  const positions: Array<'portero' | 'defensa' | 'mediocampista' | 'delantero'> = ['portero', 'defensa', 'mediocampista', 'delantero'];
  const players: Player[] = [];

  const clubData = [
    { id: 'club-barcelona', prefix: 'BSC' },
    { id: 'club-ldu', prefix: 'LDU' },
    { id: 'club-emelec', prefix: 'EME' },
    { id: 'club-idv', prefix: 'IDV' }
  ];

  clubData.forEach(({ id, prefix }) => {
    // Portero
    players.push({
      id: `${prefix}-p1`,
      club_id: id,
      first_name: 'Javier',
      last_name: 'Burrai',
      jersey_number: 1,
      position: 'portero',
      photo_url: 'https://placehold.co/150x150/000?text=Burrai',
      birth_date: '1990-10-09',
      is_captain: prefix === 'BSC',
      status: 'active'
    });

    // Defensa
    players.push({
      id: `${prefix}-d1`,
      club_id: id,
      first_name: 'Franklin',
      last_name: 'Guerra',
      jersey_number: 15,
      position: 'defensa',
      photo_url: 'https://placehold.co/150x150/000?text=Guerra',
      birth_date: '1992-04-12',
      is_captain: false,
      status: 'active'
    });
    players.push({
      id: `${prefix}-d2`,
      club_id: id,
      first_name: 'Ricardo',
      last_name: 'Adé',
      jersey_number: 4,
      position: 'defensa',
      photo_url: 'https://placehold.co/150x150/000?text=Ade',
      birth_date: '1990-05-21',
      is_captain: prefix === 'LDU',
      status: 'active'
    });

    // Mediocampistas
    players.push({
      id: `${prefix}-m1`,
      club_id: id,
      first_name: 'Kendry',
      last_name: 'Páez',
      jersey_number: 10,
      position: 'mediocampista',
      photo_url: 'https://placehold.co/150x150/000?text=Paez',
      birth_date: '2007-05-04',
      is_captain: false,
      status: 'active'
    });
    players.push({
      id: `${prefix}-m2`,
      club_id: id,
      first_name: 'Leonai',
      last_name: 'Souza',
      jersey_number: 22,
      position: 'mediocampista',
      photo_url: 'https://placehold.co/150x150/000?text=Leonai',
      birth_date: '1995-07-15',
      is_captain: false,
      status: 'active'
    });

    // Delanteros
    players.push({
      id: `${prefix}-a1`,
      club_id: id,
      first_name: 'Alex',
      last_name: 'Arce',
      jersey_number: 9,
      position: 'delantero',
      photo_url: 'https://placehold.co/150x150/000?text=Arce',
      birth_date: '1995-06-16',
      is_captain: false,
      status: 'active'
    });
    players.push({
      id: `${prefix}-a2`,
      club_id: id,
      first_name: 'Jhojan',
      last_name: 'Julio',
      jersey_number: 26,
      position: 'delantero',
      photo_url: 'https://placehold.co/150x150/000?text=Julio',
      birth_date: '1998-02-11',
      is_captain: false,
      status: 'active'
    });
    players.push({
      id: `${prefix}-a3`,
      club_id: id,
      first_name: 'Jaime',
      last_name: 'Ayoví',
      jersey_number: 17,
      position: 'delantero',
      photo_url: 'https://placehold.co/150x150/000?text=Ayovi',
      birth_date: '1988-02-21',
      is_captain: prefix === 'EME',
      status: 'active'
    });
  });

  // Fill in for other clubs with simplified generic players
  mockClubs.forEach((club) => {
    if (!['club-barcelona', 'club-ldu', 'club-emelec', 'club-idv'].includes(club.id)) {
      players.push({
        id: `p-${club.id}-cap`,
        club_id: club.id,
        first_name: 'Capitán',
        last_name: club.short_name,
        jersey_number: 10,
        position: 'mediocampista',
        photo_url: `https://placehold.co/150x150/000?text=${club.short_name}+10`,
        birth_date: '1994-01-01',
        is_captain: true,
        status: 'active'
      });
      players.push({
        id: `p-${club.id}-gk`,
        club_id: club.id,
        first_name: 'Arquero',
        last_name: club.short_name,
        jersey_number: 12,
        position: 'portero',
        photo_url: `https://placehold.co/150x150/000?text=${club.short_name}+GK`,
        birth_date: '1996-01-01',
        is_captain: false,
        status: 'active'
      });
    }
  });

  return players;
};

export const mockPlayers = createMockPlayers();

// Generate some sample fixtures for Serie A (Fase Uno, matchdays 1 and 2)
export const mockMatches: Match[] = [
  // Finished matches (Matchday 1)
  {
    id: 'match-1',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 1,
    home_club_id: 'club-ldu',
    away_club_id: 'club-barcelona',
    stadium_id: 'stad-rodrigo-paz',
    scheduled_at: '2026-07-04T18:00:00-05:00',
    notified_at: '2026-06-18T12:00:00-05:00',
    status: 'finished',
    unified_kickoff: false,
    home_score: 2,
    away_score: 1,
    home_score_penalties: null,
    away_score_penalties: null,
    referee_id: 'off-augusto-aragon',
    var_official_id: 'off-var-1',
    match_commissioner_id: 'off-com-1',
    security_delegate_id: 'off-seg-1',
    sponsorship_official_id: 'off-pat-1'
  },
  {
    id: 'match-2',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 1,
    home_club_id: 'club-emelec',
    away_club_id: 'club-idv',
    stadium_id: 'stad-capwell',
    scheduled_at: '2026-07-05T15:30:00-05:00',
    notified_at: '2026-06-18T12:00:00-05:00',
    status: 'finished',
    unified_kickoff: false,
    home_score: 0,
    away_score: 2,
    home_score_penalties: null,
    away_score_penalties: null,
    referee_id: 'off-alex-cajas',
    var_official_id: 'off-var-2',
    match_commissioner_id: 'off-com-2',
    security_delegate_id: 'off-seg-1'
  },
  {
    id: 'match-3',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 1,
    home_club_id: 'club-elnacional',
    away_club_id: 'club-delfin',
    stadium_id: 'stad-atahualpa',
    scheduled_at: '2026-07-05T13:00:00-05:00',
    notified_at: '2026-06-18T12:00:00-05:00',
    status: 'finished',
    unified_kickoff: false,
    home_score: 1,
    away_score: 1,
    home_score_penalties: null,
    away_score_penalties: null,
    referee_id: 'off-carlos-ortega'
  },
  
  // Live Match
  {
    id: 'match-live',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 1,
    home_club_id: 'club-ucatolica',
    away_club_id: 'club-aucas',
    stadium_id: 'stad-atahualpa',
    scheduled_at: new Date(Date.now() - 30 * 60000).toISOString(), // started 30 mins ago
    notified_at: '2026-06-18T12:00:00-05:00',
    status: 'live',
    unified_kickoff: false,
    home_score: 1,
    away_score: 0,
    home_score_penalties: null,
    away_score_penalties: null,
    referee_id: 'off-damián-diaz'
  },

  // Scheduled matches (Matchday 2 - in future)
  {
    id: 'match-4',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 2,
    home_club_id: 'club-barcelona',
    away_club_id: 'club-emelec', // Clásico del Astillero
    stadium_id: 'stad-monumental',
    scheduled_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 days from now
    notified_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(), // notified 12 days ago (rule requires 15, wait - let's check!)
    status: 'scheduled',
    unified_kickoff: false,
    home_score: null,
    away_score: null,
    home_score_penalties: null,
    away_score_penalties: null,
    referee_id: 'off-wilmar-roldan',
    var_official_id: 'off-var-1'
  },
  {
    id: 'match-5',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 2,
    home_club_id: 'club-idv',
    away_club_id: 'club-ldu',
    stadium_id: 'stad-banco-guayaquil',
    scheduled_at: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    notified_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    status: 'scheduled',
    unified_kickoff: false,
    home_score: null,
    away_score: null,
    home_score_penalties: null,
    away_score_penalties: null
  },
  // Suspended match
  {
    id: 'match-suspended',
    series_id: 'series-a',
    phase_id: 'phase-a-1',
    matchday: 1,
    home_club_id: 'club-mushucruna',
    away_club_id: 'club-macara',
    stadium_id: 'stad-chucho-benitez',
    scheduled_at: '2026-07-06T19:00:00-05:00',
    status: 'suspended',
    suspension_reason: 'Fuerte tormenta eléctrica y falta de energía en las luminarias.',
    unified_kickoff: false,
    home_score: 0,
    away_score: 0,
    home_score_penalties: null,
    away_score_penalties: null
  }
];

// Add dummy standings for remaining teams in Serie A to complete the list of 16
// This makes calculating standings from scratch more natural.
// Initially, we will calculate standings dynamically.

// Sanctions
export const mockSanctions: DisciplinarySanction[] = [
  {
    id: 'sanc-1',
    player_id: 'LDU-a1', // Alex Arce
    club_id: 'club-ldu',
    match_id: 'match-1',
    sanction_type: 'yellow_card_accumulation',
    description: 'Acumulación de 5 tarjetas amarillas reglamentarias (Art. 91).',
    amount_usd: 200,
    suspended_matches: 1,
    phase_id: 'phase-a-1',
    status: 'active',
    created_at: '2026-07-04T21:00:00-05:00'
  },
  {
    id: 'sanc-2',
    player_id: 'BSC-d1', // Franklin Guerra
    club_id: 'club-barcelona',
    match_id: 'match-1',
    sanction_type: 'red_card_suspension',
    description: 'Expulsión directa por juego brusco grave (Art. 93).',
    amount_usd: 500,
    suspended_matches: 2,
    phase_id: 'phase-a-1',
    status: 'active',
    created_at: '2026-07-04T21:00:00-05:00'
  },
  {
    id: 'sanc-3',
    club_id: 'club-emelec',
    match_id: 'match-2',
    sanction_type: 'fine',
    description: 'Uso de pirotecnia no autorizada en las tribunas por parte de la hinchada (Art. 81).',
    amount_usd: 1500,
    phase_id: 'phase-a-1',
    status: 'served',
    created_at: '2026-07-05T19:00:00-05:00'
  }
];

// User Profiles
export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user-hincha-1',
    display_name: 'Roberto Hincha',
    role: 'hincha',
    favorite_club_id: 'club-barcelona',
    notification_preferences: { match_reminders: true, results: true, sanctions: false }
  },
  {
    id: 'user-admin-1',
    display_name: 'Econ. Miguel Ángel Loor',
    role: 'maintenance_chief',
    avatar_url: 'https://placehold.co/100x100/0001ff/ffffff?text=ML'
  },
  {
    id: 'user-technician-1',
    display_name: 'Ing. Carlos Pérez',
    role: 'technician'
  }
];
