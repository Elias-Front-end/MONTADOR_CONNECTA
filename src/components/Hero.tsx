import { Search, MapPin, CheckCircle, Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background Shape */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <svg className="absolute w-full h-full" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="none">
           <path 
             d="M-100 800C200 800 400 600 600 400C800 200 1100 100 1500 0V800H-100Z" 
             fill="#EFF6FF" // blue-50
             fillOpacity="0.8"
           />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content (Text + Search) */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6 border border-blue-100">
              <Star className="w-4 h-4 mr-2 fill-current" />
              #1 Plataforma de Montagem no Brasil
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-950 tracking-tight mb-6 leading-tight">
              Seus móveis montados <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                sem complicação
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Conectamos você aos melhores profissionais da sua região. 
              Agende a montagem dos seus sonhos em poucos cliques, com total segurança e garantia de qualidade.
            </p>

            {/* Search Box */}
            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Digite seu CEP ou Cidade"
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 placeholder-gray-400 text-base"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap"
              >
                <Search className="w-5 h-5 mr-2" />
                Encontrar
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-medium text-gray-500">
              <div className="flex items-center px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Profissionais Verificados
              </div>
              <div className="flex items-center px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                Pagamento Seguro
              </div>
            </div>
          </div>

          {/* Right Content (Images) */}
          <div className="flex-1 relative hidden md:block">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1581578731117-104f8a3d46a8?auto=format&fit=crop&q=80&w=800" 
                  alt="Montador profissional trabalhando" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      4.9
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Excelência Garantida</p>
                      <p className="text-xs text-gray-500">Média de avaliação dos nossos parceiros</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Image (Floating) */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white transform -rotate-3 hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400" 
                  alt="Sala montada" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}