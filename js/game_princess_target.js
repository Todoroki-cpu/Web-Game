/**
 * game_princess_target.js - プリンセスのまほうの数字的あて (Princess Magic Number Target)
 * 自分で着せ替えたプリンセスがステッキから魔法の星を放って的あて！
 * 2桁の大小比較（大きいほう・小さいほう）で正しい的を魔法で倒そう！
 */

class GamePrincessTarget {
  constructor(app) {
    this.app = app;
    this.round = 0;
    this.maxRounds = 5;
    this.isCleared = false;
    this.isLocked = false;
    this.questType = 'big'; // 'big' or 'small'
    this.correctNum = null;

    // 紛らわしい2桁の数字ペア
    this.pairSets = [
      [42, 24],
      [68, 86],
      [35, 53],
      [79, 97],
      [81, 18],
      [50, 15],
      [91, 19],
      [63, 36],
      [74, 47],
      [83, 38],
      [62, 26],
      [95, 59]
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-target');
  }

  start() {
    this.round = 0;
    this.app.updateStamps(0, this.maxRounds);
    window.soundSystem.startPrincessBgm();
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="p-target-game-layout">
        <!-- 上部：お題・おしゃべりバー -->
        <div class="p-target-header-bar">
          <div class="p-target-speech-bubble" id="p-target-speech-bubble">
            <span class="p-target-speech-text" id="p-target-speech-text">読み込み中...</span>
            <button class="p-target-voice-btn" id="p-target-voice-btn" title="もういちどきく">🔊</button>
          </div>
          <div class="p-target-star-badge">
            <span class="p-target-star-icon">⭐</span>
            <span class="p-target-star-text" id="p-target-round-text">1 / 5</span>
          </div>
        </div>

        <!-- 中央：お城の庭園射撃場 ＆ プリンセス -->
        <div class="p-target-main-scene" id="p-target-main-scene">
          <!-- 背景装飾（アーチ、きらめき、バラの柵） -->
          <div class="p-target-bg-garden">
            <div class="garden-cloud gc-1">☁️</div>
            <div class="garden-cloud gc-2">✨</div>
            <div class="garden-rose-fence">🌹 🌸 🌷 🌹 🌸 🌷 🌹</div>
          </div>

          <!-- 的ボード設置エリア -->
          <div class="p-target-boards-row" id="p-target-boards-row"></div>

          <!-- 魔法を撃つプリンセス（左下） -->
          <div class="p-target-shooter-box">
            <div class="p-target-princess-avatar" id="p-target-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
            <div class="p-target-wand-sparkle" id="p-target-wand-sparkle">✨🪄</div>
          </div>
        </div>
      </div>
    `;

    // 音声リプレイ
    const voiceBtn = document.getElementById('p-target-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        window.soundSystem.playPop();
        this.speakPrompt();
      });
    }
  }

  nextRound() {
    if (this.round >= this.maxRounds) {
      this.handleGameComplete();
      return;
    }

    this.round++;
    this.isCleared = false;
    this.isLocked = false;
    this.app.updateStamps(this.round - 1, this.maxRounds);

    const roundText = document.getElementById('p-target-round-text');
    if (roundText) roundText.textContent = `${this.round} / ${this.maxRounds}`;

    this.questType = Math.random() > 0.5 ? 'big' : 'small';
    const pair = this.pairSets[Math.floor(Math.random() * this.pairSets.length)].slice();
    if (Math.random() > 0.5) pair.reverse();

    const speechText = document.getElementById('p-target-speech-text');
    if (this.questType === 'big') {
      this.correctNum = Math.max(...pair);
      if (speechText) {
        speechText.innerHTML = `「<strong style="color: #e84118; font-size: 1.15em;">おおきい すうじ</strong>」の まとを まほうで たおしてね！🪄`;
      }
    } else {
      this.correctNum = Math.min(...pair);
      if (speechText) {
        speechText.innerHTML = `「<strong style="color: #0984e3; font-size: 1.15em;">ちいさい すうじ</strong>」の まとを まほうで たおしてね！🪄`;
      }
    }

    this.speakPrompt();
    this.renderTargets(pair);
  }

  speakPrompt() {
    window.soundSystem.playMagicChime();
    const bubble = document.getElementById('p-target-speech-bubble');
    if (bubble) {
      bubble.classList.add('pop-in');
      setTimeout(() => bubble.classList.remove('pop-in'), 300);
    }
  }

  renderTargets(numbers) {
    const rowEl = document.getElementById('p-target-boards-row');
    if (!rowEl) return;
    rowEl.innerHTML = '';

    numbers.forEach((num, idx) => {
      const boardEl = document.createElement('div');
      boardEl.className = 'p-target-board pop-in';
      boardEl.dataset.num = num;

      // 豪華なロイヤル的デザイン
      boardEl.innerHTML = `
        <div class="p-board-crown">👑</div>
        <div class="p-board-plate">
          <div class="p-board-outer-ring">
            <div class="p-board-inner-ring">
              <span class="p-board-number">${num}</span>
            </div>
          </div>
        </div>
        <div class="p-board-stand"></div>
      `;

      boardEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked) return;
        e.preventDefault();
        this.castMagicAtTarget(num, boardEl, e.clientX, e.clientY);
      });

      rowEl.appendChild(boardEl);
    });
  }

  castMagicAtTarget(num, boardEl, clickX, clickY) {
    this.isLocked = true;

    // プリンセスのステッキ振りアニメーション
    const princess = document.getElementById('p-target-princess-avatar');
    if (princess) {
      princess.classList.add('spell-casting');
      setTimeout(() => princess.classList.remove('spell-casting'), 600);
    }

    window.soundSystem.playMagicChime();

    // 魔法の星（プロジェクタイル）発射
    const wandSparkle = document.getElementById('p-target-wand-sparkle');
    let startX = window.innerWidth * 0.2;
    let startY = window.innerHeight * 0.7;

    if (wandSparkle) {
      const rect = wandSparkle.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    const starProjectile = document.createElement('div');
    starProjectile.className = 'p-magic-star-beam';
    starProjectile.innerHTML = '🌟✨⭐';
    document.body.appendChild(starProjectile);

    starProjectile.style.left = `${startX}px`;
    starProjectile.style.top = `${startY}px`;

    const boardRect = boardEl.getBoundingClientRect();
    const targetX = boardRect.left + boardRect.width / 2;
    const targetY = boardRect.top + boardRect.height / 2;

    setTimeout(() => {
      starProjectile.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(1.4)`;
      starProjectile.style.opacity = '1';

      setTimeout(() => {
        starProjectile.remove();
        this.evaluateHit(num, boardEl, targetX, targetY);
      }, 300);
    }, 20);
  }

  evaluateHit(num, boardEl, hitX, hitY) {
    if (num === this.correctNum) {
      // 正解！
      this.isCleared = true;
      window.soundSystem.playTreasureChest();
      this.app.particles.explode(hitX, hitY, 50);

      // 的が回転して倒れる
      boardEl.classList.add('hit-down');

      // プリンセス喜びジャンプ
      const princess = document.getElementById('p-target-princess-avatar');
      if (princess) princess.classList.add('cheering');

      const speechText = document.getElementById('p-target-speech-text');
      if (speechText) {
        speechText.innerHTML = `🎉 せいかい！ まほうで たおせたよ！ ✨`;
      }

      this.app.updateStamps(this.round, this.maxRounds);

      setTimeout(() => {
        if (princess) princess.classList.remove('cheering');
        this.nextRound();
      }, 1400);

    } else {
      // 不正解（おしい！）
      window.soundSystem.playPop();
      this.app.particles.sparkle(hitX, hitY, 15);
      boardEl.classList.add('shake-card');
      setTimeout(() => boardEl.classList.remove('shake-card'), 500);

      const speechText = document.getElementById('p-target-speech-text');
      if (speechText) {
        const original = speechText.innerHTML;
        speechText.innerHTML = `✨ おしい！ もういっかい ためしてみてね！`;
        setTimeout(() => {
          if (speechText && !this.isCleared) speechText.innerHTML = original;
          this.isLocked = false;
        }, 1200);
      } else {
        this.isLocked = false;
      }
    }
  }

  handleGameComplete() {
    this.app.updateStamps(this.maxRounds, this.maxRounds);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const princess = document.getElementById('p-target-princess-avatar');
    if (princess) princess.classList.add('cheering');

    const speechText = document.getElementById('p-target-speech-text');
    if (speechText) {
      speechText.innerHTML = `👑 すごい！ まほうの的あて ぜんぶ大せいかい！ 👑`;
    }

    setTimeout(() => {
      this.app.showCompleteModal();
    }, 1200);
  }
}

window.GamePrincessTarget = GamePrincessTarget;
