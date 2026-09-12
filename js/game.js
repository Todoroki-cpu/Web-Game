/**
 * game.js - くだもの＆パン もぐもぐ・お買い物（かずを数える）ゲームロジック
 */

class CountingGame {
  constructor() {
    this.targetCount = 3;
    this.currentCount = 0;
    this.currentItem = 'apple';
    this.currentChar = 'anpan';
    this.stars = 0;
    this.maxStars = 5;
    this.isCleared = false;
    this.isInputLocked = false;
    this.isStarted = false;

    // 定義データ
    this.itemsData = {
      apple: { name: 'りんご', emoji: '🍎', color: '#ff4757' },
      orange: { name: 'みかん', emoji: '🍊', color: '#ffa502' },
      banana: { name: 'バナナ', emoji: '🍌', color: '#ffd32a' },
      strawberry: { name: 'いちご', emoji: '🍓', color: '#ff6b81' },
      bread: { name: 'パン', emoji: '🥐', color: '#e67e22' },
      melon: { name: 'メロンパン', emoji: '🍈', color: '#2ed573' }
    };

    this.charactersList = ['anpan', 'baikin', 'shokupan', 'melonpan'];
    this.itemsList = ['apple', 'orange', 'banana', 'strawberry', 'bread', 'melon'];

    // DOM要素
    this.speechTextEl = document.getElementById('speech-text');
    this.plateItemsEl = document.getElementById('plate-items');
    this.plateCounterEl = document.getElementById('plate-counter');
    this.treeItemsEl = document.getElementById('tree-items');
    this.stampContainerEl = document.getElementById('stamp-container');
    this.starCountTextEl = document.getElementById('star-count-text');
    this.plateZoneEl = document.getElementById('plate-dropzone');
    this.targetIndicatorEl = document.getElementById('target-indicator');
    this.startScreenEl = document.getElementById('start-screen');

    // システム初期化
    this.particleSystem = new ParticleSystem('effects-canvas');
    this.charManager = new CharacterManager('character-stage');

    this.initEventListeners();
    this.initStamps();
  }

  start() {
    this.isStarted = true;
    if (this.startScreenEl) {
      this.startScreenEl.classList.add('hidden');
    }
    window.soundSystem.initAudio();
    window.soundSystem.startBgm();
    window.soundSystem.playSparkle();
    this.nextRound();
  }

  initStamps() {
    this.stampContainerEl.innerHTML = '';
    for (let i = 0; i < this.maxStars; i++) {
      const slot = document.createElement('div');
      slot.className = 'stamp-slot';
      slot.id = `stamp-slot-${i}`;
      slot.innerHTML = '⭐';
      this.stampContainerEl.appendChild(slot);
    }
  }

  updateStamps() {
    for (let i = 0; i < this.maxStars; i++) {
      const slot = document.getElementById(`stamp-slot-${i}`);
      if (slot) {
        if (i < this.stars) {
          slot.classList.add('earned');
        } else {
          slot.classList.remove('earned');
        }
      }
    }
    this.starCountTextEl.textContent = `${this.stars} / ${this.maxStars}`;
  }

  nextRound() {
    this.isCleared = false;
    this.isInputLocked = false;
    this.currentCount = 0;

    // キャラクターとアイテム、目標数をランダム選択
    this.currentChar = this.charactersList[Math.floor(Math.random() * this.charactersList.length)];
    this.currentItem = this.itemsList[Math.floor(Math.random() * this.itemsList.length)];
    
    // 目標の数 (1〜5)
    this.targetCount = Math.floor(Math.random() * 5) + 1;

    this.charManager.setCharacter(this.currentChar);
    this.charManager.setState('talking');

    this.renderQuestion();
    this.renderTreeItems();
    this.renderPlate();

    // VOICEVOXによる注文音声の再生
    setTimeout(() => {
      window.soundSystem.playVoice(`order_${this.currentItem}_${this.targetCount}`);
      setTimeout(() => {
        if (this.charManager.state === 'talking') {
          this.charManager.setState('idle');
        }
      }, 2200);
    }, 350);
  }

