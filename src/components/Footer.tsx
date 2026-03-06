import { MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo-88fm.png";

const Footer = () => {
  return (
    <footer className="bg-radio-dark text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <img src={logo} alt="Rádio 88 FM" className="h-16 w-16 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Rádio que toca o som do céu! Desde 1986 levando amor e paz através da música e da palavra.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-radio-blue">CONTATO</h3>
            <div className="space-y-3 text-sm">
              <a
                href="https://www.google.com/maps?q=Rua+Moacyr+de+Paula+Lobo,+104,+Limoeiro+-+Volta+Redonda+-+RJ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-primary transition-colors"
              >
                <MapPin size={16} className="mt-0.5 shrink-0" />
                Rua Moacyr de Paula Lobo, 104, Limoeiro – Volta Redonda – RJ
              </a>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>Dep. Comercial: (24) 3338-8820</span>
              </div>
              <a href="mailto:comercialvpd@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} className="shrink-0" />
                comercialvpd@gmail.com
              </a>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>Atendimento: (24) 3338-8820 / 99868-0088</span>
              </div>
              <a href="mailto:producao88fm@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} className="shrink-0" />
                producao88fm@gmail.com
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-radio-blue">REDES SOCIAIS</h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/radio88oficial/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a>
              <a href="https://www.instagram.com/radio88fm" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
              <a href="https://www.youtube.com/@radio88oficial" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">YouTube</a>
              <a href="https://www.linkedin.com/company/radio-88-fm" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-muted/20 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Rádio 88 FM - Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
