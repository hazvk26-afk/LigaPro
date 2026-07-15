import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClubs, getSanctions, getOfficials, getStadiums, getMatches, calculateStandings, getPhases } from '../services/db';
import { Club, DisciplinarySanction, Official, Stadium, Match, Standing } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clubsCount, setClubsCount] = useState(0);
  const [sanctionsCount, setSanctionsCount] = useState(0);
  const [officialsCount, setOfficialsCount] = useState(0);
  const [stadiumsCount, setStadiumsCount] = useState(0);
  
  const [criticalAlerts, setCriticalAlerts] = useState<{ id: string; title: string; desc: string; type: 'error' | 'warning' | 'info'; actionLabel?: string; path?: string }[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Core Counts
      const allClubs = await getClubs();
      setClubs(allClubs);
      setClubsCount(allClubs.length);
      
      const allSanctions = await getSanctions();
      setSanctionsCount(allSanctions.filter(s => s.status === 'active').length);
      
      const allOfficials = await getOfficials();
      setOfficialsCount(allOfficials.length);
      
      const allStadiums = await getStadiums();
      setStadiumsCount(allStadiums.filter(s => s.is_qualified).length);

      // 2. Live & Upcoming Matches
      const allMatches = await getMatches();
      setLiveMatches(allMatches.filter(m => m.status === 'live'));
      
      const scheduled = allMatches
        .filter(m => m.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
      setUpcomingMatches(scheduled.slice(0, 5));

      // 3. Standings (Top 5 Serie A)
      const allPhases = await getPhases();
      const phase = allPhases.find((p) => p.series_id === 'series-a' && p.phase_order === 1);
      if (phase) {
        const computed = await calculateStandings('series-a', phase.id);
        setStandings(computed.slice(0, 5));
      }

      // 4. Critical Alerts Logic (Based on LIGAPRO regulations)
      const alertsList: typeof criticalAlerts = [];

      // Alert A: Matches without referee
      const noRefMatches = allMatches.filter(m => m.status === 'scheduled' && !m.referee_id);
      if (noRefMatches.length > 0) {
        alertsList.push({
          id: 'alert-no-refs',
          title: `${noRefMatches.length} Partidos sin árbitros designados`,
          desc: `Fase Uno | Límite de reglamento: designación 48 horas antes de la jornada.`,
          type: 'error',
          actionLabel: 'Asignar Árbitros',
          path: `/admin/partidos/${noRefMatches[0].id}/editar`
        });
      }

      // Alert B: Stadiums VAR requirements for Fase Dos
      const noVarStadiums = allStadiums.filter(s => !s.var_infrastructure_ok);
      if (noVarStadiums.length > 0) {
        alertsList.push({
          id: 'alert-no-var',
          title: `${noVarStadiums.length} Estadios sin certificación VAR`,
          desc: `La infraestructura VAR es obligatoria para todos los estadios en la Fase Dos de Serie A.`,
          type: 'warning',
          actionLabel: 'Revisar Estadios',
          path: `/admin`
        });
      }

      // Alert C: Rules violations warnings (15 days notice check - RN-14)
      const ruleViolations = allMatches.filter(m => {
        if (m.status !== 'scheduled' || !m.notified_at) return false;
        const mDate = new Date(m.scheduled_at);
        const nDate = new Date(m.notified_at);
        const diff = (mDate.getTime() - nDate.getTime()) / (1000 * 3600 * 24);
        return diff < 15;
      });

      if (ruleViolations.length > 0) {
        alertsList.push({
          id: 'alert-notif-notice',
          title: `${ruleViolations.length} Programaciones fuera de ventana reglamentaria`,
          desc: `Notificación enviada con menos de 15 días de anticipación (Art. 25).`,
          type: 'warning',
          actionLabel: 'Ajustar Calendario',
          path: `/admin/partidos/${ruleViolations[0].id}/editar`
        });
      }

      setCriticalAlerts(alertsList);
    };
    fetchAdminData();
  }, []);

  const getClub = (id: string) => clubs.find(c => c.id === id);

  return (
    <div className="space-y-gutter">
      {/* Quick Action Hero Banner */}
      <section>
        <button 
          onClick={() => navigate('/admin/partidos/nuevo')}
          className="group w-full relative overflow-hidden bg-brand-primary-container p-lg rounded-xl flex items-center justify-between text-white shadow-lg active:scale-[0.99] transition-all hover:bg-brand-primary cursor-pointer border border-brand-outline-variant/10"
        >
          <div className="relative z-10 flex items-center space-x-6">
            <div className="w-16 h-16 bg-brand-secondary-container rounded-full flex items-center justify-center text-brand-primary group-hover:rotate-12 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_add_on
              </span>
            </div>
            <div className="text-left">
              <h2 className="font-montserrat text-headline-lg uppercase italic tracking-tighter font-extrabold">
                PROGRAMAR NUEVO PARTIDO
              </h2>
              <p className="font-barlow text-body-lg text-brand-on-primary-container opacity-80 mt-1">
                Gestión de fixture para Serie A y Serie B conforme al Reglamento de Competiciones.
              </p>
            </div>
          </div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-5xl opacity-30 group-hover:opacity-100 transition-opacity">
              chevron_right
            </span>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary-container rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </button>
      </section>

      {/* Stats Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Card 1 */}
        <div className="bg-white p-md border border-brand-outline-variant/30 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-brand-primary p-2 bg-brand-primary-container/10 rounded">groups</span>
            <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Serie A/B</span>
          </div>
          <div className="mt-4">
            <p className="font-montserrat text-stats-number text-3xl font-extrabold text-brand-primary">{clubsCount}</p>
            <p className="font-barlow font-bold text-xs text-brand-on-surface-variant uppercase mt-1">Clubes Registrados</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-md border border-brand-outline-variant/30 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-brand-error p-2 bg-brand-error-container/20 rounded">warning</span>
            <span className="text-[10px] font-bold text-brand-error uppercase">Tribunal</span>
          </div>
          <div className="mt-4">
            <p className="font-montserrat text-stats-number text-3xl font-extrabold text-brand-primary">{sanctionsCount}</p>
            <p className="font-barlow font-bold text-xs text-brand-on-surface-variant uppercase mt-1">Sanciones Activas</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-md border border-brand-outline-variant/30 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-brand-secondary p-2 bg-brand-secondary-container/20 rounded">sports</span>
            <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Cuerpo</span>
          </div>
          <div className="mt-4">
            <p className="font-montserrat text-stats-number text-3xl font-extrabold text-brand-primary">{officialsCount}</p>
            <p className="font-barlow font-bold text-xs text-brand-on-surface-variant uppercase mt-1">Oficiales Calificados</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-md border border-brand-outline-variant/30 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-brand-primary p-2 bg-brand-primary-container/10 rounded" style={{ fontVariationSettings: "'FILL' 1" }}>stadium</span>
            <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Infraestructura</span>
          </div>
          <div className="mt-4">
            <p className="font-montserrat text-stats-number text-3xl font-extrabold text-brand-primary">{stadiumsCount}</p>
            <p className="font-barlow font-bold text-xs text-brand-on-surface-variant uppercase mt-1">Escenarios Calificados</p>
          </div>
        </div>
      </section>

      {/* Alerts & Live Split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Critical Alerts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-brand-primary pb-2">
            <h3 className="font-montserrat text-headline-md font-bold uppercase italic tracking-tighter flex items-center text-brand-primary">
              <span className="material-symbols-outlined mr-2 text-brand-error">gavel</span>
              Panel de Alertas Críticas
            </h3>
            <span className="bg-brand-error text-white text-[10px] px-2 py-0.5 font-bold rounded">
              {criticalAlerts.length} ALERTA{criticalAlerts.length !== 1 && 'S'}
            </span>
          </div>

          <div className="space-y-3">
            {criticalAlerts.length === 0 ? (
              <div className="bg-white p-6 border-l-4 border-green-500 rounded-lg shadow-sm text-center">
                <p className="font-montserrat text-sm font-bold text-brand-primary">No se detectaron alertas operativas críticas</p>
                <p className="font-barlow text-xs text-brand-on-surface-variant/80 mt-1">El calendario cumple con la normativa vigente.</p>
              </div>
            ) : (
              criticalAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`bg-white p-4 border-l-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-sm shadow-sm ${
                    alert.type === 'error' ? 'border-brand-error' :
                    alert.type === 'warning' ? 'border-brand-secondary-container' : 'border-brand-primary'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      alert.type === 'error' ? 'bg-brand-error-container/20 text-brand-error' :
                      alert.type === 'warning' ? 'bg-brand-secondary-container/20 text-brand-secondary' : 'bg-brand-primary-container/10 text-brand-primary'
                    }`}>
                      <span className="material-symbols-outlined">
                        {alert.type === 'error' ? 'person_alert' :
                         alert.type === 'warning' ? 'warning' : 'description'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-brand-primary text-sm md:text-base">{alert.title}</p>
                      <p className="text-xs md:text-sm text-brand-on-surface-variant">{alert.desc}</p>
                    </div>
                  </div>
                  {alert.actionLabel && alert.path && (
                    <button 
                      onClick={() => navigate(alert.path!)}
                      className="px-6 py-2 bg-brand-primary text-white font-label-bold uppercase text-[11px] hover:bg-brand-secondary-container hover:text-brand-on-secondary-container transition-all rounded shadow-sm self-end md:self-auto shrink-0"
                    >
                      {alert.actionLabel}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Match Tracking */}
        <div className="space-y-4">
          <h3 className="font-montserrat text-headline-md font-bold uppercase italic tracking-tighter border-b-2 border-brand-primary pb-2 flex items-center text-brand-primary">
            <span className="material-symbols-outlined mr-2 text-brand-secondary">live_tv</span>
            Seguimiento En Vivo
          </h3>

          <div className="space-y-3">
            {liveMatches.length === 0 ? (
              <div className="bg-white p-6 border-t-4 border-brand-outline-variant/30 rounded-lg shadow-sm text-center">
                <span className="material-symbols-outlined text-[32px] text-brand-on-surface-variant/30">sports</span>
                <p className="font-montserrat text-sm font-bold text-brand-primary mt-1">No hay partidos en juego en este momento</p>
                <p className="font-barlow text-xs text-brand-on-surface-variant/80 mt-1">Visite el centro de partidos para ver el calendario.</p>
              </div>
            ) : (
              liveMatches.map(match => {
                const home = getClub(match.home_club_id);
                const away = getClub(match.away_club_id);
                return (
                  <div 
                    key={match.id}
                    onClick={() => navigate(`/partidos/${match.id}`)}
                    className="bg-white overflow-hidden rounded-lg shadow-sm border-t-4 border-green-500 hover:scale-[1.01] transition-transform cursor-pointer"
                  >
                    <div className="bg-green-50 px-3 py-1 flex justify-between items-center">
                      <span className="text-[10px] font-black text-green-700 uppercase animate-pulse flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> EN VIVO
                      </span>
                      <span className="text-[10px] font-bold text-green-700">64'</span>
                    </div>
                    <div className="p-4 grid grid-cols-3 items-center text-center">
                      <div className="flex flex-col items-center gap-xs">
                        <img className="w-10 h-10 object-contain" src={home?.crest_url} alt="" />
                        <span className="text-xs font-bold uppercase truncate max-w-[80px]">{home?.short_name}</span>
                      </div>
                      <div className="font-montserrat text-stats-number text-xl text-brand-primary font-extrabold">{match.home_score} - {match.away_score}</div>
                      <div className="flex flex-col items-center gap-xs">
                        <img className="w-10 h-10 object-contain" src={away?.crest_url} alt="" />
                        <span className="text-xs font-bold uppercase truncate max-w-[80px]">{away?.short_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-4">
          <h3 className="font-montserrat text-headline-md font-bold uppercase italic tracking-tighter border-b-2 border-brand-primary pb-2 flex items-center text-brand-primary">
            <span className="material-symbols-outlined mr-2 text-brand-secondary">calendar_today</span>
            Próximos Partidos Programados
          </h3>

          <div className="space-y-3">
            {upcomingMatches.length === 0 ? (
              <div className="bg-white p-6 border-t-4 border-brand-outline-variant/30 rounded-lg shadow-sm text-center">
                <p className="font-montserrat text-sm font-bold text-brand-primary">No hay partidos programados</p>
                <p className="font-barlow text-xs text-brand-on-surface-variant/80 mt-1">Crea un nuevo partido arriba para comenzar.</p>
              </div>
            ) : (
              upcomingMatches.map(match => {
                const home = getClub(match.home_club_id);
                const away = getClub(match.away_club_id);
                const matchDate = new Date(match.scheduled_at).toLocaleDateString('es-EC', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div 
                    key={match.id}
                    onClick={() => navigate(`/admin/partidos/${match.id}/editar`)}
                    className="bg-white p-md border border-brand-outline-variant/30 rounded-lg shadow-sm hover:scale-[1.01] transition-transform cursor-pointer flex justify-between items-center text-xs font-barlow font-bold"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] text-brand-outline uppercase">Jornada {match.matchday}</span>
                      <span className="text-[10px] text-brand-on-surface-variant font-normal">{matchDate}</span>
                    </div>
                    <div className="flex items-center gap-xs text-brand-primary">
                      <span className="text-right w-16 truncate uppercase">{home?.short_name}</span>
                      <span className="text-brand-on-surface-variant font-normal">vs</span>
                      <span className="text-left w-16 truncate uppercase">{away?.short_name}</span>
                    </div>
                    <span className="material-symbols-outlined text-brand-outline text-sm">edit</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Mini Standings Card */}
      <section className="bg-white p-6 shadow-sm border border-brand-outline-variant/30 rounded-xl">
        <div className="flex items-center justify-between mb-4 border-b border-brand-outline-variant/20 pb-xs">
          <h3 className="font-montserrat text-headline-md font-bold uppercase italic tracking-tighter text-brand-primary">
            Tabla de Posiciones - Serie A (Fase Uno)
          </h3>
          <button 
            onClick={() => navigate('/tabla-posiciones')}
            className="text-brand-secondary font-bold text-xs hover:underline uppercase"
          >
            Ver Tabla Completa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-brand-primary text-white uppercase text-[10px] font-bold tracking-widest">
                <th className="py-2 px-3 w-12 text-center">#</th>
                <th className="py-2 px-3">Club</th>
                <th className="py-2 px-3 text-center">PJ</th>
                <th className="py-2 px-3 text-center">GD</th>
                <th className="py-2 px-3 text-center font-bold">PTS</th>
                <th className="py-2 px-3 text-right">ZONA</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-brand-outline-variant/20 font-medium">
              {standings.map((row) => {
                const club = getClub(row.club_id);
                let indicatorColor = 'border-l-4 border-transparent';
                if (row.zone === 'qualification_final_phase' || row.zone === 'libertadores') {
                  indicatorColor = 'border-l-4 border-green-500';
                } else if (row.zone === 'sudamericana') {
                  indicatorColor = 'border-l-4 border-blue-500';
                } else if (row.zone === 'relegation') {
                  indicatorColor = 'border-l-4 border-red-500';
                }

                return (
                  <tr key={row.club_id} className={`hover:bg-brand-surface-low transition-colors ${indicatorColor}`}>
                    <td className="py-2 px-3 text-center font-bold text-brand-primary">{row.position}</td>
                    <td className="py-2 px-3 flex items-center font-bold text-brand-primary gap-xs">
                      <img className="w-5 h-5 object-contain" src={club?.crest_url} alt="" />
                      <span>{club?.name}</span>
                    </td>
                    <td className="py-2 px-3 text-center text-brand-on-surface-variant font-normal">{row.played}</td>
                    <td className="py-2 px-3 text-center text-brand-on-surface-variant">
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td className="py-2 px-3 text-center font-extrabold text-brand-primary">{row.points}</td>
                    <td className="py-2 px-3 text-right">
                      {row.zone === 'qualification_final_phase' && (
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">Finalista</span>
                      )}
                      {row.zone === 'libertadores' && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Libertadores</span>
                      )}
                      {row.zone === 'sudamericana' && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Sudamericana</span>
                      )}
                      {row.zone === 'relegation' && (
                        <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">Descenso</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
