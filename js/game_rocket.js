/**
 * game_rocket.js - ゲーム5: うちゅうへGO！10とびロケットはっしゃ（10飛び・100までのリズム）
 */

class GameRocket {
  constructor(app) {
    this.app = app;
    this.containerEl = document.getElementById('rocket-space-stage');
    this.speechTextEl = document.getElementById('rocket-speech-text');
    this.ringsGridEl = document.getElementById('rocket-rings-grid');
    this.rocketShipEl = document.getElementById('rocket-ship-entity');
    this.spaceGoalEl = document.getElementById('rocket-space-goal');

    this.charManager = new CharacterManager('rocket-character-stage');

    this.stars = 0;
    this.maxStars = 3;
    this.currentStepIndex = 0; // 0: 10, 1: 20 ... 9: 100
    this.tensList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    this.isCleared = false;
    this.isLocked = false;
  }

  start() {
    this.stars = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;
    this.currentStepIndex = 0;

    this.charManager.setCharacter('baikin');
    this.charManager.setState('idle');

    this.speechTextEl.innerHTML = `
      <span class="target-name">10から 100まで</span> じゅんばんに タッチ！<br>
      ロケットを うちあげよう！🚀
    `;

    if (this.rocketShipEl) {
      this.rocketShipEl.style.bottom = '20px';
      this.rocketShipEl.classList.remove('warp-launch', 'landed');
    }

    if (this.spaceGoalEl) {
      this.spaceGoalEl.classList.remove('reached');
    }

    this.renderRings();

    setTimeout(() => {
      if (!this.app.isCurrentView('rocket')) return;
      window.soundSystem.playVoice('rocket_prompt');
    }, 400);
  }

  renderRings() {
    if (!this.ringsGridEl) return;
    this.ringsGridEl.innerHTML = '';

    this.tensList.forEach((num, idx) => {
      const ringEl = document.createElement('div');
      ringEl.className = 'energy-ring';
      ringEl.dataset.index = idx;
      ringEl.dataset.num = num;

      if (idx === 0) ringEl.classList.add('next-active');

      ringEl.innerHTML = `
        <span class="ring-num">${num}</span>
        <span class="ring-glow"></span>
      `;

      ringEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('rocket')) return;
        e.preventDefault();
        this.handleRingTouch(idx, num, ringEl);
      });

      this.ringsGridEl.appendChild(ringEl);
    });
  }

  handleRingTouch(idx, num, ringEl) {
    if (idx === this.currentStepIndex) {
      // 正しい10飛びのステップ！
      window.soundSystem.playRocketThrust();
      ringEl.classList.remove('next-active');
      ringEl.classList.add('activated');

      // VOICEVOXで「じゅう！」「にじゅう！」読み上げ
      window.soundSystem.playVoice(`count_${num}`);

      const rect = ringEl.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);

      // ロケットの上昇位置を更新 (20px 〜 70%高さ)
      const progressPercent = ((idx + 1) / this.tensList.length) * 65;
      if (this.rocketShipEl) {
        this.rocketShipEl.style.bottom = `calc(20px + ${progressPercent}%)`;
        this.rocketShipEl.classList.add('thrusting');
        setTimeout(() => this.rocketShipEl.classList.remove('thrusting'), 400);
      }

      this.currentStepIndex++;

      if (this.currentStepIndex >= this.tensList.length) {
        // 100到達！発射＆月面到着
        this.handleLaunchSuccess();
      } else {
        // 次のリングをアクティブに
        const nextEl = this.ringsGridEl.querySelector(`.energy-ring[data-index="${this.currentStepIndex}"]`);
        if (nextEl) {
          nextEl.classList.add('next-active');
        }
      }
    } else if (idx > this.currentStepIndex) {
      // 順番が違う
      window.soundSystem.playPop();
      ringEl.classList.add('shake');
      setTimeout(() => ringEl.classList.remove('shake'), 400);
      window.soundSystem.playVoice('rocket_next');
    }
  }

  handleLaunchSuccess() {
    this.isCleared = true;
    this.isLocked = true;

    if (this.rocketShipEl) {
      this.rocketShipEl.classList.add('warp-launch');
    }

    setTimeout(() => {
      window.soundSystem.playVoice('rocket_launch');
      window.soundSystem.playFanfare();

      setTimeout(() => {
        if (this.spaceGoalEl) {
          this.spaceGoalEl.classList.add('reached');
        }

        this.charManager.setState('celebrate');
        const goalRect = this.spaceGoalEl.getBoundingClientRect();
        this.app.particles.explode(goalRect.left + goalRect.width / 2, goalRect.top + goalRect.height / 2, 100);

        window.soundSystem.playVoice('rocket_moon');

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('rocket')) return;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3800);

      }, 1000);
    }, 400);
  }
}

window.GameRocket = GameRocket;
