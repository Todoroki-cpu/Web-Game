/**
 * game_shiritori_quiz.js - しりとり つなぎゲーム (Shiritori Connect Game)
 * 
 * 3択のカードから正しい「つなぎ文字」の言葉を選んで、10回連続でしりとりを完成させよう！
 * 50音の繋がり（前の文字の「おしり」と次の文字の「あたま」）を視覚と音声で楽しく学べます。
 */

class GameShiritoriQuiz {
  constructor(app) {
    this.app = app;
    this.totalGoal = 10;
    this.currentScore = 0;
    this.isLocked = false;
    this.currentWord = null;
    this.historyChain = [];

    // 豊富な単語データベース（頭文字・末尾文字・絵文字・SVG・カラー）
    this.wordsDb = [
      {
        id: 'ringo', word: 'りんご', head: 'り', tail: 'ご', emoji: '🍎',
        theme: '#ff6b81', bg: '#fff0f3', desc: 'まっかなりんご',
        svg: () => this.getRingoSvg()
      },
      {
        id: 'gorira', word: 'ごりら', head: 'ご', tail: 'ら', emoji: '🦍',
        theme: '#2f3542', bg: '#f1f2f6', desc: 'つよいぞ ごりら',
        svg: () => this.getGorillaSvg()
      },
      {
        id: 'rappa', word: 'らっぱ', head: 'ら', tail: 'ぱ', emoji: '🎺',
        theme: '#f1c40f', bg: '#fff9db', desc: 'パッパラパー らっぱ',
        svg: () => this.getRappaSvg()
      },
      {
        id: 'pantsu', word: 'ぱんつ', head: 'ぱ', tail: 'つ', emoji: '🩲',
        theme: '#1e90ff', bg: '#e7f5ff', desc: 'みずたま ぱんつ',
        svg: () => this.getPantsuSvg()
      },
      {
        id: 'tsubame', word: 'つばめ', head: 'つ', tail: 'め', emoji: '🕊️',
        theme: '#3742fa', bg: '#edf2ff', desc: 'おそらをとぶ つばめ',
        svg: () => this.getTsubameSvg()
      },
      {
        id: 'megane', word: 'めがね', head: 'め', tail: 'ね', emoji: '👓',
        theme: '#f368e0', bg: '#fff0f6', desc: 'まんまる めがね',
        svg: () => this.getMeganeSvg()
      },
      {
        id: 'neko', word: 'ねこ', head: 'ね', tail: 'こ', emoji: '🐱',
        theme: '#ff9f43', bg: '#fff4e6', desc: 'かわいい ねこさん',
        svg: () => this.getNekoSvg()
      },
      {
        id: 'koara', word: 'こあら', head: 'こ', tail: 'ら', emoji: '🐨',
        theme: '#10ac84', bg: '#ebfbee', desc: 'ユーカリのきに こあら',
        svg: () => this.getKoaraSvg()
      },
      {
        id: 'rajio', word: 'らじお', head: 'ら', tail: 'お', emoji: '📻',
        theme: '#00d2d3', bg: '#e3fafc', desc: 'おとのなる らじお',
        svg: () => this.getRajioSvg()
      },
      {
        id: 'oshiri', word: 'おしり', head: 'お', tail: 'り', emoji: '🍑',
        theme: '#ff4757', bg: '#ffe3e3', desc: 'ぷりぷり おしり',
        svg: () => this.getOshiriSvg()
      },
      {
        id: 'risu', word: 'りす', head: 'り', tail: 'す', emoji: '🐿️',
        theme: '#e67e22', bg: '#fff3bf', desc: 'どんぐり だいすきりす',
        svg: () => this.getRisuSvg()
      },
      {
        id: 'suika', word: 'すいか', head: 'す', tail: 'か', emoji: '🍉',
        theme: '#2ed573', bg: '#ebfbee', desc: 'あまーい すいか',
        svg: () => this.getSuikaSvg()
      },
      {
        id: 'karasu', word: 'からす', head: 'か', tail: 'す', emoji: '🐦‍⬛',
        theme: '#343a40', bg: '#f8f9fa', desc: 'カァーカァー からす',
        svg: () => this.getKarasuSvg()
      },
      {
        id: 'suzu', word: 'すず', head: 'す', tail: 'ず', emoji: '🔔',
        theme: '#f59f00', bg: '#fff9db', desc: 'チリンチリン すず',
        svg: () => this.getSuzuSvg()
      },
      {
        id: 'zuwaigani', word: 'ずわいがに', head: 'ず', tail: 'に', emoji: '🦀',
        theme: '#f76707', bg: '#ffe8cc', desc: 'チョキチョキ かにさん',
        svg: () => this.getZuwaiganiSvg()
      },
      {
        id: 'nichiyoubi', word: 'にちようび', head: 'に', tail: 'び', emoji: '☀️',
        theme: '#ff6b6b', bg: '#fff0f6', desc: 'ぽかぽか にちようび',
        svg: () => this.getNichiyoubiSvg()
      },
      {
        id: 'biru', word: 'びーる', head: 'び', tail: 'る', emoji: '🍺',
        theme: '#fab005', bg: '#fff9db', desc: 'あわあわ ドリンク',
        svg: () => this.getBiruSvg()
      },
      {
        id: 'ruto', word: 'るーと', head: 'る', tail: 'と', emoji: '🗺️',
        theme: '#0ca678', bg: '#e6fcf5', desc: 'たのしい ルート',
        svg: () => this.getRutoSvg()
      },
      {
        id: 'toraianguru', word: 'とらいあんぐる', head: 'と', tail: 'る', emoji: '🔺',
        theme: '#7950f2', bg: '#f3f0ff', desc: 'チーンと ひびく がっき',
        svg: () => this.getToraianguruSvg()
      },
      {
        id: 'ruretto', word: 'るーれっと', head: 'る', tail: 'と', emoji: '🎡',
        theme: '#f03e3e', bg: '#fff3bf', desc: 'くるくる ルーレット',
        svg: () => this.getRurettoSvg()
      },
      {
        id: 'tomato', word: 'とまと', head: 'と', tail: 'と', emoji: '🍅',
        theme: '#e84118', bg: '#fff0f3', desc: 'まっかな とまと',
        svg: () => this.getTomatoSvg()
      },
      {
        id: 'rakuda', word: 'らくだ', head: 'ら', tail: 'だ', emoji: '🐪',
        theme: '#e67e22', bg: '#fef5e7', desc: 'こぶのある らくだ',
        svg: () => this.getRakudaSvg()
      },
      {
        id: 'dango', word: 'だんご', head: 'だ', tail: 'ご', emoji: '🍡',
        theme: '#2ed573', bg: '#eaFAF1', desc: '３しょく だんご',
        svg: () => this.getDangoSvg()
      },
      {
        id: 'kame', word: 'かめ', head: 'か', tail: 'め', emoji: '🐢',
        theme: '#10ac84', bg: '#e8f8f5', desc: 'のそのそ かめさん',
        svg: () => this.getKameSvg()
      },
      {
        id: 'medaka', word: 'めだか', head: 'め', tail: 'か', emoji: '🐟',
        theme: '#339af0', bg: '#ebf5fb', desc: 'すいすい めだか',
        svg: () => this.getMedakaSvg()
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-shiritori-quiz');
  }

  start() {
    this.containerEl = document.getElementById('view-game-shiritori-quiz');
    this.currentScore = 0;
    this.isLocked = false;
    this.historyChain = [];
    this.app.updateStamps(0, this.totalGoal);

    // スタート単語を「りんご」から開始
    const startWord = this.wordsDb.find(w => w.id === 'ringo') || this.wordsDb[0];
    this.currentWord = startWord;
    this.historyChain.push(startWord);

    this.renderStage();
    this.showRound();
  }

  stop() {
    this.isLocked = false;
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="shiri-quiz-root" id="shiri-quiz-root">
        
        <!-- 上部ヘッダー（文字を減らし、スターとアイコン中心に） -->
        <header class="shiri-quiz-top-bar">
          <div class="shiri-quiz-title-pill">
            <span class="quiz-icon">🧩</span>
            <span class="quiz-title-text">しりとり</span>
          </div>

          <div class="shiri-quiz-progress-badge">
            <span class="progress-star">⭐</span>
            <span class="progress-text" id="shiri-quiz-progress-text">1 / ${this.totalGoal}</span>
          </div>
        </header>

        <!-- メインステージ -->
        <main class="shiri-quiz-main-stage">
          
          <!-- 現在の単語＆つなぎ文字エリア（直感的な絵と矢印の繋がり） -->
          <div class="shiri-target-card" id="shiri-target-card" title="タップでおとをきく">
            <div class="target-illustration-wrap" id="shiri-current-svg">
              <!-- 現在の単語イラスト -->
            </div>

            <div class="target-connection-row">
              <!-- 言葉の表記（最後のおしり文字を特大バルーンで強調） -->
              <div class="target-word-display" id="shiri-target-word-display">
                <span class="word-body-part" id="shiri-target-prefix">りん</span>
                <span class="char-bubble-tail pulse-anim" id="shiri-target-tail">ご</span>
              </div>

              <!-- つなぐ矢印 -->
              <span class="connect-flow-arrow">➔</span>

              <!-- 次にさがす文字のターゲット枠 -->
              <div class="target-match-bubble">
                <span class="match-question-mark" id="shiri-next-target-char">ご</span>
              </div>

              <!-- 音声リプレイボタン -->
              <button class="target-voice-btn" id="shiri-prompt-voice-btn" title="もういちど きく">
                🔊
              </button>
            </div>
          </div>

          <!-- 3択の選択肢カード（絵を最大化・文字はシンプルに頭文字バルーンを同色マッチ） -->
          <div class="shiri-choices-container" id="shiri-choices-container">
            <!-- 3枚の選択肢カードが動的に生成されます -->
          </div>

        </main>

        <!-- 下部：つながった絵のトレインリボン（文字をなくして絵だけで直感表示） -->
        <footer class="shiri-bottom-train">
          <div class="train-scroll-track" id="shiri-train-track">
            <!-- つながったカードが順番に連結されます -->
          </div>
        </footer>

        <!-- 10回達成 クリアモーダル -->
        <div class="shiri-finish-modal" id="shiri-finish-modal">
          <div class="shiri-modal-card pop-in">
            <div class="finish-crown-icon">👑 ✨ 🌈 ✨ 👑</div>
            <h2 class="finish-modal-title">10こ つながったよ！🎉</h2>
            <div class="finish-stars-row">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</div>
            <button class="primary-btn" id="shiri-retry-btn">🔄 もう１かい</button>
          </div>
        </div>

      </div>
    `;

    this.renderTrainTrack();
    this.bindEvents();
  }

  renderTrainTrack() {
    const track = document.getElementById('shiri-train-track');
    if (!track) return;
    track.innerHTML = '';

    // 先頭の機関車アイコン
    const engine = document.createElement('div');
    engine.className = 'train-car-engine';
    engine.textContent = '🚂';
    track.appendChild(engine);

    this.historyChain.forEach((item, idx) => {
      const node = document.createElement('div');
      node.className = `train-car-node ${idx === this.historyChain.length - 1 ? 'latest' : ''}`;
      node.title = item.word;
      node.innerHTML = `
        <span class="train-node-emoji">${item.emoji}</span>
      `;
      // タップでその絵の言葉を発声！
      node.addEventListener('click', () => {
        window.soundSystem.playPop();
        this.speakWord(item.word);
      });
      track.appendChild(node);

      if (idx < this.historyChain.length - 1) {
        const link = document.createElement('span');
        link.className = 'train-connector-arrow';
        link.textContent = '➔';
        track.appendChild(link);
      }
    });

    // 最新のカードが見えるようにスクロール
    setTimeout(() => {
      track.scrollLeft = track.scrollWidth;
    }, 50);
  }

  bindEvents() {
    const targetCard = document.getElementById('shiri-target-card');
    if (targetCard) {
      targetCard.addEventListener('click', (e) => {
        // ボタン自体のクリック以外でもカード全体タップで音声
        window.soundSystem.playSparkle();
        if (this.currentWord) {
          this.speakQuestion(this.currentWord.word, this.currentWord.tail);
        }
      });
    }

    const retryBtn = document.getElementById('shiri-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const modal = document.getElementById('shiri-finish-modal');
        if (modal) modal.classList.remove('show');
        this.start();
      });
    }
  }

  showRound() {
    if (this.currentScore >= this.totalGoal) {
      this.handleComplete();
      return;
    }

    this.isLocked = false;
    const tail = this.currentWord.tail;
    const word = this.currentWord.word;

    // プログレスバー
    const progText = document.getElementById('shiri-quiz-progress-text');
    if (progText) progText.textContent = `${this.currentScore + 1} / ${this.totalGoal}`;
    this.app.updateStamps(this.currentScore, this.totalGoal);

    // 言葉の先頭部分と末尾文字に分解（例: "りんご" -> prefix="りん", tail="ご"）
    const prefix = word.endsWith(tail) ? word.slice(0, word.length - tail.length) : word;

    const prefixEl = document.getElementById('shiri-target-prefix');
    const tailEl = document.getElementById('shiri-target-tail');
    const nextCharEl = document.getElementById('shiri-next-target-char');
    const svgEl = document.getElementById('shiri-current-svg');

    if (prefixEl) prefixEl.textContent = prefix;
    if (tailEl) tailEl.textContent = tail;
    if (nextCharEl) nextCharEl.textContent = tail;
    if (svgEl) svgEl.innerHTML = this.currentWord.svg();

    // 直感的な短い音声ガイダンス（「りんご！ つぎは 『ご』！」）
    this.speakQuestion(word, tail);

    // 3択の候補カードを生成（正解1個 ＋ ダミー2個）
    this.renderChoices(tail);
    this.renderTrainTrack();
  }

  renderChoices(targetHeadChar) {
    const container = document.getElementById('shiri-choices-container');
    if (!container) return;
    container.innerHTML = '';

    // 正解候補（頭文字が targetHeadChar の単語）
    const correctCandidates = this.wordsDb.filter(w => w.head === targetHeadChar && w.id !== this.currentWord.id);
    let correctWord;
    if (correctCandidates.length > 0) {
      correctWord = correctCandidates[Math.floor(Math.random() * correctCandidates.length)];
    } else {
      correctWord = this.wordsDb.find(w => w.head === targetHeadChar) || this.wordsDb[0];
    }

    // ダミー候補（頭文字が targetHeadChar と異なる単語2つ）
    const wrongCandidates = this.wordsDb.filter(w => w.head !== targetHeadChar && w.id !== this.currentWord.id);
    const shuffledWrongs = [...wrongCandidates].sort(() => Math.random() - 0.5);
    const dummy1 = shuffledWrongs[0] || this.wordsDb[1];
    const dummy2 = shuffledWrongs[1] || this.wordsDb[2];

    const choices = [correctWord, dummy1, dummy2].sort(() => Math.random() - 0.5);

    choices.forEach((choice, idx) => {
      const card = document.createElement('div');
      const isCorrect = choice.id === correctWord.id;
      card.className = `shiri-choice-card choice-slot-${idx} pop-in`;
      
      // 頭文字と残りの文字に分解（例: "ごりら" -> head="ご", rest="りら"）
      const rest = choice.word.startsWith(choice.head) ? choice.word.slice(choice.head.length) : '';

      card.innerHTML = `
        <div class="choice-illustration">
          ${choice.svg()}
        </div>
        <div class="choice-word-bubble-row">
          <span class="char-bubble-head ${isCorrect ? 'match-target-glow' : ''}">${choice.head}</span>
          <span class="char-rest-text">${rest}</span>
        </div>
        <div class="choice-check-mark" id="choice-mark-${choice.id}"></div>
      `;

      card.addEventListener('click', () => {
        if (this.isLocked) return;
        this.handleChoiceSelect(choice, isCorrect, card);
      });

      container.appendChild(card);
    });
  }

  handleChoiceSelect(selectedWord, isCorrect, cardEl) {
    // どのカードを押してもまずその絵の名前を発声（聴覚と視覚の直感リンク）
    this.speakWord(selectedWord.word);

    if (isCorrect) {
      // 🎉 大正解！
      this.isLocked = true;
      this.currentScore++;
      this.historyChain.push(selectedWord);
      this.currentWord = selectedWord;

      cardEl.classList.add('correct-glow');
      const mark = cardEl.querySelector('.choice-check-mark');
      if (mark) mark.textContent = '⭕';

      window.soundSystem.playSparkle();
      window.soundSystem.playJewelTone(this.currentScore);

      const rect = cardEl.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

      setTimeout(() => {
        this.showRound();
      }, 1200);

    } else {
      // ❌ 不正解（やさしく揺れて再挑戦）
      window.soundSystem.playPop();
      cardEl.classList.add('wrong-shake');
      const mark = cardEl.querySelector('.choice-check-mark');
      if (mark) mark.textContent = '❌';

      setTimeout(() => {
        cardEl.classList.remove('wrong-shake');
        if (mark) mark.textContent = '';
      }, 600);
    }
  }

  speakQuestion(word, tailChar) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // 直感的に伝わるシンプルなリズム発声: 「りんご！ つぎは 『ご』！」
        const utter = new SpeechSynthesisUtterance(`${word}！ つぎは、${tailChar}！`);
        utter.lang = 'ja-JP';
        utter.rate = 1.0;
        utter.pitch = 1.35;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  speakWord(word) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = 'ja-JP';
        utter.rate = 0.95;
        utter.pitch = 1.4;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  handleComplete() {
    this.isLocked = true;
    this.app.updateStamps(this.totalGoal, this.totalGoal);
    window.soundSystem.playFanfare();
    window.soundSystem.playMagicChime();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const modal = document.getElementById('shiri-finish-modal');
    if (modal) modal.classList.add('show');
  }

  // ==========================================
  // SVG イラストレーション集
  // ==========================================

  getRingoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M100 55 Q102 30 120 25" stroke="#8d5b4c" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M105 45 Q135 30 140 50 Q115 58 105 45" fill="#69db7c" />
        <path d="M100 60 C70 50 40 70 40 110 C40 155 70 175 100 170 C130 175 160 155 160 110 C160 70 130 50 100 60 Z" fill="#ff4757" />
        <circle cx="70" cy="95" r="8" fill="#ffffff" opacity="0.4" />
        <circle cx="85" cy="120" r="3.5" fill="#491212" />
        <circle cx="115" cy="120" r="3.5" fill="#491212" />
        <path d="M94 130 Q100 138 106 130" stroke="#491212" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getGorillaSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M60 100 C35 120 40 175 100 175 C160 175 165 120 140 100 Z" fill="#495057" />
        <circle cx="60" cy="75" r="10" fill="#343a40" />
        <circle cx="140" cy="75" r="10" fill="#343a40" />
        <ellipse cx="100" cy="75" rx="38" ry="34" fill="#343a40" />
        <path d="M78 68 C78 58 92 60 100 65 C108 60 122 58 122 68 C122 85 115 92 100 92 C85 92 78 85 78 68 Z" fill="#ced4da" />
        <circle cx="88" cy="72" r="3.5" fill="#212529" />
        <circle cx="112" cy="72" r="3.5" fill="#212529" />
        <ellipse cx="95" cy="80" rx="2" ry="3" fill="#495057" />
        <ellipse cx="105" cy="80" rx="2" ry="3" fill="#495057" />
        <path d="M94 86 Q100 90 106 86" stroke="#212529" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    `;
  }

  getRappaSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M135 60 C160 45 170 110 135 125 C120 115 120 70 135 60 Z" fill="#fcc419" />
        <ellipse cx="150" cy="92" rx="10" ry="30" fill="#ffe066" />
        <path d="M50 95 L135 90 L135 98 L50 101 Z" fill="#fcc419" />
        <path d="M65 80 C65 70 105 70 105 80 L105 105 C105 115 65 115 65 105 Z" fill="none" stroke="#fab005" stroke-width="5" />
        <rect x="40" y="93" width="12" height="10" rx="3" fill="#ffd43b" />
        <text x="160" y="70" font-size="20" fill="#f59f00">♪</text>
      </svg>
    `;
  }

  getPantsuSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M45 75 C45 68 155 68 155 75 L145 140 C120 152 112 128 100 128 C88 128 80 152 55 140 Z" fill="#74c0fc" />
        <path d="M45 75 Q100 72 155 75" stroke="#339af0" stroke-width="6" fill="none" stroke-linecap="round" />
        <circle cx="70" cy="95" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="100" cy="90" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="130" cy="95" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="85" cy="115" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="115" cy="115" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="100" cy="78" r="4" fill="#ff8787" />
      </svg>
    `;
  }

  getTsubameSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M100 125 L70 175 L100 145 L130 175 Z" fill="#364fc7" />
        <path d="M100 90 Q40 50 15 70 Q60 95 100 110 Z" fill="#4263eb" />
        <path d="M100 90 Q160 50 185 70 Q140 95 100 110 Z" fill="#4263eb" />
        <ellipse cx="100" cy="95" rx="22" ry="36" fill="#364fc7" />
        <ellipse cx="100" cy="100" rx="14" ry="20" fill="#f8f9fa" />
        <circle cx="100" cy="60" r="14" fill="#364fc7" />
        <polygon points="100,46 95,55 105,55" fill="#fcc419" />
        <circle cx="95" cy="60" r="2.5" fill="#ffffff" />
        <circle cx="95" cy="60" r="1.5" fill="#000000" />
        <circle cx="105" cy="60" r="2.5" fill="#ffffff" />
        <circle cx="105" cy="60" r="1.5" fill="#000000" />
      </svg>
    `;
  }

  getMeganeSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <circle cx="62" cy="100" r="28" fill="#e7f5ff" stroke="#f06595" stroke-width="7" />
        <circle cx="138" cy="100" r="28" fill="#e7f5ff" stroke="#f06595" stroke-width="7" />
        <path d="M90 96 Q100 88 110 96" stroke="#f06595" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M34 97 Q20 92 15 102" stroke="#f06595" stroke-width="5" fill="none" stroke-linecap="round" />
        <path d="M166 97 Q180 92 185 102" stroke="#f06595" stroke-width="5" fill="none" stroke-linecap="round" />
        <text x="92" y="65" font-size="18" fill="#ffd43b">✨</text>
      </svg>
    `;
  }

  getNekoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <ellipse cx="100" cy="135" rx="40" ry="32" fill="#ffa94d" />
        <ellipse cx="100" cy="85" rx="36" ry="30" fill="#ffa94d" />
        <polygon points="70,72 60,40 90,58" fill="#ffa94d" />
        <polygon points="70,68 65,46 85,60" fill="#ffc9c9" />
        <polygon points="130,72 140,40 110,58" fill="#ffa94d" />
        <polygon points="130,68 135,46 115,60" fill="#ffc9c9" />
        <circle cx="85" cy="82" r="3.5" fill="#212529" />
        <circle cx="115" cy="82" r="3.5" fill="#212529" />
        <polygon points="100,90 96,94 104,94" fill="#ff8787" />
        <path d="M95 96 Q100 100 105 96" stroke="#495057" stroke-width="2" fill="none" />
      </svg>
    `;
  }

  getKoaraSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M40 25 L40 175" stroke="#8d5b4c" stroke-width="18" stroke-linecap="round" />
        <ellipse cx="100" cy="120" rx="34" ry="30" fill="#adb5bd" />
        <circle cx="70" cy="62" r="18" fill="#868e96" />
        <circle cx="70" cy="62" r="11" fill="#f8f9fa" />
        <circle cx="130" cy="62" r="18" fill="#868e96" />
        <circle cx="130" cy="62" r="11" fill="#f8f9fa" />
        <ellipse cx="100" cy="72" rx="30" ry="26" fill="#adb5bd" />
        <ellipse cx="100" cy="78" rx="9" ry="14" fill="#343a40" />
        <circle cx="85" cy="70" r="3" fill="#212529" />
        <circle cx="115" cy="70" r="3" fill="#212529" />
      </svg>
    `;
  }

  getRajioSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <line x1="68" y1="65" x2="40" y2="35" stroke="#868e96" stroke-width="4" stroke-linecap="round" />
        <rect x="40" y="65" width="120" height="85" rx="16" fill="#66d9e8" stroke="#15aabf" stroke-width="4" />
        <circle cx="80" cy="108" r="24" fill="#ffffff" stroke="#22b8cf" stroke-width="3" />
        <circle cx="80" cy="108" r="8" fill="#15aabf" />
        <circle cx="130" cy="115" r="11" fill="#ffd43b" />
        <rect x="115" y="80" width="32" height="15" rx="3" fill="#ffffff" />
      </svg>
    `;
  }

  getOshiriSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M100 135 C60 165 40 130 40 95 C40 60 70 55 100 80 C130 55 160 60 160 95 C160 130 140 165 100 135 Z" fill="#ffc9c9" stroke="#ff8787" stroke-width="4" />
        <path d="M100 80 L100 132" stroke="#ff6b6b" stroke-width="3.5" stroke-linecap="round" />
        <text x="45" y="55" font-size="18" fill="#ff6b6b">💖</text>
      </svg>
    `;
  }

  getRisuSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M110 135 C155 150 175 105 160 65 C148 40 120 45 116 65 C112 85 140 95 130 120 Z" fill="#e8590c" />
        <ellipse cx="90" cy="125" rx="26" ry="30" fill="#d9480f" />
        <ellipse cx="80" cy="80" rx="20" ry="18" fill="#d9480f" />
        <circle cx="72" cy="78" r="3.5" fill="#212529" />
        <circle cx="65" cy="65" r="5" fill="#d9480f" />
        <circle cx="85" cy="110" r="7" fill="#f76707" />
      </svg>
    `;
  }

  getSuikaSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M35 100 A65 65 0 0 0 165 100 Z" fill="#2b8a3e" />
        <path d="M40 100 A60 60 0 0 0 160 100 Z" fill="#e9fac8" />
        <path d="M45 100 A55 55 0 0 0 155 100 Z" fill="#ff6b6b" />
        <ellipse cx="70" cy="112" rx="2.5" ry="4" fill="#212529" />
        <ellipse cx="100" cy="122" rx="2.5" ry="4" fill="#212529" />
        <ellipse cx="130" cy="112" rx="2.5" ry="4" fill="#212529" />
      </svg>
    `;
  }

  getKarasuSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <ellipse cx="100" cy="110" rx="34" ry="38" fill="#343a40" />
        <circle cx="80" cy="75" r="24" fill="#343a40" />
        <polygon points="60,75 25,85 62,88" fill="#fcc419" />
        <circle cx="72" cy="72" r="5" fill="#ffffff" />
        <circle cx="70" cy="72" r="3" fill="#000000" />
      </svg>
    `;
  }

  getSuzuSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <circle cx="100" cy="105" r="44" fill="#fcc419" stroke="#fab005" stroke-width="5" />
        <rect x="60" y="98" width="80" height="10" rx="5" fill="#ffd43b" />
        <circle cx="100" cy="124" r="7" fill="#d9480f" />
        <line x1="72" y1="124" x2="128" y2="124" stroke="#d9480f" stroke-width="4" stroke-linecap="round" />
        <circle cx="100" cy="55" r="6" fill="#ff6b6b" />
      </svg>
    `;
  }

  getZuwaiganiSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M60 110 Q25 95 15 120" stroke="#f76707" stroke-width="5" fill="none" />
        <path d="M140 110 Q175 95 185 120" stroke="#f76707" stroke-width="5" fill="none" />
        <circle cx="30" cy="40" r="11" fill="#ff6b6b" />
        <circle cx="170" cy="40" r="11" fill="#ff6b6b" />
        <ellipse cx="100" cy="110" rx="36" ry="26" fill="#ff6b6b" stroke="#e03131" stroke-width="3" />
        <circle cx="88" cy="72" r="7" fill="#ffffff" />
        <circle cx="88" cy="72" r="3.5" fill="#212529" />
        <circle cx="112" cy="72" r="7" fill="#ffffff" />
        <circle cx="112" cy="72" r="3.5" fill="#212529" />
      </svg>
    `;
  }

  getNichiyoubiSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <rect x="48" y="55" width="104" height="105" rx="12" fill="#ffffff" stroke="#ced4da" stroke-width="3" />
        <path d="M48 67 C48 60 54 55 61 55 L139 55 C146 55 152 60 152 67 L152 80 L48 80 Z" fill="#ff6b6b" />
        <circle cx="100" cy="118" r="22" fill="#ffd43b" />
        <circle cx="94" cy="115" r="2.5" fill="#d9480f" />
        <circle cx="106" cy="115" r="2.5" fill="#d9480f" />
        <path d="M96 122 Q100 126 104 122" stroke="#d9480f" stroke-width="2" fill="none" />
      </svg>
    `;
  }

  getBiruSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M125 80 C155 80 155 135 125 135" stroke="#ced4da" stroke-width="12" fill="none" stroke-linecap="round" />
        <rect x="55" y="70" width="75" height="85" rx="10" fill="#ffd43b" stroke="#fcc419" stroke-width="4" />
        <path d="M50 72 C42 58 62 45 74 58 C82 42 102 42 110 55 C120 45 138 58 130 72 Z" fill="#ffffff" />
      </svg>
    `;
  }

  getRutoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <rect x="35" y="45" width="130" height="115" rx="14" fill="#e6fcf5" stroke="#63e6be" stroke-width="4" />
        <path d="M55 130 Q70 90 100 115 T145 68" stroke="#ff6b6b" stroke-width="5" stroke-dasharray="6 6" fill="none" />
        <circle cx="55" cy="130" r="8" fill="#339af0" />
        <polygon points="145,45 168,54 145,63" fill="#ff6b6b" />
      </svg>
    `;
  }

  getToraianguruSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M100 55 L150 145 L50 145 L95 62" stroke="#ced4da" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="130" y1="80" x2="165" y2="130" stroke="#fcc419" stroke-width="5" stroke-linecap="round" />
        <text x="145" y="60" font-size="20" fill="#7950f2">♪</text>
      </svg>
    `;
  }

  getRurettoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <circle cx="100" cy="100" r="56" fill="#ffffff" stroke="#fab005" stroke-width="5" />
        <path d="M100 100 L100 45 A55 55 0 0 1 148 72 Z" fill="#ff6b6b" />
        <path d="M100 100 L148 72 A55 55 0 0 1 148 128 Z" fill="#ffd43b" />
        <path d="M100 100 L148 128 A55 55 0 0 1 100 155 Z" fill="#51cf66" />
        <path d="M100 100 L100 155 A55 55 0 0 1 52 128 Z" fill="#339af0" />
        <path d="M100 100 L52 128 A55 55 0 0 1 52 72 Z" fill="#845ef7" />
        <path d="M100 100 L52 72 A55 55 0 0 1 100 45 Z" fill="#ff922b" />
        <circle cx="100" cy="100" r="14" fill="#ffffff" stroke="#495057" stroke-width="3" />
      </svg>
    `;
  }

  getTomatoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M100 55 Q100 35 108 30" stroke="#37b24d" stroke-width="5" fill="none" />
        <polygon points="100,55 80,48 92,60 75,68 95,72 100,85 105,72 125,68 108,60 120,48" fill="#51cf66" />
        <circle cx="100" cy="115" r="52" fill="#ff4757" />
        <ellipse cx="78" cy="95" rx="10" ry="18" transform="rotate(-25 78 95)" fill="#ffffff" opacity="0.4" />
        <circle cx="88" cy="120" r="3.5" fill="#491212" />
        <circle cx="112" cy="120" r="3.5" fill="#491212" />
        <path d="M95 130 Q100 136 105 130" stroke="#491212" stroke-width="2.5" fill="none" />
      </svg>
    `;
  }

  getRakudaSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M50 135 C50 105 70 85 90 105 C100 85 125 85 135 105 C150 105 160 135 140 155 L60 155 Z" fill="#e67e22" />
        <path d="M55 125 Q45 80 35 65 Q50 60 55 75 Q65 110 70 125" fill="#e67e22" />
        <circle cx="38" cy="62" r="14" fill="#e67e22" />
        <circle cx="34" cy="60" r="3" fill="#212529" />
      </svg>
    `;
  }

  getDangoSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <line x1="35" y1="165" x2="165" y2="35" stroke="#d4a373" stroke-width="6" stroke-linecap="round" />
        <circle cx="70" cy="130" r="22" fill="#51cf66" />
        <circle cx="100" cy="100" r="22" fill="#ffffff" stroke="#e9ecef" stroke-width="2" />
        <circle cx="130" cy="70" r="22" fill="#ff9ff3" />
      </svg>
    `;
  }

  getKameSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <circle cx="150" cy="100" r="16" fill="#2ed573" />
        <circle cx="154" cy="96" r="3" fill="#212529" />
        <ellipse cx="60" cy="80" rx="10" ry="8" fill="#2ed573" />
        <ellipse cx="60" cy="120" rx="10" ry="8" fill="#2ed573" />
        <ellipse cx="130" cy="80" rx="10" ry="8" fill="#2ed573" />
        <ellipse cx="130" cy="120" rx="10" ry="8" fill="#2ed573" />
        <ellipse cx="95" cy="100" rx="44" ry="34" fill="#10ac84" stroke="#0ca678" stroke-width="3" />
      </svg>
    `;
  }

  getMedakaSvg() {
    return `
      <svg viewBox="0 0 200 200" class="quiz-card-svg" width="100%" height="100%">
        <path d="M140 100 Q100 70 55 90 L30 75 L38 100 L30 125 L55 110 Q100 130 140 100 Z" fill="#74c0fc" />
        <circle cx="125" cy="95" r="5" fill="#ffffff" />
        <circle cx="126" cy="95" r="2.5" fill="#212529" />
        <path d="M100 95 Q85 85 80 95" stroke="#339af0" stroke-width="2.5" fill="none" />
      </svg>
    `;
  }
}
