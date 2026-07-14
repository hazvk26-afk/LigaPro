# Especificación de Requisitos de Software (SRS)
# LigaPro Manager — Plataforma Web de Gestión y Seguimiento del Campeonato LIGAPRO

**Versión:** 1.0
**Fecha:** Julio 2026
**Basado en:** Reglamento de Competiciones LIGAPRO (v. Julio 2023) + Diseño UI generado en Google Stitch ("LigaPro Elite" design system)
**Stack objetivo:** React + TypeScript + Vite + TailwindCSS · Supabase (DB/Auth/Storage/Edge Functions) · Netlify (Hosting/CI-CD)
**Audiencia:** Codex (agente de construcción asistido por IA)

---

## Índice

1. Introducción
2. Descripción general del sistema
3. Perfiles de usuario y roles
4. Arquitectura técnica
5. Modelo de datos (Supabase/PostgreSQL)
6. Reglas de negocio derivadas del Reglamento LIGAPRO
7. Requisitos funcionales por módulo
8. Diseño de UI/UX (design system y pantallas)
9. Requisitos no funcionales
10. Seguridad y Row Level Security (RLS)
11. Integraciones y Edge Functions
12. Roadmap de construcción por fases
13. Criterios de aceptación
14. Anexos

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica de manera exhaustiva los requisitos funcionales, técnicos y de negocio para la construcción de **LigaPro Manager**, una aplicación web que digitaliza la gestión administrativa y la experiencia de hinchada del campeonato de fútbol profesional ecuatoriano (LIGAPRO), Serie A y Serie B, conforme al Reglamento de Competiciones vigente (v. Julio 2023).

El documento está redactado para ser consumido directamente por Codex como contexto de construcción, por lo que prioriza precisión técnica, nomenclatura consistente y trazabilidad entre reglas de negocio, modelo de datos y pantallas.

### 1.2 Alcance
El sistema cubre:
- Programación y gestión de partidos (fixture) para Serie A y Serie B, en sus respectivas fases.
- Cálculo automático de tablas de posiciones (Fase Uno, Fase Dos, Acumulada/Clasificatoria) con criterios de desempate reglamentarios.
- Registro de resultados, goleadores, tarjetas y sanciones disciplinarias.
- Gestión de oficiales de partido (árbitros, Comisario de Juego, Delegado de Seguridad, Oficial de Patrocinio, Oficial VAR).
- Gestión de clubes, plantillas de jugadores y estadios (incluyendo calificación VAR/infraestructura).
- Experiencia pública para hinchas: fixture, resultados, tablas, perfiles de club/jugador, seguimiento de equipo favorito.
- Panel administrativo para la Dirección de Competiciones: programación, carga de resultados, sanciones, alertas operativas.

Fuera de alcance en la v1.0: pagos/comercio electrónico, venta de entradas, transmisión de video en vivo (solo se referencia el estado del partido), integración contable con clubes.

### 1.3 Referencias
- Reglamento de Competiciones LIGAPRO, v. Julio 2023 (documento fuente de reglas de negocio).
- Diseño "LigaPro Elite" generado en Google Stitch (paleta, tipografía, componentes: Matchcards, League Tables, Chips, Dashboard Widgets).
- Pantallas ya prototipadas en Stitch: Acceso (Login), Home Hincha, Tabla de Posiciones, Dashboard Administrativo (mobile y desktop), Gestión de Sanciones (mobile y desktop), Programación de Partido, Detalle del Partido, Perfil Administrativo (desktop).

### 1.4 Definiciones y siglas
| Término | Definición |
|---|---|
| LIGAPRO | Liga Profesional de Fútbol del Ecuador |
| Serie A | Primera categoría, 16 clubes, 3 fases |
| Serie B | Primera categoría, 10 clubes, 1 fase de clasificación |
| Fase Uno / Fase Dos | Ruedas de ida y vuelta de Serie A, puntajes independientes |
| Tabla Acumulada / Clasificatoria | Suma de puntos de Fase Uno + Fase Dos, define ascenso/descenso |
| Fase Final | Serie de partidos ida/vuelta entre los ganadores de Fase Uno y Fase Dos |
| Comisario de Juego | Oficial de LIGAPRO con autoridad disciplinaria en el estadio |
| VAR / AVAR | Árbitro (Asistente) de Video |
| RLS | Row Level Security (Supabase/PostgreSQL) |
| SBU | Salario Básico Unificado (unidad de referencia para multas) |
| Hincha | Usuario público, rol de solo consumo/lectura |
| Administrativo | Usuario interno (Dirección de Competiciones), rol de gestión completa |

---

## 2. Descripción general del sistema

### 2.1 Perspectiva del producto
LigaPro Manager es una Single Page Application (SPA) responsive, con dos experiencias diferenciadas por rol dentro de la misma base de código:
- **Portal Hincha**: navegación superior/tab bar inferior en móvil, contenido de consumo (fixture, resultados, tablas, clubes, jugadores, favoritos).
- **Panel Administrativo**: sidebar fijo de 280px (desktop), enfocado en gestión operativa (programación, resultados, sanciones, clubes, estadios, oficiales, usuarios).

Ambos consumen la misma base de datos Supabase; la diferencia está en los permisos (RLS) y en el conjunto de pantallas/acciones expuestas.

### 2.2 Funciones principales
1. Autenticación y autorización por rol (Hincha anónimo/registrado, Administrativo autenticado).
2. Gestión de fixture: creación, edición, reprogramación de partidos con validaciones reglamentarias.
3. Motor de cálculo de tablas de posiciones (Fase Uno, Fase Dos, Acumulada) con criterios de desempate automatizados.
4. Registro de resultados y eventos de partido (goles, tarjetas, sustituciones, incidencias).
5. Motor de sanciones disciplinarias (acumulación de tarjetas amarillas, suspensiones automáticas al llegar a 5, multas por serie).
6. Gestión de clubes, plantillas, estadios (calificación de infraestructura y VAR).
7. Gestión de oficiales por partido y alertas de partidos sin oficiales asignados.
8. Experiencia de hincha: seguimiento de club favorito, notificaciones, perfiles de jugador/club.

### 2.3 Restricciones técnicas
- Frontend: Vite + React + TypeScript + TailwindCSS (compatible con el HTML/CSS ya generado en Stitch, a migrar a componentes React).
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime para marcador en vivo).
- Hosting/CI-CD: Netlify (build automático desde repositorio Git, variables de entorno para claves Supabase, Netlify Functions como capa proxy opcional).
- Todas las validaciones críticas de negocio (fechas mínimas de notificación, ventanas de 48h para partidos CONMEBOL/FIFA, cálculo de tablas y desempates) deben implementarse tanto en frontend (UX) como en backend (Postgres functions/triggers o Edge Functions) para garantizar integridad de datos.

