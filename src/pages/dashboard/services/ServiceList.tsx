import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, User, Search, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ServiceList() {
  const { user } = useAuthStore();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchServices();
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus Serviços</h1>
          <p className="text-gray-600">Gerencie todas as montagens publicadas.</p>
        </div>
        <Link 
          to="/dashboard/services/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-md transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Serviço
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'open', 'accepted', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Todos' : 
               status === 'open' ? 'Abertos' :
               status === 'accepted' ? 'Aceitos' : 'Concluídos'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            placeholder="Buscar serviço..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum serviço encontrado</h3>
          <p className="text-gray-500 mt-1">Publique seu primeiro serviço de montagem agora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col relative group">
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
                service.status === 'open' ? 'bg-green-500' :
                service.status === 'accepted' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              
              <div className="flex justify-between items-start mb-3 pl-3">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                  service.status === 'open' ? 'bg-green-100 text-green-700' :
                  service.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.status === 'open' ? 'Aberto' : 
                   service.status === 'accepted' ? 'Agendado' : service.status}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {service.price ? `R$ ${service.price}` : '-'}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mb-2 pl-3 line-clamp-1">{service.title}</h3>
              
              <div className="space-y-2 pl-3 text-sm text-gray-600 flex-grow">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {format(parseISO(service.scheduled_for), "dd/MM/yyyy 'às' HH:mm")}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {service.client_name}
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  <span className="line-clamp-2">{service.address_full}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 pl-3 flex justify-end">
                <button className="text-blue-600 font-medium text-sm hover:underline">
                  Gerenciar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
