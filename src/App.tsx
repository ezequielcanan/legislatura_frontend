import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Proyectos } from './pages/Proyectos';
import { ProyectoDetalle } from './pages/ProyectoDetalle';
import { Legisladores } from './pages/Legisladores';
import { LegisladorDetalle } from './pages/LegisladorDetalle';
import { Partidos } from './pages/Partidos';
import { Consultas } from './pages/Consultas';
import { AdminPanel } from './pages/AdminPanel';
import { AccessDenied } from './pages/AccessDenied';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'unknown') {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      try { window.history.scrollRestoration = 'manual'; } catch (e) { }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const els = document.querySelectorAll<HTMLElement>('[data-reset-scroll="true"]');
    els.forEach(el => { el.scrollTop = 0; });
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/home" replace /> : <Register />}
      />
      <Route
        path="/access-denied"
        element={<AccessDenied />}
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos"
        element={
          <ProtectedRoute>
            <Proyectos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proyectos/:expedienteId"
        element={
          <ProtectedRoute>
            <ProyectoDetalle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legisladores"
        element={
          <ProtectedRoute>
            <Legisladores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legisladores/:id"
        element={
          <ProtectedRoute>
            <LegisladorDetalle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/partidos"
        element={
          <ProtectedRoute>
            <Partidos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultas"
        element={
          <ProtectedRoute>
            <Consultas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
