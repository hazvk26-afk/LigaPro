import React, { useState, useEffect } from 'react';
import { getClubs, getPhases, clearMatchesByPhase, upsertMatch } from '../services/db';
import { Club, Phase, Match } from '../types';

export const GeneradorFixtures: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<'series-a' | 'series-b'>('series-a');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-08-07T18:00');
  const [legsCount, setLegsCount] = useState<number>(2); // Defaults to 2 legs for Serie B (18 rounds), 1 for Serie A (15 rounds)
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [previewMatches, setPreviewMatches] = useState<{ round: number; home: string; away: string }[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch phases and clubs
  const loadInitialData = async () => {
    try {
      const allPhases = (await getPhases()).filter(p => p.series_id === selectedSeries);
      setPhases(allPhases);
      if (allPhases.length > 0) {
        setSelectedPhaseId(allPhases[0].id);
      }
      
      const allClubs = (await getClubs()).filter(c => c.series_id === selectedSeries && c.is_enabled);
      setClubs(allClubs);
      
      // Default legs configuration
      if (selectedSeries === 'series-a') {
        setLegsCount(1);
      } else {
        setLegsCount(2);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedSeries]);

  // Round Robin Circle Method algorithm
  const generateRounds = (teamList: Club[], legs: number) => {
    if (teamList.length < 2) return [];
    
    // Add dummy team if odd
    let teams = [...teamList];
    const isOdd = teams.length % 2 !== 0;
    if (isOdd) {
      // For this implementation, we skip dummy matchups (bye weeks)
      // Normally, one team rests. We'll handle this by assigning rest weeks if odd.
    }

    const numTeams = teams.length;
    const roundsPerLeg = numTeams - 1;
    const half = numTeams / 2;
    const schedule: { round: number; home: Club; away: Club }[] = [];

    const list = [...teams];

    for (let leg = 0; leg < legs; leg++) {
      for (let r = 0; r < roundsPerLeg; r++) {
        const currentRoundNum = (leg * roundsPerLeg) + r + 1;
        
        for (let i = 0; i < half; i++) {
          const home = list[i];
          const away = list[numTeams - 1 - i];
          
          // Alternar localía en vueltas impares
          const isReversed = (leg % 2 === 1);
          if ((r % 2 === 0 && !isReversed) || (r % 2 === 1 && isReversed)) {
            schedule.push({ round: currentRoundNum, home, away });
          } else {
            schedule.push({ round: currentRoundNum, home: away, away: home });
          }
        }
        // Rotate (keep first element locked)
        list.splice(1, 0, list.pop()!);
      }
    }

    return schedule;
  };

  // Preview matches whenever selections change
  useEffect(() => {
    const activeClubs = clubs.filter(c => c.series_id === selectedSeries);
    const rounds = generateRounds(activeClubs, legsCount);
    setPreviewMatches(
      rounds.map(g => ({
        round: g.round,
        home: g.home.short_name,
        away: g.away.short_name
      }))
    );
  }, [clubs, selectedSeries, legsCount]);

  const handleGenerate = async () => {
    if (!selectedPhaseId) {
      setStatusMessage({ type: 'error', text: 'Por favor seleccione una fase del campeonato.' });
      return;
    }

    const activeClubs = clubs.filter(c => c.series_id === selectedSeries);
    if (activeClubs.length < 2) {
      setStatusMessage({ type: 'error', text: 'Debe registrar al menos 2 clubes en esta serie antes de generar el fixture.' });
      return;
    }

    const confirmGen = window.confirm(
      '¡ADVERTENCIA! Esta acción borrará permanentemente todos los partidos que estén programados actualmente para esta Fase y Serie en la base de datos de Supabase, para reemplazarlos con el nuevo fixture. ¿Desea continuar?'
    );
    if (!confirmGen) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Clear existing matches for this phase
      await clearMatchesByPhase(selectedSeries, selectedPhaseId);

      // 2. Generate new match structures
      const roundMatches = generateRounds(activeClubs, legsCount);
      const startDateTime = new Date(startDate);

      // Spacings by weekend
      const seriesAHours = [
        { dayOffset: 0, time: '19:00' }, // Fri
        { dayOffset: 1, time: '13:00' }, // Sat
        { dayOffset: 1, time: '15:30' },
        { dayOffset: 1, time: '18:00' },
        { dayOffset: 2, time: '13:00' }, // Sun
        { dayOffset: 2, time: '15:30' },
        { dayOffset: 2, time: '18:00' },
        { dayOffset: 3, time: '19:00' }  // Mon
      ];

      const seriesBHours = [
        { dayOffset: 1, time: '11:00' }, // Sat
        { dayOffset: 1, time: '14:00' },
        { dayOffset: 2, time: '11:00' }, // Sun
        { dayOffset: 2, time: '14:00' },
        { dayOffset: -2, time: '19:30' } // Wed
      ];

      const hoursConfig = selectedSeries === 'series-a' ? seriesAHours : seriesBHours;

      // Track game indices to loop over the hoursConfig per round
      const roundGameCounters: Record<number, number> = {};

      const insertPromises = roundMatches.map(async (item) => {
        const rNum = item.round;
        if (roundGameCounters[rNum] === undefined) {
          roundGameCounters[rNum] = 0;
        }

        const gameIndex = roundGameCounters[rNum];
        roundGameCounters[rNum]++;

        const timeSetup = hoursConfig[gameIndex % hoursConfig.length];
        
        // Calculate round date (each round is 1 week later)
        const roundDate = new Date(startDateTime);
        roundDate.setDate(startDateTime.getDate() + ((rNum - 1) * 7));
        
        // Apply match offset inside the round week
        roundDate.setDate(roundDate.getDate() + timeSetup.dayOffset);
        
        const isoString = roundDate.toISOString().split('T')[0] + 'T' + timeSetup.time + ':00-05:00';

        const match: Match = {
          id: crypto.randomUUID(),
          series_id: selectedSeries,
          phase_id: selectedPhaseId,
          matchday: rNum,
          home_club_id: item.home.id,
          away_club_id: item.away.id,
          stadium_id: item.home.home_stadium_id, // Default to home stadium
          scheduled_at: isoString,
          status: 'scheduled',
          unified_kickoff: false,
          home_score: null,
          away_score: null,
          home_score_penalties: null,
          away_score_penalties: null
        };

        const res = await upsertMatch(match);
        if (res.error) throw res.error;
      });

      // Wait for all inserts
      await Promise.all(insertPromises);

      setStatusMessage({ 
        type: 'success', 
        text: `¡Éxito! Fixture generado correctamente con ${roundMatches.length} partidos divididos en ${Math.max(...roundMatches.map(m=>m.round))} jornadas.` 
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar el fixture en Supabase.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-md space-y-md overflow-y-auto max-h-[90vh] pr-1">
      {/* Header */}
      <div>
        <h2 className="font-montserrat text-headline-lg font-extrabold uppercase italic tracking-tighter text-brand-primary">
          Generador de Fixtures
        </h2>
        <p className="font-barlow text-body-lg text-brand-on-surface-variant/80">
          Herramienta automática para calendarizar partidos basados en la fórmula de Round-Robin oficial de la LigaPro.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-md rounded-xl border flex items-center gap-sm ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="material-symbols-outlined">
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-sm font-bold font-barlow">{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
        {/* Configuration panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-brand-outline-variant/30 p-md shadow-sm space-y-md">
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-brand-outline-variant/20 pb-xs">
            Configuración
          </h3>

          <div className="space-y-xs">
            <label className="font-barlow font-bold text-xs uppercase text-brand-outline">División (Serie)</label>
            <div className="bg-brand-surface-container p-xs rounded-xl flex gap-xs">
              <button 
                className={`flex-1 py-base px-md rounded-lg font-label-bold text-xs tracking-wider transition-all ${
                  selectedSeries === 'series-a' 
                    ? 'bg-brand-primary text-white shadow-sm font-bold' 
                    : 'text-brand-on-surface-variant hover:bg-brand-surface-highest'
                }`}
                onClick={() => setSelectedSeries('series-a')}
              >
                SERIE A
              </button>
              <button 
                className={`flex-1 py-base px-md rounded-lg font-label-bold text-xs tracking-wider transition-all ${
                  selectedSeries === 'series-b' 
                    ? 'bg-brand-primary text-white shadow-sm font-bold' 
                    : 'text-brand-on-surface-variant hover:bg-brand-surface-highest'
                }`}
                onClick={() => setSelectedSeries('series-b')}
              >
                SERIE B
              </button>
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Fase de Torneo</label>
            <select
              value={selectedPhaseId}
              onChange={e => setSelectedPhaseId(e.target.value)}
              className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
            >
              {phases.map(ph => (
                <option key={ph.id} value={ph.id}>{ph.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-xs">
            <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Fecha de Inicio de Primera Jornada</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
            />
          </div>

          <div className="space-y-xs">
            <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Estructura de Ruedas / Vueltas</label>
            <select
              value={legsCount}
              disabled={selectedSeries === 'series-a'}
              onChange={e => setLegsCount(parseInt(e.target.value))}
              className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md disabled:opacity-60"
            >
              <option value="1">1 Vuelta (Sencilla)</option>
              <option value="2">2 Vueltas (Ida y Vuelta)</option>
              <option value="4">4 Vueltas (Doble Ida y Vuelta - Serie B Oficial)</option>
            </select>
            {selectedSeries === 'series-a' && (
              <span className="text-[10px] text-brand-on-surface-variant/80 block mt-1">
                * La Serie A se organiza en fases semestrales de 1 sola vuelta de forma reglamentaria.
              </span>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-sm text-xs font-barlow">
            <p className="font-bold flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">warning</span> ADVERTENCIA
            </p>
            <p className="mt-1">
              Al hacer clic en "Generar Fixture", se eliminarán todos los partidos existentes en esta fase y división de forma irreversible.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-xs bg-brand-secondary-container hover:bg-brand-secondary text-brand-on-secondary-container font-extrabold uppercase py-3 rounded-lg font-label-bold text-xs tracking-wider transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-brand-primary"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">sync</span>
                Generar Fixture en Supabase
              </>
            )}
          </button>
        </div>

        {/* Live Preview List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-outline-variant/30 p-md shadow-sm space-y-sm">
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-brand-outline-variant/20 pb-xs">
            Vista Previa de Emparejamientos ({previewMatches.length} partidos simulados)
          </h3>

          <div className="divide-y divide-brand-outline-variant/20 max-h-[500px] overflow-y-auto pr-1">
            {previewMatches.map((m, index) => (
              <div key={index} className="flex justify-between items-center py-sm text-xs font-barlow font-bold">
                <span className="text-brand-outline uppercase text-[10px]">Jornada {m.round}</span>
                <div className="flex items-center gap-sm">
                  <span className="text-right w-24 text-brand-primary uppercase">{m.home}</span>
                  <span className="text-brand-on-surface-variant font-normal">vs</span>
                  <span className="text-left w-24 text-brand-primary uppercase">{m.away}</span>
                </div>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[9px] uppercase font-label-bold">Auto</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
