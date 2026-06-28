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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-salon-black rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} className="text-gold-500" /> : <Menu size={24} className="text-gold-500" />}
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-salon-black border-r border-gold-500/20 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gold-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                <Scissors size={20} className="text-salon-black" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gold-500">Elaine</h1>
                <p className="text-xs text-gold-500/70 tracking-widest">CABELEIREIRO</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
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
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gold-500/10 text-gold-500 border-l-2 border-gold-500' 
                      : 'text-gray-400 hover:bg-gold-500/5 hover:text-gold-500/80'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gold-500/20">
            <div className="px-4 py-3 bg-salon-dark rounded-lg">
              <p className="text-sm font-medium text-gold-500">{user?.name}</p>
              <p className="text-xs text-gold-500/60 mt-1">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
