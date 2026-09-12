/**
 * game_shopping.js - ゲーム4: 10えんチャリン！パン工場のおかいもの（10のまとまり・位取り）
 */

class GameShopping {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('shopping-speech-text');
    this.productImgEl = document.getElementById('shopping-product-img');
    this.productNameEl = document.getElementById('shopping-product-name');
    this.productPriceEl = document.getElementById('shopping-product-price');
    this.trayCoinsEl = document.getElementById('shopping-tray-coins');
    this.tallyTextEl = document.getElementById('shopping-tally-text');
    this.payBtnEl = document.getElementById('shopping-pay-btn');
    this.speechBubble = document.getElementById('shopping-speech-bubble');

    this.charManager = new CharacterManager('shopping-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.targetPrice = 25; // 10〜99円
    this.coinsInTray = []; // array of { id, value: 10 or 1 }
    this.isCleared = false;
    this.isLocked = false;

    // パン＆スイーツのバリエーション
    this.products = [
      { name: '🥐 サクサク クロワッサン', emoji: '🥐', price: 23 },
      { name: '🍈 メロンパン', emoji: '🍈', price: 35 },
      { name: '🥪 たまご サンドイッチ', emoji: '🥪', price: 42 },
      { name: '🍓 いちご ロールケーキ', emoji: '🍰', price: 56 },
      { name: '🍩 チョコ ドーナツ', emoji: '🍩', price: 60 },
      { name: '🍞 やきたて 食パン', emoji: '🍞', price: 74 },
      { name: '🎂 おたんじょうび ケーキ', emoji: '🎂', price: 85 }
    ];

    this.currentProductIdx = 0;
    this.initEvents();
  }

  initEvents() {
    // 10円コインタップ
    const coin10Btn = document.getElementById('coin-source-10');
    if (coin10Btn) {
      coin10Btn.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('shopping')) return;
        e.preventDefault();
        this.addCoin(10);
      });
    }

    // 1円コインタップ
    const coin1Btn = document.getElementById('coin-source-1');
    if (coin1Btn) {
      coin1Btn.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('shopping')) return;
        e.preventDefault();
        this.addCoin(1);
      });
    }

    // お会計ボタン
    if (this.payBtnEl) {
      this.payBtnEl.addEventListener('click', () => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('shopping')) return;
        this.checkPayment();
      });
    }

    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('shopping')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('shopping_prompt');
      });
    }
  }

  start() {
    this.stars = 0;
    this.currentProductIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;
    this.coinsInTray = [];

    const product = this.products[this.currentProductIdx % this.products.length];
    this.targetPrice = product.price;

    this.charManager.setCharacter('shokupan');
    this.charManager.setState('idle');

    this.productImgEl.innerHTML = `<span class="shopping-emoji-large">${product.emoji}</span>`;
    this.productNameEl.textContent = product.name;
    this.productPriceEl.textContent = `${this.targetPrice} 円`;

    this.speechTextEl.innerHTML = `
      この <span class="target-name">${product.name}</span> は <br>
      <span class="target-num">${this.targetPrice}</span> えん だよ！
    `;

    this.renderTray();

    setTimeout(() => {
      if (!this.app.isCurrentView('shopping')) return;
      window.soundSystem.playVoice('shopping_prompt');
    }, 400);
  }

  addCoin(val) {
    window.soundSystem.playCoin();
    if (val === 10) window.soundSystem.playVoice('coin_10');
    else window.soundSystem.playVoice('coin_1');

    this.coinsInTray.push({ id: Date.now() + Math.random(), value: val });
    this.renderTray();

    // ぴったり金額に達したか自動判定
    const sum = this.calcTotal();
    if (sum === this.targetPrice) {
      setTimeout(() => this.checkPayment(), 500);
    }
  }

  removeCoin(index) {
    if (index >= 0 && index < this.coinsInTray.length) {
      window.soundSystem.playPop();
      this.coinsInTray.splice(index, 1);
      this.renderTray();
    }
  }

  calcTotal() {
    return this.coinsInTray.reduce((acc, c) => acc + c.value, 0);
  }

  renderTray() {
    if (!this.trayCoinsEl) return;
    this.trayCoinsEl.innerHTML = '';

    const count10 = this.coinsInTray.filter(c => c.value === 10).length;
    const count1 = this.coinsInTray.filter(c => c.value === 1).length;
    const total = count10 * 10 + count1;

    // トレイ内のコイン表示
    this.coinsInTray.forEach((c, idx) => {
      const coinEl = document.createElement('div');
      coinEl.className = `tray-coin coin-${c.value} pop-in`;
      coinEl.innerHTML = `<span class="coin-label">${c.value}</span>`;
      coinEl.title = 'タップして戻す';

      coinEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked) return;
        e.stopPropagation();
        this.removeCoin(idx);
      });

      this.trayCoinsEl.appendChild(coinEl);
    });

    // 計算式ラベルの更新
    this.tallyTextEl.innerHTML = `
      10円×<strong>${count10}</strong>枚 (${count10 * 10}円) ＋ 1円×<strong>${count1}</strong>枚 (${count1}円) ＝ 
      <span class="sum-highlight ${total === this.targetPrice ? 'exact' : (total > this.targetPrice ? 'over' : '')}">${total} 円</span>
    `;

    if (this.payBtnEl) {
      this.payBtnEl.classList.toggle('ready', total === this.targetPrice);
    }
  }

  checkPayment() {
    const total = this.calcTotal();
    if (total === this.targetPrice) {
      // ぴったり大正解！
      this.isCleared = true;
      this.isLocked = true;

      window.soundSystem.playRegister();

      // パンが袋に入るアニメーション
      this.productImgEl.innerHTML = `<span class="shopping-bag-pack pop-in">🛍️✨</span>`;

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();

        const trayRect = this.trayCoinsEl.getBoundingClientRect();
        this.app.particles.explode(trayRect.left + trayRect.width / 2, trayRect.top + trayRect.height / 2, 85);

        window.soundSystem.playVoice('shopping_exact');

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('shopping')) return;
          this.currentProductIdx++;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3600);

      }, 700);

    } else if (total > this.targetPrice) {
      // 多すぎる
      window.soundSystem.playPop();
      window.soundSystem.playVoice('shopping_too_much');
    } else {
      // 足りない
      window.soundSystem.playPop();
      const diff = this.targetPrice - total;
      this.speechTextEl.innerHTML = `
        あと <span class="target-num">${diff}</span> えん はらってね！
      `;
    }
  }
}

window.GameShopping = GameShopping;
