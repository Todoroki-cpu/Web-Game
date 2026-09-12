/**
 * game_dots.js - ゲーム2: すうじ てんつなぎ（じゅんばん・イラスト完成）
 */

class GameDots {
  constructor(app) {
    this.app = app;
    this.canvas = document.getElementById('dots-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.containerEl = document.getElementById('dots-container-area');
    this.speechTextEl = document.getElementById('dots-speech-text');
    this.dotsOverlayEl = document.getElementById('dots-markers-layer');
    this.illustrationLayerEl = document.getElementById('dots-illustration-layer');

    this.charManager = new CharacterManager('dots-character-stage');

    this.currentShapeIdx = 0;
    this.currentDotIndex = 0; // 次に繋ぐべきドット (0-indexed: 0 means dot 1)
    this.connectedDots = [];
    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isDrawing = false;
    this.lastTouchPos = null;

    // てんつなぎのお題データ（パーセンテージ座標でiPad画面にレスポンシブ配置）
    this.shapes = [
      {
        name: '🌟 おほしさま',
        emoji: '⭐',
        color: '#fbc531',
        points: [
          { x: 50, y: 15 }, // 1 (てっぺん)
          { x: 62, y: 38 }, // 2
          { x: 88, y: 38 }, // 3 (右端)
          { x: 68, y: 55 }, // 4
          { x: 75, y: 82 }, // 5 (右下)
          { x: 50, y: 65 }, // 6 (下中央)
          { x: 25, y: 82 }, // 7 (左下)
          { x: 32, y: 55 }, // 8
          { x: 12, y: 38 }, // 9 (左端)
          { x: 38, y: 38 }  // 10
        ],
        svg: `<svg viewBox="0 0 200 200" width="100%" height="100%">
          <polygon points="100,10 125,70 190,70 138,110 158,175 100,135 42,175 62,110 10,70 75,70" fill="#fbc531" stroke="#e1b12c" stroke-width="6"/>
          <circle cx="75" cy="85" r="8" fill="#2f3542"/><circle cx="125" cy="85" r="8" fill="#2f3542"/>
          <circle cx="73" cy="82" r="3" fill="#fff"/><circle cx="123" cy="82" r="3" fill="#fff"/>
          <ellipse cx="60" cy="100" rx="9" ry="6" fill="#ff7675" opacity="0.8"/>
          <ellipse cx="140" cy="100" rx="9" ry="6" fill="#ff7675" opacity="0.8"/>
          <path d="M85 110 Q100 125 115 110" stroke="#e84118" stroke-width="4" stroke-linecap="round" fill="none"/>
        </svg>`
      },
      {
        name: '🚀 ロケット',
        emoji: '🚀',
        color: '#3498db',
        points: [
          { x: 50, y: 15 }, // 1 (先端)
          { x: 68, y: 40 }, // 2
          { x: 68, y: 70 }, // 3 (右胴体)
          { x: 85, y: 85 }, // 4 (右翼)
          { x: 60, y: 85 }, // 5 (右噴射)
          { x: 40, y: 85 }, // 6 (左噴射)
          { x: 15, y: 85 }, // 7 (左翼)
          { x: 32, y: 70 }, // 8 (左胴体)
          { x: 32, y: 40 }  // 9
        ],
        svg: `<svg viewBox="0 0 200 200" width="100%" height="100%">
          <path d="M100 20 Q140 70 140 140 L60 140 Q60 70 100 20 Z" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="4"/>
          <path d="M100 20 Q120 50 125 60 L75 60 Q80 50 100 20 Z" fill="#e74c3c"/>
          <path d="M60 110 L30 150 L60 140 Z" fill="#e74c3c"/>
          <path d="M140 110 L170 150 L140 140 Z" fill="#e74c3c"/>
          <circle cx="100" cy="90" r="22" fill="#3498db" stroke="#2980b9" stroke-width="4"/>
          <circle cx="100" cy="90" r="16" fill="#74b9ff"/>
          <path d="M80 145 Q100 190 120 145" fill="#f39c12"/>
          <path d="M88 145 Q100 175 112 145" fill="#e74c3c"/>
        </svg>`
      },
      {
        name: '🍎 りんご',
        emoji: '🍎',
        color: '#ff4757',
        points: [
          { x: 50, y: 15 }, // 1 (ヘタ上)
          { x: 50, y: 30 }, // 2 (ヘタ下)
          { x: 75, y: 30 }, // 3 (右肩)
          { x: 88, y: 55 }, // 4 (右腹)
          { x: 70, y: 85 }, // 5 (右下)
          { x: 50, y: 78 }, // 6 (底のくぼみ)
          { x: 30, y: 85 }, // 7 (左下)
          { x: 12, y: 55 }, // 8 (左腹)
          { x: 25, y: 30 }  // 9 (左肩)
        ],
        svg: `<svg viewBox="0 0 200 200" width="100%" height="100%">
          <path d="M100 50 Q160 30 180 100 Q190 160 140 180 Q100 190 100 170 Q100 190 60 180 Q10 160 20 100 Q40 30 100 50 Z" fill="#ff4757" stroke="#e84118" stroke-width="5"/>
          <path d="M100 50 Q105 20 120 10" stroke="#795548" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M105 35 Q135 25 140 45 Q120 50 105 35 Z" fill="#2ed573"/>
          <ellipse cx="60" cy="90" rx="8" ry="16" fill="#fff" opacity="0.6" transform="rotate(-20, 60, 90)"/>
          <circle cx="85" cy="110" r="6" fill="#2f3542"/><circle cx="115" cy="110" r="6" fill="#2f3542"/>
          <path d="M92 125 Q100 135 108 125" stroke="#2f3542" stroke-width="3" stroke-linecap="round" fill="none"/>
        </svg>`
      },
      {
        name: '🏠 おうち',
        emoji: '🏠',
        color: '#2ed573',
        points: [
          { x: 50, y: 15 }, // 1 (屋根てっぺん)
          { x: 85, y: 45 }, // 2 (屋根右)
          { x: 75, y: 45 }, // 3
          { x: 75, y: 85 }, // 4 (壁右下)
          { x: 25, y: 85 }, // 5 (壁左下)
          { x: 25, y: 45 }, // 6 (壁左上)
          { x: 15, y: 45 }  // 7 (屋根左)
        ],
        svg: `<svg viewBox="0 0 200 200" width="100%" height="100%">
          <polygon points="100,20 180,80 20,80" fill="#e74c3c" stroke="#c0392b" stroke-width="4"/>
          <rect x="40" y="80" width="120" height="95" fill="#f5cd79" stroke="#e15f41" stroke-width="4"/>
          <rect x="80" y="115" width="40" height="60" fill="#795548" rx="4"/>
          <circle cx="112" cy="145" r="4" fill="#f1c40f"/>
          <rect x="50" y="95" width="25" height="25" fill="#74b9ff" stroke="#0984e3" stroke-width="3"/>
          <rect x="125" y="95" width="25" height="25" fill="#74b9ff" stroke="#0984e3" stroke-width="3"/>
        </svg>`
      }
    ];

    this.initCanvas();
  }

  initCanvas() {
    if (!this.canvas) return;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas || !this.containerEl) return;
    const rect = this.containerEl.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.redrawLines();
  }

