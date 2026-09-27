/**
 * game_nyanko_defense.js - とびだせ！にゃんこ大行進 (Kids Cat Line Defense)
 * 
 * 5・6歳向けに特化したiPad横画面フィットの超直感タワーディフェンスゲーム。
 * おさかな（エネルギー）1〜5個で大きなカードをタップして出撃！
 * 
 * 全キャラクターSVGベクター、オートバトル、必殺にゃんこビーム、
 * LocalStorageによるステージ進行・パワーアップ保存を完備。
 */

class GameNyankoDefense {
  constructor(app) {
    this.app = app;
    this.containerEl = null;

    // ゲーム進行・セーブデータ
    this.storageKey = 'nyanko_defense_save_v1';
    this.saveData = this.loadSaveData();

    // バトルステート
    this.currentStage = 1;
    this.maxStage = 5;
    this.gameState = 'menu'; // 'stage_select', 'battle', 'result', 'upgrade'
    this.animFrameId = null;
    this.lastTime = 0;

    // バトルパラメータ
    this.fishEnergy = 0;
    this.maxFish = 5;
    this.fishChargeRate = 0.65; // 1秒あたりのおさかな回復量
    this.cannonCharge = 0; // 0〜100
    this.cannonChargeRate = 3.5; // 1秒あたりのチャージ量

    this.playerCastle = { x: 80, hp: 6, maxHp: 6, state: 'idle' };
    this.enemyCastle = { x: 920, hp: 10, maxHp: 10, state: 'idle' };

    this.playerUnits = [];
    this.enemyUnits = [];
    this.particles = [];
    this.popTexts = [];
    this.laserActive = false;
    this.laserTimer = 0;

    // 味方にゃんこカタログ（コスト・性能・SVG定義）
    this.catRoster = [
      {
        id: 'cat_basic', name: 'ねこ', cost: 1, cooldown: 1.5, cdTimer: 0,
        hp: 4, atk: 1.2, spd: 55, range: 25, atkInterval: 1.0,
        desc: 'まるっこい しろねこ！ たくさん だせるよ！',
        svg: (anim) => this.getBasicCatSvg(anim)
      },
      {
        id: 'cat_tank', name: 'タンクねこ', cost: 2, cooldown: 3.5, cdTimer: 0,
        hp: 16, atk: 0.8, spd: 35, range: 20, atkInterval: 1.6,
        desc: 'もちもちボディ！ みんなの たてになるよ！',
        svg: (anim) => this.getTankCatSvg(anim)
      },
      {
        id: 'cat_battle', name: 'バトルねこ', cost: 3, cooldown: 4.5, cdTimer: 0,
        hp: 8, atk: 3.0, spd: 65, range: 30, atkInterval: 1.1,
        desc: 'あかいハチマキ！ おさかなソードで こうげき！',
        svg: (anim) => this.getBattleCatSvg(anim)
      },
      {
        id: 'cat_giraffe', name: 'きりんねこ', cost: 3, cooldown: 4.0, cdTimer: 0,
        hp: 6, atk: 1.6, spd: 110, range: 25, atkInterval: 0.5,
        desc: 'くびが ながーい！ もうスピードで とつげき！',
        svg: (anim) => this.getGiraffeCatSvg(anim)
      },
      {
        id: 'cat_ufo', name: 'とりねこUFO', cost: 4, cooldown: 6.0, cdTimer: 0,
        hp: 7, atk: 2.8, spd: 45, range: 120, atkInterval: 1.8, isFlying: true,
        desc: 'おそらから おさかなボムを おとすよ！',
        svg: (anim) => this.getUfoCatSvg(anim)
      },
      {
        id: 'cat_titan', name: 'きょだいねこ', cost: 5, cooldown: 10.0, cdTimer: 0,
        hp: 28, atk: 6.5, spd: 25, range: 40, atkInterval: 2.2,
        desc: 'キングな おうさま！ ドスンと だいしょうげき！',
        svg: (anim) => this.getTitanCatSvg(anim)
      }
    ];

    // 敵キャラカタログ
    this.enemyRoster = {
      dog: {
        id: 'enemy_dog', name: 'ちびわんこ', hp: 4, atk: 1.0, spd: 45, range: 25, atkInterval: 1.2,
        svg: (anim) => this.getDogSvg(anim)
      },
      frog: {
        id: 'enemy_frog', name: 'カエルさん', hp: 5, atk: 1.8, spd: 55, range: 80, atkInterval: 1.6,
        svg: (anim) => this.getFrogSvg(anim)
      },
      pig: {
        id: 'enemy_pig', name: 'ばくそうブタ', hp: 9, atk: 2.2, spd: 90, range: 25, atkInterval: 0.9,
        svg: (anim) => this.getPigSvg(anim)
      },
      gorilla: {
        id: 'enemy_gorilla', name: 'ゴリラボス', hp: 22, atk: 4.0, spd: 40, range: 35, atkInterval: 1.5,
        svg: (anim) => this.getGorillaEnemySvg(anim)
      },
      mechaboss: {
        id: 'enemy_mechaboss', name: 'ロボキング', hp: 45, atk: 5.5, spd: 20, range: 60, atkInterval: 2.0,
        svg: (anim) => this.getMechaBossSvg(anim)
      }
    };

    // ステージ構成（敵の湧きスケジュール）
    this.stageConfigs = [
      {
        id: 1, name: 'みどりの はらっぱ', bg: 'stage-bg-grass',
        castleHp: 10,
        spawns: [
          { time: 2, type: 'dog' }, { time: 7, type: 'dog' },
          { time: 13, type: 'dog' }, { time: 18, type: 'frog' },
          { time: 25, type: 'dog' }, { time: 32, type: 'frog' }
        ]
      },
      {
        id: 2, name: 'おかしの くに', bg: 'stage-bg-candy',
        castleHp: 16,
        spawns: [
          { time: 2, type: 'dog' }, { time: 6, type: 'frog' },
          { time: 12, type: 'pig' }, { time: 18, type: 'dog' },
          { time: 24, type: 'pig' }, { time: 30, type: 'frog' }
        ]
      },
      {
        id: 3, name: 'うみの そこ', bg: 'stage-bg-ocean',
        castleHp: 24,
        spawns: [
          { time: 2, type: 'frog' }, { time: 7, type: 'pig' },
          { time: 14, type: 'gorilla' }, { time: 22, type: 'dog' },
          { time: 28, type: 'pig' }, { time: 35, type: 'gorilla' }
        ]
      },
      {
        id: 4, name: 'ゆうやけの まち', bg: 'stage-bg-sunset',
        castleHp: 32,
        spawns: [
          { time: 2, type: 'pig' }, { time: 6, type: 'pig' },
          { time: 12, type: 'gorilla' }, { time: 19, type: 'frog' },
          { time: 26, type: 'gorilla' }, { time: 34, type: 'pig' }
        ]
      },
      {
        id: 5, name: 'うちゅう ステーション', bg: 'stage-bg-space',
        castleHp: 50,
        spawns: [
          { time: 2, type: 'dog' }, { time: 6, type: 'pig' },
          { time: 12, type: 'gorilla' }, { time: 18, type: 'mechaboss' },
          { time: 26, type: 'frog' }, { time: 34, type: 'gorilla' }
        ]
      }
    ];

    this.initDOM();
  }

