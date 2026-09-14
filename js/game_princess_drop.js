/**
 * game_princess_drop.js - プリンセスのまほうの数字ドロップ (Princess Magic Number Drop)
 * 1〜100の数字が書かれた魔法のジュエルが上から落ちてきます！
 * 下の10個の領域（1〜9, 10〜19, ..., 90〜100）へ正しく移動させて積み上げよう！
 * 間違うと邪魔する石（🪨）が落ちてきて、上まで積み上がるとゲームオーバー！
 * 20個の数字を正しく配置できたらステージ完成＆クリア！
 */

class GamePrincessDrop {
  constructor(app) {
    this.app = app;
    this.totalGoal = 20;
    this.placedCount = 0;
    this.maxLaneHeight = 6;
    this.isGameActive = false;
    this.isPaused = false;

    // 10個の領域定義
    this.lanes = [
      { id: 0, label: '1〜9', min: 1, max: 9, color: '#ff7675' },
      { id: 1, label: '10〜19', min: 10, max: 19, color: '#fd79a8' },
      { id: 2, label: '20〜29', min: 20, max: 29, color: '#fab1a0' },
      { id: 3, label: '30〜39', min: 30, max: 39, color: '#fbc531' },
      { id: 4, label: '40〜49', min: 40, max: 49, color: '#ffeaa7' },
      { id: 5, label: '50〜59', min: 50, max: 59, color: '#55efc4' },
      { id: 6, label: '60〜69', min: 60, max: 69, color: '#00cec9' },
      { id: 7, label: '70〜79', min: 70, max: 79, color: '#74b9ff' },
      { id: 8, label: '80〜89', min: 80, max: 89, color: '#0984e3' },
      { id: 9, label: '90〜100', min: 90, max: 100, color: '#a29bfe' }
    ];

    // 各レーンの積み上がりスタック
    this.laneStacks = Array.from({ length: 10 }, () => []);

    // 落下中アイテムの状態
    this.currentNum = null;
    this.currentLane = 4;
    this.currentPosY = 0; // % 0 to 100
    this.fallSpeed = 0.35; // 落下速度
    this.animFrameId = null;
    this.isDroppingFast = false;
    this.isDragging = false;
    this.dragStartX = 0;

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-drop');
  }

  getCorrectLane(num) {
    if (num <= 9) return 0;
    if (num >= 90) return 9;
    return Math.floor(num / 10);
  }

  start() {
    this.placedCount = 0;
    this.laneStacks = Array.from({ length: 10 }, () => []);
    this.isGameActive = true;
    this.isPaused = false;
    this.isDroppingFast = false;
    this.app.updateStamps(0, 5);
    window.soundSystem.startPrincessBgm();

    this.renderStage();
    this.spawnNextNumber();
    this.startFallLoop();
  }

