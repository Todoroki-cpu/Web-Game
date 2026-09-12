/**
 * game_target.js - ゲーム6: おおきいのはどっち？ すうじのマトあて（2桁の大小比較）
 */

class GameTarget {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('target-speech-text');
    this.targetsGridEl = document.getElementById('target-boards-grid');
    this.ballLauncherEl = document.getElementById('target-ball-launcher');
    this.speechBubble = document.getElementById('target-speech-bubble');

    this.charManager = new CharacterManager('target-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isLocked = false;
    this.questType = 'big'; // 'big' (大きいほう), 'small' (小さいほう)
    this.correctNum = null;

    // 子どもが見間違えやすい紛らわしい2桁の数字ペア
    this.pairSets = [
      [42, 24],
      [68, 86],
      [35, 53],
      [79, 97],
      [81, 18],
      [50, 15],
      [91, 19],
      [63, 36],
      [74, 47]
    ];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('target')) return;
        window.soundSystem.playPop();
        const voiceKey = this.questType === 'big' ? 'target_prompt_big' : 'target_prompt_small';
        window.soundSystem.playVoice(voiceKey);
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

    this.charManager.setCharacter('anpan');
    this.charManager.setState('idle');

    this.questType = Math.random() > 0.5 ? 'big' : 'small';

    // ランダムなペアを選択
    const pair = this.pairSets[Math.floor(Math.random() * this.pairSets.length)].slice();
    // ランダム順にシャッフル
    if (Math.random() > 0.5) pair.reverse();

    if (this.questType === 'big') {
      this.correctNum = Math.max(...pair);
      this.speechTextEl.innerHTML = `
        <span class="target-name">おおきい すうじ</span> の まとを<br>ボールで たおしてね！🎯
      `;
    } else {
      this.correctNum = Math.min(...pair);
      this.speechTextEl.innerHTML = `
        <span class="target-name">ちいさい すうじ</span> の まとを<br>ボールで たおしてね！🎯
      `;
    }

    this.renderTargets(pair);
    this.app.startTimer(10);

    setTimeout(() => {
      if (!this.app.isCurrentView('target')) return;
      const voiceKey = this.questType === 'big' ? 'target_prompt_big' : 'target_prompt_small';
      window.soundSystem.playVoice(voiceKey);
    }, 400);
  }

  renderTargets(numbers) {
    if (!this.targetsGridEl) return;
    this.targetsGridEl.innerHTML = '';

    numbers.forEach((num, idx) => {
      const boardEl = document.createElement('div');
      boardEl.className = 'target-board pop-in';
      boardEl.dataset.num = num;

      boardEl.innerHTML = `
        <div class="board-hinge"></div>
        <div class="board-plate">
          <div class="board-ring">
            <span class="board-num">${num}</span>
          </div>
        </div>
        <div class="board-stand"></div>
      `;

      boardEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('target')) return;
        e.preventDefault();
        this.shootAtTarget(num, boardEl, e.clientX, e.clientY);
      });

      this.targetsGridEl.appendChild(boardEl);
    });
  }

  shootAtTarget(num, boardEl, targetX, targetY) {
    this.isLocked = true;

    // ボール発射アニメーション
    const ball = document.createElement('div');
    ball.className = 'flying-ball';
    document.body.appendChild(ball);

    const launcherRect = this.ballLauncherEl.getBoundingClientRect();
    const startX = launcherRect.left + launcherRect.width / 2;
    const startY = launcherRect.top + launcherRect.height / 2;

    ball.style.left = `${startX}px`;
    ball.style.top = `${startY}px`;

    window.soundSystem.playPop();

    // 軌跡アニメーション
    setTimeout(() => {
      ball.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.6)`;
      ball.style.opacity = '0.9';

      setTimeout(() => {
        ball.remove();
        this.evaluateHit(num, boardEl, targetX, targetY);
      }, 250);
    }, 20);
  }

  evaluateHit(num, boardEl, hitX, hitY) {
    if (num === this.correctNum) {
      // 命中・正解！
      this.isCleared = true;
      this.app.stopTimer();
      boardEl.classList.add('knocked-down');
      window.soundSystem.playTargetHit();

      this.app.particles.explode(hitX, hitY, 50);

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();
        window.soundSystem.playVoice('target_hit');

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('target')) return;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3200);

      }, 500);

    } else {
      // 不正解
      window.soundSystem.playPop();
      boardEl.classList.add('wobble');
      setTimeout(() => {
        boardEl.classList.remove('wobble');
        this.isLocked = false;
      }, 500);
      window.soundSystem.playVoice('target_miss');
    }
  }
}

window.GameTarget = GameTarget;
