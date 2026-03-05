const NossaRadio = () => {
  return (
    <div>
      {/* Hero */}
      <section className="radio-gradient py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4">NOSSA RÁDIO</h1>
          <p className="font-display text-lg text-radio-yellow italic">
            "Damos graças a Deus pelo que passou, pelo dia de hoje e pelo dia que virá."
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-12 md:py-20">
        <div className="container max-w-3xl">
          <div className="prose prose-lg mx-auto text-foreground">
            <p className="text-lg leading-relaxed">
              A <strong>Rádio 88 FM</strong> foi fundada em <strong>1986</strong>, em Volta Redonda, porém, a história da
              emissora começou, de fato, em <strong>primeiro de agosto de 1994</strong>, quando passou a ser administrada
              pelo então operador de áudio <strong>Edson Albertassi</strong>, se tornou genuinamente evangélica e passou a
              transmitir canções e palavras de amor e paz.
            </p>
            <p className="text-lg leading-relaxed mt-6">
              Em <strong>30 anos de existência</strong>, a emissora cresceu, conquistando a{" "}
              <strong>maior audiência do Sul do Estado</strong>. A 88 FM é hoje referência em{" "}
              <strong>qualidade de programação</strong> e <strong>responsabilidade social</strong>.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "1986", label: "Fundação" },
              { value: "30+", label: "Anos no ar" },
              { value: "#1", label: "Audiência Sul Fluminense" },
              { value: "24h", label: "Programação" },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted rounded-xl p-6">
                <p className="font-display text-3xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NossaRadio;
