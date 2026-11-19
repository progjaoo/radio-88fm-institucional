import fs from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { artworkSearchTerm, normalizeBaseTitle, parseTrack, removeBroadcastTitleLabel, selectArtwork } from '../../server/music-artwork.mjs';

const [mode, input, output] = process.argv.slice(2);
const historyUrl = 'https://stm39.srvstm.com:9776/played?sid=1&type=json';
const voxUrl = 'https://radiovox.conectastm.com/api-json/VkRGU2FrMHdOVzVRVkRBOStS';
const read = async () => JSON.parse(await fs.readFile(input, 'utf8').catch((error) => {
  if (mode === 'collect' && error.code === 'ENOENT') return '[]';
  throw error;
}));
const write = async (path, data) => {
  await fs.writeFile(path + '.tmp', JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  await fs.rename(path + '.tmp', path);
};
const get = (url) => fetch(url, { signal: AbortSignal.timeout(8000), redirect: 'error' });

if (!input || !['collect', 'compare'].includes(mode) || (mode === 'compare' && (!output || input === output))) {
  throw new Error('Usage: compare-itunes-queries.mjs collect SAMPLE.json | compare SAMPLE.json REPORT.json');
}

if (mode === 'collect') {
  const sample = await read();
  const seen = new Set(sample.map(({ raw }) => parseTrack(raw)?.trackKey));
  const until = Date.now() + 24 * 60 * 60_000;
  while (sample.length < 50 && Date.now() < until) {
    const sources = [[voxUrl, (data) => [data.musica_atual]], [historyUrl, (data) => data.map(({ title }) => title)]];
    for (const [url, titles] of sources) {
      try {
        const response = await get(url);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        for (const raw of titles(await response.json())) {
          const track = parseTrack(raw);
          if (!track || seen.has(track.trackKey) || sample.length >= 50) continue;
          sample.push({ raw, source: url === voxUrl ? 'vox' : 'stream-history', observedAt: new Date().toISOString() });
          seen.add(track.trackKey);
          await write(input, sample);
          console.info('Collected', sample.length, raw);
        }
      } catch (error) {
        console.warn('Collection request failed:', error.message);
      }
    }
    if (sample.length < 50) await delay(60_000);
  }
} else {
  const report = [];
  let lastRequest = 0;
  for (const observation of await read()) {
    const track = parseTrack(observation.raw);
    if (!track) continue;
    const title = track.title.replace(/^\s*medley\b\s*[:\-–—]?\s*/i, '');
    const editedTitle = removeBroadcastTitleLabel(title);
    const base = normalizeBaseTitle(editedTitle);
    const originalTerm = track.artist + ' ' + title;
    const baseTerm = (base || normalizeBaseTitle(title) || title) + ' ' + track.artist;
    const queries = [
      ['original-50', originalTerm, 50],
    ];
    const row = { ...observation, trials: {} };
    report.push(row);
    const trial = (results, term, details) => ({
      term, ...details, count: results.length,
      currentMatcher: selectArtwork(results, track, { useBroadcastMetadata: false }),
      refinedMatcher: selectArtwork(results, track),
      candidates: results.map(({ trackId, trackName, artistName, collectionName }) => ({ trackId, trackName, artistName, collectionName })),
    });
    for (const [variant, term, limit] of queries) {
      await delay(Math.max(0, lastRequest + 6100 - Date.now()));
      const params = new URLSearchParams({ term, limit: String(limit), country: 'BR', entity: 'song', media: 'music' });
      lastRequest = Date.now();
      try {
        const response = await get('https://itunes.apple.com/search?' + params);
        if (response.status === 429) throw new Error('Rate limited; stop the run');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const { results } = await response.json();
        if (!Array.isArray(results)) throw new Error('Unexpected iTunes response');
        row.trials[variant] = trial(results, term, { ms: Date.now() - lastRequest });
        if (variant === 'original-50') {
          const top10 = row.trials['top-10'] = trial(results.slice(0, 10), term, { derived: true });
          const top25 = row.trials['top-25'] = trial(results.slice(0, 25), term, { derived: true });
          const matched50 = row.trials[variant].currentMatcher;
          if (report.length <= 3 || !top10.currentMatcher || top10.currentMatcher?.trackName !== matched50?.trackName
            || top10.currentMatcher?.albumName !== matched50?.albumName
            || top25.currentMatcher?.albumName !== matched50?.albumName) {
            queries.push(['original-10', originalTerm, 10], ['original-25', originalTerm, 25]);
          }
          if ((!top10.currentMatcher || title !== editedTitle) && baseTerm !== originalTerm) {
            queries.push(['base-25', baseTerm, 25]);
          }
          const preferredTerm = artworkSearchTerm(track);
          if (preferredTerm !== originalTerm) queries.push(['preferred-10', preferredTerm, 10]);
        }
      } catch (error) {
        row.trials[variant] = { term, error: error.message };
        if (error.message.startsWith('Rate limited')) {
          await write(output, report);
          throw error;
        }
      }
      await write(output, report);
    }
    console.info('Compared', observation.raw);
  }
}
