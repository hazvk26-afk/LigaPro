import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role === 'hincha')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role === 'hincha') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-primary text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-secondary-container"></div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/clubes', label: 'Clubes', icon: 'shield' },
    { path: '/admin/fixtures', label: 'Generar Fixture', icon: 'date_range' },
    { path: '/admin/sanciones', label: 'Sanciones', icon: 'gavel' },
    { path: '/admin/perfil', label: 'Mi Perfil', icon: 'person' },
  ];

  return (
    <div className="flex h-screen w-screen bg-brand-surface font-body-md text-brand-on-surface overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col h-screen py-md px-sm bg-brand-primary text-white w-[280px] shadow-md z-[60] shrink-0 justify-between">
        <div>
          <div className="px-sm mb-lg">
            <h1 className="font-montserrat text-headline-md font-black text-brand-secondary-container tracking-tighter">LIGAPRO</h1>
            <div className="mt-2">
              <p className="font-label-bold text-label-bold uppercase tracking-wider text-white">League Operations</p>
              <p className="text-[11px] text-brand-on-primary-container opacity-70">Management Portal</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg mx-2 my-1 transition-all ${
                    isActive
                      ? 'bg-brand-secondary-container text-brand-on-secondary-container scale-[0.98]'
                      : 'text-brand-on-primary-container hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined mr-3">{item.icon}</span>
                  <span className="font-label-bold text-label-bold uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-md">
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-brand-on-primary-container hover:bg-white/10 rounded-lg mx-2 mb-2"
          >
            <span className="material-symbols-outlined mr-3">sports_soccer</span>
            <span className="font-label-bold text-label-bold uppercase tracking-wider">Ver Portal Hincha</span>
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-brand-on-primary-container hover:bg-brand-error/20 hover:text-white rounded-lg mx-2 text-left"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-label-bold text-label-bold uppercase tracking-wider">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top App Bar */}
        <header className="flex justify-between items-center px-gutter py-4 w-full sticky top-0 z-50 bg-brand-surface border-b border-brand-outline-variant">
          <div className="flex items-center space-x-6">
            <span className="font-montserrat text-headline-md font-extrabold text-brand-primary lg:hidden">LIGAPRO</span>
            <span className="hidden lg:inline-block font-montserrat text-headline-md font-extrabold text-brand-primary">LigaPro Ecuador</span>
            <div className="relative w-64 md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-brand-surface-container rounded border-none focus:ring-2 focus:ring-brand-secondary text-body-md outline-none"
                placeholder="Buscar clubes, jugadores o partidos..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Small screen menu links */}
            <div className="lg:hidden flex space-x-2">
              {menuItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`p-2 rounded ${location.pathname === item.path ? 'bg-brand-secondary-container/20 text-brand-secondary' : 'text-brand-on-surface-variant'}`}
                >
                  <span className="material-symbols-outlined block">{item.icon}</span>
                </Link>
              ))}
              <button 
                onClick={logout}
                className="p-2 text-brand-error"
              >
                <span className="material-symbols-outlined block">logout</span>
              </button>
            </div>

            <button className="hidden md:block p-2 text-brand-on-surface-variant hover:text-brand-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="hidden md:block h-8 w-px bg-brand-outline-variant mx-2"></div>
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/admin/perfil')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                  {user.display_name}
                </p>
                <p className="text-[10px] uppercase tracking-tighter text-brand-on-surface-variant">
                  {user.role === 'maintenance_chief' ? 'Super Administrador' : 'Administrador'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-primary-container overflow-hidden border-2 border-brand-secondary-container flex items-center justify-center">
                {user.avatar_url ? (
                  <img className="w-full h-full object-cover" src={user.avatar_url} alt="Profile" />
                ) : (
                  <span className="material-symbols-outlined text-white">person</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-gutter">
          <div className="max-w-container-max mx-auto w-full space-y-gutter pb-12">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-gutter py-3 flex justify-between items-center text-[10px] font-bold text-brand-on-surface-variant/40 uppercase tracking-widest border-t border-brand-outline-variant/30 bg-brand-surface shrink-0">
          <span>© 2026 LigaPro Ecuador - Sistema de Gestión Administrativa</span>
          <span>V 4.2.1-PRO | Servidores: OK</span>
        </footer>
      </div>
    </div>
  );
};
