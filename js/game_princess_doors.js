/**
 * game_princess_doors.js - お城のたからさがしアドベンチャー (Castle Door Treasure Hunt)
 * 自分で着せ替えたプリンセスがお城の廊下を探検！
 * ヒントのドアを選んでタップすると、お姫様が歩いていき、扉が開いて宝箱からステキなお宝が登場！
 */

class GamePrincessDoors {
  constructor(app) {
    this.app = app;
    this.round = 0;
    this.maxRounds = 5;
    this.isInputLocked = false;
    this.collectedTreasures = [];

    // ドアのバリエーション定義 (10種)
    this.doorTypes = [
      { id: 'rose', name: 'ピンクのお花のドア', icon: '🌹', color: '#ff7675', frame: '#fab1a0', decorColor: '#ff4757' },
      { id: 'star', name: '金色のほしのドア', icon: '⭐', color: '#f1c40f', frame: '#ffeaa7', decorColor: '#f39c12' },
      { id: 'ice', name: '氷の結晶のドア', icon: '❄️', color: '#74b9ff', frame: '#dff9fb', decorColor: '#0984e3' },
      { id: 'heart', name: '赤いハートのドア', icon: '💖', color: '#ff6b81', frame: '#ffccd2', decorColor: '#ee5253' },
      { id: 'moon', name: '三日月の夜空ドア', icon: '🌙', color: '#a29bfe', frame: '#dfe4ea', decorColor: '#6c5ce7' },
      { id: 'sun', name: '太陽とひまわりのドア', icon: '☀️', color: '#e67e22', frame: '#ffeaa7', decorColor: '#d35400' },
      { id: 'crown', name: '王冠のロイヤルドア', icon: '👑', color: '#9b59b6', frame: '#f5cd79', decorColor: '#8e44ad' },
      { id: 'jewel', name: 'エメラルド宝石のドア', icon: '💎', color: '#00cec9', frame: '#55efc4', decorColor: '#00b894' },
      { id: 'butterfly', name: 'ちょうちょのドア', icon: '🦋', color: '#fd79a8', frame: '#e0c3fc', decorColor: '#e84393' },
      { id: 'ribbon', name: '大きなリボンのドア', icon: '🎀', color: '#ff9ff3', frame: '#f8a5c2', decorColor: '#f368e0' }
    ];

    // お宝リスト (5種)
    this.treasures = [
      { id: 't1', name: 'にじ色のユニコーン', icon: '🦄', desc: 'ふわふわで夢いっぱい！' },
      { id: 't2', name: '魔法のきらきらコンパクト', icon: '🪞', desc: 'のぞくと笑顔になれるよ！' },
      { id: 't3', name: 'ロイヤル特製パフェ', icon: '🍓', desc: 'いちごとクリームたっぷり！' },
      { id: 't4', name: '伝説のプリンセスティアラ', icon: '👑', desc: 'まばゆい光を放っているよ！' },
      { id: 't5', name: '黄金のマスターキー', icon: '🗝️', desc: 'どんな願いもかなえる鍵！' }
    ];

    this.currentOptions = [];
    this.correctIndex = 0;

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-doors');
  }

