/**
 * game_hiragana_puzzle.js - ことばの まほうジュエル (Magic Word Jewel Puzzle)
 *
 * 宝石（ジュエル）をスライド＆なぞって言葉をつなぐ、新感覚ひらがな学習パズル！
 * 1. 6×6のキラキラジュエル盤面にひらがなを配置
 * 2. 指でなぞるたびに 音階チャイム ＋ 音声読み上げ（「い！」「ち！」「ご！」）
 * 3. お題の言葉が完成すると「🍓 いちご！ まほうはつどう！」と特大エフェクト＆立体召喚！
 * 4. 自由探索ボーナス（辞書内60語以上の言葉を発見すると「ひらめきボーナス！」）
 * 5. おたすけヒント（💡ボタンで最初の一文字と矢印が光る）
 * 6. 着せ替えプリンセスが横で大魔法を応援！
 */

class GameHiraganaPuzzle {
  constructor(app) {
    this.app = app;
    this.rows = 6;
    this.cols = 6;
    this.round = 0;
    this.maxRounds = 5;
    this.grid = []; // 2D array of { char, jewelType, r, c, isTarget }
    this.selectedPath = []; // array of { r, c }
    this.isDragging = false;
    this.isBoardLocked = false;
    this.currentTarget = null;
    this.targetPath = []; // coordinates where target word is placed
    this.idleTimer = null;

    // 宝石デザインの定義（6種類）
    this.jewelTypes = [
      { id: 'ruby', name: 'ルビー', color: '#ff4757', glow: '#ff7675', symbol: '❤️' },
      { id: 'sapphire', name: 'サファイア', color: '#1e90ff', glow: '#70a1ff', symbol: '💙' },
      { id: 'emerald', name: 'エメラルド', color: '#2ed573', glow: '#7bed9f', symbol: '💚' },
      { id: 'topaz', name: 'トパーズ', color: '#ffa502', glow: '#ffeaa7', symbol: '⭐' },
      { id: 'amethyst', name: 'アメジスト', color: '#9b59b6', glow: '#e0c3fc', symbol: '💜' },
      { id: 'diamond', name: 'ダイヤモンド', color: '#00d2d3', glow: '#ffffff', symbol: '🤍' }
    ];

    // ラウンド別お題リスト（5ラウンド・各難易度進行）
    this.stageTargets = [
      // Stage 1: かわいい どうぶつ（2文字）
      [
        { word: 'ねこ', emoji: '🐱', hint: 'ニャーと なく かわいい どうぶつ' },
        { word: 'いぬ', emoji: '🐶', hint: 'ワンワンと なく げんきな おともだち' },
        { word: 'あめ', emoji: '🍬', hint: 'あまくて おいしい おかし' },
        { word: 'ほし', emoji: '⭐', hint: 'よるの そらで ピカピカ ひかるよ' },
        { word: 'とり', emoji: '🐦', hint: 'おそらを パタパタ とぶよ' }
      ],
      // Stage 2: おいしい たべもの（2〜3文字）
      [
        { word: 'いちご', emoji: '🍓', hint: 'あまくて まっかな くだもの' },
        { word: 'あいす', emoji: '🍦', hint: 'つめたくて おいしい デザート' },
        { word: 'くるま', emoji: '🚗', hint: 'ぶーん！ ドライブに しゅっぱつ' },
        { word: 'ぱんだ', emoji: '🐼', hint: 'しろくろ もようの かわいい人気もの' },
        { word: 'すいか', emoji: '🍉', hint: 'なつに たべる しましま くだもの' }
      ],
      // Stage 3: のりもの ＆ いきもの（3文字）
      [
        { word: 'うさぎ', emoji: '🐰', hint: 'ながい おみみで ぴょんぴょん はねるよ' },
        { word: 'りんご', emoji: '🍎', hint: 'シャキッと おいしい あかい くだもの' },
        { word: 'ばなな', emoji: '🍌', hint: 'きいろくて あまい おやつ' },
        { word: 'きりん', emoji: '🦒', hint: 'くびが とっても ながーい どうぶつ' },
        { word: 'ひこうき', emoji: '✈️', hint: 'くもの うえを ビュンと とぶよ' }
      ],
      // Stage 4: すてきな もの（3〜4文字）
      [
        { word: 'ひまわり', emoji: '🌻', hint: 'たいように むかって さく きいろい はな' },
        { word: 'けーき', emoji: '🍰', hint: 'おたんじょうびの あまーい ごちそう' },
        { word: 'ぶどう', emoji: '🍇', hint: 'つぶつぶ むらさきの おいしい くだもの' },
        { word: 'たいよう', emoji: '☀️', hint: 'あさから ポカポカ てらす おひさま' },
        { word: 'にじいろ', emoji: '🌈', hint: 'あめあがりの そらに かかる 7しょくの はし' }
      ],
      // Stage 5: まほうの プリンセス（4〜5文字 - 大魔法！）
      [
        { word: 'ぷりんせす', emoji: '👑', hint: 'キラキラ ドレスの すてきなおひめさま' },
        { word: 'ちょうちょ', emoji: '🦋', hint: 'おはなから おはなへ ひらひら まうよ' },
        { word: 'てぃあら', emoji: '💎', hint: 'あたまの うえで ひかる まほうの かんむり' },
        { word: 'ゆにこーん', emoji: '🦄', hint: 'ツノを もった まほうの しろい おうまさん' },
        { word: 'きらきら', emoji: '✨', hint: 'ジュエルの まほうが はじけるよ！' }
      ]
    ];

    // 自由探索ボーナス辞書（60語以上）
    this.bonusDictionary = new Set([
      'ねこ', 'いぬ', 'くま', 'とり', 'さる', 'うし', 'うま', 'ぶた', 'しか',
      'あり', 'はち', 'かに', 'かめ', 'えび', 'たこ', 'いか', 'さめ',
      'うみ', 'そら', 'ほし', 'つき', 'あめ', 'ゆき', 'はな', 'き', 'くも',
      'いちご', 'りんご', 'みかん', 'ぶどう', 'すいか', 'もも', 'くり', 'かき', 'ばなな', 'めろん',
      'あいす', 'けーき', 'ぱん', 'おちゃ', 'みず', 'たまご', 'ごはん',
      'くるま', 'ばす', 'ふね', 'ひこうき', 'ろけっと', 'でんしゃ',
      'うさぎ', 'ぱんだ', 'きりん', 'ぞう', 'とら', 'こあら', 'ぺんぎん',
      'ひまわり', 'さくら', 'ちゅーりっぷ', 'ちょうちょ', 'とんぼ',
      'にじ', 'たいよう', 'ぷりんせす', 'てぃあら', 'まほう', 'ゆにこーん',
      'ほうせき', 'るびー', 'だいや', 'きらきら', 'えがお', 'ともだち'
    ]);

    // ダミー・ランダム用ひらがなプール
    this.randomHiragana = [
      'あ', 'い', 'う', 'え', 'お',
      'か', 'き', 'く', 'け', 'こ',
      'さ', 'し', 'す', 'せ', 'そ',
      'た', 'ち', 'つ', 'て', 'と',
      'な', 'に', 'ぬ', 'ね', 'の',
      'は', 'ひ', 'ふ', 'へ', 'ほ',
      'ま', 'み', 'む', 'め', 'も',
      'や', 'ゆ', 'よ',
      'ら', 'り', 'る', 'れ', 'ろ',
      'わ', 'を', 'ん',
      'が', 'ぎ', 'ぐ', 'げ', 'ご',
      'だ', 'ぢ', 'づ', 'で', 'ど',
      'ば', 'び', 'ぶ', 'べ', 'ぼ',
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-hiragana-puzzle');
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
      <div class="puzzle-game-layout hiragana-puzzle-layout">
        <!-- 上部：お題表示 ＆ おたすけボタン -->
        <div class="hiragana-puzzle-header">
          <div class="hiragana-target-banner" id="hiragana-target-banner">
            <span class="target-round-badge" id="hiragana-round-badge">ステージ 1/5</span>
            <div class="target-word-display" id="hiragana-target-word-display">
              <!-- スロットを動的に描画 -->
            </div>
          </div>
          <button class="hiragana-hint-btn" id="hiragana-hint-btn" title="ヒントをみる">
            <span class="hint-icon">💡</span>
            <span class="hint-label">おたすけ</span>
          </button>
        </div>

        <!-- メイン：プリンセスサポーター ＆ パズル盤面 -->
        <div class="puzzle-main-stage">
          <!-- 左側：プリンセスサポーター -->
          <div class="puzzle-supporter-box">
            <div class="puzzle-princess-avatar" id="hiragana-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
            <div class="princess-cheer-bubble" id="hiragana-cheer-bubble">
              <span id="hiragana-cheer-text">ことばを なぞってね！✨</span>
            </div>
          </div>

          <!-- 右側：ジュエル盤面 -->
          <div class="puzzle-board-wrapper" id="hiragana-board-wrapper">
            <svg class="puzzle-trace-svg" id="hiragana-trace-svg"></svg>
            <div class="puzzle-grid-matrix" id="hiragana-grid-matrix"></div>

            <!-- なぞり中のリアルタイム言葉バッジ -->
            <div class="hiragana-drag-word-badge" id="hiragana-drag-word-badge"></div>

            <!-- 言葉完成・特大魔法演出レイヤー -->
            <div class="puzzle-combo-burst-layer" id="hiragana-combo-burst-layer">
              <div class="combo-burst-card word-burst-card" id="hiragana-burst-card">
                <div class="combo-burst-stars" id="hiragana-burst-stars">⭐⭐⭐⭐⭐</div>
                <div class="word-burst-emoji" id="hiragana-burst-emoji">🍓</div>
                <div class="combo-burst-title" id="hiragana-burst-title">いちご！</div>
                <div class="word-burst-subtitle" id="hiragana-burst-sub">✨ まほうはつどう！ ✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // おたすけボタンのイベント
    const hintBtn = document.getElementById('hiragana-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint(true));
    }

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

    // お題の選定
    const candidates = this.stageTargets[this.round - 1] || this.stageTargets[0];
    this.currentTarget = candidates[Math.floor(Math.random() * candidates.length)];

    // ラウンドバッジ更新
    const roundBadge = document.getElementById('hiragana-round-badge');
    if (roundBadge) {
      roundBadge.textContent = `ステージ ${this.round}/${this.maxRounds}`;
    }

    // お題スロット描画
    this.renderTargetWordSlots();

    // 盤面グリッド生成（ターゲット単語を必ず隣接配置）
    this.generateBoardWithTarget(this.currentTarget.word);
    this.renderGridCells();

    // プリンセスのセリフとお知らせ
    this.speakCheer(`「${this.currentTarget.word}」を なぞってみてね！`, true);
    this.speakWordSynthesis(this.currentTarget.word);

    // アイドル時の自動ヒントタイマー設定
    this.resetIdleTimer();
  }

  renderTargetWordSlots() {
    const displayEl = document.getElementById('hiragana-target-word-display');
    if (!displayEl || !this.currentTarget) return;

    const chars = this.currentTarget.word.split('');
    let html = `<div class="target-word-slots">`;
    chars.forEach((ch, idx) => {
      html += `<div class="target-char-slot" id="target-slot-${idx}">${ch}</div>`;
    });
    html += `</div>`;
    html += `<span class="target-emoji-icon">${this.currentTarget.emoji}</span>`;

    displayEl.innerHTML = html;
  }

  generateBoardWithTarget(word) {
    // 6×6の空盤面初期化
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

    // 単語の隣接パスを探索して配置
    const path = this.findRandomContinuousPath(word.length);
    this.targetPath = path;

    const wordChars = word.split('');
    path.forEach((pos, idx) => {
      const jewelType = this.jewelTypes[idx % this.jewelTypes.length];
      this.grid[pos.r][pos.c] = {
        char: wordChars[idx],
        jewelType,
        r: pos.r,
        c: pos.c,
        isTarget: true,
        targetIndex: idx
      };
    });

    // 残りのマスを楽しいひらがなと宝石で埋める
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.grid[r][c]) {
          const randChar = this.randomHiragana[Math.floor(Math.random() * this.randomHiragana.length)];
          const randType = this.jewelTypes[Math.floor(Math.random() * this.jewelTypes.length)];
          this.grid[r][c] = {
            char: randChar,
            jewelType: randType,
            r,
            c,
            isTarget: false,
            targetIndex: -1
          };
        }
      }
    }
  }

  findRandomContinuousPath(length) {
    const visited = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));

    // ランダムなスタート位置
    const startR = Math.floor(Math.random() * this.rows);
    const startC = Math.floor(Math.random() * this.cols);

    const path = [];

    const dfs = (r, c, depth) => {
      path.push({ r, c });
      visited[r][c] = true;

      if (depth === length) return true;

      // 8方向の移動（縦・横・斜め）をシャッフル
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ].sort(() => Math.random() - 0.5);

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !visited[nr][nc]) {
          if (dfs(nr, nc, depth + 1)) return true;
        }
      }

      visited[r][c] = false;
      path.pop();
      return false;
    };

    if (dfs(startR, startC, 1)) {
      return path;
    }

    // もし万が一見つからなければ確実な蛇行パスを返す
    const fallbackPath = [];
    let curR = 1;
    let curC = 1;
    for (let i = 0; i < length; i++) {
      fallbackPath.push({ r: curR, c: curC + i });
    }
    return fallbackPath;
  }

  renderGridCells() {
    const matrixEl = document.getElementById('hiragana-grid-matrix');
    if (!matrixEl) return;
    matrixEl.innerHTML = '';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cellData = this.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'jewel-cell hiragana-jewel-cell pop-in';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;
        cellEl.style.setProperty('--jewel-color', cellData.jewelType.color);
        cellEl.style.setProperty('--jewel-glow', cellData.jewelType.glow);

        cellEl.innerHTML = `
          <div class="jewel-gem-body" style="background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${cellData.jewelType.glow} 30%, ${cellData.jewelType.color} 80%, rgba(0,0,0,0.3) 100%);">
            <span class="jewel-char">${cellData.char}</span>
          </div>
        `;

        matrixEl.appendChild(cellEl);
      }
    }
  }

  initBoardEvents() {
    const board = document.getElementById('hiragana-board-wrapper');
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
      this.clearHintEffects();
      this.resetIdleTimer();

      const pt = e.touches ? e.touches[0] : e;
      const hit = getCellFromPoint(pt.clientX, pt.clientY);
      if (!hit) return;

      this.isDragging = true;
      this.selectedPath = [hit];

      const firstChar = this.grid[hit.r][hit.c].char;
      window.soundSystem.playJewelTone(0);
      this.speakCharSynthesis(firstChar);

      this.updateSelectionVisuals();
    };

    const onMove = (e) => {
      if (!this.isDragging || this.isBoardLocked) return;
      this.resetIdleTimer();

      const pt = e.touches ? e.touches[0] : e;
      const hit = getCellFromPoint(pt.clientX, pt.clientY);
      if (!hit) return;

      const last = this.selectedPath[this.selectedPath.length - 1];
      if (hit.r === last.r && hit.c === last.c) return;

      // 1つ手前のマスに戻ったら取り消し（戻る操作）
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

      // 隣接チェック（縦・横・斜め1マス以内）
      const dr = Math.abs(hit.r - last.r);
      const dc = Math.abs(hit.c - last.c);
      if (dr <= 1 && dc <= 1) {
        this.selectedPath.push(hit);

        const newChar = this.grid[hit.r][hit.c].char;
        window.soundSystem.playJewelTone(this.selectedPath.length - 1);
        this.speakCharSynthesis(newChar);

        this.updateSelectionVisuals();
      }
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.handleMatchResolution();
      this.resetIdleTimer();
    };

    board.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    board.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  updateSelectionVisuals() {
    const allCells = document.querySelectorAll('.hiragana-jewel-cell');
    allCells.forEach(cell => cell.classList.remove('selected', 'path-head'));

    const count = this.selectedPath.length;

    // 現在なぞっている単語文字列
    const currentWord = this.selectedPath.map(pt => this.grid[pt.r][pt.c].char).join('');

    this.selectedPath.forEach((pt, idx) => {
      const cell = document.querySelector(`.hiragana-jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) {
        cell.classList.add('selected');
        if (idx === count - 1) cell.classList.add('path-head');
      }
    });

    // お題スロットのリアルタイムハイライト
    this.updateTargetSlotHighlight(currentWord);

    // なぞり中のリアルタイム言葉バッジ表示
    const badge = document.getElementById('hiragana-drag-word-badge');
    const board = document.getElementById('hiragana-board-wrapper');

    if (badge && board && count > 0) {
      const last = this.selectedPath[count - 1];
      const headCell = document.querySelector(`.hiragana-jewel-cell[data-row="${last.r}"][data-col="${last.c}"]`);
      if (headCell) {
        const boardRect = board.getBoundingClientRect();
        const cellRect = headCell.getBoundingClientRect();
        const posX = (cellRect.left + cellRect.width / 2) - boardRect.left;
        const posY = cellRect.top - boardRect.top - 20;

        badge.style.left = `${posX}px`;
        badge.style.top = `${posY}px`;

        const isTargetMatch = (currentWord === this.currentTarget.word);
        const isBonusMatch = this.bonusDictionary.has(currentWord);

        if (isTargetMatch) {
          badge.className = 'hiragana-drag-word-badge show target-match-badge';
          badge.innerHTML = `✨ <strong>${currentWord}</strong> ${this.currentTarget.emoji} ✨`;
        } else if (isBonusMatch) {
          badge.className = 'hiragana-drag-word-badge show bonus-match-badge';
          badge.innerHTML = `💡 <strong>${currentWord}</strong> はっけん！`;
        } else {
          badge.className = 'hiragana-drag-word-badge show';
          badge.innerHTML = `🪄 <strong>${currentWord}</strong>`;
        }
      }
    } else if (badge) {
      badge.classList.remove('show');
    }

    // SVGライン描画
    this.drawTraceLine();
  }

  updateTargetSlotHighlight(currentWord) {
    if (!this.currentTarget) return;
    const targetWord = this.currentTarget.word;

    for (let i = 0; i < targetWord.length; i++) {
      const slot = document.getElementById(`target-slot-${i}`);
      if (!slot) continue;

      if (i < currentWord.length && currentWord[i] === targetWord[i]) {
        slot.classList.add('active-matching');
      } else {
        slot.classList.remove('active-matching');
      }
    }
  }

  drawTraceLine() {
    const svg = document.getElementById('hiragana-trace-svg');
    const board = document.getElementById('hiragana-board-wrapper');
    if (!svg || !board) return;

    if (this.selectedPath.length < 2) {
      svg.innerHTML = '';
      return;
    }

    const boardRect = board.getBoundingClientRect();
    let pathD = '';

    this.selectedPath.forEach((pt, idx) => {
      const cell = document.querySelector(`.hiragana-jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) - boardRect.left;
      const y = (rect.top + rect.height / 2) - boardRect.top;

      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    svg.innerHTML = `
      <path d="${pathD}" stroke="#ff6b81" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" filter="drop-shadow(0 0 10px #ff7675)"/>
      <path d="${pathD}" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
  }

  handleMatchResolution() {
    const svg = document.getElementById('hiragana-trace-svg');
    if (svg) svg.innerHTML = '';

    const badge = document.getElementById('hiragana-drag-word-badge');
    if (badge) badge.classList.remove('show');

    const formedWord = this.selectedPath.map(pt => this.grid[pt.r][pt.c].char).join('');

    // 1. お題と完全一致した場合（大魔法発動！）
    if (this.currentTarget && formedWord === this.currentTarget.word) {
      this.handleTargetWordSuccess(formedWord);
      return;
    }

    // 2. お題以外で辞書にある言葉をなぞった場合（ひらめきボーナス！）
    if (this.bonusDictionary.has(formedWord) && formedWord.length >= 2) {
      this.handleBonusWordSuccess(formedWord);
      return;
    }

    // 不一致の場合はキャンセル
    const allCells = document.querySelectorAll('.hiragana-jewel-cell');
    allCells.forEach(cell => cell.classList.remove('selected', 'path-head'));
    this.updateTargetSlotHighlight('');
    this.selectedPath = [];
  }

  handleTargetWordSuccess(word) {
    this.isBoardLocked = true;
    this.clearHintEffects();

    // 1. 音声と大魔法サウンド
    window.soundSystem.playFeverBurst();
    this.speakWordSynthesis(`${word}！ まほうはつどう！`);

    // 2. プリンセスの大魔法アニメーション
    const princess = document.getElementById('hiragana-princess-avatar');
    if (princess) {
      princess.className = 'puzzle-princess-avatar spell-fever';
      setTimeout(() => {
        princess.className = 'puzzle-princess-avatar';
      }, 1200);
    }

    // 3. 特大召喚演出モーダル表示
    this.showMagicBurstModal(word, this.currentTarget.emoji, '✨ まほうはつどう！ ✨', true);

    // 4. パーティクル爆発
    const board = document.getElementById('hiragana-board-wrapper');
    if (board) {
      const rect = board.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
      board.classList.add('shake-lvl-fever');
      setTimeout(() => board.classList.remove('shake-lvl-fever'), 600);
    }

    // 5. お題スロットを全完了アニメーション
    const targetWord = this.currentTarget.word;
    for (let i = 0; i < targetWord.length; i++) {
      const slot = document.getElementById(`target-slot-${i}`);
      if (slot) slot.classList.add('slot-completed');
    }

    // 6. なぞったセルの消去アニメーション
    this.selectedPath.forEach(pt => {
      const cell = document.querySelector(`.hiragana-jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) cell.classList.add('clearing');
    });

    // 7. プリンセスのセリフ応援
    this.speakCheer(`大魔法せいこう！ 「${word}」が できたよ！ 💖`, false);

    // 8. 落下・補充と次ラウンド進行
    setTimeout(() => {
      this.dropJewels(this.selectedPath);
      this.renderGridCells();
      this.selectedPath = [];

      setTimeout(() => {
        this.nextRound();
      }, 900);
    }, 700);
  }

  handleBonusWordSuccess(word) {
    this.isBoardLocked = true;
    this.clearHintEffects();

    // ひらめきボーナス音
    window.soundSystem.playMagicChime();
    window.soundSystem.playFanfare();
    this.speakWordSynthesis(`ひらめき！ ${word}！`);

    // プリンセスの喜び演出
    const princess = document.getElementById('hiragana-princess-avatar');
    if (princess) {
      princess.className = 'puzzle-princess-avatar spell-medium';
      setTimeout(() => {
        princess.className = 'puzzle-princess-avatar';
      }, 900);
    }

    // ひらめきモーダル
    this.showMagicBurstModal(word, '💡', '🌟 ひらめきボーナス！ 🌟', false);

    // パーティクル
    const board = document.getElementById('hiragana-board-wrapper');
    if (board) {
      const rect = board.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    }

    // セルの消去アニメーション
    this.selectedPath.forEach(pt => {
      const cell = document.querySelector(`.hiragana-jewel-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
      if (cell) cell.classList.add('bonus-clearing');
    });

    this.speakCheer(`すごい！ 「${word}」を 発見したね！ ✨`, false);

    // 盤面補充
    setTimeout(() => {
      this.dropJewels(this.selectedPath);
      this.renderGridCells();
      this.isBoardLocked = false;
      this.selectedPath = [];
      this.updateSelectionVisuals();
    }, 700);
  }

  showMagicBurstModal(word, emoji, subtitle, isGrand) {
    const burstLayer = document.getElementById('hiragana-combo-burst-layer');
    const burstCard = document.getElementById('hiragana-burst-card');
    const starsEl = document.getElementById('hiragana-burst-stars');
    const emojiEl = document.getElementById('hiragana-burst-emoji');
    const titleEl = document.getElementById('hiragana-burst-title');
    const subEl = document.getElementById('hiragana-burst-sub');

    if (!burstLayer || !burstCard) return;

    if (starsEl) starsEl.textContent = isGrand ? '👑⭐⭐⭐⭐⭐' : '⭐⭐⭐';
    if (emojiEl) emojiEl.textContent = emoji;
    if (titleEl) titleEl.textContent = `${word}！`;
    if (subEl) subEl.textContent = subtitle;

    burstCard.className = `combo-burst-card word-burst-card ${isGrand ? 'tier-lvl-8' : 'tier-lvl-3'} pop-in`;
    burstLayer.classList.add('active');

    setTimeout(() => {
      burstLayer.classList.remove('active');
    }, isGrand ? 1200 : 900);
  }

  dropJewels(clearedCells) {
    // 列ごとに空いたマスを詰めて、上から新ジュエルを降らせる
    for (let c = 0; c < this.cols; c++) {
      const colClearedRows = clearedCells.filter(pt => pt.c === c).map(pt => pt.r);
      if (colClearedRows.length === 0) continue;

      const surviving = [];
      for (let r = this.rows - 1; r >= 0; r--) {
        if (!colClearedRows.includes(r)) {
          surviving.push(this.grid[r][c]);
        }
      }

      // 下から詰める
      let fillRow = this.rows - 1;
      surviving.forEach(jewel => {
        jewel.r = fillRow;
        this.grid[fillRow][c] = jewel;
        fillRow--;
      });

      // 残りの上のマスに新しいジュエルを生成
      while (fillRow >= 0) {
        const randChar = this.randomHiragana[Math.floor(Math.random() * this.randomHiragana.length)];
        const randType = this.jewelTypes[Math.floor(Math.random() * this.jewelTypes.length)];
        this.grid[fillRow][c] = {
          char: randChar,
          jewelType: randType,
          r: fillRow,
          c,
          isTarget: false,
          targetIndex: -1
        };
        fillRow--;
      }
    }
  }

  showHint(isUserClicked = false) {
    if (this.isBoardLocked || !this.currentTarget) return;

    this.clearHintEffects();

    // ターゲット単語の配置パス（または現存する配置）を探索
    let hintPath = [];
    if (this.targetPath && this.targetPath.length > 0) {
      // 盤面上のターゲットセルを検証
      const isValid = this.targetPath.every((pt, idx) => {
        return this.grid[pt.r] && this.grid[pt.r][pt.c] && this.grid[pt.r][pt.c].char === this.currentTarget.word[idx];
      });
      if (isValid) {
        hintPath = this.targetPath;
      }
    }

    if (hintPath.length === 0) {
      // 盤面を再探索して単語パスを特定
      hintPath = this.searchWordOnGrid(this.currentTarget.word);
    }

    if (hintPath.length > 0) {
      const firstCell = hintPath[0];
      const cellEl = document.querySelector(`.hiragana-jewel-cell[data-row="${firstCell.r}"][data-col="${firstCell.c}"]`);
      if (cellEl) {
        cellEl.classList.add('hint-pulse');
      }

      // 次の文字までの軌跡をキラキラ光らせる
      if (hintPath.length > 1) {
        const secondCell = hintPath[1];
        const secondEl = document.querySelector(`.hiragana-jewel-cell[data-row="${secondCell.r}"][data-col="${secondCell.c}"]`);
        if (secondEl) {
          setTimeout(() => secondEl.classList.add('hint-pulse'), 250);
        }
      }

      const firstChar = this.currentTarget.word[0];
      this.speakCheer(`「${firstChar}」から はじまるよ！ さがしてみてね✨`, true);
      this.speakWordSynthesis(`「${firstChar}」から はじまるよ！`);
    } else {
      this.speakCheer(`「${this.currentTarget.word}」を さがそう！`, true);
    }
  }

  searchWordOnGrid(word) {
    const chars = word.split('');
    const len = chars.length;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].char === chars[0]) {
          const visited = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
          const path = [];

          const dfs = (cr, cc, depth) => {
            path.push({ r: cr, c: cc });
            visited[cr][cc] = true;

            if (depth === len) return true;

            const dirs = [
              [-1, -1], [-1, 0], [-1, 1],
              [0, -1],           [0, 1],
              [1, -1],  [1, 0],  [1, 1]
            ];

            for (const [dr, dc] of dirs) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !visited[nr][nc]) {
                if (this.grid[nr][nc].char === chars[depth]) {
                  if (dfs(nr, nc, depth + 1)) return true;
                }
              }
            }

            visited[cr][cc] = false;
            path.pop();
            return false;
          };

          if (dfs(r, c, 1)) return path;
        }
      }
    }
    return [];
  }

  clearHintEffects() {
    const hintedCells = document.querySelectorAll('.hiragana-jewel-cell.hint-pulse');
    hintedCells.forEach(el => el.classList.remove('hint-pulse'));
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    // 6秒操作がなければやさしくヒントを提示
    this.idleTimer = setTimeout(() => {
      if (!this.isDragging && !this.isBoardLocked) {
        this.showHint(false);
      }
    }, 6000);
  }

  speakCheer(text, sparkle = false) {
    const cheerEl = document.getElementById('hiragana-cheer-text');
    const bubbleEl = document.getElementById('hiragana-cheer-bubble');
    if (cheerEl) cheerEl.textContent = text;
    if (bubbleEl) {
      bubbleEl.classList.add('pop-in');
      setTimeout(() => bubbleEl.classList.remove('pop-in'), 400);
    }
    if (sparkle) window.soundSystem.playSparkle();
  }

  speakCharSynthesis(char) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(char);
        utter.lang = 'ja-JP';
        utter.rate = 1.25;
        utter.pitch = 1.35;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  speakWordSynthesis(phrase) {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.lang = 'ja-JP';
        utter.rate = 1.05;
        utter.pitch = 1.25;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  handleGameComplete() {
    this.app.updateStamps(this.maxRounds, this.maxRounds);
    window.soundSystem.playFanfare();
    this.speakWordSynthesis('おめでとう！ ぜんぶの ことばの まほうが かんせいしたよ！');

    const modal = document.getElementById('complete-modal');
    if (modal) {
      modal.classList.add('show');
    }
  }
}
