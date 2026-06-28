import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, X, Calendar } from 'lucide-react'

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
  customer: { id: string; name: string; phone: string | null }
  service: { id: string; name: string; durationMinutes: number; price: number }
  staff: { id: string; user: { name: string } }
}

interface Customer {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number
}

interface Staff {
  id: string
  user: { id: string; name: string }
}

export default function AppointmentsPage() {
  const { user, staff } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [form, setForm] = useState({ customerId: '', serviceId: '', staffId: '', startTime: '', notes: '' })
  const [error, setError] = useState('')

  const isProfessional = user?.role === 'STYLIST'
  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const startDate = new Date(selectedDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(selectedDate)
      endDate.setHours(23, 59, 59, 999)

      const params: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }

      if (isProfessional) {
        params.my = 'true'
      }

      const [aptRes, custRes, servRes, staffRes] = await Promise.all([
        api.get('/appointments', { params }),
        api.get('/clients'),
        api.get('/services'),
        api.get('/staff')
      ])

      setAppointments(aptRes.data)
      setCustomers(custRes.data)
      setServices(servRes.data)
      setStaffList(staffRes.data)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const start = new Date(form.startTime)
      if (isNaN(start.getTime())) {
        setError('Data/hora inválida')
        return
      }
      await api.post('/appointments', {
        customerId: form.customerId,
        serviceId: form.serviceId,
        staffId: isProfessional ? staff?.id : form.staffId,
        startTime: start.toISOString(),
        notes: form.notes
      })
      setShowModal(false)
      setForm({ customerId: '', serviceId: '', staffId: '', startTime: '', notes: '' })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status })
      loadData()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Aguardando'
      case 'CONFIRMED': return 'Confirmado'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      case 'NO_SHOW': return 'Não Compareceu'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'SCHEDULED': return 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
      case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      case 'NO_SHOW': return 'bg-red-500/20 text-red-400 border border-red-500/30'
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
          <h1 className="text-2xl font-display font-bold text-gold-500">Atendimentos</h1>
          <p className="text-gold-500/60">Gerencie os agendamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold"
        >
          <Plus size={20} />
          Novo Atendimento
        </button>
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 p-4 rounded-xl text-center transition-all ${
                date.toDateString() === selectedDate.toDateString()
                  ? 'bg-gold-500 text-salon-black'
                  : 'bg-salon-black text-gold-500/70 hover:bg-gold-500/10 border border-gold-500/20'
              }`}
            >
              <p className="text-xs">
                {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </p>
              <p className="text-xl font-bold">{date.getDate()}</p>
            </button>
          ))}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gold-500/50">
            <Calendar size={40} className="mx-auto mb-3 text-gold-500/30" />
            <p>Nenhum atendimento para esta data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const time = new Date(apt.startTime)
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-salon-black rounded-xl border border-gold-500/10"
                >
                  <div className="p-2 bg-gold-500/10 text-gold-500 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-400">
                      {apt.customer.name} • {apt.service.name}
                    </p>
                    <p className="text-xs text-gold-500/60">
                      {apt.staff.user.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                    {apt.status === 'SCHEDULED' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                          className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 border border-green-500/30"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                          className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 border border-red-500/30"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                        className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 border border-blue-500/30"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-salon-dark border border-gold-500/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-display font-semibold text-gold-500">Novo Atendimento</h2>
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
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Cliente</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Serviço</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} - {s.durationMinutes}min</option>
                  ))}
                </select>
              </div>
              {!isProfessional && (
                <div>
                  <label className="block text-sm font-medium text-gold-500/80 mb-1">Profissional</label>
                  <select
                    value={form.staffId}
                    onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                    className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                    required
                  >
                    <option value="">Selecione um profissional</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.user.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gold-500/80 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-white"
                  required
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
                Criar Atendimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
