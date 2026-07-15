import React, { useState, useEffect } from 'react';
import { getClubs, getStadiums, insertClub } from '../services/db';
import { Club, Stadium } from '../types';

export const GestionClubes: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [crestUrl, setCrestUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#000613');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [seriesId, setSeriesId] = useState<'series-a' | 'series-b'>('series-a');
  const [homeStadiumId, setHomeStadiumId] = useState('');
  const [isFilial, setIsFilial] = useState(false);
  const [foundedYear, setFoundedYear] = useState('2026');
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchClubsAndStadiums = async () => {
    setLoading(true);
    try {
      const allClubs = await getClubs();
      const allStadiums = await getStadiums();
      setClubs(allClubs);
      setStadiums(allStadiums);
      if (allStadiums.length > 0) {
        setHomeStadiumId(allStadiums[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubsAndStadiums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortName || !homeStadiumId) {
      setStatusMessage({ type: 'error', text: 'Por favor complete todos los campos obligatorios.' });
      return;
    }

    const defaultCrest = crestUrl.trim() || `https://placehold.co/100x100/${primaryColor.replace('#', '')}/${secondaryColor.replace('#', '')}?text=${encodeURIComponent(shortName)}`;

    const newClub: Club = {
      id: crypto.randomUUID(),
      name: name.trim(),
      short_name: shortName.trim(),
      crest_url: defaultCrest,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      alt_kit_colors: [],
      series_id: seriesId,
      is_filial: isFilial,
      is_enabled: true,
      home_stadium_id: homeStadiumId,
      founded_year: foundedYear ? parseInt(foundedYear) : 2026
    };

    try {
      const response = await insertClub(newClub);
      if (response.error) throw response.error;

      setStatusMessage({ type: 'success', text: `Club ${newClub.name} registrado con éxito.` });
      
      // Reset form
      setName('');
      setShortName('');
      setCrestUrl('');
      setPrimaryColor('#000613');
      setSecondaryColor('#ffffff');
      setIsFilial(false);
      
      setShowForm(false);
      await fetchClubsAndStadiums();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar el club en Supabase.' });
    }
  };

  const clubsSerieA = clubs.filter(c => c.series_id === 'series-a');
  const clubsSerieB = clubs.filter(c => c.series_id === 'series-b');

  return (
    <div className="py-md space-y-md overflow-y-auto max-h-[90vh] pr-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
        <div>
          <h2 className="font-montserrat text-headline-lg font-extrabold uppercase italic tracking-tighter text-brand-primary">
            Gestión de Clubes
          </h2>
          <p className="font-barlow text-body-lg text-brand-on-surface-variant/80">
            Registra y administra los clubes que participan en la Serie A y Serie B de la LigaPro.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setStatusMessage(null);
          }}
          className="flex items-center gap-xs bg-brand-primary hover:bg-brand-primary-container text-white px-md py-2 rounded-lg font-label-bold text-xs uppercase tracking-wider transition-all"
        >
          <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancelar' : 'Registrar Club'}
        </button>
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

      {/* New Club Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-brand-outline-variant/30 p-md shadow-sm space-y-md max-w-2xl">
          <h3 className="font-montserrat text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-brand-outline-variant/20 pb-xs">
            Formulario de Registro
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Nombre del Club *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Club Deportivo Especializado"
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Nombre Corto / Sigla *</label>
              <input
                type="text"
                required
                value={shortName}
                onChange={e => setShortName(e.target.value)}
                placeholder="Ej. Barcelona SC, LDU"
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              />
            </div>
            
            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">URL del Escudo (Opcional)</label>
              <input
                type="url"
                value={crestUrl}
                onChange={e => setCrestUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Año de Fundación</label>
              <input
                type="number"
                value={foundedYear}
                onChange={e => setFoundedYear(e.target.value)}
                placeholder="Ej. 1925"
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              />
            </div>

            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">División (Serie) *</label>
              <select
                value={seriesId}
                onChange={e => setSeriesId(e.target.value as any)}
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              >
                <option value="series-a">Serie A</option>
                <option value="series-b">Serie B</option>
              </select>
            </div>

            <div className="space-y-xs">
              <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Estadio Sede (Local) *</label>
              <select
                value={homeStadiumId}
                onChange={e => setHomeStadiumId(e.target.value)}
                className="w-full px-md py-2 bg-brand-surface rounded border border-brand-outline-variant/50 focus:ring-2 focus:ring-brand-secondary outline-none text-body-md"
              >
                {stadiums.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.city})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-md">
              <div className="space-y-xs flex-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Color Principal</label>
                <div className="flex gap-xs">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border-0 rounded cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 px-sm py-1 bg-brand-surface rounded border border-brand-outline-variant/50 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-xs flex-1">
                <label className="font-barlow font-bold text-xs uppercase text-brand-outline">Color Secundario</label>
                <div className="flex gap-xs">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 border-0 rounded cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="flex-1 px-sm py-1 bg-brand-surface rounded border border-brand-outline-variant/50 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center h-full pt-md">
              <label className="flex items-center gap-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFilial}
                  onChange={e => setIsFilial(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-secondary border-brand-outline-variant/50 focus:ring-brand-secondary"
                />
                <span className="font-barlow font-bold text-xs uppercase text-brand-outline">Es un Club Filial</span>
              </label>
            </div>
          </div>

          <div className="border-t border-brand-outline-variant/20 pt-md flex justify-end">
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-container text-white px-md py-2 rounded-lg font-label-bold text-xs uppercase tracking-wider transition-all"
            >
              Guardar en Supabase
            </button>
          </div>
        </form>
      )}

      {/* Lists */}
      {loading ? (
        <div className="flex justify-center p-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-secondary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          {/* Serie A */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-md shadow-sm space-y-sm">
            <h3 className="font-montserrat text-headline-md italic uppercase tracking-tighter text-brand-primary border-l-4 border-brand-primary pl-2">
              Serie A ({clubsSerieA.length} Equipos)
            </h3>
            
            <div className="divide-y divide-brand-outline-variant/20 max-h-[400px] overflow-y-auto pr-1">
              {clubsSerieA.map(club => {
                const stadium = stadiums.find(s => s.id === club.home_stadium_id);
                return (
                  <div key={club.id} className="flex justify-between items-center py-sm">
                    <div className="flex items-center gap-sm">
                      <img className="w-10 h-10 object-contain bg-brand-surface rounded p-1" src={club.crest_url} alt="" />
                      <div>
                        <p className="font-montserrat text-sm font-bold text-brand-primary">{club.name}</p>
                        <p className="font-barlow text-xs text-brand-on-surface-variant/75">
                          Sede: {stadium?.name || 'Estadio Desconocido'} ({stadium?.city})
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-xs">
                      <span className="w-4 h-4 rounded-full border border-brand-outline-variant" style={{ backgroundColor: club.primary_color }} title="Color Principal"></span>
                      <span className="w-4 h-4 rounded-full border border-brand-outline-variant" style={{ backgroundColor: club.secondary_color }} title="Color Secundario"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Serie B */}
          <div className="bg-white rounded-xl border border-brand-outline-variant/30 p-md shadow-sm space-y-sm">
            <h3 className="font-montserrat text-headline-md italic uppercase tracking-tighter text-brand-primary border-l-4 border-brand-secondary pl-2">
              Serie B ({clubsSerieB.length} Equipos)
            </h3>
            
            <div className="divide-y divide-brand-outline-variant/20 max-h-[400px] overflow-y-auto pr-1">
              {clubsSerieB.map(club => {
                const stadium = stadiums.find(s => s.id === club.home_stadium_id);
                return (
                  <div key={club.id} className="flex justify-between items-center py-sm">
                    <div className="flex items-center gap-sm">
                      <img className="w-10 h-10 object-contain bg-brand-surface rounded p-1" src={club.crest_url} alt="" />
                      <div>
                        <p className="font-montserrat text-sm font-bold text-brand-primary">
                          {club.name}
                          {club.is_filial && (
                            <span className="text-[8px] bg-brand-surface-highest text-brand-on-surface-variant px-1 rounded ml-1 uppercase">Filial</span>
                          )}
                        </p>
                        <p className="font-barlow text-xs text-brand-on-surface-variant/75">
                          Sede: {stadium?.name || 'Estadio Desconocido'} ({stadium?.city})
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-xs">
                      <span className="w-4 h-4 rounded-full border border-brand-outline-variant" style={{ backgroundColor: club.primary_color }} title="Color Principal"></span>
                      <span className="w-4 h-4 rounded-full border border-brand-outline-variant" style={{ backgroundColor: club.secondary_color }} title="Color Secundario"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
