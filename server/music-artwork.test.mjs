import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createArtworkResolver,
  isAppleArtworkUrl,
  normalizeBaseTitle,
  parseTrack,
  removeBroadcastTitleLabel,
  selectArtwork,
} from './music-artwork.mjs';

const track = parseTrack('A Alegria Do Senhor - Sarah Beatriz');
const makeCandidate = (overrides = {}) => ({
  kind: 'song',
  trackId: 101,
  trackName: track.title,
  artistName: track.artist,
  collectionName: 'Album',
  artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/cover/100x100bb.jpg',
  ...overrides,
});

test('parses VOX title and artist while rejecting metadata and empty values', () => {
  assert.deepEqual(track, {
    title: 'A Alegria Do Senhor',
    artist: 'Sarah Beatriz',
    trackKey: 'a alegria do senhor sarah beatriz',
  });
  assert.equal(parseTrack('Rádio 88 FM'), null);
  assert.equal(parseTrack('Vinheta - Rádio 88 FM'), null);
  assert.equal(parseTrack('Rádio FM 88,7 - Volta Redonda RJ'), null);
  assert.equal(parseTrack('A música'), null);
  assert.equal(parseTrack('   '), null);
  assert.equal(parseTrack('x'.repeat(301)), null);
  assert.equal(parseTrack('A - B - C').title, 'A - B');
});

test('normalizes only known version suffixes and preserves semantic parentheticals', () => {
  const base = 'A Alegria Do Senhor';
  for (const version of ['Ao Vivo', 'Live at Studio', 'Acoustic', 'Acoustic Session', 'Session', 'Radio Edit', 'Remastered 2024']) {
    assert.equal(normalizeBaseTitle(`${base} (${version})`), normalizeBaseTitle(base));
  }
  assert.notEqual(
    normalizeBaseTitle('Bênçãos Que Não Têm Fim (Counting My Blessings)'),
    normalizeBaseTitle('Bênçãos Que Não Têm Fim')
  );
  assert.notEqual(normalizeBaseTitle('Ah, Jesus / Coração Igual ao Teu'), normalizeBaseTitle('Ah, Jesus'));
  assert.equal(normalizeBaseTitle('Medley Sejam Um'), normalizeBaseTitle('Sejam Um'));
  assert.notEqual(normalizeBaseTitle('Meu Medley Sejam Um'), normalizeBaseTitle('Sejam Um'));
});

test('uses the original song artwork for a VOX title prefixed with Medley', () => {
  const current = parseTrack('Medley Sejam Um - Fernanda Brum');
  const originalSong = makeCandidate({
    trackId: 2026,
    trackName: 'Sejam Um',
    artistName: 'Fernanda Brum',
    collectionName: 'Sonhos',
  });

  assert.equal(selectArtwork([originalSong], current)?.trackName, 'Sejam Um');
  assert.equal(selectArtwork([{ ...originalSong, artistName: 'Outra Artista' }], current), null);
});

test('recognizes only explicit broadcast labels at the end of a title', () => {
  for (const label of ['(Antiga)', '[Versão antiga]', '(MAIS TOCADA EM 2025)']) {
    const title = `Outra Faixa ${label}`;
    const current = parseTrack(`${title} - Artista`);
    const verified = makeCandidate({ trackName: 'Outra Faixa', artistName: 'Artista' });
    const literal = { ...verified, trackName: title, trackId: 202 };
    assert.equal(removeBroadcastTitleLabel(title), 'Outra Faixa');
    assert.equal(selectArtwork([verified], current)?.trackName, 'Outra Faixa');
    assert.equal(selectArtwork([verified, literal], current)?.trackName, title);
    assert.equal(selectArtwork([{ ...verified, artistName: 'Outro Artista' }], current), null);
    assert.equal(selectArtwork([{ ...verified, collectionName: 'Playback' }], current), null);
    assert.equal(selectArtwork([{ ...verified, trackName: 'Outra Faixa (Parte 2)' }], current), null);
  }
  for (const title of ['(Antiga)', 'Antiga', 'Outra (Antiga) Faixa', 'Outro (Parte 2)', 'Título (Nova Versão)', 'Título (1994)']) {
    assert.equal(removeBroadcastTitleLabel(title), title);
  }
});

