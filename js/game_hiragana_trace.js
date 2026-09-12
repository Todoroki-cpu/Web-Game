/**
 * game_hiragana_trace.js - サンリオ風 キラキラ ひらがな なぞり書きゲーム
 * キャラクター：シナモン風 (cinna) または キティ風 (kitty)
 */

class GameHiraganaTrace {
  constructor(app) {
    this.app = app;
    this.characterManager = null;
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.currentLetterIdx = 0;
    this.currentStrokeIdx = 0;
    this.currentCheckIdx = 0;
    this.drawnStrokes = []; // 完了した画のパス配列
    this.currentStrokePoints = []; // 描画中のポイント
    this.earnedStamps = 0;
    this.maxStamps = 5;
    this.isCompleted = false;
    this.canvasWidth = 340;
    this.canvasHeight = 340;

    this.letters = [
      {
        char: 'あ',
        word: 'アイス',
        emoji: '🍦',
        voiceKey: 'trace_a',
        strokes: [
          // 画1: 横棒
          [{ x: 0.26, y: 0.35 }, { x: 0.50, y: 0.35 }, { x: 0.74, y: 0.35 }],
          // 画2: 縦棒
          [{ x: 0.50, y: 0.18 }, { x: 0.50, y: 0.50 }, { x: 0.46, y: 0.82 }],
          // 画3: くるりん
          [{ x: 0.65, y: 0.45 }, { x: 0.38, y: 0.65 }, { x: 0.45, y: 0.85 }, { x: 0.72, y: 0.78 }, { x: 0.75, y: 0.58 }, { x: 0.58, y: 0.52 }]
        ]
      },
      {
        char: 'い',
        word: 'いちご',
        emoji: '🍓',
        voiceKey: 'trace_i',
        strokes: [
          // 画1: 左の曲線とはね
          [{ x: 0.35, y: 0.28 }, { x: 0.32, y: 0.55 }, { x: 0.35, y: 0.75 }, { x: 0.44, y: 0.70 }],
          // 画2: 右の短い線
          [{ x: 0.65, y: 0.38 }, { x: 0.68, y: 0.58 }, { x: 0.70, y: 0.72 }]
        ]
      },
      {
        char: 'う',
        word: 'うさぎ',
        emoji: '🐰',
        voiceKey: 'trace_u',
        strokes: [
          // 画1: 上の点
          [{ x: 0.42, y: 0.25 }, { x: 0.58, y: 0.30 }],
          // 画2: 下の丸み
          [{ x: 0.36, y: 0.45 }, { x: 0.65, y: 0.48 }, { x: 0.68, y: 0.70 }, { x: 0.42, y: 0.85 }]
        ]
      },
      {
        char: 'え',
        word: 'えのぐ',
        emoji: '🖍️',
        voiceKey: 'trace_e',
        strokes: [
          // 画1: 上の点
          [{ x: 0.44, y: 0.22 }, { x: 0.56, y: 0.28 }],
          // 画2: ジグザグと波
          [{ x: 0.35, y: 0.42 }, { x: 0.65, y: 0.42 }, { x: 0.38, y: 0.72 }, { x: 0.58, y: 0.68 }, { x: 0.75, y: 0.82 }]
        ]
      },
      {
        char: 'お',
        word: 'おにぎり',
        emoji: '🍙',
        voiceKey: 'trace_o',
        strokes: [
          // 画1: 横棒
          [{ x: 0.28, y: 0.35 }, { x: 0.66, y: 0.35 }],
          // 画2: 縦からループ
          [{ x: 0.48, y: 0.20 }, { x: 0.48, y: 0.55 }, { x: 0.30, y: 0.72 }, { x: 0.60, y: 0.82 }, { x: 0.72, y: 0.65 }],
          // 画3: 右上の点
          [{ x: 0.70, y: 0.28 }, { x: 0.80, y: 0.38 }]
        ]
      },
      {
        char: 'か',
        word: 'かめ',
        emoji: '🐢',
        voiceKey: 'trace_ka',
        strokes: [
          // 画1: 左の曲がり
          [{ x: 0.35, y: 0.35 }, { x: 0.62, y: 0.35 }, { x: 0.56, y: 0.72 }, { x: 0.44, y: 0.78 }],
          // 画2: 縦の払い
          [{ x: 0.44, y: 0.20 }, { x: 0.35, y: 0.82 }],
          // 画3: 右の点
          [{ x: 0.70, y: 0.30 }, { x: 0.80, y: 0.42 }]
        ]
      },
      {
        char: 'さ',
        word: 'さかな',
        emoji: '🐟',
        voiceKey: 'trace_sa',
        strokes: [
          // 画1: 横棒
          [{ x: 0.28, y: 0.38 }, { x: 0.72, y: 0.35 }],
          // 画2: 縦の斜め
          [{ x: 0.56, y: 0.25 }, { x: 0.44, y: 0.62 }],
          // 画3: 下のカーブ
          [{ x: 0.35, y: 0.68 }, { x: 0.55, y: 0.85 }, { x: 0.70, y: 0.75 }]
        ]
      },
      {
        char: 'た',
        word: 'たいよう',
        emoji: '☀️',
        voiceKey: 'trace_ta',
        strokes: [
          // 画1: 横棒
          [{ x: 0.26, y: 0.40 }, { x: 0.58, y: 0.40 }],
          // 画2: 縦の払い
          [{ x: 0.42, y: 0.25 }, { x: 0.32, y: 0.80 }],
          // 画3: 右上の「こ」の上
          [{ x: 0.58, y: 0.45 }, { x: 0.76, y: 0.45 }],
          // 画4: 右下の「こ」の下
          [{ x: 0.58, y: 0.70 }, { x: 0.76, y: 0.75 }]
        ]
      }
    ];

    this.initDOM();
  }

