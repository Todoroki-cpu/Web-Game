/**
 * CountdownTimer - 10秒カウントダウンタイマー管理クラス
 */
class CountdownTimer {
  constructor(app) {
    this.app = app;
    this.badgeEl = document.getElementById('global-timer-badge');
    this.gaugeEl = document.getElementById('global-timer-gauge');
    this.numEl = document.getElementById('global-timer-num');
    this.toggleBtn = document.getElementById('timer-toggle-btn');

    this.enabled = true;
    this.duration = 10;
    this.remaining = 10;
    this.intervalId = null;
    this.onTimeoutCb = null;
    this.isPaused = false;
    this.lastSecond = 10;

    this.initToggle();
  }

  initToggle() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.enabled = !this.enabled;
        window.soundSystem.playPop();
        this.updateToggleBtn();
        if (!this.enabled) {
          this.stop();
          this.hide();
        } else {
          if (this.app.currentView !== 'home') {
            this.start(10, this.onTimeoutCb);
          }
        }
      });
      this.updateToggleBtn();
    }
  }

  updateToggleBtn() {
    if (!this.toggleBtn) return;
    if (this.enabled) {
      this.toggleBtn.textContent = '⏱️ ON';
      this.toggleBtn.classList.remove('off');
    } else {
      this.toggleBtn.textContent = '⏱️ OFF';
      this.toggleBtn.classList.add('off');
    }
  }

  start(seconds = 10, onTimeout = null) {
    this.stop();
    if (!this.enabled || this.app.currentView === 'home') {
      this.hide();
      return;
    }

    this.duration = seconds;
    this.remaining = seconds;
    this.lastSecond = Math.ceil(seconds);
    this.onTimeoutCb = onTimeout;
    this.isPaused = false;

    this.show();
    this.updateUI();

    const startTime = Date.now();
    const totalMs = seconds * 1000;

    this.intervalId = setInterval(() => {
      if (this.isPaused) return;

      const elapsed = Date.now() - startTime;
      this.remaining = Math.max(0, (totalMs - elapsed) / 1000);
      const currentSec = Math.ceil(this.remaining);

      if (currentSec !== this.lastSecond && currentSec > 0) {
        this.lastSecond = currentSec;
        if (currentSec <= 3) {
          window.soundSystem.playTimerWarning();
        } else {
          window.soundSystem.playTimerTick();
        }
      }

      this.updateUI();

      if (this.remaining <= 0) {
        this.stop();
        this.handleTimeout();
      }
    }, 100);
  }

  handleTimeout() {
    if (this.badgeEl) {
      this.badgeEl.classList.add('timeout');
      setTimeout(() => this.badgeEl.classList.remove('timeout'), 800);
    }
    window.soundSystem.playTimeout();

    if (this.onTimeoutCb) {
      this.onTimeoutCb();
    } else {
      this.app.handleDefaultTimeout();
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.badgeEl) {
      this.badgeEl.classList.remove('warning');
    }
  }

  show() {
    if (this.badgeEl && this.enabled) {
      this.badgeEl.style.display = 'flex';
    }
  }

  hide() {
    if (this.badgeEl) {
      this.badgeEl.style.display = 'none';
    }
  }

  updateUI() {
    if (!this.badgeEl) return;
    const pct = Math.max(0, Math.min(100, (this.remaining / this.duration) * 100));
    if (this.gaugeEl) {
      this.gaugeEl.style.width = `${pct}%`;
    }
    const secDisplay = Math.ceil(this.remaining);
    if (this.numEl) {
      this.numEl.textContent = secDisplay;
    }

    if (this.remaining <= 3.05) {
      this.badgeEl.classList.add('warning');
    } else {
      this.badgeEl.classList.remove('warning');
    }
  }
}

