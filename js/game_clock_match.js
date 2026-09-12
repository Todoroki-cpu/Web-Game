/**
 * game_clock_match.js - ゲーム8: デジタル＆アナログ ぴったりマッチ！
 */

class GameClockMatch {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('clock-match-speech-text');
    this.gridEl = document.getElementById('clock-match-cards-grid');
    this.speechBubble = document.getElementById('clock-match-speech-bubble');

    this.charManager = new CharacterManager('clock-match-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.selectedCard = null;
    this.matchedPairsCount = 0;
    this.isCleared = false;
    this.isLocked = false;

    this.timePool = [
      { h: 1, m: 0, text: '1:00' },
      { h: 3, m: 0, text: '3:00' },
      { h: 5, m: 0, text: '5:00' },
      { h: 7, m: 0, text: '7:00' },
      { h: 9, m: 0, text: '9:00' },
      { h: 12, m: 0, text: '12:00' }
    ];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('clock_match')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('clock_match_prompt');
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
    this.selectedCard = null;
    this.matchedPairsCount = 0;

    this.charManager.setCharacter('melonpan');
    this.charManager.setState('idle');

    this.speechTextEl.innerHTML = `
      <span class="target-name">おなじ じかん</span> の とけいを<br>えらんでね！⏱️
    `;

    // 3つの異なる時刻をランダム選定
    const shuffledTimes = this.timePool.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    
    // デジタルカード3枚 ＋ アナログカード3枚
    const cards = [];
    shuffledTimes.forEach((t, i) => {
      cards.push({ id: `dig_${i}`, type: 'digital', time: t });
      cards.push({ id: `ana_${i}`, type: 'analog', time: t });
    });

    // シャッフル
    cards.sort(() => Math.random() - 0.5);
    this.renderCards(cards);

    setTimeout(() => {
      if (!this.app.isCurrentView('clock_match')) return;
      window.soundSystem.playVoice('clock_match_prompt');
    }, 400);
  }

  renderCards(cards) {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    cards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'clock-match-card pop-in';
      cardEl.dataset.type = card.type;
      cardEl.dataset.h = card.time.h;
      cardEl.dataset.m = card.time.m;

      if (card.type === 'digital') {
        cardEl.innerHTML = `
          <div class="card-digital-display">
            <span class="digital-icon">⏰</span>
            <span class="digital-time-num">${card.time.text}</span>
          </div>
        `;
      } else {
        const hourDeg = (card.time.h % 12) * 30 + (card.time.m / 60) * 30;
        const minDeg = (card.time.m / 60) * 360;
        cardEl.innerHTML = `
          <div class="card-analog-display">
            <svg viewBox="0 0 100 100" class="mini-clock-svg">
              <circle cx="50" cy="50" r="45" fill="#ffffff" stroke="#ff9f1a" stroke-width="5"/>
              <circle cx="50" cy="50" r="4" fill="#2f3542"/>
              <line x1="50" y1="50" x2="50" y2="24" stroke="#e84118" stroke-width="6" stroke-linecap="round" transform="rotate(${hourDeg} 50 50)"/>
              <line x1="50" y1="50" x2="50" y2="14" stroke="#3498db" stroke-width="4" stroke-linecap="round" transform="rotate(${minDeg} 50 50)"/>
            </svg>
          </div>
        `;
      }

      cardEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || cardEl.classList.contains('matched')) return;
        e.preventDefault();
        this.handleCardClick(card, cardEl);
      });

      this.gridEl.appendChild(cardEl);
    });
  }

  handleCardClick(card, element) {
    window.soundSystem.playPop();

    if (!this.selectedCard) {
      // 1枚目選択
      this.selectedCard = { card, element };
      element.classList.add('selected');
    } else {
      // 既に選択中のカードを再度タップ
      if (this.selectedCard.element === element) return;

      const first = this.selectedCard;
      const second = { card, element };

      // 異なるタイプで同じ時間か判定
      if (first.card.type !== second.card.type && first.card.time.h === second.card.time.h && first.card.time.m === second.card.time.m) {
        // ペアマッチ成功！
        first.element.classList.remove('selected');
        first.element.classList.add('matched');
        second.element.classList.add('matched');

        window.soundSystem.playSchoolChime();
        const rect = second.element.getBoundingClientRect();
        this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

        this.selectedCard = null;
        this.matchedPairsCount++;

        if (this.matchedPairsCount >= 3) {
          // 全ペア達成！
          this.handleRoundComplete();
        }
      } else {
        // 不正解
        second.element.classList.add('shake');
        first.element.classList.add('shake');
        this.isLocked = true;

        setTimeout(() => {
          first.element.classList.remove('selected', 'shake');
          second.element.classList.remove('shake');
          this.selectedCard = null;
          this.isLocked = false;
        }, 500);
      }
    }
  }

  handleRoundComplete() {
    this.isCleared = true;
    this.isLocked = true;

    setTimeout(() => {
      this.charManager.setState('celebrate');
      window.soundSystem.playFanfare();
      window.soundSystem.playVoice('clock_match_good');

      const centerRect = this.gridEl.getBoundingClientRect();
      this.app.particles.explode(centerRect.left + centerRect.width / 2, centerRect.top + centerRect.height / 2, 85);

      this.stars++;
      window.soundSystem.playSparkle();
      this.app.updateStamps(this.stars, this.maxStars);

      setTimeout(() => {
        if (!this.app.isCurrentView('clock_match')) return;
        if (this.stars >= this.maxStars) {
          this.app.showCompleteModal();
        } else {
          this.nextRound();
        }
      }, 3400);

    }, 500);
  }
}

window.GameClockMatch = GameClockMatch;