  initDOM() {
    this.speechTextEl = document.getElementById('hiragana-trace-speech-text');
    this.canvas = document.getElementById('hiragana-trace-canvas');
    this.charStage = 'hiragana-trace-character-stage';
    this.rewardPopup = document.getElementById('hiragana-trace-reward');
    this.rewardEmoji = document.getElementById('hiragana-trace-reward-emoji');
    this.rewardWord = document.getElementById('hiragana-trace-reward-word');

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
    }
  }

  start() {
    if (!this.characterManager) {
      this.characterManager = new CharacterManager(this.charStage);
    }
    this.characterManager.setCharacter('cinna'); // シナモン風
    this.characterManager.setState('idle');

    this.earnedStamps = 0;
    this.currentLetterIdx = 0;
    this.app.updateStamps(0, this.maxStamps);

    window.soundSystem.playVoice('trace_prompt');
    this.setSpeech('すうじの じゅんばんに ゆびで なぞってみよう！');

    // 即座に初期化＆描画
    this.initCanvasSize();
    this.loadLetter(this.currentLetterIdx);
  }

  initCanvasSize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : 340;
    const h = rect.height > 0 ? rect.height : 340;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.canvasWidth = w;
    this.canvasHeight = h;
    this.render();
  }

  setSpeech(text) {
    if (this.speechTextEl) {
      this.speechTextEl.textContent = text;
    }
  }

  loadLetter(idx) {
    this.currentLetterIdx = idx % this.letters.length;
    this.currentStrokeIdx = 0;
    this.currentCheckIdx = 0;
    this.drawnStrokes = [];
    this.currentStrokePoints = [];
    this.isCompleted = false;

    if (this.rewardPopup) {
      this.rewardPopup.classList.remove('show');
    }

    this.app.startTimer(10);
    this.render();
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return {
        x: x,
        y: y,
        normX: x / (rect.width || 340),
        normY: y / (rect.height || 340)
      };
    };

    const handleStart = (e) => {
      if (this.isCompleted) return;
      e.preventDefault();
      const pos = getPos(e);
      const letter = this.letters[this.currentLetterIdx];
      const stroke = letter.strokes[this.currentStrokeIdx];
      if (!stroke) return;

      const targetCheck = stroke[this.currentCheckIdx];
      const dist = Math.hypot(pos.normX - targetCheck.x, pos.normY - targetCheck.y);

      // 開始ポイントの近くをタップした場合に描画スタート
      if (dist < 0.28 || this.currentCheckIdx > 0) {
        this.isDrawing = true;
        this.currentStrokePoints = [pos];
        this.checkPointAdvance(pos.normX, pos.normY);
        this.render();
      }
    };

    const handleMove = (e) => {
      if (!this.isDrawing || this.isCompleted) return;
      e.preventDefault();
      const pos = getPos(e);
      this.currentStrokePoints.push(pos);
      this.checkPointAdvance(pos.normX, pos.normY);

      if (Math.random() < 0.25) {
        window.soundSystem.playTick();
      }
      this.render();
    };

    const handleEnd = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      const letter = this.letters[this.currentLetterIdx];
      const stroke = letter.strokes[this.currentStrokeIdx];

      // すべてのチェックポイントを通ったか確認
      if (this.currentCheckIdx >= stroke.length) {
        // 画の完了！
        this.drawnStrokes.push([...this.currentStrokePoints]);
        this.currentStrokePoints = [];
        this.currentStrokeIdx++;
        this.currentCheckIdx = 0;
        window.soundSystem.playSparkle();

        if (this.currentStrokeIdx >= letter.strokes.length) {
          // 文字全体の完了！
          this.handleLetterComplete();
        } else {
          this.app.startTimer(10);
          this.render();
        }
      } else {
        // 途中で離した場合はやり直し
        this.currentStrokePoints = [];
        this.currentCheckIdx = 0;
        this.render();
      }
    };

    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    this.canvas.addEventListener('touchstart', handleStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }

  checkPointAdvance(nx, ny) {
    const letter = this.letters[this.currentLetterIdx];
    const stroke = letter.strokes[this.currentStrokeIdx];
    if (!stroke || this.currentCheckIdx >= stroke.length) return;

    const targetCheck = stroke[this.currentCheckIdx];
    const dist = Math.hypot(nx - targetCheck.x, ny - targetCheck.y);

    if (dist < 0.24) {
      this.currentCheckIdx++;
      if (this.currentCheckIdx < stroke.length) {
        window.soundSystem.playPop();
      }
    }
  }

  handleLetterComplete() {
    this.isCompleted = true;
    this.app.stopTimer();
    const letter = this.letters[this.currentLetterIdx];
    this.render();

    this.characterManager.setState('celebrate');
    window.soundSystem.playFanfare();
    window.soundSystem.playVoice(letter.voiceKey);
    this.setSpeech(`『${letter.char}』のかんせい！ ${letter.word}の 『${letter.char}』！`);

    // リワードポップアップ表示
    if (this.rewardPopup) {
      this.rewardEmoji.textContent = letter.emoji;
      this.rewardWord.textContent = `${letter.char}：${letter.word}`;
      this.rewardPopup.classList.add('show');
    }

    const rect = this.canvas.getBoundingClientRect();
    this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);

    this.earnedStamps++;
    this.app.updateStamps(this.earnedStamps, this.maxStamps);

    setTimeout(() => {
      if (this.earnedStamps >= this.maxStamps) {
        this.app.showCompleteModal();
      } else {
        this.loadLetter(this.currentLetterIdx + 1);
      }
    }, 2000);
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    this.ctx.clearRect(0, 0, w, h);

    const letter = this.letters[this.currentLetterIdx];
    if (!letter) return;

    // 1. お手本の薄い文字（ガイド）を描画
    this.ctx.save();
    this.ctx.font = `900 ${h * 0.72}px 'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 182, 193, 0.45)';
    this.ctx.strokeStyle = 'rgba(255, 105, 180, 0.4)';
    this.ctx.lineWidth = 6;
    this.ctx.setLineDash([8, 8]);
    this.ctx.strokeText(letter.char, w / 2, h / 2 + 10);
    this.ctx.fillText(letter.char, w / 2, h / 2 + 10);
    this.ctx.restore();

    // 2. 完了した画を描画（パステルピンク・赤）
    this.drawnStrokes.forEach((strokePoints) => {
      this.drawStrokeCurve(strokePoints, '#ff4757', 28);
    });

    // 3. 現在なぞり中のパスを描画
    if (this.currentStrokePoints.length > 1) {
      this.drawStrokeCurve(this.currentStrokePoints, '#ff9ff3', 28);
    }

    // 4. ガイド番号と次のチェックポイントを描画
    if (!this.isCompleted) {
      letter.strokes.forEach((stroke, sIdx) => {
        if (sIdx < this.currentStrokeIdx) return; // 完了済みの画は番号非表示

        const startPt = stroke[0];
        const isCurrent = (sIdx === this.currentStrokeIdx);

        // 番号バッジ
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(startPt.x * w, startPt.y * h, isCurrent ? 24 : 18, 0, Math.PI * 2);
        this.ctx.fillStyle = isCurrent ? '#ff4757' : '#ced6e0';
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${isCurrent ? 20 : 15}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`①②③④`[sIdx] || (sIdx + 1), startPt.x * w, startPt.y * h);
        this.ctx.restore();

        // 現在の画の場合、次の目標チェックポイントを点滅サークルでガイド
        if (isCurrent && this.currentCheckIdx < stroke.length) {
          const targetPt = stroke[this.currentCheckIdx];
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(targetPt.x * w, targetPt.y * h, 16, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(255, 159, 243, 0.6)';
          this.ctx.strokeStyle = '#ff4757';
          this.ctx.lineWidth = 3;
          this.ctx.stroke();
          this.ctx.fill();
          this.ctx.restore();
        }
      });
    }
  }

  drawStrokeCurve(points, color, width) {
    if (points.length < 2) return;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = 'rgba(255, 107, 129, 0.4)';
    this.ctx.shadowBlur = 10;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }
}
