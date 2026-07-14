import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/fixture', label: 'Fixture', icon: 'calendar_month' },
    { path: '/tabla-posiciones', label: 'Tables', icon: 'format_list_numbered' },
  ];

  const handleProfileClick = () => {
    if (user && user.role !== 'hincha') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen pb-24 flex flex-col">
      {/* Top Header */}
      <header className="bg-brand-primary shadow-md sticky top-0 z-50 px-md py-sm flex justify-between items-center w-full">
        <div className="flex items-center gap-base">
          <div className="w-10 h-10 rounded-full bg-brand-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-brand-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_soccer
            </span>
          </div>
          <h1 
            className="font-montserrat text-[20px] md:text-[24px] text-brand-on-tertiary uppercase tracking-tighter cursor-pointer"
            onClick={() => navigate('/')}
          >
            LigaPro Ecuador
          </h1>
        </div>
        
        <div className="flex items-center gap-md">
          {user?.role && user.role !== 'hincha' && (
            <Link 
              to="/admin" 
              className="hidden md:flex items-center gap-xs bg-brand-secondary-container text-brand-on-secondary-container px-sm py-xs rounded font-label-bold text-xs uppercase"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Panel Admin
            </Link>
          )}
          {user ? (
            <button 
              onClick={logout} 
              className="hidden md:flex items-center gap-xs border border-white/20 text-white px-sm py-xs rounded font-label-bold text-xs uppercase hover:bg-white/10"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link 
              to="/login" 
              className="hidden md:flex items-center gap-xs border border-white/20 text-white px-sm py-xs rounded font-label-bold text-xs uppercase hover:bg-white/10"
            >
              Iniciar Sesión
            </Link>
          )}
          <button className="material-symbols-outlined text-white opacity-80 hover:opacity-100 transition-opacity">
            notifications
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-md md:px-gutter">
        {children}
      </main>

      {/* Bottom Navigation Bar for Mobile & Quick Access */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-sm pb-safe h-20 bg-brand-surface border-t border-brand-outline-variant shadow-[0px_-4px_20px_rgba(0,31,63,0.08)] z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'text-brand-secondary bg-brand-secondary-container/20 rounded-full px-4 py-1 scale-95'
                  : 'text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
              >
                {item.icon}
              </span>
              <span className="font-label-bold text-[12px] mt-xs">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile / Access Link */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center transition-all ${
            location.pathname === '/login' || location.pathname.startsWith('/admin')
              ? 'text-brand-secondary bg-brand-secondary-container/20 rounded-full px-4 py-1 scale-95'
              : 'text-brand-on-surface-variant hover:text-brand-primary'
          }`}
        >
          <span className="material-symbols-outlined">
            {user?.role && user.role !== 'hincha' ? 'admin_panel_settings' : 'person'}
          </span>
          <span className="font-label-bold text-[12px] mt-xs">
            {user?.role && user.role !== 'hincha' ? 'Admin' : 'Acceso'}
          </span>
        </button>
      </nav>
    </div>
  );
};
