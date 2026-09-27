/**
 * game_nyanko_defense.js - とびだせ！にゃんこ大行進 (Kids Cat Line Defense)
 * 
 * 5・6歳向けに特化したiPad横画面フィットの最高峰タワーディフェンスゲーム。
 * 高精細スプライトアニメーション、iPad横画面完全フィット、直感的な出撃、
 * 必殺にゃんこビーム、倍速ボタン、LocalStorageセーブ機能を完備。
 */

class GameNyankoDefense {
  constructor(app) {
    this.app = app;
    this.containerEl = null;

    // ゲーム進行・セーブデータ
    this.storageKey = 'nyanko_defense_save_v2';
    this.saveData = this.loadSaveData();

    // バトルステート
    this.currentStage = 1;
    this.maxStage = 5;
    this.gameState = 'menu'; // 'stage_select', 'battle', 'result', 'upgrade'
    this.animFrameId = null;
    this.lastTime = 0;
    this.gameSpeed = 1.0; // 1.0x or 2.0x (倍速)

    // バトルパラメータ
    this.fishEnergy = 0;
    this.maxFish = 5;
    this.fishChargeRate = 0.75; // 1秒あたりのおさかな回復量
    this.cannonCharge = 0; // 0〜100
    this.cannonChargeRate = 4.0; // 1秒あたりのチャージ量

    this.playerCastle = { x: 90, hp: 10, maxHp: 10, state: 'idle' };
    this.enemyCastle = { x: 910, hp: 15, maxHp: 15, state: 'idle' };

    this.playerUnits = [];
    this.enemyUnits = [];
    this.particles = [];
    this.popTexts = [];
    this.laserActive = false;
    this.laserTimer = 0;

    // 味方にゃんこカタログ（高精細PNGスプライト対応・2倍サイズ）
    this.catRoster = [
      {
        id: 'cat_basic', name: 'Cat', cost: 1, cooldown: 1.5, cdTimer: 0,
        hp: 6, atk: 1.5, spd: 55, range: 45, atkInterval: 1.0,
        desc: 'しろねこ！ てくてく走る基本のなかま！',
        icon: 'assets/nyanko/sprites/cat_basic_1.png',
        sprites: ['assets/nyanko/sprites/cat_basic_1.png', 'assets/nyanko/sprites/cat_basic_2.png'],
        width: 120, height: 120
      },
      {
        id: 'cat_hero', name: 'Hero', cost: 2, cooldown: 3.5, cdTimer: 0,
        hp: 12, atk: 3.2, spd: 65, range: 55, atkInterval: 1.1,
        desc: 'ゆうしゃねこ！ かぶと・マント・ぎんのけん！',
        icon: 'assets/nyanko/sprites/cat_hero_1.png',
        sprites: ['assets/nyanko/sprites/cat_hero_1.png', 'assets/nyanko/sprites/cat_hero_2.png'],
        width: 140, height: 160
      },
      {
        id: 'cat_tank', name: 'Tank', cost: 3, cooldown: 4.5, cdTimer: 0,
        hp: 25, atk: 1.2, spd: 38, range: 45, atkInterval: 1.5,
        desc: 'よろいタンク！ キャタピラでみんなをガード！',
        icon: 'assets/nyanko/sprites/cat_tank_1.png',
        sprites: ['assets/nyanko/sprites/cat_tank_1.png', 'assets/nyanko/sprites/cat_tank_2.png'],
        width: 150, height: 150
      },
      {
        id: 'cat_giraffe', name: 'Giraffe', cost: 3, cooldown: 4.0, cdTimer: 0,
        hp: 10, atk: 2.2, spd: 110, range: 50, atkInterval: 0.6,
        desc: 'キリン！ もうスピードでつっこむよ！',
        icon: 'assets/nyanko/sprites/cat_giraffe_1.png',
        sprites: ['assets/nyanko/sprites/cat_giraffe_1.png', 'assets/nyanko/sprites/cat_giraffe_2.png'],
        width: 150, height: 200
      }
    ];

    // 敵キャラカタログ（高精細PNGスプライト対応・2倍サイズ）
    this.enemyRoster = {
      puppy: {
        id: 'enemy_puppy', name: 'こいぬ', hp: 6, atk: 1.4, spd: 48, range: 45, atkInterval: 1.2,
        sprites: ['assets/nyanko/sprites/enemy_puppy_1.png', 'assets/nyanko/sprites/enemy_puppy_2.png'],
        width: 120, height: 120
      },
      frog: {
        id: 'enemy_frog', name: 'カエル', hp: 8, atk: 2.2, spd: 60, range: 90, atkInterval: 1.5,
        sprites: ['assets/nyanko/sprites/enemy_frog_1.png', 'assets/nyanko/sprites/enemy_frog_2.png'],
        width: 120, height: 140
      },
      pig: {
        id: 'enemy_pig', name: 'ブタ', hp: 14, atk: 2.8, spd: 85, range: 45, atkInterval: 1.0,
        sprites: ['assets/nyanko/sprites/enemy_pig_1.png', 'assets/nyanko/sprites/enemy_pig_2.png'],
        width: 130, height: 120
      },
      gorilla: {
        id: 'enemy_gorilla', name: 'ゴリラ', hp: 32, atk: 4.5, spd: 42, range: 55, atkInterval: 1.4,
        sprites: ['assets/nyanko/sprites/enemy_gorilla_1.png', 'assets/nyanko/sprites/enemy_gorilla_2.png'],
        width: 160, height: 190
      }
    };

    // ステージ構成
    this.stageConfigs = [
      {
        id: 1, name: 'みどりの はらっぱ',
        castleHp: 15,
        spawns: [
          { time: 2, type: 'puppy' }, { time: 6, type: 'puppy' },
          { time: 12, type: 'puppy' }, { time: 17, type: 'frog' },
          { time: 24, type: 'puppy' }, { time: 30, type: 'frog' }
        ]
      },
      {
        id: 2, name: 'おかしの くに',
        castleHp: 22,
        spawns: [
          { time: 2, type: 'puppy' }, { time: 6, type: 'frog' },
          { time: 12, type: 'pig' }, { time: 18, type: 'puppy' },
          { time: 24, type: 'pig' }, { time: 30, type: 'frog' }
        ]
      },
      {
        id: 3, name: 'うみの そこ',
        castleHp: 32,
        spawns: [
          { time: 2, type: 'frog' }, { time: 7, type: 'pig' },
          { time: 14, type: 'gorilla' }, { time: 22, type: 'puppy' },
          { time: 28, type: 'pig' }, { time: 36, type: 'gorilla' }
        ]
      },
      {
        id: 4, name: 'ゆうやけの まち',
        castleHp: 45,
        spawns: [
          { time: 2, type: 'pig' }, { time: 6, type: 'pig' },
          { time: 12, type: 'gorilla' }, { time: 18, type: 'frog' },
          { time: 25, type: 'gorilla' }, { time: 33, type: 'pig' }
        ]
      },
      {
        id: 5, name: 'ロボット ようさい',
        castleHp: 60,
        spawns: [
          { time: 2, type: 'puppy' }, { time: 6, type: 'pig' },
          { time: 12, type: 'gorilla' }, { time: 18, type: 'gorilla' },
          { time: 26, type: 'frog' }, { time: 34, type: 'gorilla' }
        ]
      }
    ];

    this.initDOM();
  }

