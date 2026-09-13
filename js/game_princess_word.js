/**
 * game_princess_word.js - プリンセスのロイヤル・スイーツパズル (Princess Royal Sweets Word Puzzle)
 * 自分で着せ替えたプリンセスにおいしいスイーツやロイヤルアイテムをごちそう！
 * ひらがなタイルをならべて言葉を作ると、お姫様が「もぐもぐ♪」と喜んで食べてくれます！
 */

class GamePrincessWord {
  constructor(app) {
    this.app = app;
    this.round = 0;
    this.maxRounds = 5;
    this.currentWordData = null;
    this.placedLetters = []; // [{ id, char }]
    this.availableTiles = []; // [{ id, char, isUsed }]
    this.isLocked = false;

    // プリンセステーマのことばリスト (スイーツ＆ロイヤルアイテム)
    this.words = [
      {
        word: 'けーき',
        letters: ['け', 'ー', 'き'],
        emoji: '🍰',
        name: 'いちごショートケーキ',
        dummies: ['あ', 'め']
      },
      {
        word: 'ぱふぇ',
        letters: ['ぱ', 'ふ', 'ぇ'],
        emoji: '🍓',
        name: 'ロイヤルパフェ',
        dummies: ['り', 'ん']
      },
      {
        word: 'ぷりん',
        letters: ['ぷ', 'り', 'ん'],
        emoji: '🍮',
        name: 'カスタードプリン',
        dummies: ['み', 'れ']
      },
      {
        word: 'くっきー',
        letters: ['く', 'っ', 'き', 'ー'],
        emoji: '🍪',
        name: 'ハートのクッキー',
        dummies: ['さ', 'ら']
      },
      {
        word: 'てぃー',
        letters: ['て', 'ぃ', 'ー'],
        emoji: '🫖',
        name: 'ロイヤルミルクティー',
        dummies: ['ゆ', 'ね']
      },
      {
        word: 'あいす',
        letters: ['あ', 'い', 'す'],
        emoji: '🍨',
        name: 'きらきらアイス',
        dummies: ['く', 'ま']
      },
      {
        word: 'どれす',
        letters: ['ど', 'れ', 'す'],
        emoji: '👗',
        name: 'プリンセスドレス',
        dummies: ['は', 'な']
      },
      {
        word: 'てぃあら',
        letters: ['て', 'ぃ', 'あ', 'ら'],
        emoji: '👑',
        name: 'ダイヤモンドティアラ',
        dummies: ['き', 'ほ']
      },
      {
        word: 'すてっき',
        letters: ['す', 'て', 'っ', 'き'],
        emoji: '🪄',
        name: 'まほうのステッキ',
        dummies: ['る', 'び']
      },
      {
        word: 'りぼん',
        letters: ['り', 'ぼ', 'ん'],
        emoji: '🎀',
        name: 'サテンリボン',
        dummies: ['ぺ', 'ろ']
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-word');
  }

  start() {
    this.round = 0;
    this.app.updateStamps(0, this.maxRounds);
    window.soundSystem.startPrincessBgm();
    this.shuffledWords = [...this.words].sort(() => Math.random() - 0.5);
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="p-word-game-layout">
        <!-- 上部：お題・おしゃべりバー -->
        <div class="p-word-header-bar">
          <div class="p-word-speech-bubble" id="p-word-speech-bubble">
            <span class="p-word-speech-text" id="p-word-speech-text">読み込み中...</span>
            <button class="p-word-voice-btn" id="p-word-voice-btn" title="もういちどきく">🔊</button>
          </div>
          <div class="p-word-target-badge" id="p-word-target-badge">
            <span class="p-word-target-emoji" id="p-word-clue-emoji">🍰</span>
            <span class="p-word-target-name" id="p-word-clue-name">けーき</span>
          </div>
        </div>

        <!-- 中央：パーティーテーブル ＆ もぐもぐプリンセス -->
        <div class="p-word-main-scene">
          <!-- 左側：プリンセス席 -->
          <div class="p-word-guest-box">
            <div class="p-word-princess-avatar" id="p-word-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
            <div class="p-word-hearts-bubble" id="p-word-hearts-bubble">
              <span id="p-word-status-text">おなかすいたな♪</span>
            </div>
          </div>

          <!-- 右側：ロイヤルプレートスロット ＆ 文字タイルパレット -->
          <div class="p-word-puzzle-panel">
            <!-- お皿と文字スロット -->
            <div class="p-word-plate-area">
              <div class="p-word-royal-plate">
                <div class="p-word-plate-rim"></div>
                <div class="p-word-slots-container" id="p-word-slots-container"></div>
              </div>
            </div>

            <!-- 文字タイル選択パレット -->
            <div class="p-word-tiles-palette" id="p-word-tiles-container"></div>
          </div>
        </div>
      </div>
    `;

    // 音声ボタン
    const voiceBtn = document.getElementById('p-word-voice-btn');
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
    this.isLocked = false;
    this.placedLetters = [];
    this.app.updateStamps(this.round - 1, this.maxRounds);

    this.currentWordData = this.shuffledWords[(this.round - 1) % this.shuffledWords.length];

    // お題バッジ更新
    const emojiEl = document.getElementById('p-word-clue-emoji');
    const nameEl = document.getElementById('p-word-clue-name');
    const speechEl = document.getElementById('p-word-speech-text');
    const statusEl = document.getElementById('p-word-status-text');

    if (emojiEl) emojiEl.textContent = this.currentWordData.emoji;
    if (nameEl) nameEl.textContent = this.currentWordData.word;
    if (speechEl) {
      speechEl.innerHTML = `『<strong style="color:#e84118;">${this.currentWordData.word}</strong>』の 文字を ならべてね！`;
    }
    if (statusEl) statusEl.textContent = `『${this.currentWordData.name}』たべたいな♪`;

    // タイル一覧生成 (正解文字 + ダミー1~2文字)
    const dummy = this.currentWordData.dummies[Math.floor(Math.random() * this.currentWordData.dummies.length)];
    const tileList = [...this.currentWordData.letters, dummy].map((char, id) => ({
      id: `p_tile_${id}_${char}`,
      char: char,
      isUsed: false
    })).sort(() => Math.random() - 0.5);

    this.availableTiles = tileList;

    this.speakPrompt();
    this.renderSlotsAndTiles();
  }

  speakPrompt() {
    window.soundSystem.playMagicChime();
    const bubble = document.getElementById('p-word-speech-bubble');
    if (bubble) {
      bubble.classList.add('pop-in');
      setTimeout(() => bubble.classList.remove('pop-in'), 300);
    }
  }

  renderSlotsAndTiles() {
    const slotsEl = document.getElementById('p-word-slots-container');
    const tilesEl = document.getElementById('p-word-tiles-container');
    if (!slotsEl || !tilesEl) return;

    slotsEl.innerHTML = '';
    tilesEl.innerHTML = '';

    const targetLength = this.currentWordData.letters.length;

    // 1. スロット描画
    for (let i = 0; i < targetLength; i++) {
      const slot = document.createElement('div');
      slot.className = 'p-word-slot';
      slot.dataset.index = i;

      const placed = this.placedLetters[i];
      if (placed) {
        slot.classList.add('filled');
        slot.innerHTML = `<span class="p-slot-char pop-in">${placed.char}</span>`;
        slot.addEventListener('click', () => {
          if (this.isLocked) return;
          this.removeLetterFromSlot(i);
        });
      } else {
        slot.innerHTML = `<span class="p-slot-placeholder">⚪</span>`;
      }

      slotsEl.appendChild(slot);
    }

    // 2. タイル描画
    this.availableTiles.forEach(tile => {
      const tileBtn = document.createElement('button');
      tileBtn.className = 'p-jewel-tile pop-in' + (tile.isUsed ? ' used' : '');
      tileBtn.disabled = tile.isUsed;
      tileBtn.innerHTML = `
        <span class="p-tile-gem">💎</span>
        <span class="p-tile-letter">${tile.char}</span>
      `;

      tileBtn.addEventListener('click', () => {
        if (this.isLocked || tile.isUsed) return;
        this.addLetterToNextSlot(tile);
      });

      tilesEl.appendChild(tileBtn);
    });
  }

  addLetterToNextSlot(tile) {
    if (this.placedLetters.length >= this.currentWordData.letters.length) return;

    tile.isUsed = true;
    this.placedLetters.push(tile);
    window.soundSystem.playJewelTone(this.placedLetters.length);

    this.renderSlotsAndTiles();

    // スロットが全部埋まったかチェック
    if (this.placedLetters.length === this.currentWordData.letters.length) {
      this.checkWordCompletion();
    }
  }

  removeLetterFromSlot(slotIndex) {
    const removed = this.placedLetters.splice(slotIndex, 1)[0];
    if (removed) {
      removed.isUsed = false;
      window.soundSystem.playPop();
      this.renderSlotsAndTiles();
    }
  }

  checkWordCompletion() {
    this.isLocked = true;
    const currentWord = this.placedLetters.map(p => p.char).join('');

    if (currentWord === this.currentWordData.word) {
      // 大正解！
      window.soundSystem.playTreasureChest();
      this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 60);

      // プリンセスのもぐもぐアニメーション＆ハート
      const princess = document.getElementById('p-word-princess-avatar');
      const statusEl = document.getElementById('p-word-status-text');
      const speechEl = document.getElementById('p-word-speech-text');

      if (princess) princess.classList.add('cheering');
      if (statusEl) statusEl.innerHTML = `💖 もぐもぐ♪ おいしい〜！ 💖`;
      if (speechEl) speechEl.innerHTML = `🎉 せいかい！ 『${this.currentWordData.name}』かんせい！ ✨`;

      this.app.updateStamps(this.round, this.maxRounds);

      setTimeout(() => {
        if (princess) princess.classList.remove('cheering');
        this.nextRound();
      }, 1600);

    } else {
      // 順番が違う（おしい！）
      window.soundSystem.playPop();
      const slotsEl = document.getElementById('p-word-slots-container');
      if (slotsEl) {
        slotsEl.classList.add('shake-card');
        setTimeout(() => slotsEl.classList.remove('shake-card'), 500);
      }

      const speechEl = document.getElementById('p-word-speech-text');
      if (speechEl) {
        speechEl.innerHTML = `✨ おしい！ 文字のならびを もういちど確かめてね！`;
      }

      setTimeout(() => {
        this.isLocked = false;
      }, 800);
    }
  }

  handleGameComplete() {
    this.app.updateStamps(this.maxRounds, this.maxRounds);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 140);

    const princess = document.getElementById('p-word-princess-avatar');
    const statusEl = document.getElementById('p-word-status-text');
    const speechEl = document.getElementById('p-word-speech-text');

    if (princess) princess.classList.add('cheering');
    if (statusEl) statusEl.innerHTML = `👑 ごちそうさまでした！ おなかいっぱい！ 👑`;
    if (speechEl) speechEl.innerHTML = `🎉 すごい！ ロイヤルスイーツを ぜんぶ作ったよ！ 🎉`;

    setTimeout(() => {
      this.app.showCompleteModal();
    }, 1200);
  }
}

window.GamePrincessWord = GamePrincessWord;
