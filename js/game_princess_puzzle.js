/**
 * game_princess_puzzle.js - まほうのジュエルつなぎパズル (Magic Jewel Connect)
 * 自分で着せ替えたプリンセスがパズルの横で魔法を応援！
 * 指で同じ色のジュエルを3つ以上なぞってつなぐと、プリンセスがステッキを振って魔法を発動！
 */

class GamePrincessPuzzle {
  constructor(app) {
    this.app = app;
    this.rows = 6;
    this.cols = 6;
    this.round = 0;
    this.maxRounds = 5;
    this.grid = []; // 2D array of jewel objects
    this.selectedPath = []; // array of {r, c}
    this.isDragging = false;
    this.currentDragColor = null;
    this.remainingTarget = 0;
    this.isBoardLocked = false;

    // 6種のジュエル定義
    this.jewelTypes = [
      { id: 'ruby', name: 'ルビー', icon: '💎', color: '#ff4757', glow: '#ff7675', symbol: '❤️' },
      { id: 'sapphire', name: 'サファイア', icon: '💎', color: '#1e90ff', glow: '#70a1ff', symbol: '💙' },
      { id: 'emerald', name: 'エメラルド', icon: '💎', color: '#2ed573', glow: '#7bed9f', symbol: '💚' },
      { id: 'topaz', name: 'トパーズ', icon: '💎', color: '#ffa502', glow: '#ffeaa7', symbol: '⭐' },
      { id: 'amethyst', name: 'アメジスト', icon: '💎', color: '#9b59b6', glow: '#e0c3fc', symbol: '💜' },
      { id: 'diamond', name: 'ダイヤモンド', icon: '💎', color: '#00d2d3', glow: '#ffffff', symbol: '🤍' }
    ];

    // 5つのミッションお題
    this.missions = [
      { targetType: 'ruby', count: 6, title: '❤️ あかいルビーを 6こ つなげよう！' },
      { targetType: 'sapphire', count: 8, title: '💙 あおいサファイアを 8こ つなげよう！' },
      { targetType: 'emerald', count: 8, title: '💚 みどりのエメラルドを 8こ つなげよう！' },
      { targetType: 'topaz', count: 10, title: '⭐ きいろのトパーズを 10こ つなげよう！' },
      { targetType: 'any', count: 15, title: '✨ ぜんぶのジュエルを 15こ つなげて 大魔法！' }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-puzzle');
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
      <div class="puzzle-game-layout">
        <!-- 上部：お題・残りカウントバー -->
        <div class="puzzle-header-bar">
          <div class="puzzle-mission-bubble" id="puzzle-mission-bubble">
            <span class="puzzle-mission-text" id="puzzle-mission-text">読み込み中...</span>
          </div>
          <div class="puzzle-target-badge" id="puzzle-target-badge">
            <span class="target-label">あと:</span>
            <span class="target-count-number" id="puzzle-target-count">0</span>
          </div>
        </div>

        <!-- 中央：パズルボード ＆ 横で応援するプリンセス -->
        <div class="puzzle-main-stage">
          <!-- 左側：プリンセスサポーター -->
          <div class="puzzle-supporter-box">
            <div class="puzzle-princess-avatar" id="puzzle-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
            <div class="princess-cheer-bubble" id="puzzle-cheer-bubble">
              <span id="puzzle-cheer-text">がんばってね！✨</span>
            </div>
          </div>

          <!-- 右側：ジュエルグリッド盤面 -->
          <div class="puzzle-board-wrapper" id="puzzle-board-wrapper">
            <svg class="puzzle-trace-svg" id="puzzle-trace-svg"></svg>
            <div class="puzzle-grid-matrix" id="puzzle-grid-matrix"></div>
          </div>
        </div>

        <!-- フィーバー・コンボポップアップ -->
        <div class="puzzle-fever-banner" id="puzzle-fever-banner">
          ✨ FEVER SUPER MAGIC! ✨
        </div>
      </div>
    `;

    this.initBoardEvents();
  }

  nextRound() {
    if (this.round >= this.maxRounds) {
      this.handleGameComplete();
      return;
    }

    this.round++;
    this.app.updateStamps(this.round - 1, this.maxRounds);
    this.isBoardLocked = false;
    this.selectedPath = [];

    const mission = this.missions[this.round - 1] || this.missions[0];
    this.remainingTarget = mission.count;

    const missionBubble = document.getElementById('puzzle-mission-text');
    if (missionBubble) {
      missionBubble.innerHTML = mission.title;
    }
    this.updateTargetCounter();

    this.speakCheer('お題のジュエルを なぞってね！', true);
    window.soundSystem.playMagicChime();

    this.initGridData();
    this.renderGridCells();
  }

  updateTargetCounter() {
    const counterEl = document.getElementById('puzzle-target-count');
    if (counterEl) {
      counterEl.textContent = Math.max(0, this.remainingTarget);
    }
  }

  speakCheer(text, sparkle = false) {
    const cheerEl = document.getElementById('puzzle-cheer-text');
    const bubbleEl = document.getElementById('puzzle-cheer-bubble');
    if (cheerEl) cheerEl.textContent = text;
    if (bubbleEl) {
      bubbleEl.classList.add('pop-in');
      setTimeout(() => bubbleEl.classList.remove('pop-in'), 400);
    }
    if (sparkle) window.soundSystem.playSparkle();
  }

  initGridData() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        const randType = this.jewelTypes[Math.floor(Math.random() * this.jewelTypes.length)];
        row.push({ ...randType, r, c });
      }
      this.grid.push(row);
    }
  }

  renderGridCells() {
    const matrixEl = document.getElementById('puzzle-grid-matrix');
    if (!matrixEl) return;
    matrixEl.innerHTML = '';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const jewel = this.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'jewel-cell pop-in';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;
        cellEl.style.setProperty('--jewel-color', jewel.color);
        cellEl.style.setProperty('--jewel-glow', jewel.glow);

        cellEl.innerHTML = `
          <div class="jewel-gem-body" style="background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${jewel.glow} 30%, ${jewel.color} 80%, rgba(0,0,0,0.3) 100%);">
            <span class="jewel-symbol">${jewel.symbol}</span>
          </div>
        `;

        matrixEl.appendChild(cellEl);
      }
    }
  }

  initBoardEvents() {
    const board = document.getElementById('puzzle-board-wrapper');
    if (!board) return;

    const getCellFromPoint = (clientX, clientY) => {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return null;
      const cell = el.closest('.jewel-cell');
      if (!cell) return null;
      return {
        r: parseInt(cell.dataset.row, 10),
        c: parseInt(cell.dataset.col, 10),
        el: cell
      };
    };

    const onStart = (e) => {
      if (this.isBoardLocked) return;
      const pt = e.touches ? e.touches[0] : e;
      const hit = getCellFromPoint(pt.clientX, pt.clientY);
      if (!hit) return;

      this.isDragging = true;
      this.selectedPath = [hit];
      this.currentDragColor = this.grid[hit.r][hit.c].id;

      window.soundSystem.playJewelTone(0);
      this.updateSelectionVisuals();
    };

    const onMove = (e) => {
      if (!this.isDragging || this.isBoardLocked) return;
      const pt = e.touches ? e.touches[0] : e;
      const hit = getCellFromPoint(pt.clientX, pt.clientY);
      if (!hit) return;

      const last = this.selectedPath[this.selectedPath.length - 1];
      if (hit.r === last.r && hit.c === last.c) return;

      // 直前の1個前に戻った場合は1つ取り消し
      if (this.selectedPath.length > 1) {
        const prev = this.selectedPath[this.selectedPath.length - 2];
        if (hit.r === prev.r && hit.c === prev.c) {
          this.selectedPath.pop();
          window.soundSystem.playPop();
          this.updateSelectionVisuals();
          return;
        }
      }

      // すでに選択済みならスキップ
      if (this.selectedPath.some(p => p.r === hit.r && p.c === hit.c)) return;

      // 隣接チェック（縦・横・斜め1マス）
      const dr = Math.abs(hit.r - last.r);
      const dc = Math.abs(hit.c - last.c);
      if (dr <= 1 && dc <= 1) {
        // 色一致チェック
        const nextJewel = this.grid[hit.r][hit.c];
        if (nextJewel.id === this.currentDragColor) {
          this.selectedPath.push(hit);
          window.soundSystem.playJewelTone(this.selectedPath.length - 1);
          this.updateSelectionVisuals();
        }
      }
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.handleMatchResolution();
    };

    board.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    board.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  updateSelectionVisuals() {
    const allCells = document.querySelectorAll('.jewel-cell');
    allCells.forEach(cell => cell.classList.remove('selected', 'path-head'));

    this.selectedPath.forEach((pt, idx) => {
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        cell.classList.add('selected');
        if (idx === this.selectedPath.length - 1) cell.classList.add('path-head');
      }
    });

    // SVGライン描画
    this.drawTraceLine();
  }

  drawTraceLine() {
    const svg = document.getElementById('puzzle-trace-svg');
    const board = document.getElementById('puzzle-board-wrapper');
    if (!svg || !board) return;

    if (this.selectedPath.length < 2) {
      svg.innerHTML = '';
      return;
    }

    const boardRect = board.getBoundingClientRect();
    let pathD = '';

    this.selectedPath.forEach((pt, idx) => {
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) - boardRect.left;
      const y = (rect.top + rect.height / 2) - boardRect.top;

      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    const jewel = this.jewelTypes.find(j => j.id === this.currentDragColor) || this.jewelTypes[0];

    svg.innerHTML = `
      <path d="${pathD}" stroke="${jewel.color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" filter="drop-shadow(0 0 6px ${jewel.glow})"/>
      <path d="${pathD}" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
  }

  handleMatchResolution() {
    const svg = document.getElementById('puzzle-trace-svg');
    if (svg) svg.innerHTML = '';

    if (this.selectedPath.length < 3) {
      // 3個未満はキャンセル
      const allCells = document.querySelectorAll('.jewel-cell');
      allCells.forEach(cell => cell.classList.remove('selected', 'path-head'));
      this.selectedPath = [];
      return;
    }

    // 3個以上つなげた！
    this.isBoardLocked = true;
    const matchCount = this.selectedPath.length;
    const matchColor = this.currentDragColor;
    const isFever = matchCount >= 5;

    // プリンセスの魔法発動アニメーション
    const princess = document.getElementById('puzzle-princess-avatar');
    if (princess) {
      princess.classList.add('spell-casting');
      setTimeout(() => princess.classList.remove('spell-casting'), 800);
    }

    if (isFever) {
      window.soundSystem.playFeverBurst();
      this.speakCheer('✨ すごい！ 大魔法発動！ ✨', true);
      this.showFeverBanner();
    } else {
      window.soundSystem.playJewelClear();
      this.speakCheer('ステキ！ きらきら魔法！ ✨', true);
    }

    // パーティクル
    this.selectedPath.forEach(pt => {
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        const rect = cell.getBoundingClientRect();
        this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
        cell.classList.add('clearing');
      }
    });

    // お題カウント更新
    const mission = this.missions[this.round - 1];
    if (mission.targetType === 'any' || mission.targetType === matchColor) {
      this.remainingTarget = Math.max(0, this.remainingTarget - matchCount);
      this.updateTargetCounter();
    }

    // グリッドデータ更新と落下処理
    setTimeout(() => {
      this.dropJewels();
      this.renderGridCells();
      this.isBoardLocked = false;
      this.selectedPath = [];

      // ミッションクリアチェック
      if (this.remainingTarget <= 0) {
        this.handleMissionSuccess();
      }
    }, 450);
  }

