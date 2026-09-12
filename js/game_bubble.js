/**
 * game_bubble.js - ゲーム3: バブルポップ・すうじタッチ（大小比較・素早さ）
 */

class GameBubble {
  constructor(app) {
    this.app = app;
    this.containerEl = document.getElementById('bubble-stage-area');
    this.speechTextEl = document.getElementById('bubble-speech-text');
    this.charManager = new CharacterManager('bubble-character-stage');

    this.stars = 0;
    this.maxStars = 5;
    this.currentQuestType = 'max'; // 'max' (一番大きい), 'min' (一番小さい)
    this.bubbles = [];
    this.isCleared = false;
    this.isLocked = false;
    this.animFrameId = null;

    this.colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#ff6b81', '#00d2d3'];
  }

  start() {
    this.stars = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;
    this.clearBubbles();

    this.charManager.setCharacter('melonpan');
    this.charManager.setState('idle');

    // クエストタイプの決定 (max または min)
    this.currentQuestType = Math.random() > 0.5 ? 'max' : 'min';

    // 重複しないランダムな数字を3〜4個選定 (1〜9)
    const numbers = [];
    const bubbleCount = 4;
    while (numbers.length < bubbleCount) {
      const n = Math.floor(Math.random() * 9) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }

    if (this.currentQuestType === 'max') {
      this.targetAnswer = Math.max(...numbers);
      this.speechTextEl.innerHTML = `
        <span class="target-name">いちばん おおきい</span> すうじの あわを<br>タッチしてね！
      `;
    } else {
      this.targetAnswer = Math.min(...numbers);
      this.speechTextEl.innerHTML = `
        <span class="target-name">いちばん ちいさい</span> すうじの あわを<br>タッチしてね！
      `;
    }

    // バブルの生成
    this.createBubbles(numbers);

    // 音声案内
    setTimeout(() => {
      if (!this.app.isCurrentView('bubble')) return;
      if (this.currentQuestType === 'max') {
        window.soundSystem.playVoice('bubble_prompt_max');
      } else {
        window.soundSystem.playVoice('bubble_prompt_min');
      }
    }, 400);
  }

  clearBubbles() {
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
    }
    this.bubbles = [];
  }

  createBubbles(numbers) {
    if (!this.containerEl) return;
    const stageWidth = this.containerEl.clientWidth || 600;
    const stageHeight = this.containerEl.clientHeight || 340;

    const spacing = stageWidth / (numbers.length + 1);

    numbers.forEach((num, idx) => {
      const bubbleEl = document.createElement('div');
      bubbleEl.className = 'soap-bubble pop-in';
      
      const posX = spacing * (idx + 1) - 45 + (Math.random() - 0.5) * 30;
      const posY = 50 + (idx % 2 === 0 ? 30 : 120) + (Math.random() - 0.5) * 30;

      bubbleEl.style.left = `${posX}px`;
      bubbleEl.style.top = `${posY}px`;
      bubbleEl.style.animationDelay = `${idx * 0.15}s`;

      const color = this.colors[idx % this.colors.length];
      bubbleEl.style.borderColor = color;

      bubbleEl.innerHTML = `
        <span class="bubble-reflection"></span>
        <span class="bubble-num" style="color: ${color};">${num}</span>
      `;

      bubbleEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('bubble')) return;
        e.preventDefault();
        this.handleBubbleClick(num, bubbleEl);
      });

      this.containerEl.appendChild(bubbleEl);
      this.bubbles.push({ el: bubbleEl, num: num, x: posX, y: posY });
    });
  }

  handleBubbleClick(num, element) {
    if (num === this.targetAnswer) {
      // 正解！
      this.isCleared = true;
      this.isLocked = true;

      // 破裂エフェクト
      element.classList.add('popped');
      window.soundSystem.playPop();

      const rect = element.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

      // 数字ボイス＆褒めボイス
      if (num <= 10) {
        window.soundSystem.playVoice(`count_${num}`);
      }

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();
        window.soundSystem.playVoice('bubble_pop_good');

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('bubble')) return;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 2800);
      }, 600);

    } else {
      // 不正解
      window.soundSystem.playPop();
      element.classList.add('shake');
      setTimeout(() => element.classList.remove('shake'), 400);
      window.soundSystem.playVoice('bubble_try_again');
    }
  }
}

window.GameBubble = GameBubble;
