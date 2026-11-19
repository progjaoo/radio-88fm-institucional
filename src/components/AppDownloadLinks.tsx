const stores = [
  {
    name: "Google Play", caption: "DISPONÍVEL NO",
    href: "https://play.google.com/store/apps/details?id=com.sentinel4.radio88&hl=pt_BR",
    icon: <svg viewBox="0 0 24 26" aria-hidden="true"><path d="M1 1 14 13 1 25Z" fill="#37d9c3" /><path d="m1 1 17 9-4 3Z" fill="#50b9f6" /><path d="m14 13 4 3-17 9Z" fill="#f74c62" /><path d="m14 13 4-3 5 3-5 3Z" fill="#ffd259" /></svg>,
  },
  {
    name: "App Store", caption: "BAIXE NA",
    href: "https://apps.apple.com/br/app/r%C3%A1dio-88-fm-o-som-do-c%C3%A9u/id1587595590",
    icon: <svg viewBox="0 0 24 26" fill="currentColor" aria-hidden="true"><path d="M17.8 13.6c0-3 2.4-4.4 2.5-4.5-1.4-2.1-3.6-2.3-4.4-2.3-1.9-.2-3.7 1.1-4.7 1.1-1 0-2.5-1.1-4.1-1-2.1 0-4 1.2-5 3-2.1 3.7-.5 9.3 1.5 12.3 1 1.5 2.2 3.1 3.8 3 1.6 0 2.2-1 4.2-1 1.9 0 2.5 1 4.2 1 1.7 0 2.7-1.5 3.7-3a13 13 0 0 0 1.7-3.6 5.1 5.1 0 0 1-3.4-5ZM14.6 4.8c.8-1 1.3-2.3 1.2-3.6-1.2.1-2.6.8-3.4 1.7-.7.9-1.4 2.3-1.2 3.5 1.3.1 2.6-.6 3.4-1.6Z" /></svg>,
  },
];

export default function AppDownloadLinks() {
  return <div className="mini-player-downloads" aria-label="Baixar aplicativo Rádio 88 FM">
    <p className="mini-player-download-intro">Leve a 88 com você<strong>Baixe o app</strong></p>
    {stores.map(store => <a key={store.name} className="mini-player-store" href={store.href} target="_blank" rel="noopener noreferrer" aria-label={`Baixar Rádio 88 FM na ${store.name} (nova aba)`}>
      {store.icon}<span><small>{store.caption}</small><strong>{store.name}</strong></span>
    </a>)}
  </div>;
}