  renderQuestion() {
    const item = this.itemsData[this.currentItem];
    this.speechTextEl.innerHTML = `
      <span class="target-name">${item.name}</span> <span class="target-emoji">${item.emoji}</span> を 
      <span class="target-num">${this.targetCount}</span> こ ちょうだい！
    `;

    // 視覚的ガイド（目標の数のまる）
    let dotsHtml = '';
    for (let i = 0; i < this.targetCount; i++) {
      dotsHtml += `<span class="target-dot">${item.emoji}</span>`;
    }
    this.targetIndicatorEl.innerHTML = dotsHtml;
  }

  renderTreeItems() {
    this.treeItemsEl.innerHTML = '';
    const item = this.itemsData[this.currentItem];
    const totalTreeItems = 7;

    for (let i = 0; i < totalTreeItems; i++) {
      const el = document.createElement('div');
      el.className = 'food-item draggable';
      el.dataset.index = i;
      el.innerHTML = `
        <span class="food-emoji">${item.emoji}</span>
        <span class="food-shadow"></span>
      `;
      this.setupDraggable(el);
      this.treeItemsEl.appendChild(el);
    }
  }

  renderPlate() {
    this.plateItemsEl.innerHTML = '';
    this.plateCounterEl.textContent = this.currentCount;
    this.plateCounterEl.className = 'plate-badge ' + (this.currentCount === this.targetCount ? 'exact' : (this.currentCount > this.targetCount ? 'over' : ''));

    const item = this.itemsData[this.currentItem];
    for (let i = 0; i < this.currentCount; i++) {
      const el = document.createElement('div');
      el.className = 'plate-food-item pop-in';
      el.innerHTML = `<span class="food-emoji">${item.emoji}</span>`;
      
      // お皿の中のアイテムをタップすると木に戻せる親切設計
      el.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isInputLocked) return;
        e.stopPropagation();
        this.removeItemFromPlate(i);
      });

      this.plateItemsEl.appendChild(el);
    }
  }

  removeItemFromPlate(index) {
    if (this.currentCount <= 0) return;
    window.soundSystem.playPop();
    this.currentCount--;
    this.renderPlate();
    if (this.currentCount > 0 && this.currentCount <= 5) {
      window.soundSystem.playVoice(`count_${this.currentCount}`);
    }
  }

  // ドラッグ＆ドロップ（Pointer Events対応）
  setupDraggable(element) {
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;
    let cloneEl = null;

    element.addEventListener('pointerdown', (e) => {
      if (this.isCleared || this.isInputLocked) return;
      e.preventDefault();
      
      window.soundSystem.initAudio();
      window.soundSystem.playPop();

      const rect = element.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialX = rect.left;
      initialY = rect.top;

      cloneEl = element.cloneNode(true);
      cloneEl.classList.add('dragging');
      cloneEl.style.position = 'fixed';
      cloneEl.style.left = `${initialX}px`;
      cloneEl.style.top = `${initialY}px`;
      cloneEl.style.width = `${rect.width}px`;
      cloneEl.style.height = `${rect.height}px`;
      cloneEl.style.zIndex = '9999';
      cloneEl.style.pointerEvents = 'none';
      document.body.appendChild(cloneEl);

      element.style.opacity = '0.3';

      const onPointerMove = (moveEvent) => {
        if (!cloneEl) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        cloneEl.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;

        const plateRect = this.plateZoneEl.getBoundingClientRect();
        if (
          moveEvent.clientX >= plateRect.left &&
          moveEvent.clientX <= plateRect.right &&
          moveEvent.clientY >= plateRect.top &&
          moveEvent.clientY <= plateRect.bottom
        ) {
          this.plateZoneEl.classList.add('hover-target');
        } else {
          this.plateZoneEl.classList.remove('hover-target');
        }
      };

      const onPointerUp = (upEvent) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        this.plateZoneEl.classList.remove('hover-target');
        element.style.opacity = '1';

        const plateRect = this.plateZoneEl.getBoundingClientRect();
        const isInPlate = (
          upEvent.clientX >= plateRect.left &&
          upEvent.clientX <= plateRect.right &&
          upEvent.clientY >= plateRect.top &&
          upEvent.clientY <= plateRect.bottom
        );

        if (cloneEl) {
          if (isInPlate) {
            this.handleItemDropOnPlate(upEvent.clientX, upEvent.clientY);
          }
          cloneEl.remove();
          cloneEl = null;
        }
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    });
  }

  handleItemDropOnPlate(dropX, dropY) {
    this.currentCount++;
    this.particleSystem.sparkle(dropX, dropY, 15);
    this.renderPlate();

    // VOICEVOXによる数字カウント音声の再生（「いち！」「に！」「さん！」）
    if (this.currentCount <= 5) {
      window.soundSystem.playVoice(`count_${this.currentCount}`);
    }

    // 目標達成判定
    if (this.currentCount === this.targetCount) {
      this.handleSuccess();
    } else if (this.currentCount > this.targetCount) {
      setTimeout(() => {
        window.soundSystem.playVoice('too_many');
      }, 700);
    }
  }

  handleSuccess() {
    this.isCleared = true;
    this.isInputLocked = true;

    // キャラクターのもぐもぐリアクション
    setTimeout(() => {
      this.charManager.setState('eating');
      window.soundSystem.playMunch();

      // お皿のアイテムがもぐもぐ消える
      setTimeout(() => {
        this.plateItemsEl.innerHTML = '';
        
        // 大正解のお祝い！
        setTimeout(() => {
          this.charManager.setState('celebrate');
          window.soundSystem.playFanfare();
          
          const charRect = document.getElementById('character-stage').getBoundingClientRect();
          this.particleSystem.explode(charRect.left + charRect.width / 2, charRect.top + charRect.height / 2, 80);

          // VOICEVOXほめ言葉ボイス
          const praiseIdx = Math.floor(Math.random() * 3) + 1;
          window.soundSystem.playVoice(`praise_${praiseIdx}`);

          // 星スタンプ獲得
          this.stars++;
          window.soundSystem.playSparkle();
          this.updateStamps();

          // 次のラウンド、またはコンプリート判定
          setTimeout(() => {
            if (this.stars >= this.maxStars) {
              this.handleGameComplete();
            } else {
              this.nextRound();
            }
          }, 3200);

        }, 800);
      }, 700);
    }, 500);
  }

  handleGameComplete() {
    const modal = document.getElementById('complete-modal');
    modal.classList.add('show');
    window.soundSystem.playFanfare();
    this.particleSystem.explode(window.innerWidth / 2, window.innerHeight / 2, 120);
    window.soundSystem.playVoice('all_clear');
  }

  restart() {
    const modal = document.getElementById('complete-modal');
    modal.classList.remove('show');
    this.stars = 0;
    this.updateStamps();
    this.nextRound();
  }

  initEventListeners() {
    // スタートボタン
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.start();
      });
    }

    // ミュート切り替えボタン
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        const isMuted = window.soundSystem.toggleMute();
        soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
        soundToggleBtn.classList.toggle('muted', isMuted);
      });
    }

    // もう1回遊ぶボタン
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        window.soundSystem.playSparkle();
        this.restart();
      });
    }

    // 音声リピートボタン（吹き出しをタップするともう一度読んでくれる）
    const speechBubble = document.getElementById('speech-bubble');
    if (speechBubble) {
      speechBubble.addEventListener('click', () => {
        if (this.isCleared) return;
        window.soundSystem.playPop();
        this.charManager.setState('talking');
        window.soundSystem.playVoice(`order_${this.currentItem}_${this.targetCount}`);
        setTimeout(() => {
          if (this.charManager.state === 'talking') {
            this.charManager.setState('idle');
          }
        }, 2200);
      });
    }
  }
}

// ゲームインスタンス準備
window.addEventListener('DOMContentLoaded', () => {
  window.game = new CountingGame();
});
