import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, getClubs, getPhases, getStadiums } from '../services/db';
import { Match, Club, Phase, Stadium } from '../types';

export const Fixture: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<'series-a' | 'series-b'>('series-a');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);

  useEffect(() => {
    const fetchClubsAndStadiums = async () => {
      setClubs(await getClubs());
      setStadiums(await getStadiums());
    };
    fetchClubsAndStadiums();
  }, []);

  useEffect(() => {
    const fetchPhases = async () => {
      const allPhases = (await getPhases()).filter(p => p.series_id === selectedSeries);
      setPhases(allPhases);
      if (allPhases.length > 0) {
        setSelectedPhaseId(allPhases[0].id);
        setSelectedMatchday(1); // Reset matchday
      }
    };
    fetchPhases();
  }, [selectedSeries]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (selectedPhaseId) {
        const allMatches = (await getMatches()).filter(
          m => m.series_id === selectedSeries && 
               m.phase_id === selectedPhaseId && 
               m.matchday === selectedMatchday
        );
        setMatches(allMatches);
      }
    };
    fetchMatches();
  }, [selectedPhaseId, selectedMatchday, selectedSeries]);

  const getClub = (clubId: string) => clubs.find(c => c.id === clubId);
  const getStadium = (stadiumId: string) => stadiums.find(s => s.id === stadiumId);

  const formatMatchTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' hs';
  };

  const formatMatchDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  // Get max matchdays for phase
  const maxMatchdays = selectedSeries === 'series-a' ? 15 : 36;
  const matchdayNumbers = Array.from({ length: maxMatchdays }, (_, i) => i + 1);

  return (
    <div className="py-md space-y-md">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h2 className="font-montserrat text-headline-lg font-extrabold uppercase italic tracking-tighter text-brand-primary">
          Fixture y Resultados
        </h2>
        <p className="font-barlow text-body-lg text-brand-on-surface-variant/80">
          Calendario completo de encuentros del campeonato nacional ecuatoriano.
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col gap-sm bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm">
        <div className="flex flex-col md:flex-row gap-sm justify-between items-center">
          {/* Series Selection */}
          <div className="bg-brand-surface-container p-xs rounded-xl flex gap-xs w-full md:w-64">
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

          {/* Phase Selection */}
          <div className="flex gap-xs w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`py-base px-md rounded-lg font-label-bold text-xs tracking-wider uppercase shrink-0 transition-all ${
                  selectedPhaseId === phase.id
                    ? 'bg-brand-secondary-container text-brand-on-secondary-container font-bold shadow-sm'
                    : 'text-brand-on-surface-variant hover:bg-brand-surface-container'
                }`}
              >
                {phase.name}
              </button>
            ))}
          </div>
        </div>

        {/* Matchday slider */}
        <div className="border-t border-brand-outline-variant/20 pt-md">
          <label className="font-barlow font-bold text-xs uppercase text-brand-outline block mb-xs">Seleccionar Jornada</label>
          <div className="flex gap-xs overflow-x-auto pb-2 scrollbar-hide">
            {matchdayNumbers.map(num => (
              <button
                key={num}
                onClick={() => setSelectedMatchday(num)}
                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg font-montserrat font-bold text-xs transition-all ${
                  selectedMatchday === num
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-surface-container text-brand-on-surface hover:bg-brand-surface-highest'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-sm">
        {matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-brand-on-surface-variant/40 mb-xs">event_busy</span>
            <p className="font-montserrat text-sm font-bold text-brand-primary">No hay partidos programados para esta fecha</p>
            <p className="font-barlow text-xs text-brand-on-surface-variant/75 mt-xs">Use el panel administrativo para generar el fixture</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {matches.map(match => {
              const home = getClub(match.home_club_id);
              const away = getClub(match.away_club_id);
              const stad = getStadium(match.stadium_id);
              
              let statusBorder = 'border-brand-primary';
              let statusText = 'Finalizado';
              if (match.status === 'live') {
                statusBorder = 'border-green-500';
                statusText = 'En Vivo';
              } else if (match.status === 'scheduled') {
                statusBorder = 'border-brand-secondary-container';
                statusText = 'Programado';
              } else if (match.status === 'suspended') {
                statusBorder = 'border-brand-tertiary';
                statusText = 'Suspendido';
              }
              
              return (
                <div 
                  key={match.id}
                  onClick={() => navigate(`/partidos/${match.id}`)}
                  className={`bg-white rounded-xl border-t-4 ${statusBorder} shadow-sm p-md flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer`}
                >
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase">
                      Jornada {match.matchday}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      match.status === 'live' ? 'bg-green-50 text-green-700 animate-pulse' :
                      match.status === 'finished' ? 'bg-brand-surface-container text-brand-primary' :
                      'bg-brand-secondary-container/20 text-brand-secondary'
                    }`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 items-center text-center py-sm">
                    {/* Home */}
                    <div className="flex flex-col items-center gap-xs">
                      <img className="w-12 h-12 object-contain" src={home?.crest_url} alt="" />
                      <span className="text-xs font-bold uppercase truncate max-w-[90px]">{home?.short_name}</span>
                    </div>

                    {/* Middle Score or Time */}
                    <div className="flex flex-col items-center justify-center">
                      {match.status === 'finished' || match.status === 'live' ? (
                        <div className="font-montserrat text-stats-number text-2xl text-brand-primary font-extrabold">
                          {match.home_score} - {match.away_score}
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="font-montserrat text-xs font-bold text-brand-primary block">{formatMatchTime(match.scheduled_at)}</span>
                          <span className="text-[9px] uppercase tracking-tighter text-brand-on-surface-variant block mt-0.5">{formatMatchDate(match.scheduled_at).split(',')[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex flex-col items-center gap-xs">
                      <img className="w-12 h-12 object-contain" src={away?.crest_url} alt="" />
                      <span className="text-xs font-bold uppercase truncate max-w-[90px]">{away?.short_name}</span>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="text-[10px] text-brand-on-surface-variant border-t border-brand-outline-variant/20 pt-sm mt-sm flex justify-between">
                    <span>{stad?.name}</span>
                    <span>{stad?.city}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
