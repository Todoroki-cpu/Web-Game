/**
 * game_week_train.js - ゲーム9: 1しゅうかんトレイン！ようびならべ（1週間の順番）
 */

class GameWeekTrain {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('week-train-speech-text');
    this.trainTrackEl = document.getElementById('week-train-cars-track');
    this.candidatesEl = document.getElementById('week-train-candidates');
    this.speechBubble = document.getElementById('week-train-speech-bubble');

    this.charManager = new CharacterManager('week-train-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isLocked = false;

    this.days = [
      { key: 'mon', name: '月', full: '月ようび', color: '#e74c3c', voice: 'day_mon' },
      { key: 'tue', name: '火', full: '火ようび', color: '#e67e22', voice: 'day_tue' },
      { key: 'wed', name: '水', full: '水ようび', color: '#3498db', voice: 'day_wed' },
      { key: 'thu', name: '木', full: '木ようび', color: '#2ecc71', voice: 'day_thu' },
      { key: 'fri', name: '金', full: '金ようび', color: '#f1c40f', voice: 'day_fri' },
      { key: 'sat', name: '土', full: '土ようび', color: '#9b59b6', voice: 'day_sat' },
      { key: 'sun', name: '日', full: '日ようび', color: '#e84393', voice: 'day_sun' }
    ];

    this.missingIndices = [];
    this.filledIndices = [];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('week_train')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('week_train_prompt');
      });
    }
  }

  start() {
    this.stars = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;
    this.filledIndices = [];

    this.charManager.setCharacter('baikin');
    this.charManager.setState('idle');

    this.speechTextEl.innerHTML = `
      あいている しゃりょうに<br>
      <span class="target-name">ただしい ようび</span> を つなげてね！🚂
    `;

    // 1〜2箇所をランダムに穴あきにする
    const pick1 = Math.floor(Math.random() * 7);
    let pick2 = Math.floor(Math.random() * 7);
    while (pick2 === pick1) pick2 = Math.floor(Math.random() * 7);

    this.missingIndices = [pick1, pick2].sort((a, b) => a - b);

    this.renderTrain();
    this.renderCandidates();
    this.app.startTimer(10);

    setTimeout(() => {
      if (!this.app.isCurrentView('week_train')) return;
      window.soundSystem.playVoice('week_train_prompt');
    }, 400);
  }

  renderTrain() {
    if (!this.trainTrackEl) return;
    this.trainTrackEl.innerHTML = '';
    this.trainTrackEl.classList.remove('train-drive-away');

    // 先頭の機関車
    const engineEl = document.createElement('div');
    engineEl.className = 'train-engine';
    engineEl.innerHTML = `🚂`;
    this.trainTrackEl.appendChild(engineEl);

    // 7両の客車
    this.days.forEach((day, idx) => {
      const carEl = document.createElement('div');
      carEl.className = 'train-car';
      carEl.dataset.index = idx;

      const isMissing = this.missingIndices.includes(idx) && !this.filledIndices.includes(idx);

      if (isMissing) {
        carEl.classList.add('missing-slot');
        carEl.innerHTML = `<span class="slot-q">?</span>`;
      } else {
        carEl.classList.add('filled-car');
        carEl.style.backgroundColor = day.color;
        carEl.innerHTML = `
          <span class="car-day-name">${day.name}</span>
          <span class="car-wheels"></span>
        `;
      }

      this.trainTrackEl.appendChild(carEl);
    });
  }

  renderCandidates() {
    if (!this.candidatesEl) return;
    this.candidatesEl.innerHTML = '';

    // 穴あきになっている曜日の候補 ＋ ダミー1つ
    const candidateDays = this.missingIndices
      .filter(idx => !this.filledIndices.includes(idx))
      .map(idx => ({ day: this.days[idx], idx }));

    // シャッフル
    candidateDays.sort(() => Math.random() - 0.5);

    candidateDays.forEach(item => {
      const plate = document.createElement('div');
      plate.className = 'day-candidate-plate pop-in';
      plate.style.borderColor = item.day.color;
      plate.innerHTML = `<span class="candidate-title">${item.day.full}</span>`;

      plate.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('week_train')) return;
        e.preventDefault();
        this.handlePlateClick(item, plate);
      });

      this.candidatesEl.appendChild(plate);
    });
  }

  handlePlateClick(item, plateEl) {
    // 該当する空きスロットを探す
    const targetSlot = this.trainTrackEl.querySelector(`.train-car[data-index="${item.idx}"]`);
    if (targetSlot) {
      window.soundSystem.playPop();
      window.soundSystem.playVoice(item.day.voice);

      this.filledIndices.push(item.idx);
      plateEl.remove();

      const rect = targetSlot.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);

      this.renderTrain();

      if (this.filledIndices.length >= this.missingIndices.length) {
        // 全連結完了！
        this.handleTrainClear();
      } else {
        this.app.startTimer(10);
      }
    }
  }

  handleTrainClear() {
    this.isCleared = true;
    this.isLocked = true;
    this.app.stopTimer();

    window.soundSystem.playTrainWhistle();

    setTimeout(() => {
      this.charManager.setState('celebrate');
      window.soundSystem.playFanfare();
      window.soundSystem.playVoice('week_train_clear');

      // 電車が走り去るアニメーション
      if (this.trainTrackEl) {
        this.trainTrackEl.classList.add('train-drive-away');
      }

      const rect = this.trainTrackEl.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 90);

      this.stars++;
      window.soundSystem.playSparkle();
      this.app.updateStamps(this.stars, this.maxStars);

      setTimeout(() => {
        if (!this.app.isCurrentView('week_train')) return;
        if (this.stars >= this.maxStars) {
          this.app.showCompleteModal();
        } else {
          this.nextRound();
        }
      }, 3800);

    }, 600);
  }
}

window.GameWeekTrain = GameWeekTrain;