  start() {
    this.round = 0;
    this.collectedTreasures = [];
    this.isInputLocked = false;
    this.app.updateStamps(0, this.maxRounds);
    window.soundSystem.startPrincessBgm();
    this.renderStage();
    this.nextRound();
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="doors-game-layout">
        <!-- 上部：お題・おしゃべりバー -->
        <div class="doors-header-bar">
          <div class="doors-speech-bubble" id="doors-speech-bubble">
            <span class="doors-prompt-text" id="doors-prompt-text">読み込み中...</span>
            <button class="doors-voice-replay" id="doors-voice-replay" title="もういちどきく">🔊</button>
          </div>
          <div class="doors-treasure-tray" id="doors-treasure-tray">
            <span class="tray-label">みつけた宝物:</span>
            <div class="tray-slots" id="doors-tray-slots"></div>
          </div>
        </div>

        <!-- 中央：お城の廊下ステージ -->
        <div class="doors-hallway-scene" id="doors-hallway-scene">
          <!-- 背景装飾（シャンデリア、アーチ、柱） -->
          <div class="doors-hallway-bg">
            <div class="hallway-chandelier c-left">✨ 🕯️ ✨</div>
            <div class="hallway-chandelier c-center">👑 🕯️ 👑</div>
            <div class="hallway-chandelier c-right">✨ 🕯️ ✨</div>
            <div class="hallway-carpet"></div>
          </div>

          <!-- 3つの魔法のドア -->
          <div class="doors-row" id="doors-container"></div>

          <!-- 歩くプリンセスアバター -->
          <div class="doors-princess-track">
            <div class="doors-princess-avatar" id="doors-princess-avatar">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
          </div>
        </div>

        <!-- 宝箱オープン・報酬ポップアップ -->
        <div class="doors-reward-popup" id="doors-reward-popup">
          <div class="reward-box-card pop-in">
            <div class="reward-chest-anim" id="reward-chest-icon">🎁</div>
            <div class="reward-item-icon" id="reward-item-icon">🦄</div>
            <h3 class="reward-item-name" id="reward-item-name">にじ色のユニコーン</h3>
            <p class="reward-item-desc" id="reward-item-desc">ふわふわで夢いっぱい！</p>
          </div>
        </div>
      </div>
    `;

    // 音声リプレイボタン
    const replayBtn = document.getElementById('doors-voice-replay');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.soundSystem.playPop();
        this.speakPrompt();
      });
    }

    this.updateTreasureTray();
  }

  nextRound() {
    if (this.round >= this.maxRounds) {
      this.handleGameComplete();
      return;
    }

    this.isInputLocked = false;
    this.round++;
    this.app.updateStamps(this.round - 1, this.maxRounds);

    // 3つの異なるドアを選択
    const shuffled = [...this.doorTypes].sort(() => Math.random() - 0.5);
    this.currentOptions = shuffled.slice(0, 3);
    this.correctIndex = Math.floor(Math.random() * 3);
    const targetDoor = this.currentOptions[this.correctIndex];

    // プロンプト更新
    const promptEl = document.getElementById('doors-prompt-text');
    if (promptEl) {
      promptEl.innerHTML = `「<strong style="color:${targetDoor.decorColor}; font-size: 1.15em;">${targetDoor.icon} ${targetDoor.name}</strong>」は どれかな？`;
    }

    this.speakPrompt();
    this.renderDoors();
    this.resetPrincessPosition();
  }

  speakPrompt() {
    window.soundSystem.playMagicChime();
    const promptBubble = document.getElementById('doors-speech-bubble');
    if (promptBubble) {
      promptBubble.classList.add('pop-in');
      setTimeout(() => promptBubble.classList.remove('pop-in'), 400);
    }
  }

  renderDoors() {
    const container = document.getElementById('doors-container');
    if (!container) return;
    container.innerHTML = '';

    this.currentOptions.forEach((door, idx) => {
      const doorEl = document.createElement('div');
      doorEl.className = 'castle-door-unit';
      doorEl.dataset.index = idx;

      doorEl.innerHTML = `
        <div class="door-frame" style="border-color: ${door.frame};">
          <div class="door-arch-header" style="background: ${door.frame};">
            <span class="door-arch-icon">${door.icon}</span>
          </div>
          <!-- 扉（左右両開きまたは片開き3D） -->
          <div class="door-leaf" id="door-leaf-${idx}" style="background: linear-gradient(135deg, ${door.color}, ${door.decorColor});">
            <div class="door-panel-crest">
              <span class="door-crest-symbol">${door.icon}</span>
            </div>
            <div class="door-knob">🟡</div>
            <div class="door-wood-grooves"></div>
          </div>
          <!-- 扉の奥（宝箱の部屋） -->
          <div class="door-interior" id="door-interior-${idx}">
            <div class="door-light-beam"></div>
            <div class="door-treasure-box">🎁</div>
          </div>
        </div>
        <div class="door-plate-label" style="background: ${door.decorColor};">
          ${door.icon} ${door.name}
        </div>
      `;

      doorEl.addEventListener('click', () => {
        if (this.isInputLocked) return;
        this.handleDoorClick(idx, doorEl);
      });

      container.appendChild(doorEl);
    });
  }

  resetPrincessPosition() {
    const avatar = document.getElementById('doors-princess-avatar');
    if (avatar) {
      avatar.style.transition = 'none';
      avatar.style.transform = 'translateX(0px) scale(0.85)';
      avatar.classList.remove('walking', 'cheering');
    }
  }

  handleDoorClick(doorIndex, doorEl) {
    if (this.isInputLocked) return;

    if (doorIndex === this.correctIndex) {
      // 正解！
      this.isInputLocked = true;
      this.animatePrincessToDoor(doorIndex, () => {
        this.openDoorSuccess(doorIndex, doorEl);
      });
    } else {
      // 不正解（おしい！）
      window.soundSystem.playPop();
      doorEl.classList.add('shake-card');
      setTimeout(() => doorEl.classList.remove('shake-card'), 500);

      const promptEl = document.getElementById('doors-prompt-text');
      if (promptEl) {
        const originalText = promptEl.innerHTML;
        promptEl.innerHTML = `✨ おしい！ もういちど さがしてみてね！`;
        setTimeout(() => {
          if (promptEl) promptEl.innerHTML = originalText;
        }, 1400);
      }
    }
  }

  animatePrincessToDoor(doorIndex, callback) {
    const avatar = document.getElementById('doors-princess-avatar');
    const container = document.getElementById('doors-container');
    if (!avatar || !container) {
      if (callback) callback();
      return;
    }

    const doorEls = container.querySelectorAll('.castle-door-unit');
    const targetDoor = doorEls[doorIndex];
    if (!targetDoor) {
      if (callback) callback();
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const doorRect = targetDoor.getBoundingClientRect();
    const avatarRect = avatar.getBoundingClientRect();

    // 中央からの移動距離
    const targetX = (doorRect.left + doorRect.width / 2) - (containerRect.left + containerRect.width / 2);

    window.soundSystem.playSparkle();
    avatar.classList.add('walking');
    avatar.style.transition = 'transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)';
    avatar.style.transform = `translateX(${targetX}px) scale(0.95)`;

    setTimeout(() => {
      avatar.classList.remove('walking');
      if (callback) callback();
    }, 850);
  }

  openDoorSuccess(doorIndex, doorEl) {
    window.soundSystem.playDoorOpen();

    const leaf = document.getElementById(`door-leaf-${doorIndex}`);
    if (leaf) {
      leaf.classList.add('open-door-3d');
    }

    // パーティクル演出
    const rect = doorEl.getBoundingClientRect();
    this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

    // 0.5秒後にお宝出現
    setTimeout(() => {
      const reward = this.treasures[this.round - 1] || this.treasures[0];
      this.collectedTreasures.push(reward);
      this.updateTreasureTray();

      window.soundSystem.playTreasureChest();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);

      // プリンセス喜びアニメーション
      const avatar = document.getElementById('doors-princess-avatar');
      if (avatar) avatar.classList.add('cheering');

      // 報酬モーダル表示
      this.showRewardPopup(reward, () => {
        this.app.updateStamps(this.round, this.maxRounds);
        setTimeout(() => this.nextRound(), 600);
      });
    }, 550);
  }

  showRewardPopup(treasure, onClose) {
    const popup = document.getElementById('doors-reward-popup');
    const iconEl = document.getElementById('reward-item-icon');
    const nameEl = document.getElementById('reward-item-name');
    const descEl = document.getElementById('reward-item-desc');

    if (iconEl) iconEl.textContent = treasure.icon;
    if (nameEl) nameEl.textContent = `✨ ${treasure.name} を発見！ ✨`;
    if (descEl) descEl.textContent = treasure.desc;

    if (popup) {
      popup.classList.add('show');
      setTimeout(() => {
        popup.classList.remove('show');
        if (onClose) onClose();
      }, 1600);
    } else {
      if (onClose) onClose();
    }
  }

  updateTreasureTray() {
    const slotsEl = document.getElementById('doors-tray-slots');
    if (!slotsEl) return;
    slotsEl.innerHTML = '';

    for (let i = 0; i < this.maxRounds; i++) {
      const slot = document.createElement('div');
      slot.className = 'treasure-slot' + (this.collectedTreasures[i] ? ' filled' : '');
      slot.innerHTML = this.collectedTreasures[i] ? this.collectedTreasures[i].icon : '❓';
      slotsEl.appendChild(slot);
    }
  }

  handleGameComplete() {
    this.app.updateStamps(this.maxRounds, this.maxRounds);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);

    const avatar = document.getElementById('doors-princess-avatar');
    if (avatar) avatar.classList.add('cheering');

    const promptEl = document.getElementById('doors-prompt-text');
    if (promptEl) {
      promptEl.innerHTML = `🎉 すごい！ お城のたからものを ぜんぶ みつけたよ！ 🎉`;
    }

    setTimeout(() => {
      this.app.showCompleteModal();
    }, 1200);
  }
}

window.GamePrincessDoors = GamePrincessDoors;
