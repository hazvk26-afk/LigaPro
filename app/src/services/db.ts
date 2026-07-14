import { Series, Phase, Club, Stadium, Player, Official, Match, MatchEvent, Standing, DisciplinarySanction, UserProfile, Notification } from '../types';
import * as seed from './mockData';

// Storage keys
const KEYS = {
  SERIES: 'lpm_series',
  PHASES: 'lpm_phases',
  CLUBS: 'lpm_clubs',
  STADIUMS: 'lpm_stadiums',
  PLAYERS: 'lpm_players',
  OFFICIALS: 'lpm_officials',
  MATCHES: 'lpm_matches',
  SANCTIONS: 'lpm_sanctions',
  PROFILES: 'lpm_profiles',
  NOTIFICATIONS: 'lpm_notifications',
  CURRENT_USER: 'lpm_current_user',
  EVENTS: 'lpm_events'
};

const generateId = () => Math.random().toString(36).substring(2, 11);

// Initialize LocalStorage with seed data if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.SERIES)) localStorage.setItem(KEYS.SERIES, JSON.stringify(seed.mockSeries));
  if (!localStorage.getItem(KEYS.PHASES)) localStorage.setItem(KEYS.PHASES, JSON.stringify(seed.mockPhases));
  if (!localStorage.getItem(KEYS.CLUBS)) localStorage.setItem(KEYS.CLUBS, JSON.stringify(seed.mockClubs));
  if (!localStorage.getItem(KEYS.STADIUMS)) localStorage.setItem(KEYS.STADIUMS, JSON.stringify(seed.mockStadiums));
  if (!localStorage.getItem(KEYS.PLAYERS)) localStorage.setItem(KEYS.PLAYERS, JSON.stringify(seed.mockPlayers));
  if (!localStorage.getItem(KEYS.OFFICIALS)) localStorage.setItem(KEYS.OFFICIALS, JSON.stringify(seed.mockOfficials));
  if (!localStorage.getItem(KEYS.MATCHES)) localStorage.setItem(KEYS.MATCHES, JSON.stringify(seed.mockMatches));
  if (!localStorage.getItem(KEYS.SANCTIONS)) localStorage.setItem(KEYS.SANCTIONS, JSON.stringify(seed.mockSanctions));
  if (!localStorage.getItem(KEYS.PROFILES)) localStorage.setItem(KEYS.PROFILES, JSON.stringify(seed.mockUserProfiles));
  if (!localStorage.getItem(KEYS.EVENTS)) localStorage.setItem(KEYS.EVENTS, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  
  // Set current user as Admin 1 initially for convenient developer workflow
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(seed.mockUserProfiles[1])); // Admin
  }
};

// Load helper
const load = <T>(key: string): T[] => {
  initDB();
  return JSON.parse(localStorage.getItem(key) || '[]') as T[];
};

// Save helper
const save = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// GETTERS
export const getSeries = () => load<Series>(KEYS.SERIES);
export const getPhases = () => load<Phase>(KEYS.PHASES);
export const getClubs = () => load<Club>(KEYS.CLUBS);
export const getStadiums = () => load<Stadium>(KEYS.STADIUMS);
export const getPlayers = () => load<Player>(KEYS.PLAYERS);
export const getOfficials = () => load<Official>(KEYS.OFFICIALS);
export const getMatches = () => load<Match>(KEYS.MATCHES);
export const getSanctions = () => load<DisciplinarySanction>(KEYS.SANCTIONS);
export const getProfiles = () => load<UserProfile>(KEYS.PROFILES);
export const getNotifications = () => load<Notification>(KEYS.NOTIFICATIONS);
export const getEvents = () => load<MatchEvent>(KEYS.EVENTS);
export const getCurrentUser = (): UserProfile | null => {
  initDB();
  const val = localStorage.getItem(KEYS.CURRENT_USER);
  return val ? JSON.parse(val) : null;
};

