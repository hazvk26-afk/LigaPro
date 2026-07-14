import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { loginAsHincha, loginAsAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'hincha') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

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

    const success = await loginAsAdmin(username.trim());
    if (success) {
      navigate('/admin');
    } else {
      setError('Credenciales corporativas no válidas. Pruebe con "admin" o el nombre de un administrativo.');
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
      
      {/* Background Radial Gradient */}
      <div className="fixed inset-0 z-0 bg-radial from-brand-primary-container to-brand-primary opacity-90" />

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-[1440px] px-md flex flex-col items-center justify-center min-h-screen">
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

        {/* Welcome Message */}
        <div className="text-center mb-xl max-w-2xl px-md">
          <h1 className="font-montserrat text-[28px] md:text-headline-lg text-white mb-sm leading-tight font-bold">
            Bienvenido a la gestión oficial del fútbol ecuatoriano
          </h1>
          <p className="font-barlow text-body-lg text-white/60 max-w-lg mx-auto">
            Seleccione su perfil de acceso para continuar a la plataforma integrada de administración y noticias.
          </p>
        </div>

        {/* Role Selection Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full max-w-4xl px-md">
          {/* Perfil Hincha Card */}
          <button 
            className="group relative bg-white/5 border border-white/10 hover:border-white/20 p-xl rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 overflow-hidden flex flex-col justify-between min-h-[320px]"
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
            className="group relative bg-white/5 border border-brand-secondary-container/20 hover:border-brand-secondary-container/40 p-xl rounded-xl text-left transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 overflow-hidden flex flex-col justify-between min-h-[320px]"
            onClick={() => setModalOpen(true)}
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all" 
                  placeholder="ID de Empleado (p. ej. Miguel Ángel Loor o admin)" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-barlow font-bold text-xs uppercase text-white/50 block ml-1">Contraseña</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-md text-white focus:border-brand-secondary-container focus:ring-1 focus:ring-brand-secondary-container outline-none transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  disabled // Simulating static corporate password behavior
                />
                <span className="text-[10px] text-white/40 block ml-1 italic">*Para desarrollo, cualquier contraseña es válida (campo deshabilitado)</span>
              </div>
              <div className="flex items-center justify-between py-sm">
                <label className="flex items-center gap-base cursor-pointer group">
                  <input className="form-checkbox bg-transparent border-white/20 rounded text-brand-secondary-container focus:ring-0" type="checkbox" defaultChecked />
                  <span className="font-barlow font-bold text-xs text-white/60 group-hover:text-white transition-colors">Recordarme</span>
                </label>
                <a className="font-barlow font-bold text-xs text-brand-secondary-container hover:underline" href="#">¿Olvidó su contraseña?</a>
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-secondary-container text-brand-on-secondary-container font-montserrat font-bold py-md rounded-lg hover:bg-brand-secondary-container/80 transition-all active:scale-[0.98] shadow-lg"
              >
                ACCEDER AL PANEL
              </button>
            </form>
            
            <div className="mt-lg pt-md border-t border-white/5 text-center">
              <p className="font-barlow text-[11px] text-white/40 italic">
                Este sistema está monitoreado. El acceso no autorizado está prohibido por la normativa de seguridad de la LigaPro Ecuador.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
