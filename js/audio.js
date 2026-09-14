/**
 * audio.js - VOICEVOX高音質ボイス ＆ Web Audio効果音・BGM管理
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.isMuted = false;
    this.currentAudio = null;
    this.audioPool = {};
  }

  initAudio() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playVoice(name) {
    if (this.isMuted) return;
    this.initAudio();

    try {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      if (!this.audioPool[name]) {
        this.audioPool[name] = new Audio(`audio/${name}.wav`);
      }

      const audio = this.audioPool[name];
      audio.playbackRate = 1.45;
      audio.preservesPitch = true;
      if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = true;
      if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = true;

      this.currentAudio = audio;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn(`音声再生エラー (${name}):`, err);
        });
      }
    } catch (e) {
      console.warn(`Error playing voice "${name}":`, e);
    }
  }

  // 時計のカチッカチッ音
  playTick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // 鳩時計（ポッポー！）
  playCuckoo() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // 「ポッ」
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // 「ポー」
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.14); // C5
    gain2.gain.setValueAtTime(0.3, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.35);
  }

  // 学校のチャイム（キーンコーンカーンコーン）
  playSchoolChime() {
    if (this.isMuted || !this.ctx) return;
    const notes = [
      { f: 659.25, t: 0 },    // ミ
      { f: 523.25, t: 0.25 }, // ド
      { f: 587.33, t: 0.5 },  // レ
      { f: 392.00, t: 0.75 }  // ソ
    ];

    notes.forEach(n => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }, n.t * 1000);
    });
  }

  // 電車の汽笛（ポッポー！）
  playTrainWhistle() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  // スタンプ音（ポンッ！）
  playStamp() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCoin() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [1975.5, 2637.0].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.25, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.35);
    });
  }

  playRegister() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2093.0, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  playTargetHit() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playRocketThrust() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playPop() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playMunch() {
    if (this.isMuted || !this.ctx) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }, i * 120);
    }
  }

  playFanfare() {
    if (this.isMuted || !this.ctx) return;
    const notes = [
      { f: 523.25, d: 0.1, t: 0 },
      { f: 659.25, d: 0.1, t: 0.1 },
      { f: 783.99, d: 0.1, t: 0.2 },
      { f: 1046.50, d: 0.4, t: 0.3 }
    ];

    notes.forEach(note => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + note.d);
      }, note.t * 1000);
    });
  }

  playSparkle() {
    if (this.isMuted || !this.ctx) return;
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }, idx * 60);
    });
  }

  startBgm() {
    this.startNormalBgm();
  }

  startNormalBgm() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.isBgmPlaying = true;
    this.currentBgmType = 'normal';

    const melody = [
      { note: 523.25, dur: 0.25 },
      { note: 659.25, dur: 0.25 },
      { note: 783.99, dur: 0.25 },
      { note: 659.25, dur: 0.25 },
      { note: 880.00, dur: 0.25 },
      { note: 783.99, dur: 0.25 },
      { note: 659.25, dur: 0.5 },
      
      { note: 587.33, dur: 0.25 },
      { note: 659.25, dur: 0.25 },
      { note: 587.33, dur: 0.25 },
      { note: 523.25, dur: 0.5 },
    ];

    let noteIndex = 0;
    const playNextNote = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx || this.currentBgmType !== 'normal') return;
      const current = melody[noteIndex];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(current.note, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + current.dur * 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + current.dur * 0.9);

      noteIndex = (noteIndex + 1) % melody.length;
      this.bgmTimer = setTimeout(playNextNote, current.dur * 1000);
    };

    playNextNote();
  }

  // プリンセス専用：優雅なロイヤルワルツBGM
  startPrincessBgm() {
    this.stopBgm();
    if (this.isMuted) return;
    this.initAudio();
    this.isBgmPlaying = true;
    this.currentBgmType = 'princess';

    const waltzNotes = [
      // 1小節: ド・ミ・ソ
      { bass: 261.63, treble: 523.25, dur: 0.4 },
      { bass: null,   treble: 659.25, dur: 0.35 },
      { bass: null,   treble: 783.99, dur: 0.35 },
      // 2小節: シ・レ・ソ
      { bass: 246.94, treble: 880.00, dur: 0.4 },
      { bass: null,   treble: 783.99, dur: 0.35 },
      { bass: null,   treble: 659.25, dur: 0.35 },
      // 3小節: ラ・ド・ファ
      { bass: 220.00, treble: 698.46, dur: 0.4 },
      { bass: null,   treble: 880.00, dur: 0.35 },
      { bass: null,   treble: 1046.5, dur: 0.35 },
      // 4小節: ソ・シ・レ
      { bass: 196.00, treble: 987.77, dur: 0.4 },
      { bass: null,   treble: 783.99, dur: 0.35 },
      { bass: null,   treble: 523.25, dur: 0.45 },
    ];

    let waltzIdx = 0;
    const playNextWaltz = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx || this.currentBgmType !== 'princess') return;
      const cur = waltzNotes[waltzIdx];
      const now = this.ctx.currentTime;

      // メロディ音（オルゴール＆ハープ風）
      if (cur.treble) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(cur.treble, now);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + cur.dur * 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + cur.dur * 1.2);
      }

      // 低音ベース（チェロ・コントラバス風）
      if (cur.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(cur.bass, now);
        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.8);
      }

      waltzIdx = (waltzIdx + 1) % waltzNotes.length;
      this.bgmTimer = setTimeout(playNextWaltz, cur.dur * 1000);
    };

    playNextWaltz();
  }

  // カメラのシャッター音（カシャッ！）
  playCameraShutter() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    // クリック音
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2000, now);
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.045);

    // 後半のメカニカル音
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.14);
    gain2.gain.setValueAtTime(0.25, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.15);
  }

  // ドレス着せ替えシュッ音
  playDressSwoosh() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // まほうのチャイム（ハープ・きらめきグリッサンド）
  playMagicChime() {
    if (this.isMuted || !this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }, idx * 45);
    });
  }

  // お城のドアが開く音（ギィィ・パァァ✨）
  playDoorOpen() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    setTimeout(() => this.playSparkle(), 180);
  }

  // 宝箱オープン（ファンファーレ）
  playTreasureChest() {
    if (this.isMuted || !this.ctx) return;
    const melody = [
      { f: 523.25, t: 0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.12 },
      { f: 1046.5, t: 0.36, d: 0.4 }
    ];
    melody.forEach(m => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(m.f, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + m.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + m.d);
      }, m.t * 1000);
    });
  }

  // ジュエルつなぎの音階（ド・レ・ミ・ファ・ソ・ラ・シ・ド）
  playJewelTone(step = 0) {
    if (this.isMuted || !this.ctx) return;
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.5, 1174.66, 1318.51];
    const freq = scale[Math.min(step, scale.length - 1)];
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // ジュエル消去音（クリスタルポップ）
  playJewelClear() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // フィーバー大爆発音
  playFeverBurst() {
    if (this.isMuted || !this.ctx) return;
    this.playMagicChime();
    setTimeout(() => this.playFanfare(), 200);
  }

  // ジュエル連鎖レベル別演出音 (3個〜10個以上)
  playJewelComboTier(count) {
    if (this.isMuted || !this.ctx) return;

    if (count <= 3) {
      // Level 1 (3個): クリスタルポップ
      this.playJewelClear();
    } else if (count === 4) {
      // Level 2 (4個): 2音上昇ポップ
      this.playJewelClear();
      setTimeout(() => {
        if (!this.ctx) return;
        const cNow = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1318.51, cNow);
        gain.gain.setValueAtTime(0.22, cNow);
        gain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(cNow);
        osc.stop(cNow + 0.15);
      }, 70);
    } else if (count === 5) {
      // Level 3 (5個): スーパーマジック（ハープ＋チャイム）
      this.playMagicChime();
    } else if (count === 6) {
      // Level 4 (6個): エクセレント（ハープ＋高音アルペジオ）
      this.playMagicChime();
      const notes = [1046.5, 1318.51, 1567.98, 2093.0];
      notes.forEach((f, i) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const cNow = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, cNow);
          gain.gain.setValueAtTime(0.2, cNow);
          gain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(cNow);
          osc.stop(cNow + 0.2);
        }, i * 50);
      });
    } else if (count === 7) {
      // Level 5 (7個): プリンセスフィーバー
      this.playFeverBurst();
    } else if (count === 8) {
      // Level 6 (8個): ミラクル（フィーバー＋歓声）
      this.playFeverBurst();
      setTimeout(() => this.playCheerCrowd(), 150);
    } else if (count === 9) {
      // Level 7 (9個): レジェンド（大ファンファーレ＋歓声）
      this.playFeverBurst();
      setTimeout(() => this.playTreasureChest(), 100);
      setTimeout(() => this.playCheerCrowd(), 250);
    } else {
      // Level 8 (10個以上): アルティメット・ロイヤル（超特大ファンファーレ＋全効果音）
      this.playFeverBurst();
      setTimeout(() => this.playFanfare(), 80);
      setTimeout(() => this.playMagicChime(), 180);
      setTimeout(() => this.playCheerCrowd(), 300);
    }
  }

  // ランウェイ歓声・拍手
  playCheerCrowd() {
    if (this.isMuted || !this.ctx) return;
    this.playSparkle();
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const cNow = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 600, cNow);
        gain.gain.setValueAtTime(0.15, cNow);
        gain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(cNow);
        osc.stop(cNow + 0.08);
      }, i * 60);
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    this.currentBgmType = null;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // タイマー：通常秒針音
  playTimerTick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  // タイマー：残り3秒以下の警告音
  playTimerWarning() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.06);
    });
  }

  // タイマー：時間切れ音（コミカルな下降チャイム）
  playTimeout() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [
      { f: 587.33, t: 0, d: 0.12 },   // D5
      { f: 493.88, t: 0.1, d: 0.12 }, // B4
      { f: 392.00, t: 0.2, d: 0.15 }, // G4
      { f: 329.63, t: 0.32, d: 0.3 }  // E4
    ];
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.25, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
    } else {
      this.initAudio();
      this.startBgm();
    }
    return this.isMuted;
  }
}

window.soundSystem = new SoundSystem();