test('recognizes parenthetical guest credits only when backed by track credits', () => {
  const current = parseTrack('Amo o Senhor (Marcus Salles) - Felipe Rodrigues');
  const base = makeCandidate({ trackName: 'Amo o Senhor (Ao Vivo)', artistName: 'Felipe Rodrigues' });
  assert.ok(selectArtwork([{ ...base, artistName: 'Felipe Rodrigues & Marcus Salles' }], current));
  assert.ok(selectArtwork([{ ...base, trackName: 'Amo o Senhor (feat. Marcus Salles) [Ao Vivo]' }], current));
  assert.equal(selectArtwork([base], current), null);
  assert.equal(selectArtwork([{ ...base, collectionName: 'Ao Vivo com Marcus Salles' }], current), null);
  assert.equal(selectArtwork([{ ...base, artistName: 'Marcus Salles' }], current), null);
  assert.equal(selectArtwork([{ ...base, artistName: 'Felipe Rodrigues & Marcus Salles Filho' }], current), null);
  assert.equal(selectArtwork([{ ...base, artistName: 'Felipe Rodrigues & Marcus Salles', collectionName: 'Playback' }], current), null);
  assert.equal(selectArtwork([base], parseTrack('Amo o Senhor (feat. Marcus Salles) - Felipe Rodrigues')), null);
  assert.equal(selectArtwork([base], parseTrack('Amo o Senhor (Parte 2) - Felipe Rodrigues')), null);
});

test('normalizes station title ampersands without dropping words or weakening artist checks', () => {
  const current = parseTrack('Grande & O Senhor - Adhemar De Campos');
  const official = makeCandidate({ trackName: 'Grande É o Senhor (feat. Nivea Soares) [Acústico ao Vivo]', artistName: 'Adhemar De Campos' });
  assert.ok(selectArtwork([official], current));
  assert.equal(selectArtwork([{ ...official, trackName: 'Grande o Senhor' }], current), null);
  assert.equal(selectArtwork([{ ...official, artistName: 'Adhemar De Campos Cover Band' }], current), null);
  assert.equal(selectArtwork([{ ...official, collectionName: 'Playback' }], current), null);
});

test('matches alternate versions by the same credited artist and returns Apple metadata', () => {
  const result = selectArtwork([
    makeCandidate({ trackId: 4, trackName: 'A Alegria do Senhor (Ao Vivo)', collectionName: 'Ao Vivo' }),
    makeCandidate({ trackId: 8, trackName: 'A Alegria do Senhor (Acoustic Session)', collectionName: 'Session' }),
  ], track);

  assert.deepEqual(result, {
    source: 'itunes',
    imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover/600x600bb.jpg',
    fallbackImageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover/100x100bb.jpg',
    trackName: 'A Alegria do Senhor (Ao Vivo)',
    artistName: 'Sarah Beatriz',
    albumName: 'Ao Vivo',
  });
});

test('prefers literal title and artist, then uses deterministic track ID tie-breaking', () => {
  const result = selectArtwork([
    makeCandidate({ trackId: 99, trackName: 'A Alegria do Senhor (Live)' }),
    makeCandidate({ trackId: 12 }),
    makeCandidate({ trackId: 5, trackName: 'A Alegria do Senhor', artistName: 'Sarah Beatriz & Convidado' }),
  ], track);
  assert.equal(result.trackName, 'A Alegria Do Senhor');
  assert.equal(result.artistName, 'Sarah Beatriz');

  const versionOnly = selectArtwork([
    makeCandidate({ trackId: 22, trackName: 'A Alegria do Senhor (Live)' }),
    makeCandidate({ trackId: 5, trackName: 'A Alegria do Senhor (Acoustic)' }),
  ], track);
  assert.equal(versionOnly.trackName, 'A Alegria do Senhor (Acoustic)');
});

