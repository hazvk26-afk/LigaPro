import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const PerfilAdmin: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('r.mendez@ligapro.ec');
  const [phone, setPhone] = useState('+593 99 876 5432');
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-gutter">
      {/* Hero Header */}
      <div 
        className="rounded-xl p-lg text-white mb-lg flex flex-col md:flex-row items-center gap-lg relative overflow-hidden bg-brand-primary"
      >
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
        </div>
        
        <div className="relative group shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-brand-secondary-container shadow-xl overflow-hidden flex items-center justify-center bg-brand-primary-container">
            {user.avatar_url ? (
              <img className="w-full h-full object-cover" src={user.avatar_url} alt="Profile" />
            ) : (
              <span className="material-symbols-outlined text-white text-[64px]">person</span>
            )}
          </div>
        </div>

        <div className="text-center md:text-left z-10 space-y-1">
          <h2 className="font-montserrat text-headline-lg font-bold leading-tight">{user.display_name}</h2>
          <p className="font-montserrat text-headline-md text-brand-secondary-container">
            {user.role === 'maintenance_chief' ? 'Director de Competiciones' : 'Administrador de Operaciones'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-sm items-center opacity-90 text-xs">
            <span className="flex items-center gap-xs font-label-bold">
              <span className="material-symbols-outlined text-sm">apartment</span> Dirección de Operaciones
            </span>
            <span className="w-1 h-1 bg-brand-secondary-container rounded-full hidden md:block"></span>
            <span className="flex items-center gap-xs font-label-bold">
              <span className="material-symbols-outlined text-sm">verified_user</span> Nivel de Credencial 4
            </span>
          </div>
        </div>

        <div className="md:ml-auto flex flex-col items-center md:items-end gap-sm z-10">
          <button 
            onClick={handleSave}
            className="bg-brand-secondary text-brand-on-secondary hover:bg-brand-secondary-container hover:text-brand-on-secondary-container px-lg py-sm font-label-bold text-xs uppercase rounded-lg shadow-md transition-all flex items-center gap-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">save</span> Guardar Cambios
          </button>
          <span className="text-brand-on-primary-container text-[10px] uppercase tracking-widest font-bold">
            Última conexión: Hace 12 min
          </span>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-xs rounded">
          Configuración y preferencias de perfil guardadas exitosamente.
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-gutter">
          {/* Personal Info */}
          <section className="bg-white rounded-xl p-lg border border-brand-outline-variant/30 shadow-sm space-y-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-brand-primary" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
              <h3 className="font-montserrat text-headline-md font-bold uppercase text-brand-primary">Información Personal</h3>
            </div>
            
            <div className="space-y-md">
              <div>
                <label className="font-barlow font-bold text-xs uppercase text-brand-on-surface-variant block mb-xs">Correo Electrónico</label>
                <input 
                  className="w-full bg-brand-surface border border-brand-outline-variant rounded px-md py-sm font-body-md focus:border-brand-secondary-container focus:ring-0 outline-none text-sm" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="font-barlow font-bold text-xs uppercase text-brand-on-surface-variant block mb-xs">Teléfono de Contacto</label>
                <input 
                  className="w-full bg-brand-surface border border-brand-outline-variant rounded px-md py-sm font-body-md focus:border-brand-secondary-container focus:ring-0 outline-none text-sm" 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="font-barlow font-bold text-xs uppercase text-brand-on-surface-variant block mb-xs">ID de Empleado</label>
                <div className="bg-brand-surface-container px-md py-sm rounded border border-brand-outline-variant/30 text-brand-on-surface-variant font-montserrat text-sm font-bold">
                  LP-2026-0042
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="bg-white rounded-xl p-lg border border-brand-outline-variant/30 shadow-sm space-y-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-brand-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <h3 className="font-montserrat text-headline-md font-bold uppercase text-brand-primary">Seguridad y Acceso</h3>
            </div>
            
            <div className="space-y-md">
              <div className="flex justify-between items-center p-md bg-brand-surface-container rounded-lg border border-brand-outline-variant/20">
                <div>
                  <p className="font-barlow font-bold text-xs text-brand-primary uppercase">Contraseña</p>
                  <p className="text-[10px] text-brand-on-surface-variant">Actualizada hace 45 días</p>
                </div>
                <button className="text-brand-secondary font-barlow font-bold text-xs uppercase hover:underline cursor-pointer">Cambiar</button>
              </div>
              
              <div className="flex justify-between items-center p-md bg-brand-surface-container rounded-lg border border-brand-outline-variant/20">
                <div>
                  <p className="font-barlow font-bold text-xs text-brand-primary uppercase">Autenticación (2FA)</p>
                  <div className="flex items-center gap-xs mt-xs">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-[10px] font-bold text-green-600 uppercase">Activo</span>
                  </div>
                </div>
                <button className="bg-brand-outline-variant/20 text-brand-on-surface-variant px-sm py-xs rounded font-barlow font-bold text-xs uppercase hover:bg-brand-outline-variant/30 cursor-pointer">Gestionar</button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-gutter">
          {/* Notification Settings */}
          <section className="bg-white rounded-xl p-lg border border-brand-outline-variant/30 shadow-sm space-y-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-brand-primary" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              <h3 className="font-montserrat text-headline-md font-bold uppercase text-brand-primary">Preferencias de Notificación</h3>
            </div>
            
            <div className="space-y-sm text-sm">
              <div className="flex items-center justify-between py-sm border-b border-brand-outline-variant/20">
                <span className="font-medium text-brand-primary">Alertas Críticas de Programación</span>
                <input 
                  type="checkbox" 
                  checked={notif1} 
                  onChange={(e) => setNotif1(e.target.checked)} 
                  className="rounded text-brand-secondary focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-sm border-b border-brand-outline-variant/20">
                <span className="font-medium text-brand-primary">Conflictos Fecha FIFA</span>
                <input 
                  type="checkbox" 
                  checked={notif2} 
                  onChange={(e) => setNotif2(e.target.checked)} 
                  className="rounded text-brand-secondary focus:ring-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-sm">
                <span className="font-medium text-brand-primary">Informes de Escenarios</span>
                <input 
                  type="checkbox" 
                  checked={notif3} 
                  onChange={(e) => setNotif3(e.target.checked)} 
                  className="rounded text-brand-secondary focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Audit Logs */}
          <section className="bg-white rounded-xl p-lg border border-brand-outline-variant/30 shadow-sm space-y-md">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-brand-primary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              <h3 className="font-montserrat text-headline-md font-bold uppercase text-brand-primary">Registro de Actividad</h3>
            </div>
            
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-brand-outline-variant/30" />
              
              <div className="space-y-lg relative">
                {/* Item 1 */}
                <div className="flex gap-lg">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center border-4 border-white shrink-0">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  </div>
                  <div>
                    <p className="font-barlow font-bold text-xs text-brand-primary uppercase">Programó LDU vs Barcelona SC</p>
                    <p className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-tighter mt-0.5">Hoy, 10:45 AM • Fecha 1 - Fase 1</p>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="flex gap-lg">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-brand-error text-white flex items-center justify-center border-4 border-white shrink-0">
                    <span className="material-symbols-outlined text-[14px]">gavel</span>
                  </div>
                  <div>
                    <p className="font-barlow font-bold text-xs text-brand-primary uppercase">Registró sanción automática a Arce</p>
                    <p className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-tighter mt-0.5">Ayer, 4:20 PM • Acumulación Tarjetas</p>
                  </div>
                </div>
                {/* Item 3 */}
                <div className="flex gap-lg">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-brand-secondary text-white flex items-center justify-center border-4 border-white shrink-0">
                    <span className="material-symbols-outlined text-[14px]">edit_document</span>
                  </div>
                  <div>
                    <p className="font-barlow font-bold text-xs text-brand-primary uppercase">Actualizó detalles del Monumental</p>
                    <p className="text-[10px] text-brand-on-surface-variant font-bold uppercase tracking-tighter mt-0.5">12 Jul, 2026 • Auditoría de Escenarios</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
