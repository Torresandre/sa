export default function SchedulePage() {
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  
  const staff = [
    { id: '1', name: 'Ana', color: 'bg-gold-500' },
    { id: '2', name: 'Carlos', color: 'bg-gold-300' },
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
        <h1 className="text-2xl font-display font-bold text-gold-500">Agenda</h1>
        <p className="text-gold-500/60">Visualização semanal dos profissionais</p>
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="p-2"></div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-2 text-center">
                <p className="text-xs text-gold-500/60">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold text-white">{day.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-2">
                <div className="p-2 text-sm text-gold-500/70">
                  {time}
                </div>
                {weekDays.map((_, dayIndex) => (
                  <div key={dayIndex} className="p-1 min-h-[60px] bg-salon-black rounded border border-gold-500/10 hover:border-gold-500/30 transition-colors">
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
            <span className="text-sm text-gold-500/70">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
