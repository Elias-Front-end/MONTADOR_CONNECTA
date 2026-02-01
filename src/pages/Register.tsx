import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle, User, Briefcase, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Schemas
const baseSchema = {
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Telefone inválido'),
};

const montadorSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  role: z.literal('montador'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

const partnerSchema = z.object({
  ...baseSchema,
  companyName: z.string().min(3, 'Nome da empresa é obrigatório'),
  responsibleName: z.string().min(3, 'Nome do responsável é obrigatório'),
  role: z.literal('partner'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type MontadorForm = z.infer<typeof montadorSchema>;
type PartnerForm = z.infer<typeof partnerSchema>;

export default function Register() {
  const [role, setRole] = useState<'montador' | 'partner'>('montador');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MontadorForm | PartnerForm>({
    resolver: zodResolver(role === 'montador' ? montadorSchema : partnerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: role === 'montador' ? data.fullName : data.responsibleName,
            company_name: role === 'partner' ? data.companyName : null,
            phone: data.phone,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Optional: Insert into public profiles table if triggers aren't set up
        // For MVP, we'll assume Supabase Auth metadata is enough or a trigger handles it
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-blue-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Faça login
              </Link>
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => { setRole('montador'); reset(); }}
              className={`flex items-center px-6 py-3 rounded-lg border transition-all ${
                role === 'montador' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              <span className="font-medium">Sou Montador</span>
            </button>
            <button
              onClick={() => { setRole('partner'); reset(); }}
              className={`flex items-center px-6 py-3 rounded-lg border transition-all ${
                role === 'partner' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              <span className="font-medium">Sou Empresa</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('role')} value={role} />
            
            <div className="space-y-4">
              {role === 'montador' ? (
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('fullName')}
                    type="text"
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                    placeholder="Nome Completo"
                  />
                  {(errors as any).fullName && <p className="text-red-500 text-xs mt-1">{(errors as any).fullName.message}</p>}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('companyName')}
                      type="text"
                      className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                      placeholder="Nome da Empresa (Marcenaria ou Loja)"
                    />
                     {(errors as any).companyName && <p className="text-red-500 text-xs mt-1">{(errors as any).companyName.message}</p>}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('responsibleName')}
                      type="text"
                      className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                      placeholder="Nome do Responsável"
                    />
                     {(errors as any).responsibleName && <p className="text-red-500 text-xs mt-1">{(errors as any).responsibleName.message}</p>}
                  </div>
                </>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                  placeholder="Endereço de E-mail"
                />
                 {errors.email && <p className="text-red-500 text-xs mt-1">{(errors as any).email.message}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                  placeholder="Telefone / WhatsApp"
                />
                 {errors.phone && <p className="text-red-500 text-xs mt-1">{(errors as any).phone.message}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                  placeholder="Senha (mín. 6 caracteres)"
                />
                 {errors.password && <p className="text-red-500 text-xs mt-1">{(errors as any).password.message}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900 focus:outline-none sm:text-sm"
                  placeholder="Confirme sua senha"
                />
                 {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{(errors as any).confirmPassword.message}</p>}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Cadastrar'
                )}
              </button>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Ao se cadastrar, você concorda com nossos <a href="#" className="underline">Termos de Uso</a> e <a href="#" className="underline">Política de Privacidade</a>.
            </p>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
