import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { formatCurrency } from '../utils/currency'

interface DashboardStats {
  todayAppointments: number
  totalCustomers: number
  totalServices: number
  monthRevenue: number
}

interface Appointment {
  id: string
  startTime: string
  customer: { name: string }
  service: { name: string }
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalCustomers: 0,
    totalServices: 0,
    monthRevenue: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [statsRes, appointmentsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/appointments', {
          params: { startDate: today.toISOString(), endDate: tomorrow.toISOString() }
        })
      ])

      setStats(statsRes.data)
      setRecentAppointments(appointmentsRes.data.slice(0, 5))
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado'
      case 'SCHEDULED': return 'Aguardando'
      case 'COMPLETED': return 'Concluído'
      case 'CANCELLED': return 'Cancelado'
      case 'NO_SHOW': return 'Não Compareceu'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  const statsList = [
    { label: 'Atendimentos Hoje', value: stats.todayAppointments.toString() },
    { label: 'Clientes', value: stats.totalCustomers.toString() },
    { label: 'Serviços', value: stats.totalServices.toString() },
    { label: 'Faturamento do Mês', value: formatCurrency(stats.monthRevenue) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gold-500">Dashboard</h1>
        <p className="text-gold-500/60">Visão geral do salão</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <div key={stat.label} className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
            <p className="text-2xl font-bold text-gold-500">{stat.value}</p>
            <p className="text-sm text-gold-500/60 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
        <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Próximos Atendimentos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold-500/20">
                <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Horário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Serviço</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt) => {
                const time = new Date(apt.startTime)
                return (
                  <tr key={apt.id} className="border-b border-gold-500/10 last:border-0 hover:bg-gold-500/5">
                    <td className="py-3 px-4 text-sm font-medium text-white">
                      {time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">{apt.customer.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{apt.service.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {recentAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gold-500/50">Nenhum atendimento hoje</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