test('rejects other artists, similar titles, karaoke, tribute, playback and unsafe links', () => {
  const rejected = [
    makeCandidate({ artistName: 'Sarah Beatriz Cover' }),
    makeCandidate({ trackName: 'A Alegria do Meu Senhor' }),
    makeCandidate({ trackName: 'A Alegria Do Senhor Karaoke' }),
    makeCandidate({ collectionName: 'A Tribute to Sarah Beatriz' }),
    makeCandidate({ trackName: 'A Alegria Do Senhor Playback' }),
    makeCandidate({ kind: 'music-video' }),
    makeCandidate({ artworkUrl100: 'https://evil-is1-ssl.mzstatic.com/cover.jpg' }),
  ];
  for (const candidate of rejected) assert.equal(selectArtwork([candidate], track), null);
  assert.equal(
    selectArtwork([makeCandidate({ artworkUrl100: 'http://is1-ssl.mzstatic.com/cover.jpg' })], track).imageUrl,
    'https://is1-ssl.mzstatic.com/cover.jpg'
  );

  assert.ok(selectArtwork([
    makeCandidate({ artistName: 'Outra, Sarah Beatriz' }),
  ], track));
  assert.equal(selectArtwork([
    makeCandidate({ artistName: 'Sarah Beatrizson' }),
  ], track), null);
});

test('accepts collaborator credits only when every requested artist is credited', () => {
  const duo = parseTrack('Canção - Artista A & Artista B');
  assert.ok(selectArtwork([makeCandidate({
    trackName: 'Canção (Ao Vivo)',
    artistName: 'Artista A, Artista B feat. Convidado',
  })], duo));
  assert.equal(selectArtwork([makeCandidate({
    trackName: 'Canção (Ao Vivo)',
    artistName: 'Artista A & Outro Artista',
  })], duo), null);
});

test('matches the Canção & Louvor station credit to the iTunes artist without splitting the duo name', () => {
  const current = parseTrack('Eu Cuido De Ti - Cancao & Louvor');
  const original = makeCandidate({
    trackId: 1160393550,
    trackName: 'Eu Cuido de Ti',
    artistName: 'Canção e Louvor',
    collectionName: 'Eu Cuido de Ti - EP',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/16/c7/63/16c7632d-e697-3b62-4ef8-c420bf51dae3/0.jpg/100x100bb.jpg',
  });
  const result = selectArtwork([
    { ...original, trackId: 1573443449, collectionName: 'Eu Cuido de Ti - Single' },
    original,
  ], current);
  assert.equal(result?.albumName, 'Eu Cuido de Ti - EP');
  assert.equal(result?.imageUrl, original.artworkUrl100.replace('100x100bb', '600x600bb'));
  assert.equal(selectArtwork([{ ...original, artistName: 'Canção' }], current), null);
  assert.equal(selectArtwork([{ ...original, artistName: 'Outra Canção e Louvor' }], current), null);
  assert.equal(selectArtwork([{ ...original, collectionName: 'Eu Cuido de Ti (Playback)' }], current), null);

  const withGuest = parseTrack('Eu Cuido De Ti - Cancao & Louvor & Convidado');
  assert.equal(selectArtwork([original], withGuest), null);
  assert.ok(selectArtwork([{ ...original, artistName: 'Convidado feat. Canção e Louvor' }], withGuest));
  assert.ok(selectArtwork([{ ...original, artistName: 'Canção & Louvor' }], parseTrack('Eu Cuido de Ti - Canção e Louvor')));
});

