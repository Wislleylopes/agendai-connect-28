import { Calendar, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
export const Footer = () => {
  return <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">AgendAI</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              A plataforma que conecta profissionais e clientes de forma inteligente e eficiente.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Plataforma</h3>
            <div className="space-y-2">
              <Link to="/como-funciona" className="block text-gray-300 hover:text-white transition-colors">
                Como Funciona
              </Link>
              <Link to="/precos" className="block text-gray-300 hover:text-white transition-colors">
                Preços
              </Link>
              <Link to="/demo" className="block text-gray-300 hover:text-white transition-colors">
                Demonstração
              </Link>
              <Link to="/blog" className="block text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suporte</h3>
            <div className="space-y-2">
              <Link to="/ajuda" className="block text-gray-300 hover:text-white transition-colors">
                Central de Ajuda
              </Link>
              <Link to="/contato" className="block text-gray-300 hover:text-white transition-colors">
                Contato
              </Link>
              <Link to="/documentacao" className="block text-gray-300 hover:text-white transition-colors">
                Documentação
              </Link>
              <Link to="/status" className="block text-gray-300 hover:text-white transition-colors">
                Status do Sistema
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <div className="space-y-2">
              <Link to="/termos" className="block text-gray-300 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="block text-gray-300 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/cookies" className="block text-gray-300 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link to="/lgpd" className="block text-gray-300 hover:text-white transition-colors">
                LGPD
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © 2024 AgendAI. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            
          </div>
        </div>
      </div>
    </footer>;
};