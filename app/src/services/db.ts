import { supabase } from './supabase';
import { Series, Phase, Club, Stadium, Player, Official, Match, MatchEvent, Standing, DisciplinarySanction, UserProfile, Notification } from '../types';

// Session state (kept local for simulated auth)
const KEYS = {
  CURRENT_USER: 'lpm_current_user'
};

export const getCurrentUser = (): UserProfile | null => {
  const val = localStorage.getItem(KEYS.CURRENT_USER);
  return val ? JSON.parse(val) : null;
};

export const setCurrentUser = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// --- ID TRANSLATION MAPS BETWEEN FRONTEND SLUGS AND DB UUIDs ---
const SERIES_MAP_TO_DB: Record<string, string> = {
  'series-a': '550e8400-e29b-41d4-a716-446655440000',
  'series-b': '550e8400-e29b-41d4-a716-446655440001'
};
const SERIES_MAP_FROM_DB: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440000': 'series-a',
  '550e8400-e29b-41d4-a716-446655440001': 'series-b'
};

const PHASE_MAP_TO_DB: Record<string, string> = {
  'phase-a-1': '550e8400-e29b-41d4-a716-446655440002',
  'phase-a-2': '550e8400-e29b-41d4-a716-446655440003',
  'phase-a-final': '550e8400-e29b-41d4-a716-446655440004',
  'phase-b-1': '550e8400-e29b-41d4-a716-446655440005'
};
const PHASE_MAP_FROM_DB: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440002': 'phase-a-1',
  '550e8400-e29b-41d4-a716-446655440003': 'phase-a-2',
  '550e8400-e29b-41d4-a716-446655440004': 'phase-a-final',
  '550e8400-e29b-41d4-a716-446655440005': 'phase-b-1'
};

// --- SUPABASE ASYNC QUERIES ---

export const getSeries = async (): Promise<Series[]> => {
  const { data } = await supabase.from('series').select('*');
  return (data || []).map(s => ({
    ...s,
    id: SERIES_MAP_FROM_DB[s.id] || s.id
  })) as Series[];
};

export const getPhases = async (): Promise<Phase[]> => {
  const { data } = await supabase.from('phases').select('*');
  return (data || []).map(p => ({
    ...p,
    id: PHASE_MAP_FROM_DB[p.id] || p.id,
    series_id: SERIES_MAP_FROM_DB[p.series_id] || p.series_id
  })) as Phase[];
};

export const getClubs = async (): Promise<Club[]> => {
  const { data } = await supabase.from('clubs').select('*');
  return (data || []).map(c => ({
    ...c,
    series_id: SERIES_MAP_FROM_DB[c.series_id] || c.series_id
  })) as Club[];
};

export const getStadiums = async (): Promise<Stadium[]> => {
  const { data } = await supabase.from('stadiums').select('*');
  return (data || []) as Stadium[];
};

export const getPlayers = async (): Promise<Player[]> => {
  const { data } = await supabase.from('players').select('*');
  return (data || []) as Player[];
};

export const getOfficials = async (): Promise<Official[]> => {
  const { data } = await supabase.from('officials').select('*');
  return (data || []) as Official[];
};

export const getMatches = async (): Promise<Match[]> => {
  const { data } = await supabase.from('matches').select('*');
  return (data || []).map(m => ({
    ...m,
    series_id: SERIES_MAP_FROM_DB[m.series_id] || m.series_id,
    phase_id: PHASE_MAP_FROM_DB[m.phase_id] || m.phase_id
  })) as Match[];
};

export const getSanctions = async (): Promise<DisciplinarySanction[]> => {
  const { data } = await supabase.from('disciplinary_sanctions').select('*');
  return (data || []).map(s => ({
    ...s,
    phase_id: s.phase_id ? (PHASE_MAP_FROM_DB[s.phase_id] || s.phase_id) : null
  })) as DisciplinarySanction[];
};

export const getProfiles = async (): Promise<UserProfile[]> => {
  const { data } = await supabase.from('user_profiles').select('*');
  return (data || []) as UserProfile[];
};

export const getEvents = async (): Promise<MatchEvent[]> => {
  const { data } = await supabase.from('match_events').select('*');
  return (data || []) as MatchEvent[];
};

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await supabase.from('notifications').select('*');
  return (data || []) as Notification[];
};

// --- MUTATIONS ---

export const upsertMatch = async (match: Match) => {
  const dbMatch = {
    ...match,
    series_id: SERIES_MAP_TO_DB[match.series_id] || match.series_id,
    phase_id: PHASE_MAP_TO_DB[match.phase_id] || match.phase_id
  };
  return await supabase.from('matches').upsert(dbMatch);
};

export const insertSanction = async (sanction: DisciplinarySanction) => {
  const dbSanct = {
    id: sanction.id,
    player_id: sanction.player_id || null,
    club_id: sanction.club_id,
    match_id: sanction.match_id || null,
    sanction_type: sanction.sanction_type,
    description: sanction.description,
    amount_usd: sanction.amount_usd,
    suspended_matches: sanction.suspended_matches,
    phase_id: sanction.phase_id ? (PHASE_MAP_TO_DB[sanction.phase_id] || sanction.phase_id) : null,
    status: sanction.status
  };
  return await supabase.from('disciplinary_sanctions').insert(dbSanct);
};

export const insertMatchEvent = async (event: MatchEvent) => {
  return await supabase.from('match_events').insert(event);
};

export const insertClub = async (club: Club) => {
  const dbClub = {
    ...club,
    series_id: SERIES_MAP_TO_DB[club.series_id] || club.series_id
  };
  return await supabase.from('clubs').insert(dbClub);
};

