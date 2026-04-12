import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ServicesPage from './pages/ServicesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import SchedulePage from './pages/SchedulePage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/clients', label: 'Clientes' },
    { path: '/services', label: 'Serviços' },
    { path: '/appointments', label: 'Atendimentos' },
    { path: '/schedule', label: 'Agenda' },
    { path: '/reports', label: 'Relatórios' },
    { path: '/admin', label: 'Administração' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-purple-600">SA Salão</h1>
          <p className="text-sm text-gray-500">Sistema de Agendamento</p>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Sair
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-end px-4 py-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              🔔
            </button>
          </div>
        </header>
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          >
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
