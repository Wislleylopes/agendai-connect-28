import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { InfoModal } from "./InfoModals";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <header className="bg-background/95 backdrop-blur border-b border-card-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">AgendAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setModalOpen("how-it-works")}
              className="text-muted-foreground hover:text-foreground transition-fast"
            >
              Como Funciona
            </button>
            <button 
              onClick={() => setModalOpen("for-professionals")}
              className="text-muted-foreground hover:text-foreground transition-fast"
            >
              Para Profissionais
            </button>
            <button 
              onClick={() => setModalOpen("for-clients")}
              className="text-muted-foreground hover:text-foreground transition-fast"
            >
              Para Clientes
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button className="bg-gradient-primary hover:bg-primary-hover text-white shadow-blue">
                Começar Agora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-card-border bg-background">
            <nav className="flex flex-col py-4 space-y-2">
              <button
                onClick={() => {
                  setModalOpen("how-it-works");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-fast text-left"
              >
                Como Funciona
              </button>
              <button
                onClick={() => {
                  setModalOpen("for-professionals");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-fast text-left"
              >
                Para Profissionais
              </button>
              <button
                onClick={() => {
                  setModalOpen("for-clients");
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-fast text-left"
              >
                Para Clientes
              </button>
              <div className="flex flex-col space-y-2 px-4 pt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-primary hover:bg-primary-hover text-white">
                    Começar Agora
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Info Modals */}
      <InfoModal
        isOpen={modalOpen === "how-it-works"}
        onClose={() => setModalOpen(null)}
        type="how-it-works"
      />
      <InfoModal
        isOpen={modalOpen === "for-professionals"}
        onClose={() => setModalOpen(null)}
        type="for-professionals"
      />
      <InfoModal
        isOpen={modalOpen === "for-clients"}
        onClose={() => setModalOpen(null)}
        type="for-clients"
      />
    </header>
  );
};