/**
 * game_counting.js - ゲーム1: くだもの＆パン もぐもぐ・お買い物（かずを数える）
 * キャラクターごとの専用VOICEVOXボイス対応
 */

class GameCounting {
  constructor(app) {
    this.app = app;
    this.targetCount = 3;
    this.currentCount = 0;
    this.currentItem = 'apple';
    this.currentChar = 'anpan';
    this.stars = 0;
    this.maxStars = 5;
    this.isCleared = false;
    this.isInputLocked = false;

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
    this.speechTextEl = document.getElementById('counting-speech-text');
    this.plateItemsEl = document.getElementById('counting-plate-items');
    this.plateCounterEl = document.getElementById('counting-plate-counter');
    this.treeItemsEl = document.getElementById('counting-tree-items');
    this.plateZoneEl = document.getElementById('counting-plate-dropzone');
    this.targetIndicatorEl = document.getElementById('counting-target-indicator');
    this.speechBubble = document.getElementById('counting-speech-bubble');

    this.charManager = new CharacterManager('counting-character-stage');
    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('counting')) return;
        window.soundSystem.playPop();
        this.charManager.setState('talking');
        // キャラクター別音声の再生
        window.soundSystem.playVoice(`order_${this.currentChar}_${this.currentItem}_${this.targetCount}`);
        setTimeout(() => {
          if (this.charManager.state === 'talking') {
            this.charManager.setState('idle');
          }
        }, 2200);
      });
    }
  }

  start() {
    this.stars = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isInputLocked = false;
    this.currentCount = 0;

    this.currentChar = this.charactersList[Math.floor(Math.random() * this.charactersList.length)];
    this.currentItem = this.itemsList[Math.floor(Math.random() * this.itemsList.length)];
    this.targetCount = Math.floor(Math.random() * 5) + 1;

    this.charManager.setCharacter(this.currentChar);
    this.charManager.setState('talking');

    this.renderQuestion();
    this.renderTreeItems();
    this.renderPlate();

    // 登場したキャラクター固有のVOICEVOX音声で注文！
    setTimeout(() => {
      if (!this.app.isCurrentView('counting')) return;
      window.soundSystem.playVoice(`order_${this.currentChar}_${this.currentItem}_${this.targetCount}`);
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
    if (this.currentCount > 0 && this.currentCount <= 10) {
      window.soundSystem.playVoice(`count_${this.currentCount}`);
    }
  }

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
    this.app.particles.sparkle(dropX, dropY, 15);
    this.renderPlate();

    if (this.currentCount <= 10) {
      window.soundSystem.playVoice(`count_${this.currentCount}`);
    }

    if (this.currentCount === this.targetCount) {
      this.handleSuccess();
    } else if (this.currentCount > this.targetCount) {
      setTimeout(() => {
        if (this.app.isCurrentView('counting')) {
          window.soundSystem.playVoice('too_many');
        }
      }, 700);
    }
  }

  handleSuccess() {
    this.isCleared = true;
    this.isInputLocked = true;

    setTimeout(() => {
      this.charManager.setState('eating');
      window.soundSystem.playMunch();

      setTimeout(() => {
        this.plateItemsEl.innerHTML = '';
        
        setTimeout(() => {
          this.charManager.setState('celebrate');
          window.soundSystem.playFanfare();
          
          const charRect = document.getElementById('counting-character-stage').getBoundingClientRect();
          this.app.particles.explode(charRect.left + charRect.width / 2, charRect.top + charRect.height / 2, 80);

          // 食べたキャラクター固有のほめ言葉ボイス！
          const praiseIdx = Math.floor(Math.random() * 3) + 1;
          window.soundSystem.playVoice(`praise_${this.currentChar}_${praiseIdx}`);

          this.stars++;
          window.soundSystem.playSparkle();
          this.app.updateStamps(this.stars, this.maxStars);

          setTimeout(() => {
            if (!this.app.isCurrentView('counting')) return;
            if (this.stars >= this.maxStars) {
              this.app.showCompleteModal();
            } else {
              this.nextRound();
            }
          }, 3200);

        }, 800);
      }, 700);
    }, 500);
  }
}

window.GameCounting = GameCounting;
