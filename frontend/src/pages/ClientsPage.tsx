import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, X } from 'lucide-react'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data } = await api.get('/clients')
      setClients(data)
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/clients', form)
      setShowModal(false)
      setForm({ name: '', phone: '', email: '', notes: '' })
      loadClients()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar cliente')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await api.delete(`/clients/${id}`)
      loadClients()
    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
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
          <h1 className="text-2xl font-display font-bold text-gold-500">Clientes</h1>
          <p className="text-gold-500/60">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gold-500/50">
            <p>Nenhum cliente cadastrado</p>
            <p className="text-sm text-gold-500/40 mt-1">Clique em "Novo Cliente" para adicionar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Telefone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gold-500/10 last:border-0 hover:bg-gold-500/5">
                    <td className="py-3 px-4 text-sm font-medium text-white">{client.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{client.phone || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{client.email || '-'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-salon-dark border border-gold-500/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-gold-500">Novo Cliente</h2>
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
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  placeholder="+351 969 779 534"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold-500 text-salon-black py-2 rounded-lg hover:bg-gold-400 font-bold"
              >
                Criar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
