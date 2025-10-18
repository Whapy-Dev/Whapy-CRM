import { Card } from '@/components/ui/card';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';

export default function CRMDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Resumen del CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Presupuestos</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reuniones</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversión</p>
              <p className="text-3xl font-bold">0%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
        <p className="text-gray-600">No hay actividad reciente</p>
      </Card>
    </div>
  );
}