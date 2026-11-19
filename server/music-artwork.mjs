const VOX_URL = 'https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS';
const ITUNES_URL = 'https://itunes.apple.com/search';
const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_CACHE_ENTRIES = 256;
const REQUESTS_PER_MINUTE = 10;
const VOX_CACHE_MS = 15_000;
const MATCH_CACHE_MS = 60 * 60 * 1_000;
const MISS_CACHE_MS = 10 * 60 * 1_000;
const ERROR_CACHE_MS = 60 * 1_000;
const ARTIST_ALIAS_GROUPS = [
  new Set(['thalles', 'thalles roberto']),
  new Set(['rose nascimento', 'rose nascimento rose']),
  new Set(['cancao e louvor', 'cancao louvor']),
];
// Only verified names keep an ampersand inside a single artist credit.
const AMPERSAND_ARTIST_NAMES = new Set(['cancao louvor']);

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

function splitCredits(value) {
  const parts = String(value || '').split(/\s*(,|&|\bfeat(?:uring)?\b\.?|\bft\b\.?)\s*/i);
  const credits = [];
  for (let index = 0; index < parts.length; index += 2) {
    const joined = parts[index + 1] === '&' && normalize(`${parts[index]} ${parts[index + 2]}`);
    if (joined && AMPERSAND_ARTIST_NAMES.has(joined)) {
      credits.push(joined);
      index += 2;
    } else {
      const credit = normalize(parts[index]);
      if (credit) credits.push(credit);
    }
  }
  return credits;
}

function searchTitle(value) {
  return String(value || '').replace(/^\s*medley\b\s*[:\-–—]?\s*/i, '').trim();
}

export function removeBroadcastTitleLabel(value) {
  const title = String(value || '').trim();
  // Strip only explicit suffixes observed in the station metadata.
  const suffix = /\s*(?:\(([^()]*)\)|\[([^\[\]]*)\])$/;
  const match = title.match(suffix);
  const base = match && title.slice(0, match.index).trim();
  return base && /^(?:(?:versao )?antiga|mais tocada em (?:19|20)\d{2})$/.test(normalize(match[1] ?? match[2]))
    ? base
    : title;
}

function featuredCredits(title) {
  return [...String(title || '').matchAll(/\s*[\[(]\s*(?:feat(?:uring)?\.?|ft\.?)\s+([^\])]+)[\])]/gi)]
    .flatMap(([, names]) => splitCredits(names));
}

function normalizeTitleJoiners(title) {
  return String(title || '').replace(/\s&(?=\s)/g, ' e');
}

function artistsMatch(requested, credited) {
  if (requested === credited) return true;
  return ARTIST_ALIAS_GROUPS.some((aliases) => aliases.has(requested) && aliases.has(credited));
}

const VERSION_SUFFIXES = [
  /(?:^|\s)ao vivo(?:\s+(?:em|no|na|de|do|da)\s+.+)?$/,
  /(?:^|\s)live(?:\s+(?:at|in|from|on)\s+.+)?$/,
  /(?:^|\s)acoustic(?: session)?$/,
  /(?:^|\s)acustic[oa](?: session)?$/,
  /(?:^|\s)session$/,
  /(?:^|\s)radio edit$/,
  /(?:^|\s)remaster(?:ed)?(?: \d{4})?$/,
];

export function normalizeBaseTitle(value) {
  // A featured-artist credit is metadata, not part of the song title.
  let title = normalize(searchTitle(String(value || '').replace(/\s*[\[(]\s*(?:feat(?:uring)?\.?|ft\.?)\s+[^\])]+[\])]\s*/gi, ' ')));
  for (let pass = 0; pass < 4; pass += 1) {
    const previous = title;
    for (const suffix of VERSION_SUFFIXES) {
      title = title.replace(suffix, '').trim();
    }
    if (title === previous || !title) break;
  }
  return title;
}

export function artworkSearchTerm(track) {
  const original = searchTitle(track.title);
  const withoutLabel = removeBroadcastTitleLabel(original);
  if (withoutLabel === original) return `${track.artist} ${original}`;
  const base = normalizeBaseTitle(normalizeTitleJoiners(withoutLabel));
  return `${base || withoutLabel} ${track.artist}`;
}