test('matches the VOX short credit Thalles only to its known iTunes artist name', () => {
  const thallesTrack = parseTrack('Meu Mundo - Thalles');
  const catalogMatch = makeCandidate({
    trackId: 904,
    trackName: 'Meu Mundo (Ao Vivo)',
    artistName: 'Thalles Roberto',
  });

  const result = selectArtwork([catalogMatch], thallesTrack);
  assert.equal(result.trackName, 'Meu Mundo (Ao Vivo)');
  assert.equal(result.artistName, 'Thalles Roberto');
  assert.equal(result.imageUrl, 'https://is1-ssl.mzstatic.com/image/thumb/cover/600x600bb.jpg');
  assert.equal(selectArtwork([{
    ...catalogMatch,
    artistName: 'Thalles Barbosa',
  }], thallesTrack), null);
});

test('matches Jo and Jó with the explicit Rose Nascimento catalog alias', () => {
  const candidate = makeCandidate({ trackName: 'Jo', artistName: 'Rose Nascimento Rose' });
  for (const title of ['Jo', 'Jó']) {
    const requested = parseTrack(`${title} - Rose Nascimento`);
    assert.ok(selectArtwork([candidate], requested));
    assert.equal(selectArtwork([{ ...candidate, artistName: 'Outra Rose' }], requested), null);
    assert.equal(selectArtwork([{ ...candidate, trackName: 'Outra Canção' }], requested), null);
    assert.equal(selectArtwork([{ ...candidate, collectionName: 'Playback' }], requested), null);
  }
});

test('matches featured credits in titles without accepting playback or other artists', () => {
  const current = parseTrack('Meu Abrigo - Davi Sacer');
  const candidate = makeCandidate({ trackName: 'Meu Abrigo (feat. Veronica Sacer) [Ao Vivo]', artistName: 'Davi Sacer' });
  assert.ok(selectArtwork([candidate], current));
  assert.equal(selectArtwork([{ ...candidate, collectionName: 'Meu Abrigo (Playback)' }], current), null);
  assert.equal(selectArtwork([{ ...candidate, artistName: 'Outro Artista' }], current), null);
  assert.notEqual(normalizeBaseTitle('Bênçãos (Counting My Blessings)'), normalizeBaseTitle('Bênçãos'));
});

test('validates only secure Apple image and store hosts', () => {
  assert.equal(isAppleArtworkUrl('https://is2-ssl.mzstatic.com/path/cover.jpg'), true);
  assert.equal(isAppleArtworkUrl('https://mzstatic.com/path/cover.jpg'), false);
  assert.equal(isAppleArtworkUrl('https://is2-ssl.mzstatic.com.evil.test/cover.jpg'), false);
});

test('keeps the original artworkUrl100 as fallback when the Apple URL cannot be upgraded', () => {
  const result = selectArtwork([makeCandidate({
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/cover/100x100-75.jpg',
  })], track);
  assert.equal(result.imageUrl, 'https://is1-ssl.mzstatic.com/image/thumb/cover/100x100-75.jpg');
  assert.equal(result.fallbackImageUrl, result.imageUrl);
});

test('queries iTunes once, validates the current VOX item, and caches the result', async () => {
  const calls = [];
  const resolve = createArtworkResolver({ fetcher: async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('api-json')) return new Response(JSON.stringify({ musica_atual: 'A Alegria Do Senhor - Sarah Beatriz' }));
    return new Response(JSON.stringify({ resultCount: 1, results: [makeCandidate({ trackName: 'A Alegria Do Senhor (Ao Vivo)' })] }));
  } });

  const [first, concurrent] = await Promise.all([resolve(), resolve()]);
  assert.deepEqual(first, concurrent);
  assert.equal(first.status, 'matched');
  assert.equal(first.artwork.source, 'itunes');
  assert.equal('sourceUrl' in first.artwork, false);
  assert.equal(calls.length, 2);

  const request = new URL(calls[1].url);
  assert.equal(request.origin + request.pathname, 'https://itunes.apple.com/search');
  assert.equal(request.searchParams.get('term'), 'Sarah Beatriz A Alegria Do Senhor');
  assert.equal(request.searchParams.get('entity'), 'song');
  assert.equal(request.searchParams.get('media'), 'music');
  assert.equal(request.searchParams.get('country'), 'BR');
  assert.equal(request.searchParams.get('limit'), '10');
  assert.equal(calls[1].options.redirect, 'error');
  assert.equal(calls[1].options.headers.Accept, 'application/json');

  await resolve();
  assert.equal(calls.length, 2);
});

