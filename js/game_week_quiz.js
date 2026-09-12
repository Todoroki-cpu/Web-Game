/**
 * game_week_quiz.js - ゲーム10: おたのしみカレンダー！ことばあそびクイズ（曜日の特徴）
 */

class GameWeekQuiz {
  constructor(app) {
    this.app = app;
    this.speechTextEl = document.getElementById('week-quiz-speech-text');
    this.questionCardEl = document.getElementById('week-quiz-card');
    this.buttonsGridEl = document.getElementById('week-quiz-buttons-grid');
    this.speechBubble = document.getElementById('week-quiz-speech-bubble');

    this.charManager = new CharacterManager('week-quiz-character-stage');

    this.stars = 0;
    this.maxStars = 4;
    this.isCleared = false;
    this.isLocked = false;

    this.quizzes = [
      { day: '水ようび', key: 'wed', hint: 'すいぞくかんに いくのは なにようび？🐬', icon: '🐬 🌊', voice: 'day_wed' },
      { day: '金ようび', key: 'fri', hint: 'きんピカメダルを もらえるのは なにようび？🥇', icon: '🥇 ✨', voice: 'day_fri' },
      { day: '日ようび', key: 'sun', hint: 'おひさまピクニックに いくのは なにようび？☀️', icon: '☀️ 🧺', voice: 'day_sun' },
      { day: '月ようび', key: 'mon', hint: 'おつきさまを みあげるのは なにようび？🌙', icon: '🌙 🔭', voice: 'day_mon' },
      { day: '木ようび', key: 'thu', hint: 'もくもくツリーハウスで あそぶのは なにようび？🌳', icon: '🌳 🪵', voice: 'day_thu' },
      { day: '火ようび', key: 'tue', hint: 'あかい ほのおが メラメラなのは なにようび？🔥', icon: '🔥 🪵', voice: 'day_tue' },
      { day: '土ようび', key: 'sat', hint: 'どろんこあそびを するのは なにようび？🏖️', icon: '🏖️ 🏰', voice: 'day_sat' }
    ];
    this.quizIdx = 0;

    this.daysList = [
      { name: '月ようび', color: '#e74c3c' },
      { name: '火ようび', color: '#e67e22' },
      { name: '水ようび', color: '#3498db' },
      { name: '木ようび', color: '#2ecc71' },
      { name: '金ようび', color: '#f1c40f' },
      { name: '土ようび', color: '#9b59b6' },
      { name: '日ようび', color: '#e84393' }
    ];

    this.initEvents();
  }

  initEvents() {
    if (this.speechBubble) {
      this.speechBubble.addEventListener('click', () => {
        if (this.isCleared || !this.app.isCurrentView('week_quiz')) return;
        window.soundSystem.playPop();
        window.soundSystem.playVoice('week_quiz_prompt');
      });
    }
  }

  start() {
    this.stars = 0;
    this.quizIdx = 0;
    this.app.updateStamps(this.stars, this.maxStars);
    this.nextRound();
  }

  nextRound() {
    this.isCleared = false;
    this.isLocked = false;

    this.charManager.setCharacter('shokupan');
    this.charManager.setState('idle');

    const q = this.quizzes[this.quizIdx % this.quizzes.length];

    this.speechTextEl.innerHTML = q.hint;
    this.questionCardEl.innerHTML = `
      <div class="quiz-hint-icon">${q.icon}</div>
      <div class="quiz-hint-sub">ことばの ヒントを かんがえてね！</div>
    `;

    this.renderButtons(q.day);

    setTimeout(() => {
      if (!this.app.isCurrentView('week_quiz')) return;
      window.soundSystem.playVoice('week_quiz_prompt');
    }, 400);
  }

  renderButtons(correctDay) {
    if (!this.buttonsGridEl) return;
    this.buttonsGridEl.innerHTML = '';

    this.daysList.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'week-quiz-day-btn pop-in';
      btn.style.borderLeftColor = item.color;
      btn.innerHTML = `<span class="btn-day-label">${item.name}</span>`;

      btn.addEventListener('pointerdown', (e) => {
        if (this.isCleared || this.isLocked || !this.app.isCurrentView('week_quiz')) return;
        e.preventDefault();
        this.handleAnswer(item.name, correctDay, btn);
      });

      this.buttonsGridEl.appendChild(btn);
    });
  }

  handleAnswer(selected, correct, element) {
    if (selected === correct) {
      // 正解！
      this.isCleared = true;
      this.isLocked = true;

      element.classList.add('correct-answer');
      window.soundSystem.playStamp();

      // カレンダーにスタンプが押される
      this.questionCardEl.innerHTML += `
        <div class="calendar-flower-stamp pop-in">🌸 たいへんよくできました！</div>
      `;

      setTimeout(() => {
        this.charManager.setState('celebrate');
        window.soundSystem.playFanfare();
        window.soundSystem.playVoice('week_quiz_good');

        const rect = element.getBoundingClientRect();
        this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 75);

        this.stars++;
        window.soundSystem.playSparkle();
        this.app.updateStamps(this.stars, this.maxStars);

        setTimeout(() => {
          if (!this.app.isCurrentView('week_quiz')) return;
          this.quizIdx++;
          if (this.stars >= this.maxStars) {
            this.app.showCompleteModal();
          } else {
            this.nextRound();
          }
        }, 3400);

      }, 600);

    } else {
      // 不正解
      window.soundSystem.playPop();
      element.classList.add('shake');
      setTimeout(() => element.classList.remove('shake'), 400);
    }
  }
}

window.GameWeekQuiz = GameWeekQuiz;
