import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Search, MapPin, Award, Star, Filter } from 'lucide-react';

interface Montador {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  skills: string[] | null;
  experience_years: string | null;
}

export default function MontadoresRanking() {
  const { user } = useAuthStore();
  const [montadores, setMontadores] = useState<Montador[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');

  useEffect(() => {
    if (user) fetchMontadores();
  }, [user, searchCity, searchState]);

  const fetchMontadores = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, state, skills, experience_years')
        .eq('role', 'montador');

      // Filters (Case Insensitive ILIKE if possible, but let's stick to simple EQ/ILIKE)
      if (searchCity) {
        query = query.ilike('city', `%${searchCity}%`);
      }
      if (searchState) {
        query = query.ilike('state', `%${searchState}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side Sorting by Skill Count (Descending)
      // Supabase can't easily sort by array_length without a function/view, so we sort here.
      const sorted = (data || []).sort((a, b) => {
        const skillsA = a.skills?.length || 0;
        const skillsB = b.skills?.length || 0;
        return skillsB - skillsA; // Descending
      });

      setMontadores(sorted);

    } catch (error) {
      console.error('Error fetching montadores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Award className="w-6 h-6 mr-2 text-yellow-500" />
            Ranking de Montadores
          </h1>
          <p className="text-gray-600">Encontre os melhores profissionais por qualificação e região.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            placeholder="Filtrar por Cidade" 
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            placeholder="Estado (UF)" 
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            maxLength={2}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
          />
        </div>
        <div className="flex items-center justify-end text-sm text-gray-500">
          <Filter className="w-4 h-4 mr-1" />
          {montadores.length} profissionais encontrados
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : montadores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum montador encontrado</h3>
          <p className="text-gray-500 mt-1">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {montadores.map((m, index) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative overflow-hidden group">
              {/* Ranking Badge */}
              <div className="absolute top-0 right-0 bg-[#FACC15] text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                #{index + 1}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl bg-slate-100">
                      {m.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{m.full_name}</h3>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {m.city ? `${m.city} - ${m.state}` : 'Localização não informada'}
                  </div>
                  {m.experience_years && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      {m.experience_years} de experiência
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 flex-grow">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Qualificações ({m.skills?.length || 0})</h4>
                  <div className="flex flex-wrap gap-1">
                    {(m.skills || []).slice(0, 5).map(skill => (
                      <span key={skill} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                        {skill}
                      </span>
                    ))}
                    {(m.skills?.length || 0) > 5 && (
                      <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                        +{m.skills!.length - 5}
                      </span>
                    )}
                    {(!m.skills || m.skills.length === 0) && (
                      <span className="text-xs text-gray-400 italic">Nenhuma registrada</span>
                    )}
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                Ver Perfil Completo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
