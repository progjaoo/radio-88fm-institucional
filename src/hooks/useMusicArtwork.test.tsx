import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { isAppleArtworkUrl, musicKey, useMusicArtwork } from './useMusicArtwork';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const artwork = {
  source: 'itunes',
  imageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover/600x600bb.jpg',
  fallbackImageUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover/100x100bb.jpg',
  trackName: 'Yellow',
  artistName: 'Coldplay',
  albumName: 'Parachutes',
};

it('resolves Apple cover metadata without requiring playback', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'matched', trackKey: musicKey('Yellow - Coldplay'), artwork }),
  }));
  const { result } = renderHook(() => useMusicArtwork('Yellow - Coldplay'));
  await waitFor(() => expect(result.current).toEqual(artwork));
});

it('clears old artwork and ignores a delayed response for a different track', async () => {
  const pending: Array<(value: unknown) => void> = [];
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => pending.push(resolve))));
  const { result, rerender } = renderHook(({ track }) => useMusicArtwork(track), {
    initialProps: { track: 'Yellow - Coldplay' },
  });
  rerender({ track: 'Outra - Artista' });

  await act(async () => pending[0]({
    ok: true,
    json: async () => ({ status: 'matched', trackKey: musicKey('Yellow - Coldplay'), artwork }),
  }));
  expect(result.current).toBeNull();
});

it('retries while the endpoint is behind the current track without showing the old cover', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'matched', trackKey: 'previous artist', artwork }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'matched', trackKey: 'yellow coldplay', artwork }) });
  vi.stubGlobal('fetch', fetcher);
  const { result } = renderHook(() => useMusicArtwork('Yellow - Coldplay'));

  await act(async () => {});
  expect(result.current).toBeNull();
  await act(async () => vi.advanceTimersByTimeAsync(5_000));
  expect(result.current).toEqual(artwork);
  await act(async () => vi.advanceTimersByTimeAsync(60_000));
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it('stops retrying after the limit, on an explicit miss, and when the track changes', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'not_found', trackKey: 'previous artist' }) });
  vi.stubGlobal('fetch', fetcher);
  const { result, rerender } = renderHook(({ track }) => useMusicArtwork(track), { initialProps: { track: 'Yellow - Coldplay' } });
  await act(async () => vi.advanceTimersByTimeAsync(60_000));
  expect(fetcher).toHaveBeenCalledTimes(4);
  expect(result.current).toBeNull();

  rerender({ track: 'Another - Artist' });
  await act(async () => {});
  expect(fetcher).toHaveBeenCalledTimes(5);
  fetcher.mockResolvedValue({ ok: true, json: async () => ({ status: 'not_found', trackKey: 'third artist' }) });
  rerender({ track: 'Third - Artist' });
  await act(async () => vi.advanceTimersByTimeAsync(60_000));
  expect(fetcher).toHaveBeenCalledTimes(6);
  expect(result.current).toBeNull();
});

it('uses fallback on API failure, ignores empty metadata and rejects unsafe source URLs', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
  vi.stubGlobal('fetch', fetcher);
  const { result, rerender } = renderHook(({ track }) => useMusicArtwork(track), { initialProps: { track: '' } });
  expect(fetcher).not.toHaveBeenCalled();
  rerender({ track: 'A - B' });
  await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  expect(result.current).toBeNull();

  expect(isAppleArtworkUrl(artwork.imageUrl)).toBe(true);
  expect(isAppleArtworkUrl('https://is1-ssl.mzstatic.com.attacker.test/cover.jpg')).toBe(false);
});

it('rejects a matched response with non-Apple URLs', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      status: 'matched',
      trackKey: musicKey('Yellow - Coldplay'),
      artwork: { ...artwork, imageUrl: 'https://attacker.example/cover.jpg' },
    }),
  }));
  const { result } = renderHook(() => useMusicArtwork('Yellow - Coldplay'));
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(result.current).toBeNull();
});
