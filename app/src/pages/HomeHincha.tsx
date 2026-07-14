import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, getClubs, calculateStandings, getPhases } from '../services/db';
import { Match, Club, Standing } from '../types';

export const HomeHincha: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<'series-a' | 'series-b'>('series-a');
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);

  useEffect(() => {
    // Load dynamic data from DB
    const allMatches = getMatches().filter(m => m.series_id === selectedSeries);
    const allClubs = getClubs();
    setMatches(allMatches);
    setClubs(allClubs);

    // Get active phase for series to compute standings
    const phase = getPhases().find((p) => p.series_id === selectedSeries && p.phase_order === 1);
    if (phase) {
      const computed = calculateStandings(selectedSeries, phase.id);
      setStandings(computed.slice(0, 5)); // show top 5
    }
  }, [selectedSeries]);

  const getClubDetails = (clubId: string) => {
    return clubs.find(c => c.id === clubId);
  };

  const formatMatchTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' hs';
  };

  const formatMatchDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  // Split matches into Live, Finished, and Scheduled
  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const scheduledMatches = matches.filter(m => m.status === 'scheduled');

  return (
    <div className="py-md space-y-md">
      {/* League Toggle */}
      <section className="flex justify-center">
        <div className="bg-brand-surface-container p-xs rounded-xl flex gap-xs w-full max-w-sm">
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
      </section>

      {/* Partidos en Vivo / Recientes Horizontal Slider */}
      <section className="space-y-sm">
        <h2 className="font-montserrat text-headline-md italic uppercase tracking-tighter border-l-4 border-brand-secondary pl-2 text-brand-primary">
          Partidos Destacados
        </h2>
        
        <div className="flex gap-md overflow-x-auto pb-4 hide-scrollbar snap-x">
          {/* Live Matches First */}
          {liveMatches.map(match => {
            const home = getClubDetails(match.home_club_id);
            const away = getClubDetails(match.away_club_id);
            return (
              <div 
                key={match.id}
                onClick={() => navigate(`/partidos/${match.id}`)}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-xl border-t-4 border-green-500 shadow-md p-md flex flex-col justify-between cursor-pointer snap-start hover:scale-[1.01] transition-transform"
              >
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En Vivo
                  </span>
                  <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded">64'</span>
                </div>
                
                <div className="grid grid-cols-3 items-center text-center py-xs">
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={home?.crest_url} alt={home?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{home?.short_name}</span>
                  </div>
                  <div className="font-montserrat text-stats-number text-2xl text-brand-primary font-extrabold">
                    {match.home_score} - {match.away_score}
                  </div>
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={away?.crest_url} alt={away?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{away?.short_name}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-brand-on-surface-variant text-center border-t border-brand-outline-variant/30 pt-sm mt-xs">
                  {home?.short_name} vs {away?.short_name} · Manta
                </div>
              </div>
            );
          })}

          {/* Scheduled Matches */}
          {scheduledMatches.map(match => {
            const home = getClubDetails(match.home_club_id);
            const away = getClubDetails(match.away_club_id);
            return (
              <div 
                key={match.id}
                onClick={() => navigate(`/partidos/${match.id}`)}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-xl border-t-4 border-brand-secondary-container shadow-md p-md flex flex-col justify-between cursor-pointer snap-start hover:scale-[1.01] transition-transform"
              >
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">
                    Programado
                  </span>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant bg-brand-surface-container px-2 py-0.5 rounded">
                    {formatMatchDate(match.scheduled_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 items-center text-center py-xs">
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={home?.crest_url} alt={home?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{home?.short_name}</span>
                  </div>
                  <div className="font-montserrat text-sm text-brand-on-surface-variant font-bold">
                    {formatMatchTime(match.scheduled_at)}
                  </div>
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={away?.crest_url} alt={away?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{away?.short_name}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-brand-on-surface-variant text-center border-t border-brand-outline-variant/30 pt-sm mt-xs">
                  Estadio Monumental · Guayaquil
                </div>
              </div>
            );
          })}

          {/* Finished Matches */}
          {finishedMatches.map(match => {
            const home = getClubDetails(match.home_club_id);
            const away = getClubDetails(match.away_club_id);
            return (
              <div 
                key={match.id}
                onClick={() => navigate(`/partidos/${match.id}`)}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-xl border-t-4 border-brand-primary shadow-md p-md flex flex-col justify-between cursor-pointer snap-start hover:scale-[1.01] transition-transform"
              >
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase">
                    Finalizado
                  </span>
                  <span className="text-[10px] font-bold text-brand-on-surface-variant bg-brand-surface-container px-2 py-0.5 rounded">
                    FT
                  </span>
                </div>
                
                <div className="grid grid-cols-3 items-center text-center py-xs">
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={home?.crest_url} alt={home?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{home?.short_name}</span>
                  </div>
                  <div className="font-montserrat text-stats-number text-2xl text-brand-primary font-extrabold">
                    {match.home_score} - {match.away_score}
                  </div>
                  <div className="flex flex-col items-center gap-xs">
                    <img className="w-10 h-10 object-contain" src={away?.crest_url} alt={away?.name} />
                    <span className="text-xs font-bold uppercase truncate max-w-[80px]">{away?.short_name}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-brand-on-surface-variant text-center border-t border-brand-outline-variant/30 pt-sm mt-xs">
                  Fin del encuentro · Reporte Oficial
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Content Split: Mini Standings & News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* News Section */}
        <section className="lg:col-span-2 space-y-sm">
          <h2 className="font-montserrat text-headline-md italic uppercase tracking-tighter border-l-4 border-brand-secondary pl-2 text-brand-primary">
            Últimas Noticias
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Main News Card */}
            <div className="bg-white rounded-xl shadow border border-brand-outline-variant/30 overflow-hidden md:col-span-2 flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-shadow">
              <div className="md:w-1/2 h-48 md:h-auto bg-brand-primary-container relative">
                <img 
                  className="w-full h-full object-cover opacity-60" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY3qhgcdiKaffTfJrpEJB0Aq-fG1r3VFWSDmb-KjkQt8tKAgjU853F7Da7-6jpccSx5DFHBbzc44WpmKy9PovlbQ6FlSmUCV1mHx6JurSdna27R2zPWhA9EoXLv9hLZd577h1wKoS9Zm0Z5kFCYYOWQiyEHoV5jZc2IS_kT-njrm5gbYfhAHsNbUJFTrupkavvAVAukEkn4Vy8FtUGf3xZV8IXrNQ5Gpbdr-OrnnFPvoaOEfsfBg6zWA" 
                  alt="Stadium" 
                />
                <span className="absolute bottom-3 left-3 bg-brand-secondary-container text-brand-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded">
                  REGLAMENTO
                </span>
              </div>
              <div className="p-md flex flex-col justify-between md:w-1/2">
                <div className="space-y-xs">
                  <span className="text-[10px] text-brand-on-surface-variant font-bold">14 DE JULIO, 2026</span>
                  <h3 className="font-montserrat text-headline-md text-brand-primary font-bold leading-tight">
                    Dirección de Competiciones confirma ventanas del reglamento para el fixture
                  </h3>
                  <p className="font-barlow text-body-md text-brand-on-surface-variant/80">
                    Se ratifica la obligatoriedad de notificar la programación con 15 días de anticipación y el bloqueo de fechas FIFA para garantizar la equidad competitiva.
                  </p>
                </div>
                <div className="flex items-center gap-xs text-xs text-brand-secondary font-bold mt-md">
                  <span>LEER MÁS</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>

            {/* Small News Card 1 */}
            <div className="bg-white rounded-xl shadow border border-brand-outline-variant/30 p-md flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-xs">
                <span className="text-[10px] text-brand-on-surface-variant font-bold">12 DE JULIO, 2026</span>
                <h4 className="font-montserrat text-sm font-bold text-brand-primary">
                  Independiente del Valle lidera la clasificación general tras el reinicio de la Copa
                </h4>
                <p className="font-barlow text-xs text-brand-on-surface-variant/75">
                  El equipo rayado del valle afianza su gran rendimiento y prepara su regreso a la LigaPro en la Fase Dos.
                </p>
              </div>
              <div className="text-xs text-brand-secondary font-bold mt-sm flex items-center gap-xs">
                <span>VER DETALLES</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Small News Card 2 */}
            <div className="bg-white rounded-xl shadow border border-brand-outline-variant/30 p-md flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-xs">
                <span className="text-[10px] text-brand-on-surface-variant font-bold">10 DE JULIO, 2026</span>
                <h4 className="font-montserrat text-sm font-bold text-brand-primary">
                  Comisión Disciplinaria emite acta oficial de multas acumuladas
                </h4>
                <p className="font-barlow text-xs text-brand-on-surface-variant/75">
                  Revisa el listado de jugadores y clubes amonestados en la última fecha del campeonato ecuatoriano.
                </p>
              </div>
              <div className="text-xs text-brand-secondary font-bold mt-sm flex items-center gap-xs">
                <span>DESCARGAR ACTA</span>
                <span className="material-symbols-outlined text-sm">download</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Standings Section */}
        <section className="space-y-sm">
          <div className="flex justify-between items-end border-l-4 border-brand-secondary pl-2">
            <h2 className="font-montserrat text-headline-md italic uppercase tracking-tighter text-brand-primary">
              Tabla Posiciones
            </h2>
            <button 
              onClick={() => navigate('/tabla-posiciones')}
              className="text-xs font-bold text-brand-secondary hover:underline uppercase"
            >
              Ver Completa
            </button>
          </div>

          <div className="bg-white rounded-xl shadow border border-brand-outline-variant/30 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase">
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-2">Club</th>
                  <th className="py-2.5 px-2 text-center">PJ</th>
                  <th className="py-2.5 px-2 text-center">DG</th>
                  <th className="py-2.5 px-2 text-center">PTS</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-brand-outline-variant/30">
                {standings.map((row) => {
                  const club = getClubDetails(row.club_id);
                  let zoneClass = '';
                  if (row.zone === 'qualification_final_phase' || row.zone === 'libertadores') {
                    zoneClass = 'border-l-4 border-green-500';
                  } else if (row.zone === 'sudamericana') {
                    zoneClass = 'border-l-4 border-blue-500';
                  } else if (row.zone === 'relegation') {
                    zoneClass = 'border-l-4 border-red-500';
                  }
                  
                  return (
                    <tr key={row.club_id} className={`hover:bg-brand-surface-low transition-colors ${zoneClass}`}>
                      <td className="py-2 px-3 text-center font-bold text-brand-primary">{row.position}</td>
                      <td className="py-2 px-2 flex items-center font-bold text-brand-primary gap-xs">
                        <img className="w-5 h-5 object-contain" src={club?.crest_url} alt="" />
                        <span className="truncate max-w-[120px]">{club?.short_name}</span>
                      </td>
                      <td className="py-2 px-2 text-center text-brand-on-surface-variant">{row.played}</td>
                      <td className="py-2 px-2 text-center text-brand-on-surface-variant font-medium">
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                      </td>
                      <td className="py-2 px-2 text-center font-extrabold text-brand-primary">{row.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