// SETTERS / AUTH
export const setCurrentUser = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// Save updates
export const saveMatches = (matches: Match[]) => save(KEYS.MATCHES, matches);
export const saveSanctions = (sanctions: DisciplinarySanction[]) => save(KEYS.SANCTIONS, sanctions);
export const saveEvents = (events: MatchEvent[]) => save(KEYS.EVENTS, events);
export const savePlayers = (players: Player[]) => save(KEYS.PLAYERS, players);
export const saveStadiums = (stadiums: Stadium[]) => save(KEYS.STADIUMS, stadiums);
export const saveClubs = (clubs: Club[]) => save(KEYS.CLUBS, clubs);
export const saveOfficials = (officials: Official[]) => save(KEYS.OFFICIALS, officials);
export const saveNotifications = (notifications: Notification[]) => save(KEYS.NOTIFICATIONS, notifications);

// --- BUSINESS ENGINE LITE ---

/**
 * Validates match scheduling based on LIGAPRO rules:
 * RN-14: Notification at least 15 days in advance (we warn the user, but let admin override if needed)
 * RN-15: No Serie A matches on FIFA dates (mocked FIFA dates)
 * RN-26: Stadium is VAR qualified if phase requires it (Fase Dos Serie A)
 */
export interface ScheduleValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

const FIFA_DATES = ['2026-09-07', '2026-09-08', '2026-10-12', '2026-10-13', '2026-11-16', '2026-11-17'];

