import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

export default function Opportunities() {
  const { user } = useAuthStore();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserSkills();
      fetchOpportunities();
    }
  }, [user]);

  const fetchUserSkills = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('skills').eq('id', user.id).single();
    if (data && data.skills) {
      setUserSkills(data.skills);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      // RLS Policy "Montador view qualified services" will automatically filter:
      // 1. Status = 'open'
      // 2. User has required skills (or service has none)
      // 3. User has active partnership with owner
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:owner_id (company_name, full_name)
        `)
        .eq('status', 'open')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja aceitar este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          status: 'accepted',
          montador_id: user?.id
        })
        .eq('id', serviceId);

      if (error) {
        // If RLS blocks update (e.g. skills changed mid-way), this catches it
        alert('Acesso negado: qualificação insuficiente ou serviço indisponível.');
        return;
      }

      alert('Serviço aceito com sucesso! Verifique sua agenda.');
      fetchOpportunities(); // Refresh list
    } catch (error) {
      console.error('Error accepting service:', error);
      alert('Erro ao aceitar serviço.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Oportunidades</h1>
        <p className="text-gray-600">Serviços disponíveis compatíveis com seu perfil.</p>
      </div>

      {/* Skills Summary */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start">
        <Briefcase className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Suas Qualificações Ativas</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {userSkills.length > 0 ? (
              userSkills.map(skill => (
                <span key={skill} className="bg-white text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-blue-600 italic">Nenhuma especialidade cadastrada. Vá em Perfil para adicionar.</span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhuma oportunidade no momento</h3>
          <p className="text-gray-500 mt-1 max-w-md mx-auto">
            Não encontramos serviços abertos compatíveis com suas qualificações ou parceiros vinculados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase">
                  Disponível
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {service.price ? `R$ ${service.price}` : 'A combinar'}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{service.title}</h3>
              <p className="text-xs text-gray-500 mb-4">
                Por: {service.profiles?.company_name || service.profiles?.full_name || 'Parceiro'}
              </p>
              
              <div className="space-y-3 text-sm text-gray-600 flex-grow">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" />
                  {format(parseISO(service.scheduled_for), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-0.5" />
                  <span className="line-clamp-2">{service.address_full}</span>
                </div>
                {service.required_skills && service.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {service.required_skills.map((skill: string) => (
                      <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleAcceptService(service.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar Serviço
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  )
}
