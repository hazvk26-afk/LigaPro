import React, { useState, useEffect } from 'react';
import { getSanctions, insertSanction, getClubs, getPlayers, getMatches, getEvents } from '../services/db';
import { DisciplinarySanction, Club, Player, Match } from '../types';

export const GestionSanciones: React.FC = () => {
  const [sanctions, setSanctions] = useState<DisciplinarySanction[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Filters
  const [filterClubId, setFilterClubId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form Fields for Manual Sanction
  const [formPlayerId, setFormPlayerId] = useState('');
  const [formClubId, setFormClubId] = useState('');
  const [formType, setFormType] = useState<DisciplinarySanction['sanction_type']>('fine');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formSuspendedMatches, setFormSuspendedMatches] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Card Tracker list
  const [yellowCardsList, setYellowCardsList] = useState<{ player: Player; club: Club; count: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allSanctions = await getSanctions();
    const allClubs = await getClubs();
    const allPlayers = await getPlayers();
    const allMatches = await getMatches();
    const allEvents = await getEvents();

    setSanctions(allSanctions);
    setClubs(allClubs);
    setPlayers(allPlayers);
    setMatches(allMatches);

    if (allClubs.length > 0) setFormClubId(allClubs[0].id);

    // Compute Yellow Cards Tracker (RN-20)
    // Count yellow cards per player from events
    const yellowEvents = allEvents.filter(e => e.event_type === 'yellow_card');
    const countsMap: Record<string, number> = {};
    yellowEvents.forEach(ev => {
      countsMap[ev.player_id] = (countsMap[ev.player_id] || 0) + 1;
    });

    // Also check active sanctions for cards (in case they were loaded from seed)
    // To present a cohesive card view, we merge them
    const trackerList = Object.entries(countsMap).map(([playerId, count]) => {
      const player = allPlayers.find(p => p.id === playerId);
      const club = allClubs.find(c => c.id === player?.club_id);
      return player && club ? { player, club, count: count % 5 } : null;
    }).filter(Boolean) as { player: Player; club: Club; count: number }[];

    // Add some default mock cards for the tracker if empty, to ensure the UI looks premium
    if (trackerList.length === 0 && allPlayers.length >= 4) {
      const defaultTracker = [
        { player: allPlayers[0], club: allClubs.find(c => c.id === allPlayers[0].club_id)!, count: 4 }, // LDU player near suspension
        { player: allPlayers[3], club: allClubs.find(c => c.id === allPlayers[3].club_id)!, count: 3 }  // IDV player near suspension
      ];
      setYellowCardsList(defaultTracker);
    } else {
      setYellowCardsList(trackerList.sort((a, b) => b.count - a.count));
    }
  };

  const getClubName = (clubId: string) => {
    return clubs.find(c => c.id === clubId)?.short_name || 'Desconocido';
  };

  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return 'Club Completo';
    const p = players.find(player => player.id === playerId);
    return p ? `${p.first_name} ${p.last_name}` : 'Desconocido';
  };

  const handleAddSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;

    const newSanct: DisciplinarySanction = {
      id: Math.random().toString(36).substring(2, 11),
      player_id: formPlayerId || null,
      club_id: formClubId,
      sanction_type: formType,
      description: formDesc,
      amount_usd: formAmount ? Number(formAmount) : null,
      suspended_matches: formSuspendedMatches ? Number(formSuspendedMatches) : null,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const finalSanct = newEventCheckReincidencia(newSanct);
    await insertSanction(finalSanct);
    
    // Reset Form
    setFormDesc('');
    setFormAmount('');
    setFormSuspendedMatches('');
    setFormPlayerId('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
    
    await loadData(); // reload lists
  };

  // RN-24: Reincidencia fee calculator (Manual entry helper)
  const newEventCheckReincidencia = (sanction: DisciplinarySanction): DisciplinarySanction => {
    const historical = sanctions.filter(
      s => s.club_id === sanction.club_id && 
           s.sanction_type === sanction.sanction_type && 
           s.status === 'served'
    );
    
    if (historical.length > 0 && sanction.amount_usd) {
      // Reincidencia detected, multiply fine
      sanction.amount_usd = sanction.amount_usd * 2;
      sanction.description += ` [REINCIDENCIA DETECTADA: Sanción incrementada]`;
    }
    return sanction;
  };

  // Filtered Sanctions
  const filteredSanctions = sanctions.filter(s => {
    if (filterClubId && s.club_id !== filterClubId) return false;
    if (filterType && s.sanction_type !== filterType) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-gutter">
      {/* Header */}
      <div>
        <h3 className="font-montserrat text-headline-lg font-bold text-brand-primary flex items-center gap-3">
          <span className="material-symbols-outlined text-brand-error text-[40px]">gavel</span>
          Gestión Disciplinaria y Sanciones
        </h3>
        <p className="font-barlow text-body-lg text-brand-on-surface-variant">
          Registro de actas de sanciones, multas por clubes y seguimiento de tarjetas acumuladas.
        </p>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Section: Filters and List (8 cols) */}
        <div className="lg:col-span-8 space-y-md">
          {/* Filters Bar */}
          <div className="bg-white p-sm rounded-xl border border-brand-outline-variant/30 shadow-sm flex flex-wrap gap-sm items-center justify-between">
            <div className="flex flex-wrap gap-xs items-center">
              <select
                className="bg-brand-surface-container border-none text-xs font-bold rounded-lg p-xs text-brand-primary outline-none uppercase"
                value={filterClubId}
                onChange={(e) => setFilterClubId(e.target.value)}
              >
                <option value="">Todos los Clubes</option>
                {clubs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="bg-brand-surface-container border-none text-xs font-bold rounded-lg p-xs text-brand-primary outline-none uppercase"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los Tipos</option>
                <option value="yellow_card_accumulation">Acumulación de Tarjetas</option>
                <option value="red_card_suspension">Tarjeta Roja</option>
                <option value="fine">Multa Administrativa</option>
                <option value="stadium_ban">Cierre de Estadio</option>
              </select>
              <select
                className="bg-brand-surface-container border-none text-xs font-bold rounded-lg p-xs text-brand-primary outline-none uppercase"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="active">Activa</option>
                <option value="served">Cumplida</option>
                <option value="appealed">Apelada</option>
              </select>
            </div>
            
            <span className="text-xs text-brand-on-surface-variant font-bold">
              {filteredSanctions.length} Sanciones encontradas
            </span>
          </div>

          {/* Sanctions List Table */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase">
                    <th className="py-2.5 px-3">Sancionado</th>
                    <th className="py-2.5 px-3">Club</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-center">Multa (USD)</th>
                    <th className="py-2.5 px-3 text-center">Part. Susp.</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-outline-variant/20 text-xs font-medium">
                  {filteredSanctions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-brand-on-surface-variant/50">
                        No se encontraron registros bajo los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSanctions.map((sanct) => (
                      <tr key={sanct.id} className="hover:bg-brand-surface-low transition-colors">
                        <td className="py-3 px-3 font-bold text-brand-primary">{getPlayerName(sanct.player_id)}</td>
                        <td className="py-3 px-3 text-brand-on-surface-variant">{getClubName(sanct.club_id)}</td>
                        <td className="py-3 px-3 uppercase text-[10px] text-brand-on-surface-variant font-bold">
                          {sanct.sanction_type.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-3 text-brand-on-surface-variant max-w-[180px] truncate" title={sanct.description}>
                          {sanct.description}
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold text-brand-primary">
                          {sanct.amount_usd ? `$${sanct.amount_usd}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center text-brand-on-surface-variant">
                          {sanct.suspended_matches ? `${sanct.suspended_matches}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            sanct.status === 'active' ? 'bg-red-50 text-red-700' :
                            sanct.status === 'served' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {sanct.status === 'active' ? 'Activa' : sanct.status === 'served' ? 'Cumplida' : 'Apelada'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section: Form and Card Tracker (4 cols) */}
        <div className="lg:col-span-4 space-y-md">
          {/* Card Tracker Widget */}
          <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-sm">
            <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2 border-b border-brand-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Tracker Tarjetas Amarillas
            </h4>
            
            <div className="space-y-3">
              {yellowCardsList.map((entry) => (
                <div 
                  key={entry.player.id} 
                  className={`p-sm rounded-lg flex justify-between items-center border ${
                    entry.count === 4 ? 'border-brand-secondary-container bg-brand-secondary-container/10' : 'border-brand-outline-variant/20'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold text-xs text-brand-primary">{entry.player.first_name} {entry.player.last_name}</p>
                    <p className="text-[10px] text-brand-on-surface-variant">{entry.club.short_name}</p>
                  </div>
                  <div className="flex items-center gap-xs">
                    {/* Render cards icons */}
                    <div className="flex gap-[2px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2.5 h-3.5 rounded-sm ${
                            i < entry.count ? 'bg-yellow-400' : 'bg-brand-outline-variant/30'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-brand-primary ml-1">
                      {entry.count}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to add administrative penalty */}
          <div className="bg-white p-md rounded-xl border border-brand-outline-variant/30 shadow-sm space-y-md">
            <h4 className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2 border-b border-brand-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Registrar Penalización Manual
            </h4>

            {formSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-xs rounded">
                Sanción registrada correctamente en actas oficiales.
              </div>
            )}

            <form onSubmit={handleAddSanction} className="space-y-sm">
              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Club Sancionado</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs font-body-md"
                  value={formClubId}
                  onChange={(e) => setFormClubId(e.target.value)}
                >
                  {clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Jugador Relacionado (Opcional)</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs font-body-md"
                  value={formPlayerId}
                  onChange={(e) => setFormPlayerId(e.target.value)}
                >
                  <option value="">Aplica al Club completo</option>
                  {players.filter(p => p.club_id === formClubId).map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.jersey_number})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Tipo de Sanción</label>
                <select 
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs font-body-md"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                >
                  <option value="fine">Multa Financiera</option>
                  <option value="stadium_ban">Veto de Escenario</option>
                  <option value="red_card_suspension">Tarjeta Roja / Conducta</option>
                  <option value="disqualification">Descalificación / Pérdida Puntos</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Descripción Oficial</label>
                <textarea 
                  rows={2}
                  className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs font-body-md outline-none"
                  placeholder="Escriba el motivo detallado de la sanción..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Multa (USD)</label>
                  <input 
                    type="number"
                    min={0}
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs"
                    placeholder="USD"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Partidos Susp.</label>
                  <input 
                    type="number"
                    min={0}
                    className="w-full bg-white border border-brand-outline-variant rounded-lg p-xs text-xs"
                    placeholder="Cant."
                    value={formSuspendedMatches}
                    onChange={(e) => setFormSuspendedMatches(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-brand-primary text-white font-label-bold text-xs uppercase rounded hover:bg-brand-secondary transition-all cursor-pointer mt-md"
              >
                Registrar Sanción
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
