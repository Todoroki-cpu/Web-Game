/**
 * game_princess_puzzle.js - まほうのジュエルつなぎパズル (Magic Jewel Connect)
 * 自分で着せ替えたプリンセスがパズルの横で魔法を応援！
 * 3個以上つなぐと、繋いだ個数に応じた8段階の豪華コンボ演出が発動！
 * （3個:NICE! 〜 10個以上:ULTIMATE ROYAL!）何個繋いだかがド派手に強調されます！
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

    // つないだ個数別の8段階ティア設定 (3個〜10個以上)
    this.comboTiers = {
      3: {
        level: 1,
        title: 'NICE!',
        label: '3個 つなぎ！',
        stars: '⭐',
        badgeClass: 'tier-lvl-1',
        emoji: '✨',
        color: '#3498db',
        glowColor: '#70a1ff',
        particleCount: 25,
        bonusClears: 0,
        shakeClass: 'shake-lvl-1',
        princessAnim: 'spell-small',
        cheerText: 'ナイス！ 3個つなぎ！ ✨'
      },
      4: {
        level: 2,
        title: 'GREAT!',
        label: '4個 つなぎ！',
        stars: '⭐⭐',
        badgeClass: 'tier-lvl-2',
        emoji: '💖',
        color: '#ff7597',
        glowColor: '#ffb8b8',
        particleCount: 45,
        bonusClears: 0,
        shakeClass: 'shake-lvl-2',
        princessAnim: 'spell-medium',
        cheerText: 'グレート！ 4個つなぎ！ 💖'
      },
      5: {
        level: 3,
        title: 'SUPER MAGIC!',
        label: '5個 つなぎ！',
        stars: '⭐⭐⭐',
        badgeClass: 'tier-lvl-3',
        emoji: '🌟',
        color: '#f1c40f',
        glowColor: '#ffeaa7',
        particleCount: 70,
        bonusClears: 1, // 周囲1個ボーナス消去
        shakeClass: 'shake-lvl-3',
        princessAnim: 'spell-large',
        cheerText: 'スーパー！ 5個つなぎ魔法！ 🌟'
      },
      6: {
        level: 4,
        title: 'EXCELLENT!',
        label: '6個 つなぎ！',
        stars: '⭐⭐⭐⭐',
        badgeClass: 'tier-lvl-4',
        emoji: '💎',
        color: '#00cec9',
        glowColor: '#81ecec',
        particleCount: 95,
        bonusClears: 2, // 周囲2個ボーナス消去
        shakeClass: 'shake-lvl-3',
        princessAnim: 'spell-large',
        cheerText: 'エクセレント！ 6個つなぎ！ 💎'
      },
      7: {
        level: 5,
        title: 'PRINCESS FEVER!',
        label: '7個 つなぎ！',
        stars: '👑⭐⭐⭐⭐',
        badgeClass: 'tier-lvl-5',
        emoji: '👑',
        color: '#9b59b6',
        glowColor: '#e0c3fc',
        particleCount: 120,
        bonusClears: 3, // 周囲3個ボーナス消去
        shakeClass: 'shake-lvl-fever',
        princessAnim: 'spell-fever',
        cheerText: 'フィーバー！ 7個つなぎ大魔法！ 👑'
      },
      8: {
        level: 6,
        title: 'MIRACLE MAGIC!',
        label: '8個 つなぎ！',
        stars: '👑⭐⭐⭐⭐⭐',
        badgeClass: 'tier-lvl-6',
        emoji: '🪄',
        color: '#e84393',
        glowColor: '#fd79a8',
        particleCount: 150,
        bonusClears: 4,
        shakeClass: 'shake-lvl-fever',
        princessAnim: 'spell-fever',
        cheerText: 'ミラクル！ 8個つなぎ奇跡の魔法！ 🪄'
      },
      9: {
        level: 7,
        title: 'LEGENDARY WONDER!',
        label: '9個 つなぎ！',
        stars: '👑💖⭐⭐⭐⭐⭐',
        badgeClass: 'tier-lvl-7',
        emoji: '🦄',
        color: '#ff4757',
        glowColor: '#ff6b81',
        particleCount: 180,
        bonusClears: 5,
        shakeClass: 'shake-lvl-ultimate',
        princessAnim: 'spell-fever',
        cheerText: 'レジェンド！ 9個つなぎ伝説の魔法！ 🦄'
      },
      10: {
        level: 8,
        title: 'ULTIMATE ROYAL!',
        label: '個 つなぎ！',
        stars: '👑🌈✨ PERFECT!',
        badgeClass: 'tier-lvl-8',
        emoji: '🌈',
        color: '#f39c12',
        glowColor: '#ffffff',
        particleCount: 220,
        bonusClears: 7,
        shakeClass: 'shake-lvl-ultimate',
        princessAnim: 'spell-ultimate',
        cheerText: 'アルティメット！ 究極のロイヤル魔法！ 🌈'
      }
    };

    this.initDOM();
  }

  getComboTierData(count) {
    if (count <= 3) return this.comboTiers[3];
    if (count >= 10) {
      const base = { ...this.comboTiers[10] };
      base.label = `${count}個 つなぎ！`;
      base.cheerText = `アルティメット！ ${count}個つなぎ究極魔法！ 🌈`;
      return base;
    }
    return this.comboTiers[count];
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

            <!-- なぞり中のリアルタイム個数バッジ -->
            <div class="puzzle-drag-counter-badge" id="puzzle-drag-counter-badge"></div>

            <!-- コンボ成立時の特大エフェクト演出レイヤー -->
            <div class="puzzle-combo-burst-layer" id="puzzle-combo-burst-layer">
              <div class="combo-burst-card" id="combo-burst-card">
                <div class="combo-burst-stars" id="combo-burst-stars">⭐⭐⭐</div>
                <div class="combo-burst-count" id="combo-burst-count">5個 つなぎ！</div>
                <div class="combo-burst-title" id="combo-burst-title">SUPER MAGIC!</div>
              </div>
            </div>
          </div>
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

    const count = this.selectedPath.length;

    this.selectedPath.forEach((pt, idx) => {
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        cell.classList.add('selected');
        if (idx === this.selectedPath.length - 1) cell.classList.add('path-head');
      }
    });

    // なぞり中のリアルタイム個数バッジ更新
    const dragBadge = document.getElementById('puzzle-drag-counter-badge');
    const board = document.getElementById('puzzle-board-wrapper');

    if (dragBadge && board && count > 0) {
      const last = this.selectedPath[count - 1];
      const headCell = document.querySelector(`.jewel-cell[data-row="${last.r}"][data-col="${last.c}"]`);
      if (headCell) {
        const boardRect = board.getBoundingClientRect();
        const cellRect = headCell.getBoundingClientRect();
        const posX = (cellRect.left + cellRect.width / 2) - boardRect.left;
        const posY = cellRect.top - boardRect.top - 18;

        dragBadge.style.left = `${posX}px`;
        dragBadge.style.top = `${posY}px`;

        if (count >= 3) {
          const tier = this.getComboTierData(count);
          dragBadge.className = `puzzle-drag-counter-badge show ${tier.badgeClass}`;
          dragBadge.innerHTML = `${tier.emoji} <strong>${count}個</strong> ${tier.title}`;
        } else {
          dragBadge.className = 'puzzle-drag-counter-badge show';
          dragBadge.innerHTML = `💎 <strong>${count}個</strong>`;
        }
      }
    } else if (dragBadge) {
      dragBadge.classList.remove('show');
    }

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
    const strokeW = Math.min(14, 7 + this.selectedPath.length * 0.8);

    svg.innerHTML = `
      <path d="${pathD}" stroke="${jewel.color}" stroke-width="${strokeW + 4}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" filter="drop-shadow(0 0 8px ${jewel.glow})"/>
      <path d="${pathD}" stroke="#ffffff" stroke-width="${strokeW * 0.5}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
  }

  handleMatchResolution() {
    const svg = document.getElementById('puzzle-trace-svg');
    if (svg) svg.innerHTML = '';

    const dragBadge = document.getElementById('puzzle-drag-counter-badge');
    if (dragBadge) dragBadge.classList.remove('show');

    const matchCount = this.selectedPath.length;

    if (matchCount < 3) {
      // 3個未満はキャンセル
      const allCells = document.querySelectorAll('.jewel-cell');
      allCells.forEach(cell => cell.classList.remove('selected', 'path-head'));
      this.selectedPath = [];
      return;
    }

    // 3個以上揃った！ レベル別ティア演出を実行
    this.isBoardLocked = true;
    const matchColor = this.currentDragColor;
    const tier = this.getComboTierData(matchCount);

    // 1. レベル別サウンド再生
    window.soundSystem.playJewelComboTier(matchCount);

    // 2. プリンセスキャラクターのレベル別魔法発動アニメーション
    const princess = document.getElementById('puzzle-princess-avatar');
    if (princess) {
      princess.className = `puzzle-princess-avatar ${tier.princessAnim}`;
      setTimeout(() => {
        princess.className = 'puzzle-princess-avatar';
      }, 950);
    }

    // 3. レベル別特大コンボバースト表示
    this.showComboBurstBanner(tier, matchCount);

    // 4. 盤面の揺れエフェクト
    const board = document.getElementById('puzzle-board-wrapper');
    if (board) {
      board.classList.remove('shake-lvl-1', 'shake-lvl-2', 'shake-lvl-3', 'shake-lvl-fever', 'shake-lvl-ultimate');
      board.classList.add(tier.shakeClass);
      setTimeout(() => {
        board.classList.remove(tier.shakeClass);
      }, 600);
    }

    // 5. 個数強調の浮遊スコアバッジ発生
    this.spawnFloatingScoreNumbers(matchCount, tier);

    // 6. パーティクル爆発（個数レベル比例）
    const boardRect = board.getBoundingClientRect();
    this.app.particles.explode(boardRect.left + boardRect.width / 2, boardRect.top + boardRect.height / 2, tier.particleCount);

    // 7. なぞったセルの消去アニメーション
    this.selectedPath.forEach(pt => {
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        cell.classList.add('clearing');
      }
    });

    // 8. 高レベルボーナス（周囲のジュエル巻き込み爆発）
    const bonusCells = this.resolveBonusClears(tier.bonusClears);

    // 9. お題カウント更新
    const totalCleared = matchCount + bonusCells.length;
    const mission = this.missions[this.round - 1];
    if (mission.targetType === 'any' || mission.targetType === matchColor) {
      this.remainingTarget = Math.max(0, this.remainingTarget - totalCleared);
      this.updateTargetCounter();
    }

    // 10. 音声・セリフ応援
    this.speakCheer(tier.cheerText, false);

    // 11. グリッド更新＆落下処理
    setTimeout(() => {
      this.dropJewels(bonusCells);
      this.renderGridCells();
      this.isBoardLocked = false;
      this.selectedPath = [];

      // ミッションクリアチェック
      if (this.remainingTarget <= 0) {
        this.handleMissionSuccess();
      }
    }, 600);
  }

  showComboBurstBanner(tier, count) {
    const burstLayer = document.getElementById('puzzle-combo-burst-layer');
    const burstCard = document.getElementById('combo-burst-card');
    const starsEl = document.getElementById('combo-burst-stars');
    const countEl = document.getElementById('combo-burst-count');
    const titleEl = document.getElementById('combo-burst-title');

    if (!burstLayer || !burstCard) return;

    if (starsEl) starsEl.textContent = tier.stars;
    if (countEl) {
      countEl.innerHTML = `${tier.emoji} <span class="burst-num-highlight">${count}個</span> つなぎ！`;
    }
    if (titleEl) {
      titleEl.textContent = tier.title;
    }

    burstCard.className = `combo-burst-card ${tier.badgeClass} pop-in`;
    burstLayer.classList.add('active');

    setTimeout(() => {
      burstLayer.classList.remove('active');
    }, 900);
  }

  spawnFloatingScoreNumbers(count, tier) {
    const board = document.getElementById('puzzle-board-wrapper');
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    const floatBadge = document.createElement('div');
    floatBadge.className = `floating-combo-count ${tier.badgeClass}`;
    floatBadge.innerHTML = `+${count}個!`;

    // 選択パスの中央付近に配置
    const midIdx = Math.floor(this.selectedPath.length / 2);
    const midPoint = this.selectedPath[midIdx];
    const cell = document.querySelector(`.jewel-cell[data-row="${midPoint.r}"][data-col="${midPoint.c}"]`);

    if (cell) {
      const cellRect = cell.getBoundingClientRect();
      floatBadge.style.left = `${(cellRect.left + cellRect.width / 2) - boardRect.left}px`;
      floatBadge.style.top = `${(cellRect.top + cellRect.height / 2) - boardRect.top}px`;
    } else {
      floatBadge.style.left = '50%';
      floatBadge.style.top = '50%';
    }

    board.appendChild(floatBadge);
    setTimeout(() => floatBadge.remove(), 800);
  }

  resolveBonusClears(bonusCount) {
    if (bonusCount <= 0) return [];

    const bonusCells = [];
    const unselected = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const isMatched = this.selectedPath.some(p => p.r === r && p.c === c);
        if (!isMatched) unselected.push({ r, c });
      }
    }

    unselected.sort(() => Math.random() - 0.5);
    const chosen = unselected.slice(0, bonusCount);

    chosen.forEach(pt => {
      bonusCells.push(pt);
      const cell = document.querySelector(`.jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        cell.classList.add('bonus-clearing');
      }
    });

    return bonusCells;
  }

  dropJewels(bonusCells = []) {
    // 選択セルおよびボーナス消去セルを null に
    this.selectedPath.forEach(pt => {
      this.grid[pt.r][pt.c] = null;
    });
    bonusCells.forEach(pt => {
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
