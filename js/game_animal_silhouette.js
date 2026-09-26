/**
 * game_animal_silhouette.js - どうぶつのシルエットあてクイズ (Animal Silhouette Quiz)
 * 陸・海・空の生き物30種類からランダムに10問出題！
 * シルエットから正解を当てると、魔法のようにカラフルに変身して大歓声！
 */

class GameAnimalSilhouette {
  constructor(app) {
    this.app = app;
    this.totalQuestions = 10;
    this.currentRound = 0;
    this.score = 0;
    this.isLocked = false;
    this.currentAnimal = null;
    this.currentQuestions = [];
    this.habitatFilter = 'all'; // 'all', 'land', 'sea', 'sky'

    // 陸・海・空 全30種類の動物データ定義
    this.animals = [
      // --- 陸のどうぶつ (10種類) ---
      {
        id: 'lion', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'らいおん', nameKana: 'ライオン', emoji: '🦁',
        hint: 'たてがみと つよいキバ！ ひゃくじゅうの おう！',
        color: '#f39c12', bg: 'linear-gradient(135deg, #f39c12, #d35400)',
        svg: (silhouette) => this.getLionSvg(silhouette)
      },
      {
        id: 'elephant', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'ぞう', nameKana: 'ゾウ', emoji: '🐘',
        hint: 'ながーい おはなと おおきな おみみ！ パオーン！',
        color: '#7f8c8d', bg: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
        svg: (silhouette) => this.getElephantSvg(silhouette)
      },
      {
        id: 'giraffe', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'きりん', nameKana: 'キリン', emoji: '🦒',
        hint: 'たかーい きのはっぱも たべられる ながいくび！',
        color: '#f1c40f', bg: 'linear-gradient(135deg, #f1c40f, #e67e22)',
        svg: (silhouette) => this.getGiraffeSvg(silhouette)
      },
      {
        id: 'panda', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'ぱんだ', nameKana: 'パンダ', emoji: '🐼',
        hint: 'しろくろの からだと まるい おみみ！ ささが だいすき！',
        color: '#2c3e50', bg: 'linear-gradient(135deg, #34495e, #2c3e50)',
        svg: (silhouette) => this.getPandaSvg(silhouette)
      },
      {
        id: 'tiger', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'とら', nameKana: 'トラ', emoji: '🐯',
        hint: 'きいろと くろの しましま！ ガオー！っと かっこいい！',
        color: '#e67e22', bg: 'linear-gradient(135deg, #e67e22, #d35400)',
        svg: (silhouette) => this.getTigerSvg(silhouette)
      },
      {
        id: 'rabbit', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'うさぎ', nameKana: 'ウサギ', emoji: '🐰',
        hint: 'ながい おみみで ぴょんぴょん！ にんじん だいすき！',
        color: '#ff9ff3', bg: 'linear-gradient(135deg, #ff9ff3, #f368e0)',
        svg: (silhouette) => this.getRabbitSvg(silhouette)
      },
      {
        id: 'bear', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'くま', nameKana: 'クマ', emoji: '🐻',
        hint: 'おおきな からだと まるい みみ！ はちみつ だいすき！',
        color: '#8d6e63', bg: 'linear-gradient(135deg, #8d6e63, #5d4037)',
        svg: (silhouette) => this.getBearSvg(silhouette)
      },
      {
        id: 'kangaroo', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'かんがるー', nameKana: 'カンガルー', emoji: '🦘',
        hint: 'おなかの ポケットに あかちゃん！ おおきく ジャンプ！',
        color: '#d35400', bg: 'linear-gradient(135deg, #e67e22, #c0392b)',
        svg: (silhouette) => this.getKangarooSvg(silhouette)
      },
      {
        id: 'monkey', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'さる', nameKana: 'サル', emoji: '🐵',
        hint: 'きのぼりが とくい！ バナナを もぐもぐ！ ウキキ！',
        color: '#a0522d', bg: 'linear-gradient(135deg, #cd853f, #8b4513)',
        svg: (silhouette) => this.getMonkeySvg(silhouette)
      },
      {
        id: 'zebra', habitat: 'land', habitatName: 'りくのどうぶつ',
        name: 'しまうま', nameKana: 'シマウマ', emoji: '🦓',
        hint: 'きれいな しろくろの しまもよう！ おはしりが はやい！',
        color: '#34495e', bg: 'linear-gradient(135deg, #7f8c8d, #2c3e50)',
        svg: (silhouette) => this.getZebraSvg(silhouette)
      },

      // --- 海のいきもの (10種類) ---
      {
        id: 'dolphin', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'いるか', nameKana: 'イルカ', emoji: '🐬',
        hint: 'なみの うえを たかーく ジャンプ！ うみの にんきもの！',
        color: '#00cec9', bg: 'linear-gradient(135deg, #81ecec, #00cec9)',
        svg: (silhouette) => this.getDolphinSvg(silhouette)
      },
      {
        id: 'whale', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'くじら', nameKana: 'クジラ', emoji: '🐋',
        hint: 'せなかから しおを ふくよ！ せかいで いちばん おおきい！',
        color: '#0984e3', bg: 'linear-gradient(135deg, #74b9ff, #0984e3)',
        svg: (silhouette) => this.getWhaleSvg(silhouette)
      },
      {
        id: 'shark', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'さめ', nameKana: 'サメ', emoji: '🦈',
        hint: 'かっこいい せびれと するどい ハ！ うみの ハンター！',
        color: '#636e72', bg: 'linear-gradient(135deg, #b2bec3, #636e72)',
        svg: (silhouette) => this.getSharkSvg(silhouette)
      },
      {
        id: 'octopus', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'たこ', nameKana: 'タコ', emoji: '🐙',
        hint: 'あしが 8ぽん！ くろい すみを ピューッと はくよ！',
        color: '#ff4757', bg: 'linear-gradient(135deg, #ff6b81, #ff4757)',
        svg: (silhouette) => this.getOctopusSvg(silhouette)
      },
      {
        id: 'turtle', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'うみがめ', nameKana: 'ウミガメ', emoji: '🐢',
        hint: 'おおきな こうらを せおって すいすい およぐよ！',
        color: '#2ed573', bg: 'linear-gradient(135deg, #7bed9f, #2ed573)',
        svg: (silhouette) => this.getTurtleSvg(silhouette)
      },
      {
        id: 'crab', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'かに', nameKana: 'カニ', emoji: '🦀',
        hint: 'チョキの はさみを チョキチョキ！ よこあるき！',
        color: '#ff6b6b', bg: 'linear-gradient(135deg, #ff7675, #d63031)',
        svg: (silhouette) => this.getCrabSvg(silhouette)
      },
      {
        id: 'penguin', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'ぺんぎん', nameKana: 'ペンギン', emoji: '🐧',
        hint: 'こおりの うえを よちよち！ およぐのが とっても とくい！',
        color: '#2d3436', bg: 'linear-gradient(135deg, #636e72, #2d3436)',
        svg: (silhouette) => this.getPenguinSvg(silhouette)
      },
      {
        id: 'squid', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'いか', nameKana: 'イカ', emoji: '🦑',
        hint: 'あしが 10ぽん！ えんペラを ひらひらさせて およぐよ！',
        color: '#fd79a8', bg: 'linear-gradient(135deg, #fab1a0, #fd79a8)',
        svg: (silhouette) => this.getSquidSvg(silhouette)
      },
      {
        id: 'seal', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'あざらし', nameKana: 'アザラシ', emoji: '🦭',
        hint: 'まるっこい からだで ごろごろ！ おひげが かわいい！',
        color: '#a4b0be', bg: 'linear-gradient(135deg, #ced6e0, #747d8c)',
        svg: (silhouette) => this.getSealSvg(silhouette)
      },
      {
        id: 'clownfish', habitat: 'sea', habitatName: 'うみのいきもの',
        name: 'くまのみ', nameKana: 'カクレクマノミ', emoji: '🐠',
        hint: 'オレンジと しろの しましま！ サンゴの なかに かくれるよ！',
        color: '#ff793f', bg: 'linear-gradient(135deg, #ffb142, #ff5252)',
        svg: (silhouette) => this.getClownfishSvg(silhouette)
      },

      // --- 空のいきもの・とり (10種類) ---
      {
        id: 'eagle', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'わし', nameKana: 'ワシ', emoji: '🦅',
        hint: 'おおきな つばさと するどい ツメで おおぞらを まう！',
        color: '#6c5ce7', bg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
        svg: (silhouette) => this.getEagleSvg(silhouette)
      },
      {
        id: 'owl', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'ふくろう', nameKana: 'フクロウ', emoji: '🦉',
        hint: 'まんまるの おおきな め！ よるに ホーホーと なくよ！',
        color: '#8395a7', bg: 'linear-gradient(135deg, #c8d6e5, #576574)',
        svg: (silhouette) => this.getOwlSvg(silhouette)
      },
      {
        id: 'flamingo', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'ふらみんご', nameKana: 'フラミンゴ', emoji: '🦩',
        hint: 'きれいな ピンクいろ！ ながい いっぽんあしで たつよ！',
        color: '#ff7597', bg: 'linear-gradient(135deg, #ff9ff3, #ff7597)',
        svg: (silhouette) => this.getFlamingoSvg(silhouette)
      },
      {
        id: 'duck', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'かも', nameKana: 'カモ / アヒル', emoji: '🦆',
        hint: 'クワクワないて みずべを およいだり おおぞらを とぶよ！',
        color: '#10ac84', bg: 'linear-gradient(135deg, #1dd1a1, #10ac84)',
        svg: (silhouette) => this.getDuckSvg(silhouette)
      },
      {
        id: 'parrot', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'おうむ', nameKana: 'オウム / インコ', emoji: '🦜',
        hint: 'カラフルな はね！ おしゃべりや まねっこが とくい！',
        color: '#00d2d3', bg: 'linear-gradient(135deg, #54a0ff, #10ac84)',
        svg: (silhouette) => this.getParrotSvg(silhouette)
      },
      {
        id: 'bat', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'こうもり', nameKana: 'コウモリ', emoji: '🦇',
        hint: 'よるの そらを パタパタ！ さかさまに ぶらさがるよ！',
        color: '#5f27cd', bg: 'linear-gradient(135deg, #341f97, #5f27cd)',
        svg: (silhouette) => this.getBatSvg(silhouette)
      },
      {
        id: 'swan', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'はくちょう', nameKana: 'ハクチョウ', emoji: '🦢',
        hint: 'まっしろで うつくしい とり！ ながい くびが すてき！',
        color: '#48dbfb', bg: 'linear-gradient(135deg, #c7ecee, #48dbfb)',
        svg: (silhouette) => this.getSwanSvg(silhouette)
      },
      {
        id: 'pigeon', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'はと', nameKana: 'ハト', emoji: '🕊️',
        hint: 'ポッポーと なくよ！ こうえんや おそらで よくみかけるね！',
        color: '#8395a7', bg: 'linear-gradient(135deg, #dfe4ea, #a4b0be)',
        svg: (silhouette) => this.getPigeonSvg(silhouette)
      },
      {
        id: 'butterfly', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'ちょうちょ', nameKana: 'チョウ', emoji: '🦋',
        hint: 'きれいな もようの はねで おはなから おはなへ ひらひら！',
        color: '#0abde3', bg: 'linear-gradient(135deg, #48dbfb, #0abde3)',
        svg: (silhouette) => this.getButterflySvg(silhouette)
      },
      {
        id: 'bee', habitat: 'sky', habitatName: 'そらのとり・むし',
        name: 'はち', nameKana: 'ミツバチ', emoji: '🐝',
        hint: 'きいろと くろの しましま！ あまい みつを あつめるよ！',
        color: '#feca57', bg: 'linear-gradient(135deg, #ff9f43, #feca57)',
        svg: (silhouette) => this.getBeeSvg(silhouette)
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-animal-silhouette');
  }

  start() {
    this.containerEl = document.getElementById('view-game-animal-silhouette');
    this.currentRound = 0;
    this.score = 0;
    this.isLocked = false;
    this.app.updateStamps(0, this.totalQuestions);
    window.soundSystem.startNormalBgm();

    // 30種類からランダムに10種類を選出
    const shuffled = [...this.animals].sort(() => Math.random() - 0.5);
    this.currentQuestions = shuffled.slice(0, this.totalQuestions);

    this.renderStage();
    this.showQuestion(this.currentRound);
  }

  stop() {
    this.isLocked = false;
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="sil-game-layout">
        <!-- 上部：お題・進行バー -->
        <div class="sil-header-bar">
          <div class="sil-speech-bubble" id="sil-speech-bubble">
            <span class="sil-speech-icon">🐾</span>
            <span class="sil-speech-text" id="sil-speech-text">この シルエットの どうぶつは だれかな？</span>
            <button class="sil-voice-btn" id="sil-voice-btn" title="ヒントをきく">🔊</button>
          </div>
          <div class="sil-progress-badge">
            <span class="sil-progress-icon">⭐</span>
            <span class="sil-progress-text" id="sil-progress-text">1 / ${this.totalQuestions}</span>
          </div>
        </div>

        <!-- メインステージ：シルエット表示＆背景 -->
        <div class="sil-main-stage" id="sil-main-stage">
          <!-- 背景装飾（サバンナ / 海底 / 青空） -->
          <div class="sil-habitat-bg" id="sil-habitat-bg">
            <div class="habitat-layer-back"></div>
            <div class="habitat-layer-front"></div>
          </div>

          <!-- シルエット Showcase カード -->
          <div class="sil-showcase-box" id="sil-showcase-box">
            <div class="sil-habitat-tag" id="sil-habitat-tag">🌿 りくのどうぶつ</div>
            <div class="sil-spotlight"></div>
            <div class="sil-animal-display" id="sil-animal-display">
              <!-- SVG がここに挿入されます -->
            </div>
            <div class="sil-reveal-banner" id="sil-reveal-banner">
              <span class="reveal-name" id="sil-reveal-name">らいおん</span>
              <span class="reveal-kana" id="sil-reveal-kana">(ライオン)</span>
            </div>
          </div>
        </div>

        <!-- 4択 選択肢ボタン群 -->
        <div class="sil-choices-grid" id="sil-choices-grid">
          <!-- 4つの選択肢ボタンが動的生成されます -->
        </div>

        <!-- 全問クリア モーダル -->
        <div class="sil-clear-modal" id="sil-clear-modal">
          <div class="sil-modal-card pop-in">
            <div class="modal-crown-icon">👑 🦁 🐬 🦅</div>
            <h3 class="modal-clear-title">たいへん よくできました！</h3>
            <p class="modal-clear-desc">10もん ぜんぶ せいかいしたよ！ どうぶつマスターだね！</p>
            <div class="modal-stars-row">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐</div>
            <button class="primary-btn" id="btn-sil-retry">🔄 もういちど あそぶ！</button>
          </div>
        </div>
      </div>
    `;

    this.bindStageEvents();
  }

  bindStageEvents() {
    const voiceBtn = document.getElementById('sil-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        window.soundSystem.playSparkle();
        if (this.currentAnimal) {
          const speech = document.getElementById('sil-speech-text');
          if (speech) speech.textContent = this.currentAnimal.hint;
        }
      });
    }

    const retryBtn = document.getElementById('btn-sil-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const modal = document.getElementById('sil-clear-modal');
        if (modal) modal.classList.remove('show');
        this.start();
      });
    }
  }

  showQuestion(roundIndex) {
    if (roundIndex >= this.totalQuestions) {
      this.handleAllClear();
      return;
    }

    this.isLocked = false;
    this.currentAnimal = this.currentQuestions[roundIndex];

    // プログレスバー更新
    const progText = document.getElementById('sil-progress-text');
    if (progText) progText.textContent = `${roundIndex + 1} / ${this.totalQuestions}`;
    this.app.updateStamps(this.score, this.totalQuestions);

    // 生息地タグ＆背景切り替え
    const habitatBg = document.getElementById('sil-habitat-bg');
    const habitatTag = document.getElementById('sil-habitat-tag');
    if (habitatBg && habitatTag) {
      habitatBg.className = `sil-habitat-bg habitat-${this.currentAnimal.habitat}`;
      if (this.currentAnimal.habitat === 'land') {
        habitatTag.innerHTML = `🌿 陸のどうぶつ`;
        habitatTag.style.background = '#27ae60';
      } else if (this.currentAnimal.habitat === 'sea') {
        habitatTag.innerHTML = `🌊 海のいきもの`;
        habitatTag.style.background = '#0984e3';
      } else {
        habitatTag.innerHTML = `☁️ 空のとり・虫`;
        habitatTag.style.background = '#6c5ce7';
      }
    }

    // シルエットの描画（初期は真っ黒なシルエット）
    const displayEl = document.getElementById('sil-animal-display');
    const bannerEl = document.getElementById('sil-reveal-banner');
    if (displayEl) {
      displayEl.className = 'sil-animal-display in-silhouette';
      displayEl.innerHTML = this.currentAnimal.svg(true);
    }
    if (bannerEl) {
      bannerEl.classList.remove('show');
    }

    // 上部吹き出しヒント
    const speech = document.getElementById('sil-speech-text');
    if (speech) {
      speech.innerHTML = `この シルエットは だれかな？ (ヒント: ${this.currentAnimal.hint})`;
    }

    // 4択の選択肢を生成（正解1個 ＋ ダミー3個）
    this.renderChoices();
  }

  renderChoices() {
    const gridEl = document.getElementById('sil-choices-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    // ダミー候補（同じ生息地を優先して紛らわしく面白くする）
    const otherAnimals = this.animals.filter(a => a.id !== this.currentAnimal.id);
    const sameHabitat = otherAnimals.filter(a => a.habitat === this.currentAnimal.habitat);
    const diffHabitat = otherAnimals.filter(a => a.habitat !== this.currentAnimal.habitat);

    const dummies = [];
    const poolSame = [...sameHabitat].sort(() => Math.random() - 0.5);
    const poolDiff = [...diffHabitat].sort(() => Math.random() - 0.5);

    // 同じ生息地から2匹、別生息地から1匹選出
    while (dummies.length < 2 && poolSame.length > 0) dummies.push(poolSame.pop());
    while (dummies.length < 3 && poolDiff.length > 0) dummies.push(poolDiff.pop());
    while (dummies.length < 3 && otherAnimals.length > 0) dummies.push(otherAnimals.pop());

    // 正解とダミーを混ぜてシャッフル
    const choices = [this.currentAnimal, ...dummies].sort(() => Math.random() - 0.5);

    choices.forEach((animal, idx) => {
      const btn = document.createElement('button');
      btn.className = `sil-choice-btn choice-color-${idx % 4} pop-in`;
      btn.innerHTML = `
        <span class="choice-emoji">${animal.emoji}</span>
        <div class="choice-text-col">
          <span class="choice-name">${animal.name}</span>
          <span class="choice-kana">${animal.nameKana}</span>
        </div>
        <span class="choice-mark" id="mark-${animal.id}"></span>
      `;

      btn.addEventListener('click', (e) => {
        if (this.isLocked) return;
        this.handleChoiceClick(animal, btn);
      });

      gridEl.appendChild(btn);
    });
  }

  handleChoiceClick(selectedAnimal, btnEl) {
    if (selectedAnimal.id === this.currentAnimal.id) {
      // 🎉 正解！
      this.isLocked = true;
      this.score++;
      this.app.updateStamps(this.score, this.totalQuestions);

      btnEl.classList.add('correct-btn');
      const mark = btnEl.querySelector('.choice-mark');
      if (mark) mark.textContent = '⭕';

      // シルエットの正体をカラフルに大公開！
      const displayEl = document.getElementById('sil-animal-display');
      const bannerEl = document.getElementById('sil-reveal-banner');
      const nameEl = document.getElementById('sil-reveal-name');
      const kanaEl = document.getElementById('sil-reveal-kana');

      if (displayEl) {
        displayEl.className = 'sil-animal-display revealed';
        displayEl.innerHTML = this.currentAnimal.svg(false);
      }

      if (bannerEl && nameEl && kanaEl) {
        nameEl.textContent = `${this.currentAnimal.emoji} ${this.currentAnimal.name}`;
        kanaEl.textContent = `(${this.currentAnimal.nameKana})`;
        bannerEl.classList.add('show');
      }

      // サウンド ＆ パーティクル大爆発
      window.soundSystem.playSparkle();
      window.soundSystem.playMagicChime();
      window.soundSystem.playJewelTone(Math.min(9, this.score));

      const showcase = document.getElementById('sil-showcase-box');
      if (showcase) {
        const rect = showcase.getBoundingClientRect();
        this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      }

      const speech = document.getElementById('sil-speech-text');
      if (speech) {
        speech.innerHTML = `🎉 せいかい！ <strong>${this.currentAnimal.name}</strong> だよ！ ぴったり！ ✨`;
      }

      // 1.4秒後に次の問題へ
      setTimeout(() => {
        this.currentRound++;
        this.showQuestion(this.currentRound);
      }, 1400);

    } else {
      // ❌ 不正解（優しく揺れて再挑戦）
      window.soundSystem.playPop();
      btnEl.classList.add('wrong-btn', 'shake-card');
      const mark = btnEl.querySelector('.choice-mark');
      if (mark) mark.textContent = '❌';

      const speech = document.getElementById('sil-speech-text');
      if (speech) {
        speech.innerHTML = `⚠️ おしい！ もういちど シルエットを よくみてね！`;
      }

      setTimeout(() => {
        btnEl.classList.remove('shake-card');
      }, 500);
    }
  }

  handleAllClear() {
    this.isLocked = true;
    this.app.updateStamps(this.totalQuestions, this.totalQuestions);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const modal = document.getElementById('sil-clear-modal');
    if (modal) modal.classList.add('show');

    setTimeout(() => {
      this.app.showCompleteModal();
    }, 1500);
  }

  // ==========================================
  // 30種類の美麗 SVG ベクター生成関数
  // ==========================================

  getLionSvg(sil) {
    const fMane = sil ? '#1e272e' : '#e67e22';
    const fFace = sil ? '#1e272e' : '#f39c12';
    const fMuzzle = sil ? '#1e272e' : '#ffeaa7';
    const fNose = sil ? '#1e272e' : '#d35400';
    const fEye = sil ? '#1e272e' : '#2d3436';
    const fEar = sil ? '#1e272e' : '#e17055';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- しっぽ -->
        <path d="M 40 140 Q 20 120 15 90 Q 12 70 25 70 Q 30 70 26 85 Q 25 110 50 140 Z" fill="${fFace}"/>
        <circle cx="20" cy="72" r="10" fill="${fMane}"/>
        <!-- からだ -->
        <ellipse cx="70" cy="145" rx="45" ry="35" fill="${fFace}"/>
        <rect x="40" y="150" width="16" height="35" rx="8" fill="${fFace}"/>
        <rect x="80" y="150" width="16" height="35" rx="8" fill="${fFace}"/>
        <!-- たてがみ -->
        <circle cx="120" cy="95" r="55" fill="${fMane}"/>
        <!-- みみ -->
        <circle cx="85" cy="55" r="16" fill="${fMane}"/>
        <circle cx="85" cy="55" r="10" fill="${fEar}"/>
        <circle cx="155" cy="55" r="16" fill="${fMane}"/>
        <circle cx="155" cy="55" r="10" fill="${fEar}"/>
        <!-- かお -->
        <circle cx="120" cy="95" r="38" fill="${fFace}"/>
        ${sil ? '' : `
          <!-- め -->
          <circle cx="106" cy="88" r="5" fill="${fEye}"/>
          <circle cx="104" cy="86" r="2" fill="#fff"/>
          <circle cx="134" cy="88" r="5" fill="${fEye}"/>
          <circle cx="132" cy="86" r="2" fill="#fff"/>
          <!-- くち・はな -->
          <ellipse cx="120" cy="105" rx="14" ry="10" fill="${fMuzzle}"/>
          <polygon points="115,100 125,100 120,107" fill="${fNose}"/>
          <path d="M 120 107 L 120 112 M 115 112 Q 120 116 125 112" stroke="${fEye}" stroke-width="2" fill="none"/>
          <circle cx="98" cy="98" r="5" fill="#ff7675" opacity="0.4"/>
          <circle cx="142" cy="98" r="5" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getElephantSvg(sil) {
    const fBody = sil ? '#1e272e' : '#95a5a6';
    const fEar = sil ? '#1e272e' : '#bdc3c7';
    const fTusk = sil ? '#1e272e' : '#ffffff';
    const fEye = sil ? '#1e272e' : '#2c3e50';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- おおきなからだ -->
        <ellipse cx="90" cy="125" rx="55" ry="45" fill="${fBody}"/>
        <!-- あし -->
        <rect x="50" y="140" width="20" height="45" rx="8" fill="${fBody}"/>
        <rect x="80" y="140" width="20" height="45" rx="8" fill="${fBody}"/>
        <rect x="110" y="140" width="20" height="45" rx="8" fill="${fBody}"/>
        <!-- あたま -->
        <circle cx="140" cy="95" r="35" fill="${fBody}"/>
        <!-- おおきなみみ -->
        <ellipse cx="115" cy="90" rx="22" ry="32" fill="${fEar}"/>
        <!-- ながいハナ（上にくるん） -->
        <path d="M 160 105 Q 185 110 185 85 Q 185 65 170 65 Q 160 65 162 75 Q 168 85 155 95 Z" fill="${fBody}"/>
        <!-- キバ -->
        <path d="M 155 115 Q 170 125 175 110 Q 165 110 152 110 Z" fill="${fTusk}"/>
        ${sil ? '' : `
          <circle cx="145" cy="85" r="4.5" fill="${fEye}"/>
          <circle cx="143" cy="83" r="1.5" fill="#fff"/>
          <circle cx="132" cy="95" r="5" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getGiraffeSvg(sil) {
    const fBody = sil ? '#1e272e' : '#f1c40f';
    const fSpot = sil ? '#1e272e' : '#d35400';
    const fEye = sil ? '#1e272e' : '#2c3e50';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- あし -->
        <rect x="55" y="130" width="12" height="60" rx="6" fill="${fBody}"/>
        <rect x="85" y="130" width="12" height="60" rx="6" fill="${fBody}"/>
        <!-- からだ -->
        <ellipse cx="75" cy="130" rx="35" ry="25" fill="${fBody}"/>
        <!-- ながいくび -->
        <path d="M 90 125 L 130 50 L 145 53 L 110 130 Z" fill="${fBody}"/>
        <!-- つの -->
        <rect x="135" y="24" width="4" height="12" rx="2" fill="${fBody}"/>
        <circle cx="137" cy="23" r="4" fill="${fSpot}"/>
        <rect x="145" y="25" width="4" height="12" rx="2" fill="${fBody}"/>
        <circle cx="147" cy="24" r="4" fill="${fSpot}"/>
        <!-- あたま -->
        <ellipse cx="142" cy="42" rx="16" ry="12" fill="${fBody}"/>
        <!-- みみ -->
        <ellipse cx="128" cy="38" rx="8" ry="4" transform="rotate(-30 128 38)" fill="${fSpot}"/>
        ${sil ? '' : `
          <!-- もよう -->
          <circle cx="105" cy="90" r="7" fill="${fSpot}"/>
          <circle cx="120" cy="68" r="6" fill="${fSpot}"/>
          <circle cx="70" cy="130" r="8" fill="${fSpot}"/>
          <circle cx="85" cy="125" r="6" fill="${fSpot}"/>
          <!-- め -->
          <circle cx="145" cy="38" r="3.5" fill="${fEye}"/>
        `}
      </svg>
    `;
  }

  getPandaSvg(sil) {
    const fWhite = sil ? '#1e272e' : '#ffffff';
    const fBlack = sil ? '#1e272e' : '#2d3436';
    const fPink = sil ? '#1e272e' : '#ff7675';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- みみ -->
        <circle cx="65" cy="65" r="18" fill="${fBlack}"/>
        <circle cx="135" cy="65" r="18" fill="${fBlack}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="140" rx="45" ry="38" fill="${fWhite}"/>
        <ellipse cx="65" cy="155" rx="16" ry="20" fill="${fBlack}"/>
        <ellipse cx="135" cy="155" rx="16" ry="20" fill="${fBlack}"/>
        <!-- て -->
        <ellipse cx="60" cy="125" rx="15" ry="22" transform="rotate(25 60 125)" fill="${fBlack}"/>
        <ellipse cx="140" cy="125" rx="15" ry="22" transform="rotate(-25 140 125)" fill="${fBlack}"/>
        <!-- かお -->
        <circle cx="100" cy="95" r="42" fill="${fWhite}"/>
        ${sil ? '' : `
          <!-- め（たれ目パッチ） -->
          <ellipse cx="82" cy="92" rx="12" ry="10" transform="rotate(-15 82 92)" fill="${fBlack}"/>
          <circle cx="84" cy="91" r="3.5" fill="#fff"/>
          <ellipse cx="118" cy="92" rx="12" ry="10" transform="rotate(15 118 92)" fill="${fBlack}"/>
          <circle cx="116" cy="91" r="3.5" fill="#fff"/>
          <!-- はな・くち -->
          <ellipse cx="100" cy="105" rx="6" ry="4" fill="${fBlack}"/>
          <path d="M 100 109 L 100 114 M 95 114 Q 100 118 105 114" stroke="${fBlack}" stroke-width="2" fill="none"/>
          <circle cx="75" cy="105" r="6" fill="${fPink}" opacity="0.4"/>
          <circle cx="125" cy="105" r="6" fill="${fPink}" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getTigerSvg(sil) {
    const fOrange = sil ? '#1e272e' : '#ff9f43';
    const fStripe = sil ? '#1e272e' : '#222f3e';
    const fWhite = sil ? '#1e272e' : '#ffffff';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- しっぽ -->
        <path d="M 40 145 Q 15 130 18 90 Q 20 80 28 85 Q 26 115 50 145 Z" fill="${fOrange}"/>
        <!-- からだ -->
        <ellipse cx="80" cy="140" rx="42" ry="32" fill="${fOrange}"/>
        <rect x="50" y="145" width="16" height="35" rx="8" fill="${fOrange}"/>
        <rect x="95" y="145" width="16" height="35" rx="8" fill="${fOrange}"/>
        <!-- みみ -->
        <circle cx="95" cy="62" r="15" fill="${fOrange}"/>
        <circle cx="155" cy="62" r="15" fill="${fOrange}"/>
        <!-- かお -->
        <circle cx="125" cy="95" r="38" fill="${fOrange}"/>
        ${sil ? '' : `
          <!-- しましま -->
          <polygon points="125,62 121,75 129,75" fill="${fStripe}"/>
          <polygon points="90,88 105,92 92,96" fill="${fStripe}"/>
          <polygon points="160,88 145,92 158,96" fill="${fStripe}"/>
          <!-- め -->
          <circle cx="112" cy="90" r="5" fill="${fStripe}"/>
          <circle cx="110" cy="88" r="1.5" fill="#fff"/>
          <circle cx="138" cy="90" r="5" fill="${fStripe}"/>
          <circle cx="136" cy="88" r="1.5" fill="#fff"/>
          <!-- くち -->
          <ellipse cx="125" cy="106" rx="12" ry="8" fill="${fWhite}"/>
          <polygon points="121,102 129,102 125,108" fill="${fStripe}"/>
        `}
      </svg>
    `;
  }

  getRabbitSvg(sil) {
    const fBody = sil ? '#1e272e' : '#ffffff';
    const fInner = sil ? '#1e272e' : '#ffb8b8';
    const fEye = sil ? '#1e272e' : '#e84118';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ながいみみ -->
        <ellipse cx="85" cy="45" rx="12" ry="36" transform="rotate(-8 85 45)" fill="${fBody}"/>
        <ellipse cx="85" cy="45" rx="6" ry="26" transform="rotate(-8 85 45)" fill="${fInner}"/>
        <ellipse cx="120" cy="45" rx="12" ry="36" transform="rotate(8 120 45)" fill="${fBody}"/>
        <ellipse cx="120" cy="45" rx="6" ry="26" transform="rotate(8 120 45)" fill="${fInner}"/>
        <!-- からだ -->
        <ellipse cx="102" cy="145" rx="40" ry="35" fill="${fBody}"/>
        <!-- まるいしっぽ -->
        <circle cx="60" cy="148" r="14" fill="${fBody}"/>
        <!-- かお -->
        <circle cx="102" cy="100" r="34" fill="${fBody}"/>
        ${sil ? '' : `
          <!-- あかいめ -->
          <circle cx="92" cy="95" r="4.5" fill="${fEye}"/>
          <circle cx="90" cy="93" r="1.5" fill="#fff"/>
          <circle cx="114" cy="95" r="4.5" fill="${fEye}"/>
          <circle cx="112" cy="93" r="1.5" fill="#fff"/>
          <!-- はな -->
          <polygon points="100,103 106,103 103,107" fill="${fInner}"/>
          <circle cx="82" cy="105" r="6" fill="#ff7675" opacity="0.4"/>
          <circle cx="124" cy="105" r="6" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getBearSvg(sil) {
    const fBrown = sil ? '#1e272e' : '#8d6e63';
    const fMuzzle = sil ? '#1e272e' : '#d7ccc8';
    const fDark = sil ? '#1e272e' : '#3e2723';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- みみ -->
        <circle cx="68" cy="65" r="16" fill="${fBrown}"/>
        <circle cx="132" cy="65" r="16" fill="${fBrown}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="145" rx="46" ry="38" fill="${fBrown}"/>
        <!-- かお -->
        <circle cx="100" cy="98" r="40" fill="${fBrown}"/>
        <!-- マズル -->
        <ellipse cx="100" cy="108" rx="16" ry="12" fill="${fMuzzle}"/>
        ${sil ? '' : `
          <circle cx="88" cy="92" r="4" fill="${fDark}"/>
          <circle cx="112" cy="92" r="4" fill="${fDark}"/>
          <ellipse cx="100" cy="104" rx="7" ry="5" fill="${fDark}"/>
        `}
      </svg>
    `;
  }

  getKangarooSvg(sil) {
    const fBrown = sil ? '#1e272e' : '#d35400';
    const fPouch = sil ? '#1e272e' : '#e67e22';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- おおきなしっぽ -->
        <path d="M 60 155 Q 30 170 10 175 Q 30 150 70 135 Z" fill="${fBrown}"/>
        <!-- あし -->
        <ellipse cx="75" cy="160" rx="30" ry="14" fill="${fBrown}"/>
        <!-- からだ -->
        <ellipse cx="95" cy="125" rx="35" ry="35" fill="${fBrown}"/>
        <!-- ながいみみ -->
        <ellipse cx="140" cy="35" rx="8" ry="24" transform="rotate(15 140 35)" fill="${fBrown}"/>
        <ellipse cx="155" cy="40" rx="8" ry="24" transform="rotate(25 155 40)" fill="${fBrown}"/>
        <!-- かお -->
        <circle cx="145" cy="65" r="20" fill="${fBrown}"/>
        <!-- ポケット -->
        <path d="M 105 120 Q 125 130 120 145 Q 100 150 105 120 Z" fill="${fPouch}"/>
        ${sil ? '' : `
          <circle cx="150" cy="62" r="3.5" fill="#2c3e50"/>
          <ellipse cx="160" cy="72" rx="4" ry="3" fill="#2c3e50"/>
        `}
      </svg>
    `;
  }

  getMonkeySvg(sil) {
    const fBrown = sil ? '#1e272e' : '#a0522d';
    const fFace = sil ? '#1e272e' : '#f5deb3';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- くるんとしっぽ -->
        <path d="M 60 140 Q 20 130 20 90 Q 20 60 45 70 Q 35 95 65 130 Z" fill="${fBrown}"/>
        <!-- おおきなみみ -->
        <circle cx="62" cy="90" r="16" fill="${fFace}"/>
        <circle cx="138" cy="90" r="16" fill="${fFace}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="140" rx="36" ry="32" fill="${fBrown}"/>
        <!-- あたま -->
        <circle cx="100" cy="90" r="35" fill="${fBrown}"/>
        <ellipse cx="100" cy="95" rx="26" ry="22" fill="${fFace}"/>
        ${sil ? '' : `
          <circle cx="90" cy="88" r="4" fill="#2d3436"/>
          <circle cx="110" cy="88" r="4" fill="#2d3436"/>
          <ellipse cx="100" cy="98" rx="4" ry="2.5" fill="#2d3436"/>
          <path d="M 94 105 Q 100 110 106 105" stroke="#2d3436" stroke-width="2" fill="none"/>
        `}
      </svg>
    `;
  }

  getZebraSvg(sil) {
    const fWhite = sil ? '#1e272e' : '#ffffff';
    const fStripe = sil ? '#1e272e' : '#2d3436';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- からだ -->
        <ellipse cx="80" cy="135" rx="42" ry="30" fill="${fWhite}"/>
        <rect x="55" y="140" width="14" height="42" rx="6" fill="${fWhite}"/>
        <rect x="95" y="140" width="14" height="42" rx="6" fill="${fWhite}"/>
        <!-- くび＆たてがみ -->
        <path d="M 95 125 L 135 65 L 148 70 L 115 130 Z" fill="${fWhite}"/>
        <path d="M 125 55 L 138 65 L 105 125 Z" fill="${fStripe}"/>
        <!-- あたま -->
        <ellipse cx="145" cy="62" rx="20" ry="14" fill="${fWhite}"/>
        <!-- マズル -->
        <circle cx="160" cy="68" r="10" fill="${fStripe}"/>
        ${sil ? '' : `
          <!-- しまもよう -->
          <path d="M 70 120 L 75 145 M 85 118 L 90 148 M 100 120 L 105 145" stroke="${fStripe}" stroke-width="4"/>
          <circle cx="145" cy="58" r="3.5" fill="${fStripe}"/>
        `}
      </svg>
    `;
  }

  // --- 海の生き物 SVG ---
  getDolphinSvg(sil) {
    const fBlue = sil ? '#1e272e' : '#00cec9';
    const fWhite = sil ? '#1e272e' : '#ffffff';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ジャンプするイルカのからだ -->
        <path d="M 30 145 Q 60 45 135 60 Q 175 70 185 85 Q 155 105 120 115 Q 75 125 30 145 Z" fill="${fBlue}"/>
        <!-- せびれ -->
        <path d="M 100 60 Q 115 35 125 45 Q 118 60 110 65 Z" fill="${fBlue}"/>
        <!-- むなびれ -->
        <path d="M 120 95 Q 130 120 115 125 Q 110 110 115 95 Z" fill="${fBlue}"/>
        <!-- おびれ -->
        <path d="M 32 145 Q 15 130 10 142 Q 25 148 30 148 Q 20 160 30 165 Q 35 155 35 145 Z" fill="${fBlue}"/>
        ${sil ? '' : `
          <path d="M 65 125 Q 120 115 155 95 Q 125 110 75 135 Z" fill="${fWhite}"/>
          <circle cx="155" cy="78" r="4" fill="#2d3436"/>
          <circle cx="153" cy="76" r="1.5" fill="#fff"/>
        `}
      </svg>
    `;
  }

  getWhaleSvg(sil) {
    const fBlue = sil ? '#1e272e' : '#0984e3';
    const fBelly = sil ? '#1e272e' : '#dfe6e9';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- しおふき -->
        <path d="M 130 65 Q 130 35 120 30 Q 130 45 135 65 Q 140 40 150 30 Q 140 45 138 65 Z" fill="#74b9ff"/>
        <!-- おおきなからだ -->
        <path d="M 35 110 Q 70 65 140 70 Q 185 75 185 115 Q 185 145 135 145 Q 85 145 35 110 Z" fill="${fBlue}"/>
        <!-- おびれ -->
        <path d="M 35 110 Q 15 85 10 95 Q 25 110 35 112 Q 15 125 15 135 Q 28 125 38 112 Z" fill="${fBlue}"/>
        <!-- むなびれ -->
        <path d="M 115 130 Q 110 155 125 155 Q 130 140 125 130 Z" fill="${fBlue}"/>
        ${sil ? '' : `
          <path d="M 95 140 Q 140 145 175 125 Q 145 135 95 140 Z" fill="${fBelly}"/>
          <circle cx="160" cy="98" r="4.5" fill="#2d3436"/>
          <circle cx="158" cy="96" r="1.5" fill="#fff"/>
        `}
      </svg>
    `;
  }

  getSharkSvg(sil) {
    const fGray = sil ? '#1e272e' : '#636e72';
    const fWhite = sil ? '#1e272e' : '#ffffff';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- せびれ（三角形） -->
        <path d="M 90 75 Q 105 35 120 45 Q 110 70 105 75 Z" fill="${fGray}"/>
        <!-- からだ -->
        <path d="M 25 115 Q 70 70 150 75 Q 190 85 190 95 Q 150 125 90 125 Q 50 125 25 115 Z" fill="${fGray}"/>
        <!-- おびれ -->
        <path d="M 25 115 Q 5 75 5 85 Q 18 105 25 115 Q 8 135 12 145 Q 22 125 28 115 Z" fill="${fGray}"/>
        <!-- ひれ -->
        <path d="M 110 115 Q 100 145 120 145 Q 125 130 120 115 Z" fill="${fGray}"/>
        ${sil ? '' : `
          <path d="M 110 115 Q 150 118 180 95 Q 145 110 110 115 Z" fill="${fWhite}"/>
          <circle cx="165" cy="85" r="4" fill="#2d3436"/>
          <!-- エラ -->
          <line x1="135" y1="90" x2="135" y2="105" stroke="#2d3436" stroke-width="2"/>
          <line x1="140" y1="90" x2="140" y2="105" stroke="#2d3436" stroke-width="2"/>
        `}
      </svg>
    `;
  }

  getOctopusSvg(sil) {
    const fRed = sil ? '#1e272e' : '#ff4757';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- まるいあたま -->
        <ellipse cx="100" cy="75" rx="42" ry="45" fill="${fRed}"/>
        <!-- 8ほんのうねうねあし -->
        <path d="M 70 110 Q 50 140 40 165 Q 55 165 75 125 Z" fill="${fRed}"/>
        <path d="M 85 115 Q 75 150 70 175 Q 85 175 92 125 Z" fill="${fRed}"/>
        <path d="M 100 115 Q 100 155 105 178 Q 115 178 110 125 Z" fill="${fRed}"/>
        <path d="M 115 115 Q 125 150 130 175 Q 140 170 125 125 Z" fill="${fRed}"/>
        <path d="M 130 110 Q 150 140 160 165 Q 145 165 125 125 Z" fill="${fRed}"/>
        ${sil ? '' : `
          <circle cx="85" cy="72" r="6" fill="#2f3542"/>
          <circle cx="83" cy="70" r="2" fill="#fff"/>
          <circle cx="115" cy="72" r="6" fill="#2f3542"/>
          <circle cx="113" cy="70" r="2" fill="#fff"/>
          <!-- おくち -->
          <circle cx="100" cy="92" r="7" fill="#2f3542"/>
        `}
      </svg>
    `;
  }

  getTurtleSvg(sil) {
    const fGreen = sil ? '#1e272e' : '#2ed573';
    const fShell = sil ? '#1e272e' : '#26af5f';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ひれ（前足・後ろ足） -->
        <ellipse cx="60" cy="80" rx="26" ry="14" transform="rotate(-30 60 80)" fill="${fGreen}"/>
        <ellipse cx="140" cy="80" rx="26" ry="14" transform="rotate(30 140 80)" fill="${fGreen}"/>
        <ellipse cx="65" cy="140" rx="18" ry="10" transform="rotate(30 65 140)" fill="${fGreen}"/>
        <ellipse cx="135" cy="140" rx="18" ry="10" transform="rotate(-30 135 140)" fill="${fGreen}"/>
        <!-- あたま -->
        <ellipse cx="100" cy="55" rx="16" ry="20" fill="${fGreen}"/>
        <!-- まるいこうら -->
        <ellipse cx="100" cy="110" rx="45" ry="40" fill="${fShell}"/>
        ${sil ? '' : `
          <!-- こうら模様 -->
          <polygon points="100,85 118,98 118,122 100,135 82,122 82,98" stroke="#ffffff" stroke-width="2" fill="none"/>
          <circle cx="94" cy="50" r="3" fill="#2f3542"/>
          <circle cx="106" cy="50" r="3" fill="#2f3542"/>
        `}
      </svg>
    `;
  }

  getCrabSvg(sil) {
    const fRed = sil ? '#1e272e' : '#ff4757';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- はさみ（左右） -->
        <path d="M 60 85 Q 35 60 30 35 Q 55 40 65 65 Q 75 40 60 85 Z" fill="${fRed}"/>
        <path d="M 140 85 Q 165 60 170 35 Q 145 40 135 65 Q 125 40 140 85 Z" fill="${fRed}"/>
        <!-- あし -->
        <path d="M 50 120 Q 25 125 20 145 M 50 130 Q 30 140 25 160 M 50 140 Q 35 155 35 175" stroke="${fRed}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M 150 120 Q 175 125 180 145 M 150 130 Q 170 140 175 160 M 150 140 Q 165 155 165 175" stroke="${fRed}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- からだ -->
        <ellipse cx="100" cy="130" rx="46" ry="32" fill="${fRed}"/>
        <!-- め（飛び出し） -->
        <circle cx="85" cy="95" r="9" fill="${fRed}"/>
        <circle cx="115" cy="95" r="9" fill="${fRed}"/>
        ${sil ? '' : `
          <circle cx="85" cy="95" r="5" fill="#2f3542"/>
          <circle cx="83" cy="93" r="1.5" fill="#fff"/>
          <circle cx="115" cy="95" r="5" fill="#2f3542"/>
          <circle cx="113" cy="93" r="1.5" fill="#fff"/>
          <path d="M 92 135 Q 100 142 108 135" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none"/>
        `}
      </svg>
    `;
  }

  getPenguinSvg(sil) {
    const fBlack = sil ? '#1e272e' : '#2f3542';
    const fWhite = sil ? '#1e272e' : '#ffffff';
    const fOrange = sil ? '#1e272e' : '#ffa502';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- あし -->
        <ellipse cx="80" cy="170" rx="16" ry="8" fill="${fOrange}"/>
        <ellipse cx="120" cy="170" rx="16" ry="8" fill="${fOrange}"/>
        <!-- つばさ（パタパタ） -->
        <ellipse cx="58" cy="120" rx="12" ry="30" transform="rotate(20 58 120)" fill="${fBlack}"/>
        <ellipse cx="142" cy="120" rx="12" ry="30" transform="rotate(-20 142 120)" fill="${fBlack}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="115" rx="42" ry="52" fill="${fBlack}"/>
        <ellipse cx="100" cy="125" rx="28" ry="40" fill="${fWhite}"/>
        <!-- くちばし -->
        <polygon points="92,85 108,85 100,96" fill="${fOrange}"/>
        ${sil ? '' : `
          <circle cx="85" cy="75" r="4.5" fill="#2f3542"/>
          <circle cx="115" cy="75" r="4.5" fill="#2f3542"/>
          <circle cx="75" cy="85" r="5" fill="#ff7675" opacity="0.4"/>
          <circle cx="125" cy="85" r="5" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getSquidSvg(sil) {
    const fPink = sil ? '#1e272e' : '#fd79a8';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- えんぺら（三角あたま） -->
        <polygon points="100,25 60,75 140,75" fill="${fPink}"/>
        <!-- どうたい -->
        <ellipse cx="100" cy="90" rx="32" ry="35" fill="${fPink}"/>
        <!-- 10ぽんあし -->
        <path d="M 78 120 Q 70 155 65 180" stroke="${fPink}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 88 120 Q 85 155 82 175" stroke="${fPink}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 98 120 Q 100 160 100 185" stroke="${fPink}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M 108 120 Q 112 155 115 175" stroke="${fPink}" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 118 120 Q 125 155 130 180" stroke="${fPink}" stroke-width="5" stroke-linecap="round" fill="none"/>
        ${sil ? '' : `
          <circle cx="85" cy="100" r="5" fill="#2f3542"/>
          <circle cx="83" cy="98" r="1.5" fill="#fff"/>
          <circle cx="115" cy="100" r="5" fill="#2f3542"/>
          <circle cx="113" cy="98" r="1.5" fill="#fff"/>
        `}
      </svg>
    `;
  }

  getSealSvg(sil) {
    const fGray = sil ? '#1e272e' : '#a4b0be';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ごろごろアザラシ -->
        <ellipse cx="95" cy="120" rx="60" ry="35" fill="${fGray}"/>
        <ellipse cx="145" cy="95" rx="25" ry="22" fill="${fGray}"/>
        <!-- ひれ -->
        <ellipse cx="105" cy="140" rx="18" ry="10" transform="rotate(20 105 140)" fill="${fGray}"/>
        <path d="M 35 120 Q 15 110 15 130 Q 30 130 40 125 Z" fill="${fGray}"/>
        ${sil ? '' : `
          <circle cx="152" cy="90" r="4.5" fill="#2f3542"/>
          <circle cx="150" cy="88" r="1.5" fill="#fff"/>
          <!-- おひげ -->
          <line x1="160" y1="98" x2="175" y2="95" stroke="#2f3542" stroke-width="2"/>
          <line x1="160" y1="102" x2="175" y2="105" stroke="#2f3542" stroke-width="2"/>
        `}
      </svg>
    `;
  }

  getClownfishSvg(sil) {
    const fOrange = sil ? '#1e272e' : '#ff793f';
    const fWhite = sil ? '#1e272e' : '#ffffff';
    const fBlack = sil ? '#1e272e' : '#2f3542';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- おびれ -->
        <path d="M 45 100 Q 15 70 20 100 Q 15 130 45 100 Z" fill="${fOrange}"/>
        <!-- ひれ -->
        <path d="M 100 65 Q 115 45 130 65 Z" fill="${fOrange}"/>
        <path d="M 100 135 Q 115 155 130 135 Z" fill="${fOrange}"/>
        <!-- からだ -->
        <ellipse cx="105" cy="100" rx="55" ry="36" fill="${fOrange}"/>
        ${sil ? '' : `
          <!-- 白い3本バンド -->
          <path d="M 80 70 Q 90 100 80 130 L 92 128 Q 100 100 92 72 Z" fill="${fWhite}"/>
          <path d="M 120 68 Q 128 100 120 132 L 130 130 Q 138 100 130 70 Z" fill="${fWhite}"/>
          <!-- め -->
          <circle cx="145" cy="92" r="5" fill="${fBlack}"/>
          <circle cx="143" cy="90" r="1.5" fill="#fff"/>
        `}
      </svg>
    `;
  }

  // --- 空の生き物 SVG ---
  getEagleSvg(sil) {
    const fBrown = sil ? '#1e272e' : '#4b4b4b';
    const fHead = sil ? '#1e272e' : '#ffffff';
    const fBeak = sil ? '#1e272e' : '#f1c40f';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- つばさ（広げた翼） -->
        <path d="M 100 90 Q 50 30 15 50 Q 40 90 85 105 Z" fill="${fBrown}"/>
        <path d="M 100 90 Q 150 30 185 50 Q 160 90 115 105 Z" fill="${fBrown}"/>
        <!-- からだ＆尾 -->
        <ellipse cx="100" cy="120" rx="25" ry="35" fill="${fBrown}"/>
        <polygon points="90,150 110,150 100,175" fill="${fHead}"/>
        <!-- しろいあたま -->
        <circle cx="100" cy="80" r="22" fill="${fHead}"/>
        <!-- かぎづめくちばし -->
        <path d="M 100 85 Q 115 85 110 102 Q 100 95 95 90 Z" fill="${fBeak}"/>
        ${sil ? '' : `
          <circle cx="106" cy="78" r="3.5" fill="#2d3436"/>
        `}
      </svg>
    `;
  }

  getOwlSvg(sil) {
    const fBrown = sil ? '#1e272e' : '#8395a7';
    const fEye = sil ? '#1e272e' : '#f1c40f';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- みみづくのつの -->
        <polygon points="65,70 55,40 85,58" fill="${fBrown}"/>
        <polygon points="135,70 145,40 115,58" fill="${fBrown}"/>
        <!-- まるいからだ -->
        <ellipse cx="100" cy="115" rx="45" ry="50" fill="${fBrown}"/>
        <!-- あたま -->
        <circle cx="100" cy="90" r="40" fill="${fBrown}"/>
        ${sil ? '' : `
          <!-- おおきなめ -->
          <circle cx="82" cy="88" r="14" fill="${fEye}"/>
          <circle cx="82" cy="88" r="7" fill="#2d3436"/>
          <circle cx="80" cy="85" r="2.5" fill="#fff"/>
          <circle cx="118" cy="88" r="14" fill="${fEye}"/>
          <circle cx="118" cy="88" r="7" fill="#2d3436"/>
          <circle cx="116" cy="85" r="2.5" fill="#fff"/>
          <!-- くちばし -->
          <polygon points="96,96 104,96 100,108" fill="#e67e22"/>
        `}
      </svg>
    `;
  }

  getFlamingoSvg(sil) {
    const fPink = sil ? '#1e272e' : '#ff7597';
    const fBeak = sil ? '#1e272e' : '#2d3436';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- 1ぽんあし -->
        <line x1="105" y1="130" x2="105" y2="185" stroke="${fPink}" stroke-width="4"/>
        <line x1="105" y1="140" x2="85" y2="160" stroke="${fPink}" stroke-width="4"/>
        <!-- からだ -->
        <ellipse cx="105" cy="120" rx="32" ry="22" fill="${fPink}"/>
        <!-- Sじのくび -->
        <path d="M 125 115 Q 160 90 145 55 Q 135 40 120 45" stroke="${fPink}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- あたま -->
        <circle cx="115" cy="45" r="14" fill="${fPink}"/>
        <!-- くちばし -->
        <path d="M 110 50 Q 95 55 90 70 Q 102 65 110 55 Z" fill="${fBeak}"/>
        ${sil ? '' : `
          <circle cx="118" cy="42" r="3" fill="#2d3436"/>
        `}
      </svg>
    `;
  }

  getDuckSvg(sil) {
    const fYellow = sil ? '#1e272e' : '#f1c40f';
    const fOrange = sil ? '#1e272e' : '#e67e22';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- からだ -->
        <ellipse cx="90" cy="130" rx="45" ry="30" fill="${fYellow}"/>
        <path d="M 45 125 Q 30 110 40 135 Z" fill="${fYellow}"/>
        <!-- あたま -->
        <circle cx="130" cy="85" r="24" fill="${fYellow}"/>
        <!-- まるいくちばし -->
        <path d="M 145 85 Q 175 88 170 98 Q 145 98 142 90 Z" fill="${fOrange}"/>
        ${sil ? '' : `
          <circle cx="135" cy="78" r="4" fill="#2d3436"/>
          <circle cx="133" cy="76" r="1.5" fill="#fff"/>
          <circle cx="122" cy="90" r="5" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }

  getParrotSvg(sil) {
    const fGreen = sil ? '#1e272e' : '#10ac84';
    const fRed = sil ? '#1e272e' : '#ee5253';
    const fYellow = sil ? '#1e272e' : '#feca57';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ながいおばね -->
        <path d="M 60 140 Q 40 185 30 195 Q 55 175 75 140 Z" fill="${fRed}"/>
        <!-- からだ -->
        <ellipse cx="90" cy="120" rx="30" ry="40" fill="${fGreen}"/>
        <!-- あたま -->
        <circle cx="115" cy="75" r="25" fill="${fRed}"/>
        <!-- かぎばし -->
        <path d="M 125 72 Q 150 75 140 98 Q 128 88 125 80 Z" fill="${fYellow}"/>
        ${sil ? '' : `
          <circle cx="115" cy="70" r="4" fill="#2d3436"/>
        `}
      </svg>
    `;
  }

  getBatSvg(sil) {
    const fPurple = sil ? '#1e272e' : '#5f27cd';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- コウモリのつばさ（ギザギザ） -->
        <path d="M 100 110 Q 50 40 15 70 Q 30 100 40 130 Q 60 115 80 125 Q 90 115 100 110 Z" fill="${fPurple}"/>
        <path d="M 100 110 Q 150 40 185 70 Q 170 100 160 130 Q 140 115 120 125 Q 110 115 100 110 Z" fill="${fPurple}"/>
        <!-- とがったみみ -->
        <polygon points="90,75 80,45 98,62" fill="${fPurple}"/>
        <polygon points="110,75 120,45 102,62" fill="${fPurple}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="100" rx="20" ry="28" fill="${fPurple}"/>
        ${sil ? '' : `
          <circle cx="94" cy="80" r="3.5" fill="#ff4757"/>
          <circle cx="106" cy="80" r="3.5" fill="#ff4757"/>
          <!-- キバ -->
          <polygon points="96,92 98,98 100,92" fill="#fff"/>
          <polygon points="100,92 102,98 104,92" fill="#fff"/>
        `}
      </svg>
    `;
  }

  getSwanSvg(sil) {
    const fWhite = sil ? '#1e272e' : '#ffffff';
    const fOrange = sil ? '#1e272e' : '#ff9f43';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- うつくしいからだ -->
        <ellipse cx="90" cy="135" rx="48" ry="26" fill="${fWhite}"/>
        <!-- つばさ -->
        <path d="M 60 130 Q 80 105 110 115 Q 85 140 60 130 Z" fill="${fWhite}"/>
        <!-- Sじのながいくび -->
        <path d="M 115 130 Q 160 90 140 50 Q 125 35 115 45" stroke="${fWhite}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- あたま -->
        <circle cx="112" cy="45" r="14" fill="${fWhite}"/>
        <polygon points="108,48 90,52 104,56" fill="${fOrange}"/>
        ${sil ? '' : `
          <circle cx="114" cy="43" r="3" fill="#2d3436"/>
        `}
      </svg>
    `;
  }

  getPigeonSvg(sil) {
    const fGray = sil ? '#1e272e' : '#a4b0be';
    const fGreen = sil ? '#1e272e' : '#2ed573';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- はと -->
        <ellipse cx="90" cy="125" rx="42" ry="30" fill="${fGray}"/>
        <!-- おばね -->
        <polygon points="50,125 20,135 45,145" fill="${fGray}"/>
        <!-- あたま -->
        <circle cx="130" cy="85" r="22" fill="${fGray}"/>
        <!-- くちばし -->
        <polygon points="145,85 160,88 145,92" fill="#ff7675"/>
        <!-- オリーブのはっぱ -->
        <path d="M 155 90 Q 175 80 170 95 Q 160 95 155 90 Z" fill="${fGreen}"/>
        ${sil ? '' : `
          <circle cx="134" cy="80" r="4" fill="#e84118"/>
          <circle cx="133" cy="79" r="1.5" fill="#fff"/>
        `}
      </svg>
    `;
  }

  getButterflySvg(sil) {
    const fBlue = sil ? '#1e272e' : '#48dbfb';
    const fBody = sil ? '#1e272e' : '#222f3e';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- ちょうちょのはね -->
        <ellipse cx="65" cy="75" rx="35" ry="38" transform="rotate(-20 65 75)" fill="${fBlue}"/>
        <ellipse cx="135" cy="75" rx="35" ry="38" transform="rotate(20 135 75)" fill="${fBlue}"/>
        <ellipse cx="75" cy="135" rx="26" ry="28" transform="rotate(15 75 135)" fill="${fBlue}"/>
        <ellipse cx="125" cy="135" rx="26" ry="28" transform="rotate(-15 125 135)" fill="${fBlue}"/>
        <!-- しょっかく -->
        <path d="M 96 60 Q 80 30 75 35 M 104 60 Q 120 30 125 35" stroke="${fBody}" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- どうたい -->
        <ellipse cx="100" cy="105" rx="8" ry="42" fill="${fBody}"/>
        ${sil ? '' : `
          <circle cx="65" cy="75" r="12" fill="#ffffff" opacity="0.6"/>
          <circle cx="135" cy="75" r="12" fill="#ffffff" opacity="0.6"/>
          <circle cx="75" cy="135" r="8" fill="#feca57"/>
          <circle cx="125" cy="135" r="8" fill="#feca57"/>
        `}
      </svg>
    `;
  }

  getBeeSvg(sil) {
    const fYellow = sil ? '#1e272e' : '#feca57';
    const fStripe = sil ? '#1e272e' : '#2d3436';
    const fWing = sil ? '#1e272e' : 'rgba(255,255,255,0.7)';
    return `
      <svg viewBox="0 0 200 200" class="animal-svg ${sil ? 'is-silhouette' : 'is-color'}">
        <!-- はね（透明） -->
        <ellipse cx="80" cy="65" rx="24" ry="14" transform="rotate(-35 80 65)" fill="${fWing}" stroke="#576574" stroke-width="1.5"/>
        <ellipse cx="120" cy="65" rx="24" ry="14" transform="rotate(35 120 65)" fill="${fWing}" stroke="#576574" stroke-width="1.5"/>
        <!-- はり -->
        <polygon points="100,165 94,150 106,150" fill="${fStripe}"/>
        <!-- からだ -->
        <ellipse cx="100" cy="120" rx="38" ry="42" fill="${fYellow}"/>
        <!-- しましま -->
        <path d="M 64 110 Q 100 120 136 110 L 134 122 Q 100 132 66 122 Z" fill="${fStripe}"/>
        <path d="M 68 135 Q 100 145 132 135 L 128 145 Q 100 155 72 145 Z" fill="${fStripe}"/>
        <!-- あたま -->
        <circle cx="100" cy="78" r="22" fill="${fYellow}"/>
        <!-- しょっかく -->
        <path d="M 95 60 Q 85 45 80 48 M 105 60 Q 115 45 120 48" stroke="${fStripe}" stroke-width="3" stroke-linecap="round" fill="none"/>
        ${sil ? '' : `
          <circle cx="92" cy="74" r="4" fill="${fStripe}"/>
          <circle cx="108" cy="74" r="4" fill="${fStripe}"/>
          <circle cx="82" cy="82" r="4" fill="#ff7675" opacity="0.4"/>
          <circle cx="118" cy="82" r="4" fill="#ff7675" opacity="0.4"/>
        `}
      </svg>
    `;
  }
}

window.GameAnimalSilhouette = GameAnimalSilhouette;
