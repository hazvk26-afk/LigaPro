import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, getClubs, getStadiums, getOfficials, getEvents, getPlayers } from '../services/db';
import { Match, Club, Stadium, Official, MatchEvent, Player } from '../types';

export const DetallePartido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [homeClub, setHomeClub] = useState<Club | null>(null);
  const [awayClub, setAwayClub] = useState<Club | null>(null);
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [referee, setReferee] = useState<Official | null>(null);
  const [varOfficial, setVarOfficial] = useState<Official | null>(null);
  const [commissioner, setCommissioner] = useState<Official | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'lineups' | 'info'>('timeline');

  useEffect(() => {
    const fetchMatchDetails = async () => {
      const allMatches = await getMatches();
      const foundMatch = allMatches.find(m => m.id === id);
      if (!foundMatch) return;

      setMatch(foundMatch);

      const allClubs = await getClubs();
      setHomeClub(allClubs.find(c => c.id === foundMatch.home_club_id) || null);
      setAwayClub(allClubs.find(c => c.id === foundMatch.away_club_id) || null);

      const allStadiums = await getStadiums();
      setStadium(allStadiums.find(s => s.id === foundMatch.stadium_id) || null);

      const allOfficials = await getOfficials();
      setReferee(allOfficials.find(o => o.id === foundMatch.referee_id) || null);
      setVarOfficial(allOfficials.find(o => o.id === foundMatch.var_official_id) || null);
      setCommissioner(allOfficials.find(o => o.id === foundMatch.match_commissioner_id) || null);

      const allEvents = (await getEvents()).filter(e => e.match_id === foundMatch.id);
      // If no events in DB yet, use some static default ones for match-1 to make the page look premium
      if (allEvents.length === 0 && foundMatch.id === 'match-1') {
        const defaultEvents: MatchEvent[] = [
          { id: 'ev-1', match_id: foundMatch.id, player_id: 'LDU-a1', club_id: 'club-ldu', event_type: 'goal', minute: 24, extra_info: { penalty: false } },
          { id: 'ev-2', match_id: foundMatch.id, player_id: 'BSC-m2', club_id: 'club-barcelona', event_type: 'yellow_card', minute: 38 },
          { id: 'ev-3', match_id: foundMatch.id, player_id: 'BSC-a1', club_id: 'club-barcelona', event_type: 'goal', minute: 52 },
          { id: 'ev-4', match_id: foundMatch.id, player_id: 'LDU-d1', club_id: 'club-ldu', event_type: 'red_card', minute: 77 },
          { id: 'ev-5', match_id: foundMatch.id, player_id: 'LDU-m1', club_id: 'club-ldu', event_type: 'goal', minute: 89 }
        ];
        setEvents(defaultEvents);
      } else {
        setEvents(allEvents.sort((a, b) => a.minute - b.minute));
      }

      setPlayers(await getPlayers());
    };
    fetchMatchDetails();
  }, [id]);

  if (!match) {
    return (
      <div className="py-xl text-center">
        <p className="font-montserrat text-headline-md text-brand-primary">Cargando detalles del encuentro...</p>
      </div>
    );
  }

  const getPlayerName = (playerId: string) => {
    const p = players.find(player => player.id === playerId);
    return p ? `${p.first_name.charAt(0)}. ${p.last_name}` : 'Jugador';
  };

  const getMatchDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getMatchTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' hs';
  };

  return (
    <div className="py-md space-y-md">
      {/* Back Header */}
      <div className="flex items-center gap-xs">
        <button 
          onClick={() => navigate(-1)} 
          className="text-brand-primary hover:bg-brand-surface-highest p-2 rounded-full transition-colors flex items-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-label-bold text-xs uppercase text-brand-on-surface-variant font-bold">Volver al fixture</span>
      </div>

      {/* Hero Match Card */}
      <section className="relative overflow-hidden rounded-xl bg-brand-primary text-white shadow-xl min-h-[220px] flex flex-col justify-center">
        {/* Background image overlay */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4H1CBp5k5sCIg-V_ACr9sVsN1tVn9KVcHqdbSEtfPouQCVAAEJWhack7S0MxSHNFu-ZmttAnUyEr7LP9dkzU1s9oDODKC3xvOey1bqlFbGsB-CKZ7uO836DUXIbgjaLBvTPulAYtDexhsaGnO_PxBfJU85naczF-g_wbNBeQ1NWzLAZ2Lp6TrojVZXd5Dm1keNuxqnU5nUcCGiT0DnKPrYr5Q0isic4TbsIjrl6TCbXT9rHcLFyhKIg')" }}
        />
        
        <div className="relative z-10 p-6 flex flex-col items-center justify-between h-full">
          <div className="mb-4">
            <span className={`px-4 py-1 rounded-full font-label-bold text-[10px] uppercase tracking-widest ${
              match.status === 'live' ? 'bg-green-600 text-white animate-pulse' :
              match.status === 'finished' ? 'bg-brand-secondary text-white' : 'bg-brand-surface-highest text-brand-primary'
            }`}>
              {match.status === 'live' ? 'En Vivo' : 
               match.status === 'finished' ? 'Finalizado' :
               match.status === 'suspended' ? 'Suspendido' : 'Programado'}
            </span>
          </div>

          <div className="w-full grid grid-cols-3 items-center gap-2 md:gap-4 max-w-3xl">
            {/* Home Club */}
            <div className="flex flex-col items-center text-center">
              <img className="w-16 h-16 md:w-24 md:h-24 mb-2 drop-shadow-lg object-contain" src={homeClub?.crest_url} alt="" />
              <h2 className="font-montserrat text-sm md:text-headline-md font-bold uppercase truncate w-full">{homeClub?.short_name}</h2>
            </div>
            
            {/* Score / Time */}
            <div className="flex flex-col items-center">
              {match.status === 'finished' || match.status === 'live' ? (
                <div className="flex items-center gap-2 md:gap-6">
                  <span className="font-montserrat text-3xl md:text-display-lg text-brand-secondary-container font-extrabold">{match.home_score}</span>
                  <span className="text-white/50 font-montserrat text-2xl font-bold">-</span>
                  <span className="font-montserrat text-3xl md:text-display-lg text-brand-secondary-container font-extrabold">{match.away_score}</span>
                </div>
              ) : (
                <span className="font-montserrat text-headline-lg font-black text-brand-secondary-container uppercase">VS</span>
              )}
              <p className="font-barlow text-xs md:text-body-md text-white/70 mt-2 text-center">
                {getMatchDate(match.scheduled_at)}<br/>{getMatchTime(match.scheduled_at)}
              </p>
            </div>

            {/* Away Club */}
            <div className="flex flex-col items-center text-center">
              <img className="w-16 h-16 md:w-24 md:h-24 mb-2 drop-shadow-lg object-contain" src={awayClub?.crest_url} alt="" />
              <h2 className="font-montserrat text-sm md:text-headline-md font-bold uppercase truncate w-full">{awayClub?.short_name}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="flex border-b border-brand-outline-variant mb-6 sticky top-16 bg-brand-surface z-40">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-4 font-label-bold text-xs uppercase tracking-wider relative font-bold transition-all ${
            activeTab === 'timeline' ? 'text-brand-primary' : 'text-brand-outline'
          }`}
        >
          Cronología
          {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-secondary-container" />}
        </button>
        <button 
          onClick={() => setActiveTab('lineups')}
          className={`flex-1 py-4 font-label-bold text-xs uppercase tracking-wider relative font-bold transition-all ${
            activeTab === 'lineups' ? 'text-brand-primary' : 'text-brand-outline'
          }`}
        >
          Alineaciones
          {activeTab === 'lineups' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-secondary-container" />}
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-4 font-label-bold text-xs uppercase tracking-wider relative font-bold transition-all ${
            activeTab === 'info' ? 'text-brand-primary' : 'text-brand-outline'
          }`}
        >
          Info Partido
          {activeTab === 'info' && <div className="absolute bottom-0 left-0 w-full h-[4px] bg-brand-secondary-container" />}
        </button>
      </nav>

      {/* Tab Content: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-6 shadow-sm">
          {events.length === 0 ? (
            <p className="text-center font-barlow text-body-lg text-brand-on-surface-variant py-md">
              No se han registrado incidencias para este encuentro.
            </p>
          ) : (
            <div className="relative">
              {/* Vertical line down the middle */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-brand-outline-variant/30" />
              
              <div className="space-y-8">
                {events.map((event) => {
                  const isHomeEvent = event.club_id === match.home_club_id;
                  
                  return (
                    <div 
                      key={event.id}
                      className={`relative flex items-center justify-between w-full ${
                        isHomeEvent ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      {/* Event Details */}
                      <div className={`w-5/12 ${isHomeEvent ? 'text-right pr-8' : 'text-left pl-8'}`}>
                        <p className="font-montserrat text-sm font-bold text-brand-primary">
                          {getPlayerName(event.player_id)}
                        </p>
                        <p className="font-barlow text-xs text-brand-on-surface-variant">
                          {event.event_type === 'goal' && '¡GOL! Remate'}
                          {event.event_type === 'yellow_card' && 'Tarjeta Amarilla'}
                          {event.event_type === 'red_card' && 'Tarjeta Roja'}
                          {event.event_type === 'substitution_in' && 'Cambio / Entra'}
                          {event.event_type === 'substitution_out' && 'Cambio / Sale'}
                        </p>
                      </div>

                      {/* Timeline Node Icon */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-brand-surface z-10 border-4 border-white shadow-sm">
                        {event.event_type === 'goal' && (
                          <span className="material-symbols-outlined text-[18px] text-brand-primary font-bold">sports_soccer</span>
                        )}
                        {event.event_type === 'yellow_card' && (
                          <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
                        )}
                        {event.event_type === 'red_card' && (
                          <div className="w-2.5 h-3.5 bg-brand-error rounded-sm" />
                        )}
                        {['substitution_in', 'substitution_out'].includes(event.event_type) && (
                          <span className="material-symbols-outlined text-[18px] text-blue-500 font-bold">sync</span>
                        )}
                      </div>

                      {/* Minute */}
                      <div className={`w-5/12 ${isHomeEvent ? 'text-left pl-8' : 'text-right pr-8'}`}>
                        <span className="font-montserrat text-sm font-extrabold text-brand-primary">
                          {event.minute}'
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Lineups */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Tactical Pitch Layout */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-4 shadow-sm flex flex-col items-center">
            <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary mb-4 self-start">Esquema Táctico</h3>
            <div className="pitch-gradient w-full aspect-[2/3] max-w-sm rounded-lg relative overflow-hidden border-2 border-white/20"
                 style={{ background: 'radial-gradient(circle at center, #2d5a27 0%, #1e3d1a 100%)' }}>
              {/* Pitch markings */}
              <div className="absolute inset-4 border border-white/30 pointer-events-none" />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1/3 h-16 border border-white/30 border-t-0" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 h-16 border border-white/30 border-b-0" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/30" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/30" />
              
              {/* Home Team nodes (top half) */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between items-center text-white">
                {/* Forwards */}
                <div className="flex justify-around w-full mt-6">
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">9</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">ARCE</span></div>
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">7</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">ESTRADA</span></div>
                </div>
                {/* Midfield */}
                <div className="flex justify-between w-full">
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">10</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">PÁEZ</span></div>
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">22</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">SOUZA</span></div>
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">17</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">AYOVÍ</span></div>
                </div>
                {/* Defense */}
                <div className="flex justify-between w-full">
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">15</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">GUERRA</span></div>
                  <div className="flex flex-col items-center"><div className="w-7 h-7 rounded-full bg-white text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">4</div><span className="text-[9px] font-bold mt-1 shadow-sm uppercase">ADÉ</span></div>
                </div>
                {/* GK */}
                <div className="flex flex-col items-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-brand-primary flex items-center justify-center font-extrabold text-[10px] border border-brand-primary">1</div>
                  <span className="text-[9px] font-bold mt-1 shadow-sm uppercase">BURRAI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Substitute Lists */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-sm">
                <img className="w-5 h-5 object-contain" src={homeClub?.crest_url} alt="" />
                <span>Suplentes {homeClub?.short_name}</span>
              </h3>
              <ul className="space-y-2 text-xs font-bold mb-6">
                <li className="flex justify-between items-center py-2 border-b border-brand-outline-variant/20">
                  <span className="text-brand-on-surface-variant font-medium">G. Valle (PO)</span>
                  <span className="text-brand-outline font-extrabold">12</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-brand-outline-variant/20">
                  <span className="text-brand-on-surface-variant font-medium">M. Parrales</span>
                  <span className="text-brand-outline font-extrabold">31</span>
                </li>
                <li className="flex justify-between items-center py-2">
                  <span className="text-brand-on-surface-variant font-medium">J. Espinoza</span>
                  <span className="text-brand-outline font-extrabold">21</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary mb-4 flex items-center gap-sm">
                <img className="w-5 h-5 object-contain" src={awayClub?.crest_url} alt="" />
                <span>Suplentes {awayClub?.short_name}</span>
              </h3>
              <ul className="space-y-2 text-xs font-bold">
                <li className="flex justify-between items-center py-2 border-b border-brand-outline-variant/20">
                  <span className="text-brand-on-surface-variant font-medium">V. Mendoza (PO)</span>
                  <span className="text-brand-outline font-extrabold">1</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-brand-outline-variant/20">
                  <span className="text-brand-on-surface-variant font-medium">B. Oyola</span>
                  <span className="text-brand-outline font-extrabold">11</span>
                </li>
                <li className="flex justify-between items-center py-2">
                  <span className="text-brand-on-surface-variant font-medium">D. Obando</span>
                  <span className="text-brand-outline font-extrabold">17</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Info */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stadium Details */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-6 shadow-sm flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-brand-primary text-4xl mb-4">stadium</span>
            <h3 className="font-montserrat text-headline-md font-bold text-brand-primary mb-1">{stadium?.name}</h3>
            <p className="font-barlow text-body-md text-brand-on-surface-variant/80">
              {stadium?.city}, {stadium?.altitude_m}m de altitud
            </p>
            <div className="mt-4 w-full h-32 rounded-lg bg-brand-surface-container flex items-center justify-center overflow-hidden border border-brand-outline-variant/30">
              <span className="material-symbols-outlined text-brand-on-surface-variant/30 text-5xl">map</span>
            </div>
          </div>

          {/* Match Conditions */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-6 shadow-sm flex flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-secondary-container/20 flex items-center justify-center text-brand-secondary">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="font-barlow font-bold text-xs text-brand-outline uppercase">Aforo del Estadio</p>
                <p className="font-montserrat text-sm font-bold text-brand-primary">
                  {stadium?.capacity.toLocaleString('es-EC')} espectadores
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary-container/10 flex items-center justify-center text-brand-primary">
                <span className="material-symbols-outlined">partly_cloudy_day</span>
              </div>
              <div>
                <p className="font-barlow font-bold text-xs text-brand-outline uppercase">Clima Estimado</p>
                <p className="font-montserrat text-sm font-bold text-brand-primary">
                  {match.weather_condition || '16°C · Parcialmente nublado'}
                </p>
              </div>
            </div>
          </div>

          {/* Referee Crew */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-6 shadow-sm">
            <h3 className="font-montserrat text-headline-md font-bold text-brand-primary mb-4 border-b border-brand-outline-variant/20 pb-2">
              Cuerpo Arbitral
            </h3>
            <ul className="space-y-4 text-xs font-bold">
              <li className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">Árbitro Central</span>
                <span className="text-brand-primary">{referee?.full_name || 'Designación pendiente'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">Oficial VAR</span>
                <span className="text-brand-primary">{varOfficial?.full_name || 'Designación pendiente'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">Comisario de Juego</span>
                <span className="text-brand-primary">{commissioner?.full_name || 'Designación pendiente'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-brand-on-surface-variant font-medium">Infraestructura VAR</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                  stadium?.var_infrastructure_ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stadium?.var_infrastructure_ok ? 'Aprobada' : 'No Disponible'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