  stop() {
    this.isGameActive = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  renderStage() {
    this.containerEl = document.getElementById('view-game-princess-drop');
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="p-drop-game-layout">
        <!-- 上部：進行状況・おしゃべりバー -->
        <div class="p-drop-header-bar">
          <div class="p-drop-speech-bubble" id="p-drop-speech-bubble">
            <span class="p-drop-prompt-text" id="p-drop-prompt-text">数字を 正しいお部屋へ はこんでね！</span>
          </div>
          <div class="p-drop-progress-badge">
            <span class="p-drop-progress-icon">👑</span>
            <span class="p-drop-progress-text" id="p-drop-progress-text">0 / ${this.totalGoal}</span>
          </div>
        </div>

        <!-- 中央：メイン落下ステージ ＆ 左側プリンセス -->
        <div class="p-drop-main-stage">
          <!-- 左側：応援プリンセス -->
          <div class="p-drop-side-panel">
            <div class="p-drop-princess-avatar" id="p-drop-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
            <div class="p-drop-helper-card">
              <span class="helper-title">🎯 20個で完成！</span>
              <p class="helper-desc">積み上がりすぎると危険だよ！</p>
            </div>
          </div>

          <!-- 右側：10列のドロップウェル盤面 -->
          <div class="p-drop-well-board" id="p-drop-well-board">
            <!-- 危険ライン -->
            <div class="p-drop-danger-line" title="デンジャーライン！">
              <span class="danger-text">⚠️ ここまで積むとゲームオーバー！</span>
            </div>

            <!-- 10個のレーン列 -->
            <div class="p-drop-lanes-matrix" id="p-drop-lanes-matrix"></div>

            <!-- 落下中のジュエル要素 -->
            <div class="p-falling-gem-avatar" id="p-falling-gem">
              <div class="falling-gem-glow"></div>
              <div class="falling-gem-body" id="p-falling-gem-body">
                <span class="falling-gem-num" id="p-falling-gem-num">50</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 下部操作アシストボタン -->
        <div class="p-drop-controls-bar">
          <button class="drop-ctrl-btn btn-left" id="btn-drop-left">◀ ひだり</button>
          <button class="drop-ctrl-btn btn-down" id="btn-drop-down">⬇️ いっきに落とす！</button>
          <button class="drop-ctrl-btn btn-right" id="btn-drop-right">みぎ ▶</button>
        </div>

        <!-- ゲームオーバーモーダル -->
        <div class="p-drop-over-modal" id="p-drop-over-modal">
          <div class="p-drop-modal-card pop-in">
            <div class="modal-rock-icon">🪨 💥</div>
            <h3 class="modal-over-title">ざんねん！ 石がいっぱいに…</h3>
            <p class="modal-over-desc">石が上まで積み上がっちゃいました。</p>
            <p class="modal-over-score">置けた数: <span id="p-drop-final-count">0</span> / ${this.totalGoal} 個</p>
            <button class="primary-btn" id="btn-drop-retry">🔄 もういちど あそぶ！</button>
          </div>
        </div>
      </div>
    `;

    this.renderLanes();
    this.initControls();
  }

  renderLanes() {
    const matrixEl = document.getElementById('p-drop-lanes-matrix');
    if (!matrixEl) return;
    matrixEl.innerHTML = '';

    this.lanes.forEach(lane => {
      const colEl = document.createElement('div');
      colEl.className = 'p-drop-lane-col';
      colEl.dataset.laneId = lane.id;

      colEl.innerHTML = `
        <div class="lane-stack-area" id="lane-stack-${lane.id}"></div>
        <div class="lane-bottom-label" style="background: ${lane.color};">
          ${lane.label}
        </div>
      `;

      // レーンをタップした時の即時移動＆ドロップ
      colEl.addEventListener('pointerdown', (e) => {
        if (!this.isGameActive || this.isPaused) return;
        this.currentLane = lane.id;
        this.updateFallingGemX();
        this.dropInstantly();
      });

      matrixEl.appendChild(colEl);
    });

    this.renderAllStacks();
  }

  renderAllStacks() {
    this.lanes.forEach(lane => {
      const stackContainer = document.getElementById(`lane-stack-${lane.id}`);
      if (!stackContainer) return;
      stackContainer.innerHTML = '';

      const stack = this.laneStacks[lane.id];
      stack.forEach(item => {
        const itemEl = document.createElement('div');
        if (item.type === 'rock') {
          itemEl.className = 'stacked-block stacked-rock pop-in';
          itemEl.innerHTML = '🪨';
        } else {
          itemEl.className = 'stacked-block stacked-gem pop-in';
          itemEl.style.background = lane.color;
          itemEl.innerHTML = `<span class="stacked-num">${item.num}</span>`;
        }
        stackContainer.appendChild(itemEl);
      });
    });
  }

  initControls() {
    // 左右・ドロップボタン
    const leftBtn = document.getElementById('btn-drop-left');
    const rightBtn = document.getElementById('btn-drop-right');
    const downBtn = document.getElementById('btn-drop-down');
    const retryBtn = document.getElementById('btn-drop-retry');

    if (leftBtn) {
      leftBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveLane(-1);
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveLane(1);
      });
    }
    if (downBtn) {
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dropInstantly();
      });
    }
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const modal = document.getElementById('p-drop-over-modal');
        if (modal) modal.classList.remove('show');
        this.start();
      });
    }

    // ボード全体のドラッグ移動
    const board = document.getElementById('p-drop-well-board');
    if (board) {
      const onStart = (e) => {
        if (!this.isGameActive || this.isPaused) return;
        this.isDragging = true;
        const pt = e.touches ? e.touches[0] : e;
        this.dragStartX = pt.clientX;
      };

      const onMove = (e) => {
        if (!this.isDragging || !this.isGameActive || this.isPaused) return;
        const pt = e.touches ? e.touches[0] : e;
        const boardRect = board.getBoundingClientRect();
        const relX = pt.clientX - boardRect.left;
        const laneWidth = boardRect.width / 10;
        const targetLane = Math.max(0, Math.min(9, Math.floor(relX / laneWidth)));
        if (targetLane !== this.currentLane) {
          this.currentLane = targetLane;
          this.updateFallingGemX();
          window.soundSystem.playPop();
        }
      };

      const onEnd = () => {
        this.isDragging = false;
      };

      board.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      board.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    }
  }

  moveLane(delta) {
    if (!this.isGameActive || this.isPaused) return;
    this.currentLane = Math.max(0, Math.min(9, this.currentLane + delta));
    this.updateFallingGemX();
    window.soundSystem.playPop();
  }

  dropInstantly() {
    if (!this.isGameActive || this.isPaused) return;
    this.isDroppingFast = true;
    window.soundSystem.playSparkle();
  }

  spawnNextNumber() {
    // 1〜100 のランダムな数字
    this.currentNum = Math.floor(Math.random() * 100) + 1;
    this.currentLane = Math.floor(Math.random() * 6) + 2; // 中央付近スタート
    this.currentPosY = 4;
    this.isDroppingFast = false;

    const numEl = document.getElementById('p-falling-gem-num');
    const gemBody = document.getElementById('p-falling-gem-body');
    const correctLaneId = this.getCorrectLane(this.currentNum);
    const laneMeta = this.lanes[correctLaneId];

    if (numEl) numEl.textContent = this.currentNum;
    if (gemBody) {
      gemBody.style.background = `radial-gradient(circle at 35% 35%, #ffffff 0%, ${laneMeta.color} 75%, #2f3542 100%)`;
      gemBody.style.borderColor = laneMeta.color;
    }

    this.updateFallingGemX();
    this.updateFallingGemY();
  }

  getTargetLandingY() {
    const board = document.getElementById('p-drop-well-board');
    const gem = document.getElementById('p-falling-gem');
    const stackContainer = document.getElementById(`lane-stack-${this.currentLane}`);
    if (!board || !gem || !stackContainer) return 300;

    const boardRect = board.getBoundingClientRect();
    const gemHeight = gem.offsetHeight || 44;

    // もしすでにブロックが積まれている場合、最上段ブロックのtop位置を正確に取得
    if (stackContainer.lastElementChild) {
      const topBlockRect = stackContainer.lastElementChild.getBoundingClientRect();
      return Math.max(10, topBlockRect.top - boardRect.top - gemHeight + 2);
    }

    // まだ何も積まれていない場合、スタック領域の底面（ラベルの直上）に着地
    const stackRect = stackContainer.getBoundingClientRect();
    return Math.max(10, stackRect.bottom - boardRect.top - gemHeight - 2);
  }

  updateFallingGemX() {
    const gem = document.getElementById('p-falling-gem');
    const board = document.getElementById('p-drop-well-board');
    const matrixEl = document.getElementById('p-drop-lanes-matrix');
    if (!gem || !board || !matrixEl) return;

    const laneCol = matrixEl.children[this.currentLane];
    if (laneCol) {
      const colRect = laneCol.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const centerX = (colRect.left - boardRect.left) + colRect.width / 2;
      gem.style.left = `${centerX}px`;
    } else {
      const pct = this.currentLane * 10 + 5;
      gem.style.left = `${pct}%`;
    }
  }

  updateFallingGemY() {
    const gem = document.getElementById('p-falling-gem');
    if (!gem) return;
    gem.style.top = `${this.currentPosY}px`;
  }

  startFallLoop() {
    const loop = () => {
      if (!this.isGameActive) return;

      if (!this.isPaused) {
        const board = document.getElementById('p-drop-well-board');
        const boardHeight = board ? board.clientHeight : 500;

        // 10個までは半分のスピード（ゆっくり）、10個を超えたら元のスピード
        const normalSpeed = (this.placedCount > 10)
          ? Math.max(1.8, boardHeight * 0.0035)
          : Math.max(0.9, boardHeight * 0.00175);

        const speed = this.isDroppingFast ? Math.max(26, boardHeight * 0.05) : normalSpeed;
        this.currentPosY += speed;

        const targetY = this.getTargetLandingY();

        if (this.currentPosY >= targetY) {
          this.currentPosY = targetY;
          this.updateFallingGemY();
          this.handleLand();
        } else {
          this.updateFallingGemY();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(loop);
  }

  handleLand() {
    this.isPaused = true;
    const num = this.currentNum;
    const chosenLane = this.currentLane;
    const correctLane = this.getCorrectLane(num);

    if (chosenLane === correctLane) {
      // 正解！
      this.placedCount++;
      this.laneStacks[chosenLane].push({ type: 'gem', num: num });
      this.renderAllStacks();

      // サウンド ＆ パーティクル
      window.soundSystem.playJewelTone(Math.min(9, Math.floor(this.placedCount / 2)));
      window.soundSystem.playSparkle();

      const board = document.getElementById('p-drop-well-board');
      if (board) {
        const boardRect = board.getBoundingClientRect();
        const posX = boardRect.left + (chosenLane * 10 + 5) * (boardRect.width / 100);
        const posY = boardRect.top + boardRect.height * 0.75;
        this.app.particles.explode(posX, posY, 35);
      }

      // プリンセスの喜びアニメーション
      const princess = document.getElementById('p-drop-princess-avatar');
      if (princess) {
        princess.classList.add('cheering');
        setTimeout(() => princess.classList.remove('cheering'), 700);
      }

      this.updateProgress();

      // 10個達成時にスピードアップ案内
      if (this.placedCount === 10) {
        const promptEl = document.getElementById('p-drop-prompt-text');
        if (promptEl) {
          promptEl.innerHTML = `✨ 10個クリア！ここから スピードアップするよ！ 💨`;
        }
      }

      // クリアチェック
      if (this.placedCount >= this.totalGoal) {
        setTimeout(() => this.handleVictory(), 600);
        return;
      }

      setTimeout(() => {
        this.isPaused = false;
        this.spawnNextNumber();
      }, 500);

    } else {
      // 不正解！
      window.soundSystem.playPop();
      window.soundSystem.playRockDrop();

      const promptEl = document.getElementById('p-drop-prompt-text');
      if (promptEl) {
        promptEl.innerHTML = `⚠️ おしい！ ${num} は <strong>${this.lanes[correctLane].label}</strong> だよ！`;
      }

      // 邪魔する石（🪨）がランダムなレーンに落下
      const rockLane = Math.floor(Math.random() * 10);
      this.laneStacks[rockLane].push({ type: 'rock' });
      this.renderAllStacks();

      const board = document.getElementById('p-drop-well-board');
      if (board) {
        board.classList.add('shake-card');
        setTimeout(() => board.classList.remove('shake-card'), 400);
      }

      // ゲームオーバー判定（いずれかの列が上限に達したか）
      if (this.laneStacks.some(s => s.length >= this.maxLaneHeight)) {
        setTimeout(() => this.handleGameOver(), 700);
        return;
      }

      setTimeout(() => {
        this.isPaused = false;
        this.spawnNextNumber();
      }, 900);
    }
  }

  updateProgress() {
    const progText = document.getElementById('p-drop-progress-text');
    if (progText) {
      progText.textContent = `${this.placedCount} / ${this.totalGoal}`;
    }
    this.app.updateStamps(Math.floor((this.placedCount / this.totalGoal) * 5), 5);
  }

  handleGameOver() {
    this.isGameActive = false;
    window.soundSystem.playTimeout();

    const countSpan = document.getElementById('p-drop-final-count');
    if (countSpan) countSpan.textContent = this.placedCount;

    const modal = document.getElementById('p-drop-over-modal');
    if (modal) modal.classList.add('show');
  }

  handleVictory() {
    this.isGameActive = false;
    this.app.updateStamps(5, 5);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 140);

    const princess = document.getElementById('p-drop-princess-avatar');
    if (princess) princess.classList.add('cheering');

    const promptEl = document.getElementById('p-drop-prompt-text');
    if (promptEl) {
      promptEl.innerHTML = `🎉 かんせい！ 20個の数字をぜんぶ正しく並べたよ！ 👑`;
    }

    setTimeout(() => {
      this.app.showCompleteModal();
    }, 1200);
  }
}

window.GamePrincessDrop = GamePrincessDrop;