export const clearMatchesByPhase = async (seriesId: string, phaseId: string) => {
  const dbSeriesId = SERIES_MAP_TO_DB[seriesId] || seriesId;
  const dbPhaseId = PHASE_MAP_TO_DB[phaseId] || phaseId;
  return await supabase
    .from('matches')
    .delete()
    .eq('series_id', dbSeriesId)
    .eq('phase_id', dbPhaseId);
};


// --- BUSINESS LOGIC ENGINE ---

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

  if (stadium) {
    if (!stadium.is_qualified) {
      errors.push(`El estadio ${stadium.name} no está calificado por la Dirección de Escenarios.`);
    }
    if (series?.slug === 'serie-a' && phase?.name === 'Fase Dos' && !stadium.var_infrastructure_ok) {
      errors.push(`El estadio ${stadium.name} no cuenta con la infraestructura VAR calificada, la cual es obligatoria para la Fase Dos.`);
    }
    if (stadium.turf_type === 'artificial') {
      if (!stadium.quality_pro_certified) {
        errors.push(`El estadio ${stadium.name} posee césped artificial pero no cuenta con certificación FIFA Quality Pro.`);
      } else if (stadium.quality_pro_expiry && new Date(stadium.quality_pro_expiry) < matchDate) {
        errors.push(`La certificación FIFA Quality Pro del estadio ${stadium.name} expira el ${stadium.quality_pro_expiry}, que es antes del partido.`);
      }
    }
  }

  if (matchData.notified_at) {
    const notifyDate = new Date(matchData.notified_at);
    const diffDays = Math.ceil((matchDate.getTime() - notifyDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 15) {
      warnings.push(`Notificación realizada con ${diffDays} días de anticipación (El reglamento exige mínimo 15 días, Art. 25).`);
    }
  } else {
    const today = new Date();
    const diffDays = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 15) {
      warnings.push(`El partido se está programando a menos de 15 días a partir de hoy (quedan ${diffDays} días).`);
    }
  }

  if (series?.slug === 'serie-a' && FIFA_DATES.includes(matchDateStr)) {
    errors.push('No se pueden programar partidos de Serie A en fechas FIFA.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

export const calculateStandings = async (
  seriesId: 'series-a' | 'series-b',
  phaseId: string
): Promise<Standing[]> => {
  const clubs = (await getClubs()).filter(c => c.series_id === seriesId && c.is_enabled);
  const matches = (await getMatches()).filter(m => m.series_id === seriesId);

  let filteredMatches: Match[] = [];
  if (phaseId === 'acumulada') {
    filteredMatches = matches.filter(m => m.phase_id !== 'phase-a-final' && (m.status === 'finished' || m.status === 'walkover'));
  } else {
    filteredMatches = matches.filter(m => m.phase_id === phaseId && (m.status === 'finished' || m.status === 'walkover'));
  }

  const statsMap: Record<string, Omit<Standing, 'position' | 'tiebreak_applied'>> = {};
  clubs.forEach(club => {
    statsMap[club.id] = {
      id: Math.random().toString(36).substring(2, 11),
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

  filteredMatches.forEach(match => {
    const home = statsMap[match.home_club_id];
    const away = statsMap[match.away_club_id];
    
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

  const standingsList = Object.values(statsMap);

  // Sorting
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;

    if (phaseId === 'acumulada') {
      const aAwayGoals = calculateAwayGoals(a.club_id, filteredMatches);
      const bAwayGoals = calculateAwayGoals(b.club_id, filteredMatches);
      if (bAwayGoals !== aAwayGoals) return bAwayGoals - aAwayGoals;
    }

    const h2h = getHeadToHeadPerformance(a.club_id, b.club_id, filteredMatches);
    if (h2h !== 0) return h2h;

    return a.club_id.localeCompare(b.club_id);
  });

  const standingsWithRank: Standing[] = standingsList.map((standing, index) => {
    const pos = index + 1;
    let zone: Standing['zone'] = 'none';

    if (seriesId === 'series-a') {
      if (phaseId === 'phase-a-1' || phaseId === 'phase-a-2') {
        if (pos === 1) zone = 'qualification_final_phase';
      } else if (phaseId === 'acumulada') {
        if (pos <= 4) zone = 'libertadores';
        else if (pos > 4 && pos <= 8) zone = 'sudamericana';
        else if (pos >= 15) zone = 'relegation';
      }
    } else if (seriesId === 'series-b') {
      const club = clubs.find(c => c.id === standing.club_id);
      const nonFilialRank = standingsList
        .filter(s => {
          const c = clubs.find(cl => cl.id === s.club_id);
          return c && !c.is_filial;
        })
        .findIndex(s => s.club_id === standing.club_id);

      if (club && !club.is_filial && nonFilialRank >= 0 && nonFilialRank < 2) {
        zone = 'qualification_final_phase';
      } else if (pos >= 9) {
        zone = 'relegation';
      }
    }

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
    } as Standing;
  });

  return standingsWithRank;
};

const calculateAwayGoals = (clubId: string, matches: Match[]): number => {
  return matches
    .filter(m => m.away_club_id === clubId)
    .reduce((sum, m) => sum + (m.away_score ?? 0), 0);
};

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

  if (clubAPoints !== clubBPoints) return clubBPoints - clubAPoints;

  let clubAGD = 0;
  h2hMatches.forEach(m => {
    const isHomeA = m.home_club_id === clubAId;
    const scoreA = isHomeA ? (m.home_score ?? 0) : (m.away_score ?? 0);
    const scoreB = isHomeA ? (m.away_score ?? 0) : (m.home_score ?? 0);
    clubAGD += (scoreA - scoreB);
  });

  return -clubAGD;
};