---

## 3. Perfiles de usuario y roles

El sistema define **4 roles** a nivel de base de datos (para permitir expansión futura), pero la v1.0 de UI expone **2 perfiles de acceso**: `hincha` y `administrativo`. Los roles internos granulares permiten preparar el sistema para una futura separación de permisos sin rediseñar el modelo.

| Rol (DB) | Perfil de UI | Descripción | Permisos clave |
|---|---|---|---|
| `hincha` | Hincha | Usuario público, registrado o anónimo | Lectura de fixture, resultados, tablas, clubes, jugadores. Gestión de su propio perfil (favoritos, notificaciones). |
| `admin` | Administrativo | Dirección de Competiciones (control total) | CRUD completo sobre partidos, resultados, sanciones, clubes, estadios, oficiales, usuarios. |
| `maintenance_chief` | Administrativo (jefe) | Rol jerárquico superior dentro del panel admin | Igual que `admin` + gestión de usuarios administrativos y configuración global. |
| `technician` / `manager` | Administrativo (operativo) | Roles operativos de apoyo (data entry, supervisión) | CRUD limitado (p.ej. sólo carga de resultados y eventos, sin poder modificar sanciones o usuarios). |

> Nota de implementación: aunque el documento de referencia interno menciona un modelo de cuatro roles (`admin`, `maintenance_chief`, `technician`, `manager`) con RLS por rol, para LigaPro Manager estos se mapean así: `admin` y `maintenance_chief` tienen control total; `technician` y `manager` tienen permisos operativos acotados (ver sección 10). El perfil público-facing sigue siendo binario: **Hincha** vs **Administrativo**.

### 3.1 Perfil Hincha — Historias de usuario
- Como hincha, quiero ver el fixture completo filtrado por fecha, fase y serie, para planificar qué partidos seguir.
- Como hincha, quiero ver la tabla de posiciones diferenciada por Fase Uno, Fase Dos y Acumulada, con zonas de color (clasificación a Fase Final, descenso), para entender la situación de mi equipo.
- Como hincha, quiero ver el detalle de un partido (marcador, alineaciones, tarjetas, árbitros, estadio) para informarme en profundidad.
- Como hincha, quiero marcar un club como favorito y recibir alertas de sus próximos partidos.
- Como hincha, quiero ver el perfil de un club (plantilla, próximos partidos, historial, colores de uniforme).
- Como hincha, quiero ver las tarjetas acumuladas y suspensiones vigentes de los jugadores.

### 3.2 Perfil Administrativo — Historias de usuario
- Como administrativo, quiero programar un partido seleccionando serie, fase, jornada, clubes, fecha/hora y estadio, con validaciones automáticas del Reglamento (anticipación mínima de 15 días, bloqueo en fechas FIFA para Serie A, estadio calificado), para evitar errores operativos.
- Como administrativo, quiero asignar árbitro central, Comisario de Juego, Delegado de Seguridad, Oficial de Patrocinio y, si aplica, Oficial VAR, a cada partido.
- Como administrativo, quiero cargar el resultado de un partido (marcador, goleadores, tarjetas, incidencias) y que el sistema recalcule automáticamente las tablas de posiciones.
- Como administrativo, quiero ver un dashboard con alertas de partidos sin oficiales asignados, estadios no calificados o conflictos de fecha, para actuar preventivamente.
- Como administrativo, quiero gestionar las sanciones disciplinarias (tarjetas acumuladas, suspensiones, multas) por club y por serie.
- Como administrativo, quiero gestionar clubes y estadios, incluyendo el estado de calificación de infraestructura VAR.
- Como administrativo (jefe), quiero gestionar usuarios administrativos y sus permisos.

---

## 4. Arquitectura técnica

### 4.1 Diagrama de componentes (descripción textual)

```
┌─────────────────────────────────────────────────────────────┐
│                        NETLIFY (Hosting)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React + Vite SPA (build estático)                     │  │
│  │  - Portal Hincha (rutas públicas)                       │  │
│  │  - Panel Administrativo (rutas protegidas)              │  │
│  │  - Netlify Functions (proxy ligero, webhooks opcional)  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────┘
                            │ HTTPS (Supabase JS Client)
┌───────────────────────────▼───────────────────────────────┐
│                         SUPABASE                            │
│  - Auth (email/password, magic link, roles vía JWT claims)  │
│  - PostgreSQL (tablas + RLS + funciones + triggers)          │
│  - Edge Functions (cálculo de tablas, validaciones complejas)│
│  - Storage (escudos de clubes, fotos de jugadores, banners)  │
│  - Realtime (marcador en vivo, notificaciones)               │
└───────────────────────────────────────────────────────────┘
```

### 4.2 Frontend
- **Framework:** React 18 + TypeScript + Vite.
- **Estilos:** TailwindCSS configurado con los tokens del design system "LigaPro Elite" (ver sección 8).
- **Ruteo:** React Router, con layouts separados: `PublicLayout` (Hincha) y `AdminLayout` (sidebar fijo).
- **Estado remoto:** TanStack Query (React Query) para cache de datos Supabase.
- **Formularios:** React Hook Form + Zod para validación de esquemas (espejo de las validaciones de base de datos).
- **Componentes clave a construir** (mapeados 1:1 a los mockups Stitch ya generados):
  - `MatchCard` (tarjeta de partido, con variantes: programado, en vivo, finalizado, suspendido, reprogramado).
  - `LeagueTable` (tabla de posiciones con zebra-striping y barra de zona de color).
  - `MatchSchedulerForm` (formulario de programación de partido).
  - `SanctionsPanel` (gestión de sanciones, vista mobile y desktop).
  - `AdminDashboard` (widgets de alertas y resumen de jornada).
  - `MatchDetail` (marcador, alineaciones 4-4-2, cuerpo arbitral, estadio).
  - `LoginScreen` (acceso unificado con selector implícito de rol vía credenciales).

### 4.3 Backend (Supabase)
- **Auth:** Supabase Auth con JWT. El claim `role` (custom claim vía Postgres function `auth.jwt()`) determina el perfil (`hincha`, `admin`, `maintenance_chief`, `technician`, `manager`).
- **Base de datos:** PostgreSQL con esquema normalizado (sección 5).
- **Triggers PL/pgSQL:**
  - Recalcular tabla de posiciones al insertar/actualizar un resultado de partido.
  - Acumular tarjetas amarillas por jugador y generar suspensión automática al llegar a 5 (consecutivas o alternas dentro de la fase vigente).
  - Reset de tarjetas amarillas al cambiar de fase (Fase Uno → Fase Dos → Fase Final).
  - Validar reglas de programación (anticipación de 15 días, bloqueo de fechas FIFA para Serie A) antes de insertar/actualizar un partido.