export const validateMatchSchedule = (
  matchData: Partial<Match>,
  stadium: Stadium | undefined,
  series: Series | undefined,
  phase: Phase | undefined
): ScheduleValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!matchData.scheduled_at) {
    errors.push('Debe especificar una fecha y hora para el encuentro.');
    return { valid: false, errors, warnings };
  }

  const matchDate = new Date(matchData.scheduled_at);
  const matchDateStr = matchData.scheduled_at.split('T')[0];

  // Validate Stadium
  if (stadium) {
    if (!stadium.is_qualified) {
      errors.push(`El estadio ${stadium.name} no está calificado por la Dirección de Escenarios.`);
    }
    // RN-26: VAR infrastructure check for Serie A - Fase Dos
    if (series?.slug === 'serie-a' && phase?.name === 'Fase Dos' && !stadium.var_infrastructure_ok) {
      errors.push(`El estadio ${stadium.name} no cuenta con la infraestructura VAR calificada, la cual es obligatoria para la Fase Dos.`);
    }
    // RN-25: Quality Pro expiry alert
    if (stadium.turf_type === 'artificial') {
      if (!stadium.quality_pro_certified) {
        errors.push(`El estadio ${stadium.name} posee césped artificial pero no cuenta con certificación FIFA Quality Pro.`);
      } else if (stadium.quality_pro_expiry && new Date(stadium.quality_pro_expiry) < matchDate) {
        errors.push(`La certificación FIFA Quality Pro del estadio ${stadium.name} expira el ${stadium.quality_pro_expiry}, que es antes del partido.`);
      }
    }
  }

  // RN-14: 15 days advance notice
  if (matchData.notified_at) {
    const notifyDate = new Date(matchData.notified_at);
    const diffDays = Math.ceil((matchDate.getTime() - notifyDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 15) {
      warnings.push(`Notificación realizada con ${diffDays} días de anticipación (El reglamento exige mínimo 15 días, Art. 25).`);
    }
  } else {
    // If not specified, check against current date
    const today = new Date();
    const diffDays = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 15) {
      warnings.push(`El partido se está programando a menos de 15 días a partir de hoy (quedan ${diffDays} días).`);
    }
  }

  // RN-15: FIFA date check for Serie A
  if (series?.slug === 'serie-a' && FIFA_DATES.includes(matchDateStr)) {
    errors.push('No se pueden programar partidos de Serie A en fechas FIFA.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculates standings table for a specific phase or accumulated
 */
export const calculateStandings = (seriesId: 'series-a' | 'series-b', phaseId: string | 'acumulada'): Standing[] => {
  const clubs = getClubs().filter(c => c.series_id === seriesId && c.is_enabled);
  const matches = getMatches().filter(m => m.series_id === seriesId);
  const events = getEvents();

  // Filter matches based on phase
  let filteredMatches: Match[] = [];
  if (phaseId === 'acumulada') {
    // Accumulated standings include all phase matches except the final playoff (Fase Uno + Fase Dos)
    // In our seed, phase-a-1 and phase-a-2 are the standard phases.
    filteredMatches = matches.filter(m => m.phase_id !== 'phase-a-final' && (m.status === 'finished' || m.status === 'walkover'));
  } else {
    filteredMatches = matches.filter(m => m.phase_id === phaseId && (m.status === 'finished' || m.status === 'walkover'));
  }

  // Initial standings object map
  const statsMap: Record<string, Omit<Standing, 'position' | 'tiebreak_applied'>> = {};
  clubs.forEach(club => {
    statsMap[club.id] = {
      id: generateId(),
      series_id: seriesId,
      phase_id: phaseId,
      club_id: club.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      zone: 'none'
    };
  });

  // Populate match stats
  filteredMatches.forEach(match => {
    const home = statsMap[match.home_club_id];
    const away = statsMap[match.away_club_id];
    
    // Skip if club is disabled or not in this division
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    const hs = match.home_score ?? 0;
    const as = match.away_score ?? 0;

    home.goals_for += hs;
    home.goals_against += as;
    home.goal_difference += (hs - as);

    away.goals_for += as;
    away.goals_against += hs;
    away.goal_difference += (as - hs);

    if (hs > as) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (hs < as) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      home.points += 1;
      away.drawn += 1;
      away.points += 1;
    }
  });

  // Convert to array
  const standingsList = Object.values(statsMap);

  // Sorting / Tie-breaking logic (RN-04 & RN-10)
  // Criterios de desempate:
  // 1. Puntos
  // 2. Gol Diferencia (GD)
  // 3. Goles Marcados (GF)
  // 4. Goles de visitante (Solo para acumulada)
  // 5. Enfrentamiento directo (Head to Head)
  // 6. Sorteo (simulado en mock)
  standingsList.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;

    // 2. Goal Difference
    if (b.goal_difference !== a.goal_difference) {
      return b.goal_difference - a.goal_difference;
    }

    // 3. Goals For
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;

    // 4. Away Goals (If Accumulated)
    if (phaseId === 'acumulada') {
      const aAwayGoals = calculateAwayGoals(a.club_id, filteredMatches);
      const bAwayGoals = calculateAwayGoals(b.club_id, filteredMatches);
      if (bAwayGoals !== aAwayGoals) return bAwayGoals - aAwayGoals;
    }

    // 5. Head to Head performance
    const h2h = getHeadToHeadPerformance(a.club_id, b.club_id, filteredMatches);
    if (h2h !== 0) return h2h; // Negative means a is better, positive means b is better

    // 6. Draw (fallback)
    return a.club_id.localeCompare(b.club_id);
  });

  // Assign positions and zones (RN-08, RN-09, RN-12)
  const standingsWithRank: Standing[] = standingsList.map((standing, index) => {
    const pos = index + 1;
    let zone: Standing['zone'] = 'none';

    if (seriesId === 'series-a') {
      if (phaseId === 'phase-a-1' || phaseId === 'phase-a-2') {
        if (pos === 1) zone = 'qualification_final_phase';
      } else if (phaseId === 'acumulada') {
        // Libertadores: Top 3 (excluding phase winners, simplified to top 4 here)
        if (pos <= 4) zone = 'libertadores';
        else if (pos > 4 && pos <= 8) zone = 'sudamericana';
        else if (pos >= 15) zone = 'relegation'; // Relegation (Last 2, Art. 14)
      }
    } else if (seriesId === 'series-b') {
      // Serie B Ascension: Top 2 non-filial (Art. 18, 19)
      const club = clubs.find(c => c.id === standing.club_id);
      const nonFilialRank = standingsList
        .filter(s => {
          const c = clubs.find(cl => cl.id === s.club_id);
          return c && !c.is_filial;
        })
        .findIndex(s => s.club_id === standing.club_id);

      if (club && !club.is_filial && nonFilialRank >= 0 && nonFilialRank < 2) {
        zone = 'qualification_final_phase'; // Treat as qualified/promoted
      } else if (pos >= 9) {
        zone = 'relegation'; // Relegation
      }
    }

    // Determine tiebreak applied
    let tiebreakApplied: Standing['tiebreak_applied'] = null;
    const samePoints = standingsList.filter(s => s.points === standing.points);
    if (samePoints.length > 1) {
      const sameGD = samePoints.filter(s => s.goal_difference === standing.goal_difference);
      if (sameGD.length > 1) {
        const sameGF = sameGD.filter(s => s.goals_for === standing.goals_for);
        if (sameGF.length > 1) {
          tiebreakApplied = 'away_goals';
        } else {
          tiebreakApplied = 'goals_for';
        }
      } else {
        tiebreakApplied = 'goal_difference';
      }
    }

    return {
      ...standing,
      position: pos,
      zone,
      tiebreak_applied: tiebreakApplied
    };
  });

  return standingsWithRank;
};

