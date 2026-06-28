import { useAuth } from '../context/AuthContext'
import { LogOut, Bell, Search } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-salon-black border-b border-gold-500/20">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500/50" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-salon-dark border border-gold-500/20 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-gold-500 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gold-500/70 hover:bg-gold-500/10 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gold-500">{user?.name}</p>
              <p className="text-xs text-gold-500/60">{user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'RECEPTIONIST' ? 'Recepcionista' : 'Profissional'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gold-500/70 hover:bg-gold-500/10 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
