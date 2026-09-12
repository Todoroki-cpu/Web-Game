/**
 * game_hiragana_word.js - サンリオ風 ことばの もぐもぐパズル
 * キャラクター：ポムポムプリン風 (purin)
 */

class GameHiraganaWord {
  constructor(app) {
    this.app = app;
    this.characterManager = null;
    this.speechTextEl = null;
    this.charStage = 'hiragana-word-character-stage';
    this.targetClueEl = null;
    this.slotsContainerEl = null;
    this.tilesContainerEl = null;

    this.earnedStamps = 0;
    this.maxStamps = 5;
    this.currentWordData = null;
    this.placedLetters = []; // 現在スロットに置かれた文字の配列
    this.availableTiles = []; // 選択可能なタイル

    this.words = [
      {
        word: 'りんご',
        letters: ['り', 'ん', 'ご'],
        emoji: '🍎',
        voiceKey: 'word_ringo',
        dummies: ['み', 'め']
      },
      {
        word: 'ぱんだ',
        letters: ['ぱ', 'ん', 'だ'],
        emoji: '🐼',
        voiceKey: 'word_panda',
        dummies: ['ね', 'こ']
      },
      {
        word: 'くるま',
        letters: ['く', 'る', 'ま'],
        emoji: '🚗',
        voiceKey: 'word_kuruma',
        dummies: ['と', 'り']
      },
      {
        word: 'ねこ',
        letters: ['ね', 'こ'],
        emoji: '🐱',
        voiceKey: 'word_neko',
        dummies: ['い', 'ぬ']
      },
      {
        word: 'くま',
        letters: ['く', 'ま'],
        emoji: '🐻',
        voiceKey: 'word_kuma',
        dummies: ['さ', 'る']
      },
      {
        word: 'けーき',
        letters: ['け', 'ー', 'き'],
        emoji: '🍰',
        voiceKey: 'word_cake',
        dummies: ['あ', 'め']
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.speechTextEl = document.getElementById('hiragana-word-speech-text');
    this.targetClueEl = document.getElementById('hiragana-word-target-clue');
    this.slotsContainerEl = document.getElementById('hiragana-word-slots-container');
    this.tilesContainerEl = document.getElementById('hiragana-word-tiles-container');

    const bubbleEl = document.getElementById('hiragana-word-speech-bubble');
    if (bubbleEl) {
      bubbleEl.addEventListener('click', () => {
        if (this.currentWordData) {
          window.soundSystem.playVoice(this.currentWordData.voiceKey);
        }
      });
    }
  }

  start() {
    if (!this.characterManager) {
      this.characterManager = new CharacterManager(this.charStage);
    }
    this.characterManager.setCharacter('purin'); // ポムポムプリン風
    this.characterManager.setState('idle');

    this.earnedStamps = 0;
    this.app.updateStamps(0, this.maxStamps);

    this.shuffledWords = [...this.words].sort(() => Math.random() - 0.5);
    this.wordIndex = 0;

    window.soundSystem.playVoice('word_prompt');
    this.setSpeech('もじを ならべて ことばを つくってね！');

    // 即座に第1問を準備
    this.nextRound();
  }

  setSpeech(text) {
    if (this.speechTextEl) {
      this.speechTextEl.textContent = text;
    }
  }

  nextRound() {
    this.currentWordData = this.shuffledWords[this.wordIndex % this.shuffledWords.length];
    this.wordIndex++;

    this.placedLetters = [];
    this.characterManager.setState('idle');
    this.setSpeech(`『${this.currentWordData.word}』の もじを ならべてね！`);

    // タイル一覧の生成（正解の文字 + ダミー1個をシャッフル）
    const dummy = this.currentWordData.dummies[Math.floor(Math.random() * this.currentWordData.dummies.length)];
    const tileList = [...this.currentWordData.letters, dummy].map((char, id) => ({
      id: `tile_${id}_${char}`,
      char: char,
      isUsed: false
    })).sort(() => Math.random() - 0.5);

    this.availableTiles = tileList;
    this.app.startTimer(10);

    this.render();
  }

  render() {
    if (!this.targetClueEl) {
      this.targetClueEl = document.getElementById('hiragana-word-target-clue');
      this.slotsContainerEl = document.getElementById('hiragana-word-slots-container');
      this.tilesContainerEl = document.getElementById('hiragana-word-tiles-container');
    }

    // 1. お題ヒント（絵文字と読み）
    if (this.targetClueEl) {
      this.targetClueEl.innerHTML = `
        <div class="word-clue-badge">
          <span class="word-clue-emoji">${this.currentWordData.emoji}</span>
          <span class="word-clue-text">${this.currentWordData.word}</span>
        </div>
      `;
    }

    // 2. スロット（枠）
    if (this.slotsContainerEl) {
      this.slotsContainerEl.innerHTML = '';
      const totalLen = this.currentWordData.letters.length;

      for (let i = 0; i < totalLen; i++) {
        const slotEl = document.createElement('div');
        slotEl.className = 'word-slot-box';

        const placedTile = this.placedLetters[i];
        if (placedTile) {
          slotEl.classList.add('filled');
          slotEl.textContent = placedTile.char;
          // タップで元に戻す
          slotEl.addEventListener('click', () => this.removeLetter(i));
        } else {
          slotEl.textContent = (i === this.placedLetters.length) ? '👇' : '';
          if (i === this.placedLetters.length) slotEl.classList.add('active-slot');
        }

        this.slotsContainerEl.appendChild(slotEl);
      }
    }

    // 3. タイル選択候補
    if (this.tilesContainerEl) {
      this.tilesContainerEl.innerHTML = '';
      this.availableTiles.forEach(tile => {
        const tileBtn = document.createElement('button');
        tileBtn.className = 'word-tile-btn' + (tile.isUsed ? ' used' : '');
        tileBtn.textContent = tile.char;

        if (!tile.isUsed) {
          tileBtn.addEventListener('click', () => this.chooseTile(tile));
        }

        this.tilesContainerEl.appendChild(tileBtn);
      });
    }
  }

  chooseTile(tile) {
    if (this.placedLetters.length >= this.currentWordData.letters.length) return;

    tile.isUsed = true;
    this.placedLetters.push(tile);
    window.soundSystem.playPop();

    // ひらがな単音再生（もしあれば）
    const charVoices = {
      'あ': 'hira_a', 'い': 'hira_i', 'う': 'hira_u', 'え': 'hira_e', 'お': 'hira_o',
      'か': 'hira_ka', 'き': 'hira_ki', 'く': 'hira_ku', 'け': 'hira_ke', 'こ': 'hira_ko',
      'さ': 'hira_sa', 'し': 'hira_shi', 'す': 'hira_su', 'せ': 'hira_se', 'そ': 'hira_so',
      'た': 'hira_ta', 'ち': 'hira_chi', 'つ': 'hira_tsu', 'て': 'hira_te', 'と': 'hira_to',
      'な': 'hira_na', 'に': 'hira_ni', 'ぬ': 'hira_nu', 'ね': 'hira_ne', 'の': 'hira_no',
      'は': 'hira_ha', 'ひ': 'hira_hi', 'ふ': 'hira_fu', 'へ': 'hira_he', 'ほ': 'hira_ho',
      'ま': 'hira_ma', 'み': 'hira_mi', 'む': 'hira_mu', 'め': 'hira_me', 'も': 'hira_mo',
      'や': 'hira_ya', 'ゆ': 'hira_yu', 'よ': 'hira_yo',
      'ら': 'hira_ra', 'り': 'hira_ri', 'る': 'hira_ru', 'れ': 'hira_re', 'ろ': 'hira_ro',
      'わ': 'hira_wa', 'ん': 'hira_nn'
    };
    if (charVoices[tile.char]) {
      window.soundSystem.playVoice(charVoices[tile.char]);
    }

    this.render();

    // 全文字揃ったかチェック
    if (this.placedLetters.length === this.currentWordData.letters.length) {
      this.checkWord();
    } else {
      this.app.startTimer(10);
    }
  }

  removeLetter(slotIdx) {
    const tile = this.placedLetters[slotIdx];
    if (!tile) return;

    tile.isUsed = false;
    this.placedLetters.splice(slotIdx, 1);
    window.soundSystem.playPop();
    this.render();
  }

  checkWord() {
    const formedWord = this.placedLetters.map(t => t.char).join('');
    const targetWord = this.currentWordData.letters.join('');

    if (formedWord === targetWord) {
      // 大正解！
      this.app.stopTimer();
      this.characterManager.setState('eating');
      window.soundSystem.playMunch();
      window.soundSystem.playSparkle();

      setTimeout(() => {
        window.soundSystem.playFanfare();
        window.soundSystem.playVoice(this.currentWordData.voiceKey);
        this.setSpeech(`もぐもぐ！おいしい！ 『${this.currentWordData.word}』の かんせい！`);

        const rect = this.slotsContainerEl.getBoundingClientRect();
        this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

        this.earnedStamps++;
        this.app.updateStamps(this.earnedStamps, this.maxStamps);

        setTimeout(() => {
          if (this.earnedStamps >= this.maxStamps) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 1800);
      }, 600);

    } else {
      // 不正解：やり直し
      if (this.slotsContainerEl) {
        this.slotsContainerEl.classList.add('shake-slots');
      }
      window.soundSystem.playPop();
      this.setSpeech('あれれ？ もういちど ならべてみよう！');

      setTimeout(() => {
        if (this.slotsContainerEl) {
          this.slotsContainerEl.classList.remove('shake-slots');
        }
        this.availableTiles.forEach(t => t.isUsed = false);
        this.placedLetters = [];
        this.render();
      }, 700);
    }
  }
}