// Helper to count goals scored away from home
const calculateAwayGoals = (clubId: string, matches: Match[]): number => {
  return matches
    .filter(m => m.away_club_id === clubId)
    .reduce((sum, m) => sum + (m.away_score ?? 0), 0);
};

// Helper for head to head points comparison between two clubs
const getHeadToHeadPerformance = (clubAId: string, clubBId: string, matches: Match[]): number => {
  const h2hMatches = matches.filter(m => 
    (m.home_club_id === clubAId && m.away_club_id === clubBId) ||
    (m.home_club_id === clubBId && m.away_club_id === clubAId)
  );

  let clubAPoints = 0;
  let clubBPoints = 0;

  h2hMatches.forEach(m => {
    const isHomeA = m.home_club_id === clubAId;
    const scoreA = isHomeA ? (m.home_score ?? 0) : (m.away_score ?? 0);
    const scoreB = isHomeA ? (m.away_score ?? 0) : (m.home_score ?? 0);

    if (scoreA > scoreB) clubAPoints += 3;
    else if (scoreA < scoreB) clubBPoints += 3;
    else {
      clubAPoints += 1;
      clubBPoints += 1;
    }
  });

  // Higher points is better (we want A before B, so return negative if A has more points)
  if (clubAPoints !== clubBPoints) return clubBPoints - clubAPoints;

  // H2H Goal difference
  let clubAGD = 0;
  h2hMatches.forEach(m => {
    const isHomeA = m.home_club_id === clubAId;
    const scoreA = isHomeA ? (m.home_score ?? 0) : (m.away_score ?? 0);
    const scoreB = isHomeA ? (m.away_score ?? 0) : (m.home_score ?? 0);
    clubAGD += (scoreA - scoreB);
  });

  return -clubAGD; // Negative if A has higher GD
};

/**
 * Register a match event and automatically check for yellow card accumulation (RN-20)
 */
export const addMatchEvent = (event: Omit<MatchEvent, 'id'>) => {
  const events = getEvents();
  const newEvent: MatchEvent = {
    ...event,
    id: generateId()
  };

  events.push(newEvent);
  saveEvents(events);

  // Check for disciplinary suspension: RN-20 (5 yellow cards)
  if (event.event_type === 'yellow_card') {
    const match = getMatches().find(m => m.id === event.match_id);
    if (match) {
      checkYellowCardAccumulation(event.player_id, match.phase_id, event.match_id);
    }
  }

  // Handle direct red cards immediately
  if (event.event_type === 'red_card') {
    const match = getMatches().find(m => m.id === event.match_id);
    if (match) {
      createRedCardSuspension(event.player_id, event.club_id, event.match_id, match.phase_id);
    }
  }
};

