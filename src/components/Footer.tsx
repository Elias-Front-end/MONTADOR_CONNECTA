import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white mb-4 block">
              Montador<span className="text-blue-500">Conecta</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              A plataforma ideal para conectar clientes a montadores de móveis qualificados em todo o Brasil.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-blue-400">Quem Somos</Link></li>
              <li><Link to="/services" className="hover:text-blue-400">Como Funciona</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-400">Planos</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400">Termos de Uso</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Montadores</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register-pro" className="hover:text-blue-400">Seja um Parceiro</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400">Área do Montador</Link></li>
              <li><Link to="/success-stories" className="hover:text-blue-400">Casos de Sucesso</Link></li>
              <li><Link to="/help" className="hover:text-blue-400">Ajuda</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                contato@montadorconecta.com.br
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                (11) 99999-9999
              </li>
              <li className="flex items-start">
                <span className="w-4 h-4 mr-2 text-blue-500 mt-1">📍</span>
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
          &copy; {new Date().getFullYear()} MontadorConecta. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}