- **Edge Functions** (lógica que excede lo práctico en SQL puro):
  - `calculate-standings`: recalcula tablas Fase Uno/Fase Dos/Acumulada aplicando los 4-5 criterios de desempate en cascada.
  - `validate-match-schedule`: valida ventanas CONMEBOL/FIFA (48h) y disponibilidad de estadio calificado.
  - `send-match-notifications`: notifica a hinchas con club favorito sobre nuevos partidos/resultados.

### 4.4 Netlify (Hosting/CI-CD)
- Build command: `npm run build`; publish directory: `dist`.
- Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (públicas, seguras por RLS), gestionadas en Netlify UI (no hardcodeadas).
- Despliegue continuo desde rama `main` (producción) y previews automáticos por Pull Request.
- Redirects SPA: archivo `_redirects` con `/* /index.html 200` para soportar rutas de React Router.
- Netlify Functions (opcional, Node.js) únicamente para tareas que requieran clave `service_role` de Supabase fuera del navegador (p. ej. tareas administrativas batch), nunca para lógica de negocio central (esa vive en Supabase).

---

## 5. Modelo de datos (Supabase/PostgreSQL)

> Convención: nombres de tabla en snake_case, plural. Todas las tablas incluyen `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` salvo que se indique lo contrario.

### 5.1 `series`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | `Serie A` / `Serie B` |
| slug | text unique | `serie-a` / `serie-b` |
| num_clubs | int | 16 / 10 |
| season_year | int | temporada activa |

### 5.2 `phases`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| series_id | uuid FK → series | |
| name | text | `Fase Uno`, `Fase Dos`, `Fase Final`, `Fase de Clasificación` |
| phase_order | int | orden secuencial |
| resets_points | boolean | true para Fase Dos (reinicia puntajes) |
| resets_yellow_cards | boolean | true al iniciar cada fase |

### 5.3 `clubs`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| short_name | text | |
| crest_url | text | Supabase Storage |
| primary_color | text (hex) | |
| secondary_color | text (hex) | |
| alt_kit_colors | jsonb | array de colores alternos |
| series_id | uuid FK → series | serie actual del club |
| is_filial | boolean | clubes filiales no ascienden (Art. 19 Reglamento) |
| is_enabled | boolean | habilitado por Dirección de Control Económico (Art. 7) |
| home_stadium_id | uuid FK → stadiums | |
| founded_year | int | |

### 5.4 `stadiums`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| city | text | |
| altitude_m | int | |
| capacity | int | |
| turf_type | text | `natural` / `artificial` |
| turf_height_mm | numeric | debe estar entre 20 y 25 (Art. 51) |
| quality_pro_certified | boolean | certificado FIFA Quality Pro vigente (césped artificial) |
| quality_pro_expiry | date | |
| var_infrastructure_ok | boolean | conexión 100 Mbps, 220V, altura de cámaras 7m (Art. 92) |
| is_qualified | boolean | calificado por Dirección de Escenarios Deportivos |

### 5.5 `players`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| club_id | uuid FK → clubs | |
| first_name | text | |
| last_name | text | |
| nickname | text | requiere aprobación LIGAPRO si se usa en camiseta (Art. 35) |
| jersey_number | int | 1–99, sin ceros a la izquierda (Art. 33) |
| position | text | |
| photo_url | text | |
| birth_date | date | |
| is_captain | boolean | |
| status | text | `active` / `suspended` / `injured` / `inactive` |

### 5.6 `staff_members`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| club_id | uuid FK → clubs | |
| full_name | text | |
| role | text | `director_tecnico`, `medico`, `preparador_fisico`, `auxiliar`, etc. |
| is_enabled | boolean | habilitado por LIGAPRO (Art. 7c) |

### 5.7 `officials`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| full_name | text | |
| official_type | text | `arbitro`, `comisario_juego`, `delegado_seguridad`, `oficial_patrocinio`, `oficial_var`, `medico_control_dopaje`, `coordinador_partido` |
| is_foreign | boolean | árbitro extranjero contratado a solicitud de clubes (Disposición Octava) |
| credential_status | text | `active` / `revoked` |

### 5.8 `matches`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| series_id | uuid FK → series | |
| phase_id | uuid FK → phases | |
| matchday | int | jornada/fecha del fixture |
| home_club_id | uuid FK → clubs | |
| away_club_id | uuid FK → clubs | |
| stadium_id | uuid FK → stadiums | |
| scheduled_at | timestamptz | fecha y hora oficial |
| notified_at | timestamptz | cuándo se notificó a clubes (debe ser ≥ 15 días antes, Art. 25) |
| status | text | `scheduled`, `live`, `finished`, `postponed`, `suspended`, `rescheduled`, `walkover` |
| unified_kickoff | boolean | horario unificado para últimas 2 fechas de fase (Art. 27) |
| home_score | int | null hasta finalizar |
| away_score | int | null hasta finalizar |
| home_score_penalties | int | solo Fase Final en caso de definición por penales (Art. 11c) |
| away_score_penalties | int | |
| referee_id | uuid FK → officials | |
| var_official_id | uuid FK → officials nullable | |
| match_commissioner_id | uuid FK → officials | Comisario de Juego |
| security_delegate_id | uuid FK → officials | Delegado de Seguridad |
| sponsorship_official_id | uuid FK → officials | Oficial de Patrocinio |
| weather_condition | text | opcional, informativo |
| suspension_reason | text | lluvia, falta de energía, incidentes, etc. (Art. 73–79) |
| rescheduled_from_match_id | uuid FK → matches nullable | referencia si es reprogramación |
| doping_control_officer_id | uuid FK → officials nullable | |

**Índices recomendados:** `(series_id, phase_id, matchday)`, `(home_club_id)`, `(away_club_id)`, `(scheduled_at)`.

### 5.9 `match_events`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| match_id | uuid FK → matches | |
| player_id | uuid FK → players | |
| club_id | uuid FK → clubs | |
| event_type | text | `goal`, `own_goal`, `yellow_card`, `red_card`, `substitution_in`, `substitution_out`, `penalty_scored`, `penalty_missed` |
| minute | int | |
| extra_info | jsonb | p.ej. asistencia, tipo de gol |

