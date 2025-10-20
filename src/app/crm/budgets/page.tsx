'use client';

import { useState } from 'react';
import { Plus, Search, FileText, DollarSign, Calendar, Eye } from 'lucide-react';

type Budget = {
  id: string;
  lead_name: string;
  amount: number;
  status: 'borrador' | 'presentado' | 'aceptado' | 'rechazado' | 'en_revision';
  version: number;
  created_at: string;
  presented_at?: string;
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      lead_name: 'Juan Pérez - Tech Solutions',
      amount: 150000,
      status: 'presentado',
      version: 1,
      created_at: '2025-10-15T10:30:00Z',
      presented_at: '2025-10-16T15:00:00Z'
    },
    {
      id: '2',
      lead_name: 'María González - Marketing Plus',
      amount: 89000,
      status: 'borrador',
      version: 2,
      created_at: '2025-10-17T09:00:00Z'
    },
    {
      id: '3',
      lead_name: 'Carlos Rodríguez - Innovate SA',
      amount: 220000,
      status: 'aceptado',
      version: 1,
      created_at: '2025-10-10T11:20:00Z',
      presented_at: '2025-10-12T10:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const statusConfig = {
    borrador: { color: 'bg-gray-100 text-gray-800', label: 'Borrador' },
    presentado: { color: 'bg-blue-100 text-blue-800', label: 'Presentado' },
    aceptado: { color: 'bg-green-100 text-green-800', label: 'Aceptado' },
    rechazado: { color: 'bg-red-100 text-red-800', label: 'Rechazado' },
    en_revision: { color: 'bg-yellow-100 text-yellow-800', label: 'En Revisión' }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.lead_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalByStatus = (status: Budget['status']) => {
    return budgets
      .filter(b => b.status === status)
      .reduce((sum, b) => sum + b.amount, 0);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
        <p className="mt-2 text-gray-600">
          Gestiona y realiza seguimiento de todos tus presupuestos
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Presentado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalByStatus('presentado'))}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceptado</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalByStatus('aceptado'))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Revisión</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(totalByStatus('en_revision'))}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Borradores</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {budgets.filter(b => b.status === 'borrador').length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar presupuestos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Lista de Presupuestos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente / Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Versión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presentado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBudgets.map((budget) => (
              <tr key={budget.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{budget.lead_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(budget.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[budget.status].color}`}>
                    {statusConfig[budget.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  v{budget.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(budget.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {budget.presented_at 
                    ? new Date(budget.presented_at).toLocaleDateString('es-AR')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron presupuestos
          </div>
        )}
      </div>
    </div>
  );
}