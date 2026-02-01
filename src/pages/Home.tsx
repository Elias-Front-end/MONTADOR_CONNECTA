import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { ClipboardList, Users, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">Como Funciona</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simples, rápido e seguro. Veja como é fácil contratar um montador profissional.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Descreva o Serviço</h3>
                <p className="text-gray-600">
                  Conte o que precisa ser montado. Móveis novos, usados ou desmontagem.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Escolha o Profissional</h3>
                <p className="text-gray-600">
                  Receba orçamentos e escolha o montador ideal baseado em avaliações e preço.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Avalie o Serviço</h3>
                <p className="text-gray-600">
                  Após a conclusão, avalie o atendimento para ajudar a manter a qualidade da comunidade.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}