### 5.10 `standings` (tabla de posiciones materializada, recalculada por función/trigger)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| series_id | uuid FK → series | |
| phase_id | uuid FK → phases | referencia a Fase Uno, Fase Dos, o registro especial "acumulada" |
| club_id | uuid FK → clubs | |
| played | int | PJ |
| won | int | PG |
| drawn | int | PE |
| lost | int | PP |
| goals_for | int | GF |
| goals_against | int | GC |
| goal_difference | int (generated) | GF − GC |
| points | int | PTS |
| position | int | posición calculada tras aplicar desempates |
| tiebreak_applied | text nullable | criterio de desempate aplicado (`goal_difference`, `goals_for`, `head_to_head`, `away_goals`, `draw`) |
| zone | text | `qualification_final_phase`, `libertadores`, `sudamericana`, `relegation`, `none` |

> La tabla Acumulada/Clasificatoria se representa con `phase_id` apuntando a un registro especial de tipo "acumulada" por serie/temporada, para no mezclar la lógica con las fases reglamentarias reales.

### 5.11 `disciplinary_sanctions`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| player_id | uuid FK → players nullable | null si la sanción es al club |
| club_id | uuid FK → clubs | |
| match_id | uuid FK → matches nullable | |
| sanction_type | text | `yellow_card_accumulation`, `red_card_suspension`, `fine`, `disqualification`, `stadium_ban` |
| description | text | |
| amount_usd | numeric nullable | multa en USD (p.ej. 500, 1500, 2000 según reincidencia) |
| suspended_matches | int nullable | número de partidos de suspensión |
| phase_id | uuid FK → phases nullable | fase en la que aplica/se resetea |
| status | text | `active`, `served`, `appealed`, `overturned` |
| created_by | uuid FK → auth.users | |

### 5.12 `yellow_card_tracker` (vista o tabla auxiliar)
| Columna | Tipo | Notas |
|---|---|---|
| player_id | uuid FK → players | |
| phase_id | uuid FK → phases | se resetea en cada fase (Art. 91) |
| accumulated_cards | int | trigger genera suspensión automática al llegar a 5 |

### 5.13 `user_profiles` (extiende `auth.users` de Supabase)
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK, FK → auth.users | |
| display_name | text | |
| role | text | `hincha`, `admin`, `maintenance_chief`, `technician`, `manager` |
| favorite_club_id | uuid FK → clubs nullable | solo para hinchas |
| notification_preferences | jsonb | |
| avatar_url | text | |

### 5.14 `notifications`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → user_profiles | |
| title | text | |
| body | text | |
| related_match_id | uuid FK → matches nullable | |
| read_at | timestamptz nullable | |

### 5.15 `audit_log`
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| action | text | `create`, `update`, `delete` |
| table_name | text | |
| record_id | uuid | |
| diff | jsonb | |
| created_at | timestamptz | |

---

## 6. Reglas de negocio derivadas del Reglamento LIGAPRO

Esta sección traduce artículos específicos del Reglamento en reglas de sistema verificables. Cada regla indica dónde debe implementarse (Frontend / Postgres trigger / Edge Function).

| # | Regla | Fuente (Art.) | Implementación |
|---|---|---|---|
| RN-01 | Serie A: 16 clubes, 3 fases (Fase Uno, Fase Dos, Fase Final) | Art. 8 | Seed de datos + validación de `num_clubs` en `series` |
| RN-02 | Fase Uno y Fase Dos: todos contra todos, 15 partidos por equipo cada una | Art. 9, 10 | Generador de fixture (Edge Function) |
| RN-03 | Al iniciar Fase Dos, los puntajes de posiciones se reinician a cero; solo suman a la Tabla Acumulada | Art. 10a | Trigger: nueva fila en `standings` con `phase_id` = Fase Dos, puntos en 0 |
| RN-04 | Desempate: 1° diferencia de goles, 2° goles marcados, 3° resultado directo ("performance"), 4° sorteo público | Art. 9c, 10d | Edge Function `calculate-standings` con lógica en cascada; el sorteo público se registra manualmente por el admin cuando aplica |
| RN-05 | Fase Final: ida y vuelta; el mejor ubicado en la Tabla Acumulada juega de local la vuelta | Art. 11 | Campo `home_club_id` de la vuelta se asigna automáticamente según posición acumulada |
| RN-06 | Fase Final se define por penales si hay igualdad de puntos y goles tras la vuelta (sin tiempo extra) | Art. 11c | Campos `home_score_penalties` / `away_score_penalties` en `matches` |
| RN-07 | Si un club repite el primer lugar en Fase Uno y Fase Dos, es campeón directo sin Fase Final | Art. 12 | Regla de validación en el módulo de standings; el admin marca el campeonato como resuelto sin generar partidos de Fase Final |
| RN-08 | Clubes en posiciones 15°/16° de la Tabla Acumulada pierden el derecho a Fase Final aunque hayan clasificado por fase | Art. 13 | Validación al generar Fase Final: excluir clubes en zona de descenso de la Acumulada |
| RN-09 | Descenso: los 2 últimos de la Tabla Acumulada (Serie A) bajan a Serie B | Art. 14 | Campo `zone = relegation` en `standings`, actualización de `clubs.series_id` al cierre de temporada (acción manual del admin, no automática) |
| RN-10 | Desempate de Tabla Acumulada añade un 3° criterio: goles como visitante, antes del criterio de "performance" | Art. (…) posterior al 14 | Reflejar el orden de criterios específico para la tabla acumulada, distinto al de fase individual |
| RN-11 | Serie B: 1 sola fase, 10 equipos, doble rueda (36 partidos por equipo) | Art. 15, 16 | Generador de fixture |
| RN-12 | Serie B: 1° y 2° ascienden a Serie A; los 2 últimos descienden a Segunda Categoría | Art. 18, 19 | Igual que RN-09, aplicado a Serie B |
| RN-13 | Ascenso no aplica a clubes filiales; asciende el siguiente mejor ubicado | Art. 19, Disposición Transitoria Cuarta | Validación: excluir clubes con `is_filial = true` del cálculo de ascenso |
| RN-14 | Programación de partidos: notificación con mínimo 15 días de anticipación | Art. 25 | Trigger de validación en `matches`: `scheduled_at - notified_at >= 15 días` (excepcionalmente modificable solo por LIGAPRO) |
| RN-15 | No se programan partidos de Serie A en fechas FIFA; Serie B sí puede | Art. 26 | Validación con calendario de fechas FIFA (tabla de configuración `fifa_dates`) aplicada solo si `series = Serie A` |
| RN-16 | Horario unificado obligatorio en las 2 últimas fechas de cada fase cuando los resultados inciden en clasificación/descenso | Art. 27 | Campo `unified_kickoff` + validación de que todos los partidos de esa jornada compartan `scheduled_at` |
| RN-17 | Postergación por partido internacional CONMEBOL/FIFA dentro de 48h: solo 24h de ajuste, garantizando 2 días completos de intervalo | Art. 28a | Edge Function `validate-match-schedule` |
| RN-18 | Cambio de indumentaria: solo tras 7 días de aprobación de la Dirección de Competiciones | Art. 29 | Campo `effective_date` en tabla de cambios de uniforme (extensión futura) + validación de fecha |
| RN-19 | Numeración de camiseta: mínimo 25cm dorsal, máximo 2 dígitos, sin ceros a la izquierda | Art. 33 | Validación de formulario en `players.jersey_number` (1–99) |
| RN-20 | 5 tarjetas amarillas (consecutivas o alternas) = suspensión para el siguiente partido | Art. 91 | Trigger sobre `match_events` → `yellow_card_tracker` → genera fila en `disciplinary_sanctions` al llegar a 5 |
| RN-21 | Tarjetas amarillas se borran al cambiar de fase | Art. 91 | Trigger: reset de `yellow_card_tracker.accumulated_cards` al insertar nueva `phase` activa |
| RN-22 | Multas por amonestación/expulsión distintas para Serie A (USD 20 / USD 100) y Serie B (USD 10 / USD 50) | Art. 91 | Tabla de configuración `sanction_fees` por serie, referenciada por Edge Function al generar sanción |
| RN-23 | Inasistencia o no presentación de planilla: pierde el partido 3-0 (o el marcador real si era menor) | Art. 62, 81 | Estado `walkover` en `matches`, con `home_score`/`away_score` auto-asignados 3-0 |
| RN-24 | Reincidencia en incumplimientos con multa base de USD 500: sube a USD 2,000 (Serie A) o USD 1,000 (Serie B) por incumplimiento | Disposición General Quinta | Tabla `sanction_fees` con lógica de reincidencia (contador por club/tipo de infracción) |
| RN-25 | Estadios con césped artificial requieren certificado FIFA Quality Pro vigente | Art. 51 | Campo `quality_pro_certified` + `quality_pro_expiry`; alerta si expira antes de un partido programado |
| RN-26 | Infraestructura VAR obligatoria desde Fase Dos de Serie A 2023: conexión 100 Mbps, 220V, cámaras a 7m mínimo | Art. 92, Disposición Transitoria Sexta | Campo `var_infrastructure_ok` en `stadiums`; bloqueo de calificación si falta |
| RN-27 | Máximo 5 sustituciones por equipo, en máximo 3 momentos por partido | Disposición General Cuarta | Validación en carga de eventos tipo `substitution_in/out`: contador ≤ 5, agrupado en ≤ 3 timestamps distintos por partido/equipo |
| RN-28 | Un club no puede ceder la localía bajo ningún motivo | Disposición Sexta/Séptima | Regla de negocio documental (no hay acción de "ceder localía" en el sistema; el estadio local siempre pertenece al `home_club_id` registrado) |

