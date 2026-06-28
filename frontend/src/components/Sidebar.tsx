import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Calendar, 
  Clock, 
  BarChart3, 
  Settings,
  Briefcase,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTIONIST', 'STYLIST'] },
  { path: '/clients', label: 'Clientes', icon: Users, roles: ['ADMIN', 'RECEPTIONIST', 'STYLIST'] },
  { path: '/services', label: 'Serviços', icon: Scissors, roles: ['ADMIN', 'RECEPTIONIST', 'STYLIST'] },
  { path: '/appointments', label: 'Atendimentos', icon: Calendar, roles: ['ADMIN', 'RECEPTIONIST', 'STYLIST'] },
  { path: '/schedule', label: 'Agenda', icon: Clock, roles: ['ADMIN', 'RECEPTIONIST', 'STYLIST'] },
  { path: '/professionals', label: 'Profissionais', icon: Briefcase, roles: ['ADMIN', 'STYLIST'] },
  { path: '/reports', label: 'Relatórios', icon: BarChart3, roles: ['ADMIN', 'RECEPTIONIST'] },
  { path: '/admin', label: 'Administração', icon: Settings, roles: ['ADMIN'] },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const userRole = user?.role || ''

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">SA Salão</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Agendamento</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