  showFeverBanner() {
    const banner = document.getElementById('puzzle-fever-banner');
    if (banner) {
      banner.classList.add('show');
      setTimeout(() => banner.classList.remove('show'), 1200);
    }
  }

  dropJewels() {
    // 選択されたセルを null に
    this.selectedPath.forEach(pt => {
      this.grid[pt.r][pt.c] = null;
    });

    // 各列ごとに下へ詰める
    for (let c = 0; c < this.cols; c++) {
      let emptyRow = this.rows - 1;
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) {
          if (emptyRow !== r) {
            this.grid[emptyRow][c] = { ...this.grid[r][c], r: emptyRow, c };
            this.grid[r][c] = null;
          }
          emptyRow--;
        }
      }
      // 上の空きに新しいジュエルを補充
      for (let r = emptyRow; r >= 0; r--) {
        const randType = this.jewelTypes[Math.floor(Math.random() * this.jewelTypes.length)];
        this.grid[r][c] = { ...randType, r, c };
      }
    }
  }

  handleMissionSuccess() {
    this.isBoardLocked = true;
    window.soundSystem.playTreasureChest();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 80);

    const princess = document.getElementById('puzzle-princess-avatar');
    if (princess) princess.classList.add('cheering');

    this.speakCheer('🎉 ミッションクリア！ 次のお題へ！ 🎉', true);
    this.app.updateStamps(this.round, this.maxRounds);

    setTimeout(() => {
      if (princess) princess.classList.remove('cheering');
      this.nextRound();
    }, 1400);
  }

  handleGameComplete() {
    this.app.updateStamps(this.maxRounds, this.maxRounds);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 140);
    setTimeout(() => {
      this.app.showCompleteModal();
    }, 800);
  }
}

window.GamePrincessPuzzle = GamePrincessPuzzle;
