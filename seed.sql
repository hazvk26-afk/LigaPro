-- =====================================================================
-- LIGAPRO MANAGER INITIAL SEED DATA
-- Target Database: Supabase / PostgreSQL (15+)
-- Author: Antigravity AI
-- Date: July 2026
-- =====================================================================

-- 1. Insert Series
INSERT INTO series (id, name, slug, num_clubs, season_year) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Serie A', 'serie-a', 16, 2026),
('550e8400-e29b-41d4-a716-446655440001', 'Serie B', 'serie-b', 10, 2026);

-- 2. Insert Phases
INSERT INTO phases (id, series_id, name, phase_order, resets_points, resets_yellow_cards) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Fase Uno', 1, false, false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Fase Dos', 2, true, true),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Fase Final', 3, true, true),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Fase de Clasificación', 1, false, false);

-- 3. Insert Stadiums
INSERT INTO stadiums (id, name, city, altitude_m, capacity, turf_type, var_infrastructure_ok, is_qualified) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'Estadio Monumental Banco Pichincha', 'Guayaquil', 4, 59283, 'natural', true, true),
('550e8400-e29b-41d4-a716-446655440007', 'Estadio Rodrigo Paz Delgado', 'Quito', 2726, 41575, 'natural', true, true),
('550e8400-e29b-41d4-a716-446655440008', 'Estadio George Capwell', 'Guayaquil', 4, 40000, 'natural', true, true),
('550e8400-e29b-41d4-a716-446655440009', 'Estadio Christian Benítez Betancourt', 'Guayaquil', 5, 10150, 'artificial', true, true),
('550e8400-e29b-41d4-a716-446655440010', 'Estadio Olímpico Atahualpa', 'Quito', 2783, 35258, 'natural', true, true);

-- Update turf certifications for artificial turf
UPDATE stadiums SET quality_pro_certified = true, quality_pro_expiry = '2027-12-31', turf_height_mm = 22.0
WHERE id = '550e8400-e29b-41d4-a716-446655440009';

-- 4. Insert Clubs
INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Barcelona Sporting Club', 'Barcelona SC', 'https://placehold.co/100x100/ffe600/000000?text=BSC', '#ffe600', '#d60000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', false),
('550e8400-e29b-41d4-a716-446655440012', 'Liga Deportiva Universitaria', 'LDU Quito', 'https://placehold.co/100x100/ffffff/d60000?text=LDU', '#ffffff', '#d60000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007', false),
('550e8400-e29b-41d4-a716-446655440013', 'Club Sport Emelec', 'Emelec', 'https://placehold.co/100x100/004b93/ffffff?text=CSE', '#004b93', '#9ca3af', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', false),
('550e8400-e29b-41d4-a716-446655440014', 'Independiente del Valle', 'Ind. del Valle', 'https://placehold.co/100x100/000033/ff007f?text=IDV', '#000033', '#ff007f', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

-- 5. Insert Sample Players
INSERT INTO players (id, club_id, first_name, last_name, jersey_number, position, birth_date, is_captain) VALUES
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440012', 'Alexander', 'Domínguez', 22, 'portero', '1987-06-05', true),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', 'Ricardo', 'Adé', 4, 'defensa', '1990-05-21', false),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440012', 'Alex', 'Arce', 9, 'delantero', '1995-06-16', false),
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440011', 'Javier', 'Burrai', 1, 'portero', '1990-10-09', true);

-- 6. Insert Officials
INSERT INTO officials (id, full_name, official_type, is_foreign) VALUES
('550e8400-e29b-41d4-a716-446655440019', 'Augusto Aragón', 'arbitro', false),
('550e8400-e29b-41d4-a716-446655440020', 'Jefferson Macías', 'oficial_var', false),
('550e8400-e29b-41d4-a716-446655440021', 'Pedro Romero', 'comisario_juego', false);

-- 7. Insert Sample Match (Finished)
INSERT INTO matches (
  id, series_id, phase_id, matchday, home_club_id, away_club_id, 
  stadium_id, scheduled_at, notified_at, status, home_score, away_score,
  referee_id, var_official_id, match_commissioner_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440002',
  1,
  '550e8400-e29b-41d4-a716-446655440012', -- LDU
  '550e8400-e29b-41d4-a716-446655440011', -- BSC
  '550e8400-e29b-41d4-a716-446655440007', -- Rodrigo Paz
  '2026-07-04T18:00:00-05:00',
  '2026-06-18T12:00:00-05:00',
  'finished',
  2,
  1,
  '550e8400-e29b-41d4-a716-446655440019',
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440021'
);
