/**
 * game_princess_runway.js - プリンセス・ファッションショー (Princess Runway Fashion Show)
 * 自分でコーディネートしたお姫様がライトきらめくランウェイをウォーキング！
 * 3つのポーズスポットでシャッターを押して撮影！3人の妖精審査員から300点満点＆表紙カードを獲得！
 */

class GamePrincessRunway {
  constructor(app) {
    this.app = app;
    this.stageIndex = 0;
    this.maxStages = 5;
    this.currentStep = 0; // 0: walking to pos1, 1: pos1 pose, 2: walking to pos2, 3: pos2 pose, 4: walking to pos3, 5: pos3 pose, 6: result
    this.isInputLocked = false;
    this.capturedShots = [];

    // 5つのファッションショーステージ
    this.themes = [
      { id: 'rose', name: '🌹 ロイヤルローズ・ガーデン', bg: 'linear-gradient(180deg, #ff758c 0%, #ff7eb3 50%, #7bed9f 100%)', carpet: '#ff4757', tag: 'ROSE SPECIAL' },
      { id: 'snow', name: '❄️ クリスタル・スノークイーン', bg: 'linear-gradient(180deg, #0984e3 0%, #74b9ff 60%, #dfe4ea 100%)', carpet: '#00d2d3', tag: 'WINTER QUEEN' },
      { id: 'star', name: '🌌 ミッドナイト・スターダスト', bg: 'linear-gradient(180deg, #0c102b 0%, #2c3e50 60%, #fd79a8 100%)', carpet: '#9b59b6', tag: 'STARRY NIGHT' },
      { id: 'fairy', name: '🧚 妖精の森のフラワーカーニバル', bg: 'linear-gradient(180deg, #2ed573 0%, #7bed9f 60%, #ffeaa7 100%)', carpet: '#20bf6b', tag: 'FAIRY MAGIC' },
      { id: 'palace', name: '👑 グランドフィナーレ・ロイヤルパレス', bg: 'linear-gradient(180deg, #1e272e 0%, #485460 50%, #f1c40f 100%)', carpet: '#e84118', tag: 'GRAND FINALE' }
    ];

    this.poses = [
      { step: 1, title: '💖 えがおで てをふって！', tip: 'シャッターを押してパシャリ！', fairy: 'かわいい笑顔！ 🌟100点！' },
      { step: 3, title: '🪄 まほうのステッキをかかげて！', tip: 'キラキラ魔法ポーズ！', fairy: '息をのむ美しさ！ 💖100点！' },
      { step: 5, title: '👑 とっておきのプリンセス・ターン！', tip: '最高のフィナーレポーズ！', fairy: 'パーフェクト！ 👑100点！' }
    ];

    this.initDOM();
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess-runway');
  }

  start() {
    this.stageIndex = 0;
    this.app.updateStamps(0, this.maxStages);
    window.soundSystem.startPrincessBgm();
    this.renderStage();
    this.startThemeShow(0);
  }

  renderStage() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="runway-game-layout">
        <!-- 上部：テーマ案内・案内アナウンス -->
        <div class="runway-header-bar">
          <div class="runway-theme-badge" id="runway-theme-badge">
            <span class="theme-icon">👑</span>
            <span class="theme-title" id="runway-theme-title">ロイヤルローズ・ガーデン</span>
          </div>
          <div class="runway-prompt-box" id="runway-prompt-box">
            <span class="runway-prompt-text" id="runway-prompt-text">ランウェイが はじまるよ！</span>
          </div>
          <div class="runway-shutter-container">
            <button class="runway-shutter-btn" id="runway-shutter-btn" disabled>
              📸 パシャリ！
            </button>
          </div>
        </div>

        <!-- 中央：3Dランウェイスクリーン -->
        <div class="runway-stage-scene" id="runway-stage-scene">
          <!-- 背景ライティング＆スポットライト -->
          <div class="runway-lighting-layer" id="runway-lighting-layer">
            <div class="runway-spotlight spot-left"></div>
            <div class="runway-spotlight spot-center"></div>
            <div class="runway-spotlight spot-right"></div>
          </div>

          <!-- ランウェイキャットウォーク（遠近パース） -->
          <div class="runway-catwalk-3d" id="runway-catwalk-3d">
            <div class="runway-carpet-lane" id="runway-carpet-lane"></div>
            <!-- オーディエンス観客シルエット -->
            <div class="runway-audience audience-left">
              <span class="audience-cheer">💖 ✨ 👏 🌟</span>
            </div>
            <div class="runway-audience audience-right">
              <span class="audience-cheer">🌟 👏 ✨ 💖</span>
            </div>
          </div>

          <!-- ランウェイを歩くプリンセスモデル -->
          <div class="runway-model-stage" id="runway-model-stage">
            <div class="runway-model-wrapper" id="runway-model-wrapper">
              ${this.app.gamePrincess ? this.app.gamePrincess.getDollSvgHtml() : ''}
            </div>
          </div>

