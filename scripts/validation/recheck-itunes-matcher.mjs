import fs from 'node:fs/promises';
import { parseTrack, selectArtwork } from '../../server/music-artwork.mjs';

const inputPath = new URL('../../docs/integrations/itunes-deezer-gospel-results-2026-11-16.json', import.meta.url);
const outputPath = process.argv[2] || '/tmp/itunes-matcher-results.json';
const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const output = { executedAt: new Date().toISOString(), input: 'itunes-deezer-gospel-results-2026-11-16.json', results: [] };
const checkImages = process.env.CHECK_ITUNES_IMAGE_URLS === 'true';

for (const sample of input.results) {
  const track = parseTrack(`${sample.title} - ${sample.artist}`);
  const candidates = (sample.providers?.itunes?.candidates || []).map((candidate) => ({
    kind: 'song',
    trackId: candidate.id,
    trackName: candidate.title,
    artistName: candidate.artist,
    collectionName: candidate.album,
    artworkUrl100: candidate.image,
  }));
  const artwork = track ? selectArtwork(candidates, track) : null;
  let imageCheck = { checked: false };

  if (artwork && checkImages) {
    try {
      const response = await fetch(artwork.imageUrl, {
        method: 'HEAD',
        redirect: 'error',
        signal: AbortSignal.timeout(5_000),
      });
      imageCheck = {
        checked: true,
        httpStatus: response.status,
        contentType: response.headers.get('content-type'),
      };
    } catch (error) {
      imageCheck = { checked: true, error: error instanceof Error ? error.message : String(error) };
    }
  }

  output.results.push({
    title: sample.title,
    artist: sample.artist,
    candidateCount: candidates.length,
    selected: artwork,
    imageCheck,
  });
}

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
const matched = output.results.filter((result) => result.selected).length;
const available = output.results.filter((result) => result.imageCheck.httpStatus === 200 && result.imageCheck.contentType?.startsWith('image/')).length;
console.log(`Matched ${matched}/${output.results.length}; live image checks ${available}/${output.results.length}; report ${outputPath}`);
for (const result of output.results) {
  const imageStatus = result.imageCheck.checked ? result.imageCheck.httpStatus ?? result.imageCheck.error : 'not checked';
  console.log(`${result.selected ? 'MATCH' : 'MISS'} | ${result.title} | ${result.artist} | ${result.selected?.trackName || '-'} | ${imageStatus}`);
}
