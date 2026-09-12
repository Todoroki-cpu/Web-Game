/**
 * game_season_wheel.js - ゲーム12: めぐる4つのきせつ！まほうの木パズル（季節のめぐり）
 */

class GameSeasonWheel {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('season-wheel-speech-text');
    this.magicTreeEl = document.getElementById('season-magic-tree');
    this.wheelButtonsGridEl = document.getElementById('season-wheel-buttons');
    this.speechBubble = document.getElementById('season-wheel-speech-bubble');

    this.charManager = new CharacterManager('season-wheel-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isLocked = false;

    this.questions = [
      { prompt: '<span class="target-name">あき（秋）</span> の つぎの きせつは なにかな？⛄', target: 'winter', voice: 'season_winter' },
      { prompt: '<span class="target-name">ふゆ（冬）</span> の つぎに さくらがさく きせつは？🌸', target: 'spring', voice: 'season_spring' },
      { prompt: '<span class="target-name">はる（春）</span> の つぎの あつい きせつは？🌻', target: 'summer', voice: 'season_summer' },
      { prompt: '<span class="target-name">なつ（夏）</span> の つぎに もみじの きせつは？🍁', target: 'autumn', voice: 'season_autumn' }
    ];
    this.qIdx = 0;

    this.seasonsList = [
      { key: 'spring', name: 'はる（春）', emoji: '🌸', color: '#ff7675' },
      { key: 'summer', name: 'なつ（夏）', emoji: '🌻', color: '#0984e3' },
      { key: 'autumn', name: 'あき（秋）', emoji: '🍁', color: '#e67e22' },
      { key: 'winter', name: 'ふゆ（冬）', emoji: '⛄', color: '#74b9ff' }
    ];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('season_wheel')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('season_wheel_prompt');
      });
    }
  }

  start() {
    this.stars = 0;
    this.qIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;

    this.charManager.setCharacter('anpan');
    this.charManager.setState('idle');

    const q = this.questions[this.qIdx % this.questions.length];
    this.speechTextEl.innerHTML = q.prompt;

    this.renderTree('spring'); // 初期ツリー
    this.renderButtons(q.target);
    this.app.startTimer(10);

    setTimeout(() => {
      if (!this.app.isCurrentView('season_wheel')) return;
      window.soundSystem.playVoice('season_wheel_prompt');
    }, 400);
  }

  renderTree(seasonKey) {
    if (!this.magicTreeEl) return;
    this.magicTreeEl.className = `magic-tree-box tree-${seasonKey}`;

    // 季節に応じたSVGツリーの描画
    let foliageSvg = '';
    if (seasonKey === 'spring') {
      // 桜
      foliageSvg = `
        <ellipse cx="100" cy="70" rx="65" ry="50" fill="#ffb8b8" opacity="0.95"/>
        <ellipse cx="70" cy="60" rx="35" ry="30" fill="#ff7675" opacity="0.8"/>
        <ellipse cx="130" cy="60" rx="35" ry="30" fill="#ff7675" opacity="0.8"/>
        <circle cx="100" cy="45" r="35" fill="#ffcccc"/>
        <text x="75" y="65" font-size="16">🌸</text><text x="110" y="80" font-size="16">🌸</text><text x="95" y="40" font-size="16">🌸</text>
      `;
    } else if (seasonKey === 'summer') {
      // 青々とした新緑
      foliageSvg = `
        <ellipse cx="100" cy="70" rx="70" ry="55" fill="#2ed573" opacity="0.95"/>
        <ellipse cx="65" cy="65" rx="40" ry="35" fill="#20bf6b"/>
        <ellipse cx="135" cy="65" rx="40" ry="35" fill="#20bf6b"/>
        <circle cx="100" cy="45" r="38" fill="#2ed573"/>
        <text x="145" y="35" font-size="22">☀️</text>
      `;
    } else if (seasonKey === 'autumn') {
      // 紅葉と果実
      foliageSvg = `
        <ellipse cx="100" cy="70" rx="68" ry="52" fill="#e67e22" opacity="0.95"/>
        <ellipse cx="68" cy="65" rx="38" ry="32" fill="#d35400"/>
        <ellipse cx="132" cy="65" rx="38" ry="32" fill="#c0392b"/>
        <circle cx="100" cy="45" r="36" fill="#f39c12"/>
        <text x="75" y="65" font-size="14">🍎</text><text x="115" y="75" font-size="14">🍎</text><text x="95" y="45" font-size="14">🍎</text>
      `;
    } else {
      // 雪化粧
      foliageSvg = `
        <ellipse cx="100" cy="70" rx="60" ry="45" fill="#dfe4ea" opacity="0.8"/>
        <path d="M40 70 Q100 30 160 70 Q100 50 40 70 Z" fill="#ffffff"/>
        <path d="M60 45 Q100 15 140 45 Q100 30 60 45 Z" fill="#ffffff"/>
        <text x="85" y="65" font-size="18">⛄</text><text x="115" y="80" font-size="16">❄️</text>
      `;
    }

    this.magicTreeEl.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%" class="magic-tree-svg">
        <!-- 木の幹 -->
        <path d="M90 180 L90 100 Q80 120 70 130 M90 105 L110 100 Q120 120 130 130 L110 180 Z" fill="#795548" stroke="#5d4037" stroke-width="3"/>
        <!-- 葉っぱ -->
        ${foliageSvg}
      </svg>
    `;
  }

  renderButtons(targetKey) {
    if (!this.wheelButtonsGridEl) return;
    this.wheelButtonsGridEl.innerHTML = '';

    this.seasonsList.forEach(item => {
      const btn = document.createElement('div');
      btn.className = 'season-wheel-choice-btn pop-in';
      btn.style.borderColor = item.color;
      btn.innerHTML = `
        <span class="wheel-choice-emoji">${item.emoji}</span>
        <span class="wheel-choice-name">${item.name}</span>
      `;

      btn.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('season_wheel')) return;
        e.preventDefault();
        this.handleChoice(item.key, targetKey, btn);
      });

      this.wheelButtonsGridEl.appendChild(btn);
    });
  }

  handleChoice(selectedKey, targetKey, element) {
    this.renderTree(selectedKey);

    if (selectedKey === targetKey) {
      // 正解！
      this.isCleared = true;
      this.isLocked = true;
      this.app.stopTimer();

      window.soundSystem.playSparkle();
      element.classList.add('selected-correct');

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();
        window.soundSystem.playVoice('season_wheel_clear');

        const treeRect = this.magicTreeEl.getBoundingClientRect();
        this.app.particles.explode(treeRect.left + treeRect.width / 2, treeRect.top + treeRect.height / 2, 90);

        this.stars++;
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('season_wheel')) return;
          this.qIdx++;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3600);

      }, 600);

    } else {
      // 不正解
      window.soundSystem.playPop();
      element.classList.add('shake');
      setTimeout(() => element.classList.remove('shake'), 400);
    }
  }
}

window.GameSeasonWheel = GameSeasonWheel;
