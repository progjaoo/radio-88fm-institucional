import { Helmet } from "react-helmet-async";

const pageContainer = "mx-auto w-full max-w-[1100px] px-6 sm:px-6 lg:px-10 xl:px-12";

const Privacidade = () => {
  return (
    <main className="bg-white py-12 text-foreground md:py-16">
      <Helmet>
        <title>Privacidade | Rádio 88 FM</title>
        <meta
          name="description"
          content="Aviso de privacidade da Rádio 88 FM para cadastro de ouvintes no site institucional."
        />
      </Helmet>

      <div className={pageContainer}>
        <div className="max-w-3xl">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.28em] text-radio-blue">
            Privacidade
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none text-radio-dark md:text-6xl">
            Aviso de privacidade
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Este aviso explica como a Rádio 88 FM trata os dados enviados no cadastro de ouvintes
            do site institucional.
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-8 text-base leading-8 text-foreground/78 md:text-lg">
          <section>
            <h2 className="font-display text-2xl font-extrabold text-radio-dark">Dados coletados</h2>
            <p className="mt-3">
              Coletamos nome, bairro, cidade e telefone como campos obrigatórios. O telefone
              será usado para contato operacional relacionado às campanhas e ações da rádio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-extrabold text-radio-dark">Finalidade</h2>
            <p className="mt-3">
              Os dados serão usados para organizar ações de relacionamento com ouvintes, campanhas,
              comunicações institucionais e atividades relacionadas ao lançamento do site da Rádio
              88 FM.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-extrabold text-radio-dark">Comunicações</h2>
            <p className="mt-3">
              O recebimento de novidades e avisos da rádio depende de consentimento separado no
              formulário. O ouvinte pode não marcar essa opção e ainda assim enviar o cadastro.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-extrabold text-radio-dark">Segurança e retenção</h2>
            <p className="mt-3">
              Os dados são armazenados em ambiente controlado e acessados pela equipe autorizada da
              rádio para as finalidades informadas. Nenhum dado pessoal do formulário é salvo no
              navegador pelo site institucional.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-extrabold text-radio-dark">Contato</h2>
            <p className="mt-3">
              Para solicitar informações sobre seus dados, entre em contato com a Rádio 88 FM pelos
              canais oficiais informados no rodapé do site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacidade;
