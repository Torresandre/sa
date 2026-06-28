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
      case 'ADMIN': return 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
      case 'RECEPTIONIST': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'STYLIST': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gold-500">Administração</h1>
        <p className="text-gold-500/60">Configurações do sistema</p>
      </div>

      <div className="flex gap-2 border-b border-gold-500/20">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-gold-500 text-gold-500'
              : 'border-transparent text-gold-500/50 hover:text-gold-500/70'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-gold-500 text-gold-500'
              : 'border-transparent text-gold-500/50 hover:text-gold-500/70'
          }`}
        >
          Serviços
        </button>
        <button
          onClick={() => setActiveTab('salon')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'salon'
              ? 'border-gold-500 text-gold-500'
              : 'border-transparent text-gold-500/50 hover:text-gold-500/70'
          }`}
        >
          Salão
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-display font-semibold text-gold-500">Usuários do Sistema</h2>
            <button className="bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold">
              + Novo Usuário
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Função</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gold-500/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gold-500/10 last:border-0 hover:bg-gold-500/5">
                    <td className="py-3 px-4 text-sm font-medium text-white">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
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
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Gestão de Serviços</h2>
          <p className="text-gold-500/60">Gerencie os serviços oferecidos pelo salão.</p>
        </div>
      )}

      {activeTab === 'salon' && (
        <div className="bg-salon-dark rounded-xl border border-gold-500/20 p-6">
          <h2 className="text-lg font-display font-semibold text-gold-500 mb-4">Informações do Salão</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Nome do Salão</label>
              <input type="text" className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" defaultValue="Elaine Cabeleireiro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Endereço</label>
              <input type="text" className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" defaultValue="Estr. de Benfica 749, 1500-110 Lisboa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gold-500/80 mb-1">Telefone</label>
              <input type="text" className="w-full px-3 py-2 bg-salon-black border border-gold-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500" defaultValue="+351 215 853 396" />
            </div>
            <button className="bg-gold-500 text-salon-black px-4 py-2 rounded-lg hover:bg-gold-400 font-bold">Salvar Alterações</button>
          </div>
        </div>
      )}
    </div>
  )
}
