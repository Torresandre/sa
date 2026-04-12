import { useState } from 'react'

export default function ReportsPage() {
  const [dateRange] = useState('month')

  const reports = [
    { label: 'Total de Atendimentos', value: '234', change: '+12%' },
    { label: 'Faturamento', value: 'R$ 18.450', change: '+8%' },
    { label: 'Novos Clientes', value: '45', change: '+23%' },
    { label: 'Ticket Médio', value: 'R$ 78,80', change: '-2%' },
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
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500">Análise de desempenho do salão</p>
        </div>
        <select
          value={dateRange}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
          <option value="year">Último ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <div key={report.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-2xl font-bold text-gray-900">{report.value}</p>
            <p className="text-sm text-gray-500">{report.label}</p>
            <span className={`text-sm font-medium ${report.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {report.change}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Serviços Mais Solicitados</h2>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  <span className="text-sm text-gray-500">{service.count} atendimentos</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(service.count / topServices[0].count) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">R$ {service.revenue.toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atendimentos por Dia</h2>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => {
              const value = Math.floor(Math.random() * 20) + 10
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-16">Dia {7 - i}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(value / 30) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{value}</span>
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
