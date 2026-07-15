export interface Series {
  id: string;
  name: 'Serie A' | 'Serie B';
  slug: 'serie-a' | 'serie-b';
  num_clubs: number;
  season_year: number;
}

export interface Phase {
  id: string;
  series_id: string;
  name: string; // 'Fase Uno' | 'Fase Dos' | 'Fase Final' | 'Fase de Clasificación'
  phase_order: number;
  resets_points: boolean;
  resets_yellow_cards: boolean;
}

export interface Club {
  id: string;
  name: string;
  short_name: string;
  crest_url: string;
  primary_color: string;
  secondary_color: string;
  alt_kit_colors: string[];
  series_id: string;
  is_filial: boolean;
  is_enabled: boolean;
  home_stadium_id: string;
  founded_year: number;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  altitude_m: number;
  capacity: number;
  turf_type: 'natural' | 'artificial';
  turf_height_mm?: number;
  quality_pro_certified?: boolean;
  quality_pro_expiry?: string; // ISO date
  var_infrastructure_ok: boolean;
  is_qualified: boolean;
}

export interface Player {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  jersey_number: number;
  position: 'portero' | 'defensa' | 'mediocampista' | 'delantero';
  photo_url: string;
  birth_date: string; // ISO date
  is_captain: boolean;
  status: 'active' | 'suspended' | 'injured' | 'inactive';
}

export interface StaffMember {
  id: string;
  club_id: string;
  full_name: string;
  role: string;
  is_enabled: boolean;
}

export interface Official {
  id: string;
  full_name: string;
  official_type: 'arbitro' | 'comisario_juego' | 'delegado_seguridad' | 'oficial_patrocinio' | 'oficial_var' | 'medico_control_dopaje' | 'coordinador_partido';
  is_foreign: boolean;
  credential_status: 'active' | 'revoked';
}

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'suspended'
  | 'rescheduled'
  | 'walkover';

export interface Match {
  id: string;
  series_id: string;
  phase_id: string;
  matchday: number;
  home_club_id: string;
  away_club_id: string;
  stadium_id: string;
  scheduled_at: string; // ISO datetime
  notified_at?: string; // ISO datetime
  status: MatchStatus;
  unified_kickoff: boolean;
  home_score: number | null;
  away_score: number | null;
  home_score_penalties: number | null;
  away_score_penalties: number | null;
  referee_id?: string;
  var_official_id?: string;
  match_commissioner_id?: string;
  security_delegate_id?: string;
  sponsorship_official_id?: string;
  weather_condition?: string;
  suspension_reason?: string;
  rescheduled_from_match_id?: string;
  doping_control_officer_id?: string;
  created_at?: string;
}

export type MatchEventType =
  | 'goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution_in'
  | 'substitution_out'
  | 'penalty_scored'
  | 'penalty_missed';

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  club_id: string;
  event_type: MatchEventType;
  minute: number;
  extra_info?: {
    assist_player_id?: string;
    sub_out_player_id?: string;
    penalty?: boolean;
    reason?: string; // for card or substitution
  };
}

export interface Standing {
  id: string;
  series_id: string;
  phase_id: string; // Can represent Fase Uno, Fase Dos or special value 'acumulada'
  club_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number; // generated: GF - GC
  points: number;
  position: number;
  tiebreak_applied?: 'goal_difference' | 'goals_for' | 'head_to_head' | 'away_goals' | 'draw' | null;
  zone: 'qualification_final_phase' | 'libertadores' | 'sudamericana' | 'relegation' | 'none';
}

export interface DisciplinarySanction {
  id: string;
  player_id?: string | null;
  club_id: string;
  match_id?: string | null;
  sanction_type: 'yellow_card_accumulation' | 'red_card_suspension' | 'fine' | 'disqualification' | 'stadium_ban';
  description: string;
  amount_usd?: number | null;
  suspended_matches?: number | null;
  phase_id?: string | null;
  status: 'active' | 'served' | 'appealed' | 'overturned';
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  role: 'hincha' | 'admin' | 'maintenance_chief' | 'technician' | 'manager';
  favorite_club_id?: string | null;
  notification_preferences?: {
    match_reminders: boolean;
    results: boolean;
    sanctions: boolean;
  };
  avatar_url?: string;
  password?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  related_match_id?: string | null;
  read_at?: string | null;
  created_at: string;
}
