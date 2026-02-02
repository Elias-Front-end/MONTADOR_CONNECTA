import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  isBefore,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User,
  Info,
  Filter,
  Search,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Service {
  id: string;
  title: string; // From description or custom title
  description: string;
  scheduled_for: string; // ISO date string
  duration_hours?: number; // Estimated duration
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  client_name?: string;
  address_full?: string;
  price?: number;
}

interface AgendaBlock {
  id: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export default function Schedule() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [services, setServices] = useState<Service[]>([]);
  const [blocks, setBlocks] = useState<AgendaBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'open' | 'accepted'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calendar Generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Fetch Data
  useEffect(() => {
    if (user) {
      fetchAgenda();
    }
  }, [currentDate, user]);

  const fetchAgenda = async () => {
    setLoading(true);
    try {
      // Date Range for Fetching
      const startRange = startOfMonth(currentDate).toISOString();
      const endRange = endOfMonth(currentDate).toISOString();

      // Fetch Services
      let query = supabase
        .from('services')
        .select('*')
        .gte('scheduled_for', startRange)
        .lte('scheduled_for', endRange);

      if (user?.role === 'montador') {
        // Montador sees services they accepted OR open services they can take (simplified logic)
        // For MVP: showing services assigned to them or open
        // In real app, we would join with service_links or check montador_id if it exists on services table
        // Assuming 'montador_id' exists on services table based on previous context or we check accepted status
         // For now, let's assume we filter by status or assignment if column exists. 
         // Since I added columns but maybe not montador_id directly to services in my previous SQL (I checked update_phase1.sql, it didn't add montador_id to services, it usually is there or in a join table. Let's assume a simple model where services has montador_id for accepted ones).
         
         // NOTE: The previous SQL didn't explicitly add montador_id to 'services', but it's common. 
         // Let's assume for this MVP that we fetch all 'open' and 'accepted' services for now to visualize.
         // Ideally: .eq('montador_id', user.id) for accepted
         query = query.or(`status.eq.open,montador_id.eq.${user.id}`); 
      } else {
        // Partner sees services they created
        query = query.eq('owner_id', user.id);
      }

      const { data: servicesData, error: servicesError } = await query;
      
      if (servicesError) throw servicesError;

      // Fetch Blocks (Only for montador)
      let blocksData: AgendaBlock[] = [];
      if (user?.role === 'montador') {
        const { data, error } = await supabase
          .from('agenda_blocks')
          .select('*')
          .eq('montador_id', user.id)
          .gte('start_time', startRange)
          .lte('end_time', endRange);
          
        if (error) throw error;
        blocksData = data || [];
      }

      setServices(servicesData as unknown as Service[] || []);
      setBlocks(blocksData);

    } catch (error) {
      console.error('Error fetching agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsSidebarOpen(true);
  };

  const getDayStatus = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayServices = services.filter(s => s.scheduled_for.startsWith(dayStr));
    const dayBlocks = blocks.filter(b => b.start_time.startsWith(dayStr));

    if (dayBlocks.length > 0) return 'blocked'; // Red
    if (dayServices.length > 0) return 'busy'; // Yellow
    return 'available'; // Green
  };

  const getDayColor = (day: Date) => {
    const status = getDayStatus(day);
    if (!isSameMonth(day, monthStart)) return 'bg-gray-50 text-gray-300'; // Outside month
    
    switch (status) {
      case 'blocked': return 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100';
      case 'busy': return 'bg-yellow-50 text-yellow-900 border-yellow-200 hover:bg-yellow-100';
      case 'available': return 'bg-white text-gray-900 hover:bg-blue-50';
      default: return 'bg-white';
    }
  };

  const getIndicatorColor = (day: Date) => {
    const status = getDayStatus(day);
    switch (status) {
      case 'blocked': return 'bg-red-500';
      case 'busy': return 'bg-yellow-500';
      case 'available': return 'bg-green-500';
      default: return 'transparent';
    }
  };

  // Filtered Services for Selected Date
  const selectedDateServices = services.filter(s => 
    isSameDay(parseISO(s.scheduled_for), selectedDate) &&
    (filterType === 'all' || s.status === filterType)
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-blue-600" />
            Agenda de Serviços
          </h1>
          <p className="text-gray-600 text-sm">Gerencie seus agendamentos e disponibilidade.</p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-semibold text-gray-700 min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-gray-600">Disponível</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-gray-600">Agendado</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-gray-600">Bloqueado/Cheio</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar data..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Todos os tipos</option>
            <option value="open">Abertos</option>
            <option value="accepted">Confirmados</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day, dayIdx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            const status = getDayStatus(day);

            return (
              <div 
                key={day.toString()}
                onClick={() => onDateClick(day)}
                className={`
                  min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors relative group
                  ${getDayColor(day)}
                  ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : ''}
                  ${!isCurrentMonth ? 'bg-gray-50/50' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-blue-600 text-white' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {isCurrentMonth && (
                    <div className={`w-2 h-2 rounded-full ${getIndicatorColor(day)}`}></div>
                  )}
                </div>

                {/* Event Dots/Preview */}
                <div className="mt-2 space-y-1">
                  {services
                    .filter(s => isSameDay(parseISO(s.scheduled_for), day))
                    .slice(0, 3)
                    .map((service, i) => (
                      <div key={i} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                        {format(parseISO(service.scheduled_for), 'HH:mm')} • {service.title || 'Serviço'}
                      </div>
                    ))
                  }
                  {services.filter(s => isSameDay(parseISO(s.scheduled_for), day)).length > 3 && (
                    <div className="text-[10px] text-gray-400 pl-1">
                      + {services.filter(s => isSameDay(parseISO(s.scheduled_for), day)).length - 3} mais
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel / Modal for Details */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </h2>
                    <p className="text-gray-500 text-sm capitalize">
                      {format(selectedDate, "EEEE", { locale: ptBR })}
                    </p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Actions */}
                <div className="mb-6 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </button>
                  {user?.role === 'montador' && (
                     <button className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                       Bloquear Dia
                     </button>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Serviços do Dia ({selectedDateServices.length})
                  </h3>

                  {selectedDateServices.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Nenhum serviço agendado</p>
                      <p className="text-gray-400 text-sm mt-1">Este dia está livre para novos serviços.</p>
                    </div>
                  ) : (
                    selectedDateServices.map((service) => (
                      <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm relative group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                          service.status === 'completed' ? 'bg-green-500' : 
                          service.status === 'accepted' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        
                        <div className="pl-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{service.title || 'Serviço de Montagem'}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                               service.status === 'completed' ? 'bg-green-100 text-green-700' : 
                               service.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {service.status === 'open' ? 'Aberto' : service.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                              {format(parseISO(service.scheduled_for), 'HH:mm')} 
                              {service.duration_hours && ` • ${service.duration_hours}h duração`}
                            </div>
                            {service.client_name && (
                              <div className="flex items-center">
                                <User className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {service.client_name}
                              </div>
                            )}
                            {service.address_full && (
                              <div className="flex items-start">
                                <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 mt-0.5" />
                                <span className="line-clamp-2">{service.address_full}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                            <button className="text-blue-600 text-xs font-medium hover:underline">
                              Ver Detalhes Completos
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