export function parseTrack(value) {
  if (typeof value !== 'string' || value.length > 300) return null;
  const raw = value.trim();
  if (!raw) return null;

  const separator = raw.lastIndexOf(' - ');
  if (separator <= 0 || separator >= raw.length - 3) return null;
  const title = raw.slice(0, separator).trim();
  const artist = raw.slice(separator + 3).trim();
  const genericMetadata = /^(?:radio\s*88(?:\s*fm)?|vinheta|comercial|sem musica|sem informacao)$/;
  const normalizedTitle = normalize(title);
  const stationIdentifier = /^radio(?: fm)? \d+(?: \d+)?(?: .*)?$/;
  if (genericMetadata.test(normalizedTitle) || genericMetadata.test(normalize(artist)) || stationIdentifier.test(normalizedTitle)) return null;
  if (!title || !artist || !normalizeBaseTitle(title) || !splitCredits(artist).length) return null;

  return { title, artist, trackKey: normalize(raw) };
}

export function isAppleArtworkUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /^is\d+-ssl\.mzstatic\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function secureArtworkUrl(value) {
  try {
    const url = new URL(value);
    if (!/^is\d+-ssl\.mzstatic\.com$/i.test(url.hostname) || !['http:', 'https:'].includes(url.protocol)) return null;
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
}

function getArtworkVariants(value) {
  const originalUrl = secureArtworkUrl(value);
  if (!originalUrl) return null;
  const highResolutionUrl = originalUrl.replace(/\/100x100bb\.(jpg|jpeg|png|webp)$/i, '/600x600bb.$1');
  return {
    imageUrl: isAppleArtworkUrl(highResolutionUrl) ? highResolutionUrl : originalUrl,
    fallbackImageUrl: originalUrl,
  };
}

function hasForbiddenVersion(track) {
  const metadata = [track.trackName, track.artistName, track.collectionName].join(' ');
  return /\b(?:karaoke|karaok[eê]|tribute|instrumental|playback|backing track|cover version)\b/i.test(metadata);
}

function matchCandidate(candidate, track, useBroadcastMetadata) {
  if (!candidate || typeof candidate !== 'object' || candidate.kind !== 'song' || hasForbiddenVersion(candidate)) return null;

  const canonicalTitle = useBroadcastMetadata ? normalizeTitleJoiners : (value) => value;
  const candidateTitle = normalize(canonicalTitle(candidate.trackName));
  const requestedTitle = normalize(canonicalTitle(searchTitle(track.title)));
  const candidateBaseTitle = normalizeBaseTitle(canonicalTitle(candidate.trackName));
  const literalTitle = Boolean(candidateTitle && candidateTitle === requestedTitle);

  const requestedArtists = splitCredits(track.artist);
  const candidateArtists = splitCredits(candidate.artistName);
  if (!requestedArtists.length || requestedArtists.some((artist) => !candidateArtists.some((credit) => artistsMatch(artist, credit)))) return null;

  const verifiedCredits = useBroadcastMetadata ? [...candidateArtists, ...featuredCredits(candidate.trackName)] : candidateArtists;
  const credited = (artist) => verifiedCredits.some((credit) => artistsMatch(artist, credit));
  if (useBroadcastMetadata && !featuredCredits(track.title).every(credited)) return null;

  const broadcastTitle = useBroadcastMetadata ? removeBroadcastTitleLabel(track.title) : track.title;
  const requestedBaseTitle = normalizeBaseTitle(canonicalTitle(broadcastTitle));
  if (!literalTitle && (!candidateBaseTitle || candidateBaseTitle !== requestedBaseTitle)) {
    // A bare parenthetical is a guest only when the candidate explicitly credits that name.
    const guest = useBroadcastMetadata && broadcastTitle.match(/^(.+?)\s*\(([^()]+)\)\s*$/);
    const guests = guest ? splitCredits(guest[2]) : [];
    if (!guest || !candidateBaseTitle || candidateBaseTitle !== normalizeBaseTitle(normalizeTitleJoiners(guest[1]))
      || !guests.length || !guests.every((artist) => credited(artist) && !requestedArtists.some((main) => artistsMatch(main, artist)))) return null;
  }

  const literalArtist = normalize(candidate.artistName) === normalize(track.artist);
  const score = literalArtist
    ? (literalTitle ? 40 : 30)
    : (literalTitle ? 20 : 10);
  const artworkUrls = getArtworkVariants(candidate.artworkUrl100);
  const trackId = String(candidate.trackId ?? '').trim();
  if (!artworkUrls || !trackId) return null;

  return {
    score,
    trackId,
    ...artworkUrls,
    trackName: String(candidate.trackName).slice(0, 200),
    artistName: String(candidate.artistName).slice(0, 200),
    albumName: typeof candidate.collectionName === 'string' ? candidate.collectionName.slice(0, 200) : '',
  };
}

export function selectArtwork(rows, track, { useBroadcastMetadata = true } = {}) {
  const matches = (Array.isArray(rows) ? rows : [])
    .map((candidate) => matchCandidate(candidate, track, useBroadcastMetadata))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.trackId.localeCompare(b.trackId, 'en', { numeric: true }) || a.imageUrl.localeCompare(b.imageUrl));

  if (!matches.length) return null;
  const { imageUrl, fallbackImageUrl, trackName, artistName, albumName } = matches[0];
  return { source: 'itunes', imageUrl, fallbackImageUrl, trackName, artistName, albumName };
}

