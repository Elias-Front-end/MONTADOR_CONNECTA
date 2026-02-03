import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#2563EB" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight mb-6">
            Montadores Profissionais a um <span className="text-blue-600">Clique de Distância</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Encontre o montador de móveis mais próximo de você! Qualidade, segurança e rapidez para o seu lar.
          </p>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-100">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Digite sua cidade ou CEP"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </button>
            </form>
          </div>
          
          <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Profissionais Verificados
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Orçamento Rápido
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              Pagamento Seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}