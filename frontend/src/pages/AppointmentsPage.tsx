import { useState } from 'react'

interface Appointment {
  id: string
  time: string
  client: string
  service: string
  staff: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
}

export default function AppointmentsPage() {
  const [appointments] = useState<Appointment[]>([
    { id: '1', time: '09:00', client: 'Maria Silva', service: 'Corte Feminino', staff: 'Ana', status: 'confirmed' },
    { id: '2', time: '10:00', client: 'João Santos', service: 'Barba', staff: 'Carlos', status: 'scheduled' },
    { id: '3', time: '14:00', client: 'Pedro Oliveira', service: 'Corte + Barba', staff: 'Ana', status: 'confirmed' },
  ])

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado'
      case 'scheduled': return 'Aguardando'
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-gray-200 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
          <p className="text-gray-500">Gerencie os agendamentos</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          + Novo Atendimento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dates.map((date, i) => (
            <div
              key={i}
              className="flex-shrink-0 p-4 rounded-xl text-center bg-gray-50"
            >
              <p className="text-xs text-gray-500">
                {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </p>
              <p className="text-xl font-bold text-gray-900">{date.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                ⏰
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{apt.time}</p>
                <p className="text-sm text-gray-500">
                  {apt.client} • {apt.service}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                {getStatusLabel(apt.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