class GameApp {
  constructor() {
    this.currentView = 'home';
    this.currentHomeCategory = 'numbers';
    this.particles = new ParticleSystem('effects-canvas');
    this.timer = new CountdownTimer(this);

    // 全18ゲームのインスタンス化
    this.gameCounting = new GameCounting(this);
    this.gameDots = new GameDots(this);
    this.gameBubble = new GameBubble(this);
    this.gameShopping = new GameShopping(this);
    this.gameRocket = new GameRocket(this);
    this.gameTarget = new GameTarget(this);
    this.gameClockDial = new GameClockDial(this);
    this.gameClockMatch = new GameClockMatch(this);
    this.gameWeekTrain = new GameWeekTrain(this);
    this.gameWeekQuiz = new GameWeekQuiz(this);
    this.gameSeasonItems = new GameSeasonItems(this);
    this.gameSeasonWheel = new GameSeasonWheel(this);
    this.gameHiraganaTrace = new GameHiraganaTrace(this);
    this.gameHiraganaKaruta = new GameHiraganaKaruta(this);
    this.gameHiraganaWord = new GameHiraganaWord(this);
    this.gamePrincess = new GamePrincess(this);
    this.gamePrincessDoors = new GamePrincessDoors(this);
    this.gamePrincessRunway = new GamePrincessRunway(this);
    this.gamePrincessPuzzle = new GamePrincessPuzzle(this);

    this.homeCharManager = new CharacterManager('home-character-stage');

    // DOM要素
    this.viewHome = document.getElementById('view-home');
    this.views = {
      counting: document.getElementById('view-game-counting'),
      dots: document.getElementById('view-game-dots'),
      bubble: document.getElementById('view-game-bubble'),
      shopping: document.getElementById('view-game-shopping'),
      rocket: document.getElementById('view-game-rocket'),
      target: document.getElementById('view-game-target'),
      clock_dial: document.getElementById('view-game-clock-dial'),
      clock_match: document.getElementById('view-game-clock-match'),
      week_train: document.getElementById('view-game-week-train'),
      week_quiz: document.getElementById('view-game-week-quiz'),
      season_items: document.getElementById('view-game-season-items'),
      season_wheel: document.getElementById('view-game-season-wheel'),
      hiragana_trace: document.getElementById('view-game-hiragana-trace'),
      hiragana_karuta: document.getElementById('view-game-hiragana-karuta'),
      hiragana_word: document.getElementById('view-game-hiragana-word'),
      princess: document.getElementById('view-game-princess'),
      princess_doors: document.getElementById('view-game-princess-doors'),
      princess_runway: document.getElementById('view-game-princess-runway'),
      princess_puzzle: document.getElementById('view-game-princess-puzzle')
    };

    this.homeBtn = document.getElementById('home-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.stampContainerEl = document.getElementById('stamp-container');
    this.starCountTextEl = document.getElementById('star-count-text');
    this.completeModalEl = document.getElementById('complete-modal');
    this.restartBtn = document.getElementById('restart-btn');
    this.startScreenEl = document.getElementById('start-screen');
    this.startGameBtn = document.getElementById('start-game-btn');

    this.initEvents();
  }

  startTimer(seconds = 10, onTimeout = null) {
    this.timer.start(seconds, onTimeout);
  }

  stopTimer() {
    this.timer.stop();
  }

  handleDefaultTimeout() {
    const activeView = this.views[this.currentView];
    if (activeView) {
      const speech = activeView.querySelector('.speech-container');
      if (speech) {
        speech.classList.add('shake-card');
        setTimeout(() => speech.classList.remove('shake-card'), 500);
      }
    }
    setTimeout(() => {
      if (this.currentView !== 'home') {
        this.timer.start(10);
      }
    }, 1000);
  }

  isCurrentView(viewName) {
    return this.currentView === viewName;
  }

  initEvents() {
    // 初回スタートボタン
    if (this.startGameBtn) {
      this.startGameBtn.addEventListener('click', () => {
        if (this.startScreenEl) {
          this.startScreenEl.classList.add('hidden');
        }
        window.soundSystem.initAudio();
        window.soundSystem.startBgm();
        window.soundSystem.playSparkle();
        this.switchView('home');
      });
    }

    // ホームに戻るボタン
    if (this.homeBtn) {
      this.homeBtn.addEventListener('click', () => {
        window.soundSystem.playPop();
        this.switchView('home');
      });
    }

    // サウンド切り替えボタン
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const isMuted = window.soundSystem.toggleMute();
        this.soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
        this.soundToggleBtn.classList.toggle('muted', isMuted);
      });
    }

    // ホーム画面のカテゴリタブ切り替え
    const tabs = document.querySelectorAll('.cat-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.category;
        this.switchHomeCategory(cat);
      });
    });

    // 15枚のゲーム選択カードのクリックイベント
    const bindCard = (id, voiceKey, viewName) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          window.soundSystem.playSparkle();
          window.soundSystem.playVoice(voiceKey);
          setTimeout(() => this.switchView(viewName), 300);
        });
      }
    };

    bindCard('menu-card-counting', 'game_title_1', 'counting');
    bindCard('menu-card-dots', 'game_title_2', 'dots');
    bindCard('menu-card-bubble', 'game_title_3', 'bubble');
    bindCard('menu-card-shopping', 'game_title_4', 'shopping');
    bindCard('menu-card-rocket', 'game_title_5', 'rocket');
    bindCard('menu-card-target', 'game_title_6', 'target');
    bindCard('menu-card-clock-dial', 'game_title_7', 'clock_dial');
    bindCard('menu-card-clock-match', 'game_title_8', 'clock_match');
    bindCard('menu-card-week-train', 'game_title_9', 'week_train');
    bindCard('menu-card-week-quiz', 'game_title_10', 'week_quiz');
    bindCard('menu-card-season-items', 'game_title_11', 'season_items');
    bindCard('menu-card-season-wheel', 'game_title_12', 'season_wheel');
    bindCard('menu-card-hiragana-trace', 'game_title_13', 'hiragana_trace');
    bindCard('menu-card-hiragana-karuta', 'game_title_14', 'hiragana_karuta');
    bindCard('menu-card-hiragana-word', 'game_title_15', 'hiragana_word');
    bindCard('menu-card-princess', 'praise_kitty_1', 'princess');
    bindCard('menu-card-princess-doors', 'praise_kitty_1', 'princess_doors');
    bindCard('menu-card-princess-runway', 'praise_kitty_2', 'princess_runway');
    bindCard('menu-card-princess-puzzle', 'praise_kitty_3', 'princess_puzzle');

    // もう1回遊ぶボタン
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        window.soundSystem.playSparkle();
        this.hideCompleteModal();
        const v = this.currentView;
        if (v === 'counting') this.gameCounting.start();
        else if (v === 'dots') this.gameDots.start();
        else if (v === 'bubble') this.gameBubble.start();
        else if (v === 'shopping') this.gameShopping.start();
        else if (v === 'rocket') this.gameRocket.start();
        else if (v === 'target') this.gameTarget.start();
        else if (v === 'clock_dial') this.gameClockDial.start();
        else if (v === 'clock_match') this.gameClockMatch.start();
        else if (v === 'week_train') this.gameWeekTrain.start();
        else if (v === 'week_quiz') this.gameWeekQuiz.start();
        else if (v === 'season_items') this.gameSeasonItems.start();
        else if (v === 'season_wheel') this.gameSeasonWheel.start();
        else if (v === 'hiragana_trace') this.gameHiraganaTrace.start();
        else if (v === 'hiragana_karuta') this.gameHiraganaKaruta.start();
        else if (v === 'hiragana_word') this.gameHiraganaWord.start();
        else if (v === 'princess') this.gamePrincess.start();
        else if (v === 'princess_doors') this.gamePrincessDoors.start();
        else if (v === 'princess_runway') this.gamePrincessRunway.start();
        else if (v === 'princess_puzzle') this.gamePrincessPuzzle.start();
        else this.switchView('home');
      });
    }
  }

  switchHomeCategory(categoryName) {
    this.currentHomeCategory = categoryName;
    window.soundSystem.playPop();

    // タブのアクティブ状態
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === categoryName);
    });

    // カテゴリパネルの表示
    document.querySelectorAll('.home-cat-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `cat-panel-${categoryName}`);
    });

    // カテゴリ案内ボイス ＆ キャラクター切り替え
    const catVoices = {
      numbers: 'cat_numbers',
      hiragana: 'cat_hiragana',
      clock: 'cat_clock',
      days: 'cat_days',
      seasons: 'cat_seasons',
      princess: 'praise_kitty_2'
    };
    if (catVoices[categoryName]) {
      window.soundSystem.playVoice(catVoices[categoryName]);
    }

    if (categoryName === 'princess') {
      this.homeCharManager.setCharacter('kitty');
    } else if (categoryName === 'hiragana') {
      this.homeCharManager.setCharacter('cinna');
    } else if (categoryName === 'clock') {
      this.homeCharManager.setCharacter('shokupan');
    } else if (categoryName === 'days') {
      this.homeCharManager.setCharacter('baikin');
    } else if (categoryName === 'seasons') {
      this.homeCharManager.setCharacter('melonpan');
    } else {
      this.homeCharManager.setCharacter('anpan');
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.hideCompleteModal();
    if (this.gamePrincess) this.gamePrincess.stop();

    // 全ビューを非表示
    if (this.viewHome) this.viewHome.classList.remove('active');
    Object.values(this.views).forEach(v => { if (v) v.classList.remove('active'); });

    if (viewName === 'home') {
      this.timer.stop();
      this.timer.hide();
      this.viewHome.classList.add('active');
      this.homeBtn.style.display = 'none';
      this.updateStamps(0, 5);
      this.switchHomeCategory(this.currentHomeCategory);
      window.soundSystem.startNormalBgm();
    } else {
      this.homeBtn.style.display = 'flex';
      const targetViewEl = this.views[viewName];
      if (targetViewEl) targetViewEl.classList.add('active');

      if (viewName === 'counting') this.gameCounting.start();
      else if (viewName === 'dots') {
        setTimeout(() => this.gameDots.initCanvas(), 100);
        this.gameDots.start();
      }
      else if (viewName === 'bubble') this.gameBubble.start();
      else if (viewName === 'shopping') this.gameShopping.start();
      else if (viewName === 'rocket') this.gameRocket.start();
      else if (viewName === 'target') this.gameTarget.start();
      else if (viewName === 'clock_dial') this.gameClockDial.start();
      else if (viewName === 'clock_match') this.gameClockMatch.start();
      else if (viewName === 'week_train') this.gameWeekTrain.start();
      else if (viewName === 'week_quiz') this.gameWeekQuiz.start();
      else if (viewName === 'season_items') this.gameSeasonItems.start();
      else if (viewName === 'season_wheel') this.gameSeasonWheel.start();
      else if (viewName === 'hiragana_trace') {
        setTimeout(() => this.gameHiraganaTrace.initCanvasSize(), 100);
        this.gameHiraganaTrace.start();
      }
      else if (viewName === 'hiragana_karuta') this.gameHiraganaKaruta.start();
      else if (viewName === 'hiragana_word') this.gameHiraganaWord.start();
      else if (viewName === 'princess') this.gamePrincess.start();
      else if (viewName === 'princess_doors') this.gamePrincessDoors.start();
      else if (viewName === 'princess_runway') this.gamePrincessRunway.start();
      else if (viewName === 'princess_puzzle') this.gamePrincessPuzzle.start();
    }
  }

  updateStamps(earned, max = 5) {
    if (!this.stampContainerEl) return;
    this.stampContainerEl.innerHTML = '';
    for (let i = 0; i < max; i++) {
      const slot = document.createElement('div');
      slot.className = 'stamp-slot' + (i < earned ? ' earned' : '');
      slot.innerHTML = '⭐';
      this.stampContainerEl.appendChild(slot);
    }
    if (this.starCountTextEl) {
      this.starCountTextEl.textContent = `${earned} / ${max}`;
    }
  }

  showCompleteModal() {
    this.timer.stop();
    this.timer.hide();
    if (this.completeModalEl) {
      this.completeModalEl.classList.add('show');
      window.soundSystem.playFanfare();
      this.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 120);
      window.soundSystem.playVoice('all_clear');
    }
  }

  hideCompleteModal() {
    if (this.completeModalEl) {
      this.completeModalEl.classList.remove('show');
    }
  }
}

// アプリケーション起動
window.addEventListener('DOMContentLoaded', () => {
  window.app = new GameApp();
});