> Todas las reglas marcadas como "Edge Function" o "Trigger" deben tener cobertura de pruebas automatizadas (ver sección 12.4).

---

## 7. Requisitos funcionales por módulo

### 7.1 Módulo de Autenticación y Perfiles
- RF-01: El sistema debe permitir registro/login de hinchas vía email/password y, opcionalmente, proveedores OAuth (Google).
- RF-02: El acceso administrativo se realiza mediante credenciales provistas por la Dirección de Competiciones (no hay auto-registro para roles administrativos); la pantalla de acceso ya prototipada usa campos "Usuario" (ID de Empleado o Club) y "Contraseña".
- RF-03: Tras autenticar, el sistema debe redirigir según `user_profiles.role`: hinchas al Portal Hincha, roles administrativos al Panel Administrativo.
- RF-04: El hincha puede editar su perfil: nombre, club favorito, preferencias de notificación, avatar.

### 7.2 Módulo de Fixture / Programación de Partidos (Administrativo)
- RF-05: Formulario de programación con los campos: Serie, Fase, Jornada (Matchday), Club Local, Club Visitante, Fecha, Hora (Local), Escenario Deportivo, Ciudad, Altitud, Árbitro Central, Comisario de Juego, Delegado de Seguridad, Asignación VAR (campos ya definidos en el mockup Stitch).
- RF-06: El sistema debe autocompletar Ciudad y Altitud al seleccionar el Escenario Deportivo (relación `stadiums`).
- RF-07: El sistema debe bloquear la selección de un estadio no calificado (`is_qualified = false`).
- RF-08: El sistema debe validar RN-14 (15 días de anticipación) y RN-15 (bloqueo fechas FIFA para Serie A) al guardar.
- RF-09: El sistema debe permitir marcar un partido como `unified_kickoff` cuando corresponde a las 2 últimas fechas de una fase.
- RF-10: El sistema debe permitir reprogramar un partido, conservando referencia al partido original (`rescheduled_from_match_id`) y aplicando las reglas de los Art. 28, 73–79.
- RF-11: El sistema debe alertar en el Dashboard Administrativo los partidos sin oficiales asignados o con estadio no calificado, con un plazo de días restantes hasta el partido.

### 7.3 Módulo de Resultados y Eventos de Partido (Administrativo)
- RF-12: El sistema debe permitir cargar el marcador final, goleadores (con jugador y minuto), tarjetas amarillas/rojas, sustituciones, y marcar el estado final del partido (`finished`, `suspended`, `walkover`, etc.).
- RF-13: Al guardar un resultado, el sistema debe disparar automáticamente el recálculo de `standings` para la fase correspondiente (trigger o llamada a Edge Function `calculate-standings`).
- RF-14: El sistema debe validar RN-27 (máximo 5 sustituciones, 3 momentos) al registrar eventos de sustitución.
- RF-15: El sistema debe generar automáticamente sanciones disciplinarias (RN-20, RN-22) al registrar tarjetas.
- RF-16: En caso de partido suspendido, el sistema debe registrar el motivo (Art. 73–77) y permitir la reanudación conservando minuto, resultado, jugadores en cancha y sanciones vigentes (Art. 79).

