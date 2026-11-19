import { describe, expect, it } from "vitest";
import { getDisplayName, getMediaTitle, STATION_MEDIA_TITLE } from "./streamUtils";

describe("stream labels", () => {
  it.each([undefined, null, "", "   ", "Radio Fm 88,7 - Volta Redonda", "Rádio FM 88.7 - Volta Redonda", "Radio FM88,7 - Volta Redonda", "Rádio 88 FM", "radio88fm", "Rádio 88 FM - O Som do Céu!", "Vinheta", "Sem música"])("uses the station identity for %s", value => {
    expect(getMediaTitle(value)).toBe(STATION_MEDIA_TITLE);
    expect(getDisplayName(value)).toBe("Rádio 88 FM");
  });
  it.each(["Jó - Rose Nascimento", "Grande & O Senhor - Adhemar de Campos", "Rádio de Deus - Cantor", "  Videira - Fernanda Brum  "])("preserves the song and artist: %s", value => {
    expect(getMediaTitle(value)).toBe(value.trim());
    expect(getDisplayName(value)).toBe(value.trim());
  });
});
