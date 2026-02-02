import { useAuthStore } from '@/lib/store';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Star, 
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOverview() {
  const { user } = useAuthStore();

  if (user?.role === 'montador') {
    return <MontadorOverview user={user} />;
  }
  
  return <PartnerOverview user={user} />;
}

function StatCard({ title, value, icon: Icon, color, link }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
        {link && (
          <Link to={link} className="text-xs font-medium text-gray-400 hover:text-blue-600">
            Ver tudo
          </Link>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function MontadorOverview({ user }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Olá, {user.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">Aqui está o resumo da sua agenda hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Serviços Hoje" 
          value="2" 
          icon={CalendarIcon} 
          color="blue" 
          link="/dashboard/schedule"
        />
        <StatCard 
          title="Oportunidades" 
          value="5" 
          icon={AlertCircle} 
          color="yellow" 
          link="/dashboard/opportunities"
        />
        <StatCard 
          title="Concluídos (Mês)" 
          value="12" 
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          title="Sua Nota" 
          value="4.9" 
          icon={Star} 
          color="purple" 
        />
      </div>

      {/* Next Service Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Próximo Serviço</h2>
        <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex-shrink-0 bg-blue-600 text-white rounded-lg p-3 text-center min-w-[60px]">
            <span className="block text-xs font-medium uppercase">Fev</span>
            <span className="block text-xl font-bold">02</span>
          </div>
          <div className="ml-4 flex-grow">
            <h3 className="font-semibold text-blue-900">Montagem de Guarda-Roupa Casal</h3>
            <p className="text-sm text-blue-700 mt-1">Cliente: Maria Silva • Centro</p>
            <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
              <Clock className="w-4 h-4 mr-1" />
              14:00 - 16:00
            </div>
          </div>
          <button className="text-sm bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 font-medium transition-colors">
            Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerOverview({ user }: any) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Painel da Empresa
          </h1>
          <p className="text-gray-600">Gerencie seus serviços e montadores parceiros.</p>
        </div>
        <Link 
          to="/dashboard/services/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Serviço
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Serviços Abertos" 
          value="3" 
          icon={Briefcase} 
          color="blue" 
          link="/dashboard/services"
        />
        <StatCard 
          title="Em Andamento" 
          value="1" 
          icon={Clock} 
          color="yellow" 
        />
        <StatCard 
          title="Montadores Ativos" 
          value="4" 
          icon={Users} 
          color="green" 
          link="/dashboard/montadores"
        />
      </div>

      {/* Recent Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Serviços Recentes</h2>
          <Link to="/dashboard/services" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Montagem Mesa de Escritório</h4>
                <p className="text-sm text-gray-500">Criado em 01/02/2025 • Cliente: João Pedro</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Aberto
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