  start() {
    this.stars = 0;
    this.currentShapeIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.loadShape(this.currentShapeIdx);
  }

  loadShape(index) {
    this.currentShapeIdx = index % this.shapes.length;
    this.currentDotIndex = 0;
    this.connectedDots = [];
    this.isCleared = false;
    this.lastTouchPos = null;

    this.charManager.setCharacter('anpan');
    this.charManager.setState('idle');

    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.illustrationLayerEl) {
      this.illustrationLayerEl.innerHTML = '';
      this.illustrationLayerEl.classList.remove('revealed');
    }

    const shape = this.shapes[this.currentShapeIdx];
    this.speechTextEl.innerHTML = `
      <span class="target-name">${shape.name}</span> を つくろう！<br>
      <span class="target-num">1</span> から じゅんばんになぞってね
    `;

    this.renderDots();

    setTimeout(() => {
      if (!this.app.isCurrentView('dots')) return;
      window.soundSystem.playVoice('dots_prompt');
    }, 400);
  }

  renderDots() {
    this.dotsOverlayEl.innerHTML = '';
    const shape = this.shapes[this.currentShapeIdx];

    shape.points.forEach((pt, idx) => {
      const dotEl = document.createElement('div');
      dotEl.className = 'dot-marker';
      dotEl.dataset.index = idx;
      dotEl.style.left = `${pt.x}%`;
      dotEl.style.top = `${pt.y}%`;

      const num = idx + 1;
      dotEl.innerHTML = `<span class="dot-num">${num}</span>`;

      if (idx === 0) {
        dotEl.classList.add('next-target');
      }

      // ドットをタップまたはタッチで接続
      dotEl.addEventListener('pointerdown', (e) => {
        if (this.isCleared || !this.app.isCurrentView('dots')) return;
        e.preventDefault();
        e.stopPropagation();
        this.handleDotTouch(idx, dotEl);
      });

      this.dotsOverlayEl.appendChild(dotEl);
    });
  }

  handleDotTouch(index, element) {
    if (index === this.currentDotIndex) {
      // 正しい次のドットにタッチ！
      this.connectedDots.push(index);
      element.classList.remove('next-target');
      element.classList.add('connected');

      const dotNum = index + 1;
      if (dotNum <= 10) {
        window.soundSystem.playVoice(`count_${dotNum}`);
      } else {
        window.soundSystem.playPop();
      }

      const rect = element.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);

      this.currentDotIndex++;
      this.redrawLines();

      const shape = this.shapes[this.currentShapeIdx];
      if (this.currentDotIndex >= shape.points.length) {
        // すべて繋ぎ終わった（最後のドットから1番目へ自動接続して完成）
        this.handleShapeComplete();
      } else {
        // 次のターゲットを強調
        const nextEl = this.dotsOverlayEl.querySelector(`.dot-marker[data-index="${this.currentDotIndex}"]`);
        if (nextEl) {
          nextEl.classList.add('next-target');
        }
      }
    } else if (index > this.currentDotIndex) {
      // 順番が違う場合
      window.soundSystem.playPop();
      element.classList.add('shake');
      setTimeout(() => element.classList.remove('shake'), 400);
      window.soundSystem.playVoice('dots_next');
    }
  }

  redrawLines() {
    if (!this.ctx || !this.containerEl) return;
    const rect = this.containerEl.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.connectedDots.length <= 1) return;

    const shape = this.shapes[this.currentShapeIdx];
    this.ctx.beginPath();
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#ff9f1a';
    this.ctx.shadowColor = 'rgba(255, 159, 26, 0.8)';
    this.ctx.shadowBlur = 12;

    this.connectedDots.forEach((ptIdx, i) => {
      const pt = shape.points[ptIdx];
      const px = (pt.x / 100) * this.canvas.width;
      const py = (pt.y / 100) * this.canvas.height;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    });

    if (this.isCleared) {
      // 閉じたパス
      const firstPt = shape.points[0];
      this.ctx.lineTo((firstPt.x / 100) * this.canvas.width, (firstPt.y / 100) * this.canvas.height);
    }

    this.ctx.stroke();
  }

  handleShapeComplete() {
    this.isCleared = true;
    this.redrawLines();

    // イラストを表示
    const shape = this.shapes[this.currentShapeIdx];
    this.illustrationLayerEl.innerHTML = shape.svg;
    this.illustrationLayerEl.classList.add('revealed');

    this.charManager.setState('celebrate');
    window.soundSystem.playFanfare();

    const centerRect = this.containerEl.getBoundingClientRect();
    this.app.particles.explode(centerRect.left + centerRect.width / 2, centerRect.top + centerRect.height / 2, 90);

    window.soundSystem.playVoice('dots_complete');

    this.speechTextEl.innerHTML = `
      🎉 <span class="target-name">${shape.name}</span> が かんせい！ 🎉
    `;

    this.stars++;
    window.soundSystem.playSparkle();
    this.app.updateStamps(this.stars, this.maxStars);

    setTimeout(() => {
      if (!this.app.isCurrentView('dots')) return;
      if (this.stars >= this.maxStars) {
        this.app.showCompleteModal();
      } else {
        this.loadShape(this.currentShapeIdx + 1);
      }
    }, 3500);
  }
}

window.GameDots = GameDots;
