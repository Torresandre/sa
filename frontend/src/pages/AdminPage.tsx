import { useState } from 'react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')

  const users = [
    { id: '1', name: 'Ana Silva', email: 'ana@salon.com', role: 'ADMIN', isActive: true },
    { id: '2', name: 'Carlos Santos', email: 'carlos@salon.com', role: 'STYLIST', isActive: true },
    { id: '3', name: 'Maria Costa', email: 'maria@salon.com', role: 'STYLIST', isActive: true },
    { id: '4', name: 'João Oliveira', email: 'joao@salon.com', role: 'RECEPTIONIST', isActive: false },
  ]

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'RECEPTIONIST': return 'Recepcionista'
      case 'STYLIST': return 'Profissional'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700'
      case 'RECEPTIONIST': return 'bg-blue-100 text-blue-700'
      case 'STYLIST': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
        <p className="text-gray-500">Configurações do sistema</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 border-b-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          👥 Usuários
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-3 border-b-2 ${
            activeTab === 'services'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          ✂️ Serviços
        </button>
        <button
          onClick={() => setActiveTab('salon')}
          className={`px-4 py-3 border-b-2 ${
            activeTab === 'salon'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          🏠 Salão
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Usuários do Sistema</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              + Novo Usuário
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Função</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Serviços</h2>
          <p className="text-gray-500">Gerencie os serviços oferecidos pelo salão.</p>
        </div>
      )}

      {activeTab === 'salon' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Salão</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Salão</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="SA Salão" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="Rua Example, 123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="(11) 99999-9999" />
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">Salvar Alterações</button>
          </div>
        </div>
      )}
    </div>
  )
}
