import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Calendar } from 'lucide-react';

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Whapy CRM</h1>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link
            href="/crm"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          <Link
            href="/crm/leads"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Users className="w-5 h-5" />
            Leads
          </Link>
          
          <Link
            href="/crm/budgets"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <FileText className="w-5 h-5" />
            Presupuestos
          </Link>
          
          <Link
            href="/crm/meetings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Calendar className="w-5 h-5" />
            Reuniones
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}