### 7.4 Módulo de Tabla de Posiciones
- RF-17: El sistema debe mostrar 3 vistas de tabla por Serie A: Fase Uno, Fase Dos, Tabla Acumulada/Clasificatoria; y 1 vista para Serie B: Fase de Clasificación.
- RF-18: Cada fila debe incluir PJ, PG, PE, PP, GF, GC, DG, PTS y un indicador visual de zona (clasificación a Fase Final, zona Libertadores/Sudamericana si aplica, descenso).
- RF-19: El sistema debe aplicar automáticamente los criterios de desempate en cascada definidos en RN-04 y RN-10, y debe registrar (`tiebreak_applied`) qué criterio decidió cada posición, visible para el administrativo.
- RF-20: Cuando el desempate requiera sorteo público (último criterio), el sistema debe permitir al administrativo ingresar manualmente el resultado del sorteo y dejar constancia (campo de auditoría).

### 7.5 Módulo de Sanciones Disciplinarias (Administrativo)
- RF-21: Vista de listado de sanciones filtrable por club, serie, tipo de sanción y estado, con las variantes mobile y desktop ya prototipadas.
- RF-22: El sistema debe mostrar el conteo de tarjetas amarillas acumuladas por jugador en la fase vigente, y resaltar a los jugadores en riesgo de suspensión (4 tarjetas) o ya suspendidos (5 tarjetas).
- RF-23: El sistema debe permitir registrar multas manuales (p. ej. incumplimiento de indumentaria, Art. 30 y 33–39) con monto y motivo.
- RF-24: El sistema debe calcular automáticamente incrementos por reincidencia (RN-24).

### 7.6 Módulo de Clubes, Jugadores y Estadios (Administrativo)
- RF-25: CRUD de clubes: datos generales, colores de uniforme (principal y alternos), estado de habilitación, serie actual, condición de filial.
- RF-26: CRUD de jugadores: datos personales, número de camiseta (validado RN-19), posición, foto, estado (activo/suspendido/lesionado).
- RF-27: CRUD de estadios: datos generales, altura de césped, certificación Quality Pro (con fecha de expiración y alerta), infraestructura VAR, estado de calificación general.
- RF-28: CRUD de oficiales: tipo, estado de credencial, marca de árbitro extranjero.

### 7.7 Módulo Hincha — Home y Navegación
- RF-29: Home Hincha debe mostrar: próximos partidos destacados (Matchcards), resultados recientes, sección de noticias/anuncios.
- RF-30: Fixture/Calendario con filtros por fecha, fase, serie y club.
- RF-31: Detalle de partido con marcador (o "programado"), alineaciones en esquema táctico, tarjetas, información de estadio y cuerpo arbitral (tal como en el mockup ya generado).
- RF-32: Perfil de club: escudo, colores, plantilla, próximos partidos, historial de resultados.
- RF-33: Perfil de jugador: datos, tarjetas acumuladas, sanciones vigentes, club actual.
- RF-34: El hincha puede seguir un club favorito y recibir notificaciones (nuevo partido programado, resultado publicado, tarjeta roja a un jugador seguido, etc.).

### 7.8 Módulo de Notificaciones
- RF-35: El sistema debe generar notificaciones in-app (tabla `notifications`) para eventos relevantes del club favorito del hincha.
- RF-36: El administrativo debe poder enviar comunicados generales (opcional, fase posterior).

---

## 8. Diseño de UI/UX

### 8.1 Design system "LigaPro Elite" (tokens ya definidos en Stitch)

**Paleta de color:**
- Primario (Navy profundo): `#000613` / contenedor `#001f3f` — navegación, headers, acciones primarias.
- Secundario (Dorado): `#735c00` / contenedor `#fed65b` — destacados, logros, estado premium.
- Terciario (Rojo): `#160000` / contenedor `#470001` — alertas críticas, tarjetas rojas.
- Error: `#ba1a1a`.
- Superficie base: `#f8f9fa`; superficie contenedor: variantes de `#ffffff` a `#e1e3e4`.
- Success (verde, mapeado semánticamente): zonas de clasificación a Copa Libertadores/Sudamericana y resultados positivos.
- Danger (rojo): zona de descenso, tarjetas rojas, alertas críticas.

**Tipografía:**
- Montserrat (headlines, marcadores, cifras destacadas): `display-lg` 48px/800, `headline-lg` 32px/700 (24px/700 en mobile), `headline-md` 20px/600.
- Barlow Condensed (cuerpo, datos densos): `body-lg` 18px, `body-md` 16px, `label-bold` 14px/700 uppercase con tracking 0.05em.
- `stats-number`: Montserrat 24px/800, para cifras de estadística.

**Layout:**
- Desktop: grid de 12 columnas, máximo 1440px, gutter 24px.
- Sidebar administrativo: fijo, 280px, tema oscuro (Navy).
- Mobile: grid fluido de 4 columnas, márgenes 16px, navegación inferior tipo tab bar.
- Escala de espaciado: base 8px (`xs` 4px, `sm` 12px, `md` 24px, `lg` 48px, `xl` 80px).

**Elevación:** 3 niveles (fondo plano, tarjeta estática con borde 1px, Matchcard activa con sombra suave `0px 4px 20px rgba(0,31,63,0.08)`).

**Forma:** radios de 4px (`rounded` default) para elementos estándar, 8px (`rounded-lg`) para contenedores grandes (tablas, tarjetas grandes).

**Componentes reutilizables:**
- **Matchcard:** fondo blanco, marcador centrado en Montserrat Bold, escudos a los lados, borde superior de acento (dorado = destacado, verde = en vivo).
- **League Table:** zebra-striping, barra vertical de 4px de "zona" (verde Libertadores, azul Sudamericana, rojo descenso), texto en Barlow Condensed.
- **Botones:** Primario (fondo Navy, texto blanco, uppercase), Secundario (borde dorado 2px, texto dorado, transparente), Terciario/Ghost (sin borde, texto Navy).
- **Inputs/Selects:** borde 1px, foco cambia a borde dorado, labels en Barlow Condensed.
- **Chips/Badges:** píldoras de alto contraste para estado de partido (`LIVE`, `FT`, `PPD`), Navy para neutral, Verde para en vivo.
- **Dashboard Widgets:** mini-visualizaciones de forma (círculos G/E/P), destacado de jugador del partido con gradiente dorado.

