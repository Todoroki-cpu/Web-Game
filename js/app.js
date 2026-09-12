/**
 * app.js - メインアプリケーション管理 ＆ 全12ゲームルーティング
 */

class GameApp {
  constructor() {
    this.currentView = 'home';
    this.currentHomeCategory = 'numbers';
    this.particles = new ParticleSystem('effects-canvas');

    // 全12ゲームのインスタンス化
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
      season_wheel: document.getElementById('view-game-season-wheel')
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

    // 12枚のゲーム選択カードのクリックイベント
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

    // カテゴリ案内ボイス
    const catVoices = {
      numbers: 'cat_numbers',
      clock: 'cat_clock',
      days: 'cat_days',
      seasons: 'cat_seasons'
    };
    if (catVoices[categoryName]) {
      window.soundSystem.playVoice(catVoices[categoryName]);
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.hideCompleteModal();

    // 全ビューを非表示
    if (this.viewHome) this.viewHome.classList.remove('active');
    Object.values(this.views).forEach(v => { if (v) v.classList.remove('active'); });

    if (viewName === 'home') {
      this.viewHome.classList.add('active');
      this.homeBtn.style.display = 'none';
      this.updateStamps(0, 5);
      this.homeCharManager.setCharacter('anpan');
      this.homeCharManager.setState('talking');
      setTimeout(() => {
        window.soundSystem.playVoice('home_select');
        setTimeout(() => this.homeCharManager.setState('idle'), 2000);
      }, 300);
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
