import { useAuthStore } from '@/lib/store';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Star, 
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardOverview() {
  const { user } = useAuthStore();

  if (user?.role === 'montador') {
    return <MontadorOverview user={user} />;
  }
  
  return <PartnerOverview user={user} />;
}

function StatCard({ title, value, icon: Icon, color, link, subtext }: any) {
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
      <div className="flex items-end gap-2">
         <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
         {subtext && <span className="text-xs text-gray-400 mb-1.5">{subtext}</span>}
      </div>
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
  const [stats, setStats] = useState({
    openServices: 0,
    activeServices: 0,
    completedMonth: 0,
    totalSpent: 0,
    activeMontadores: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      try {
        // Fetch Services Stats
        const { data: services } = await supabase
          .from('services')
          .select('status, price, created_at')
          .eq('owner_id', user.id);

        if (services) {
            const open = services.filter(s => s.status === 'open' || s.status === 'published').length;
            const active = services.filter(s => s.status === 'accepted' || s.status === 'scheduled' || s.status === 'in_progress').length;
            const completed = services.filter(s => s.status === 'completed').length; // Should filter by month in real app
            const spent = services
                .filter(s => s.status === 'completed')
                .reduce((acc, curr) => acc + (curr.price || 0), 0);

            setStats(prev => ({
                ...prev,
                openServices: open,
                activeServices: active,
                completedMonth: completed,
                totalSpent: spent
            }));
        }

        // Fetch Active Montadores (Partnerships)
        const { count } = await supabase
            .from('partnerships')
            .select('*', { count: 'exact', head: true })
            .eq('marcenaria_id', user.id)
            .eq('status', 'active');
        
        setStats(prev => ({ ...prev, activeMontadores: count || 0 }));

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Painel Corporativo
          </h1>
          <p className="text-gray-600">
            {user.company_name ? user.company_name : 'Minha Empresa'} • Visão Geral
          </p>
        </div>
        <Link 
          to="/dashboard/services/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Serviço
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Em Aberto" 
          value={loading ? '-' : stats.openServices} 
          icon={Briefcase} 
          color="blue" 
          link="/dashboard/services"
        />
        <StatCard 
          title="Em Andamento" 
          value={loading ? '-' : stats.activeServices} 
          icon={Activity} 
          color="yellow" 
        />
        <StatCard 
          title="Gasto Total (Mês)" 
          value={loading ? '-' : `R$ ${stats.totalSpent.toLocaleString('pt-BR')}`}
          icon={DollarSign} 
          color="green" 
          subtext="Investido"
        />
        <StatCard 
          title="Montadores Parceiros" 
          value={loading ? '-' : stats.activeMontadores} 
          icon={Users} 
          color="purple" 
          link="/dashboard/ranking"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Services */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Serviços Recentes</h2>
            <Link to="/dashboard/services" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
            </div>
            {/* We would fetch real recent services here */}
            <div className="divide-y divide-gray-100 p-8 text-center text-gray-500 text-sm">
                Carregando atividades recentes...
            </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
                <Link to="/dashboard/services/new" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                    <div className="font-medium text-slate-700 flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-blue-600" /> Publicar Serviço
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">Crie uma nova ordem de serviço</p>
                </Link>
                <Link to="/dashboard/ranking" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                    <div className="font-medium text-slate-700 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-600" /> Buscar Montadores
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">Encontre novos parceiros</p>
                </Link>
                 <Link to="/dashboard/profile" className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                    <div className="font-medium text-slate-700 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" /> Relatórios
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">Ver desempenho detalhado</p>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