### 8.2 Inventario de pantallas (ya prototipadas en Stitch — usar como fuente de verdad visual)
1. **Acceso / Login** (`ligapro_manager_acceso`) — campos Usuario (ID de Empleado o Club) y Contraseña.
2. **Home Hincha** (`home_hincha_ligapro`).
3. **Tabla de Posiciones** (`tablas_de_posiciones`).
4. **Dashboard Administrativo** (mobile: `dashboard_administrativo`; desktop: `dashboard_administrativo_escritorio`).
5. **Gestión de Sanciones** (mobile: `gesti_n_de_sanciones`; desktop: `gesti_n_de_sanciones_escritorio`).
6. **Programación de Partido** (`programaci_n_de_partido`).
7. **Detalle del Partido** (`detalle_del_partido`) — incluye esquema táctico 4-4-2, cuerpo arbitral, datos del estadio.
8. **Perfil Administrativo** (desktop: `perfil_administrativo_escritorio`).

> Codex debe usar los archivos `code.html` de cada carpeta del export de Stitch como referencia de maquetación exacta (estructura, clases Tailwind, jerarquía visual) al construir los componentes React equivalentes, adaptando el HTML estático a componentes con datos dinámicos de Supabase.

### 8.3 Pantallas pendientes de diseño (a construir siguiendo el mismo design system)
- Fixture/Calendario completo (vista lista + vista calendario).
- Perfil de Club (hincha).
- Perfil de Jugador (hincha).
- CRUD de Clubes, Jugadores, Estadios, Oficiales (administrativo).
- Gestión de Usuarios Administrativos (rol `maintenance_chief`).
- Pantalla de configuración de fechas FIFA / temporada.

---

## 9. Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | Rendimiento: tiempo de carga inicial (LCP) < 2.5s en conexión 4G para el Home Hincha. |
| RNF-02 | Responsive: soporte completo mobile-first (320px+) y desktop (hasta 1440px), conforme al grid definido en el design system. |
| RNF-03 | Disponibilidad: objetivo 99.5% uptime (dependiente de Netlify + Supabase SLA). |
| RNF-04 | Escalabilidad: el modelo de datos debe soportar múltiples temporadas históricas sin migración estructural (particionamiento lógico por `season_year`). |
| RNF-05 | Accesibilidad: contraste mínimo AA (WCAG 2.1) en todos los textos sobre fondo Navy/Dorado. |
| RNF-06 | Internacionalización: la v1.0 es monolingüe en español (Ecuador); arquitectura debe permitir i18n futura. |
| RNF-07 | Auditoría: toda modificación a partidos, resultados y sanciones debe quedar registrada en `audit_log` con usuario y timestamp. |
| RNF-08 | Realtime: el marcador de partidos "en vivo" debe actualizarse vía Supabase Realtime sin necesidad de recargar la página. |
| RNF-09 | Testing: cobertura mínima del 80% en las funciones críticas de negocio (cálculo de standings, sanciones, validaciones de programación). |
| RNF-10 | Observabilidad: logs de Edge Functions centralizados y monitoreados (Supabase Logs), alertas ante fallos de recálculo de standings. |

---

## 10. Seguridad y Row Level Security (RLS)

### 10.1 Principios generales
- RLS habilitado en **todas** las tablas de Supabase sin excepción.
- El acceso de lectura pública (hinchas anónimos) se limita explícitamente a tablas de contenido público: `matches`, `standings`, `clubs`, `players` (datos no sensibles), `match_events`, `stadiums` (campos públicos).
- Las tablas administrativas sensibles (`disciplinary_sanctions` con montos, `audit_log`, `user_profiles` de otros usuarios, `officials` con datos de contacto) **no** son legibles por el rol `hincha`.

### 10.2 Matriz de permisos (resumen)

| Tabla | Hincha (lectura) | Hincha (escritura) | Admin/Maintenance Chief | Technician/Manager |
|---|---|---|---|---|
| `matches` | ✅ (todas las columnas públicas) | ❌ | ✅ CRUD completo | ✅ Update (solo resultado/estado) |
| `standings` | ✅ | ❌ | ✅ (via función, no edición manual directa) | ❌ |
| `match_events` | ✅ | ❌ | ✅ CRUD | ✅ Create/Update |
| `disciplinary_sanctions` | ✅ (solo estado y partidos de suspensión, sin monto) | ❌ | ✅ CRUD completo (incl. montos) | ❌ ver, ❌ editar |
| `clubs` | ✅ | ❌ | ✅ CRUD | ❌ |
| `players` | ✅ | ❌ | ✅ CRUD | ✅ Update estado |
| `stadiums` | ✅ (campos públicos) | ❌ | ✅ CRUD | ❌ |
| `officials` | ❌ | ❌ | ✅ CRUD | ❌ |
| `user_profiles` | ✅ (solo su propia fila) | ✅ (solo su propia fila) | ✅ (todas) | ❌ |
| `notifications` | ✅ (solo las propias) | ✅ (marcar como leído, propias) | ✅ (todas) | ❌ |
| `audit_log` | ❌ | ❌ | ✅ (solo lectura) | ❌ |

### 10.3 Ejemplo de política RLS (pseudo-SQL, referencia para Codex)

```sql
-- Lectura pública de partidos
create policy "matches_public_read"
on matches for select
using (true);

-- Solo admin/maintenance_chief pueden insertar/actualizar/eliminar partidos
create policy "matches_admin_write"
on matches for all
using (
  (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief')
)
with check (
  (auth.jwt() ->> 'role') in ('admin', 'maintenance_chief')
);

-- Technician/Manager solo pueden actualizar resultado y estado, no reprogramar
create policy "matches_operational_update"
on matches for update
using ((auth.jwt() ->> 'role') in ('technician', 'manager'))
with check ((auth.jwt() ->> 'role') in ('technician', 'manager'));
-- Nota: restringir columnas editables mediante trigger BEFORE UPDATE
-- que revierta cambios no permitidos si el rol no es admin/maintenance_chief.

-- Perfil propio del hincha
create policy "user_profiles_self_read_write"
on user_profiles for select using (auth.uid() = id);

create policy "user_profiles_self_update"
on user_profiles for update using (auth.uid() = id);
```

### 10.4 Autenticación
- Supabase Auth con email/password como método principal.
- Custom claim `role` inyectado vía función Postgres (`auth.jwt()` hook) que lee `user_profiles.role` al emitir el JWT.
- Sesiones persistentes vía Supabase JS client (`supabase-js`), refresco automático de token.

---

## 11. Integraciones y Edge Functions