const checkYellowCardAccumulation = (playerId: string, phaseId: string, matchId: string) => {
  const events = getEvents();
  const matches = getMatches();
  const player = getPlayers().find(p => p.id === playerId);
  
  if (!player) return;

  // Get matches in this phase
  const phaseMatches = matches.filter(m => m.phase_id === phaseId).map(m => m.id);

  // Count yellow cards in this phase
  const yellowCardsCount = events.filter(e => 
    e.player_id === playerId && 
    e.event_type === 'yellow_card' && 
    phaseMatches.includes(e.match_id)
  ).length;

  if (yellowCardsCount > 0 && yellowCardsCount % 5 === 0) {
    // Generate automatic suspension!
    const sanctions = getSanctions();
    const club = getClubs().find(c => c.id === player.club_id);
    const amount = club?.series_id === 'series-b' ? 10 : 20; // RN-22: yellow card fee

    const newSanction: DisciplinarySanction = {
      id: generateId(),
      player_id: playerId,
      club_id: player.club_id,
      match_id: matchId,
      sanction_type: 'yellow_card_accumulation',
      description: `Suspensión automática por acumulación de 5 tarjetas amarillas en la fase activa (Art. 91).`,
      amount_usd: amount * 5, // Total cumulative fee
      suspended_matches: 1,
      phase_id: phaseId,
      status: 'active',
      created_at: new Date().toISOString()
    };

    sanctions.push(newSanction);
    saveSanctions(sanctions);

    // Update player status
    updatePlayerStatus(playerId, 'suspended');
    createNotificationForClub(player.club_id, 'Jugador Suspendido', `${player.first_name} ${player.last_name} ha alcanzado las 5 tarjetas amarillas y está suspendido para el próximo partido.`, matchId);
  }
};

const createRedCardSuspension = (playerId: string, clubId: string, matchId: string, phaseId: string) => {
  const player = getPlayers().find(p => p.id === playerId);
  if (!player) return;

  const sanctions = getSanctions();
  const club = getClubs().find(c => c.id === clubId);
  const fine = club?.series_id === 'series-b' ? 50 : 100; // RN-22: red card fine

  const newSanction: DisciplinarySanction = {
    id: generateId(),
    player_id: playerId,
    club_id: clubId,
    match_id: matchId,
    sanction_type: 'red_card_suspension',
    description: `Suspensión por expulsión directa (tarjeta roja). Se aplica sanción disciplinaria reglamentaria de 2 partidos de suspensión.`,
    amount_usd: fine,
    suspended_matches: 2,
    phase_id: phaseId,
    status: 'active',
    created_at: new Date().toISOString()
  };

  sanctions.push(newSanction);
  saveSanctions(sanctions);

  updatePlayerStatus(playerId, 'suspended');
  createNotificationForClub(clubId, 'Expulsión y Sanción', `${player.first_name} ${player.last_name} recibió tarjeta roja directa. Suspendido temporalmente.`, matchId);
};

const updatePlayerStatus = (playerId: string, status: Player['status']) => {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === playerId);
  if (idx !== -1) {
    players[idx].status = status;
    savePlayers(players);
  }
};

// Trigger notification helper
export const createNotificationForClub = (clubId: string, title: string, body: string, matchId?: string) => {
  const profiles = getProfiles();
  const notifications = getNotifications();

  // Find all hinchas who follow this club
  const usersToNotify = profiles.filter(p => p.favorite_club_id === clubId);

  usersToNotify.forEach(user => {
    notifications.push({
      id: generateId(),
      user_id: user.id,
      title,
      body,
      related_match_id: matchId,
      created_at: new Date().toISOString()
    });
  });

  saveNotifications(notifications);
};
