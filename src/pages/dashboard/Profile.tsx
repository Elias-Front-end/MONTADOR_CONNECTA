import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Camera, Plus, Loader2, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Schema Validation
const profileSchema = z.object({
  full_name: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("Email inválido").readonly(), // Email usually shouldn't be changed here easily
  video_presentation: z.string().url("URL inválida").optional().or(z.literal('')),
  facebook_url: z.string().url("URL inválida").optional().or(z.literal('')),
  youtube_url: z.string().url("URL inválida").optional().or(z.literal('')),
  twitter_url: z.string().url("URL inválida").optional().or(z.literal('')),
  instagram_url: z.string().url("URL inválida").optional().or(z.literal('')),
  experience_years: z.string().optional(),
  whatsapp: z.string().min(10, "WhatsApp inválido").optional().or(z.literal('')),
  phone_secondary: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, checkUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Load Initial Data
  useEffect(() => {
    if (user) {
      // Set basic fields immediately from store (fast)
      setValue('full_name', user.full_name || '');
      setValue('email', user.email || '');
      
      // Load extended profile data from DB (authoritative)
      loadExtendedProfile();
      loadPortfolio();
    }
  }, [user]);

  const loadExtendedProfile = async () => {
    if (!user) return;
    try {
      // Explicitly fetch latest data from DB, bypassing cache issues
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;

      if (data) {
        console.log("Loaded Profile Data:", data); // Debugging
        
        // Map fields explicitly, handling nulls
        setValue('full_name', data.full_name || '');
        setValue('video_presentation', data.video_presentation || '');
        setValue('facebook_url', data.facebook_url || '');
        setValue('youtube_url', data.youtube_url || '');
        setValue('twitter_url', data.twitter_url || '');
        setValue('instagram_url', data.instagram_url || '');
        setValue('experience_years', data.experience_years || '');
        setValue('whatsapp', data.whatsapp || '');
        setValue('phone_secondary', data.phone_secondary || '');
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const loadPortfolio = async () => {
    if (!user) return;
    const { data } = await supabase.from('portfolio_items').select('*').eq('profile_id', user.id);
    if (data) setPortfolioItems(data);
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      if (!user) return;

      console.log("Saving Profile Data:", data); // Debugging

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Obrigatório para upsert
          full_name: data.full_name,
          video_presentation: data.video_presentation,
          facebook_url: data.facebook_url,
          youtube_url: data.youtube_url,
          twitter_url: data.twitter_url,
          instagram_url: data.instagram_url,
          experience_years: data.experience_years,
          whatsapp: data.whatsapp,
          phone_secondary: data.phone_secondary,
          updated_at: new Date().toISOString()
        })
        .select(); // Select garante que retorna o erro se falhar na política de INSERT

      if (error) throw error;
      
      // Reload data to ensure UI is in sync with DB
      await loadExtendedProfile();
      await checkUser(); // Refresh global store
      
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Verifique se você rodou o script SQL de atualização.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload success:", uploadData);

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user?.id);
      await checkUser();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl || !user) return;
    
    try {
      const { error } = await supabase.from('portfolio_items').insert({
        profile_id: user.id,
        type: 'video',
        url: newVideoUrl
      });
      
      if (error) throw error;
      setNewVideoUrl('');
      loadPortfolio();
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight">
          {user?.full_name || 'Usuário'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section: Dados Públicos */}
        <div>
          <h2 className="text-xl font-bold text-black mb-6 border-b pb-2">Dados Públicos</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Column */}
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden relative group shadow-inner">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="mt-3 w-full max-w-[192px] bg-[#FACC15] hover:bg-[#EAB308] text-white font-medium py-2 px-4 rounded-md text-center cursor-pointer transition-colors uppercase text-sm shadow-sm">
                Alterar Foto
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            {/* Fields Column */}
            <div className="flex-grow space-y-5">
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vídeo de apresentação</label>
                <input 
                  {...register('video_presentation')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none transition-all"
                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input 
                    {...register('full_name')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none transition-all"
                  />
                  {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input 
                    {...register('email')}
                    readOnly
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Social Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Facebook', name: 'facebook_url' },
                  { label: 'YouTube', name: 'youtube_url' },
                  { label: 'Twitter', name: 'twitter_url' },
                  { label: 'Instagram', name: 'instagram_url' },
                ].map((social) => (
                  <div key={social.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{social.label}</label>
                    <input 
                      {...register(social.name as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                      placeholder="URL"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de experiência</label>
                <input 
                  {...register('experience_years')}
                  className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                  placeholder="Ex: 5 anos"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input 
                    {...register('whatsapp')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                    placeholder="(XX) X XXXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input 
                    {...register('phone_secondary')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
                    placeholder="(XX) X XXXX-XXXX"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">* Só aparecerá se no slug estiver vazio</p>
              
              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#FACC15] hover:bg-[#EAB308] text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wide shadow-sm hover:shadow-md transition-all flex items-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Salvar Dados Públicos
                </button>
              </div>

            </div>
          </div>
        </div>

      </form>

      <div className="border-t border-gray-100 my-8"></div>

      {/* Section: Fotos */}
      <div>
        <h2 className="text-xl font-bold text-black mb-6">Fotos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Upload Card */}
          <div className="aspect-square bg-[#FEF9C3] border-2 border-dashed border-[#FACC15] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#FEF08A] transition-colors group">
            <Plus className="w-10 h-10 text-[#EAB308] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-gray-500 mt-2 uppercase">Adicionar Foto</span>
            {/* Input hidden here in real implementation */}
          </div>
          
          {/* Placeholder for existing photos */}
          {portfolioItems.filter(i => i.type === 'photo').map(item => (
            <div key={item.id} className="aspect-square bg-gray-100 rounded-lg relative group overflow-hidden">
              <img src={item.url} alt="Portfolio" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-8"></div>

      {/* Section: Vídeos */}
      <div>
        <h2 className="text-xl font-bold text-black mb-6">Vídeos</h2>
        
        <div className="flex gap-4 items-end max-w-2xl">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link do Youtube</label>
            <input 
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FACC15] focus:border-transparent outline-none"
              placeholder="Ex: https://www.youtube.com/watch?v=..."
            />
          </div>
          <button 
            onClick={handleAddVideo}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-white font-bold py-2.5 px-6 rounded-lg uppercase text-sm h-[42px] mb-[1px]"
          >
            Adicionar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {portfolioItems.filter(i => i.type === 'video').map(item => (
            <div key={item.id} className="aspect-video bg-gray-100 rounded-lg relative">
              {/* Video Embed Logic would go here */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Video Preview
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="mt-12 bg-[#FACC15] p-6 rounded-lg flex justify-between items-center">
        <span className="text-xs text-yellow-800 font-medium">© 2026, Agora Montador - Todos os direitos reservados.</span>
        <button 
          onClick={() => useAuthStore.getState().signOut()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded uppercase"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
