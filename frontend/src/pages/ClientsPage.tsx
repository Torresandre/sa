import { useState } from 'react'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export default function ClientsPage() {
  const [clients] = useState<Client[]>([
    { id: '1', name: 'Maria Silva', phone: '(11) 99999-9999', email: 'maria@email.com' },
    { id: '2', name: 'João Santos', phone: '(11) 88888-8888', email: 'joao@email.com' },
    { id: '3', name: 'Ana Costa', phone: '(11) 77777-7777', email: 'ana@email.com' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gerencie seus clientes</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          + Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.email}</td>
                  <td className="py-3 px-4">
                    <button className="text-purple-600 hover:text-purple-800 mr-2">Editar</button>
                    <button className="text-red-600 hover:text-red-800">Excluir</button>
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
