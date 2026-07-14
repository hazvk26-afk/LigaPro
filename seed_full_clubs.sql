
-- =====================================================================
-- COMPLETE LIGAPRO CLUBS SEED
-- =====================================================================

-- First clean current incomplete clubs and matches if any
DELETE FROM matches;
DELETE FROM clubs;
DELETE FROM stadiums;
DELETE FROM phases;
DELETE FROM series;

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
('550e8400-e29b-41d4-a716-446655440006', 'Estadio Monumental Banco Pichincha', 'Guayaquil', 4, 59283, 'natural', true, true);

INSERT INTO stadiums (id, name, city, altitude_m, capacity, turf_type, var_infrastructure_ok, is_qualified) VALUES
('550e8400-e29b-41d4-a716-446655440007', 'Estadio Rodrigo Paz Delgado', 'Quito', 2726, 41575, 'natural', true, true);

INSERT INTO stadiums (id, name, city, altitude_m, capacity, turf_type, var_infrastructure_ok, is_qualified) VALUES
('550e8400-e29b-41d4-a716-446655440008', 'Estadio George Capwell', 'Guayaquil', 4, 40000, 'natural', true, true);

INSERT INTO stadiums (id, name, city, altitude_m, capacity, turf_type, var_infrastructure_ok, is_qualified) VALUES
('550e8400-e29b-41d4-a716-446655440009', 'Estadio Christian Benítez Betancourt', 'Guayaquil', 5, 10150, 'artificial', true, true);

INSERT INTO stadiums (id, name, city, altitude_m, capacity, turf_type, var_infrastructure_ok, is_qualified) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Estadio Olímpico Atahualpa', 'Quito', 2783, 35258, 'natural', true, true);


-- Set certification for Christian Benítez
UPDATE stadiums SET quality_pro_certified = true, quality_pro_expiry = '2027-12-31', turf_height_mm = 22.0
WHERE id = '550e8400-e29b-41d4-a716-446655440009';

-- 4. Insert All 16 Clubs
INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Barcelona Sporting Club', 'Barcelona SC', 'https://placehold.co/100x100/ffffff/000000?text=Barcelona%20SC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Liga Deportiva Universitaria', 'LDU Quito', 'https://placehold.co/100x100/ffffff/000000?text=LDU%20Quito', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440013', 'Club Sport Emelec', 'Emelec', 'https://placehold.co/100x100/ffffff/000000?text=Emelec', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440014', 'Independiente del Valle', 'Ind. del Valle', 'https://placehold.co/100x100/ffffff/000000?text=Ind.%20del%20Valle', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440015', 'Club Deportivo El Nacional', 'El Nacional', 'https://placehold.co/100x100/ffffff/000000?text=El%20Nacional', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440016', 'Delfín Sporting Club', 'Delfín SC', 'https://placehold.co/100x100/ffffff/000000?text=Delf%C3%ADn%20SC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'Club Deportivo Universidad Católica', 'U. Católica', 'https://placehold.co/100x100/ffffff/000000?text=U.%20Cat%C3%B3lica', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'Sociedad Deportiva Aucas', 'Aucas', 'https://placehold.co/100x100/ffffff/000000?text=Aucas', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440019', 'Mushuc Runa Sporting Club', 'Mushuc Runa', 'https://placehold.co/100x100/ffffff/000000?text=Mushuc%20Runa', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Club Social y Deportivo Macará', 'Macará', 'https://placehold.co/100x100/ffffff/000000?text=Macar%C3%A1', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Club Técnico Universitario', 'Técnico Univ.', 'https://placehold.co/100x100/ffffff/000000?text=T%C3%A9cnico%20Univ.', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440022', 'Orense Sporting Club', 'Orense SC', 'https://placehold.co/100x100/ffffff/000000?text=Orense%20SC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440023', 'Cumbayá Fútbol Club', 'Cumbayá FC', 'https://placehold.co/100x100/ffffff/000000?text=Cumbay%C3%A1%20FC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440024', 'Libertad Fútbol Club', 'Libertad FC', 'https://placehold.co/100x100/ffffff/000000?text=Libertad%20FC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440025', 'Club Deportivo Cuenca', 'Dep. Cuenca', 'https://placehold.co/100x100/ffffff/000000?text=Dep.%20Cuenca', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);

INSERT INTO clubs (id, name, short_name, crest_url, primary_color, secondary_color, series_id, home_stadium_id, is_filial) VALUES
('550e8400-e29b-41d4-a716-446655440026', 'Imbabura Sporting Club', 'Imbabura SC', 'https://placehold.co/100x100/ffffff/000000?text=Imbabura%20SC', '#ffffff', '#000000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010', false);


-- 5. Insert Sample Officials
INSERT INTO officials (id, full_name, official_type, is_foreign) VALUES
('550e8400-e29b-41d4-a716-446655440019', 'Augusto Aragón', 'arbitro', false),
('550e8400-e29b-41d4-a716-446655440020', 'Jefferson Macías', 'oficial_var', false),
('550e8400-e29b-41d4-a716-446655440021', 'Pedro Romero', 'comisario_juego', false);
