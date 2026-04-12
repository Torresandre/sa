export default function DashboardPage() {
  const stats = [
    { label: 'Atendimentos Hoje', value: '12' },
    { label: 'Clientes', value: '156' },
    { label: 'Serviços', value: '24' },
    { label: 'Faturamento do Mês', value: 'R$ 12.450' },
  ]

  const recentAppointments = [
    { id: 1, client: 'Maria Silva', service: 'Corte Feminino', time: '09:00', status: 'Confirmado' },
    { id: 2, client: 'João Santos', service: 'Barba', time: '10:00', status: 'Aguardando' },
    { id: 3, client: 'Ana Costa', service: 'Pintura', time: '11:00', status: 'Confirmado' },
    { id: 4, client: 'Pedro Oliveira', service: 'Corte + Barba', time: '14:00', status: 'Confirmado' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do salão</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Atendimentos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Horário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Serviço</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{apt.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{apt.client}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{apt.service}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'Confirmado' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
