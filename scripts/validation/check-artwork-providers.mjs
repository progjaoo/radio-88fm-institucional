import fs from 'node:fs/promises';
const sample = [
 ['A mão de Deus','Marcus Salles'], ['Um novo dia','Get Worship'],
 ['Ah, Jesus / Coração Igual ao Teu','Julliany Souza'], ['Quem É Esse?','Julliany Souza'],
 ['A Casa É Sua','Casa Worship'], ['Bondade de Deus','Isaias Saad'],
 ['Bênçãos Que Não Têm Fim (Counting My Blessings)','Isadora Pompeo'],
 ['É Tudo Sobre Você / Ser Mudado','Morada'], ['Santo Pra Sempre','Fernandinho'],
 ['Tu És + Águas Purificadoras (Ao Vivo)','fhop music'], ['Deus de Obras Completas','Kemilly Santos'],
 ['Terra Seca','Fraternidade São João Paulo II'],
];
const out = { executedAt: new Date().toISOString(), source: 'https://billboard.com.br/gospel-10-musicas-mais-ouvidas-nesta-semana/', results: [] };
for (const [title, artist] of sample) {
 const row = { title, artist, providers: {} };
 for (const provider of ['itunes','deezer']) {
  const params = provider === 'itunes' ? new URLSearchParams({term: `${artist} ${title}`, entity:'song',country:'BR',limit:'10'}) : new URLSearchParams({q: `artist:"${artist}" track:"${title}"`,limit:'10'});
  const url = provider === 'itunes' ? `https://itunes.apple.com/search?${params}` : `https://api.deezer.com/search?${params}`;
  const start = Date.now();
  try {
   const response = await fetch(url, {signal:AbortSignal.timeout(15000)});
   const data = await response.json();
   row.providers[provider] = { url, httpStatus:response.status, elapsedMs:Date.now()-start, total: data.resultCount ?? data.total ?? null, error:data.error ?? null, candidates:(data.results ?? data.data ?? []).map(r => provider === 'itunes' ? { id:r.trackId,title:r.trackName,artist:r.artistName,album:r.collectionName,image:r.artworkUrl100,link:r.trackViewUrl } : {id:r.id,title:r.title,artist:r.artist?.name,album:r.album?.title,image:r.album?.cover_xl,link:r.link}) };
  } catch (e) { row.providers[provider]={url,error:e.message,elapsedMs:Date.now()-start}; }
 }
 out.results.push(row);
 console.log(JSON.stringify(row));
}
await fs.writeFile(process.argv[2] || '/tmp/artwork-provider-results.json', JSON.stringify(out,null,2)+'\n');
