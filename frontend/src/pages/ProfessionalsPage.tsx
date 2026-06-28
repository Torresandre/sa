import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { UserPlus, X } from 'lucide-react'

interface Professional {
  id: string
  isActive: boolean
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function ProfessionalsPage() {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STYLIST' })
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      const { data } = await api.get('/staff')
      setProfessionals(data)
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/staff', form)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'STYLIST' })
      loadProfessionals()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar profissional')
    }
  }

  const handleToggleActive = async (professional: Professional) => {
    try {
      await api.put(`/staff/${professional.id}`, {
        isActive: !professional.isActive
      })
      loadProfessionals()
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'RECEPTIONIST': return 'Recepcionista'
      case 'STYLIST': return 'Profissional'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
      case 'RECEPTIONIST': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'STYLIST': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-gold-500">Profissionais</h1>
          <p className="text-gold-500/60">Gerencie os profissionais do salão</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold"
          >
            <UserPlus size={20} />
            Novo Profissional
          </button>
        )}
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold-500/20 bg-salon-black">
              <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Nome</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Função</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Status</th>
              {isAdmin && <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {professionals.map((prof) => (
              <tr key={prof.id} className="border-b border-gold-500/10 hover:bg-gold-500/5">
                <td className="py-3 px-4 text-sm font-medium text-white">{prof.user.name}</td>
                <td className="py-3 px-4 text-sm text-gray-400">{prof.user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(prof.user.role)}`}>
                    {getRoleLabel(prof.user.role)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    prof.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {prof.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(prof)}
                      className={`text-sm px-3 py-1 rounded ${
                        prof.isActive
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                      }`}
                    >
                      {prof.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {professionals.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-gold-500/50">
                  Nenhum profissional encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-salon-dark border border-gold-500/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-gold-500">Novo Profissional</h2>
              <button onClick={() => setShowModal(false)} className="text-gold-500/70 hover:text-gold-500">
                <X size={20} />
              </button>
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Senha</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Função</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                >
                  <option value="STYLIST">Profissional</option>
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-gold-500 text-salon-black py-2 rounded-lg hover:bg-gold-400 font-bold"
              >
                Criar Profissional
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
