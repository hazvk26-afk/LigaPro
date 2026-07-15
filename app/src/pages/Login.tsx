import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClubs, insertProfile } from '../services/db';
import { Club, UserProfile } from '../types';

export const Login: React.FC = () => {
  const { loginAsHincha, loginAsAdmin, loginWithProfile, user } = useAuth();
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regRoleType, setRegRoleType] = useState<'hincha' | 'admin'>('hincha');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAdminRole, setRegAdminRole] = useState<'admin' | 'maintenance_chief' | 'technician' | 'manager'>('admin');
  const [regClubId, setRegClubId] = useState('');
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'hincha') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  // Load clubs list for registration
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const list = await getClubs();
        setClubs(list);
        if (list.length > 0) {
          setRegClubId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClubs();
  }, []);

  const handleHinchaClick = () => {
    loginAsHincha();
    navigate('/');
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor, ingrese su usuario.');
      return;
    }

    const success = await loginAsAdmin(username.trim(), password.trim());
    if (success) {
      navigate('/admin');
    } else {
      setError('Credenciales no válidas. Verifique el usuario o la contraseña ingresada.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPassword.trim()) {
      setError('Por favor, ingrese su nombre y su contraseña.');
      return;
    }

    setRegLoading(true);
    setError('');

    const newId = crypto.randomUUID();
    const finalRole = regRoleType === 'hincha' ? 'hincha' : regAdminRole;

    const newProfile: UserProfile = {
      id: newId,
      display_name: regName.trim(),
      role: finalRole,
      favorite_club_id: regRoleType === 'hincha' ? regClubId : null,
      notification_preferences: {
        match_reminders: true,
        results: true,
        sanctions: regRoleType === 'admin'
      },
      password: regPassword.trim()
    };

    try {
      const response = await insertProfile(newProfile);
      if (response.error) throw response.error;

      // Automatically login
      loginWithProfile(newProfile);

      // Redirect
      if (newProfile.role === 'hincha') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al registrar el perfil en la base de datos de Supabase.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-body-md bg-brand-primary text-white">
      {/* Stadium Texture Background */}
      <div 
        className="fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCY3qhgcdiKaffTfJrpEJB0Aq-fG1r3VFWSDmb-KjkQt8tKAgjU853F7Da7-6jpccSx5DFHBbzc44WpmKy9PovlbQ6FlSmUCV1mHx6JurSdna27R2zPWhA9EoXLv9hLZd577h1wKoS9Zm0Z5kFCYYOWQiyEHoV5jZc2IS_kT-njrm5gbYfhAHsNbUJFTrupkavvAVAukEkn4Vy8FtUGf3xZV8IXrNQ5Gpbdr-OrnnFPvoaOEfsfBg6zWA')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 bg-radial from-brand-primary-container to-brand-primary opacity-90" />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[1440px] px-md flex flex-col items-center justify-center min-h-screen py-lg">
        {/* Logo Section */}
        <div className="mb-lg text-center animate-fade-in">
          <div className="relative group">
            <div className="absolute -inset-4 bg-brand-secondary-container/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center flex-col">
              <span className="font-montserrat text-[64px] leading-tight text-white tracking-tighter uppercase font-extrabold italic">
                LigaPro
              </span>
              <span className="font-barlow text-brand-secondary-container tracking-[0.3em] uppercase -mt-2 text-sm font-bold">
                Ecuador
              </span>
            </div>
          </div>
        </div>

        {!isRegistering ? (
          <>
            {/* Welcome Message */}
            <div className="text-center mb-xl max-w-2xl px-md">
              <h1 className="font-montserrat text-[28px] md:text-headline-lg text-white mb-sm leading-tight font-bold">
                Bienvenido a la gestión oficial del fútbol ecuatoriano
              </h1>
              <p className="font-barlow text-body-lg text-white/60 max-w-lg mx-auto">
                Seleccione su perfil de acceso para continuar o cree una cuenta para probar la plataforma conectada en tiempo real.
              </p>
            </div>

            {/* Role Selection Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full max-w-4xl px-md mb-lg">
              {/* Perfil Hincha Card */}
              <button 
                className="group relative bg-white/5 border border-white/10 hover:border-white/20 p-xl rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 overflow-hidden flex flex-col justify-between min-h-[300px]"
                onClick={handleHinchaClick}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-brand-secondary/20 transition-all"></div>
                <div>
                  <div className="mb-md">
                    <span className="material-symbols-outlined text-[48px] text-brand-secondary-container group-hover:scale-110 transition-transform inline-block">
                      sports_soccer
                    </span>
                  </div>
                  <h2 className="font-montserrat text-headline-md text-white mb-xs font-semibold">Perfil Hincha</h2>
                  <p className="font-barlow text-body-md text-white/70">
                    Acceso público a noticias de última hora, resultados en tiempo real y estadísticas oficiales de la liga.
                  </p>
                </div>
                <div className="flex items-center gap-base mt-lg group-hover:translate-x-2 transition-transform">
                  <span className="font-label-bold text-brand-secondary-container uppercase">Explorar Ahora</span>
                  <span className="material-symbols-outlined text-brand-secondary-container text-sm">arrow_forward</span>
                </div>
              </button>

              {/* Acceso Administrativo Card */}
              <button 
                className="group relative bg-white/5 border border-brand-secondary-container/20 hover:border-brand-secondary-container/40 p-xl rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 overflow-hidden flex flex-col justify-between min-h-[300px]"
                onClick={() => {
                  setModalOpen(true);
                  setError('');
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary-container/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-brand-secondary-container/20 transition-all"></div>
                <div>
                  <div className="mb-md">
                    <span 
                      className="material-symbols-outlined text-[48px] text-brand-secondary-container group-hover:scale-110 transition-transform inline-block"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      admin_panel_settings
                    </span>
                  </div>
                  <h2 className="font-montserrat text-headline-md text-white mb-xs font-semibold">Acceso Administrativo</h2>
                  <p className="font-barlow text-body-md text-white/70">
                    Portal seguro para clubes, árbitros y personal de la LigaPro. Gestión de actas, disciplina y calendarios.
                  </p>
                </div>
                <div className="flex items-center gap-base mt-lg group-hover:translate-x-2 transition-transform">
                  <span className="font-label-bold text-brand-secondary-container uppercase">Iniciar Sesión</span>
                  <span className="material-symbols-outlined text-brand-secondary-container text-sm">lock</span>
                </div>
              </button>
            </div>

            {/* Sign Up Navigation Trigger */}
            <div className="text-center mt-md">
              <p className="font-barlow text-body-lg text-white/50">
                ¿No tienes una cuenta registrada en tu Supabase?{' '}
                <button 
                  onClick={() => {
                    setIsRegistering(true);
                    setError('');
                  }}
                  className="text-brand-secondary-container hover:underline font-bold"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </>
        ) : (
          /* Sign Up Form Card */
          <div className="bg-brand-primary-container border border-white/10 w-full max-w-lg p-xl rounded-xl shadow-2xl animate-fade-in">
            <div className="text-center mb-lg">
              <span className="material-symbols-outlined text-brand-secondary-container text-[48px] mb-base">person_add</span>
              <h3 className="font-montserrat text-headline-md text-white font-bold">Crear Cuenta LigaPro</h3>
              <p className="font-barlow text-body-md text-white/60">Regístrate directamente en tu base de datos de Supabase</p>
            </div>

            <form className="space-y-md" onSubmit={handleRegisterSubmit}>
              {error && (
                <div className="bg-brand-error/20 border border-brand-error/50 text-red-200 text-xs p-sm rounded">
                  {error}
                </div>
              )}

              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Tipo de Perfil</label>
                <div className="grid grid-cols-2 gap-sm">
                  <button
                    type="button"
                    onClick={() => setRegRoleType('hincha')}
                    className={`py-2 rounded-lg font-montserrat font-bold text-xs transition-all border ${
                      regRoleType === 'hincha'
                        ? 'bg-brand-secondary-container text-brand-on-secondary-container border-brand-secondary-container'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Cuenta Hincha
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRoleType('admin')}
                    className={`py-2 rounded-lg font-montserrat font-bold text-xs transition-all border ${
                      regRoleType === 'admin'
                        ? 'bg-brand-secondary-container text-brand-on-secondary-container border-brand-secondary-container'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Cuenta Administrativa
                  </button>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ej. Roberto Bustamante"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md"
                />
              </div>

              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Contraseña de acceso"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md"
                />
              </div>

              {regRoleType === 'hincha' ? (
                <div className="space-y-xs animate-fade-in">
                  <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Club Favorito *</label>
                  <select
                    value={regClubId}
                    onChange={e => setRegClubId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md"
                  >
                    {clubs.map(c => (
                      <option key={c.id} value={c.id} className="bg-brand-primary-container text-white">
                        {c.name} ({c.series_id === 'series-a' ? 'Serie A' : 'Serie B'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-xs animate-fade-in">
                  <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Rol Operativo *</label>
                  <select
                    value={regAdminRole}
                    onChange={e => setRegAdminRole(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md"
                  >
                    <option value="admin" className="bg-brand-primary-container text-white">Administrador General</option>
                    <option value="maintenance_chief" className="bg-brand-primary-container text-white">Director de Escenarios</option>
                    <option value="technician" className="bg-brand-primary-container text-white">Técnico Arbitral</option>
                    <option value="manager" className="bg-brand-primary-container text-white">Coordinador del Torneo</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-brand-secondary-container text-brand-on-secondary-container font-montserrat font-bold py-md rounded-lg hover:bg-brand-secondary-container/80 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-xs disabled:opacity-50"
              >
                {regLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-brand-primary"></div>
                ) : (
                  'REGISTRARSE Y ENTRAR'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="w-full text-center text-xs font-barlow text-white/60 hover:text-white uppercase tracking-wider hover:underline py-xs"
              >
                Volver a ingreso habitual
              </button>
            </form>
          </div>
        )}

        {/* Footer / Support */}
        <footer className="mt-xl flex flex-col items-center gap-sm opacity-50 hover:opacity-100 transition-opacity">
          <p className="font-barlow font-bold text-[12px] uppercase tracking-widest text-white/50">Powered by LigaPro Systems v4.0</p>
          <div className="flex gap-md">
            <a className="font-barlow font-bold text-xs hover:text-brand-secondary-container transition-colors text-white/60" href="#">Soporte Técnico</a>
            <a className="font-barlow font-bold text-xs hover:text-brand-secondary-container transition-colors text-white/60" href="#">Términos de Uso</a>
          </div>
        </footer>
      </main>

      {/* Overlay Login Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-brand-primary/95 backdrop-blur-md transition-all duration-300">
          <div className="bg-brand-primary-container border border-white/10 w-full max-w-md p-xl rounded-xl relative shadow-2xl">
            <button 
              className="absolute top-md right-md text-white/50 hover:text-white"
              onClick={() => {
                setModalOpen(false);
                setError('');
                setUsername('');
                setPassword('');
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-lg">
              <span className="material-symbols-outlined text-brand-secondary-container text-[48px] mb-base">shield_person</span>
              <h3 className="font-montserrat text-headline-md text-white font-bold">Ingreso Seguro</h3>
              <p className="font-barlow text-body-md text-white/60">Credenciales corporativas de LigaPro</p>
            </div>

            <form className="space-y-md" onSubmit={handleAdminLoginSubmit}>
              {error && (
                <div className="bg-brand-error/20 border border-brand-error/50 text-red-200 text-xs p-sm rounded">
                  {error}
                </div>
              )}
              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Usuario</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md" 
                  placeholder="Nombre de usuario o rol" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Contraseña</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all text-body-md" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-secondary-container text-brand-on-secondary-container font-montserrat font-bold py-md rounded-lg hover:bg-brand-secondary-container/80 transition-all active:scale-[0.98] shadow-lg"
              >
                ACCEDER AL PANEL
              </button>
            </form>
            
            <div className="text-center mt-md">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setModalOpen(false);
                  setIsRegistering(true);
                  setRegRoleType('admin');
                }}
                className="text-brand-secondary-container hover:underline text-xs font-bold uppercase tracking-wider"
              >
                ¿No tienes cuenta? Regístrate como Administrativo
              </button>
            </div>
            
            <div className="mt-lg pt-md border-t border-white/5 text-center">
              <p className="font-barlow text-[11px] text-white/40 italic">
                Este sistema está monitoreado. Ingrese con sus credenciales registradas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
