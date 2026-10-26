/**
 * Web Audio API Retro Sound Effects Engine for Warhammer 40k: Space Marine
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;

  constructor() {
    const savedMute = localStorage.getItem('sm_sound_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('sm_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public connectWithPan(node: AudioNode, pan: number = 0) {
    if (!this.ctx) return;
    if (this.ctx.createStereoPanner && pan !== 0) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
      node.connect(panner);
      panner.connect(this.ctx.destination);
    } else {
      node.connect(this.ctx.destination);
    }
  }

  private combatIntensity: number = 0.0;

  public setCombatIntensity(level: number) {
    this.combatIntensity = Math.max(0, Math.min(1, level));
  }

  // --- Sound Effects ---

  /** Bolter Shot: Punchy square-pulse with mechanical snap */
  public playBolter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    // Add noise click for boltgun mechanical ejection
    this.playNoise(0.04, 800, this.volume * 0.25);
  }

  /** Plasma Cannon: Energy hum charging then exploding */
  public playPlasmaShot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /** Heavy Bolter: Continuous rapid heavy caliber pounding */
  public playHeavyBolter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);

    this.playNoise(0.03, 1100, this.volume * 0.22);
  }

  /** Lascannon: Piercing high-voltage beam crack */
  public playLascannon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);

    this.playNoise(0.18, 2200, this.volume * 0.3);
  }

  /** Orbiting Storm Shield: Metallic energy bash clang */
  public playShieldBash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** Thunder Hammer: Tremendous thunderclap and crackling lightning */
  public playThunderHammer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);

    this.playNoise(0.3, 500, this.volume * 0.45);
  }

  /** Vortex Grenade: Warp suction and gravity pulse */
  public playVortex() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(340, t + 0.15);
    osc.frequency.linearRampToValueAtTime(80, t + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /** Tactical Combat Dash: Thruster whoosh */
  public playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);

    this.playNoise(0.12, 1400, this.volume * 0.35);
  }

  /** Imperial Relic Chest Opening: Celestial brass fanfare and chime */
  public playChestOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending royal arpeggio
    const chord = [392.00, 523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(this.volume * 0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(st);
      osc.stop(st + 0.55);
    });
  }

  /** Low HP Heartbeat Thump */
  public playHeartbeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

    gain.gain.setValueAtTime(this.volume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /** Servo-Skull Las-Zap */
  public playServoZap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Heavy Explosion (Plasma blast / Grenade detonation) with Positional Stereo Panning */
  public playExplosion(pan: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.32);

    gain.gain.setValueAtTime(this.volume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    this.connectWithPan(gain, pan);

    osc.start(t);
    osc.stop(t + 0.32);

    this.playNoise(0.28, 400, this.volume * 0.45);
  }

  /** Chainsword Whir / Cut */
  public playChainsword() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.05);
    osc.frequency.linearRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** Flamer Burn: White noise fire whoosh */
  public playFlamer() {
    if (this.isMuted) return;
    this.playNoise(0.14, 1200, this.volume * 0.2);
  }

  /** Melta Beam: Searing energy laser */
  public playMelta() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Biomass Orb Pickup: Crystalline chime */
  public playBiomass() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Randomize slight pitch for pleasing pickup musicality
    const notes = [587.33, 659.25, 783.99, 880.00, 1046.50];
    const pitch = notes[Math.floor(Math.random() * notes.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.3, t + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** Level Up Fanfare: Triumphant Imperial Chord */
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.07;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  /** Player Hurt / Armor Impact */
  public playPlayerHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** Tyranid Death Squish / Screech */
  public playTyranidSquish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.07);

    gain.gain.setValueAtTime(this.volume * 0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /** Carnifex Boss Roar */
  public playCarnifexRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.9);

    gain.gain.setValueAtTime(this.volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.9);

    this.playNoise(0.7, 300, this.volume * 0.35);
  }

  /** Hive Tyrant Supreme Roar */
  public playHiveTyrantRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.2);

    gain.gain.setValueAtTime(this.volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.2);

    this.playNoise(1.0, 450, this.volume * 0.45);
  }

  /** Turret Autocannon Shot */
  public playTurretShot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /** Promethium Barrel Explosion */
  public playBarrelExplode() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playNoise(0.65, 260, this.volume * 0.6);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.5);

    gain.gain.setValueAtTime(this.volume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  /** Zoanthrope Psychic Warp Blast */
  public playPsykerBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.2);

    gain.gain.setValueAtTime(this.volume * 0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Apothecary Medical Injection / Store Health */
  public playHeal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [329.63, 440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(this.volume * 0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.18);
    });
  }

  /** Weapon Evolution Fanfare */
  public playEvolution() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [293.66, 370.0, 440.0, 587.33, 740.0, 880.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(this.volume * 0.35, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.3);
    });
  }

  /** Armory Upgrade Purchase SFX */
  public playPurchase() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.setValueAtTime(783.99, t + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- Procedural 8-Bit Gothic Synth BGM Engine ---
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private isBgmActive: boolean = false;
  private isDucked: boolean = false;

  public setDucking(ducked: boolean) {
    this.isDucked = ducked;
  }

  public startBgm() {
    if (this.bgmInterval !== null || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.isBgmActive = true;
    this.bgmStep = 0;

    // Bass notes progression in D minor
    const bassline = [
      73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.0, 98.00,
      73.42, 73.42, 87.31, 73.42, 65.41, 73.42, 87.31, 65.41
    ];

    // Gothic synth melody notes
    const leadline = [
      293.66, 0, 349.23, 293.66, 440.00, 0, 392.00, 349.23,
      293.66, 0, 349.23, 392.00, 440.00, 523.25, 440.00, 392.00
    ];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const step = this.bgmStep % 16;

      const duckMult = this.isDucked ? 0.35 : 1.0;

      // 1. Bass Pulse (Triangle 8-bit tone)
      const bassFreq = bassline[step];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, t);

        gain.gain.setValueAtTime(this.volume * 0.18 * duckMult, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
      }

      // 2. Gothic Lead Synth (Square wave with warm filter)
      const leadFreq = leadline[step];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadFilter = this.ctx.createBiquadFilter();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadFilter.type = 'lowpass';
        leadFilter.frequency.setValueAtTime(1400, t);

        leadGain.gain.setValueAtTime(this.volume * 0.12 * duckMult, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(t);
        leadOsc.stop(t + 0.17);
      }

      // 3. Hi-hat noise tick on off-beats
      if (step % 2 === 1) {
        this.playNoise(0.02, 6000, this.volume * 0.05);
      }

      // 4. Dynamic Combat Drums & Swarm Tension based on combatIntensity
      if (this.combatIntensity > 0.35 && (step === 0 || step === 4 || step === 8 || step === 12)) {
        // Heavy 808 War Drum Kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(125, t);
        kickOsc.frequency.exponentialRampToValueAtTime(32, t + 0.14);
        kickGain.gain.setValueAtTime(this.volume * 0.28 * duckMult * this.combatIntensity, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(t);
        kickOsc.stop(t + 0.14);
      }

      if (this.combatIntensity > 0.65 && step % 2 === 0) {
        // High Intensity Swarm Arp (Sawtooth tension pulse)
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        arpOsc.type = 'sawtooth';
        const arpNotes = [587.33, 659.25, 698.46, 783.99]; // D5, E5, F5, G5
        arpOsc.frequency.setValueAtTime(arpNotes[(step / 2) % 4], t);
        arpGain.gain.setValueAtTime(this.volume * 0.08 * duckMult * this.combatIntensity, t);
        arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        arpOsc.connect(arpGain);
        arpGain.connect(this.ctx.destination);
        arpOsc.start(t);
        arpOsc.stop(t + 0.08);
      }

      this.bgmStep++;
    }, 180);
  }

  public stopBgm() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmActive = false;
  }

  public toggleBgm(): boolean {
    if (this.isBgmActive) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public isBgmRunning(): boolean {
    return this.isBgmActive;
  }

  /** Meaty Ballistic Bullet Impact & Chitin Crack */
  public playBulletImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);

    this.playNoise(0.03, 1600, this.volume * 0.15);
  }

  /** Dreadnought Rotary Assault Cannon: High-speed Gatling Brrrrt */
  public playDreadnoughtAssaultCannon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);

    this.playNoise(0.03, 1200, this.volume * 0.2);
  }

  /** Dreadnought Power Fist Ground Stomp */
  public playDreadnoughtStomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(85, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);

    this.playNoise(0.3, 300, this.volume * 0.45);
  }

  /** Orbital Strike Warning Siren */
  public playOrbitalSiren() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.2);
    osc.frequency.linearRampToValueAtTime(550, t + 0.4);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  /** Orbital Strike Celestial Holy Lance Blast */
  public playOrbitalBeam() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.7);

    gain.gain.setValueAtTime(this.volume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.7);

    this.playNoise(0.65, 450, this.volume * 0.5);
  }

  /** Slow-Mo Boss Finisher Boom */
  public playSlowMoFinisher() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 1.2);

    gain.gain.setValueAtTime(this.volume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.2);

    this.playNoise(0.8, 250, this.volume * 0.55);
  }

  /** Space Marine Battle Cry Shouted: Synth Fanfare + Web Speech Vox */
  public playBattleCry(event: 'ultimate' | 'overdrive' | 'boss_kill' = 'ultimate') {
    if (this.isMuted) return;
    this.initContext();
    if (this.ctx) {
      const t = this.ctx.currentTime;
      const notes = [330, 440, 554, 659];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(this.volume * 0.15, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.12);
      });
    }

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const lines = {
          ultimate: [
            'For the Emperor!',
            'Courage and honour!',
            'No mercy! No respite!',
            'Cleanse the stars!'
          ],
          overdrive: [
            'Fury of the Astartes!',
            'We are his wrath!',
            'They shall know no fear!',
            'Burn the alien filth!'
          ],
          boss_kill: [
            'Abomination terminated!',
            'Xenos leader eliminated!',
            'Victory for the Imperium!',
            'By his holy will!'
          ]
        };

        const list = lines[event] || lines.ultimate;
        const phrase = list[Math.floor(Math.random() * list.length)];
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.rate = 1.05;
        utter.pitch = 0.65;
        utter.volume = Math.min(1, this.volume * 1.5);
        
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Google')));
        if (enVoice) utter.voice = enVoice;

        window.speechSynthesis.speak(utter);
      }
    } catch {
      // Fallback silently if speech synthesis blocked by policy
    }
  }

  /** Drop Pod / Heavy Supply Pod Impact Landing */
  public playChestDrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);

    this.playNoise(0.3, 350, this.volume * 0.45);
  }

  /** Noise helper for blasts, flamer, clicks */
  private playNoise(duration: number, cutoff: number, vol: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  /** Proximity Klaxon: Low warning siren when high-threat Boss / Lictor appears */
  public playProximityKlaxon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(190, t + 0.25);
    osc.frequency.linearRampToValueAtTime(120, t + 0.5);

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.55);
  }
}

export const sounds = new SoundEngine();