          <!-- フラッシュエフェクト用オーバーレイ -->
          <div class="runway-flash-screen" id="runway-flash-screen"></div>

          <!-- 妖精審査員スコア表示 -->
          <div class="runway-judges-bar" id="runway-judges-bar">
            <div class="judge-box" id="judge-1"><span class="judge-icon">🧚‍♀️</span><span class="judge-score">🌟 100</span></div>
            <div class="judge-box" id="judge-2"><span class="judge-icon">🧚‍♂️</span><span class="judge-score">💖 100</span></div>
            <div class="judge-box" id="judge-3"><span class="judge-icon">🧚</span><span class="judge-score">👑 100</span></div>
          </div>
        </div>

        <!-- 雑誌カバー・記念カードモーダル -->
        <div class="runway-magazine-modal" id="runway-magazine-modal">
          <div class="magazine-cover-card pop-in">
            <div class="magazine-header">
              <span class="mag-logo">✨ ROYAL PRINCESS VOGUE ✨</span>
              <span class="mag-issue" id="mag-issue-text">SPECIAL EDITION</span>
            </div>
            <div class="magazine-photo-box" id="magazine-photo-box">
              <div class="magazine-doll-preview" id="magazine-doll-preview"></div>
              <div class="magazine-score-badge">👑 300点 満点！</div>
            </div>
            <div class="magazine-footer">
              <h3 class="mag-headline" id="mag-headline-text">奇跡のプリンセス 誕生！</h3>
              <p class="mag-subtext" id="mag-subtext-text">会場中を魅了する最高のランウェイショー</p>
              <button class="primary-btn" id="runway-next-theme-btn">💖 つぎのステージへ！</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // シャッターボタン
    const shutterBtn = document.getElementById('runway-shutter-btn');
    if (shutterBtn) {
      shutterBtn.addEventListener('click', () => {
        this.triggerShutter();
      });
    }

