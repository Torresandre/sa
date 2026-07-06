import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [staff, setStaff] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [staffRes, servicesRes, salonRes] = await Promise.all([
        api.get('/staff'),
        api.get('/services'),
        api.get('/salon'),
      ])
      setStaff(staffRes.data)
      setServices(servicesRes.data)
      setSalon(salonRes.data)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStaff = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/staff/${id}`, { isActive: !isActive })
      setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
    } catch (err) {
      console.error('Erro ao atualizar profissional:', err)
    }
  }

  const saveSalon = async () => {
    setSaving(true)
    setMsg('')
    try {
      await api.put('/salon', salon)
      setMsg('Salão atualizado com sucesso!')
    } catch (err) {
      setMsg('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const toggleService = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/services/${id}`, { isActive: !isActive })
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err)
    }
  }

  const downloadCSV = (endpoint: string, filename: string) => {
    const token = localStorage.getItem('sa_token')
    window.open(`${api.defaults.baseURL}${endpoint}`, '_blank')
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
      <div>
        <h1 className="text-2xl font-display font-bold text-gold-500">Administração</h1>
        <p className="text-gold-500/60">Configurações do sistema</p>
      </div>

      <div className="flex gap-2 border-b border-gold-500/20">
        {['users', 'services', 'salon', 'export'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab ? 'border-gold-500 text-gold-500' : 'border-transparent text-gold-500/50 hover:text-gold-500/70'
            }`}>
            {{ users: 'Profissionais', services: 'Serviços', salon: 'Salão', export: 'Exportar' }[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Profissionais</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Função</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Ações</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: any) => (
                  <tr key={s.id} className="border-b border-gold-500/10 last:border-0 hover:bg-gold-500/5">
                    <td className="py-3 px-4 text-sm font-medium text-white">{s.user?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(s.user?.role || '')}`}>
                        {getRoleLabel(s.user?.role || '')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        s.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {s.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleStaff(s.id, s.isActive)}
                        className={`text-xs px-3 py-1 rounded ${s.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                        {s.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Serviços do Salão</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Categoria</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Duração</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Preço</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s: any) => (
                  <tr key={s.id} className="border-b border-gold-500/10 last:border-0 hover:bg-gold-500/5">
                    <td className="py-3 px-4 text-sm font-medium text-white">{s.name}</td>
                    <td className="py-3 px-4 text-sm text-gold-500/60">{s.category || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gold-500/60">{s.durationMinutes} min</td>
                    <td className="py-3 px-4 text-sm text-gold-500">{s.price} €</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        s.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {s.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleService(s.id, s.isActive)}
                        className={`text-xs px-3 py-1 rounded ${s.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                        {s.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'salon' && salon && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Informações do Salão</h2>
          {msg && <p className={`mb-4 text-sm ${msg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Nome</label>
              <input type="text" value={salon.name || ''} onChange={e => setSalon({ ...salon, name: e.target.value })}
                className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Endereço</label>
              <input type="text" value={salon.address || ''} onChange={e => setSalon({ ...salon, address: e.target.value })}
                className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Telefone</label>
              <input type="text" value={salon.phone || ''} onChange={e => setSalon({ ...salon, phone: e.target.value })}
                className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Email</label>
              <input type="email" value={salon.email || ''} onChange={e => setSalon({ ...salon, email: e.target.value })}
                className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <button onClick={saveSalon} disabled={saving}
              className="bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Exportar Dados</h2>
          <div className="space-y-4">
            <button onClick={() => downloadCSV('/export/clients', 'clientes.csv')}
              className="bg-gold-500/10 border border-gold-500/30 text-gold-500 px-6 py-3 rounded-lg hover:bg-gold-500/20 font-medium w-full text-left flex justify-between items-center">
              <span>Exportar Clientes (CSV)</span>
              <span className="text-gold-500/60">Baixar →</span>
            </button>
            <button onClick={() => downloadCSV('/export/appointments', 'agendamentos.csv')}
              className="bg-gold-500/10 border border-gold-500/30 text-gold-500 px-6 py-3 rounded-lg hover:bg-gold-500/20 font-medium w-full text-left flex justify-between items-center">
              <span>Exportar Agendamentos (CSV)</span>
              <span className="text-gold-500/60">Baixar →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
