import logo1 from "@/assets/nossa-radio/Logo 1.svg";
import logo2 from "@/assets/nossa-radio/Logo 2.svg";
import logo3 from "@/assets/nossa-radio/Logo 3.svg";
import logo4 from "@/assets/nossa-radio/Logo 4.svg";
import logo5 from "@/assets/nossa-radio/Logo 5.svg";

export interface LogoHistoricoItem {
  id: string;
  logoSrc: string;
  alt: string;
}

export const historicoLogos: LogoHistoricoItem[] = [
  {
    id: "logo-1",
    logoSrc: logo1,
    alt: "Logo histórica 1 da Rádio 88 FM",
  },
  {
    id: "logo-2",
    logoSrc: logo2,
    alt: "Logo histórica 2 da Rádio 88 FM",
  },
  {
    id: "logo-3",
    logoSrc: logo3,
    alt: "Logo histórica 3 da Rádio 88 FM",
  },
  {
    id: "logo-4",
    logoSrc: logo4,
    alt: "Logo histórica 4 da Rádio 88 FM",
  },
  {
    id: "logo-5",
    logoSrc: logo5,
    alt: "Logo atual da Rádio 88 FM",
  },
];
