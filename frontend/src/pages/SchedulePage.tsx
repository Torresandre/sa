export default function SchedulePage() {
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  
  const staff = [
    { id: '1', name: 'Ana', color: 'bg-pink-500' },
    { id: '2', name: 'Carlos', color: 'bg-blue-500' },
  ]

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - today.getDay() + 1 + i)
    return date
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-500">Visualização semanal dos profissionais</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="p-2"></div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-2 text-center">
                <p className="text-xs text-gray-500">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold text-gray-900">{day.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                <div className="p-2 text-sm text-gray-500">
                  ⏰ {time}
                </div>
                {weekDays.map((_, dayIndex) => (
                  <div key={dayIndex} className="p-1 min-h-[60px] bg-gray-50 rounded border border-gray-100">
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${s.color}`}></div>
            <span className="text-sm text-gray-600">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
