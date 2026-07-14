import React, { useState, useEffect } from 'react';
import { getClubs, getPhases, calculateStandings } from '../services/db';
import { Club, Standing, Phase } from '../types';

export const TablaPosiciones: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<'series-a' | 'series-b'>('series-a');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [standings, setStandings] = useState<Standing[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      const allClubs = await getClubs();
      setClubs(allClubs);
    };
    fetchClubs();
  }, []);

  useEffect(() => {
    const fetchPhases = async () => {
      const allPhases = (await getPhases()).filter(p => p.series_id === selectedSeries);
      setPhases(allPhases);
      if (allPhases.length > 0) {
        setSelectedPhaseId(allPhases[0].id);
      }
    };
    fetchPhases();
  }, [selectedSeries]);

  useEffect(() => {
    const fetchStandings = async () => {
      if (selectedPhaseId) {
        const computed = await calculateStandings(selectedSeries, selectedPhaseId);
        setStandings(computed);
      }
    };
    fetchStandings();
  }, [selectedPhaseId, selectedSeries]);

  const getClubDetails = (clubId: string) => {
    return clubs.find(c => c.id === clubId);
  };

  const getZoneBadge = (zone: Standing['zone']) => {
    switch (zone) {
      case 'qualification_final_phase':
        return <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase">Final / Ascenso</span>;
      case 'libertadores':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">Libertadores</span>;
      case 'sudamericana':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">Sudamericana</span>;
      case 'relegation':
        return <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase">Descenso</span>;
      default:
        return null;
    }
  };

  const getZoneBorderClass = (zone: Standing['zone']) => {
    switch (zone) {
      case 'qualification_final_phase':
      case 'libertadores':
        return 'border-l-4 border-green-500';
      case 'sudamericana':
        return 'border-l-4 border-blue-500';
      case 'relegation':
        return 'border-l-4 border-red-500';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  return (
    <div className="py-md space-y-md">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h2 className="font-montserrat text-headline-lg font-extrabold uppercase italic tracking-tighter text-brand-primary">
          Tabla de Posiciones Oficial
        </h2>
        <p className="font-barlow text-body-lg text-brand-on-surface-variant/80">
          Clasificación general de la temporada 2026. Criterios de desempate automáticos según reglamento.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-col md:flex-row gap-sm justify-between items-center bg-white p-sm rounded-xl border border-brand-outline-variant/30 shadow-sm">
        {/* Series Selector */}
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

        {/* Phase Selector */}
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
          {/* Accumulated tab (only for Serie A) */}
          {selectedSeries === 'series-a' && (
            <button
              onClick={() => setSelectedPhaseId('acumulada')}
              className={`py-base px-md rounded-lg font-label-bold text-xs tracking-wider uppercase shrink-0 transition-all ${
                selectedPhaseId === 'acumulada'
                  ? 'bg-brand-secondary-container text-brand-on-secondary-container font-bold shadow-sm'
                  : 'text-brand-on-surface-variant hover:bg-brand-surface-container'
              }`}
            >
              Tabla Acumulada
            </button>
          )}
        </div>
      </div>

      {/* Main Standings Table */}
      <div className="bg-white rounded-xl shadow border border-brand-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-brand-primary text-white text-[11px] font-bold tracking-widest uppercase">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-3">Club</th>
                <th className="py-3 px-3 text-center w-14">PJ</th>
                <th className="py-3 px-3 text-center w-14">PG</th>
                <th className="py-3 px-3 text-center w-14">PE</th>
                <th className="py-3 px-3 text-center w-14">PP</th>
                <th className="py-3 px-3 text-center w-16">GF</th>
                <th className="py-3 px-3 text-center w-16">GC</th>
                <th className="py-3 px-3 text-center w-16">GD</th>
                <th className="py-3 px-3 text-center w-16">PTS</th>
                <th className="py-3 px-4 text-right w-40">Zona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline-variant/30 text-sm font-medium">
              {standings.map((row) => {
                const club = getClubDetails(row.club_id);
                return (
                  <tr 
                    key={row.club_id} 
                    className={`hover:bg-brand-surface-low transition-colors ${getZoneBorderClass(row.zone)}`}
                  >
                    <td className="py-3 px-4 text-center font-bold text-brand-primary">{row.position}</td>
                    <td className="py-3 px-3 flex items-center font-bold text-brand-primary gap-sm">
                      <img className="w-6 h-6 object-contain" src={club?.crest_url} alt="" />
                      <span>{club?.name}</span>
                      {club?.is_filial && (
                        <span className="text-[9px] bg-brand-surface-highest text-brand-on-surface-variant px-1 rounded ml-1 uppercase">Filial</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.played}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.won}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.drawn}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.lost}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.goals_for}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant font-normal">{row.goals_against}</td>
                    <td className="py-3 px-3 text-center text-brand-on-surface-variant">
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-brand-primary">{row.points}</td>
                    <td className="py-3 px-4 text-right">{getZoneBadge(row.zone)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Rules */}
      <section className="bg-brand-surface-container/50 border border-brand-outline-variant/30 rounded-xl p-md grid grid-cols-1 md:grid-cols-2 gap-md">
        <div>
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary mb-sm">Zonas de Clasificación</h3>
          <div className="space-y-xs text-xs font-bold">
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
              <span className="text-brand-on-surface-variant">Clasificación a la Final del Campeonato (Serie A) / Ascenso a Serie A (Serie B)</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
              <span className="text-brand-on-surface-variant">Copa Conmebol Libertadores (Tabla Acumulada)</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
              <span className="text-brand-on-surface-variant">Copa Conmebol Sudamericana (Tabla Acumulada)</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
              <span className="text-brand-on-surface-variant">Zona de Descenso Directo</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary mb-sm">Criterios Reglamentarios (Art. 9/10)</h3>
          <p className="font-barlow text-xs text-brand-on-surface-variant/80">
            En caso de igualdad de puntos, se aplican los siguientes desempates en orden: 
            1° Diferencia de goles; 
            2° Mayor cantidad de goles marcados; 
            3° Goles de visitante (solo en Tabla Acumulada); 
            4° Resultados en enfrentamiento directo; 
            5° Sorteo oficial.
          </p>
        </div>
      </section>
    </div>
  );
};
