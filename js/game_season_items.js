/**
 * game_season_items.js - ゲーム11: しきおりおり！きせつの きせかえ＆アイテムあつめ（春夏秋冬）
 */

class GameSeasonItems {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('season-items-speech-text');
    this.stageBgEl = document.getElementById('season-items-stage-bg');
    this.itemsGridEl = document.getElementById('season-items-grid');
    this.basketEl = document.getElementById('season-items-basket');
    this.basketItemsEl = document.getElementById('season-basket-items');
    this.speechBubble = document.getElementById('season-items-speech-bubble');

    this.charManager = new CharacterManager('season-items-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.currentSeasonIdx = 0;
    this.collectedCount = 0;
    this.targetCount = 3;
    this.isCleared = false;
    this.isLocked = false;

    this.seasons = [
      {
        name: '🌸 はる（春）',
        key: 'spring',
        voice: 'season_spring',
        themeClass: 'theme-spring',
        correctItems: [
          { name: 'さくらもち', emoji: '🍡' },
          { name: 'チューリップ', emoji: '🌷' },
          { name: 'たけのこ', emoji: '🎍' },
          { name: 'いちご', emoji: '🍓' }
        ],
        wrongItems: [
          { name: 'ゆきだるま', emoji: '⛄' },
          { name: 'すいか', emoji: '🍉' }
        ]
      },
      {
        name: '🌻 なつ（夏）',
        key: 'summer',
        voice: 'season_summer',
        themeClass: 'theme-summer',
        correctItems: [
          { name: 'すいか', emoji: '🍉' },
          { name: 'かきごおり', emoji: '🍧' },
          { name: 'カブトムシ', emoji: '🪲' },
          { name: 'うきわ', emoji: '🛟' }
        ],
        wrongItems: [
          { name: 'ゆきだるま', emoji: '⛄' },
          { name: 'さくらもち', emoji: '🍡' }
        ]
      },
      {
        name: '🍁 あき（秋）',
        key: 'autumn',
        voice: 'season_autumn',
        themeClass: 'theme-autumn',
        correctItems: [
          { name: 'どんぐり', emoji: '🌰' },
          { name: 'さつまいも', emoji: '🍠' },
          { name: 'きのこ', emoji: '🍄' },
          { name: 'あきサンマ', emoji: '🐟' }
        ],
        wrongItems: [
          { name: 'うきわ', emoji: '🛟' },
          { name: 'チューリップ', emoji: '🌷' }
        ]
      },
      {
        name: '⛄ ふゆ（冬）',
        key: 'winter',
        voice: 'season_winter',
        themeClass: 'theme-winter',
        correctItems: [
          { name: 'ゆきだるま', emoji: '⛄' },
          { name: 'みかん', emoji: '🍊' },
          { name: 'てぶくろ', emoji: '🧤' },
          { name: 'クリスマスツリー', emoji: '🎄' }
        ],
        wrongItems: [
          { name: 'かきごおり', emoji: '🍧' },
          { name: 'カブトムシ', emoji: '🪲' }
        ]
      }
    ];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('season_items')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('season_items_prompt');
      });
    }
  }

  start() {
    this.stars = 0;
    this.currentSeasonIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;
    this.collectedCount = 0;

    if (this.basketItemsEl) {
      this.basketItemsEl.innerHTML = '';
    }

    this.charManager.setCharacter('melonpan');
    this.charManager.setState('idle');

    const season = this.seasons[this.currentSeasonIdx % this.seasons.length];

    if (this.stageBgEl) {
      this.stageBgEl.className = 'season-stage-ambient ' + season.themeClass;
    }

    this.speechTextEl.innerHTML = `
      <span class="target-name">${season.name}</span> の アイテムを<br>
      カゴに <span class="target-num">3</span> つ あつめよう！🧺
    `;

    this.renderItems(season);

    setTimeout(() => {
      if (!this.app.isCurrentView('season_items')) return;
      window.soundSystem.playVoice(season.voice);
      setTimeout(() => {
        if (this.app.isCurrentView('season_items')) {
          window.soundSystem.playVoice('season_items_prompt');
        }
      }, 1200);
    }, 400);
  }

  renderItems(season) {
    if (!this.itemsGridEl) return;
    this.itemsGridEl.innerHTML = '';

    // 正解アイテム3つ ＋ 不正解アイテム2つをシャッフル
    const correctShuffled = season.correctItems.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    const list = [...correctShuffled.map(item => ({ ...item, isCorrect: true })), ...season.wrongItems.map(item => ({ ...item, isCorrect: false }))];
    list.sort(() => Math.random() - 0.5);

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'season-item-card pop-in';
      card.innerHTML = `
        <span class="season-item-emoji">${item.emoji}</span>
        <span class="season-item-title">${item.name}</span>
      `;

      card.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('season_items') || card.classList.contains('collected')) return;
        e.preventDefault();
        this.handleItemClick(item, card);
      });

      this.itemsGridEl.appendChild(card);
    });
  }

  handleItemClick(item, cardEl) {
    if (item.isCorrect) {
      // 正しい季節のアイテム！
      window.soundSystem.playPop();
      cardEl.classList.add('collected');

      this.collectedCount++;

      // カゴに入れる
      const inBasketEl = document.createElement('span');
      inBasketEl.className = 'basket-food-emoji pop-in';
      inBasketEl.textContent = item.emoji;
      this.basketItemsEl.appendChild(inBasketEl);

      const rect = cardEl.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);

      if (this.collectedCount >= this.targetCount) {
        // 3つ集まった！
        this.handleSeasonClear();
      }
    } else {
      // 違う季節のアイテム
      window.soundSystem.playPop();
      cardEl.classList.add('shake');
      setTimeout(() => cardEl.classList.remove('shake'), 400);
    }
  }

  handleSeasonClear() {
    this.isCleared = true;
    this.isLocked = true;

    setTimeout(() => {
      this.charManager.setState('celebrate');
      window.soundSystem.playFanfare();
      window.soundSystem.playVoice('season_items_clear');

      const basketRect = this.basketEl.getBoundingClientRect();
      this.app.particles.explode(basketRect.left + basketRect.width / 2, basketRect.top + basketRect.height / 2, 85);

      this.stars++;
      window.soundSystem.playSparkle();
      this.app.updateStamps(this.stars, this.maxStars);

      setTimeout(() => {
        if (!this.app.isCurrentView('season_items')) return;
        this.currentSeasonIdx++;
        if (this.stars >= this.maxStars) {
          this.app.showCompleteModal();
        } else {
          this.nextRound();
        }
      }, 3600);

    }, 500);
  }
}

window.GameSeasonItems = GameSeasonItems;
