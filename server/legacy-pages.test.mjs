import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { isRetiredPhpPage, legacyGoneHandler, legacyPageRedirect } from './legacy-pages.mjs';

test('preserves meaningful old privacy and player links', () => {
  assert.equal(legacyPageRedirect('/politica-de-privacidade.html'), '/privacidade');
  assert.equal(legacyPageRedirect('/site/pages/player-audio/'), '/ouvir');
  assert.equal(legacyPageRedirect('/site/pages/player-video'), '/assistir');
  assert.equal(legacyPageRedirect('/index.php'), null);
});

test('retires PHP pages without matching current routes or queries', () => {
  for (const path of ['/index.php', '/principal.php', '/fatopopular_principal.php', '/old/programa.php', '/old.PHP/']) assert.equal(isRetiredPhpPage(path), true);
  for (const path of ['/', '/programacao', '/conteudos', '/index.php.jpg', '/api/music/artwork']) assert.equal(isRetiredPhpPage(path), false);
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.rewrites.some(rule => rule.destination === '/api/legacy-gone'));
  assert.ok(!config.redirects.some(rule => rule.source.endsWith('.php')));
});

test('returns Gone and noindex, without redirecting the current website', () => {
  let status, headers, body;
  legacyGoneHandler({}, { writeHead(code, value) { status = code; headers = value; }, end(value) { body = value; } });
  assert.equal(status, 410);
  assert.equal(headers['X-Robots-Tag'], 'noindex, follow');
  assert.ok(!headers.Location);
  assert.match(body, /Acessar o site atual/);
});