test('searches iTunes for the original song when VOX prefixes its title with Medley', async () => {
  const calls = [];
  const resolve = createArtworkResolver({ fetcher: async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('api-json')) {
      return new Response(JSON.stringify({ musica_atual: 'Medley Sejam Um - Fernanda Brum' }));
    }
    return new Response(JSON.stringify({ resultCount: 1, results: [makeCandidate({
      trackId: 2026,
      trackName: 'Sejam Um',
      artistName: 'Fernanda Brum',
      collectionName: 'Sonhos',
    })] }));
  } });

  const result = await resolve();
  assert.equal(result.status, 'matched');
  assert.equal(result.artwork.trackName, 'Sejam Um');
  assert.equal(result.artwork.artistName, 'Fernanda Brum');
  assert.equal(result.artwork.albumName, 'Sonhos');
  assert.equal(new URL(calls[1].url).searchParams.get('term'), 'Fernanda Brum Sejam Um');
});

test('uses a single clean search for editorial labels without changing the station track key', async () => {
  const calls = [];
  const raw = 'Acima das Estrelas (Antiga) - Shirley Carvalhaes';
  const resolve = createArtworkResolver({ fetcher: async (url) => {
    const request = new URL(url);
    if (request.pathname.includes('api-json')) return Response.json({ musica_atual: raw });
    calls.push(request.searchParams.get('term'));
    return Response.json({ results: [makeCandidate({ trackName: 'Acima das Estrelas', artistName: 'Shirley Carvalhaes' })] });
  } });
  const result = await resolve();
  assert.equal(result.trackKey, parseTrack(raw).trackKey);
  assert.equal(result.status, 'matched');
  assert.deepEqual(await resolve(), result);
  assert.deepEqual(calls, ['acima das estrelas Shirley Carvalhaes']);
});

test('does not accept caller-controlled search terms and falls back on misses or provider errors', async () => {
  for (const itunesResponse of [
    new Response(JSON.stringify({ resultCount: 0, results: [] })),
    new Response('unavailable', { status: 503 }),
  ]) {
    const resolve = createArtworkResolver({ fetcher: async (url) => String(url).includes('api-json')
      ? new Response(JSON.stringify({ musica_atual: 'A Alegria Do Senhor - Sarah Beatriz' }))
      : itunesResponse });
    const result = await resolve();
    assert.ok(['not_found', 'unavailable'].includes(result.status));
    assert.equal(result.artwork, null);
  }
});

test('supports a runtime kill switch without contacting providers', async () => {
  const fetcher = async () => { throw new Error('must not fetch'); };
  const resolve = createArtworkResolver({ fetcher, enabled: () => false });
  assert.deepEqual(await resolve(), { status: 'disabled', trackKey: null, artwork: null });
});

test('backs off after a provider 429 and falls back without retrying', async () => {
  let calls = 0;
  const resolve = createArtworkResolver({ fetcher: async (url) => {
    calls += 1;
    if (String(url).includes('api-json')) return new Response(JSON.stringify({ musica_atual: 'A Alegria Do Senhor - Sarah Beatriz' }));
    return new Response('', { status: 429, headers: { 'retry-after': '120' } });
  } });
  assert.equal((await resolve()).status, 'unavailable');
  assert.equal((await resolve()).status, 'unavailable');
  assert.equal(calls, 2);
});
