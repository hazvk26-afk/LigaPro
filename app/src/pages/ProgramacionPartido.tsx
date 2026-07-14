import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, upsertMatch, getClubs, getStadiums, getOfficials, getPhases, getSeries, validateMatchSchedule, ScheduleValidationResult } from '../services/db';
import { Match, Club, Stadium, Official, Phase, Series } from '../types';

export const ProgramacionPartido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Lists from DB
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);

  // Form Fields
  const [seriesId, setSeriesId] = useState('series-a');
  const [phaseId, setPhaseId] = useState('phase-a-1');
  const [matchday, setMatchday] = useState(1);
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-07-15');
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [stadiumId, setStadiumId] = useState('');
  const [unifiedKickoff, setUnifiedKickoff] = useState(false);
  const [refereeId, setRefereeId] = useState('');
  const [matchCommissionerId, setMatchCommissionerId] = useState('');
  const [securityDelegateId, setSecurityDelegateId] = useState('');
  const [varOfficialId, setVarOfficialId] = useState('');
  
  // Status and Score (for editing finished matches)
  const [status, setStatus] = useState<Match['status']>('scheduled');
  const [homeScore, setHomeScore] = useState<number | ''>('');
  const [awayScore, setAwayScore] = useState<number | ''>('');

  // Validation Result
  const [validation, setValidation] = useState<ScheduleValidationResult>({ valid: true, errors: [], warnings: [] });
  const [showWarningsOverride, setShowWarningsOverride] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      const allClubs = await getClubs();
      setClubs(allClubs);
      
      const allStadiums = await getStadiums();
      setStadiums(allStadiums);
      
      const allOfficials = await getOfficials();
      setOfficials(allOfficials);
      
      const allPhases = await getPhases();
      setPhases(allPhases);
      
      const allSeries = await getSeries();
      setSeriesList(allSeries);

      // Defaults
      if (allStadiums.length > 0) setStadiumId(allStadiums[0].id);

      // If Editing
      if (id) {
        const allMatches = await getMatches();
        const match = allMatches.find(m => m.id === id);
        if (match) {
          setSeriesId(match.series_id);
          setPhaseId(match.phase_id);
          setMatchday(match.matchday);
          setHomeClubId(match.home_club_id);
          setAwayClubId(match.away_club_id);
          setUnifiedKickoff(match.unified_kickoff);
          setStadiumId(match.stadium_id);
          setRefereeId(match.referee_id || '');
          setMatchCommissionerId(match.match_commissioner_id || '');
          setSecurityDelegateId(match.security_delegate_id || '');
          setVarOfficialId(match.var_official_id || '');
          setStatus(match.status);
          setHomeScore(match.home_score ?? '');
          setAwayScore(match.away_score ?? '');

          // Split scheduled_at
          if (match.scheduled_at) {
            const parts = match.scheduled_at.split('T');
            setScheduledDate(parts[0]);
            if (parts[1]) {
              setScheduledTime(parts[1].substring(0, 5));
            }
          }
        }
      } else {
        // Defaults for new match scheduling
        const defaultSeries = 'series-a';
        const seriesPhases = allPhases.filter(p => p.series_id === defaultSeries);
        if (seriesPhases.length > 0) setPhaseId(seriesPhases[0].id);

        const seriesClubs = allClubs.filter(c => c.series_id === defaultSeries);
        if (seriesClubs.length >= 2) {
          setHomeClubId(seriesClubs[0].id);
          setAwayClubId(seriesClubs[1].id);
        }
      }
    };
    loadAll();
  }, [id]);

  // Sync phase selection and default clubs with series selection for new match
  useEffect(() => {
    if (!id && phases.length > 0) {
      const seriesPhases = phases.filter(p => p.series_id === seriesId);
      if (seriesPhases.length > 0) {
        setPhaseId(seriesPhases[0].id);
      }
      const seriesClubs = clubs.filter(c => c.series_id === seriesId);
      if (seriesClubs.length >= 2) {
        setHomeClubId(seriesClubs[0].id);
        setAwayClubId(seriesClubs[1].id);
      }
    }
  }, [seriesId, id, phases, clubs]);

  // Selected Stadium detail
  const selectedStadium = stadiums.find(s => s.id === stadiumId);
  const selectedSeries = seriesList.find(s => s.id === seriesId);
  const selectedPhase = phases.find(p => p.id === phaseId);

  // Filter lists
  const filteredClubs = clubs.filter(c => c.series_id === seriesId && c.is_enabled);
  const centralReferees = officials.filter(o => o.official_type === 'arbitro' && o.credential_status === 'active');
  const commissioners = officials.filter(o => o.official_type === 'comisario_juego' && o.credential_status === 'active');
  const securityDelegates = officials.filter(o => o.official_type === 'delegado_seguridad' && o.credential_status === 'active');
  const varOfficials = officials.filter(o => o.official_type === 'oficial_var' && o.credential_status === 'active');

  const handleValidation = (): ScheduleValidationResult => {
    const matchData: Partial<Match> = {
      scheduled_at: `${scheduledDate}T${scheduledTime}:00-05:00`,
      notified_at: id ? undefined : new Date().toISOString(),
    };
    const res = validateMatchSchedule(matchData, selectedStadium, selectedSeries, selectedPhase);
    setValidation(res);
    return res;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (homeClubId === awayClubId) {
      setValidation({
        valid: false,
        errors: ['El club local y el visitante no pueden ser el mismo equipo.'],
        warnings: []
      });
      return;
    }

    const res = handleValidation();

    if (!res.valid) {
      return;
    }

    if (res.warnings.length > 0 && !showWarningsOverride) {
      setShowWarningsOverride(true);
      return;
    }

    // Prepare Match Object
    const isoDatetime = `${scheduledDate}T${scheduledTime}:00-05:00`;

    const matchObject: Match = {
      id: id || Math.random().toString(36).substring(2, 11),
      series_id: seriesId,
      phase_id: phaseId,
      matchday: Number(matchday),
      home_club_id: homeClubId,
      away_club_id: awayClubId,
      stadium_id: stadiumId,
      scheduled_at: isoDatetime,
      unified_kickoff: unifiedKickoff,
      status: status,
      home_score: homeScore === '' ? null : Number(homeScore),
      away_score: awayScore === '' ? null : Number(awayScore),
      home_score_penalties: null,
      away_score_penalties: null,
      referee_id: refereeId || undefined,
      var_official_id: varOfficialId || undefined,
      match_commissioner_id: matchCommissionerId || undefined,
      security_delegate_id: securityDelegateId || undefined
    };

    if (!id) {
      matchObject.notified_at = new Date().toISOString();
    }

    // import upsertMatch from db (it's already imported)
    await upsertMatch(matchObject);
    navigate('/admin');
  };

  return (
    <div className="space-y-gutter">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-brand-outline-variant/20 pb-md">
        <div>
          <h3 className="font-montserrat text-headline-lg font-bold text-brand-primary flex items-center gap-3">
            <span className="material-symbols-outlined text-brand-secondary text-[40px]">
              {id ? 'edit_calendar' : 'calendar_add_on'}
            </span>
            {id ? 'Editar Encuentro' : 'Programar Encuentro'}
          </h3>
          <p className="font-barlow text-body-lg text-brand-on-surface-variant mt-2">
            Configuración oficial de partidos de campeonato Serie A y Serie B.
          </p>
        </div>
        <div className="flex gap-sm">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-md py-sm border-2 border-brand-primary text-brand-primary font-label-bold text-xs uppercase rounded-lg hover:bg-brand-surface-highest transition-colors cursor-pointer"
          >
            DESCARTAR CAMBIOS
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-md py-sm bg-brand-primary text-white font-label-bold text-xs uppercase rounded-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            {id ? 'GUARDAR CAMBIOS' : 'GUARDAR PROGRAMACIÓN'}
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {hasSubmitted && !validation.valid && (
        <div className="bg-brand-error-container/20 border-l-4 border-brand-error p-md rounded-lg flex items-start gap-md">
          <span className="material-symbols-outlined text-brand-error text-[32px]">warning</span>
          <div>
            <p className="font-barlow font-bold text-xs text-brand-on-error-container uppercase">Conflicto de Normativa (Reglamento)</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-brand-on-error-container font-semibold mt-1">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Warnings Overrides Box */}
      {showWarningsOverride && validation.warnings.length > 0 && (
        <div className="bg-brand-secondary-container/20 border-l-4 border-brand-secondary p-md rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-brand-secondary text-[32px]">info</span>
            <div>
              <p className="font-barlow font-bold text-xs text-brand-on-secondary-container uppercase">Advertencias de Reglamento</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-brand-on-secondary-container font-semibold mt-1">
                {validation.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              // Set validation valid true to skip on next click
              setValidation(prev => ({ ...prev, valid: true }));
              // Trigger save
              setTimeout(() => {
                const btn = document.createElement('button');
                btn.onclick = () => setShowWarningsOverride(false);
                btn.click();
              }, 50);
            }}
            className="px-sm py-xs bg-brand-secondary text-white rounded font-label-bold text-xs uppercase hover:bg-brand-secondary-container hover:text-brand-on-secondary-container shrink-0 self-end md:self-auto"
          >
            Ignorar y Guardar
          </button>
        </div>
      )}

      {/* Form Bento Grid Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left Column: Match details (8 cols) */}
        <div className="lg:col-span-8 space-y-md">
          {/* Competition Details */}
          <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
            <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">trophy</span>
              Detalles de la Competición
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Serie</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                  disabled={!!id} // Locked once created
                >
                  <option value="series-a">Serie A</option>
                  <option value="series-b">Serie B</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Fase</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                  value={phaseId}
                  onChange={(e) => setPhaseId(e.target.value)}
                  disabled={!!id}
                >
                  {phases.filter(p => p.series_id === seriesId).map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Jornada (Matchday)</label>
                <input 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                  type="number"
                  min={1}
                  max={selectedSeries?.slug === 'serie-a' ? 15 : 36}
                  value={matchday}
                  onChange={(e) => setMatchday(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Teams Selection */}
          <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm relative overflow-hidden space-y-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-secondary" />
            
            <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-md">
              <div className="md:col-span-3 space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Club Local</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all font-bold text-brand-primary"
                  value={homeClubId}
                  onChange={(e) => setHomeClubId(e.target.value)}
                  disabled={!!id}
                >
                  {filteredClubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                  VS
                </div>
              </div>

              <div className="md:col-span-3 space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Club Visitante</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all font-bold text-brand-primary"
                  value={awayClubId}
                  onChange={(e) => setAwayClubId(e.target.value)}
                  disabled={!!id}
                >
                  {filteredClubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date, Time, Stadium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Date and Time */}
            <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
              <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Fecha y Hora
              </h4>
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Fecha</label>
                  <input 
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Hora</label>
                  <input 
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <input 
                  type="checkbox" 
                  id="unified"
                  checked={unifiedKickoff}
                  onChange={(e) => setUnifiedKickoff(e.target.checked)}
                  className="rounded text-brand-secondary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="unified" className="font-barlow font-bold text-xs uppercase text-brand-primary cursor-pointer">
                  Horario Unificado (Art. 27)
                </label>
              </div>
            </div>

            {/* Stadium */}
            <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
              <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">stadium</span>
                Escenario y Sede
              </h4>
              
              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Estadio</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all font-semibold"
                  value={stadiumId}
                  onChange={(e) => setStadiumId(e.target.value)}
                >
                  {stadiums.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              {selectedStadium && (
                <div className={`flex items-center gap-2 px-sm py-1.5 rounded border text-xs font-bold uppercase ${
                  selectedStadium.is_qualified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${selectedStadium.is_qualified ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
                  <span>{selectedStadium.is_qualified ? 'Estadio Calificado' : 'Estadio Bloqueado / Sin Calificación'}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-[10px] uppercase text-brand-outline">Ciudad</label>
                  <input 
                    className="w-full bg-brand-surface-container border border-brand-outline-variant rounded-lg p-sm font-body-md text-brand-on-surface-variant outline-none" 
                    type="text" 
                    readOnly 
                    value={selectedStadium?.city || ''} 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-[10px] uppercase text-brand-outline">Altitud</label>
                  <input 
                    className="w-full bg-brand-surface-container border border-brand-outline-variant rounded-lg p-sm font-body-md text-brand-on-surface-variant outline-none" 
                    type="text" 
                    readOnly 
                    value={selectedStadium ? `${selectedStadium.altitude_m} m` : ''} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Results Panel (Only visible when modifying an existing match) */}
          {id && (
            <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
              <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">sports_score</span>
                Resultados y Estado de Partido
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Estado</label>
                  <select 
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none transition-all"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Match['status'])}
                  >
                    <option value="scheduled">Programado</option>
                    <option value="live">En Vivo</option>
                    <option value="finished">Finalizado</option>
                    <option value="suspended">Suspendido</option>
                    <option value="postponed">Postergado</option>
                    <option value="walkover">Walkover (3-0)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Goles Local</label>
                  <input 
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                    type="number"
                    min={0}
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={status === 'scheduled'}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Goles Visitante</label>
                  <input 
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                    type="number"
                    min={0}
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={status === 'scheduled'}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Officials Assignment (4 cols) */}
        <div className="lg:col-span-4 space-y-md">
          <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
            <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2 border-b border-brand-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
              Asignación Oficiales
            </h4>

            <div className="flex flex-col gap-1">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Árbitro Central</label>
              <select 
                className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                value={refereeId}
                onChange={(e) => setRefereeId(e.target.value)}
              >
                <option value="">Designación Pendiente</option>
                {centralReferees.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name} {r.is_foreign ? '(Extranjero)' : ''}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Comisario de Juego</label>
              <select 
                className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                value={matchCommissionerId}
                onChange={(e) => setMatchCommissionerId(e.target.value)}
              >
                <option value="">Designación Pendiente</option>
                {commissioners.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Delegado Seguridad</label>
              <select 
                className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                value={securityDelegateId}
                onChange={(e) => setSecurityDelegateId(e.target.value)}
              >
                <option value="">Designación Pendiente</option>
                {securityDelegates.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Oficial VAR</label>
              <select 
                className="w-full bg-white border border-brand-outline-variant rounded-lg p-sm font-body-md focus:border-brand-secondary outline-none"
                value={varOfficialId}
                onChange={(e) => setVarOfficialId(e.target.value)}
                disabled={selectedPhase?.name === 'Fase Uno' && selectedSeries?.slug === 'serie-a'} // Option locked if phase doesn't support
              >
                <option value="">No habilitado para este encuentro</option>
                {varOfficials.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
