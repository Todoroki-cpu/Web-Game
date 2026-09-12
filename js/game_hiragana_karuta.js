/**
 * game_hiragana_karuta.js - サンリオ風 キャラクターかるた大会
 * キャラクター：キティ風 (kitty) または メロディ風 (melody)
 */

class GameHiraganaKaruta {
  constructor(app) {
    this.app = app;
    this.characterManager = null;
    this.speechTextEl = null;
    this.cardsGridEl = null;
    this.charStage = 'hiragana-karuta-character-stage';

    this.earnedStamps = 0;
    this.maxStamps = 5;
    this.currentQuestion = null;
    this.isAnswering = false;

    this.questions = [
      {
        char: 'り',
        word: 'りんご',
        emoji: '🍎',
        voiceKey: 'karuta_q_ringo',
        speech: '「りんご」の 【り】 は どれかな？'
      },
      {
        char: 'う',
        word: 'うさぎ',
        emoji: '🐰',
        voiceKey: 'karuta_q_usagi',
        speech: '「うさぎ」の 【う】 を タッチしてね！'
      },
      {
        char: 'ね',
        word: 'ねこ',
        emoji: '🐱',
        voiceKey: 'karuta_q_neko',
        speech: '「ねこ」の 【ね】 は どれかな？'
      },
      {
        char: 'く',
        word: 'くま',
        emoji: '🐻',
        voiceKey: 'karuta_q_kuma',
        speech: '「くま」の 【く】 を タッチしてね！'
      },
      {
        char: 'さ',
        word: 'さかな',
        emoji: '🐟',
        voiceKey: 'karuta_q_sakana',
        speech: '「さかな」の 【さ】 は どれかな？'
      },
      {
        char: 'と',
        word: 'とり',
        emoji: '🐦',
        voiceKey: 'karuta_q_tori',
        speech: '「とり」の 【と】 を タッチしてね！'
      }
    ];

    this.dummyChars = ['あ', 'い', 'え', 'お', 'か', 'き', 'す', 'せ', 'た', 'ち', 'て', 'な', 'に', 'は', 'ほ', 'ま', 'み', 'め', 'も', 'よ', 'ろ', 'わ'];

    this.initDOM();
  }

  initDOM() {
    this.speechTextEl = document.getElementById('hiragana-karuta-speech-text');
    this.cardsGridEl = document.getElementById('hiragana-karuta-cards-grid');
    const bubbleEl = document.getElementById('hiragana-karuta-speech-bubble');
    if (bubbleEl) {
      bubbleEl.addEventListener('click', () => {
        if (this.currentQuestion) {
          window.soundSystem.playVoice(this.currentQuestion.voiceKey);
        }
      });
    }
  }

  start() {
    if (!this.characterManager) {
      this.characterManager = new CharacterManager(this.charStage);
    }
    this.characterManager.setCharacter('kitty'); // キティ風
    this.characterManager.setState('idle');

    this.earnedStamps = 0;
    this.app.updateStamps(0, this.maxStamps);
    this.isAnswering = false;

    // 出題順をシャッフル
    this.shuffledQuestions = [...this.questions].sort(() => Math.random() - 0.5);
    this.questionIndex = 0;

    window.soundSystem.playVoice('karuta_prompt');
    this.setSpeech('よまれた ひらがなカードを パチンと タッチしてね！');

    // 即座に第1問を準備
    this.nextRound();
  }

  setSpeech(text) {
    if (this.speechTextEl) {
      this.speechTextEl.textContent = text;
    }
  }

  nextRound() {
    this.isAnswering = true;
    this.currentQuestion = this.shuffledQuestions[this.questionIndex % this.shuffledQuestions.length];
    this.questionIndex++;

    this.characterManager.setState('talking');
    this.setSpeech(this.currentQuestion.speech);
    window.soundSystem.playVoice(this.currentQuestion.voiceKey);

    setTimeout(() => {
      if (this.characterManager && this.characterManager.state === 'talking') {
        this.characterManager.setState('idle');
      }
    }, 2000);

    // 選択肢カードの作成（正解1枚 + ダミー5枚 = 6枚）
    const choices = [{
      char: this.currentQuestion.char,
      word: this.currentQuestion.word,
      emoji: this.currentQuestion.emoji,
      isCorrect: true
    }];

    const availableDummies = this.dummyChars.filter(c => c !== this.currentQuestion.char);
    const shuffledDummies = [...availableDummies].sort(() => Math.random() - 0.5).slice(0, 5);

    shuffledDummies.forEach(dChar => {
      choices.push({
        char: dChar,
        word: '',
        emoji: '',
        isCorrect: false
      });
    });

    const randomizedChoices = choices.sort(() => Math.random() - 0.5);
    this.renderCards(randomizedChoices);
    this.app.startTimer(10);
  }

  renderCards(choices) {
    if (!this.cardsGridEl) {
      this.cardsGridEl = document.getElementById('hiragana-karuta-cards-grid');
    }
    if (!this.cardsGridEl) return;
    this.cardsGridEl.innerHTML = '';

    choices.forEach(c => {
      const cardEl = document.createElement('div');
      cardEl.className = 'karuta-card-3d';

      cardEl.innerHTML = `
        <div class="karuta-card-inner">
          <div class="karuta-card-front">
            <span class="karuta-char-text">${c.char}</span>
          </div>
          <div class="karuta-card-back">
            <span class="karuta-back-emoji">${c.emoji || '⭐'}</span>
            <span class="karuta-back-word">${c.word || c.char}</span>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', (e) => this.handleCardClick(cardEl, c, e));
      this.cardsGridEl.appendChild(cardEl);
    });
  }

  handleCardClick(cardEl, choice, e) {
    if (!this.isAnswering) return;

    if (choice.isCorrect) {
      this.isAnswering = false;
      this.app.stopTimer();
      cardEl.classList.add('flipped', 'correct-karuta');
      window.soundSystem.playStamp();
      window.soundSystem.playSparkle();

      const rect = cardEl.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

      this.characterManager.setState('celebrate');
      window.soundSystem.playVoice('karuta_hit');
      this.setSpeech(`パチン！ だいせいかい！ 『${choice.char}』の 『${choice.word}』！`);

      this.earnedStamps++;
      this.app.updateStamps(this.earnedStamps, this.maxStamps);

      setTimeout(() => {
        if (this.earnedStamps >= this.maxStamps) {
          this.app.showCompleteModal();
        } else {
          this.nextRound();
        }
      }, 1600);

    } else {
      cardEl.classList.add('shake-card');
      window.soundSystem.playPop();
      setTimeout(() => {
        cardEl.classList.remove('shake-card');
      }, 500);
    }
  }
}
