/**
 * Procedural Web Audio API sound synthesizer for True Detective 3D.
 * Zero external audio files or network dependencies.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private rainGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = false;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
    this.masterGain.connect(this.ctx.destination);

    this.startAmbientRain();
    this.startNoirDrone();
    this.isInitialized = true;
  }

  private startAmbientRain() {
    if (!this.ctx || !this.masterGain) return;

    // Generate white noise buffer for rain
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Bandpass filter for rain sound against glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    whiteNoise.start();
  }

  private startNoirDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Sub-bass noir drone (55Hz and 82.5Hz)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
  }

  public ensureAudio() {
    if (!this.isInitialized) {
      this.initContext();
    } else if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playFlashlightClick(isUv = false) {
    this.ensureAudio();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isUv ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isUv ? 1200 : 700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isUv ? 400 : 180, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playClueDiscovered() {
    this.ensureAudio();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Mystery chord sting (F# minor 9)
    const notes = [185.0, 220.0, 277.18, 329.63, 415.3]; // F#3, A3, C#4, E4, G#4
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.03);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx!.currentTime + idx * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.ctx!.currentTime + idx * 0.03);
      osc.stop(this.ctx!.currentTime + 1.3);
    });
  }

  public playGavelStrike(isSuccess = true) {
    this.ensureAudio();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Heavy wooden knock
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);

    if (isSuccess) {
      setTimeout(() => {
        this.playClueDiscovered();
      }, 250);
    }
  }

  public playPaperSlam() {
    this.ensureAudio();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playCameraShutter() {
    this.ensureAudio();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Mechanical shutter click burst (short filtered noise)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    // Flash capacitor whine
    const osc = this.ctx.createOscillator();
    const whineGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(3800, this.ctx.currentTime + 0.45);
    whineGain.gain.setValueAtTime(0.04, this.ctx.currentTime + 0.05);
    whineGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.48);

    osc.connect(whineGain);
    whineGain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + 0.05);
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

export const audio = new AudioService();
