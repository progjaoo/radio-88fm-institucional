import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useState } from "react";
import logoHeaderColor from "@/assets/logoheadsvgcolor.svg";
import logoHeaderwhite from "@/assets/logoheadsvg.svg";

const Footer = () => {

  const [isHovered, setIsHovered] = useState(false);
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/radio88oficial/", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/radio88fm", label: "Instagram" },
    { icon: Youtube, href: "https://www.youtube.com/@radio88oficial", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/radio-88-fm", label: "LinkedIn" },
  ];
  
  return (
    <footer className="bg-radio-dark text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <img  src={isHovered ? logoHeaderColor : logoHeaderwhite} 
            alt="Rádio 88 FM"  className={`h-16 w-16 object-contain cursor-pointer transition-all duration-300 ${!isHovered ? "invert brightness-0" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}/>

          
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Rádio que toca o som do céu! Desde 1994 levando amor e paz através da música e da palavra.
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
            <div className="flex flex-col gap-3 text-sm">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-radio-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-radio-brand-blue group-hover:text-white">
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </a>
              ))}
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