  loadSaveData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Load save error:', e);
    }
    return {
      clearedStages: 0,
      totalStars: 0,
      catLevels: {
        cat_basic: 1, cat_tank: 1, cat_battle: 1,
        cat_giraffe: 1, cat_ufo: 1, cat_titan: 1
      },
      cannonLevel: 1,
      castleLevel: 1
    };
  }

  saveGameData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.saveData));
    } catch (e) {
      console.warn('Save game error:', e);
    }
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-nyanko-defense');
  }

  start() {
    this.containerEl = document.getElementById('view-game-nyanko-defense');
    this.showStageSelect();
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // ==========================================
  // 1. ステージ選択 ＆ パワーアップ画面
  // ==========================================

  showStageSelect() {
    this.stop();
    this.gameState = 'stage_select';
    if (!this.containerEl) return;

    const cleared = this.saveData.clearedStages || 0;
    const stars = this.saveData.totalStars || 0;

    let stageCardsHtml = '';
    this.stageConfigs.forEach((stg, idx) => {
      const isUnlocked = idx <= cleared;
      const isCleared = idx < cleared;
      stageCardsHtml += `
        <div class="nyanko-stage-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCleared ? 'cleared' : ''}" 
             data-stage="${stg.id}" ${isUnlocked ? `onclick="window.gameNyankoDefenseInstance.startBattle(${stg.id})"` : ''}>
          <div class="stg-badge">${isCleared ? '⭐ CLEAR!' : `STAGE ${stg.id}`}</div>
          <div class="stg-icon">${this.getStageEmoji(stg.id)}</div>
          <h3 class="stg-title">${stg.name}</h3>
          ${!isUnlocked ? '<div class="stg-lock-mask">🔒</div>' : ''}
        </div>
      `;
    });

    this.containerEl.innerHTML = `
      <div class="nyanko-root nyanko-map-view">
        
        <!-- 上部ヘッダー -->
        <header class="nyanko-header-bar">
          <div class="nyanko-title-pill">
            <span class="nyanko-main-cat-icon">🐱</span>
            <span class="nyanko-title-text">とびだせ！にゃんこ大行進</span>
          </div>

          <div class="nyanko-star-box" onclick="window.gameNyankoDefenseInstance.showUpgradeShop()">
            <span class="star-icon">⭐</span>
            <span class="star-count">${stars}</span>
            <button class="upgrade-btn-pill">⚡ パワーアップ！</button>
          </div>
        </header>

        <!-- メインステージ選択カルーセル -->
        <main class="nyanko-stage-select-stage">
          <h2 class="select-prompt-banner">🌟 ぼうけんする ステージを えらんでね！</h2>
          <div class="nyanko-stages-scroll-row">
            ${stageCardsHtml}
          </div>
        </main>

        <!-- 下部デコレーションにゃんこ行進 -->
        <footer class="nyanko-march-footer">
          <div class="march-strip-cat cat-hop">🐱</div>
          <div class="march-strip-cat cat-hop-2">🛡️</div>
          <div class="march-strip-cat cat-hop-3">⚔️</div>
          <div class="march-strip-cat cat-hop-1">🦒</div>
          <div class="march-strip-cat cat-hop-2">🛸</div>
          <div class="march-strip-cat cat-hop-3">👑</div>
        </footer>

      </div>
    `;

    window.gameNyankoDefenseInstance = this;
  }

  getStageEmoji(stageId) {
    switch(stageId) {
      case 1: return '🌿 🏰 🐾';
      case 2: return '🍭 🧁 🍬';
      case 3: return '🐠 🌊 🐚';
      case 4: return '🌆 🌇 🚗';
      case 5: return '🚀 🌌 🪐';
      default: return '🐾';
    }
  }

  // ==========================================
  // 2. パワーアップショップ
  // ==========================================

  showUpgradeShop() {
    this.gameState = 'upgrade';
    const stars = this.saveData.totalStars || 0;

    let itemsHtml = '';
    this.catRoster.forEach(cat => {
      const lv = this.saveData.catLevels[cat.id] || 1;
      const upgradeCost = lv * 2;
      const canAfford = stars >= upgradeCost;

      itemsHtml += `
        <div class="upgrade-item-card">
          <div class="upgrade-cat-thumb">
            ${cat.svg('idle')}
          </div>
          <div class="upgrade-info-col">
            <div class="upgrade-cat-title">${cat.name} <span class="cat-lv-badge">Lv.${lv}</span></div>
            <div class="upgrade-cat-desc">${cat.desc}</div>
            <div class="upgrade-stats-preview">たいりょく・こうげき ＋${(lv - 1) * 20}%</div>
          </div>
          <button class="upgrade-action-btn ${canAfford ? 'active' : 'disabled'}"
                  onclick="window.gameNyankoDefenseInstance.buyCatUpgrade('${cat.id}', ${upgradeCost})">
            ⭐ ${upgradeCost}
          </button>
        </div>
      `;
    });

    // にゃんこキャノンパワーアップ
    const cannonLv = this.saveData.cannonLevel || 1;
    const cannonCost = cannonLv * 3;
    const canAffordCannon = stars >= cannonCost;
    itemsHtml += `
      <div class="upgrade-item-card cannon-upgrade-card">
        <div class="upgrade-cat-thumb">⚡ 🌈</div>
        <div class="upgrade-info-col">
          <div class="upgrade-cat-title">にゃんこビーム <span class="cat-lv-badge">Lv.${cannonLv}</span></div>
          <div class="upgrade-cat-desc">いっぱつぎゃくてん！ ビームが パワーアップ！</div>
        </div>
        <button class="upgrade-action-btn ${canAffordCannon ? 'active' : 'disabled'}"
                onclick="window.gameNyankoDefenseInstance.buyCannonUpgrade(${cannonCost})">
          ⭐ ${cannonCost}
        </button>
      </div>
    `;

    const modalHtml = `
      <div class="nyanko-upgrade-modal-overlay">
        <div class="nyanko-upgrade-modal-card pop-in">
          <header class="upgrade-modal-header">
            <span class="upgrade-modal-title">⚡ にゃんこ パワーアップ！</span>
            <div class="modal-star-pill">⭐ ${stars}</div>
            <button class="modal-close-x" onclick="window.gameNyankoDefenseInstance.showStageSelect()">✖</button>
          </header>
          <div class="upgrade-cards-list">
            ${itemsHtml}
          </div>
          <button class="primary-btn full-width" onclick="window.gameNyankoDefenseInstance.showStageSelect()">
            ⬅️ もどる
          </button>
        </div>
      </div>
    `;

    const existingModal = document.querySelector('.nyanko-upgrade-modal-overlay');
    if (existingModal) existingModal.remove();

    this.containerEl.insertAdjacentHTML('beforeend', modalHtml);
  }

  buyCatUpgrade(catId, cost) {
    if ((this.saveData.totalStars || 0) < cost) {
      window.soundSystem.playPop();
      return;
    }
    this.saveData.totalStars -= cost;
    this.saveData.catLevels[catId] = (this.saveData.catLevels[catId] || 1) + 1;
    this.saveGameData();

    window.soundSystem.playFanfare();
    window.soundSystem.playJewelTone(3);
    this.showUpgradeShop();
  }

  buyCannonUpgrade(cost) {
    if ((this.saveData.totalStars || 0) < cost) {
      window.soundSystem.playPop();
      return;
    }
    this.saveData.totalStars -= cost;
    this.saveData.cannonLevel = (this.saveData.cannonLevel || 1) + 1;
    this.saveGameData();

    window.soundSystem.playFanfare();
    window.soundSystem.playJewelTone(4);
    this.showUpgradeShop();
  }

  // ==========================================
  // 3. バトルメイン画面 ＆ ゲームループ
  // ==========================================

  startBattle(stageId) {
    this.gameState = 'battle';
    this.currentStage = stageId;
    const stageCfg = this.stageConfigs.find(s => s.id === stageId) || this.stageConfigs[0];

    // パラメータリセット
    this.fishEnergy = 1.0;
    this.maxFish = 5;
    this.cannonCharge = 20; // 開始時に少しチャージ
    this.laserActive = false;
    this.laserTimer = 0;
    this.battleTime = 0;

    const castleLv = this.saveData.castleLevel || 1;
    this.playerCastle = {
      x: 80,
      hp: 6 + (castleLv - 1) * 2,
      maxHp: 6 + (castleLv - 1) * 2,
      state: 'idle'
    };

    this.enemyCastle = {
      x: 920,
      hp: stageCfg.castleHp,
      maxHp: stageCfg.castleHp,
      state: 'idle'
    };

    this.playerUnits = [];
    this.enemyUnits = [];
    this.particles = [];
    this.popTexts = [];

    // クールダウンリセット
    this.catRoster.forEach(c => c.cdTimer = 0);

    // 敵湧き予定リストの複製
    this.spawnQueue = stageCfg.spawns.map(s => ({ ...s, spawned: false }));

    this.renderBattleStage(stageCfg);
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);

    // BGM & 出撃ボイス
    window.soundSystem.playSparkle();
    this.speak('しゅつげき！ がんばるにゃ！');
  }

  renderBattleStage(stageCfg) {
    if (!this.containerEl) return;

    let catDeckHtml = '';
    this.catRoster.forEach(cat => {
      const lv = this.saveData.catLevels[cat.id] || 1;
      catDeckHtml += `
        <button class="nyanko-deck-card" id="deck-card-${cat.id}" data-cat-id="${cat.id}"
                onclick="window.gameNyankoDefenseInstance.spawnPlayerCat('${cat.id}')">
          <div class="deck-cat-cost-badge">🐟 ${cat.cost}</div>
          <div class="deck-cat-icon">${cat.svg('idle')}</div>
          <div class="deck-cat-name">${cat.name}</div>
          <div class="deck-cat-cooldown-mask" id="cd-mask-${cat.id}"></div>
        </button>
      `;
    });

    this.containerEl.innerHTML = `
      <div class="nyanko-root nyanko-battle-view ${stageCfg.bg}">
        
        <!-- バトル上部HUD -->
        <header class="nyanko-battle-hud">
          <button class="nyanko-hud-back-btn" onclick="window.gameNyankoDefenseInstance.showStageSelect()">
            🏠
          </button>

          <!-- 🐟 おさかなエネルギーバー -->
          <div class="nyanko-fish-gauge-box">
            <span class="fish-main-icon">🐟</span>
            <div class="fish-slots-row" id="fish-slots-row">
              <!-- 5個のおさかな缶詰アイコンが動的に充填 -->
            </div>
            <span class="fish-num-counter" id="fish-counter-text">0 / 5</span>
          </div>

          <!-- ⚡ にゃんこビームボタン -->
          <button class="nyanko-cannon-btn" id="nyanko-cannon-btn" onclick="window.gameNyankoDefenseInstance.fireCannon()">
            <div class="cannon-btn-content">
              <span class="cannon-icon">⚡</span>
              <span class="cannon-text">ビーム！</span>
            </div>
            <div class="cannon-charge-radial" id="cannon-charge-radial"></div>
          </button>
        </header>

        <!-- バトルフィールド（横スクロールiPad画面） -->
        <main class="nyanko-battlefield" id="nyanko-battlefield">
          
          <!-- 空の背景雲アニメーション -->
          <div class="battlefield-clouds-layer">
            <div class="floating-cloud cloud-1">☁️</div>
            <div class="floating-cloud cloud-2">☁️</div>
          </div>

          <!-- 味方のお城 -->
          <div class="castle-entity player-castle-entity" id="player-castle-el">
            <div class="castle-hp-bar-wrap">
              <div class="castle-hearts-row" id="player-castle-hearts"></div>
            </div>
            <div class="castle-svg-wrap">
              ${this.getPlayerCastleSvg()}
            </div>
          </div>

          <!-- ユニット描画レイヤー -->
          <div class="battle-units-layer" id="battle-units-layer"></div>

          <!-- 極太にゃんこビームレイヤー -->
          <div class="laser-beam-layer" id="laser-beam-layer">
            <div class="rainbow-laser-stream"></div>
          </div>

          <!-- 敵のお城 -->
          <div class="castle-entity enemy-castle-entity" id="enemy-castle-el">
            <div class="castle-hp-bar-wrap">
              <div class="castle-hearts-row" id="enemy-castle-hearts"></div>
            </div>
            <div class="castle-svg-wrap">
              ${this.getEnemyCastleSvg()}
            </div>
          </div>

          <!-- ポップアップテキスト＆パーティクル -->
          <div class="battle-fx-layer" id="battle-fx-layer"></div>

          <!-- 地面ライン -->
          <div class="battlefield-ground-line"></div>
        </main>

        <!-- 下部出撃デッキ（大きなボタン） -->
        <footer class="nyanko-bottom-deck">
          <div class="deck-cards-grid">
            ${catDeckHtml}
          </div>
        </footer>

        <!-- 勝利＆敗北モーダル -->
        <div class="nyanko-result-modal" id="nyanko-result-modal">
          <div class="nyanko-result-card pop-in" id="nyanko-result-card-inner">
            <!-- 勝利・敗北の内容が動的描画 -->
          </div>
        </div>

      </div>
    `;

    this.updateFishGauge();
    this.updateCastleHpVisuals();
  }

  // ==========================================
  // 4. メインループ＆戦闘シミュレーション
  // ==========================================

  gameLoop(timestamp) {
    if (this.gameState !== 'battle') return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.battleTime += dt;

    this.updateEconomy(dt);
    this.updateSpawns(this.battleTime);
    this.updateUnits(dt);
    this.updateCombat(dt);
    this.updateLaser(dt);
    this.updateEffects(dt);
    this.renderUnits();

    this.animFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateEconomy(dt) {
    // おさかな回復
    this.fishEnergy = Math.min(this.maxFish, this.fishEnergy + this.fishChargeRate * dt);
    this.updateFishGauge();

    // ビームチャージ
    const cannonLv = this.saveData.cannonLevel || 1;
    const chargeSpeed = this.cannonChargeRate * (1 + (cannonLv - 1) * 0.15);
    this.cannonCharge = Math.min(100, this.cannonCharge + chargeSpeed * dt);
    this.updateCannonButton();

    // クールダウン減少
    this.catRoster.forEach(cat => {
      if (cat.cdTimer > 0) {
        cat.cdTimer = Math.max(0, cat.cdTimer - dt);
      }
      const mask = document.getElementById(`cd-mask-${cat.id}`);
      const card = document.getElementById(`deck-card-${cat.id}`);
      if (mask && card) {
        const pct = (cat.cdTimer / cat.cooldown) * 100;
        mask.style.height = `${pct}%`;
        const canAfford = this.fishEnergy >= cat.cost && cat.cdTimer <= 0;
        card.classList.toggle('ready-to-spawn', canAfford);
      }
    });
  }

  updateFishGauge() {
    const slotsRow = document.getElementById('fish-slots-row');
    const counterText = document.getElementById('fish-counter-text');
    if (!slotsRow) return;

    const currentInt = Math.floor(this.fishEnergy);
    const frac = this.fishEnergy - currentInt;

    let slotsHtml = '';
    for (let i = 1; i <= this.maxFish; i++) {
      if (i <= currentInt) {
        slotsHtml += `<div class="fish-can-icon filled">🐟</div>`;
      } else if (i === currentInt + 1) {
        slotsHtml += `<div class="fish-can-icon charging" style="--charge-pct: ${frac * 100}%;">🐟</div>`;
      } else {
        slotsHtml += `<div class="fish-can-icon empty">⚪</div>`;
      }
    }
    slotsRow.innerHTML = slotsHtml;

    if (counterText) {
      counterText.textContent = `${currentInt} / ${this.maxFish}`;
    }
  }

  updateCannonButton() {
    const btn = document.getElementById('nyanko-cannon-btn');
    const radial = document.getElementById('cannon-charge-radial');
    if (!btn || !radial) return;

    radial.style.height = `${this.cannonCharge}%`;
    const isReady = this.cannonCharge >= 100;
    btn.classList.toggle('cannon-ready-glow', isReady);
  }

  updateSpawns(time) {
    this.spawnQueue.forEach(s => {
      if (!s.spawned && time >= s.time) {
        s.spawned = true;
        this.spawnEnemy(s.type);
      }
    });
  }

  spawnPlayerCat(catId) {
    const cat = this.catRoster.find(c => c.id === catId);
    if (!cat) return;

    if (this.fishEnergy < cat.cost || cat.cdTimer > 0) {
      window.soundSystem.playPop();
      return;
    }

    this.fishEnergy -= cat.cost;
    cat.cdTimer = cat.cooldown;

    // パワーアップ倍率
    const lv = this.saveData.catLevels[cat.id] || 1;
    const hpMult = 1 + (lv - 1) * 0.2;
    const atkMult = 1 + (lv - 1) * 0.2;

    const unit = {
      uid: 'p_' + Math.random().toString(36).substr(2, 9),
      team: 'player',
      catId: cat.id,
      name: cat.name,
      x: 140, // お城のドアから出現
      y: 0,
      hp: cat.hp * hpMult,
      maxHp: cat.hp * hpMult,
      atk: cat.atk * atkMult,
      spd: cat.spd,
      range: cat.range,
      atkInterval: cat.atkInterval,
      atkCooldown: 0,
      state: 'walking', // 'walking', 'attacking', 'hit', 'dying'
      animTimer: Math.random(),
      isFlying: cat.isFlying || false,
      svg: cat.svg
    };

    this.playerUnits.push(unit);

    // お城のドアアニメーション＆出撃SE
    window.soundSystem.playPop();
    const pCastle = document.getElementById('player-castle-el');
    if (pCastle) {
      pCastle.classList.add('castle-open-door');
      setTimeout(() => pCastle.classList.remove('castle-open-door'), 350);
    }
  }

  spawnEnemy(enemyKey) {
    const proto = this.enemyRoster[enemyKey];
    if (!proto) return;

    const unit = {
      uid: 'e_' + Math.random().toString(36).substr(2, 9),
      team: 'enemy',
      catId: proto.id,
      name: proto.name,
      x: 860, // 敵城から出現
      y: 0,
      hp: proto.hp,
      maxHp: proto.hp,
      atk: proto.atk,
      spd: proto.spd,
      range: proto.range,
      atkInterval: proto.atkInterval,
      atkCooldown: 0,
      state: 'walking',
      animTimer: Math.random(),
      svg: proto.svg
    };

    this.enemyUnits.push(unit);
  }

  fireCannon() {
    if (this.cannonCharge < 100 || this.laserActive) {
      window.soundSystem.playPop();
      return;
    }

    this.cannonCharge = 0;
    this.laserActive = true;
    this.laserTimer = 1.0;

    window.soundSystem.playFanfare();
    window.soundSystem.playSparkle();

    const beamLayer = document.getElementById('laser-beam-layer');
    if (beamLayer) {
      beamLayer.classList.add('active');
    }

    // 全ての敵にダメージ＆後退ノックバック！
    const cannonLv = this.saveData.cannonLevel || 1;
    const laserDamage = 5.0 + (cannonLv - 1) * 2.5;

    this.enemyUnits.forEach(enemy => {
      enemy.hp -= laserDamage;
      enemy.x = Math.min(840, enemy.x + 160); // 敵陣奥へ吹き飛ばす
      enemy.state = 'hit';
      this.createPopText('💥 ドカン！', enemy.x, 80, '#ff4757');
    });

    this.createPopText('🌈 にゃんこビーム発射！！', 500, 120, '#f1c40f');
    this.app.particles.explode(500, 200, 80);
  }

  updateLaser(dt) {
    if (this.laserActive) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        this.laserActive = false;
        const beamLayer = document.getElementById('laser-beam-layer');
        if (beamLayer) beamLayer.classList.remove('active');
      }
    }
  }

  updateUnits(dt) {
    // 味方ユニットの移動＆アニメーション
    this.playerUnits.forEach(unit => {
      unit.animTimer += dt;
      if (unit.atkCooldown > 0) unit.atkCooldown -= dt;

      if (unit.state === 'walking') {
        // 最も近い敵または敵城までの距離を判定
        const target = this.getClosestEnemy(unit.x);
        const targetDist = target ? (target.x - unit.x) : (this.enemyCastle.x - unit.x);

        if (targetDist <= unit.range) {
          unit.state = 'attacking';
        } else {
          unit.x += unit.spd * dt;
        }
      }
    });

    // 敵ユニットの移動＆アニメーション
    this.enemyUnits.forEach(unit => {
      unit.animTimer += dt;
      if (unit.atkCooldown > 0) unit.atkCooldown -= dt;

      if (unit.state === 'walking') {
        // 最も近い味方または味方城までの距離
        const target = this.getClosestPlayer(unit.x);
        const targetDist = target ? (unit.x - target.x) : (unit.x - this.playerCastle.x);

        if (targetDist <= unit.range) {
          unit.state = 'attacking';
        } else {
          unit.x -= unit.spd * dt;
        }
      }
    });
  }

  updateCombat(dt) {
    // 味方の攻撃
    this.playerUnits.forEach(unit => {
      if (unit.state === 'attacking') {
        if (unit.atkCooldown <= 0) {
          unit.atkCooldown = unit.atkInterval;
          this.executePlayerAttack(unit);
        }
      }
    });

    // 敵の攻撃
    this.enemyUnits.forEach(unit => {
      if (unit.state === 'attacking') {
        if (unit.atkCooldown <= 0) {
          unit.atkCooldown = unit.atkInterval;
          this.executeEnemyAttack(unit);
        }
      }
    });

    // 死亡ユニットの除去
    this.playerUnits = this.playerUnits.filter(u => u.hp > 0);
    this.enemyUnits = this.enemyUnits.filter(u => {
      if (u.hp <= 0) {
        // 撃破演出
        window.soundSystem.playPop();
        this.createPopText('🌟', u.x, 60, '#f1c40f');
        this.fishEnergy = Math.min(this.maxFish, this.fishEnergy + 0.3); // 撃破ボーナスおさかな
        return false;
      }
      return true;
    });

    // 勝敗判定
    if (this.enemyCastle.hp <= 0) {
      this.handleVictory();
    } else if (this.playerCastle.hp <= 0) {
      this.handleDefeat();
    }
  }

  getClosestEnemy(playerX) {
    let closest = null;
    let minDist = 99999;
    this.enemyUnits.forEach(e => {
      if (e.x > playerX && (e.x - playerX) < minDist) {
        minDist = e.x - playerX;
        closest = e;
      }
    });
    return closest;
  }

  getClosestPlayer(enemyX) {
    let closest = null;
    let minDist = 99999;
    this.playerUnits.forEach(p => {
      if (p.x < enemyX && (enemyX - p.x) < minDist) {
        minDist = enemyX - p.x;
        closest = p;
      }
    });
    return closest;
  }

  executePlayerAttack(unit) {
    const target = this.getClosestEnemy(unit.x);
    if (target && (target.x - unit.x) <= unit.range + 15) {
      target.hp -= unit.atk;
      this.createPopText(`💥`, target.x, 50, '#ff4757');
      window.soundSystem.playJewelTone(Math.floor(Math.random() * 3) + 1);
      if (target.hp <= 0) {
        unit.state = 'walking';
      }
    } else if ((this.enemyCastle.x - unit.x) <= unit.range + 25) {
      // 敵のお城を攻撃！
      this.enemyCastle.hp = Math.max(0, this.enemyCastle.hp - unit.atk);
      this.updateCastleHpVisuals();
      this.createPopText(`ドスッ!`, this.enemyCastle.x - 20, 60, '#e84118');
      window.soundSystem.playPop();
    } else {
      unit.state = 'walking';
    }
  }

  executeEnemyAttack(unit) {
    const target = this.getClosestPlayer(unit.x);
    if (target && (unit.x - target.x) <= unit.range + 15) {
      target.hp -= unit.atk;
      this.createPopText(`💥`, target.x, 50, '#3742fa');
      window.soundSystem.playPop();
      if (target.hp <= 0) {
        unit.state = 'walking';
      }
    } else if ((unit.x - this.playerCastle.x) <= unit.range + 25) {
      // 味方のお城を攻撃！
      this.playerCastle.hp = Math.max(0, this.playerCastle.hp - unit.atk);
      this.updateCastleHpVisuals();
      this.createPopText(`わんっ!`, this.playerCastle.x + 20, 60, '#ff4757');
      window.soundSystem.playPop();
    } else {
      unit.state = 'walking';
    }
  }

  updateCastleHpVisuals() {
    const pHearts = document.getElementById('player-castle-hearts');
    const eHearts = document.getElementById('enemy-castle-hearts');

    if (pHearts) {
      const current = Math.ceil(this.playerCastle.hp);
      let h = '';
      for (let i = 0; i < this.playerCastle.maxHp; i++) {
        h += `<span class="heart-icon ${i < current ? 'full' : 'lost'}">❤️</span>`;
      }
      pHearts.innerHTML = h;
    }

    if (eHearts) {
      const current = Math.ceil(this.enemyCastle.hp);
      let h = '';
      for (let i = 0; i < this.enemyCastle.maxHp; i++) {
        h += `<span class="heart-icon ${i < current ? 'full' : 'lost'}">💜</span>`;
      }
      eHearts.innerHTML = h;
    }
  }

  createPopText(text, x, y, color = '#2f3542') {
    this.popTexts.push({
      text, x, y, color,
      life: 0.7, maxLife: 0.7
    });
  }

  updateEffects(dt) {
    const fxLayer = document.getElementById('battle-fx-layer');
    if (!fxLayer) return;

    this.popTexts.forEach(p => {
      p.life -= dt;
      p.y += 35 * dt; // 上にふわっと浮く
    });
    this.popTexts = this.popTexts.filter(p => p.life > 0);

    let html = '';
    this.popTexts.forEach(p => {
      const opacity = p.life / p.maxLife;
      html += `
        <div class="pop-comic-text" style="left: ${p.x / 10}%; bottom: ${p.y}px; color: ${p.color}; opacity: ${opacity};">
          ${p.text}
        </div>
      `;
    });
    fxLayer.innerHTML = html;
  }

  renderUnits() {
    const layer = document.getElementById('battle-units-layer');
    if (!layer) return;

    let html = '';

    // 味方ユニット
    this.playerUnits.forEach(u => {
      const bounce = Math.sin(u.animTimer * (u.spd / 12)) * 6;
      const flyY = u.isFlying ? 60 : 0;
      const isAttacking = u.state === 'attacking' ? 'unit-attack-punch' : '';

      html += `
        <div class="battle-unit-sprite player-unit ${isAttacking}"
             style="left: ${u.x / 10}%; bottom: ${20 + bounce + flyY}px;">
          <div class="unit-svg-box">${u.svg(u.state)}</div>
          <div class="unit-mini-hp-bar">
            <div class="mini-hp-fill" style="width: ${(u.hp / u.maxHp) * 100}%;"></div>
          </div>
        </div>
      `;
    });

    // 敵ユニット
    this.enemyUnits.forEach(u => {
      const bounce = Math.sin(u.animTimer * (u.spd / 12)) * 6;
      const isAttacking = u.state === 'attacking' ? 'unit-attack-punch' : '';

      html += `
        <div class="battle-unit-sprite enemy-unit ${isAttacking}"
             style="left: ${u.x / 10}%; bottom: ${20 + bounce}px;">
          <div class="unit-svg-box">${u.svg(u.state)}</div>
          <div class="unit-mini-hp-bar enemy">
            <div class="mini-hp-fill" style="width: ${(u.hp / u.maxHp) * 100}%;"></div>
          </div>
        </div>
      `;
    });

    layer.innerHTML = html;
  }

  // ==========================================
  // 5. 勝利 ＆ 敗北ハンドラ
  // ==========================================

  handleVictory() {
    this.gameState = 'result';
    this.stop();

    // クリアステージ更新＆スター獲得
    const isNewClear = this.currentStage > (this.saveData.clearedStages || 0);
    if (isNewClear) {
      this.saveData.clearedStages = this.currentStage;
    }
    const rewardStars = isNewClear ? 5 : 2;
    this.saveData.totalStars = (this.saveData.totalStars || 0) + rewardStars;
    this.saveGameData();

    window.soundSystem.playFanfare();
    window.soundSystem.playMagicChime();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    this.speak('やったー！ かんぜんしょうりだにゃ！');

    const modal = document.getElementById('nyanko-result-modal');
    const card = document.getElementById('nyanko-result-card-inner');
    if (modal && card) {
      card.innerHTML = `
        <div class="result-crown-icon">👑 ✨ 🐱 ✨ 👑</div>
        <h2 class="result-title win">ステージクリア！🎉</h2>
        <p class="result-desc">敵のお城を 倒したよ！<br>にゃんこ軍団の だいしょうり！</p>
        <div class="result-stars-reward">⭐ ＋${rewardStars} ゲット！</div>
        <div class="result-action-row">
          <button class="primary-btn" onclick="window.gameNyankoDefenseInstance.showStageSelect()">
            🗺️ ステージを えらぶ
          </button>
          <button class="primary-btn upgrade-glow-btn" onclick="window.gameNyankoDefenseInstance.showUpgradeShop()">
            ⚡ パワーアップ！
          </button>
        </div>
      `;
      modal.classList.add('show');
    }
  }

  handleDefeat() {
    this.gameState = 'result';
    this.stop();

    window.soundSystem.playPop();
    this.speak('ざんねん… もう１かい がんばろう！');

    const modal = document.getElementById('nyanko-result-modal');
    const card = document.getElementById('nyanko-result-card-inner');
    if (modal && card) {
      card.innerHTML = `
        <div class="result-crown-icon">😿 💦</div>
        <h2 class="result-title lose">お城が こわれちゃった…</h2>
        <p class="result-desc">もう１かい チャレンジして<br>リベンジしよう！✨</p>
        <div class="result-action-row">
          <button class="primary-btn" onclick="window.gameNyankoDefenseInstance.startBattle(${this.currentStage})">
            🔄 もう１かい！
          </button>
          <button class="primary-btn secondary-style" onclick="window.gameNyankoDefenseInstance.showStageSelect()">
            🗺️ もどる
          </button>
        </div>
      `;
      modal.classList.add('show');
    }
  }

  speak(text) {
    if (window.soundSystem.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ja-JP';
        utter.rate = 1.05;
        utter.pitch = 1.45;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  // ==========================================
  // 6. 全キャラクター ベクターSVG イラスト集
  // ==========================================

  // 1. 基本ねこ
  getBasicCatSvg(anim) {
    return `
      <svg viewBox="0 0 100 100" class="nyanko-unit-svg">
        <path d="M25 40 Q20 15 40 28" fill="#ffffff" stroke="#2f3542" stroke-width="4" stroke-linejoin="round"/>
        <path d="M75 40 Q80 15 60 28" fill="#ffffff" stroke="#2f3542" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="50" cy="55" r="32" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <circle cx="38" cy="50" r="3.5" fill="#2f3542"/>
        <circle cx="62" cy="50" r="3.5" fill="#2f3542"/>
        <circle cx="28" cy="58" r="4.5" fill="#ff7675" opacity="0.6"/>
        <circle cx="72" cy="58" r="4.5" fill="#ff7675" opacity="0.6"/>
        <path d="M44 58 Q50 64 56 58" fill="none" stroke="#2f3542" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="38" cy="88" rx="7" ry="5" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="62" cy="88" rx="7" ry="5" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
      </svg>
    `;
  }

  // 2. タンクねこ
  getTankCatSvg(anim) {
    return `
      <svg viewBox="0 0 100 130" class="nyanko-unit-svg">
        <path d="M25 35 Q20 15 38 24" fill="#ffffff" stroke="#2f3542" stroke-width="4" stroke-linejoin="round"/>
        <path d="M75 35 Q80 15 62 24" fill="#ffffff" stroke="#2f3542" stroke-width="4" stroke-linejoin="round"/>
        <rect x="22" y="24" width="56" height="90" rx="20" fill="#ffffff" stroke="#2f3542" stroke-width="4.5"/>
        <path d="M35 48 Q40 44 45 48" fill="none" stroke="#2f3542" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M55 48 Q60 44 65 48" fill="none" stroke="#2f3542" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="50" cy="56" r="2.5" fill="#ff7675"/>
        <polygon points="50,70 54,80 64,80 56,86 59,96 50,90 41,96 44,86 36,80 46,80" fill="#f1c40f"/>
        <ellipse cx="34" cy="116" rx="8" ry="6" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
        <ellipse cx="66" cy="116" rx="8" ry="6" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
      </svg>
    `;
  }

  // 3. バトルねこ
  getBattleCatSvg(anim) {
    return `
      <svg viewBox="0 0 110 100" class="nyanko-unit-svg">
        <path d="M25 40 Q20 15 40 28" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <path d="M75 40 Q80 15 60 28" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <circle cx="50" cy="55" r="32" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <!-- 赤いハチマキ -->
        <rect x="18" y="38" width="64" height="10" rx="3" fill="#ff4757" stroke="#2f3542" stroke-width="2.5"/>
        <path d="M80 40 Q95 35 100 48 Q90 45 80 46" fill="#ff4757" stroke="#2f3542" stroke-width="2"/>
        <!-- りりしい目 -->
        <path d="M34 48 L44 54" stroke="#2f3542" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M66 48 L56 54" stroke="#2f3542" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="40" cy="56" r="3" fill="#2f3542"/>
        <circle cx="60" cy="56" r="3" fill="#2f3542"/>
        <path d="M46 64 L54 64" stroke="#2f3542" stroke-width="3" stroke-linecap="round"/>
        <!-- おさかなソード -->
        <g transform="translate(70, 45) rotate(-25)">
          <path d="M0 0 L28 0 M8 -6 L8 6 M16 -6 L16 6 M24 -4 L24 4 M28 0 L36 -6 L36 6 Z" stroke="#3742fa" stroke-width="3" fill="none"/>
        </g>
        <ellipse cx="38" cy="88" rx="7" ry="5" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="62" cy="88" rx="7" ry="5" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
      </svg>
    `;
  }

  // 4. きりんねこ
  getGiraffeCatSvg(anim) {
    return `
      <svg viewBox="0 0 100 150" class="nyanko-unit-svg">
        <!-- 長い首 -->
        <path d="M42 40 L40 120 L60 120 L58 40 Z" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <circle cx="48" cy="65" r="4" fill="#f1c40f"/>
        <circle cx="53" cy="90" r="5" fill="#f1c40f"/>
        <!-- 頭 -->
        <path d="M35 30 Q30 12 44 22" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
        <path d="M65 30 Q70 12 56 22" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="50" cy="32" r="18" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="44" cy="30" r="2.5" fill="#2f3542"/>
        <circle cx="56" cy="30" r="2.5" fill="#2f3542"/>
        <!-- 体と足 -->
        <ellipse cx="50" cy="122" rx="22" ry="14" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <line x1="38" y1="130" x2="32" y2="148" stroke="#2f3542" stroke-width="4" stroke-linecap="round"/>
        <line x1="62" y1="130" x2="68" y2="148" stroke="#2f3542" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `;
  }

  // 5. とりねこUFO
  getUfoCatSvg(anim) {
    return `
      <svg viewBox="0 0 110 100" class="nyanko-unit-svg">
        <!-- プロペラ -->
        <line x1="55" y1="10" x2="55" y2="20" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="55" cy="10" rx="22" ry="3.5" fill="#747d8c"/>
        <!-- キャノピー -->
        <path d="M35 45 C35 22 75 22 75 45 Z" fill="#70a1ff" opacity="0.6" stroke="#2f3542" stroke-width="3"/>
        <!-- ねこパイロット -->
        <circle cx="55" cy="38" r="14" fill="#ffffff" stroke="#2f3542" stroke-width="2.5"/>
        <circle cx="50" cy="36" r="2" fill="#2f3542"/>
        <circle cx="60" cy="36" r="2" fill="#2f3542"/>
        <!-- UFOソーサー -->
        <ellipse cx="55" cy="55" rx="46" ry="16" fill="#ff9ff3" stroke="#2f3542" stroke-width="4"/>
        <ellipse cx="55" cy="58" rx="28" ry="8" fill="#f368e0"/>
        <circle cx="30" cy="56" r="3" fill="#f1c40f"/>
        <circle cx="55" cy="58" r="3" fill="#f1c40f"/>
        <circle cx="80" cy="56" r="3" fill="#f1c40f"/>
      </svg>
    `;
  }

  // 6. きょだいねこ
  getTitanCatSvg(anim) {
    return `
      <svg viewBox="0 0 150 170" class="nyanko-unit-svg titan-cat-svg">
        <!-- 王冠 -->
        <polygon points="60,25 65,10 75,22 85,10 90,25" fill="#f1c40f" stroke="#2f3542" stroke-width="3"/>
        <circle cx="75" cy="14" r="2.5" fill="#e74c3c"/>
        <!-- マント -->
        <path d="M30 65 Q10 130 35 150 L115 150 Q140 130 120 65 Z" fill="#e74c3c" stroke="#2f3542" stroke-width="4"/>
        <!-- 巨大ボディ -->
        <circle cx="75" cy="75" r="48" fill="#ffffff" stroke="#2f3542" stroke-width="5"/>
        <path d="M48 55 Q42 30 60 42" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <path d="M102 55 Q108 30 90 42" fill="#ffffff" stroke="#2f3542" stroke-width="4"/>
        <!-- 顔 -->
        <circle cx="58" cy="70" r="5" fill="#2f3542"/>
        <circle cx="92" cy="70" r="5" fill="#2f3542"/>
        <circle cx="44" cy="80" r="7" fill="#ff7675" opacity="0.6"/>
        <circle cx="106" cy="80" r="7" fill="#ff7675" opacity="0.6"/>
        <path d="M68 82 Q75 90 82 82" fill="none" stroke="#2f3542" stroke-width="4" stroke-linecap="round"/>
        <!-- たくましい足 -->
        <rect x="42" y="115" width="26" height="42" rx="12" fill="#ffffff" stroke="#2f3542" stroke-width="4.5"/>
        <rect x="82" y="115" width="26" height="42" rx="12" fill="#ffffff" stroke="#2f3542" stroke-width="4.5"/>
      </svg>
    `;
  }

  // 敵1: ちびわんこ
  getDogSvg(anim) {
    return `
      <svg viewBox="0 0 100 100" class="nyanko-unit-svg">
        <circle cx="50" cy="55" r="30" fill="#e17055" stroke="#2f3542" stroke-width="4"/>
        <!-- 垂れ耳 -->
        <ellipse cx="25" cy="48" rx="8" ry="18" fill="#d63031" stroke="#2f3542" stroke-width="3.5" transform="rotate(15 25 48)"/>
        <ellipse cx="75" cy="48" rx="8" ry="18" fill="#d63031" stroke="#2f3542" stroke-width="3.5" transform="rotate(-15 75 48)"/>
        <!-- 顔 -->
        <circle cx="40" cy="50" r="3.5" fill="#2f3542"/>
        <circle cx="60" cy="50" r="3.5" fill="#2f3542"/>
        <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#2f3542"/>
        <!-- ホネ -->
        <rect x="36" y="65" width="28" height="6" rx="3" fill="#ffffff" stroke="#2f3542" stroke-width="2"/>
        <circle cx="34" cy="65" r="3" fill="#ffffff"/>
        <circle cx="34" cy="71" r="3" fill="#ffffff"/>
        <circle cx="66" cy="65" r="3" fill="#ffffff"/>
        <circle cx="66" cy="71" r="3" fill="#ffffff"/>
        <ellipse cx="38" cy="85" rx="6" ry="5" fill="#e17055" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="62" cy="85" rx="6" ry="5" fill="#e17055" stroke="#2f3542" stroke-width="3"/>
      </svg>
    `;
  }

  // 敵2: ぴょんぴょんカエル
  getFrogSvg(anim) {
    return `
      <svg viewBox="0 0 100 100" class="nyanko-unit-svg">
        <ellipse cx="50" cy="60" rx="32" ry="24" fill="#00b894" stroke="#2f3542" stroke-width="4"/>
        <!-- 大きな目玉 -->
        <circle cx="35" cy="38" r="14" fill="#00b894" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="65" cy="38" r="14" fill="#00b894" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="35" cy="38" r="7" fill="#ffffff"/>
        <circle cx="65" cy="38" r="7" fill="#ffffff"/>
        <circle cx="35" cy="38" r="4" fill="#2f3542"/>
        <circle cx="65" cy="38" r="4" fill="#2f3542"/>
        <!-- ピンクほっぺ -->
        <circle cx="28" cy="62" r="5" fill="#ff7675" opacity="0.6"/>
        <circle cx="72" cy="62" r="5" fill="#ff7675" opacity="0.6"/>
        <!-- にっこり口 -->
        <path d="M38 65 Q50 75 62 65" fill="none" stroke="#2f3542" stroke-width="3.5" stroke-linecap="round"/>
        <!-- ジャンプ足 -->
        <ellipse cx="24" cy="78" rx="10" ry="6" fill="#00b894" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="76" cy="78" rx="10" ry="6" fill="#00b894" stroke="#2f3542" stroke-width="3"/>
      </svg>
    `;
  }

  // 敵3: ばくそうブタ
  getPigSvg(anim) {
    return `
      <svg viewBox="0 0 100 100" class="nyanko-unit-svg">
        <!-- 豚の耳 -->
        <polygon points="25,40 18,20 38,28" fill="#fd79a8" stroke="#2f3542" stroke-width="3.5"/>
        <polygon points="75,40 82,20 62,28" fill="#fd79a8" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="50" cy="55" r="32" fill="#fd79a8" stroke="#2f3542" stroke-width="4"/>
        <!-- 怒り眉毛と目 -->
        <path d="M32 46 L42 50" stroke="#2f3542" stroke-width="3" stroke-linecap="round"/>
        <path d="M68 46 L58 50" stroke="#2f3542" stroke-width="3" stroke-linecap="round"/>
        <circle cx="36" cy="52" r="3.5" fill="#2f3542"/>
        <circle cx="64" cy="52" r="3.5" fill="#2f3542"/>
        <!-- 豚鼻 -->
        <ellipse cx="50" cy="64" rx="14" ry="10" fill="#e84393" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="45" cy="64" rx="2.5" ry="4" fill="#2f3542"/>
        <ellipse cx="55" cy="64" rx="2.5" ry="4" fill="#2f3542"/>
        <!-- スニーカー足 -->
        <ellipse cx="36" cy="88" rx="9" ry="6" fill="#0984e3" stroke="#2f3542" stroke-width="3"/>
        <ellipse cx="64" cy="88" rx="9" ry="6" fill="#0984e3" stroke="#2f3542" stroke-width="3"/>
      </svg>
    `;
  }

  // 敵4: のっしのしゴリラ
  getGorillaEnemySvg(anim) {
    return `
      <svg viewBox="0 0 120 120" class="nyanko-unit-svg">
        <ellipse cx="60" cy="70" rx="42" ry="36" fill="#2d3436" stroke="#2f3542" stroke-width="4.5"/>
        <circle cx="30" cy="40" r="10" fill="#2d3436" stroke="#2f3542" stroke-width="3"/>
        <circle cx="90" cy="40" r="10" fill="#2d3436" stroke="#2f3542" stroke-width="3"/>
        <circle cx="60" cy="48" r="26" fill="#636e72" stroke="#2f3542" stroke-width="3.5"/>
        <circle cx="50" cy="44" r="4" fill="#ff7675"/>
        <circle cx="70" cy="44" r="4" fill="#ff7675"/>
        <ellipse cx="60" cy="55" rx="8" ry="5" fill="#2d3436"/>
        <!-- ムキムキ腕 -->
        <circle cx="22" cy="75" r="16" fill="#2d3436" stroke="#2f3542" stroke-width="4"/>
        <circle cx="98" cy="75" r="16" fill="#2d3436" stroke="#2f3542" stroke-width="4"/>
        <!-- バナナ -->
        <path d="M15 80 Q25 95 10 100" stroke="#f1c40f" stroke-width="6" fill="none" stroke-linecap="round"/>
      </svg>
    `;
  }

  // 敵5: メカキングボス
  getMechaBossSvg(anim) {
    return `
      <svg viewBox="0 0 140 140" class="nyanko-unit-svg mecha-boss-svg">
        <!-- アンテナ -->
        <line x1="70" y1="10" x2="70" y2="28" stroke="#2f3542" stroke-width="4"/>
        <circle cx="70" cy="10" r="6" fill="#ff4757" stroke="#2f3542" stroke-width="2"/>
        <!-- ロボヘッド -->
        <rect x="35" y="28" width="70" height="55" rx="12" fill="#747d8c" stroke="#2f3542" stroke-width="4.5"/>
        <!-- 発光アイ -->
        <rect x="46" y="42" width="18" height="12" rx="3" fill="#ff4757"/>
        <rect x="76" y="42" width="18" height="12" rx="3" fill="#ff4757"/>
        <!-- 歯車プレート -->
        <circle cx="70" cy="65" r="5" fill="#f1c40f"/>
        <!-- メカボディ -->
        <rect x="25" y="80" width="90" height="45" rx="14" fill="#57606f" stroke="#2f3542" stroke-width="5"/>
        <!-- キャタピラ足 -->
        <rect x="20" y="115" width="100" height="20" rx="10" fill="#2f3542"/>
        <circle cx="35" cy="125" r="6" fill="#dcdde1"/>
        <circle cx="58" cy="125" r="6" fill="#dcdde1"/>
        <circle cx="82" cy="125" r="6" fill="#dcdde1"/>
        <circle cx="105" cy="125" r="6" fill="#dcdde1"/>
      </svg>
    `;
  }

  // 味方城
  getPlayerCastleSvg() {
    return `
      <svg viewBox="0 0 160 200" class="nyanko-castle-svg">
        <rect x="20" y="70" width="120" height="120" rx="18" fill="#ffffff" stroke="#2f3542" stroke-width="5"/>
        <!-- 猫耳 -->
        <path d="M25 75 Q20 20 60 55" fill="#ffffff" stroke="#2f3542" stroke-width="5"/>
        <path d="M135 75 Q140 20 100 55" fill="#ffffff" stroke="#2f3542" stroke-width="5"/>
        <!-- 猫ひげ＆鈴 -->
        <circle cx="80" cy="95" r="16" fill="#ff4757" stroke="#2f3542" stroke-width="3"/>
        <circle cx="80" cy="95" r="6" fill="#f1c40f"/>
        <!-- お城のドア（猫の口） -->
        <path class="castle-door-leaf" d="M50 190 C50 140 110 140 110 190 Z" fill="#2f3542"/>
        <!-- てっぺんフラッグ -->
        <line x1="80" y1="50" x2="80" y2="15" stroke="#2f3542" stroke-width="4"/>
        <polygon points="80,15 115,25 80,35" fill="#2ed573" stroke="#2f3542" stroke-width="2"/>
      </svg>
    `;
  }

  // 敵城
  getEnemyCastleSvg() {
    return `
      <svg viewBox="0 0 160 200" class="nyanko-castle-svg">
        <rect x="20" y="70" width="120" height="120" rx="18" fill="#2f3542" stroke="#ff4757" stroke-width="5"/>
        <!-- トゲ耳 -->
        <polygon points="25,75 10,25 55,60" fill="#2f3542" stroke="#ff4757" stroke-width="4"/>
        <polygon points="135,75 150,25 105,60" fill="#2f3542" stroke="#ff4757" stroke-width="4"/>
        <!-- サーチライト目 -->
        <circle cx="55" cy="100" r="12" fill="#ff4757"/>
        <circle cx="105" cy="100" r="12" fill="#ff4757"/>
        <circle cx="55" cy="100" r="5" fill="#ffffff"/>
        <circle cx="105" cy="100" r="5" fill="#ffffff"/>
        <!-- ゲート -->
        <path d="M50 190 L50 150 L110 150 L110 190 Z" fill="#1e272e" stroke="#ff4757" stroke-width="3"/>
        <line x1="65" y1="150" x2="65" y2="190" stroke="#ff4757" stroke-width="2"/>
        <line x1="80" y1="150" x2="80" y2="190" stroke="#ff4757" stroke-width="2"/>
        <line x1="95" y1="150" x2="95" y2="190" stroke="#ff4757" stroke-width="2"/>
      </svg>
    `;
  }
}

window.GameNyankoDefense = GameNyankoDefense;
