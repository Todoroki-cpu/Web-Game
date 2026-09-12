/**
 * game_clock_dial.js - ゲーム7: ぐるぐる まわして！なんじかな？（時計の針まわし）
 */

class GameClockDial {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('clock-dial-speech-text');
    this.clockFaceEl = document.getElementById('clock-dial-face');
    this.hourHandEl = document.getElementById('clock-hour-hand');
    this.minuteHandEl = document.getElementById('clock-minute-hand');
    this.timeReadoutEl = document.getElementById('clock-time-readout');
    this.cuckooBoxEl = document.getElementById('clock-cuckoo-box');
    this.speechBubble = document.getElementById('clock-dial-speech-bubble');

    this.charManager = new CharacterManager('clock-dial-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isLocked = false;

    this.currentHour = 12;
    this.currentMinute = 0;
    this.targetHour = 7;
    this.targetMinute = 0;

    this.quests = [
      { h: 7, m: 0, text: 'あさ <span class="target-num">7</span> じ に おきよう！☀️', voice: 'clock_prompt_7', action: '起きる時間' },
      { h: 12, m: 0, text: 'おひる <span class="target-num">12</span> じ は ごはん！🍙', voice: 'clock_prompt_12', action: 'お昼ごはん' },
      { h: 3, m: 0, text: '<span class="target-num">3</span> じ は おやつの じかん！🍰', voice: 'clock_prompt_3', action: 'おやつ' },
      { h: 8, m: 0, text: 'よる <span class="target-num">8</span> じ は おやすみ！🌙', voice: 'clock_prompt_8', action: 'ねる時間' },
      { h: 9, m: 30, text: '<span class="target-num">9</span> じ <span class="target-num">はん</span> に はみがき！🪥', voice: 'clock_prompt_930', action: 'はみがき' }
    ];
    this.questIdx = 0;

    this.initEvents();
  }

  initEvents() {
    // 針のドラッグ・回転操作（長針または時計盤全体をタッチ）
    if (this.clockFaceEl) {
      let isDragging = false;
      let prevAngle = 0;

      const updateFromPointer = (e) => {
        const rect = this.clockFaceEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = e.clientX - cx;
        const y = e.clientY - cy;
        
        let deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (deg < 0) deg += 360;

        // 30度刻み（1時間ごと）または15度刻み（30分ごと）
        const hourStep = Math.round(deg / 30) % 12;
        const h = hourStep === 0 ? 12 : hourStep;

        if (this.currentHour !== h) {
          this.currentHour = h;
          window.soundSystem.playTick();
          this.updateClockHands();
          this.checkExactMatch();
        }
      };

      this.clockFaceEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('clock_dial')) return;
        isDragging = true;
        window.soundSystem.initAudio();
        updateFromPointer(e);
      });

      window.addEventListener('pointermove', (e) => {
        if (!isDragging || this.isCleared || this.isLocked) return;
        updateFromPointer(e);
      });

      window.addEventListener('pointerup', () => { isDragging = false; });
      window.addEventListener('pointercancel', () => { isDragging = false; });
    }

    // クイック操作ボタン（+1時間、+30分）
    const addHourBtn = document.getElementById('btn-clock-add-hour');
    if (addHourBtn) {
      addHourBtn.addEventListener('click', () => {
        if (this.isCleared || this.isLocked) return;
        window.soundSystem.playTick();
        this.currentHour = (this.currentHour % 12) + 1;
        this.updateClockHands();
        this.checkExactMatch();
      });
    }

    const addMinBtn = document.getElementById('btn-clock-add-min');
    if (addMinBtn) {
      addMinBtn.addEventListener('click', () => {
        if (this.isCleared || this.isLocked) return;
        window.soundSystem.playTick();
        this.currentMinute = (this.currentMinute + 30) % 60;
        this.updateClockHands();
        this.checkExactMatch();
      });
    }

    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('clock_dial')) return;
        window.soundSystem.playPop();
        const quest = this.quests[this.questIdx % this.quests.length];
        window.soundSystem.playVoice(quest.voice);
      });
    }
  }

  start() {
    this.stars = 0;
    this.questIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;

    this.charManager.setCharacter('anpan');
    this.charManager.setState('idle');

    if (this.cuckooBoxEl) {
      this.cuckooBoxEl.classList.remove('pop-out');
    }

    const quest = this.quests[this.questIdx % this.quests.length];
    this.targetHour = quest.h;
    this.targetMinute = quest.m;

    // 現在針の初期位置（正解と異なる位置にセット）
    this.currentHour = (this.targetHour + 4) % 12 || 12;
    this.currentMinute = 0;

    this.speechTextEl.innerHTML = quest.text;
    this.updateClockHands();

    setTimeout(() => {
      if (!this.app.isCurrentView('clock_dial')) return;
      window.soundSystem.playVoice(quest.voice);
    }, 400);
  }

  updateClockHands() {
    // 短針角度
    const hourDeg = (this.currentHour % 12) * 30 + (this.currentMinute / 60) * 30;
    // 長針角度
    const minDeg = (this.currentMinute / 60) * 360;

    if (this.hourHandEl) {
      this.hourHandEl.style.transform = `rotate(${hourDeg}deg)`;
    }
    if (this.minuteHandEl) {
      this.minuteHandEl.style.transform = `rotate(${minDeg}deg)`;
    }

    if (this.timeReadoutEl) {
      const minStr = this.currentMinute === 0 ? '00' : `${this.currentMinute}`;
      this.timeReadoutEl.innerHTML = `いまの じかん：<span class="clock-digital-badge">${this.currentHour}:${minStr}</span>`;
    }
  }

  checkExactMatch() {
    if (this.currentHour === this.targetHour && this.currentMinute === this.targetMinute) {
      // ぴったり正解！
      this.isCleared = true;
      this.isLocked = true;

      // 鳩時計が飛び出す！
      if (this.cuckooBoxEl) {
        this.cuckooBoxEl.classList.add('pop-out');
      }
      window.soundSystem.playCuckoo();

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();

        const clockRect = this.clockFaceEl.getBoundingClientRect();
        this.app.particles.explode(clockRect.left + clockRect.width / 2, clockRect.top + clockRect.height / 2, 80);

        window.soundSystem.playVoice('clock_exact');

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('clock_dial')) return;
          this.questIdx++;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3600);

      }, 700);
    }
  }
}

window.GameClockDial = GameClockDial;
