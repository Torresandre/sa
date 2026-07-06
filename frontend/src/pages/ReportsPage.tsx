import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { formatCurrency } from '../utils/currency'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [summary, setSummary] = useState<any>(null)
  const [topServices, setTopServices] = useState<any[]>([])
  const [staffHistory, setStaffHistory] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const getDateParams = () => {
    const now = new Date()
    const start = new Date()
    if (dateRange === 'week') start.setDate(now.getDate() - 7)
    else if (dateRange === 'month') start.setMonth(now.getMonth() - 1)
    else start.setFullYear(now.getFullYear() - 1)
    return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = getDateParams()
        const qs = `startDate=${params.startDate}&endDate=${params.endDate}`
        const [sumRes, topRes, staffRes, dailyRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get(`/reports/top-services?${qs}`),
          api.get(`/reports/staff-history?${qs}`),
          api.get(`/reports/daily?${qs}`),
        ])
        setSummary(sumRes.data)
        setTopServices(topRes.data)
        setStaffHistory(staffRes.data)
        setDailyData(dailyRes.data)
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  const reports = summary ? [
    { label: 'Total de Atendimentos', value: String(summary.totalAppointments || 0) },
    { label: 'Faturamento do Mês', value: formatCurrency(summary.monthRevenue || 0) },
    { label: 'Novos Clientes', value: String(summary.newCustomers || 0) },
    { label: 'Ticket Médio', value: formatCurrency(summary.ticketMedio || 0) },
  ] : []

  const maxCount = topServices.length > 0 ? Math.max(...topServices.map((s: any) => s.count)) : 1
  const maxDaily = dailyData.length > 0 ? Math.max(...dailyData.map((d: any) => d.total)) : 1

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
          <h1 className="text-2xl font-display font-bold text-gold-500">Relatórios</h1>
          <p className="text-gold-500/60">Análise de desempenho do salão</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 bg-salon-dark border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
          <option value="year">Último ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <div key={report.label} className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
            <p className="text-2xl font-bold text-gold-500">{report.value}</p>
            <p className="text-sm text-gold-500/60 mt-1">{report.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Serviços Mais Solicitados</h2>
          <div className="space-y-4">
            {topServices.length === 0 && <p className="text-gold-500/40 text-sm">Sem dados no período</p>}
            {topServices.map((service: any) => (
              <div key={service.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white">{service.name}</span>
                  <span className="text-sm text-gold-500/60">{service.count} atendimentos</span>
                </div>
                <div className="w-full bg-salon-black rounded-full h-2">
                  <div className="bg-gold-500 h-2 rounded-full" style={{ width: `${(service.count / maxCount) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gold-500/50 mt-1">{formatCurrency(service.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Atendimentos por Dia</h2>
          <div className="space-y-3">
            {dailyData.length === 0 && <p className="text-gold-500/40 text-sm">Sem dados no período</p>}
            {dailyData.slice(-7).map((day: any) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-gold-500/60 w-20">{day.date.split('-').slice(1).join('/')}</span>
                <div className="flex-1 bg-salon-black rounded-full h-6">
                  <div className="bg-gold-500 h-6 rounded-full flex items-center justify-end pr-2" style={{ width: `${(day.total / maxDaily) * 100}%` }}>
                    <span className="text-xs font-medium text-salon-black">{day.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {staffHistory.length > 0 && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Histórico por Profissional</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-3 px-4 text-gold-500/70">Profissional</th>
                  <th className="text-left py-3 px-4 text-gold-500/70">Atendimentos</th>
                  <th className="text-left py-3 px-4 text-gold-500/70">Faturamento</th>
                  <th className="text-left py-3 px-4 text-gold-500/70">Serviço Mais Pedido</th>
                </tr>
              </thead>
              <tbody>
                {staffHistory.map((s: any) => (
                  <tr key={s.name} className="border-b border-gold-500/10 hover:bg-salon-black/50">
                    <td className="py-3 px-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-gold-500">{s.appointments}</td>
                    <td className="py-3 px-4 text-gold-500">{formatCurrency(s.revenue)}</td>
                    <td className="py-3 px-4 text-gold-500/60">{s.topService}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