| Función | Trigger/Invocación | Descripción |
|---|---|---|
| `calculate-standings` | Trigger AFTER INSERT/UPDATE en `matches` cuando `status = finished` | Recalcula PJ/PG/PE/PP/GF/GC/PTS y aplica desempates en cascada (RN-04, RN-10) |
| `validate-match-schedule` | Invocada desde el formulario de programación antes de guardar | Valida RN-14, RN-15, RN-17 |
| `generate-yellow-card-suspension` | Trigger AFTER INSERT en `match_events` con `event_type = yellow_card` | Actualiza `yellow_card_tracker`, genera `disciplinary_sanctions` al llegar a 5 (RN-20) |
| `reset-phase-cards` | Invocada manualmente por admin al cerrar una fase | Resetea `yellow_card_tracker` (RN-21) |
| `send-match-notifications` | Trigger AFTER UPDATE en `matches` (cambio de estado o resultado) | Inserta filas en `notifications` para hinchas con `favorite_club_id` relacionado |
| `check-stadium-qualification` | Invocada al calificar/actualizar un estadio | Verifica `quality_pro_certified`, `var_infrastructure_ok`, altura de césped (RN-25, RN-26) |

---

## 12. Roadmap de construcción por fases

### Fase 0 — Fundamentos (Setup)
- Inicialización de repositorio, configuración Vite + React + TypeScript + TailwindCSS con tokens del design system.
- Configuración de proyecto Supabase (Auth, esquema inicial, RLS base).
- Configuración de despliegue Netlify (build, redirects, variables de entorno).

### Fase 1 — Modelo de datos y seed
- Creación de todas las tablas de la sección 5.
- Seed de datos: 16 clubes Serie A, 10 clubes Serie B, estadios, series, fases.
- Políticas RLS iniciales.

### Fase 2 — Autenticación y layouts
- Login unificado, manejo de sesión y roles.
- `PublicLayout` (Hincha) y `AdminLayout` (sidebar) migrados desde los mockups Stitch.

### Fase 3 — Portal Hincha (lectura)
- Home Hincha, Fixture/Calendario, Tabla de Posiciones, Detalle de Partido, Perfil de Club, Perfil de Jugador.

### Fase 4 — Panel Administrativo (gestión core)
- Dashboard Administrativo con alertas.
- Programación de Partido (con validaciones RN-14, RN-15, RN-17).
- Carga de Resultados y Eventos de Partido.

### Fase 5 — Motor de reglas de negocio
- Trigger/Edge Function de cálculo de standings con desempates.
- Trigger de sanciones por tarjetas amarillas y generación automática de suspensiones.
- Validaciones de sustituciones (RN-27).

### Fase 6 — Gestión de sanciones y catálogos
- Módulo de Gestión de Sanciones (mobile + desktop).
- CRUD de Clubes, Jugadores, Estadios, Oficiales.

### Fase 7 — Notificaciones y favoritos
- Seguimiento de club favorito, notificaciones in-app, Realtime para marcador en vivo.

### Fase 8 — Pulido, QA y lanzamiento
- Pruebas end-to-end de reglas críticas (sección 12.4).
- Auditoría de accesibilidad y performance.
- Despliegue a producción en Netlify.

### 12.4 Casos de prueba críticos (no exhaustivo)
- Verificar que al finalizar los 15 partidos de Fase Uno, el club líder quede marcado como clasificado a Fase Final.
- Verificar reinicio de puntos al pasar a Fase Dos, con la Tabla Acumulada reflejando la suma correcta.
- Verificar que un club con 5 tarjetas amarillas alternadas quede automáticamente suspendido para el siguiente partido.
- Verificar que las tarjetas amarillas se borren al iniciar una nueva fase.
- Verificar bloqueo de programación de partido de Serie A en fecha FIFA.
- Verificar bloqueo de programación con menos de 15 días de anticipación (salvo excepción marcada por admin).
- Verificar que un estadio con césped artificial sin certificado Quality Pro vigente no pueda calificarse.
- Verificar el cálculo correcto de multas por reincidencia (RN-24).

---

## 13. Criterios de aceptación

El proyecto se considera listo para producción cuando:
1. Todos los requisitos funcionales de la sección 7 están implementados y probados manualmente en ambos roles (Hincha, Administrativo).
2. Las 28 reglas de negocio (RN-01 a RN-28) tienen validación automatizada (trigger, Edge Function o validación de formulario) con al menos un test que confirme su cumplimiento.
3. Las políticas RLS impiden que un usuario `hincha` pueda leer o escribir datos administrativos sensibles (verificado con pruebas de penetración básicas usando el cliente anónimo de Supabase).
4. El build de producción se despliega correctamente en Netlify sin errores, con variables de entorno configuradas y `_redirects` funcionando para todas las rutas de React Router.
5. El diseño visual de las pantallas construidas coincide (estructuralmente) con los mockups de Stitch entregados, respetando la paleta, tipografía y componentes del design system "LigaPro Elite".
6. La tabla de posiciones se recalcula correctamente y en tiempo razonable (<3s) tras cargar un resultado.

---

## 14. Anexos

### 14.1 Mapeo de pantallas Stitch → Rutas de la aplicación (sugerido)

| Pantalla Stitch | Ruta sugerida | Rol |
|---|---|---|
| Acceso | `/login` | Público |
| Home Hincha | `/` | Hincha |
| Tabla de Posiciones | `/tabla-posiciones` | Hincha (público) |
| Detalle del Partido | `/partidos/:matchId` | Hincha (público) |
| Dashboard Administrativo | `/admin` | Admin |
| Programación de Partido | `/admin/partidos/nuevo`, `/admin/partidos/:matchId/editar` | Admin |
| Gestión de Sanciones | `/admin/sanciones` | Admin |
| Perfil Administrativo | `/admin/perfil` | Admin |

### 14.2 Glosario de estados de partido (`matches.status`)
- `scheduled`: programado, aún no jugado.
- `live`: en curso.
- `finished`: finalizado con resultado.
- `postponed`: postergado (Art. 28).
- `suspended`: suspendido definitivamente (Art. 73–79).
- `rescheduled`: reprogramado tras suspensión.
- `walkover`: resuelto por incomparecencia (Art. 62, 81).

### 14.3 Notas para Codex
- Priorizar la reutilización exacta de las clases Tailwind y estructura HTML de los archivos `code.html` entregados por Stitch al construir los componentes React, para no perder fidelidad visual del design system "LigaPro Elite".
- Todas las reglas de negocio de la sección 6 deben implementarse primero a nivel de base de datos (constraints, triggers, Edge Functions) y luego reflejarse en el frontend como validación de UX; la fuente de verdad es siempre el backend.
- Ante cualquier ambigüedad entre el Reglamento y el diseño ya prototipado, prevalece el Reglamento de Competiciones LIGAPRO como fuente normativa, y el diseño de Stitch como fuente de verdad visual/UX.
