import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, X } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

interface Service {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  category: string | null
  isActive: boolean
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', durationMinutes: 30, price: 0, category: '' })
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services')
      setServices(data)
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/services', form)
      setShowModal(false)
      setForm({ name: '', description: '', durationMinutes: 30, price: 0, category: '' })
      loadServices()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar serviço')
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
          <h1 className="text-2xl font-display font-bold text-gold-500">Serviços</h1>
          <p className="text-gold-500/60">Catálogo de serviços do salão</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-12 text-center">
          <p className="text-gold-500/50">Nenhum serviço cadastrado</p>
          <p className="text-sm text-gold-500/40 mt-1">Clique em "Novo Serviço" para adicionar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-salon-dark rounded-xl border border-gold-500/20 p-6 hover:border-gold-500/40 transition-colors">
              <h3 className="font-display font-semibold text-white">{service.name}</h3>
              {service.category && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gold-500/10 text-gold-500 rounded border border-gold-500/20">
                  {service.category}
                </span>
              )}
              {service.description && (
                <p className="text-sm text-gray-400 mt-2">{service.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-gold-500/10 flex items-center justify-between">
                <span className="text-sm text-gold-500/60">{service.durationMinutes} min</span>
                <span className="text-lg font-bold text-gold-500">{formatCurrency(service.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-salon-dark border border-gold-500/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-gold-500">Novo Serviço</h2>
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
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gold-500/80 mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                    min={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold-500/80 mb-1">Preço (€)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                    min={0}
                    step={0.5}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  placeholder="Ex: Corte, Coloração, Tratamento"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold-500 text-salon-black py-2 rounded-lg hover:bg-gold-400 font-bold"
              >
                Criar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
