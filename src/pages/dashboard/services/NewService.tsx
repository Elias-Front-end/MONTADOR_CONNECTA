import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Calendar, MapPin, DollarSign, User, Clock, FileText, Loader2, Save, ArrowLeft } from 'lucide-react';

const serviceSchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  description: z.string().optional(),
  client_name: z.string().min(3, "Nome do cliente é obrigatório"),
  client_phone: z.string().optional(),
  address_full: z.string().min(10, "Endereço completo é obrigatório"),
  scheduled_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  scheduled_time: z.string().min(1, "Hora obrigatória"),
  duration_hours: z.coerce.number().min(0.5, "Mínimo 30min"),
  price: z.coerce.number().min(0, "Valor inválido").optional(),
  required_skills: z.array(z.string()).optional(),
});

const AVAILABLE_SKILLS = [
  "Móveis Planejados",
  "Móveis de Escritório",
  "Móveis de Cozinha",
  "Guarda-Roupas",
  "Sofás e Estofados",
  "Instalação de TV/Suporte",
  "Cortinas e Persianas",
  "Pequenos Reparos Elétricos"
];

type ServiceForm = z.infer<typeof serviceSchema>;

export default function NewService() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema) as any, // Cast to any to avoid strict type mismatch with react-hook-form
    defaultValues: {
      duration_hours: 2,
      required_skills: [],
    }
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    setValue('required_skills', newSkills);
  };

  const onSubmit = async (data: ServiceForm) => {
    setIsLoading(true);
    try {
      if (!user) return;

      // Combine Date and Time
      const dateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}:00`);
      
      const { error } = await supabase.from('services').insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        client_name: data.client_name,
        client_phone: data.client_phone,
        address_full: data.address_full,
        scheduled_for: dateTime.toISOString(),
        duration_hours: data.duration_hours,
        price: data.price,
        required_skills: selectedSkills,
        status: 'open'
      });

      if (error) throw error;

      alert('Serviço publicado com sucesso!');
      navigate('/dashboard/services');

    } catch (error) {
      console.error('Error creating service:', error);
      alert('Erro ao criar serviço.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Serviço</h1>
          <p className="text-gray-500">Publique uma montagem para seus parceiros.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Detalhes do Serviço
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
            <input 
              {...register('title')}
              placeholder="Ex: Montagem Guarda-Roupa 6 Portas"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Observações</label>
            <textarea 
              {...register('description')}
              rows={3}
              placeholder="Detalhes adicionais, ferramentas necessárias, etc."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Client & Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center pt-4">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Cliente e Local
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
              <input 
                {...register('client_name')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.client_name && <span className="text-red-500 text-xs">{errors.client_name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (Opcional)</label>
              <input 
                {...register('client_phone')}
                placeholder="(XX) X XXXX-XXXX"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input 
                {...register('address_full')}
                placeholder="Rua, Número, Bairro, Cidade - Estado"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {errors.address_full && <span className="text-red-500 text-xs">{errors.address_full.message}</span>}
          </div>
        </div>

        {/* Schedule & Price */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center pt-4">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Agendamento e Valor
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input 
                type="date"
                {...register('scheduled_date')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.scheduled_date && <span className="text-red-500 text-xs">{errors.scheduled_date.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input 
                type="time"
                {...register('scheduled_time')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.scheduled_time && <span className="text-red-500 text-xs">{errors.scheduled_time.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração Est. (Horas)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input 
                  type="number"
                  step="0.5"
                  {...register('duration_hours')}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor a Pagar ao Montador (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-green-600" />
              <input 
                type="number"
                step="0.01"
                {...register('price')}
                placeholder="0,00"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Skills Requirements */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Qualificações Necessárias
          </h3>
          <p className="text-sm text-gray-500 mb-3">Selecione quais habilidades o montador precisa ter para aceitar este serviço.</p>
          
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Publicar Serviço
          </button>
        </div>

      </form>
    </div>
  );
}
