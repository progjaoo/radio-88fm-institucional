export class MockAudio extends EventTarget {
  static instances: MockAudio[] = [];
  src: string;
  muted = false;
  preload = "";
  play = vi.fn(() => { this.dispatchEvent(new Event("playing")); return Promise.resolve(); });
  pause = vi.fn(() => { this.dispatchEvent(new Event("pause")); });
  constructor(src = "") { super(); this.src = src; MockAudio.instances.push(this); }
}
