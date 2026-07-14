-- =====================================================================
-- LIGAPRO MANAGER DATABASE SCHEMA
-- Target Database: Supabase / PostgreSQL (15+)
-- Author: Antigravity AI
-- Date: July 2026
-- =====================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. TABLES DEFINITIONS
-- ---------------------------------------------------------------------

-- Series (Divisions)
create table series (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('Serie A', 'Serie B')),
  slug text not null unique check (slug in ('serie-a', 'serie-b')),
  num_clubs integer not null,
  season_year integer not null default 2026,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Phases of the championship
create table phases (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete cascade,
  name text not null,
  phase_order integer not null,
  resets_points boolean not null default false,
  resets_yellow_cards boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stadiums
create table stadiums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  altitude_m integer not null default 0,
  capacity integer not null,
  turf_type text not null check (turf_type in ('natural', 'artificial')),
  turf_height_mm numeric check (turf_height_mm between 20 and 25),
  quality_pro_certified boolean not null default false,
  quality_pro_expiry date,
  var_infrastructure_ok boolean not null default false,
  is_qualified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clubs
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  crest_url text,
  primary_color text not null,
  secondary_color text not null,
  alt_kit_colors jsonb default '[]'::jsonb,
  series_id uuid references series(id) on delete restrict,
  is_filial boolean not null default false,
  is_enabled boolean not null default true,
  home_stadium_id uuid references stadiums(id) on delete restrict,
  founded_year integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Players Registry
create table players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  nickname text,
  jersey_number integer not null check (jersey_number between 1 and 99),
  position text not null check (position in ('portero', 'defensa', 'mediocampista', 'delantero')),
  photo_url text,
  birth_date date not null,
  is_captain boolean not null default false,
  status text not null default 'active' check (status in ('active', 'suspended', 'injured', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_jersey_per_club unique (club_id, jersey_number)
);

-- Staff Members
create table staff_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  full_name text not null,
  role text not null,
  is_enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Officials (Referees, Commissioners, etc.)
create table officials (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  official_type text not null check (official_type in (
    'arbitro', 'comisario_juego', 'delegado_seguridad', 
    'oficial_patrocinio', 'oficial_var', 'medico_control_dopaje', 
    'coordinador_partido'
  )),
  is_foreign boolean not null default false,
  credential_status text not null default 'active' check (credential_status in ('active', 'revoked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Matches (Fixture and details)
create table matches (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete restrict,
  phase_id uuid references phases(id) on delete restrict,
  matchday integer not null check (matchday > 0),
  home_club_id uuid references clubs(id) on delete restrict,
  away_club_id uuid references clubs(id) on delete restrict,
  stadium_id uuid references stadiums(id) on delete restrict,
  scheduled_at timestamptz not null,
  notified_at timestamptz,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'live', 'finished', 'postponed', 'suspended', 'rescheduled', 'walkover'
  )),
  unified_kickoff boolean not null default false,
  home_score integer,
  away_score integer,
  home_score_penalties integer,
  away_score_penalties integer,
  referee_id uuid references officials(id) on delete set null,
  var_official_id uuid references officials(id) on delete set null,
  match_commissioner_id uuid references officials(id) on delete set null,
  security_delegate_id uuid references officials(id) on delete set null,
  sponsorship_official_id uuid references officials(id) on delete set null,
  weather_condition text,
  suspension_reason text,
  rescheduled_from_match_id uuid references matches(id) on delete set null,
  doping_control_officer_id uuid references officials(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint check_different_teams check (home_club_id <> away_club_id)
);

-- Match Events (Goals, Cards, Substitutions)
create table match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  club_id uuid references clubs(id) on delete cascade,
  event_type text not null check (event_type in (
    'goal', 'own_goal', 'yellow_card', 'red_card', 
    'substitution_in', 'substitution_out', 'penalty_scored', 'penalty_missed'
  )),
  minute integer not null check (minute between 0 and 125),
  extra_info jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Standings Table Materialization
create table standings (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete cascade,
  phase_id uuid references phases(id) on delete cascade,
  club_id uuid references clubs(id) on delete cascade,
  played integer not null default 0,
  won integer not null default 0,
  drawn integer not null default 0,
  lost integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  goal_difference integer not null default 0,
  points integer not null default 0,
  position integer not null default 1,
  tiebreak_applied text,
  zone text not null default 'none' check (zone in (
    'qualification_final_phase', 'libertadores', 'sudamericana', 'relegation', 'none'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_club_per_phase unique (phase_id, club_id)
);

-- Disciplinary Sanctions
create table disciplinary_sanctions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete set null,
  club_id uuid references clubs(id) on delete cascade,
  match_id uuid references matches(id) on delete set null,
  sanction_type text not null check (sanction_type in (
    'yellow_card_accumulation', 'red_card_suspension', 'fine', 'disqualification', 'stadium_ban'
  )),
  description text not null,
  amount_usd numeric(10, 2),
  suspended_matches integer,
  phase_id uuid references phases(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'served', 'appealed', 'overturned')),
  created_by uuid, -- references auth.users
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Yellow Card Tracker Aux Table
create table yellow_card_tracker (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  phase_id uuid references phases(id) on delete cascade,
  accumulated_cards integer not null default 0,
  updated_at timestamptz default now(),
  constraint unique_player_per_phase unique (player_id, phase_id)
);

-- User Profiles
create table user_profiles (
  id uuid primary key, -- References auth.users(id)
  display_name text not null,
  role text not null default 'hincha' check (role in (
    'hincha', 'admin', 'maintenance_chief', 'technician', 'manager'
  )),
  favorite_club_id uuid references clubs(id) on delete set null,
  notification_preferences jsonb default '{"match_reminders": true, "results": true, "sanctions": false}'::jsonb,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  related_match_id uuid references matches(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Audit Log
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- references auth.users
  action text not null,
  table_name text not null,
  record_id uuid not null,
  diff jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 2. INDEXES FOR PERFORMANCE Optimization
-- ---------------------------------------------------------------------
create index idx_matches_lookup on matches(series_id, phase_id, matchday);
create index idx_matches_scheduled on matches(scheduled_at);
create index idx_events_lookup on match_events(match_id, player_id);
create index idx_standings_ranking on standings(phase_id, points desc, goal_difference desc, goals_for desc);
create index idx_sanctions_lookup on disciplinary_sanctions(club_id, status);

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
alter table series enable row level security;
alter table phases enable row level security;
alter table stadiums enable row level security;
alter table clubs enable row level security;
alter table players enable row level security;
alter table staff_members enable row level security;
alter table officials enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table standings enable row level security;
alter table disciplinary_sanctions enable row level security;
alter table yellow_card_tracker enable row level security;
alter table user_profiles enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;

-- Policies for public reading tables
create policy "Public read access for series" on series for select using (true);
create policy "Public read access for phases" on phases for select using (true);
create policy "Public read access for stadiums" on stadiums for select using (true);
create policy "Public read access for clubs" on clubs for select using (true);
create policy "Public read access for players" on players for select using (true);
create policy "Public read access for staff" on staff_members for select using (true);
create policy "Public read access for matches" on matches for select using (true);
create policy "Public read access for match_events" on match_events for select using (true);
create policy "Public read access for standings" on standings for select using (true);

-- Policy to restrict sensitive officials data to fans
create policy "Admin read access for officials" on officials for select
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief', 'technician', 'manager') );

-- Policies to allow admins to write/manipulate tables
create policy "Admins full access on series" on series for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on phases" on phases for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on stadiums" on stadiums for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on clubs" on clubs for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on players" on players for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on staff" on staff_members for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full access on officials" on officials for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

-- Operational updates on matches and events for technicians
create policy "Admin and Ops full write on matches" on matches for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief', 'technician', 'manager') );

create policy "Admin and Ops full write on match_events" on match_events for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief', 'technician', 'manager') );

-- Policies for sanctions
create policy "Public read for non-sensitive sanctions" on disciplinary_sanctions for select
  using ( status = 'active' or (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

create policy "Admins full write on sanctions" on disciplinary_sanctions for all
  using ( (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief') );

-- ---------------------------------------------------------------------
-- 4. BUSINESS TRIGGERS & FUNCTIONS
-- ---------------------------------------------------------------------

-- Trigger to increment yellow cards and create automatic suspension at 5 cards (RN-20)
create or replace function handle_yellow_card_accumulation()
returns trigger as $$
declare
  current_phase_id uuid;
  active_cards integer;
  club_series_id uuid;
  fee numeric;
begin
  -- Get match phase
  select phase_id, series_id into current_phase_id, club_series_id from matches where id = new.match_id;
  
  -- Select fee based on series division (RN-22)
  select case when slug = 'serie-b' then 10.0 else 20.0 end into fee 
  from series where id = club_series_id;

  -- Upsert card tracking
  insert into yellow_card_tracker (player_id, phase_id, accumulated_cards)
  values (new.player_id, current_phase_id, 1)
  on conflict (player_id, phase_id)
  do update set accumulated_cards = yellow_card_tracker.accumulated_cards + 1, updated_at = now()
  returning accumulated_cards into active_cards;

  -- Suspend player on reaching 5 cards (RN-20)
  if active_cards > 0 and active_cards % 5 = 0 then
    insert into disciplinary_sanctions (player_id, club_id, match_id, sanction_type, description, amount_usd, suspended_matches, phase_id, status)
    values (
      new.player_id, 
      new.club_id, 
      new.match_id, 
      'yellow_card_accumulation', 
      'Suspensión automática por acumulación reglamentaria de 5 tarjetas amarillas.', 
      fee * 5, 
      1, 
      current_phase_id, 
      'active'
    );
    
    -- Update player status to suspended
    update players set status = 'suspended' where id = new.player_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger tr_yellow_card_accumulation
after insert on match_events
for each row
when (new.event_type = 'yellow_card')
execute function handle_yellow_card_accumulation();
