import { useState, useEffect } from 'react'
import { api } from '../services/api'

const DAYS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
  CONFIRMED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  COMPLETED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  NO_SHOW: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não Compareceu',
}

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const weekStart = weekDays[0].toISOString().split('T')[0]
  const weekEnd = weekDays[6].toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
  }, [weekStart, weekEnd])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [aptRes, staffRes, schedRes] = await Promise.all([
        api.get(`/appointments?startDate=${weekStart}&endDate=${weekEnd}`),
        api.get('/staff'),
        api.get('/schedules'),
      ])
      setAppointments(aptRes.data)
      setStaffList(staffRes.data)
      setSchedules(schedRes.data)
    } catch (err) {
      console.error('Erro ao carregar agenda:', err)
    } finally {
      setLoading(false)
    }
  }

  const prevWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() - 7)
    setCurrentWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + 7)
    setCurrentWeekStart(d)
  }

  const getAptForSlot = (dayIndex: number, time: string) => {
    const dayDate = weekDays[dayIndex]
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime)
      const aptDay = aptDate.toISOString().split('T')[0]
      const aptHour = `${String(aptDate.getHours()).padStart(2, '0')}:${String(aptDate.getMinutes()).padStart(2, '0')}`
      return aptDay === dayDate.toISOString().split('T')[0] && aptHour === time
    })
  }

  const getScheduleForStaff = (staffId: string, dayIndex: number) => {
    return schedules.find((s: any) => s.staffId === staffId && s.dayOfWeek === dayIndex + 1 && s.isAvailable)
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
          <h1 className="text-2xl font-display font-bold text-gold-500">Agenda Semanal</h1>
          <p className="text-gold-500/60">{weekStart} a {weekEnd}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevWeek} className="px-4 py-2 bg-salon-dark border border-gold-500/30 rounded-lg text-gold-500 hover:bg-gold-500/10">← Anterior</button>
          <button onClick={() => setCurrentWeekStart(() => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); d.setHours(0,0,0,0); return d })} className="px-4 py-2 bg-gold-500 text-salon-black rounded-lg hover:bg-gold-400 font-bold">Hoje</button>
          <button onClick={nextWeek} className="px-4 py-2 bg-salon-dark border border-gold-500/30 rounded-lg text-gold-500 hover:bg-gold-500/10">Próximo →</button>
        </div>
      </div>

      <div className="bg-salon-dark rounded-xl border border-gold-500/20 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 border-b border-gold-500/20">
            <div className="p-3 text-sm text-gold-500/60 border-r border-gold-500/10">Horário</div>
            {weekDays.map((day, i) => {
              const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
              return (
                <div key={i} className={`p-3 text-center border-r border-gold-500/10 last:border-r-0 ${isToday ? 'bg-gold-500/10' : ''}`}>
                  <div className="text-xs text-gold-500/60">{DAYS_PT[i]}</div>
                  <div className={`text-sm font-medium ${isToday ? 'text-gold-500' : 'text-white'}`}>{day.getDate()}</div>
                </div>
              )
            })}
          </div>

          {TIME_SLOTS.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-gold-500/10 last:border-b-0">
              <div className="p-3 text-xs text-gold-500/60 border-r border-gold-500/10 flex items-start">{time}</div>
              {weekDays.map((day, dayIndex) => {
                const apts = getAptForSlot(dayIndex, time)
                return (
                  <div key={dayIndex} className="border-r border-gold-500/10 last:border-r-0 p-1 min-h-[60px]">
                    {apts.map((apt: any) => (
                      <div key={apt.id} className={`text-xs p-1.5 rounded mb-1 ${STATUS_COLORS[apt.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        <div className="font-medium truncate">{apt.customer?.name || 'Cliente'}</div>
                        <div className="truncate text-[10px] opacity-70">{apt.service?.name || ''}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {staffList.length > 0 && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-4">
          <h3 className="text-sm font-medium text-gold-500/70 mb-2">Profissionais</h3>
          <div className="flex gap-4 flex-wrap">
            {staffList.map((s: any, i: number) => {
              const colors = ['bg-gold-500', 'bg-gold-300', 'bg-amber-500', 'bg-yellow-500']
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${colors[i % colors.length]}`}></div>
                  <span className="text-sm text-white">{s.user?.name || 'Profissional'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
