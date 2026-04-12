import { useState } from 'react'

interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number
  category: string
}

export default function ServicesPage() {
  const [services] = useState<Service[]>([
    { id: '1', name: 'Corte Feminino', durationMinutes: 45, price: 80, category: 'Corte' },
    { id: '2', name: 'Corte Masculino', durationMinutes: 30, price: 50, category: 'Corte' },
    { id: '3', name: 'Barba', durationMinutes: 20, price: 30, category: 'Barba' },
    { id: '4', name: 'Pintura', durationMinutes: 90, price: 150, category: 'Coloração' },
    { id: '5', name: 'Escova', durationMinutes: 40, price: 60, category: 'Finalização' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500">Catálogo de serviços do salão</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          + Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              {service.category}
            </span>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">{service.durationMinutes} min</span>
              <span className="text-lg font-bold text-purple-600">R$ {service.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
