import { useState } from 'react'
import { formatCurrency } from '../utils/currency'

export default function ReportsPage() {
  const [dateRange] = useState('month')

  const reports = [
    { label: 'Total de Atendimentos', value: '234', change: '+12%' },
    { label: 'Faturamento', value: formatCurrency(18450), change: '+8%' },
    { label: 'Novos Clientes', value: '45', change: '+23%' },
    { label: 'Ticket Médio', value: formatCurrency(78.80), change: '-2%' },
  ]

  const topServices = [
    { name: 'Corte Feminino', count: 89, revenue: 7120 },
    { name: 'Corte Masculino', count: 67, revenue: 3350 },
    { name: 'Barba', count: 45, revenue: 1350 },
    { name: 'Pintura', count: 23, revenue: 3450 },
    { name: 'Escova', count: 38, revenue: 2280 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-gold-500">Relatórios</h1>
          <p className="text-gold-500/60">Análise de desempenho do salão</p>
        </div>
        <select
          value={dateRange}
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
            <span className={`text-sm font-medium ${report.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {report.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Serviços Mais Solicitados</h2>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white">{service.name}</span>
                  <span className="text-sm text-gold-500/60">{service.count} atendimentos</span>
                </div>
                <div className="w-full bg-salon-black rounded-full h-2">
                  <div
                    className="bg-gold-500 h-2 rounded-full"
                    style={{ width: `${(service.count / topServices[0].count) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gold-500/50 mt-1">{formatCurrency(service.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Atendimentos por Dia</h2>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => {
              const value = Math.floor(Math.random() * 20) + 10
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gold-500/60 w-16">Dia {7 - i}</span>
                  <div className="flex-1 bg-salon-black rounded-full h-6">
                    <div
                      className="bg-gold-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(value / 30) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-salon-black">{value}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
