import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SeoHead from "@/components/seo/SeoHead";
import { notFoundSeoConfig } from "@/services/seo/seoConfig";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("Rota não encontrada:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-muted px-4 py-12" aria-labelledby="not-found-title">
      <SeoHead config={notFoundSeoConfig} pathname={location.pathname} />
      <div className="max-w-lg text-center">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.25em] text-radio-blue">
          Erro 404
        </p>
        <h1 id="not-found-title" className="mt-3 font-display text-4xl font-extrabold text-radio-dark md:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O endereço acessado não existe ou foi alterado.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex rounded-md bg-radio-blue px-6 py-3 font-display font-bold text-white transition-colors hover:bg-radio-blue-dark"
        >
          Voltar ao início
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
