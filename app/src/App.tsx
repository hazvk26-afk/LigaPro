import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { HomeHincha } from './pages/HomeHincha';
import { TablaPosiciones } from './pages/TablaPosiciones';
import { Fixture } from './pages/Fixture';
import { DetallePartido } from './pages/DetallePartido';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProgramacionPartido } from './pages/ProgramacionPartido';
import { GestionSanciones } from './pages/GestionSanciones';
import { PerfilAdmin } from './pages/PerfilAdmin';

const PublicLayoutWrapper = () => (
  <PublicLayout>
    <Outlet />
  </PublicLayout>
);

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing / Login route */}
          <Route path="/login" element={<Login />} />

          {/* Public Fan Routes */}
          <Route element={<PublicLayoutWrapper />}>
            <Route path="/" element={<HomeHincha />} />
            <Route path="/fixture" element={<Fixture />} />
            <Route path="/tabla-posiciones" element={<TablaPosiciones />} />
            <Route path="/partidos/:id" element={<DetallePartido />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/partidos/nuevo" element={<ProgramacionPartido />} />
            <Route path="/admin/partidos/:id/editar" element={<ProgramacionPartido />} />
            <Route path="/admin/sanciones" element={<GestionSanciones />} />
            <Route path="/admin/perfil" element={<PerfilAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
