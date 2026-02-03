import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Calendar, MapPin, DollarSign, User, Clock, FileText, Loader2, Save, ArrowLeft, Upload, AlertTriangle, Layers } from 'lucide-react';

const serviceSchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  complexity: z.enum(['low', 'medium', 'high']),
  is_urgent: z.boolean().default(false),
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

const CATEGORIES = [
  "Cozinha",
  "Quarto",
  "Sala de Estar",
  "Banheiro",
  "Escritório",
  "Área Externa",
  "Comercial",
  "Outros"
];

type ServiceForm = z.infer<typeof serviceSchema>;

export default function NewService() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]); // Mock upload for now

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      duration_hours: 2,
      required_skills: [],
      complexity: 'medium',
      is_urgent: false
    }
  });

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    setValue('required_skills', newSkills);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: ServiceForm) => {
    setIsLoading(true);
    try {
      if (!user) return;

      // Combine Date and Time
      const dateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}:00`);
      
      // Upload Logic (Mocked - In real app, upload to storage bucket and get URLs)
      // const uploadedUrls = await uploadFiles(documents);
      const documentUrls: string[] = []; // Placeholder

      const { error } = await supabase.from('services').insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        service_details: {
            complexity: data.complexity,
            items: [] // Could be expanded
        },
        is_urgent: data.is_urgent,
        client_name: data.client_name,
        client_phone: data.client_phone,
        address_full: data.address_full,
        scheduled_for: dateTime.toISOString(),
        duration_hours: data.duration_hours,
        price: data.price,
        required_skills: selectedSkills,
        documents: documentUrls,
        status: 'published' // New default status for Pull model
      });

      if (error) throw error;

      alert('Serviço publicado com sucesso! Os montadores serão notificados.');
      navigate('/dashboard/services');

    } catch (error) {
      console.error('Error creating service:', error);
      alert('Erro ao criar serviço.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Serviço</h1>
          <p className="text-gray-500">Publique uma montagem para seus parceiros.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Detalhes do Serviço
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
                <input 
                {...register('title')}
                placeholder="Ex: Montagem Guarda-Roupa 6 Portas"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select 
                  {...register('category')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complexidade</label>
                <div className="flex gap-4">
                    {['low', 'medium', 'high'].map((level) => (
                        <label key={level} className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                value={level} 
                                {...register('complexity')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">
                                {level === 'low' ? 'Baixa' : level === 'medium' ? 'Média' : 'Alta'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
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

           {/* Documents Upload */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documentos Técnicos (Plantas, Manuais)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                    {documents.length > 0 
                        ? `${documents.length} arquivo(s) selecionado(s)` 
                        : "Clique ou arraste arquivos aqui"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
            </div>
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

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
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

            <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        {...register('is_urgent')}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-red-600 font-bold flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Serviço Urgente
                    </span>
                </label>
            </div>
          </div>
        </div>

        {/* Skills Requirements */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 flex items-center mb-4">
            <Layers className="w-5 h-5 mr-2 text-blue-600" />
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

        <div className="pt-6 flex justify-end gap-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancelar
            </button>
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
