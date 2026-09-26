/**
 * game_shiritori_rhythm.js - しりとリズム シアター (Shirito-Rhythm Theater)
 * 
 * 【知育のねらい】：
 * 50音の概念がまだない幼児・子どもたちが、
 * 「ことばは一文字ずつの音の集まりであること」「前の文字と次の文字が同じ音・形で繋がること」を、
 * 聴覚（リズム・音声）と視覚（文字ブロックのポップ＆繋ぎ文字モーフィング）で直感的に楽しく学べるシアター。
 * 
 * 『シナぷしゅ』「しりとリズムジカ」の世界観を取り入れた、やさしい絵本・切り絵風アートスタイル。
 */

class GameShiritoriRhythm {
  constructor(app) {
    this.app = app;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.stepTimerId = null;
    this.phaseTimeouts = [];
    this.speedMultiplier = 1.0;
    this.synthBgmActive = false;
    this.audioIntervalId = null;

    // 連続20個のしりとりデータ定義（全単語ひらがな＆繋ぎ文字を完全一致）
    this.chain = [
      {
        index: 1,
        word: 'りんご',
        chars: ['り', 'ん', 'ご'],
        jointTail: 'ご',
        jointHead: null,
        themeBg: '#fff0f3',
        themeBorder: '#ff6b81',
        themeAccent: '#ff4757',
        desc: 'あまくて おいしい まっかなりんご🍎',
        svg: () => this.getRingoSvg()
      },
      {
        index: 2,
        word: 'ごりら',
        chars: ['ご', 'り', 'ら'],
        jointTail: 'ら',
        jointHead: 'ご',
        themeBg: '#f1f2f6',
        themeBorder: '#747d8c',
        themeAccent: '#2f3542',
        desc: 'むねを ポコポコ♪ つよいぞ ごりら🦍',
        svg: () => this.getGorillaSvg()
      },
      {
        index: 3,
        word: 'らっぱ',
        chars: ['ら', 'っ', 'ぱ'],
        jointTail: 'ぱ',
        jointHead: 'ら',
        themeBg: '#fff9db',
        themeBorder: '#f1c40f',
        themeAccent: '#e67e22',
        desc: 'パッパラパー♪ ごきげんな おと🎺',
        svg: () => this.getRappaSvg()
      },
      {
        index: 4,
        word: 'ぱんつ',
        chars: ['ぱ', 'ん', 'つ'],
        jointTail: 'つ',
        jointHead: 'ぱ',
        themeBg: '#e7f5ff',
        themeBorder: '#70a1ff',
        themeAccent: '#1e90ff',
        desc: 'みずたまもようの かわいいぱんつ🩲',
        svg: () => this.getPantsuSvg()
      },
      {
        index: 5,
        word: 'つばめ',
        chars: ['つ', 'ば', 'め'],
        jointTail: 'め',
        jointHead: 'つ',
        themeBg: '#edf2ff',
        themeBorder: '#5352ed',
        themeAccent: '#3742fa',
        desc: 'すいすい おそらをとぶ つばめさん🕊️',
        svg: () => this.getTsubameSvg()
      },
      {
        index: 6,
        word: 'めがね',
        chars: ['め', 'が', 'ね'],
        jointTail: 'ね',
        jointHead: 'め',
        themeBg: '#fff0f6',
        themeBorder: '#ff9ff3',
        themeAccent: '#f368e0',
        desc: 'かけると よくみえる まんまるめがね👓',
        svg: () => this.getMeganeSvg()
      },
      {
        index: 7,
        word: 'ねこ',
        chars: ['ね', 'こ'],
        jointTail: 'こ',
        jointHead: 'ね',
        themeBg: '#fff4e6',
        themeBorder: '#ff9f43',
        themeAccent: '#ee5253',
        desc: 'ニャーゴ♪ ひなたぼっこ だいすきねこ🐱',
        svg: () => this.getNekoSvg()
      },
      {
        index: 8,
        word: 'こあら',
        chars: ['こ', 'あ', 'ら'],
        jointTail: 'ら',
        jointHead: 'こ',
        themeBg: '#ebfbee',
        themeBorder: '#2ed573',
        themeAccent: '#10ac84',
        desc: 'ユーカリの きに ぎゅっ！ こあら🐨',
        svg: () => this.getKoaraSvg()
      },
      {
        index: 9,
        word: 'らじお',
        chars: ['ら', 'じ', 'お'],
        jointTail: 'お',
        jointHead: 'ら',
        themeBg: '#e3fafc',
        themeBorder: '#00d2d3',
        themeAccent: '#01a3a4',
        desc: 'たのしい おんがくが ながれるらじお📻',
        svg: () => this.getRajioSvg()
      },
      {
        index: 10,
        word: 'おしり',
        chars: ['お', 'し', 'り'],
        jointTail: 'り',
        jointHead: 'お',
        themeBg: '#ffe3e3',
        themeBorder: '#ff6b81',
        themeAccent: '#ff4757',
        desc: 'ぷりぷり ダンス♪ かわいいおしり🍑',
        svg: () => this.getOshiriSvg()
      },
      {
        index: 11,
        word: 'りす',
        chars: ['り', 'す'],
        jointTail: 'す',
        jointHead: 'り',
        themeBg: '#fff3bf',
        themeBorder: '#feca57',
        themeAccent: '#ff9f43',
        desc: 'どんぐり カリカリ！ ふさふさりす🐿️',
        svg: () => this.getRisuSvg()
      },
      {
        index: 12,
        word: 'すいか',
        chars: ['す', 'い', 'か'],
        jointTail: 'か',
        jointHead: 'す',
        themeBg: '#ebfbee',
        themeBorder: '#2ed573',
        themeAccent: '#ff4757',
        desc: 'しましま みずみずしい なつのすいか🍉',
        svg: () => this.getSuikaSvg()
      },
      {
        index: 13,
        word: 'からす',
        chars: ['か', 'ら', 'す'],
        jointTail: 'す',
        jointHead: 'か',
        themeBg: '#f8f9fa',
        themeBorder: '#57606f',
        themeAccent: '#2f3542',
        desc: 'カァーカァー！ かしこい からすさん🐦‍⬛',
        svg: () => this.getKarasuSvg()
      },
      {
        index: 14,
        word: 'すず',
        chars: ['す', 'ず'],
        jointTail: 'ず',
        jointHead: 'す',
        themeBg: '#fff9db',
        themeBorder: '#f1c40f',
        themeAccent: '#e67e22',
        desc: 'チリンチリン♪ きれいな おとのすず🔔',
        svg: () => this.getSuzuSvg()
      },
      {
        index: 15,
        word: 'ずわいがに',
        chars: ['ず', 'わ', 'い', 'が', 'に'],
        jointTail: 'に',
        jointHead: 'ず',
        themeBg: '#ffe8cc',
        themeBorder: '#ff7f50',
        themeAccent: '#ff4757',
        desc: 'チョキチョキ！ ながーい あしのカニ🦀',
        svg: () => this.getZuwaiganiSvg()
      },
      {
        index: 16,
        word: 'にちようび',
        chars: ['に', 'ち', 'よ', 'う', 'び'],
        jointTail: 'び',
        jointHead: 'に',
        themeBg: '#fff0f6',
        themeBorder: '#ff9ff3',
        themeAccent: '#ff4757',
        desc: 'ぽかぽか おでかけ！ にちようび☀️',
        svg: () => this.getNichiyoubiSvg()
      },
      {
        index: 17,
        word: 'びーる',
        chars: ['び', 'ー', 'る'],
        jointTail: 'る',
        jointHead: 'び',
        themeBg: '#fff9db',
        themeBorder: '#feca57',
        themeAccent: '#ff9f43',
        desc: 'あわあわ シュワシュワ！ きんいろドリンク🍺',
        svg: () => this.getBiruSvg()
      },
      {
        index: 18,
        word: 'るーと',
        chars: ['る', 'ー', 'と'],
        jointTail: 'と',
        jointHead: 'る',
        themeBg: '#e6fcf5',
        themeBorder: '#1dd1a1',
        themeAccent: '#10ac84',
        desc: 'てくてく すすもう！ たのしいルート🗺️',
        svg: () => this.getRutoSvg()
      },
      {
        index: 19,
        word: 'とらいあんぐる',
        chars: ['と', 'ら', 'い', 'あ', 'ん', 'ぐ', 'る'],
        jointTail: 'る',
        jointHead: 'と',
        themeBg: '#f3f0ff',
        themeBorder: '#a29bfe',
        themeAccent: '#6c5ce7',
        desc: 'チーン♪ さんかくの がっき トライアングル🔺',
        svg: () => this.getToraianguruSvg()
      },
      {
        index: 20,
        word: 'るーれっと',
        chars: ['る', 'ー', 'れ', 'っ', 'と'],
        jointTail: 'と',
        jointHead: 'る',
        themeBg: '#fff3bf',
        themeBorder: '#ff6b6b',
        themeAccent: '#2ed573',
        desc: 'くるくる まわるよ！ にじいろルーレット🎡',
        svg: () => this.getRurettoSvg()
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-shiritori-rhythm');
  }

  start() {
    this.containerEl = document.getElementById('view-game-shiritori-rhythm');
    this.currentIndex = 0;
    this.isPlaying = true;
    this.app.updateStamps(1, this.chain.length);

    this.renderStage();
    this.startRhythmBgm();
    this.playStep(0);
  }

  stop() {
    this.isPlaying = false;
    this.clearAllTimeouts();
    this.stopRhythmBgm();
  }

  clearAllTimeouts() {
    if (this.stepTimerId) {
      clearTimeout(this.stepTimerId);
      this.stepTimerId = null;
    }
    this.phaseTimeouts.forEach(t => clearTimeout(t));
    this.phaseTimeouts = [];
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="rhythm-theater-root" id="rhythm-theater-root">
        
        <!-- 背景のやさしいオーガニック装飾（シナぷしゅ風パステルブロブ） -->
        <div class="rhythm-bg-decorations">
          <div class="decor-blob blob-1"></div>
          <div class="decor-blob blob-2"></div>
          <div class="decor-blob blob-3"></div>
          <div class="decor-note note-1">♪</div>
          <div class="decor-note note-2">♫</div>
          <div class="decor-note note-3">♩</div>
          <div class="decor-star star-1">⭐</div>
          <div class="decor-star star-2">✨</div>
        </div>

        <!-- 上部ヘッダー：タイトル＆操作ボタン -->
        <header class="rhythm-top-bar">
          <div class="rhythm-title-pill">
            <span class="pill-icon">🎵</span>
            <span class="pill-text">しりとリズム シアター</span>
            <span class="pill-badge">50おん つながり</span>
          </div>

          <div class="rhythm-controls-group">
            <button class="rhythm-ctrl-btn" id="rhythm-prev-btn" title="まえへ">⏮️</button>
            <button class="rhythm-ctrl-btn play-toggle-btn" id="rhythm-play-btn" title="さいせい / いちじていし">⏸️</button>
            <button class="rhythm-ctrl-btn" id="rhythm-next-btn" title="つぎへ">⏭️</button>
            
            <div class="rhythm-speed-picker">
              <button class="speed-btn" data-speed="0.75" id="speed-slow">ゆっくり</button>
              <button class="speed-btn active" data-speed="1.0" id="speed-normal">ふつう</button>
              <button class="speed-btn" data-speed="1.3" id="speed-fast">はやい</button>
            </div>
          </div>
        </header>

        <!-- メインシアターステージ（絵本・額縁アート風） -->
        <main class="rhythm-main-stage" id="rhythm-stage-area">
          <div class="rhythm-art-card" id="rhythm-art-card">
            
            <!-- 上部：しりとり繋がりブリッジ表示（前の文字 ➜ 今の文字 ➜ 次の文字） -->
            <div class="rhythm-connection-bridge" id="rhythm-connection-bridge">
              <div class="bridge-joint-node head-node" id="bridge-head-node">
                <span class="bridge-tag">あたま</span>
                <span class="bridge-char" id="bridge-head-char">-</span>
              </div>
              <div class="bridge-arrow-flow">
                <span class="arrow-dot dot-1"></span>
                <span class="arrow-dot dot-2"></span>
                <span class="arrow-dot dot-3"></span>
                <span class="arrow-icon">➡️</span>
              </div>
              <div class="bridge-current-word" id="bridge-word-title">りんご</div>
              <div class="bridge-arrow-flow">
                <span class="arrow-dot dot-1"></span>
                <span class="arrow-dot dot-2"></span>
                <span class="arrow-dot dot-3"></span>
                <span class="arrow-icon">➡️</span>
              </div>
              <div class="bridge-joint-node tail-node" id="bridge-tail-node">
                <span class="bridge-tag">おしり</span>
                <span class="bridge-char" id="bridge-tail-char">ご</span>
              </div>
            </div>

            <!-- イラストレーション表示ステージ -->
            <div class="rhythm-illustration-box">
              <div class="rhythm-svg-stage" id="rhythm-svg-stage">
                <!-- SVGが動的に描画されます -->
              </div>
            </div>

            <!-- 50音 ひらがな文字ブロック群（1文字ずつ大きく跳ねて発音） -->
            <div class="rhythm-char-blocks-row" id="rhythm-char-blocks-row">
              <!-- 各文字のブロックが動的生成されます -->
            </div>

            <!-- 説明テキスト -->
            <div class="rhythm-desc-banner" id="rhythm-desc-banner">
              あまくて おいしい まっかなりんご🍎
            </div>

            <!-- 次の文字への巨大フォーカスオーバーレイ（モーフィング用） -->
            <div class="rhythm-joint-spotlight" id="rhythm-joint-spotlight">
              <div class="spotlight-pulse-ring ring-1"></div>
              <div class="spotlight-pulse-ring ring-2"></div>
              <div class="spotlight-char-box" id="spotlight-char-box">
                <span class="spotlight-label">つぎの もじは…</span>
                <span class="spotlight-char" id="spotlight-char-text">ご</span>
              </div>
            </div>

            <!-- タップしてあそべるインタラクティブレイヤー -->
            <div class="rhythm-tap-layer" id="rhythm-tap-layer"></div>
          </div>
        </main>

        <!-- 下部：20個のしりとりトレインリボン -->
        <footer class="rhythm-bottom-ribbon">
          <div class="ribbon-scroll-container" id="rhythm-ribbon-track">
            <!-- 20個のサムネイルカードが動的生成されます -->
          </div>
        </footer>

        <!-- 20個かんせい ファンファーレモーダル -->
        <div class="rhythm-finish-modal" id="rhythm-finish-modal">
          <div class="rhythm-modal-box pop-in">
            <div class="modal-confetti-art">🎉 🍎 🦍 🎺 🩲 🕊️ 👓 🐱 🐨 📻 🍑 🐿️ 🍉 🐦‍⬛ 🔔 🦀 ☀️ 🍺 🗺️ 🔺 🎡</div>
            <h2 class="modal-finish-title">しりとり 20こ つながったよ！</h2>
            <p class="modal-finish-desc">「りんご」の【ご】から「ルーレット」まで<br>ぜんぶの ひらがなが ピタッとつながったね！</p>
            <div class="modal-star-badges">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</div>
            <div class="modal-btn-row">
              <button class="primary-btn" id="rhythm-replay-btn">🔄 もういちど みる！</button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.renderRibbonTrack();
    this.bindEvents();
  }

  renderRibbonTrack() {
    const track = document.getElementById('rhythm-ribbon-track');
    if (!track) return;
    track.innerHTML = '';

    this.chain.forEach((item, idx) => {
      const chip = document.createElement('div');
      chip.className = `ribbon-chip ${idx === this.currentIndex ? 'active' : ''}`;
      chip.id = `ribbon-chip-${idx}`;
      chip.innerHTML = `
        <span class="chip-num">${item.index}</span>
        <span class="chip-word">${item.word}</span>
        <span class="chip-tail-badge">${item.jointTail}</span>
      `;
      chip.addEventListener('click', () => {
        this.playStep(idx);
      });
      track.appendChild(chip);

      if (idx < this.chain.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'ribbon-arrow';
        arrow.textContent = '➜';
        track.appendChild(arrow);
      }
    });
  }

  bindEvents() {
    const playBtn = document.getElementById('rhythm-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isPlaying = !this.isPlaying;
        playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
        if (this.isPlaying) {
          window.soundSystem.playSparkle();
          this.playStep(this.currentIndex);
        } else {
          this.clearAllTimeouts();
        }
      });
    }

    const prevBtn = document.getElementById('rhythm-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        window.soundSystem.playPop();
        const prevIdx = (this.currentIndex - 1 + this.chain.length) % this.chain.length;
        this.playStep(prevIdx);
      });
    }

    const nextBtn = document.getElementById('rhythm-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        window.soundSystem.playPop();
        const nextIdx = (this.currentIndex + 1) % this.chain.length;
        this.playStep(nextIdx);
      });
    }

    // スピードボタン
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speedMultiplier = parseFloat(btn.dataset.speed);
        window.soundSystem.playSparkle();
      });
    });

    // タップインタラクション
    const tapLayer = document.getElementById('rhythm-tap-layer');
    if (tapLayer) {
      tapLayer.addEventListener('click', (e) => {
        this.handleTapEffect(e);
      });
      tapLayer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          this.handleTapEffect(e.touches[0]);
        }
      }, { passive: true });
    }

    // もう一度見るボタン
    const replayBtn = document.getElementById('rhythm-replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        const modal = document.getElementById('rhythm-finish-modal');
        if (modal) modal.classList.remove('show');
        this.currentIndex = 0;
        this.isPlaying = true;
        this.playStep(0);
      });
    }
  }

  /**
   * 1単語あたりのマルチフェーズ リズムシークエンス
   * Phase 1: 1文字ずつリズムに合わせてポップ登場 ＆ 1文字ずつの音を鳴らす
   * Phase 2: 単語完成！イラストが跳ねて全体を発音
   * Phase 3: 繋ぎ文字（おしりの文字）をクローズアップして次の文字へモーフィング
   */
  playStep(index) {
    if (index >= this.chain.length) {
      this.handleFinish();
      return;
    }

    this.clearAllTimeouts();
    this.currentIndex = index;
    const item = this.chain[index];
    const spd = this.speedMultiplier;

    // プログレス＆スタンプ更新
    this.app.updateStamps(index + 1, this.chain.length);

    // リボントラックの更新
    document.querySelectorAll('.ribbon-chip').forEach((chip, idx) => {
      chip.classList.toggle('active', idx === index);
      chip.classList.toggle('passed', idx < index);
    });
    const activeChip = document.getElementById(`ribbon-chip-${index}`);
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // カード背景＆境界線カラー
    const card = document.getElementById('rhythm-art-card');
    if (card) {
      card.style.backgroundColor = item.themeBg;
      card.style.borderColor = item.themeBorder;
    }

    // ブリッジ表示の更新
    const headNode = document.getElementById('bridge-head-node');
    const headChar = document.getElementById('bridge-head-char');
    const tailNode = document.getElementById('bridge-tail-node');
    const tailChar = document.getElementById('bridge-tail-char');
    const wordTitle = document.getElementById('bridge-word-title');

    if (headNode && headChar) {
      if (item.jointHead) {
        headChar.textContent = item.jointHead;
        headNode.style.display = 'flex';
        headNode.classList.add('pulse-match');
      } else {
        headNode.style.display = 'none';
      }
    }
    if (tailNode && tailChar) {
      tailChar.textContent = item.jointTail;
      tailNode.classList.remove('active-spot');
    }
    if (wordTitle) {
      wordTitle.textContent = item.word;
      wordTitle.style.color = item.themeAccent;
    }

    // スポットライトの非表示初期化
    const spotlight = document.getElementById('rhythm-joint-spotlight');
    if (spotlight) spotlight.classList.remove('show');

    // イラストSVGの更新
    const svgStage = document.getElementById('rhythm-svg-stage');
    if (svgStage) {
      svgStage.className = 'rhythm-svg-stage item-enter-pop';
      svgStage.innerHTML = item.svg();
    }

    // 説明文の更新
    const descBanner = document.getElementById('rhythm-desc-banner');
    if (descBanner) {
      descBanner.textContent = item.desc;
    }

    // 50音 文字ブロック群の初期配置（最初は非表示/待機）
    const charBlocksRow = document.getElementById('rhythm-char-blocks-row');
    if (charBlocksRow) {
      charBlocksRow.innerHTML = '';
      item.chars.forEach((c, cIdx) => {
        const isHead = cIdx === 0 && item.jointHead;
        const isTail = cIdx === item.chars.length - 1;
        const block = document.createElement('div');
        block.className = `hiragana-char-card waiting ${isHead ? 'is-head-joint' : ''} ${isTail ? 'is-tail-joint' : ''}`;
        block.id = `char-block-${cIdx}`;
        block.innerHTML = `
          <span class="char-main-glyph">${c}</span>
          ${isHead ? '<span class="joint-indicator-badge">まえから</span>' : ''}
          ${isTail ? '<span class="joint-indicator-badge">つぎへ</span>' : ''}
        `;
        
        // タップしたときに文字を発音するインタラクティブ性
        block.addEventListener('click', (e) => {
          e.stopPropagation();
          this.playSingleCharEffect(block, c, item.themeAccent);
        });

        charBlocksRow.appendChild(block);
      });
    }

    // ==========================================
    // リズムタイムラインの実行
    // ==========================================
    const charDelay = 420 / spd; // 1文字あたりの間隔
    const totalChars = item.chars.length;

    // --- Phase 1: 1文字ずつリズミカルにポップ登場 ＆ 発音 ---
    item.chars.forEach((c, cIdx) => {
      const t = setTimeout(() => {
        const block = document.getElementById(`char-block-${cIdx}`);
        if (block) {
          block.classList.remove('waiting');
          block.classList.add('pop-active');
        }
        this.playCharChime(cIdx, totalChars);
        this.speakSingleChar(c);
      }, (cIdx * charDelay));
      this.phaseTimeouts.push(t);
    });

    // --- Phase 2: 全文字揃って単語完成！（イラストがジャンプ） ---
    const wordCompleteDelay = (totalChars * charDelay) + (200 / spd);
    const tWord = setTimeout(() => {
      if (svgStage) svgStage.className = 'rhythm-svg-stage item-happy-bounce';
      window.soundSystem.playSparkle();
      this.speakWord(item.word);

      // パーティクル演出
      if (card) {
        const rect = card.getBoundingClientRect();
        this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 20);
      }
    }, wordCompleteDelay);
    this.phaseTimeouts.push(tWord);

    // --- Phase 3: 繋ぎ文字（おしりの文字）を大強調スポットライト！ ---
    const spotlightDelay = wordCompleteDelay + (1100 / spd);
    const tSpotlight = setTimeout(() => {
      if (index < this.chain.length - 1) {
        // 次の単語がある場合、おしりの文字を強調
        const tailBlock = document.getElementById(`char-block-${totalChars - 1}`);
        if (tailBlock) {
          tailBlock.classList.add('super-glow');
        }
        if (tailNode) {
          tailNode.classList.add('active-spot');
        }
        if (spotlight) {
          const spotChar = document.getElementById('spotlight-char-text');
          if (spotChar) spotChar.textContent = item.jointTail;
          spotlight.classList.add('show');
        }
        this.playJointHighlightSound();
        this.speakJointPrompt(item.jointTail);
      }
    }, spotlightDelay);
    this.phaseTimeouts.push(tSpotlight);

    // --- Phase 4: 次の単語へ進む ---
    const nextStepDelay = spotlightDelay + (index < this.chain.length - 1 ? (1400 / spd) : (1000 / spd));
    if (this.isPlaying) {
      this.stepTimerId = setTimeout(() => {
        this.playStep(index + 1);
      }, nextStepDelay);
    }
  }

  playSingleCharEffect(blockEl, charText, accentColor) {
    window.soundSystem.playPop();
    blockEl.classList.add('user-tapped');
    setTimeout(() => blockEl.classList.remove('user-tapped'), 400);
    this.speakSingleChar(charText);

    const rect = blockEl.getBoundingClientRect();
    this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
  }

  speakSingleChar(char) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(char);
        utter.lang = 'ja-JP';
        utter.rate = 1.0 * this.speedMultiplier;
        utter.pitch = 1.4; // 子ども向け高めトーン
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech single char error:', e);
    }
  }

  speakWord(word) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'ja-JP';
        utter.rate = 0.9 * this.speedMultiplier;
        utter.pitch = 1.35;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech word error:', e);
    }
  }

  speakJointPrompt(char) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(`つぎは、${char}！`);
        utter.lang = 'ja-JP';
        utter.rate = 1.0 * this.speedMultiplier;
        utter.pitch = 1.45;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech joint prompt error:', e);
    }
  }

  playCharChime(charIndex, totalChars) {
    if (window.soundSystem.isMuted || !window.soundSystem.ctx) return;
    window.soundSystem.initAudio();

    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
    const freq = scale[charIndex % scale.length];
    const ctx = window.soundSystem.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 0.12);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playJointHighlightSound() {
    if (window.soundSystem.isMuted || !window.soundSystem.ctx) return;
    const ctx = window.soundSystem.ctx;
    const now = ctx.currentTime;

    // ポロロロロン✨と繋がる魔法のベル
    const chords = [659.25, 880.00, 1046.50, 1318.51];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }, idx * 55);
    });
  }

  startRhythmBgm() {
    this.synthBgmActive = true;
    if (this.audioIntervalId) clearInterval(this.audioIntervalId);
    
    let beat = 0;
    this.audioIntervalId = setInterval(() => {
      if (!this.synthBgmActive || window.soundSystem.isMuted || !window.soundSystem.ctx) return;
      const ctx = window.soundSystem.ctx;
      const now = ctx.currentTime;

      // ウッドブロック風の心地よいリズムキープ
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const f = (beat % 4 === 0) ? 780 : 480;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      gain.gain.setValueAtTime((beat % 4 === 0) ? 0.05 : 0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);

      beat++;
    }, 450 / this.speedMultiplier);
  }

  stopRhythmBgm() {
    this.synthBgmActive = false;
    if (this.audioIntervalId) {
      clearInterval(this.audioIntervalId);
      this.audioIntervalId = null;
    }
  }

  handleTapEffect(e) {
    window.soundSystem.playPop();
    const stage = document.getElementById('rhythm-art-card');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const emojis = ['🎵', '✨', '🌸', '🍎', '⭐', '🎈', '💖', '🐾'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const pop = document.createElement('div');
    pop.className = 'tap-sparkle-emoji';
    pop.textContent = emoji;
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
    stage.appendChild(pop);

    setTimeout(() => {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 900);
  }

  handleFinish() {
    this.isPlaying = false;
    this.clearAllTimeouts();
    window.soundSystem.playFanfare();
    window.soundSystem.playMagicChime();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const modal = document.getElementById('rhythm-finish-modal');
    if (modal) modal.classList.add('show');
  }

  // ==========================================
  // 20個のやさしい絵本・切り絵風SVGイラスト群
  // ==========================================

  getRingoSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <defs>
          <radialGradient id="ringoGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ff8787" />
            <stop offset="60%" stop-color="#fa5252" />
            <stop offset="100%" stop-color="#e03131" />
          </radialGradient>
        </defs>
        <path d="M120 70 Q122 35 145 30 Q142 42 126 72 Z" fill="#8d5b4c" />
        <path d="M125 55 Q165 35 170 65 Q135 75 125 55 Z" fill="#69db7c" />
        <path d="M130 55 Q148 50 162 60" stroke="#37b24d" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M120 75 C85 65 50 85 50 130 C50 185 85 210 120 205 C155 210 190 185 190 130 C190 85 155 65 120 75 Z" fill="url(#ringoGrad)" filter="drop-shadow(0 8px 12px rgba(224,49,49,0.25))" />
        <ellipse cx="85" cy="115" rx="14" ry="24" transform="rotate(-25 85 115)" fill="#ffffff" opacity="0.45" />
        <ellipse cx="78" cy="98" rx="6" ry="10" transform="rotate(-25 78 98)" fill="#ffffff" opacity="0.6" />
        <circle cx="100" cy="140" r="4.5" fill="#491212" />
        <circle cx="140" cy="140" r="4.5" fill="#491212" />
        <ellipse cx="88" cy="148" rx="7" ry="4" fill="#ffa8a8" />
        <ellipse cx="152" cy="148" rx="7" ry="4" fill="#ffa8a8" />
        <path d="M112 152 Q120 162 128 152" stroke="#491212" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getGorillaSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M70 120 C40 140 45 210 120 210 C195 210 200 140 170 120 Z" fill="#495057" />
        <path d="M85 145 C85 130 115 130 120 145 C125 130 155 130 155 145 C155 180 85 180 85 145 Z" fill="#868e96" opacity="0.7" />
        <ellipse cx="55" cy="160" rx="18" ry="32" transform="rotate(25 55 160)" fill="#343a40" />
        <ellipse cx="185" cy="160" rx="18" ry="32" transform="rotate(-25 185 160)" fill="#343a40" />
        <circle cx="70" cy="175" r="14" fill="#868e96" />
        <circle cx="170" cy="175" r="14" fill="#868e96" />
        <circle cx="70" cy="85" r="12" fill="#343a40" />
        <circle cx="70" cy="85" r="6" fill="#adb5bd" />
        <circle cx="170" cy="85" r="12" fill="#343a40" />
        <circle cx="170" cy="85" r="6" fill="#adb5bd" />
        <ellipse cx="120" cy="85" rx="46" ry="42" fill="#343a40" />
        <path d="M92 78 C92 65 110 68 120 74 C130 68 148 65 148 78 C148 98 140 108 120 108 C100 108 92 98 92 78 Z" fill="#ced4da" />
        <circle cx="106" cy="82" r="4.5" fill="#212529" />
        <circle cx="134" cy="82" r="4.5" fill="#212529" />
        <circle cx="108" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="136" cy="80" r="1.5" fill="#ffffff" />
        <ellipse cx="114" cy="94" rx="2.5" ry="3.5" fill="#495057" />
        <ellipse cx="126" cy="94" rx="2.5" ry="3.5" fill="#495057" />
        <path d="M112 100 Q120 106 128 100" stroke="#212529" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <ellipse cx="94" cy="92" rx="5" ry="3.5" fill="#ffa8a8" />
        <ellipse cx="146" cy="92" rx="5" ry="3.5" fill="#ffa8a8" />
      </svg>
    `;
  }

  getRappaSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M165 70 C195 50 205 130 165 150 C145 140 145 80 165 70 Z" fill="#fcc419" />
        <ellipse cx="180" cy="110" rx="14" ry="38" fill="#ffe066" />
        <ellipse cx="180" cy="110" rx="8" ry="24" fill="#fab005" />
        <path d="M60 115 L165 110 L165 118 L60 121 Z" fill="#fcc419" />
        <path d="M80 100 C80 85 130 85 130 100 L130 125 C130 140 80 140 80 125 Z" fill="none" stroke="#fab005" stroke-width="7" stroke-linejoin="round" />
        <rect x="45" y="112" width="16" height="12" rx="4" fill="#ffd43b" />
        <rect x="100" y="80" width="6" height="20" rx="2" fill="#ffd43b" />
        <rect x="112" y="80" width="6" height="20" rx="2" fill="#ffd43b" />
        <rect x="124" y="80" width="6" height="20" rx="2" fill="#ffd43b" />
        <text x="195" y="80" font-size="28" fill="#f59f00">♪</text>
        <text x="205" y="125" font-size="22" fill="#ff6b6b">♫</text>
        <text x="190" y="160" font-size="26" fill="#339af0">♩</text>
      </svg>
    `;
  }

  getPantsuSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M55 90 C55 80 185 80 185 90 L175 165 C145 180 135 150 120 150 C105 150 95 180 65 165 Z" fill="#74c0fc" filter="drop-shadow(0 6px 10px rgba(51,154,240,0.2))" />
        <path d="M55 90 Q120 86 185 90" stroke="#339af0" stroke-width="8" fill="none" stroke-linecap="round" />
        <circle cx="85" cy="115" r="7" fill="#ffffff" opacity="0.8" />
        <circle cx="120" cy="110" r="7" fill="#ffffff" opacity="0.8" />
        <circle cx="155" cy="115" r="7" fill="#ffffff" opacity="0.8" />
        <circle cx="100" cy="140" r="7" fill="#ffffff" opacity="0.8" />
        <circle cx="140" cy="140" r="7" fill="#ffffff" opacity="0.8" />
        <circle cx="120" cy="94" r="5" fill="#ff8787" />
        <polygon points="120,94 110,88 110,100" fill="#ff8787" />
        <polygon points="120,94 130,88 130,100" fill="#ff8787" />
      </svg>
    `;
  }

  getTsubameSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M120 150 L85 210 L120 175 L155 210 Z" fill="#364fc7" />
        <path d="M120 110 Q50 60 20 85 Q75 115 120 130 Z" fill="#4263eb" />
        <path d="M120 110 Q190 60 220 85 Q165 115 120 130 Z" fill="#4263eb" />
        <ellipse cx="120" cy="115" rx="28" ry="44" fill="#364fc7" />
        <ellipse cx="120" cy="120" rx="18" ry="26" fill="#f8f9fa" />
        <path d="M110 82 Q120 74 130 82 Q130 96 120 96 Q110 96 110 82 Z" fill="#ff922b" />
        <circle cx="120" cy="72" r="18" fill="#364fc7" />
        <polygon points="120,54 114,66 126,66" fill="#fcc419" />
        <circle cx="113" cy="72" r="3" fill="#ffffff" />
        <circle cx="113" cy="72" r="1.8" fill="#000000" />
        <circle cx="127" cy="72" r="3" fill="#ffffff" />
        <circle cx="127" cy="72" r="1.8" fill="#000000" />
      </svg>
    `;
  }

  getMeganeSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <circle cx="75" cy="120" r="36" fill="#e7f5ff" stroke="#f06595" stroke-width="9" />
        <circle cx="165" cy="120" r="36" fill="#e7f5ff" stroke="#f06595" stroke-width="9" />
        <path d="M111 115 Q120 105 129 115" stroke="#f06595" stroke-width="8" fill="none" stroke-linecap="round" />
        <path d="M39 116 Q20 110 15 125" stroke="#f06595" stroke-width="7" fill="none" stroke-linecap="round" />
        <path d="M201 116 Q220 110 225 125" stroke="#f06595" stroke-width="7" fill="none" stroke-linecap="round" />
        <path d="M60 100 Q80 95 90 108" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M150 100 Q170 95 180 108" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" />
        <text x="108" y="75" font-size="22" fill="#ffd43b">✨</text>
      </svg>
    `;
  }

  getNekoSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M155 170 Q195 175 195 135 Q195 115 180 120" stroke="#ffa94d" stroke-width="12" fill="none" stroke-linecap="round" />
        <ellipse cx="120" cy="165" rx="50" ry="40" fill="#ffa94d" />
        <ellipse cx="120" cy="170" rx="32" ry="26" fill="#fff4e6" />
        <ellipse cx="120" cy="100" rx="46" ry="38" fill="#ffa94d" />
        <polygon points="80,85 70,45 105,68" fill="#ffa94d" />
        <polygon points="82,80 76,52 100,70" fill="#ffc9c9" />
        <polygon points="160,85 170,45 135,68" fill="#ffa94d" />
        <polygon points="158,80 164,52 140,70" fill="#ffc9c9" />
        <ellipse cx="102" cy="98" rx="5" ry="7" fill="#212529" />
        <ellipse cx="138" cy="98" rx="5" ry="7" fill="#212529" />
        <circle cx="104" cy="95" r="2" fill="#ffffff" />
        <circle cx="140" cy="95" r="2" fill="#ffffff" />
        <polygon points="120,106 115,111 125,111" fill="#ff8787" />
        <path d="M112 114 Q120 120 120 111 Q120 120 128 114" stroke="#495057" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <line x1="72" y1="105" x2="92" y2="108" stroke="#495057" stroke-width="2.5" stroke-linecap="round" />
        <line x1="70" y1="116" x2="90" y2="115" stroke="#495057" stroke-width="2.5" stroke-linecap="round" />
        <line x1="168" y1="105" x2="148" y2="108" stroke="#495057" stroke-width="2.5" stroke-linecap="round" />
        <line x1="170" y1="116" x2="150" y2="115" stroke="#495057" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="92" cy="110" r="6" fill="#ff8787" opacity="0.6" />
        <circle cx="148" cy="110" r="6" fill="#ff8787" opacity="0.6" />
      </svg>
    `;
  }

  getKoaraSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M50 30 L50 210" stroke="#8d5b4c" stroke-width="24" stroke-linecap="round" />
        <path d="M50 70 Q25 60 20 40 Q40 50 50 70" fill="#69db7c" />
        <path d="M50 140 Q15 130 10 110 Q35 120 50 140" fill="#69db7c" />
        <ellipse cx="120" cy="145" rx="42" ry="38" fill="#adb5bd" />
        <ellipse cx="120" cy="148" rx="26" ry="24" fill="#f1f3f5" />
        <ellipse cx="70" cy="125" rx="14" ry="10" fill="#868e96" />
        <ellipse cx="70" cy="165" rx="14" ry="10" fill="#868e96" />
        <circle cx="82" cy="72" r="22" fill="#868e96" />
        <circle cx="82" cy="72" r="14" fill="#f8f9fa" />
        <circle cx="168" cy="72" r="22" fill="#868e96" />
        <circle cx="168" cy="72" r="14" fill="#f8f9fa" />
        <ellipse cx="125" cy="85" rx="38" ry="34" fill="#adb5bd" />
        <ellipse cx="125" cy="92" rx="12" ry="18" fill="#343a40" />
        <circle cx="104" cy="82" r="4" fill="#212529" />
        <circle cx="146" cy="82" r="4" fill="#212529" />
        <circle cx="106" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="148" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="96" cy="94" r="5" fill="#ffa8a8" />
        <circle cx="154" cy="94" r="5" fill="#ffa8a8" />
      </svg>
    `;
  }

  getRajioSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <line x1="80" y1="75" x2="45" y2="35" stroke="#868e96" stroke-width="5" stroke-linecap="round" />
        <circle cx="45" cy="35" r="5" fill="#ff6b6b" />
        <rect x="45" y="75" width="150" height="110" rx="20" fill="#66d9e8" stroke="#15aabf" stroke-width="6" />
        <path d="M85 75 Q85 55 120 55 Q155 55 155 75" stroke="#15aabf" stroke-width="6" fill="none" />
        <circle cx="95" cy="130" r="32" fill="#ffffff" stroke="#22b8cf" stroke-width="4" />
        <circle cx="95" cy="130" r="22" fill="#e3fafc" />
        <circle cx="95" cy="130" r="10" fill="#15aabf" />
        <rect x="140" y="95" width="42" height="20" rx="4" fill="#ffffff" stroke="#22b8cf" stroke-width="2" />
        <line x1="158" y1="97" x2="158" y2="113" stroke="#ff6b6b" stroke-width="3" />
        <circle cx="161" cy="142" r="14" fill="#ffd43b" stroke="#f59f00" stroke-width="3" />
        <circle cx="161" cy="142" r="4" fill="#d9480f" />
        <path d="M30 115 Q20 130 30 145" stroke="#ff922b" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M210 115 Q220 130 210 145" stroke="#ff922b" stroke-width="4" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getOshiriSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <defs>
          <radialGradient id="oshiriGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fff5f5" />
            <stop offset="60%" stop-color="#ffc9c9" />
            <stop offset="100%" stop-color="#ff8787" />
          </radialGradient>
        </defs>
        <path d="M120 165 C70 200 45 160 45 115 C45 70 85 65 120 95 C155 65 195 70 195 115 C195 160 170 200 120 165 Z" fill="url(#oshiriGrad)" filter="drop-shadow(0 8px 12px rgba(255,107,107,0.25))" />
        <path d="M120 95 L120 162" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round" />
        <path d="M35 95 Q25 115 35 135" stroke="#ff8787" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M205 95 Q215 115 205 135" stroke="#ff8787" stroke-width="4" fill="none" stroke-linecap="round" />
        <text x="50" y="60" font-size="24" fill="#ff6b6b">💖</text>
        <text x="165" y="60" font-size="24" fill="#f59f00">♪</text>
      </svg>
    `;
  }

  getRisuSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M130 170 C190 190 220 130 200 80 C185 45 150 50 145 75 C140 100 175 115 160 145 C150 165 130 160 130 170 Z" fill="#e8590c" />
        <path d="M150 85 C160 105 185 105 175 135" stroke="#ffd8a8" stroke-width="5" fill="none" stroke-linecap="round" />
        <ellipse cx="110" cy="155" rx="32" ry="38" fill="#d9480f" />
        <ellipse cx="102" cy="158" rx="20" ry="26" fill="#fff4e6" />
        <ellipse cx="95" cy="100" rx="26" ry="24" fill="#d9480f" />
        <ellipse cx="80" cy="80" rx="7" ry="12" transform="rotate(-20 80 80)" fill="#d9480f" />
        <ellipse cx="80" cy="80" rx="4" ry="8" transform="rotate(-20 80 80)" fill="#ffc9c9" />
        <ellipse cx="110" cy="80" rx="7" ry="12" transform="rotate(20 110 80)" fill="#d9480f" />
        <circle cx="86" cy="98" r="4.5" fill="#212529" />
        <circle cx="88" cy="96" r="1.5" fill="#ffffff" />
        <ellipse cx="85" cy="138" rx="8" ry="6" fill="#f76707" />
        <path d="M72 135 C72 120 98 120 98 135 C98 150 72 150 72 135 Z" fill="#a61e4d" />
        <path d="M70 130 Q85 125 100 130" stroke="#5c2618" stroke-width="4" fill="none" />
      </svg>
    `;
  }

  getSuikaSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M40 120 A80 80 0 0 0 200 120 Z" fill="#2b8a3e" />
        <path d="M45 120 A75 75 0 0 0 195 120 Z" fill="#e9fac8" />
        <path d="M52 120 A68 68 0 0 0 188 120 Z" fill="#ff6b6b" />
        <path d="M65 160 Q75 145 70 120" stroke="#1b4b24" stroke-width="6" fill="none" />
        <path d="M120 198 Q120 160 120 120" stroke="#1b4b24" stroke-width="6" fill="none" />
        <path d="M175 160 Q165 145 170 120" stroke="#1b4b24" stroke-width="6" fill="none" />
        <ellipse cx="85" cy="135" rx="3" ry="5" fill="#212529" transform="rotate(15 85 135)" />
        <ellipse cx="120" cy="148" rx="3" ry="5" fill="#212529" />
        <ellipse cx="155" cy="135" rx="3" ry="5" fill="#212529" transform="rotate(-15 155 135)" />
        <ellipse cx="102" cy="155" rx="3" ry="5" fill="#212529" transform="rotate(-20 102 155)" />
        <ellipse cx="138" cy="155" rx="3" ry="5" fill="#212529" transform="rotate(20 138 155)" />
        <circle cx="105" cy="132" r="3.5" fill="#ffffff" />
        <circle cx="105" cy="132" r="2" fill="#212529" />
        <circle cx="135" cy="132" r="3.5" fill="#ffffff" />
        <circle cx="135" cy="132" r="2" fill="#212529" />
        <path d="M114 138 Q120 144 126 138" stroke="#212529" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getKarasuSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <ellipse cx="120" cy="135" rx="42" ry="48" fill="#343a40" />
        <path d="M145 125 C175 110 195 160 155 175 Z" fill="#212529" />
        <path d="M140 170 L195 200 L160 175 Z" fill="#212529" />
        <circle cx="95" cy="95" r="32" fill="#343a40" />
        <polygon points="70,95 25,108 72,112" fill="#fcc419" stroke="#fab005" stroke-width="2" />
        <circle cx="85" cy="90" r="7" fill="#ffffff" />
        <circle cx="83" cy="90" r="4" fill="#000000" />
        <circle cx="85" cy="88" r="1.5" fill="#ffffff" />
        <line x1="105" y1="180" x2="95" y2="210" stroke="#fcc419" stroke-width="4" stroke-linecap="round" />
        <line x1="125" y1="180" x2="120" y2="210" stroke="#fcc419" stroke-width="4" stroke-linecap="round" />
      </svg>
    `;
  }

  getSuzuSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M120 65 Q95 45 80 60 Q95 75 120 68" fill="#ff6b6b" />
        <path d="M120 65 Q145 45 160 60 Q145 75 120 68" fill="#ff6b6b" />
        <circle cx="120" cy="65" r="7" fill="#e03131" />
        <circle cx="120" cy="130" r="56" fill="#fcc419" stroke="#fab005" stroke-width="6" />
        <rect x="70" y="122" width="100" height="12" rx="6" fill="#ffd43b" />
        <circle cx="120" cy="155" r="9" fill="#d9480f" />
        <line x1="85" y1="155" x2="155" y2="155" stroke="#d9480f" stroke-width="5" stroke-linecap="round" />
        <ellipse cx="96" cy="102" rx="14" ry="8" transform="rotate(-30 96 102)" fill="#ffffff" opacity="0.6" />
        <path d="M50 115 Q35 130 50 145" stroke="#fab005" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M190 115 Q205 130 190 145" stroke="#fab005" stroke-width="4" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getZuwaiganiSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M70 140 Q25 120 15 150" stroke="#f76707" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M70 150 Q25 150 20 180" stroke="#f76707" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M170 140 Q215 120 225 150" stroke="#f76707" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M170 150 Q215 150 220 180" stroke="#f76707" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M80 120 Q50 80 40 50" stroke="#f76707" stroke-width="7" fill="none" stroke-linecap="round" />
        <circle cx="35" cy="45" r="14" fill="#ff6b6b" />
        <path d="M25 40 Q35 25 45 40" stroke="#d9480f" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M160 120 Q190 80 200 50" stroke="#f76707" stroke-width="7" fill="none" stroke-linecap="round" />
        <circle cx="205" cy="45" r="14" fill="#ff6b6b" />
        <path d="M195 40 Q205 25 215 40" stroke="#d9480f" stroke-width="5" fill="none" stroke-linecap="round" />
        <ellipse cx="120" cy="140" rx="46" ry="34" fill="#ff6b6b" stroke="#e03131" stroke-width="4" />
        <line x1="105" y1="115" x2="105" y2="95" stroke="#f76707" stroke-width="5" />
        <circle cx="105" cy="92" r="9" fill="#ffffff" stroke="#e03131" stroke-width="2" />
        <circle cx="105" cy="92" r="4.5" fill="#212529" />
        <line x1="135" y1="115" x2="135" y2="95" stroke="#f76707" stroke-width="5" />
        <circle cx="135" cy="92" r="9" fill="#ffffff" stroke="#e03131" stroke-width="2" />
        <circle cx="135" cy="92" r="4.5" fill="#212529" />
        <path d="M112 145 Q120 152 128 145" stroke="#741f1f" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getNichiyoubiSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <rect x="55" y="70" width="130" height="135" rx="16" fill="#ffffff" stroke="#ced4da" stroke-width="4" filter="drop-shadow(0 8px 14px rgba(0,0,0,0.1))" />
        <path d="M55 86 C55 77 62 70 71 70 L169 70 C178 70 185 77 185 86 L185 105 L55 105 Z" fill="#ff6b6b" />
        <text x="120" y="94" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">NICHIYOUBI</text>
        <rect x="80" y="60" width="10" height="20" rx="5" fill="#868e96" />
        <rect x="150" y="60" width="10" height="20" rx="5" fill="#868e96" />
        <circle cx="120" cy="150" r="28" fill="#ffd43b" />
        <g stroke="#fcc419" stroke-width="4" stroke-linecap="round">
          <line x1="120" y1="112" x2="120" y2="118" />
          <line x1="120" y1="182" x2="120" y2="188" />
          <line x1="82" y1="150" x2="88" y2="150" />
          <line x1="152" y1="150" x2="158" y2="150" />
          <line x1="94" y1="124" x2="99" y2="129" />
          <line x1="141" y1="171" x2="146" y2="176" />
          <line x1="146" y1="124" x2="141" y2="129" />
          <line x1="99" y1="171" x2="94" y2="176" />
        </g>
        <circle cx="112" cy="146" r="3" fill="#d9480f" />
        <circle cx="128" cy="146" r="3" fill="#d9480f" />
        <path d="M114 154 Q120 160 126 154" stroke="#d9480f" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getBiruSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <path d="M150 100 C190 100 190 170 150 170" stroke="#ced4da" stroke-width="16" fill="none" stroke-linecap="round" />
        <path d="M150 100 C180 100 180 170 150 170" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" />
        <rect x="65" y="85" width="95" height="110" rx="14" fill="#ffd43b" stroke="#fcc419" stroke-width="5" />
        <rect x="75" y="95" width="75" height="90" rx="8" fill="#fab005" />
        <circle cx="90" cy="160" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="105" cy="130" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="125" cy="150" r="3.5" fill="#ffffff" opacity="0.8" />
        <circle cx="135" cy="115" r="4.5" fill="#ffffff" opacity="0.8" />
        <path d="M60 90 C50 70 75 55 90 70 C100 50 125 50 135 68 C148 55 170 70 160 90 Z" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
        <ellipse cx="70" cy="105" rx="5" ry="8" fill="#ffffff" />
      </svg>
    `;
  }

  getRutoSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <rect x="40" y="50" width="160" height="145" rx="18" fill="#e6fcf5" stroke="#63e6be" stroke-width="5" />
        <circle cx="65" cy="85" r="14" fill="#38d9a9" />
        <circle cx="175" cy="165" r="14" fill="#38d9a9" />
        <path d="M65 160 Q85 110 120 140 T175 80" stroke="#ff6b6b" stroke-width="6" stroke-dasharray="8 8" fill="none" stroke-linecap="round" />
        <circle cx="65" cy="160" r="10" fill="#339af0" />
        <circle cx="65" cy="160" r="4" fill="#ffffff" />
        <line x1="175" y1="80" x2="175" y2="50" stroke="#495057" stroke-width="4" stroke-linecap="round" />
        <polygon points="175,50 205,62 175,74" fill="#ff6b6b" />
        <text x="110" y="125" font-size="20" fill="#f59f00">👣</text>
      </svg>
    `;
  }

  getToraianguruSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <line x1="120" y1="35" x2="120" y2="65" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round" />
        <path d="M120 70 L185 180 L62 180 L115 78" stroke="#ced4da" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round" />
        <path d="M120 70 L185 180 L62 180 L115 78" stroke="#ffffff" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="160" y1="100" x2="205" y2="160" stroke="#fcc419" stroke-width="6" stroke-linecap="round" />
        <circle cx="160" cy="100" r="7" fill="#fab005" />
        <text x="50" y="85" font-size="24" fill="#ffd43b">✨</text>
        <text x="175" y="70" font-size="26" fill="#7950f2">♪</text>
        <text x="195" y="120" font-size="22" fill="#ff6b6b">♫</text>
      </svg>
    `;
  }

  getRurettoSvg() {
    return `
      <svg viewBox="0 0 240 240" class="rhythm-svg" width="100%" height="100%">
        <polygon points="105,185 135,185 145,215 95,215" fill="#868e96" />
        <circle cx="120" cy="120" r="72" fill="#ffffff" stroke="#fab005" stroke-width="6" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))" />
        <path d="M120 120 L120 50 A70 70 0 0 1 180 85 Z" fill="#ff6b6b" />
        <path d="M120 120 L180 85 A70 70 0 0 1 180 155 Z" fill="#ffd43b" />
        <path d="M120 120 L180 155 A70 70 0 0 1 120 190 Z" fill="#51cf66" />
        <path d="M120 120 L120 190 A70 70 0 0 1 60 155 Z" fill="#339af0" />
        <path d="M120 120 L60 155 A70 70 0 0 1 60 85 Z" fill="#845ef7" />
        <path d="M120 120 L60 85 A70 70 0 0 1 120 50 Z" fill="#ff922b" />
        <circle cx="120" cy="120" r="18" fill="#ffffff" stroke="#495057" stroke-width="4" />
        <circle cx="120" cy="120" r="8" fill="#fab005" />
        <polygon points="120,55 110,32 130,32" fill="#e03131" stroke="#ffffff" stroke-width="2" />
        <circle cx="45" cy="50" r="4" fill="#ff6b6b" />
        <rect x="185" y="45" width="8" height="8" transform="rotate(30 185 45)" fill="#339af0" />
        <circle cx="195" cy="180" r="5" fill="#51cf66" />
        <rect x="40" y="170" width="7" height="7" transform="rotate(45 40 170)" fill="#ffd43b" />
      </svg>
    `;
  }
}