async function readLimitedJson(response) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new Error('Provider response too large');
  }

  if (!response.body?.getReader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) throw new Error('Provider response too large');
    return JSON.parse(text);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('Provider response too large');
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text);
}

function retryAfterMs(value, now) {
  if (!value) return 60_000;
  const seconds = Number(value);
  const parsed = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(value) - now;
  return Math.min(60 * 60_000, Math.max(60_000, Number.isFinite(parsed) ? parsed : 60_000));
}

const defaultEnabled = () => !['false', '0', 'off'].includes(String(process.env.MUSIC_ARTWORK_ENABLED || '').toLowerCase());

export function createArtworkResolver({ fetcher = fetch, now = Date.now, enabled = defaultEnabled } = {}) {
  let currentTrack = null;
  let currentUntil = 0;
  let metadataFlight = null;
  let blockedUntil = 0;
  let windowStart = 0;
  let calls = 0;
  const cache = new Map();
  const flights = new Map();

  async function json(url) {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(3_000),
      redirect: 'error',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 429) blockedUntil = now() + retryAfterMs(response.headers.get('retry-after'), now());
    if (!response.ok) throw new Error('Provider unavailable');
    return readLimitedJson(response);
  }

  function remember(key, result, ttl) {
    if (cache.size >= MAX_CACHE_ENTRIES && !cache.has(key)) cache.delete(cache.keys().next().value);
    cache.set(key, { until: now() + ttl, result });
  }

  async function getCurrentTrack() {
    if (now() < currentUntil) return currentTrack;
    if (!metadataFlight) {
      metadataFlight = json(VOX_URL)
        .then((data) => { currentTrack = parseTrack(data?.musica_atual); })
        .catch(() => { currentTrack = null; })
        .finally(() => {
          currentUntil = now() + VOX_CACHE_MS;
          metadataFlight = null;
        });
    }
    await metadataFlight;
    return currentTrack;
  }

  return async function resolve() {
    if (!enabled()) return { status: 'disabled', trackKey: null, artwork: null };
    let track;
    try {
      track = await getCurrentTrack();
    } catch {
      return { status: 'unavailable', trackKey: null, artwork: null };
    }
    if (!track) return { status: 'not_found', trackKey: null, artwork: null };

    const saved = cache.get(track.trackKey);
    if (saved && saved.until > now()) return saved.result;
    cache.delete(track.trackKey);
    if (flights.has(track.trackKey)) return flights.get(track.trackKey);
    if (now() < blockedUntil) return { status: 'unavailable', trackKey: track.trackKey, artwork: null };

    if (!windowStart || now() - windowStart >= 60_000) {
      windowStart = now();
      calls = 0;
    }
    if (calls >= REQUESTS_PER_MINUTE) {
      const result = { status: 'unavailable', trackKey: track.trackKey, artwork: null };
      remember(track.trackKey, result, ERROR_CACHE_MS);
      return result;
    }
    calls += 1;

    const job = (async () => {
      const params = new URLSearchParams({ term: artworkSearchTerm(track), entity: 'song', media: 'music', country: 'BR', limit: '10' });
      const data = await json(`${ITUNES_URL}?${params.toString()}`);
      if (!Array.isArray(data?.results)) throw new Error('Unexpected iTunes response');
      const artwork = selectArtwork(data.results, track);
      const result = { status: artwork ? 'matched' : 'not_found', trackKey: track.trackKey, artwork };
      remember(track.trackKey, result, artwork ? MATCH_CACHE_MS : MISS_CACHE_MS);
      return result;
    })().catch(() => {
      const result = { status: 'unavailable', trackKey: track.trackKey, artwork: null };
      remember(track.trackKey, result, ERROR_CACHE_MS);
      return result;
    }).finally(() => flights.delete(track.trackKey));

    flights.set(track.trackKey, job);
    return job;
  };
}

const resolve = createArtworkResolver();

export async function artworkHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  res.end(JSON.stringify(await resolve()));
}