  loadSaveData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Load save error:', e);
    }
    return {
      clearedStages: 0,
      totalCoins: 250,
      totalGold: 320,
      catLevels: {
        cat_basic: 1, cat_hero: 1, cat_tank: 1, cat_giraffe: 1
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
    this.startBattle(1);
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // ==========================================
  // 1. バトルメイン画面レンダリング
  // ==========================================

  startBattle(stageId = 1) {
    this.gameState = 'battle';
    this.currentStage = stageId;
    const stageCfg = this.stageConfigs.find(s => s.id === stageId) || this.stageConfigs[0];

    // パラメータ初期化
    this.fishEnergy = 1.0;
    this.maxFish = 5;
    this.cannonCharge = 30; // 開始時に少しチャージ
    this.laserActive = false;
    this.laserTimer = 0;
    this.battleTime = 0;
    this.gameSpeed = 1.0;

    const castleLv = this.saveData.castleLevel || 1;
    this.playerCastle = {
      x: 100,
      hp: 10 + (castleLv - 1) * 3,
      maxHp: 10 + (castleLv - 1) * 3,
      state: 'idle'
    };

    this.enemyCastle = {
      x: 900,
      hp: stageCfg.castleHp,
      maxHp: stageCfg.castleHp,
      state: 'idle'
    };

    this.playerUnits = [];
    this.enemyUnits = [];
    this.popTexts = [];

    // クールダウンリセット
    this.catRoster.forEach(c => c.cdTimer = 0);

    // 敵湧きキュー
    this.spawnQueue = stageCfg.spawns.map(s => ({ ...s, spawned: false }));

    this.renderBattleStage(stageCfg);
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);

    window.soundSystem.playSparkle();
  }

  renderBattleStage(stageCfg) {
    if (!this.containerEl) return;

    let deckHtml = '';
    this.catRoster.forEach(cat => {
      deckHtml += `
        <button class="nyanko-master-card" id="deck-card-${cat.id}" data-cat-id="${cat.id}"
                onclick="window.gameNyankoDefenseInstance.spawnPlayerCat('${cat.id}')">
          <div class="master-card-cost">🐟 ${cat.cost}</div>
          <div class="master-card-thumb">
            <img src="${cat.icon}" alt="${cat.name}" class="master-thumb-img">
          </div>
          <div class="master-card-label">${cat.name}</div>
          <div class="master-card-cd-overlay" id="cd-mask-${cat.id}"></div>
        </button>
      `;
    });

    const coins = this.saveData.totalCoins || 250;
    const gold = this.saveData.totalGold || 320;

    this.containerEl.innerHTML = `
      <div class="nyanko-master-viewport">
        
        <!-- 全体背景画像（高品質手描き絵本イラスト） -->
        <div class="master-bg-layer" style="background-image: url('assets/nyanko/battle_bg.jpg');"></div>

        <!-- ==========================================
             上部HUD（参考画像と完全一致）
             ========================================== -->
        <header class="master-hud-top">
          <!-- 左：コインカプセル -->
          <div class="master-hud-pill pill-purple">
            <div class="hud-coin-star">⭐</div>
            <span class="hud-value" id="hud-coins-text">${coins}</span>
          </div>

          <!-- 中央：レベルバー ＆ ミニアイコン -->
          <div class="master-hud-pill pill-purple level-center-pill">
            <span class="hud-gold-counter">🪙 550</span>
            <div class="hud-progress-track">
              <div class="hud-progress-fill" id="hud-stage-progress" style="width: 45%;"></div>
            </div>
            <span class="hud-level-text">Level ${this.currentStage}</span>
            <div class="hud-unit-icons-strip">
              <span class="mini-unit-badge">🐱</span>
              <span class="mini-unit-badge">🪖</span>
              <span class="mini-unit-badge">🦒</span>
            </div>
          </div>

          <!-- 右：倍速 ＆ ホーム/設定ボタン -->
          <div class="hud-right-actions">
            <button class="master-action-btn" id="nyanko-speed-btn" onclick="window.gameNyankoDefenseInstance.toggleSpeed()">
              ⏩
            </button>
            <button class="master-action-btn" onclick="window.app.switchView('home')">
              🏠
            </button>
          </div>
        </header>

        <!-- ==========================================
             中央：バトルフィールド（お城 ＆ ユニット）
             ========================================== -->
        <main class="master-battlefield-stage" id="master-battlefield-stage">
          
          <!-- 味方城（白ねこキャッスル） -->
          <div class="master-castle-entity left-player-castle" id="player-castle-entity">
            <div class="castle-hp-capsule">
              <span class="hp-heart">❤️</span>
              <div class="castle-hp-track">
                <div class="castle-hp-fill player" id="player-castle-hp-bar" style="width: 100%;"></div>
              </div>
            </div>
            <div class="castle-artwork-wrap">
              <img src="assets/nyanko/sprites/castle_cat.png" alt="にゃんこキャッスル" class="castle-art-img">
            </div>
          </div>

          <!-- ユニット描画レイヤー -->
          <div class="master-units-container" id="master-units-container"></div>

          <!-- 必殺にゃんこビームレイヤー -->
          <div class="master-laser-layer" id="master-laser-layer">
            <div class="master-rainbow-beam"></div>
          </div>

          <!-- コミック吹き出し＆星エフェクト -->
          <div class="master-fx-layer" id="master-fx-layer"></div>

          <!-- 敵城（メカドッグ要塞） -->
          <div class="master-castle-entity right-enemy-castle" id="enemy-castle-entity">
            <div class="castle-hp-capsule">
              <span class="hp-heart">💜</span>
              <div class="castle-hp-track">
                <div class="castle-hp-fill enemy" id="enemy-castle-hp-bar" style="width: 100%;"></div>
              </div>
            </div>
            <div class="castle-artwork-wrap">
              <img src="assets/nyanko/sprites/castle_dog.png" alt="メカドッグ要塞" class="castle-art-img">
            </div>
          </div>

        </main>

        <!-- ==========================================
             下部：出撃デッキ ＆ リソースバー
             ========================================== -->
        <footer class="master-bottom-bar">
          
          <!-- 左側：ユニット出撃カード群 -->
          <div class="master-deck-row">
            <span class="master-deck-label">Units:</span>
            ${deckHtml}
            ${(this.saveData.clearedStages || 0) >= 3 ? `
              <button class="master-upgrade-btn" onclick="window.gameNyankoDefenseInstance.showUpgradeShop()">
                ⚡ Upgrade
              </button>
            ` : ''}
          </div>

          <!-- 中央：おさかなエネルギーカプセル -->
          <div class="master-fish-capsule">
            <span class="fish-badge-icon">🐟</span>
            <div class="fish-slots-display" id="master-fish-slots"></div>
            <span class="fish-number-label" id="master-fish-count">1 / 5</span>
          </div>

          <!-- 右側：拠点HP ＆ ゴールド -->
          <div class="master-status-group">
            <div class="master-hud-pill pill-cyan">
              <div class="pill-small-title">Base HP</div>
              <div class="pill-main-num" id="base-hp-text">100/100</div>
            </div>

            <div class="master-hud-pill pill-gold">
              <div class="pill-small-title">Money:</div>
              <div class="pill-main-num" id="gold-text">${gold} Gold</div>
            </div>
          </div>

        </footer>

        <!-- 勝利・敗北モーダル -->
        <div class="master-result-modal" id="master-result-modal">
          <div class="master-modal-card pop-in" id="master-modal-card-inner"></div>
        </div>

      </div>
    `;

    window.gameNyankoDefenseInstance = this;
    this.updateFishGauge();
    this.updateCastleHpVisuals();
  }

  // ==========================================
  // 2. メインバトルループ
  // ==========================================

  gameLoop(timestamp) {
    if (this.gameState !== 'battle') return;

    const rawDt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    const dt = rawDt * this.gameSpeed;
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

  toggleSpeed() {
    this.gameSpeed = this.gameSpeed === 1.0 ? 2.0 : 1.0;
    const btn = document.getElementById('nyanko-speed-btn');
    if (btn) {
      btn.textContent = this.gameSpeed === 2.0 ? '⏩ x2' : '⏩';
      btn.classList.toggle('speed-active', this.gameSpeed === 2.0);
    }
    window.soundSystem.playPop();
  }

  updateEconomy(dt) {
    // おさかな自動回復
    this.fishEnergy = Math.min(this.maxFish, this.fishEnergy + this.fishChargeRate * dt);
    this.updateFishGauge();

    // クールダウン管理
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
        card.classList.toggle('card-ready', canAfford);
      }
    });
  }

  updateFishGauge() {
    const slotsEl = document.getElementById('master-fish-slots');
    const countEl = document.getElementById('master-fish-count');
    if (!slotsEl) return;

    const currentInt = Math.floor(this.fishEnergy);
    const frac = this.fishEnergy - currentInt;

    let html = '';
    for (let i = 1; i <= this.maxFish; i++) {
      if (i <= currentInt) {
        html += `<span class="fish-can-bullet filled">🐟</span>`;
      } else if (i === currentInt + 1) {
        html += `<span class="fish-can-bullet charging" style="opacity: ${0.3 + frac * 0.7};">🐟</span>`;
      } else {
        html += `<span class="fish-can-bullet empty">⚪</span>`;
      }
    }
    slotsEl.innerHTML = html;
    if (countEl) countEl.textContent = `${currentInt} / ${this.maxFish}`;
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

    const lv = (this.saveData.catLevels && this.saveData.catLevels[cat.id]) || 1;
    const mult = 1 + (lv - 1) * 0.2;

    const unit = {
      uid: 'p_' + Math.random().toString(36).substr(2, 9),
      team: 'player',
      catId: cat.id,
      name: cat.name,
      x: 160,
      hp: cat.hp * mult,
      maxHp: cat.hp * mult,
      atk: cat.atk * mult,
      spd: cat.spd,
      range: cat.range,
      atkInterval: cat.atkInterval,
      atkCooldown: 0,
      state: 'walking',
      animTimer: 0,
      frameIdx: 0,
      sprites: cat.sprites,
      width: cat.width,
      height: cat.height
    };

    this.playerUnits.push(unit);
    window.soundSystem.playPop();
  }

  spawnEnemy(enemyKey) {
    const proto = this.enemyRoster[enemyKey];
    if (!proto) return;

    const unit = {
      uid: 'e_' + Math.random().toString(36).substr(2, 9),
      team: 'enemy',
      catId: proto.id,
      name: proto.name,
      x: 840,
      hp: proto.hp,
      maxHp: proto.hp,
      atk: proto.atk,
      spd: proto.spd,
      range: proto.range,
      atkInterval: proto.atkInterval,
      atkCooldown: 0,
      state: 'walking',
      animTimer: 0,
      frameIdx: 0,
      sprites: proto.sprites,
      width: proto.width,
      height: proto.height
    };

    this.enemyUnits.push(unit);
  }

  updateUnits(dt) {
    // 味方
    this.playerUnits.forEach(unit => {
      unit.animTimer += dt;
      unit.frameIdx = Math.floor(unit.animTimer * 5) % unit.sprites.length;
      if (unit.atkCooldown > 0) unit.atkCooldown -= dt;

      if (unit.state === 'walking') {
        const target = this.getClosestEnemy(unit.x);
        const targetDist = target ? (target.x - unit.x) : (this.enemyCastle.x - unit.x);

        if (targetDist <= unit.range) {
          unit.state = 'attacking';
        } else {
          unit.x += unit.spd * dt;
        }
      }
    });

    // 敵
    this.enemyUnits.forEach(unit => {
      unit.animTimer += dt;
      unit.frameIdx = Math.floor(unit.animTimer * 5) % unit.sprites.length;
      if (unit.atkCooldown > 0) unit.atkCooldown -= dt;

      if (unit.state === 'walking') {
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
    // 味方攻撃
    this.playerUnits.forEach(unit => {
      if (unit.state === 'attacking' && unit.atkCooldown <= 0) {
        unit.atkCooldown = unit.atkInterval;
        const target = this.getClosestEnemy(unit.x);
        if (target && (target.x - unit.x) <= unit.range + 20) {
          target.hp -= unit.atk;
          this.createComicPop('POP!', target.x, 60, '#f39c12');
          window.soundSystem.playJewelTone(1);
          if (target.hp <= 0) unit.state = 'walking';
        } else if ((this.enemyCastle.x - unit.x) <= unit.range + 30) {
          this.enemyCastle.hp = Math.max(0, this.enemyCastle.hp - unit.atk);
          this.updateCastleHpVisuals();
          this.createComicPop('BOOM!', this.enemyCastle.x - 30, 80, '#e74c3c');
          window.soundSystem.playPop();
        } else {
          unit.state = 'walking';
        }
      }
    });

    // 敵攻撃
    this.enemyUnits.forEach(unit => {
      if (unit.state === 'attacking' && unit.atkCooldown <= 0) {
        unit.atkCooldown = unit.atkInterval;
        const target = this.getClosestPlayer(unit.x);
        if (target && (unit.x - target.x) <= unit.range + 20) {
          target.hp -= unit.atk;
          this.createComicPop('YAY!', target.x, 60, '#2ecc71');
          window.soundSystem.playPop();
          if (target.hp <= 0) unit.state = 'walking';
        } else if ((unit.x - this.playerCastle.x) <= unit.range + 30) {
          this.playerCastle.hp = Math.max(0, this.playerCastle.hp - unit.atk);
          this.updateCastleHpVisuals();
          this.createComicPop('わんっ!', this.playerCastle.x + 30, 80, '#e74c3c');
          window.soundSystem.playPop();
        } else {
          unit.state = 'walking';
        }
      }
    });

    // 死亡ユニット
    this.playerUnits = this.playerUnits.filter(u => u.hp > 0);
    this.enemyUnits = this.enemyUnits.filter(u => {
      if (u.hp <= 0) {
        window.soundSystem.playPop();
        this.createComicPop('⭐', u.x, 70, '#f1c40f');
        this.fishEnergy = Math.min(this.maxFish, this.fishEnergy + 0.4);
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

  updateCastleHpVisuals() {
    const pBar = document.getElementById('player-castle-hp-bar');
    const eBar = document.getElementById('enemy-castle-hp-bar');
    const baseHpText = document.getElementById('base-hp-text');

    if (pBar) {
      const pct = (this.playerCastle.hp / this.playerCastle.maxHp) * 100;
      pBar.style.width = `${pct}%`;
    }
    if (baseHpText) {
      const cur = Math.ceil((this.playerCastle.hp / this.playerCastle.maxHp) * 100);
      baseHpText.textContent = `${cur}/100`;
    }
    if (eBar) {
      const pct = (this.enemyCastle.hp / this.enemyCastle.maxHp) * 100;
      eBar.style.width = `${pct}%`;
    }
  }

  createComicPop(text, x, y, bg = '#f1c40f') {
    this.popTexts.push({
      text, x, y, bg,
      life: 0.65, maxLife: 0.65
    });
  }

  updateEffects(dt) {
    const layer = document.getElementById('master-fx-layer');
    if (!layer) return;

    this.popTexts.forEach(p => {
      p.life -= dt;
      p.y += 40 * dt;
    });
    this.popTexts = this.popTexts.filter(p => p.life > 0);

    let html = '';
    this.popTexts.forEach(p => {
      const opacity = p.life / p.maxLife;
      html += `
        <div class="comic-pop-badge" style="left: ${p.x / 10}%; bottom: ${p.y}px; opacity: ${opacity}; background: ${p.bg};">
          ${p.text}
        </div>
      `;
    });
    layer.innerHTML = html;
  }

  renderUnits() {
    const container = document.getElementById('master-units-container');
    if (!container) return;

    let html = '';

    // 味方ユニット
    this.playerUnits.forEach(u => {
      const spriteSrc = u.sprites[u.frameIdx] || u.sprites[0];
      const isAttacking = u.state === 'attacking' ? 'attack-anim' : '';

      html += `
        <div class="master-unit-sprite player ${isAttacking}"
             style="left: ${u.x / 10}%; bottom: 20px; width: ${u.width}px; height: ${u.height}px;">
          <div class="unit-health-indicator">
            <span class="unit-hp-heart">❤️</span>
            <div class="unit-health-track">
              <div class="unit-health-fill" style="width: ${(u.hp / u.maxHp) * 100}%;"></div>
            </div>
          </div>
          <img src="${spriteSrc}" alt="${u.name}" class="unit-sprite-img">
        </div>
      `;
    });

    // 敵ユニット (右から左へ反転)
    this.enemyUnits.forEach(u => {
      const spriteSrc = u.sprites[u.frameIdx] || u.sprites[0];
      const isAttacking = u.state === 'attacking' ? 'attack-anim' : '';

      html += `
        <div class="master-unit-sprite enemy ${isAttacking}"
             style="left: ${u.x / 10}%; bottom: 20px; width: ${u.width}px; height: ${u.height}px;">
          <div class="unit-health-indicator enemy">
            <span class="unit-hp-heart">❤️</span>
            <div class="unit-health-track">
              <div class="unit-health-fill" style="width: ${(u.hp / u.maxHp) * 100}%;"></div>
            </div>
          </div>
          <img src="${spriteSrc}" alt="${u.name}" class="unit-sprite-img flip-x">
        </div>
      `;
    });

    container.innerHTML = html;
  }

  updateLaser(dt) {
    if (this.laserActive) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        this.laserActive = false;
        const layer = document.getElementById('master-laser-layer');
        if (layer) layer.classList.remove('active');
      }
    }
  }

  // ==========================================
  // 3. 勝利 ＆ 敗北
  // ==========================================

  handleVictory() {
    this.gameState = 'result';
    this.stop();

    const isNew = this.currentStage > (this.saveData.clearedStages || 0);
    if (isNew) this.saveData.clearedStages = this.currentStage;
    this.saveData.totalCoins = (this.saveData.totalCoins || 250) + 50;
    this.saveData.totalGold = (this.saveData.totalGold || 320) + 80;
    this.saveGameData();

    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const isLevel3Clear = this.currentStage === 3;
    let unlockNoticeHtml = '';
    if (isLevel3Clear || (this.saveData.clearedStages >= 3)) {
      unlockNoticeHtml = `
        <div class="result-unlock-box">
          <div class="unlock-sparkle">✨ ⚡ 👑 ⚡ ✨</div>
          <div class="unlock-title">【⚡ Upgrade（パワーアップ）】が 解放されたよ！</div>
          <div class="unlock-desc">集めたコインを使って、にゃんこたちを強化しよう！</div>
          <button class="upgrade-now-btn" onclick="window.gameNyankoDefenseInstance.showUpgradeShop()">
            ⚡ いまスグ パワーアップする！
          </button>
        </div>
      `;
    }

    const modal = document.getElementById('master-result-modal');
    const card = document.getElementById('master-modal-card-inner');
    if (modal && card) {
      card.innerHTML = `
        <div class="result-crown-big">👑 ✨ 🎉 ✨ 👑</div>
        <h2 class="result-headline win">STAGE ${this.currentStage} CLEAR!</h2>
        <p class="result-subtext">敵の要塞を 倒したよ！<br>にゃんこ軍団の だいしょうり！</p>
        <div class="result-reward-pill">🪙 ＋50 コイン / 💰 ＋80 ゴールド</div>
        ${unlockNoticeHtml}
        <div class="result-btn-row">
          <button class="master-modal-btn primary" onclick="window.gameNyankoDefenseInstance.startBattle(${Math.min(5, this.currentStage + 1)})">
            次へ すすむ ➔
          </button>
          <button class="master-modal-btn secondary" onclick="window.app.switchView('home')">
            🏠 ホームへ
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

    const modal = document.getElementById('master-result-modal');
    const card = document.getElementById('master-modal-card-inner');
    if (modal && card) {
      card.innerHTML = `
        <div class="result-crown-big">😿 💦</div>
        <h2 class="result-headline lose">お城が こわれちゃった…</h2>
        <p class="result-subtext">もう１かい チャレンジしよう！</p>
        <div class="result-btn-row">
          <button class="master-modal-btn primary" onclick="window.gameNyankoDefenseInstance.startBattle(${this.currentStage})">
            🔄 もう１かい！
          </button>
          <button class="master-modal-btn secondary" onclick="window.app.switchView('home')">
            🏠 ホームへ
          </button>
        </div>
      `;
      modal.classList.add('show');
    }
  }

  showUpgradeShop() {
    // パワーアップモーダル
    window.soundSystem.playSparkle();
    const modal = document.getElementById('master-result-modal');
    const card = document.getElementById('master-modal-card-inner');
    if (!modal || !card) return;

    let itemsHtml = '';
    this.catRoster.forEach(cat => {
      const lv = (this.saveData.catLevels && this.saveData.catLevels[cat.id]) || 1;
      const cost = lv * 50;
      itemsHtml += `
        <div class="upgrade-row-card">
          <img src="${cat.icon}" alt="${cat.name}" class="upgrade-thumb-mini">
          <div class="upgrade-detail-col">
            <span class="upgrade-name">${cat.name} (Lv.${lv})</span>
            <span class="upgrade-boost">こうげき・たいりょく +20%</span>
          </div>
          <button class="upgrade-buy-pill" onclick="window.gameNyankoDefenseInstance.buyUpgrade('${cat.id}', ${cost})">
            🪙 ${cost}
          </button>
        </div>
      `;
    });

    card.innerHTML = `
      <h2 class="result-headline">⚡ にゃんこ パワーアップ！</h2>
      <div class="upgrade-list-scroll">
        ${itemsHtml}
      </div>
      <button class="master-modal-btn secondary mt-3" onclick="document.getElementById('master-result-modal').classList.remove('show')">
        とじる ✖
      </button>
    `;
    modal.classList.add('show');
  }

  buyUpgrade(catId, cost) {
    if ((this.saveData.totalCoins || 0) < cost) {
      window.soundSystem.playPop();
      return;
    }
    this.saveData.totalCoins -= cost;
    if (!this.saveData.catLevels) this.saveData.catLevels = {};
    this.saveData.catLevels[catId] = (this.saveData.catLevels[catId] || 1) + 1;
    this.saveGameData();

    window.soundSystem.playFanfare();
    this.showUpgradeShop();
  }
}

window.GameNyankoDefense = GameNyankoDefense;
