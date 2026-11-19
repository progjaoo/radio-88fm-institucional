export function legacyPageRedirect(pathname) {
  const path = pathname.replace(/\/$/, '');
  return new Map([
    ['/politica-de-privacidade.html', '/privacidade'],
    ['/site/pages/player-audio', '/ouvir'],
    ['/site/pages/player-video', '/assistir'],
  ]).get(path) ?? null;
}

export function isRetiredPhpPage(pathname) {
  return /\.php\/?$/i.test(pathname);
}

export function legacyGoneHandler(_request, response) {
  response.writeHead(410, {
    "Content-Type": "text/html; charset=utf-8",
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "public, max-age=3600",
  });
  response.end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Página antiga removida | Rádio 88 FM</title><h1>Esta página antiga foi removida</h1><p>O site da Rádio 88 FM mudou.</p><a href="/">Acessar o site atual</a></html>');
}