    // 次のテーマボタン
    const nextBtn = document.getElementById('runway-next-theme-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const modal = document.getElementById('runway-magazine-modal');
        if (modal) modal.classList.remove('show');
        this.stageIndex++;
        if (this.stageIndex >= this.maxStages) {
          this.handleAllShowsComplete();
        } else {
          this.startThemeShow(this.stageIndex);
        }
      });
    }
  }

  startThemeShow(index) {
    const theme = this.themes[index] || this.themes[0];
    this.currentStep = 0;
    this.capturedShots = [];
    this.isInputLocked = false;
    this.app.updateStamps(index, this.maxStages);

    // 背景色とテーマ表示
    const titleEl = document.getElementById('runway-theme-title');
    if (titleEl) titleEl.textContent = theme.name;

    const sceneEl = document.getElementById('runway-stage-scene');
    if (sceneEl) sceneEl.style.background = theme.bg;

    const carpetEl = document.getElementById('runway-carpet-lane');
    if (carpetEl) carpetEl.style.backgroundColor = theme.carpet;

    // 審査員リセット
    const judgesBar = document.getElementById('runway-judges-bar');
    if (judgesBar) judgesBar.classList.remove('show');
    document.querySelectorAll('.judge-box').forEach(j => j.classList.remove('scored'));

    // シャッター無効化
    this.setShutterEnabled(false);

    // プリンセスをステージ奥に初期配置
    const model = document.getElementById('runway-model-wrapper');
    if (model) {
      model.style.transition = 'none';
      model.style.transform = 'translate(-50%, -50%) translate3d(0, -110px, -200px) scale(0.45)';
      model.classList.remove('waving', 'magic-pose', 'curtsey-pose');
    }

    // アナウンス
    this.updatePrompt(`👑 テーマ: ${theme.name}！ スタート！`, true);
    window.soundSystem.playFanfare();

    setTimeout(() => {
      this.walkToNextPoseSpot(1);
    }, 1200);
  }

  walkToNextPoseSpot(targetPoseIndex) {
    const model = document.getElementById('runway-model-wrapper');
    if (!model) return;

    model.classList.add('runway-walking');

    let targetTransform = '';
    let duration = 1400;

    if (targetPoseIndex === 1) {
      // ポーズ1: 奥から中奥へ
      targetTransform = 'translate(-50%, -50%) translate3d(0, -50px, -100px) scale(0.65)';
      this.updatePrompt('🚶‍♀️ ランウェイを優雅にウォーキング中...', false);
    } else if (targetPoseIndex === 2) {
      // ポーズ2: 中奥から中央へ
      targetTransform = 'translate(-50%, -50%) translate3d(0, 10px, 0px) scale(0.85)';
      this.updatePrompt('🚶‍♀️ スポットライトに向かって前進...', false);
    } else if (targetPoseIndex === 3) {
      // ポーズ3: 中央からフロント最前列へ！
      targetTransform = 'translate(-50%, -50%) translate3d(0, 70px, 80px) scale(1.08)';
      this.updatePrompt('🚶‍♀️ フィナーレのセンタースポットへ！', false);
    }

    model.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    model.style.transform = targetTransform;

    setTimeout(() => {
      model.classList.remove('runway-walking');
      this.reachPoseSpot(targetPoseIndex);
    }, duration);
  }

  reachPoseSpot(poseIdx) {
    const poseMeta = this.poses[poseIdx - 1];
    const model = document.getElementById('runway-model-wrapper');
    if (!model || !poseMeta) return;

    window.soundSystem.playSparkle();

    if (poseIdx === 1) {
      model.classList.add('waving');
    } else if (poseIdx === 2) {
      model.classList.add('magic-pose');
    } else if (poseIdx === 3) {
      model.classList.add('curtsey-pose');
    }

    this.updatePrompt(`${poseMeta.title} 📸 シャッターを押そう！`, true);
    this.setShutterEnabled(true);
  }

  triggerShutter() {
    if (this.isInputLocked) return;
    this.isInputLocked = true;
    this.setShutterEnabled(false);

    // シャッター音＆フラッシュ
    window.soundSystem.playCameraShutter();
    window.soundSystem.playCheerCrowd();

    const flash = document.getElementById('runway-flash-screen');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 350);
    }

    // パーティクル歓声
    const scene = document.getElementById('runway-stage-scene');
    if (scene) {
      const rect = scene.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    }

    const currentPoseIdx = Math.floor(this.capturedShots.length) + 1;
    this.capturedShots.push(currentPoseIdx);

    // 審査員スコア表示
    const judgeEl = document.getElementById(`judge-${currentPoseIdx}`);
    if (judgeEl) {
      judgeEl.classList.add('scored');
    }
    const judgesBar = document.getElementById('runway-judges-bar');
    if (judgesBar) judgesBar.classList.add('show');

    const poseMeta = this.poses[currentPoseIdx - 1];
    this.updatePrompt(`✨ ${poseMeta.fairy}`, true);

    const model = document.getElementById('runway-model-wrapper');

    setTimeout(() => {
      if (model) model.classList.remove('waving', 'magic-pose', 'curtsey-pose');
      this.isInputLocked = false;

      if (currentPoseIdx < 3) {
        this.walkToNextPoseSpot(currentPoseIdx + 1);
      } else {
        // 3ポーズ完了 -> 審査発表＆雑誌カバー
        this.showFinalEvaluation();
      }
    }, 1500);
  }

  setShutterEnabled(enabled) {
    const btn = document.getElementById('runway-shutter-btn');
    if (btn) {
      btn.disabled = !enabled;
      btn.classList.toggle('active-pulse', enabled);
    }
  }

  updatePrompt(text, highlight = false) {
    const promptEl = document.getElementById('runway-prompt-text');
    const promptBox = document.getElementById('runway-prompt-box');
    if (promptEl) {
      promptEl.innerHTML = text;
    }
    if (promptBox && highlight) {
      promptBox.classList.add('pop-in');
      setTimeout(() => promptBox.classList.remove('pop-in'), 300);
    }
  }

  showFinalEvaluation() {
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 100);

    const theme = this.themes[this.stageIndex] || this.themes[0];
    this.updatePrompt(`🎉 300点 満点！ 表紙モデルに決定！ 🎉`, true);

    setTimeout(() => {
      const modal = document.getElementById('runway-magazine-modal');
      const issueEl = document.getElementById('mag-issue-text');
      const previewEl = document.getElementById('magazine-doll-preview');
      const headlineEl = document.getElementById('mag-headline-text');
      const subtextEl = document.getElementById('mag-subtext-text');

      if (issueEl) issueEl.textContent = `★ ${theme.tag} ★`;
      if (headlineEl) headlineEl.textContent = `👑 ${theme.name} 👑`;
      if (subtextEl) subtextEl.textContent = `満場一致の300点パーフェクト！ 最高の輝きを放ちました！`;

      if (previewEl && this.app.gamePrincess) {
        previewEl.innerHTML = `
          <div class="doll-clone-preview" style="position: relative; width: 160px; height: 220px; margin: 0 auto;">
            ${this.app.gamePrincess.getDollSvgHtml()}
          </div>
        `;
      }

      this.app.updateStamps(this.stageIndex + 1, this.maxStages);

      if (modal) {
        modal.classList.add('show');
      }
    }, 1200);
  }

  handleAllShowsComplete() {
    this.app.updateStamps(this.maxStages, this.maxStages);
    window.soundSystem.playFanfare();
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 140);
    setTimeout(() => {
      this.app.showCompleteModal();
    }, 800);
  }
}

window.GamePrincessRunway = GamePrincessRunway;
