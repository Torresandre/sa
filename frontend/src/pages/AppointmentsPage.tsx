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
      case 'CONFIRMED': return 'bg-green-100 text-green-700'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-gray-200 text-gray-600'
      case 'NO_SHOW': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
          <p className="text-gray-500">Gerencie os agendamentos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} />
          Novo Atendimento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 p-4 rounded-xl text-center transition-colors ${
                date.toDateString() === selectedDate.toDateString()
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
          <div className="text-center py-8 text-gray-500">
            <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Nenhum atendimento para esta data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const time = new Date(apt.startTime)
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {apt.customer.name} • {apt.service.name}
                    </p>
                    <p className="text-xs text-gray-400">
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
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Novo Atendimento</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                  <select
                    value={form.staffId}
                    onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
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
