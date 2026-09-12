/**
 * game_princess.js - 3Dプリンセス着せ替えゲーム (Royal Princess 3D Dress-up)
 * 8カテゴリ × 各10種類（計80アイテム）、360度3D回転ステージ、写真撮影、優雅なロイヤルワルツBGM
 */

class GamePrincess {
  constructor(app) {
    this.app = app;
    this.currentCategory = 'dress';
    this.rotationAngle = 0;
    this.isAutoSpinning = false;
    this.isDragging = false;
    this.startX = 0;
    this.startAngle = 0;
    this.spinAnimId = null;

    // 現在着用中のアイテムID
    this.selected = {
      hair: 'hair_1',
      dress: 'dress_1',
      headwear: 'head_1',
      makeup: 'makeup_1',
      jewelry: 'jewel_1',
      props: 'prop_1',
      shoes: 'shoe_1',
      stage: 'stage_1'
    };

    this.initItemDatabase();
    this.initDOM();
  }

  initItemDatabase() {
    this.categories = [
      { id: 'dress', name: '👗 ドレス', icon: '👗' },
      { id: 'hair', name: '👸 かみがた', icon: '👸' },
      { id: 'headwear', name: '👑 ティアラ', icon: '👑' },
      { id: 'makeup', name: '✨ メイク', icon: '✨' },
      { id: 'jewelry', name: '💎 ジュエリー', icon: '💎' },
      { id: 'props', name: '🪄 アイテム', icon: '🪄' },
      { id: 'shoes', name: '👠 くつ', icon: '👠' },
      { id: 'stage', name: '🏰 ステージ', icon: '🏰' }
    ];

    this.database = {
      // 1. 髪型・ヘアスタイル (10種)
      hair: [
        { id: 'hair_1', name: 'ロイヤルゴールデン', color: '#f6e58d', shadow: '#e1b12c', type: 'royal_wave', desc: '気品ある金髪ウェーブ' },
        { id: 'hair_2', name: 'パステルピンクツイン', color: '#ffc5d3', shadow: '#ff8da1', type: 'twin_roll', desc: 'お姫様ふんわりロール' },
        { id: 'hair_3', name: 'クリスタルシルバー', color: '#f1f2f6', shadow: '#a4b0be', type: 'high_pony', desc: '透き通る銀髪ポニー' },
        { id: 'hair_4', name: 'オーロララベンダー', color: '#e0c3fc', shadow: '#9b59b6', type: 'half_up', desc: '幻想的な編み込み' },
        { id: 'hair_5', name: 'エレガントローズ', color: '#ff7675', shadow: '#d63031', type: 'rose_up', desc: '優雅なアップスタイル' },
        { id: 'hair_6', name: 'ミルキーミントボブ', color: '#a8ff78', shadow: '#78e08f', type: 'soft_bob', desc: '可憐なゆるふわボブ' },
        { id: 'hair_7', name: 'ルビーレッドサイド', color: '#eb4d4b', shadow: '#b33939', type: 'side_braid', desc: '情熱のサイドテール' },
        { id: 'hair_8', name: 'スターライトシフォン', color: '#fff9db', shadow: '#ffeaa7', type: 'starlight_long', desc: '星屑ストレートロング' },
        { id: 'hair_9', name: 'ショコラクラシカル', color: '#8d6e63', shadow: '#4e342e', type: 'crown_braid', desc: '王族の三つ編み' },
        { id: 'hair_10', name: 'フェアリーショート', color: '#fbc531', shadow: '#e1b12c', type: 'fairy_short', desc: '軽やかな妖精ショート' }
      ],

      // 2. ドレス・衣装 (10種)
      dress: [
        { id: 'dress_1', name: 'シンデレラクリスタル', mainColor: '#70a1ff', subColor: '#1e90ff', glow: '#a4b0be', type: 'cinderella_gown' },
        { id: 'dress_2', name: 'ロイヤルローズピンク', mainColor: '#ff7597', subColor: '#ff4757', glow: '#ffb8b8', type: 'rose_frill' },
        { id: 'dress_3', name: 'スターダストネイビー', mainColor: '#2f3542', subColor: '#57606f', glow: '#feca57', type: 'midnight_star' },
        { id: 'dress_4', name: 'フラワーフェアリー', mainColor: '#55efc4', subColor: '#00b894', glow: '#ffeaa7', type: 'fairy_chiffon' },
        { id: 'dress_5', name: 'オーロラマーメイド', mainColor: '#00cec9', subColor: '#0984e3', glow: '#81ecec', type: 'aurora_mermaid' },
        { id: 'dress_6', name: 'サンライトゴールド', mainColor: '#f1c40f', subColor: '#e67e22', glow: '#ffeaa7', type: 'sunlight_ball' },
        { id: 'dress_7', name: 'スノークイーンホワイト', mainColor: '#ffffff', subColor: '#74b9ff', glow: '#dfe4ea', type: 'snow_frost' },
        { id: 'dress_8', name: 'スイートストロベリー', mainColor: '#ff6b81', subColor: '#ff4757', glow: '#ffffff', type: 'sweet_lolita' },
        { id: 'dress_9', name: 'トワイライトマジック', mainColor: '#9b59b6', subColor: '#8e44ad', glow: '#e0c3fc', type: 'twilight_gown' },
        { id: 'dress_10', name: 'クラシカルルビー', mainColor: '#c0392b', subColor: '#78281f', glow: '#f39c12', type: 'velvet_ruby' }
      ],

      // 3. ティアラ・頭飾り (10種)
      headwear: [
        { id: 'head_1', name: 'ダイヤモンドティアラ', icon: '👑', color: '#74b9ff', gem: '💎' },
        { id: 'head_2', name: 'ローズフラワークラウン', icon: '🌸', color: '#ff7675', gem: '🌹' },
        { id: 'head_3', name: 'バタフライカチューシャ', icon: '🦋', color: '#a29bfe', gem: '✨' },
        { id: 'head_4', name: '星屑のゴールドティアラ', icon: '⭐', color: '#f1c40f', gem: '🌟' },
        { id: 'head_5', name: 'パール＆レースリボン', icon: '🎀', color: '#ffffff', gem: '⚪' },
        { id: 'head_6', name: '氷の結晶クラウン', icon: '❄️', color: '#81ecec', gem: '💠' },
        { id: 'head_7', name: 'ビッグサテンリボン', icon: '🎀', color: '#ff4757', gem: '💖' },
        { id: 'head_8', name: '妖精フェザーコーム', icon: '🪶', color: '#dfe4ea', gem: '🪶' },
        { id: 'head_9', name: '月桂樹ゴールド冠', icon: '🌿', color: '#e67e22', gem: '🍂' },
        { id: 'head_10', name: 'キャットジュエル耳', icon: '🐱', color: '#fd79a8', gem: '💎' }
      ],

      // 4. アイ＆メイク・表情 (10種)
      makeup: [
        { id: 'makeup_1', name: 'サファイアブルーの瞳', eyeColor: '#0984e3', blush: '#ffb8b8', lip: '#ff7675', mood: 'smile' },
        { id: 'makeup_2', name: 'エメラルド＆ウインク', eyeColor: '#00b894', blush: '#ffb8b8', lip: '#ff4757', mood: 'wink' },
        { id: 'makeup_3', name: 'ルビーピンク＆きらめき', eyeColor: '#e84393', blush: '#ff7597', lip: '#e84393', mood: 'sparkle' },
        { id: 'makeup_4', name: 'アメジストパープル', eyeColor: '#6c5ce7', blush: '#e0c3fc', lip: '#b83b5e', mood: 'elegant' },
        { id: 'makeup_5', name: 'アンバーゴールド', eyeColor: '#f39c12', blush: '#ffeaa7', lip: '#e67e22', mood: 'happy' },
        { id: 'makeup_6', name: 'オッドアイ（青＆金）', eyeColor: 'oddeye', blush: '#ffb8b8', lip: '#ff6b81', mood: 'mystic' },
        { id: 'makeup_7', name: 'トゥインクルハート', eyeColor: '#fd79a8', blush: '#fd79a8', lip: '#ff4757', mood: 'heart' },
        { id: 'makeup_8', name: 'スモーキーローズ', eyeColor: '#2d3436', blush: '#d63031', lip: '#c0392b', mood: 'chic' },
        { id: 'makeup_9', name: 'フェアリーラメペイント', eyeColor: '#00cec9', blush: '#ffeaa7', lip: '#fab1a0', mood: 'fairy' },
        { id: 'makeup_10', name: 'キャットアイライン', eyeColor: '#6ab04c', blush: '#ff7675', lip: '#eb4d4b', mood: 'cat' }
      ],

      // 5. ジュエリー＆羽・小物 (10種)
      jewelry: [
        { id: 'jewel_1', name: 'ロイヤルパールチョーカー', icon: '📿', type: 'pearl_choker', color: '#ffffff' },
        { id: 'jewel_2', name: 'ドロップダイヤネックレス', icon: '💎', type: 'diamond_pendant', color: '#74b9ff' },
        { id: 'jewel_3', name: '光る妖精の羽', icon: '🧚', type: 'fairy_wings', color: '#55efc4' },
        { id: 'jewel_4', name: '純白の天使の羽', icon: '🪽', type: 'angel_wings', color: '#ffffff' },
        { id: 'jewel_5', name: 'サテンロング手袋', icon: '🧤', type: 'satin_gloves', color: '#dfe4ea' },
        { id: 'jewel_6', name: 'レースカフスブレス', icon: '💍', type: 'lace_cuffs', color: '#ffb8b8' },
        { id: 'jewel_7', name: '光のバタフライオーラ', icon: '✨', type: 'butterfly_aura', color: '#a29bfe' },
        { id: 'jewel_8', name: 'ハートジュエルペンダント', icon: '💖', type: 'heart_ruby', color: '#ff4757' },
        { id: 'jewel_9', name: 'シフォンショール', icon: '🧣', type: 'silk_shawl', color: '#ffeaa7' },
        { id: 'jewel_10', name: 'クリスタルリボンピアス', icon: '🎀', type: 'ribbon_earring', color: '#fd79a8' }
      ],

      // 6. 手持ちアイテム・ステッキ＆ブーケ (10種)
      props: [
        { id: 'prop_1', name: '星のまほうステッキ', icon: '🪄', type: 'star_wand', color: '#f1c40f' },
        { id: 'prop_2', name: 'ロイヤルローズブーケ', icon: '💐', type: 'rose_bouquet', color: '#ff4757' },
        { id: 'prop_3', name: 'アンティークレース扇子', icon: '🪭', type: 'lace_fan', color: '#ffffff' },
        { id: 'prop_4', name: 'クリスタルランタン', icon: '🏮', type: 'crystal_lantern', color: '#feca57' },
        { id: 'prop_5', name: 'プリンセステディベア', icon: '🧸', type: 'teddy_bear', color: '#d35400' },
        { id: 'prop_6', name: '三日月のしずくロッド', icon: '🌙', type: 'moon_rod', color: '#74b9ff' },
        { id: 'prop_7', name: 'ゴールデンハープ', icon: '🪕', type: 'golden_harp', color: '#e67e22' },
        { id: 'prop_8', name: '魔法の手鏡', icon: '🪞', type: 'magic_mirror', color: '#e84393' },
        { id: 'prop_9', name: 'レースプリンセス日傘', icon: '🌂', type: 'pearl_umbrella', color: '#ff7597' },
        { id: 'prop_10', name: 'ロイヤルティーセット', icon: '☕', type: 'royal_tea', color: '#f5cd79' }
      ],

      // 7. くつ・ガラスの靴 (10種)
      shoes: [
        { id: 'shoe_1', name: 'シンデレラガラスの靴', icon: '🥿', color: '#a4b0be', gem: '✨' },
        { id: 'shoe_2', name: 'ローズリボンパンプス', icon: '👠', color: '#ff7597', gem: '🎀' },
        { id: 'shoe_3', name: 'ダイヤモンドストラップ', icon: '👡', color: '#74b9ff', gem: '💎' },
        { id: 'shoe_4', name: 'ゴールドラメヒール', icon: '👠', color: '#f1c40f', gem: '🌟' },
        { id: 'shoe_5', name: 'レースアップシアーブーツ', icon: '👢', color: '#ffffff', gem: '🤍' },
        { id: 'shoe_6', name: 'アイスクリスタルミュール', icon: '🥿', color: '#81ecec', gem: '❄️' },
        { id: 'shoe_7', name: 'ベルベットルビーヒール', icon: '👠', color: '#c0392b', gem: '🔴' },
        { id: 'shoe_8', name: 'パールフラットシューズ', icon: '🩰', color: '#f5cd79', gem: '⚪' },
        { id: 'shoe_9', name: 'バタフライアンクル靴', icon: '👡', color: '#a29bfe', gem: '🦋' },
        { id: 'shoe_10', name: 'スターダストプラットフォーム', icon: '👠', color: '#2f3542', gem: '🌠' }
      ],

      // 8. 3D背景ステージ＆ライティング (10種)
      stage: [
        { id: 'stage_1', name: 'お城の豪華な大広間', bg: 'linear-gradient(180deg, #1e272e 0%, #2f3542 40%, #ffbe76 100%)', floor: '#f5cd79', type: 'ballroom', emoji: '🏰' },
        { id: 'stage_2', name: '星空のバルコニー', bg: 'linear-gradient(180deg, #0a3d62 0%, #3c6382 60%, #60a3bc 100%)', floor: '#dfe4ea', type: 'balcony', emoji: '🌌' },
        { id: 'stage_3', name: '満開のローズガーデン', bg: 'linear-gradient(180deg, #ffb8b8 0%, #ff7675 50%, #55efc4 100%)', floor: '#78e08f', type: 'garden', emoji: '🌹' },
        { id: 'stage_4', name: 'クリスタルアイスパレス', bg: 'linear-gradient(180deg, #81ecec 0%, #74b9ff 60%, #dfe4ea 100%)', floor: '#a4b0be', type: 'ice_palace', emoji: '❄️' },
        { id: 'stage_5', name: '妖精のフラワーステージ', bg: 'linear-gradient(180deg, #a8ff78 0%, #78ffd6 60%, #ffeaa7 100%)', floor: '#55efc4', type: 'fairy_forest', emoji: '🍄' },
        { id: 'stage_6', name: '夕暮れトワイライト城', bg: 'linear-gradient(180deg, #e056fd 0%, #ff7979 50%, #f6e58d 100%)', floor: '#f0932b', type: 'twilight', emoji: '🌅' },
        { id: 'stage_7', name: '魔法のかぼちゃの馬車', bg: 'linear-gradient(180deg, #2c2c54 0%, #474787 50%, #aaa69d 100%)', floor: '#706fd3', type: 'carriage', emoji: '🎃' },
        { id: 'stage_8', name: 'ステンドグラス大聖堂', bg: 'linear-gradient(180deg, #130f40 0%, #30336b 50%, #f9ca24 100%)', floor: '#535c68', type: 'cathedral', emoji: '⛪' },
        { id: 'stage_9', name: 'スウィートドリームルーム', bg: 'linear-gradient(180deg, #fd79a8 0%, #ffb8b8 60%, #ffeaa7 100%)', floor: '#fab1a0', type: 'dream_room', emoji: '🧸' },
        { id: 'stage_10', name: 'スポットライトランウェイ', bg: 'linear-gradient(180deg, #1e272e 0%, #485460 50%, #d2dae2 100%)', floor: '#ff4757', type: 'runway', emoji: '✨' }
      ]
    };
  }

  initDOM() {
    this.containerEl = document.getElementById('view-game-princess');
    this.stageWrapperEl = document.getElementById('princess-stage-wrapper');
    this.stageSceneEl = document.getElementById('princess-stage-scene') || document.querySelector('.princess-stage-3d-scene');
    this.turntableEl = document.getElementById('princess-3d-turntable');
    this.dollContainerEl = document.getElementById('princess-doll-container');
    this.categoriesTabsEl = document.getElementById('princess-category-tabs');
    this.itemsGridEl = document.getElementById('princess-items-grid');
    this.currentCategoryTitleEl = document.getElementById('princess-current-category-title');
    this.spinBtn = document.getElementById('btn-princess-spin');
    this.randomBtn = document.getElementById('btn-princess-random');
    this.photoBtn = document.getElementById('btn-princess-photo');
    this.photoModalEl = document.getElementById('princess-photo-modal');
    this.photoPreviewCardEl = document.getElementById('princess-photo-card');
    this.photoCloseBtn = document.getElementById('princess-photo-close-btn');

    this.bindEvents();
  }

  start() {
    // タイマーは停止＆非表示
    this.app.stopTimer();
    this.app.timer.hide();

    // ロイヤルワルツBGM開始
    window.soundSystem.startPrincessBgm();
    window.soundSystem.playSparkle();

    this.toggleAutoSpin(false);
    this.rotationAngle = 0;
    this.updateTurntableRotation();

    this.renderCategoryTabs();
    this.renderItemsGrid(this.currentCategory);
    this.renderDoll();
    this.updateStageBackground();
  }

  stop() {
    this.toggleAutoSpin(false);
  }

  bindEvents() {
    // 3D ターンテーブルのドラッグ回転制御 (ステージ中央の3D描画エリアに限定)
    const dragTarget = this.stageSceneEl || this.stageWrapperEl;
    if (dragTarget) {
      const onStart = (e) => {
        // ボタン類がクリックされた場合はドラッグ開始しない
        if (e.target.closest('button') || e.target.closest('.stage-action-btn')) {
          return;
        }
        this.isDragging = true;
        this.startX = e.touches ? e.touches[0].clientX : e.clientX;
        this.startAngle = this.rotationAngle;
        if (this.isAutoSpinning) {
          this.toggleAutoSpin(false);
        }
      };

      const onMove = (e) => {
        if (!this.isDragging) return;
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - this.startX;
        this.rotationAngle = (this.startAngle + deltaX * 0.75) % 360;
        this.updateTurntableRotation();
      };

      const onEnd = () => {
        this.isDragging = false;
      };

      dragTarget.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      dragTarget.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    }

    // 自動回転ボタン (クリック時のイベント伝播を抑止して確実にトグル)
    if (this.spinBtn) {
      this.spinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleAutoSpin(!this.isAutoSpinning);
      });
    }

    // おまかせランダムコーデボタン
    if (this.randomBtn) {
      this.randomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.randomizeCoordinate();
      });
    }

    // 📸 写真撮影ボタン
    if (this.photoBtn) {
      this.photoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.takePrincessPhoto();
      });
    }

    // 写真モーダル閉じる
    if (this.photoCloseBtn) {
      this.photoCloseBtn.addEventListener('click', () => {
        if (this.photoModalEl) this.photoModalEl.classList.remove('show');
      });
    }
  }

  toggleAutoSpin(enable) {
    if (this.spinAnimId) {
      cancelAnimationFrame(this.spinAnimId);
      this.spinAnimId = null;
    }

    this.isAutoSpinning = !!enable;

    if (this.spinBtn) {
      this.spinBtn.classList.toggle('active', this.isAutoSpinning);
      this.spinBtn.innerHTML = this.isAutoSpinning ? '⏸️ ていし' : '✨ 3D かいてん';
    }

    if (this.isAutoSpinning) {
      window.soundSystem.playSparkle();
      const spinLoop = () => {
        if (!this.isAutoSpinning) return;
        this.rotationAngle = (this.rotationAngle + 1.2) % 360;
        this.updateTurntableRotation();
        this.spinAnimId = requestAnimationFrame(spinLoop);
      };
      this.spinAnimId = requestAnimationFrame(spinLoop);
    }
  }

  updateTurntableRotation() {
    if (!this.turntableEl) return;
    this.turntableEl.style.transform = `rotateY(${this.rotationAngle}deg)`;

    // 角度に応じたライティングと裏面表示の調整
    const normAngle = ((this.rotationAngle % 360) + 360) % 360;
    const isBack = normAngle > 90 && normAngle < 270;
    if (this.dollContainerEl) {
      this.dollContainerEl.classList.toggle('viewing-back', isBack);
    }
  }

  renderCategoryTabs() {
    if (!this.categoriesTabsEl) return;
    this.categoriesTabsEl.innerHTML = '';

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'princess-cat-btn' + (cat.id === this.currentCategory ? ' active' : '');
      btn.dataset.category = cat.id;
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span><span class="cat-label">${cat.name}</span>`;

      btn.addEventListener('click', () => {
        window.soundSystem.playPop();
        this.currentCategory = cat.id;
        this.renderCategoryTabs();
        this.renderItemsGrid(cat.id);
      });

      this.categoriesTabsEl.appendChild(btn);
    });
  }

  renderItemsGrid(categoryId) {
    if (!this.itemsGridEl) return;
    this.itemsGridEl.innerHTML = '';

    const items = this.database[categoryId] || [];
    const catMeta = this.categories.find(c => c.id === categoryId);
    if (this.currentCategoryTitleEl && catMeta) {
      this.currentCategoryTitleEl.textContent = `${catMeta.name}（全10種類）`;
    }

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      const isSelected = this.selected[categoryId] === item.id;
      card.className = 'princess-item-card pop-in' + (isSelected ? ' selected' : '');
      card.dataset.id = item.id;

      let thumbPreview = '';
      if (categoryId === 'dress') {
        thumbPreview = `<div class="item-thumb-color" style="background: radial-gradient(circle, ${item.mainColor} 30%, ${item.subColor} 100%);">👗</div>`;
      } else if (categoryId === 'hair') {
        thumbPreview = `<div class="item-thumb-color" style="background: radial-gradient(circle, ${item.color} 30%, ${item.shadow} 100%);">👸</div>`;
      } else if (categoryId === 'stage') {
        thumbPreview = `<div class="item-thumb-color" style="padding:0; overflow:hidden; border:1.5px solid #ffbe76;">${this.getStageSvg(item)}</div>`;
      } else if (categoryId === 'makeup') {
        thumbPreview = `<div class="item-thumb-color" style="background: #ffeaa7;">${item.mood === 'wink' ? '😉' : (item.mood === 'heart' ? '😍' : '✨')}</div>`;
      } else {
        thumbPreview = `<div class="item-thumb-color" style="background: #ffffff; border-color: ${item.color || '#ff9f1a'};">${item.icon || '✨'}</div>`;
      }

      card.innerHTML = `
        <div class="item-thumb-wrapper">${thumbPreview}</div>
        <span class="item-name-text">${item.name}</span>
        ${isSelected ? '<span class="selected-badge">✓</span>' : ''}
      `;

      card.addEventListener('click', () => {
        this.equipItem(categoryId, item.id);
      });

      this.itemsGridEl.appendChild(card);
    });
  }

  equipItem(category, itemId) {
    this.selected[category] = itemId;
    window.soundSystem.playDressSwoosh();
    window.soundSystem.playSparkle();

    // パーティクル演出
    if (this.stageWrapperEl) {
      const rect = this.stageWrapperEl.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    }

    this.renderItemsGrid(this.currentCategory);
    this.renderDoll();

    if (category === 'stage') {
      this.updateStageBackground();
    }
  }

  randomizeCoordinate() {
    window.soundSystem.playMagicChime ? window.soundSystem.playMagicChime() : window.soundSystem.playFanfare();
    window.soundSystem.playSparkle();

    Object.keys(this.database).forEach(cat => {
      const items = this.database[cat];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      this.selected[cat] = randomItem.id;
    });

    if (this.stageWrapperEl) {
      const rect = this.stageWrapperEl.getBoundingClientRect();
      this.app.particles.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
    }

    this.renderItemsGrid(this.currentCategory);
    this.renderDoll();
    this.updateStageBackground();
  }

  updateStageBackground() {
    const stageItem = this.database.stage.find(s => s.id === this.selected.stage) || this.database.stage[0];
    const sceneryBgEl = document.getElementById('princess-scenery-bg');
    if (sceneryBgEl) {
      sceneryBgEl.innerHTML = this.getStageSvg(stageItem);
    }
    const floorEl = document.getElementById('princess-turntable-floor');
    if (floorEl) {
      floorEl.style.backgroundColor = stageItem.floor || '#f5cd79';
    }
  }

  renderDoll() {
    if (!this.dollContainerEl) return;

    const hair = this.database.hair.find(h => h.id === this.selected.hair) || this.database.hair[0];
    const dress = this.database.dress.find(d => d.id === this.selected.dress) || this.database.dress[0];
    const head = this.database.headwear.find(h => h.id === this.selected.headwear) || this.database.headwear[0];
    const makeup = this.database.makeup.find(m => m.id === this.selected.makeup) || this.database.makeup[0];
    const jewel = this.database.jewelry.find(j => j.id === this.selected.jewelry) || this.database.jewelry[0];
    const prop = this.database.props.find(p => p.id === this.selected.props) || this.database.props[0];
    const shoe = this.database.shoes.find(s => s.id === this.selected.shoes) || this.database.shoes[0];

    // レイヤー構築（SVG 3D レイヤリング）
    this.dollContainerEl.innerHTML = `
      <!-- レイヤー1: 後ろ髪 ＆ 背中の羽・オーラ -->
      <div class="doll-layer layer-back-wings">
        ${this.getWingsSvg(jewel)}
      </div>
      <div class="doll-layer layer-back-hair">
        ${this.getBackHairSvg(hair)}
      </div>

      <!-- レイヤー2: プリンセス素体（ボディ・手足・ベース） -->
      <div class="doll-layer layer-body">
        ${this.getBodySvg(makeup)}
      </div>

      <!-- レイヤー3: くつ・ガラスの靴 -->
      <div class="doll-layer layer-shoes">
        ${this.getShoesSvg(shoe)}
      </div>

      <!-- レイヤー4: ドレス・ガウン衣装 -->
      <div class="doll-layer layer-dress">
        ${this.getDressSvg(dress)}
      </div>

      <!-- レイヤー5: ジュエリー・手袋・チョーカー -->
      <div class="doll-layer layer-jewelry">
        ${this.getJewelrySvg(jewel)}
      </div>

      <!-- レイヤー6: 手持ちアイテム（ステッキ・ブーケ） -->
      <div class="doll-layer layer-props">
        ${this.getPropsSvg(prop)}
      </div>

      <!-- レイヤー7: フェイスメイク（瞳・チーク・リップ） -->
      <div class="doll-layer layer-face">
        ${this.getFaceMakeupSvg(makeup)}
      </div>

      <!-- レイヤー8: 前髪・サイドヘア -->
      <div class="doll-layer layer-front-hair">
        ${this.getFrontHairSvg(hair)}
      </div>

      <!-- レイヤー9: ティアラ・ヘッドドレス -->
      <div class="doll-layer layer-headwear">
        ${this.getHeadwearSvg(head)}
      </div>
    `;
  }

  // --- SVG レンダリングヘルパー ---

  getWingsSvg(jewel) {
    if (jewel.type === 'fairy_wings') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <ellipse cx="65" cy="180" rx="60" ry="38" fill="rgba(85, 239, 196, 0.45)" stroke="#55efc4" stroke-width="2.5" transform="rotate(-30 65 180)"/>
          <ellipse cx="215" cy="180" rx="60" ry="38" fill="rgba(85, 239, 196, 0.45)" stroke="#55efc4" stroke-width="2.5" transform="rotate(30 215 180)"/>
          <circle cx="65" cy="180" r="15" fill="rgba(255,255,255,0.7)"/>
          <circle cx="215" cy="180" r="15" fill="rgba(255,255,255,0.7)"/>
        </svg>
      `;
    } else if (jewel.type === 'angel_wings') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M140 180 Q80 120 40 150 Q20 200 60 230 Q100 240 140 200 Z" fill="rgba(255,255,255,0.85)" stroke="#dfe4ea" stroke-width="3"/>
          <path d="M140 180 Q200 120 240 150 Q260 200 220 230 Q180 240 140 200 Z" fill="rgba(255,255,255,0.85)" stroke="#dfe4ea" stroke-width="3"/>
        </svg>
      `;
    } else if (jewel.type === 'butterfly_aura') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <circle cx="50" cy="140" r="12" fill="rgba(162, 155, 254, 0.6)" class="aura-sparkle"/>
          <circle cx="230" cy="130" r="14" fill="rgba(253, 121, 168, 0.6)" class="aura-sparkle"/>
          <circle cx="40" cy="240" r="10" fill="rgba(254, 202, 87, 0.6)" class="aura-sparkle"/>
          <circle cx="240" cy="250" r="12" fill="rgba(85, 239, 196, 0.6)" class="aura-sparkle"/>
        </svg>
      `;
    }
    return '';
  }

  getBackHairSvg(hair) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <defs>
          <linearGradient id="backHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${hair.color}"/>
            <stop offset="100%" stop-color="${hair.shadow}"/>
          </linearGradient>
        </defs>
        <!-- 頭頂部から背中へ広がるボリューム豊かな後ろ髪 -->
        <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q235 140 230 250 Q215 315 185 320 Q140 330 95 320 Q65 315 50 250 Q45 140 85 75 Z" fill="url(#backHairGrad)" stroke="${hair.shadow}" stroke-width="2"/>
        <path d="M50 230 Q40 290 65 325 Q85 335 105 315" fill="${hair.color}" opacity="0.6"/>
        <path d="M230 230 Q240 290 215 325 Q195 335 175 315" fill="${hair.color}" opacity="0.6"/>
      </svg>
    `;
  }

  getBodySvg(makeup) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <!-- 首と肩 -->
        <path d="M128 115 L128 135 L105 145 L90 220 L105 220 L115 155 L140 155 L165 155 L175 220 L190 220 L175 145 L152 135 L152 115 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        
        <!-- 頭部・顔の輪郭 -->
        <path d="M102 75 Q100 115 140 125 Q180 115 178 75 Q175 40 140 40 Q105 40 102 75 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        
        <!-- 脚・レッグ -->
        <path d="M120 250 L116 350 L130 350 L134 250 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        <path d="M146 250 L150 350 L164 350 L160 250 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>

        <!-- キャミソール＆ペチパンツ（ベース下着） -->
        <path d="M115 145 Q140 155 165 145 L170 210 Q140 215 110 210 Z" fill="#ffccd5" stroke="#ff8da1" stroke-width="1.5"/>
        <path d="M108 208 Q140 215 172 208 L175 245 Q158 250 140 240 Q122 250 105 245 Z" fill="#ffccd5" stroke="#ff8da1" stroke-width="1.5"/>
        <!-- レースフリル -->
        <path d="M115 145 Q140 150 165 145" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,4" fill="none"/>
      </svg>
    `;
  }

  getShoesSvg(shoe) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <!-- 左足の靴 -->
        <ellipse cx="123" cy="355" rx="10" ry="6" fill="${shoe.color}" stroke="#2f3542" stroke-width="1.5"/>
        <path d="M117 353 Q123 348 129 353" stroke="#ffffff" stroke-width="2" fill="none"/>
        <text x="119" y="358" font-size="7">${shoe.gem || '✨'}</text>
        
        <!-- 右足の靴 -->
        <ellipse cx="157" cy="355" rx="10" ry="6" fill="${shoe.color}" stroke="#2f3542" stroke-width="1.5"/>
        <path d="M151 353 Q157 348 163 353" stroke="#ffffff" stroke-width="2" fill="none"/>
        <text x="153" y="358" font-size="7">${shoe.gem || '✨'}</text>
      </svg>
    `;
  }

  getDressSvg(dress) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <defs>
          <linearGradient id="dressGrad_${dress.id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${dress.mainColor}"/>
            <stop offset="60%" stop-color="${dress.subColor}"/>
            <stop offset="100%" stop-color="${dress.mainColor}"/>
          </linearGradient>
          <linearGradient id="dressShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
          </linearGradient>
        </defs>

        <!-- ドレスのパニエ・スカート（ゴージャスなフリルとボリューム） -->
        <path d="M118 190 Q140 195 162 190 Q215 260 225 345 Q140 360 55 345 Q65 260 118 190 Z" fill="url(#dressGrad_${dress.id})" stroke="#2f3542" stroke-width="2"/>
        <path d="M118 190 Q140 195 162 190 Q215 260 225 345 Q140 360 55 345 Q65 260 118 190 Z" fill="url(#dressShine)"/>

        <!-- スカートのオーバースカート・ドレープ -->
        <path d="M125 192 Q140 240 90 320 Q140 340 190 320 Q140 240 155 192" fill="none" stroke="${dress.glow}" stroke-width="3" opacity="0.85"/>
        <path d="M65 340 Q140 365 215 340" stroke="#ffffff" stroke-width="4" stroke-dasharray="6,6" fill="none"/>

        <!-- トップ・コルセット部 -->
        <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#dressGrad_${dress.id})" stroke="#2f3542" stroke-width="1.8"/>
        <!-- 胸元のジュエル＆リボン -->
        <circle cx="140" cy="155" r="5" fill="${dress.glow}" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M135 155 L130 162 M145 155 L150 162" stroke="#ffffff" stroke-width="2"/>

        <!-- ショルダーフリル・オフショルダー -->
        <path d="M98 145 Q115 135 125 145 Q112 155 98 145 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M182 145 Q165 135 155 145 Q168 155 182 145 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
    `;
  }

  getJewelrySvg(jewel) {
    if (jewel.type === 'pearl_choker') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M127 128 Q140 135 153 128" stroke="#ffffff" stroke-width="4" stroke-dasharray="3,3" fill="none"/>
          <circle cx="140" cy="134" r="3.5" fill="#74b9ff" stroke="#ffffff" stroke-width="1"/>
        </svg>
      `;
    } else if (jewel.type === 'diamond_pendant') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M125 126 Q140 142 155 126" stroke="#f1c40f" stroke-width="2" fill="none"/>
          <polygon points="140,140 144,146 140,152 136,146" fill="#74b9ff" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (jewel.type === 'satin_gloves') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M90 180 L90 220 L105 220 L105 180 Z" fill="#ffffff" stroke="#ced6e0" stroke-width="1.5"/>
          <path d="M175 180 L175 220 L190 220 L190 180 Z" fill="#ffffff" stroke="#ced6e0" stroke-width="1.5"/>
        </svg>
      `;
    }
    return '';
  }

  getPropsSvg(prop) {
    if (prop.type === 'star_wand') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 魔法のステッキ -->
          <line x1="195" y1="210" x2="230" y2="130" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/>
          <polygon points="230,120 234,128 243,128 236,134 239,142 230,137 221,142 224,134 217,128 226,128" fill="#f1c40f" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="230" cy="132" r="10" fill="rgba(254, 202, 87, 0.4)" class="aura-sparkle"/>
        </svg>
      `;
    } else if (prop.type === 'rose_bouquet') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 薔薇の花束 -->
          <circle cx="185" cy="210" r="16" fill="#ff4757"/>
          <circle cx="175" cy="202" r="10" fill="#ff6b81"/>
          <circle cx="195" cy="202" r="10" fill="#ff6b81"/>
          <circle cx="185" cy="220" r="10" fill="#ee5253"/>
          <path d="M175 225 L185 245 L195 225 Z" fill="#ffffff" stroke="#ced6e0" stroke-width="1.5"/>
        </svg>
      `;
    } else if (prop.type === 'lace_fan') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- レース扇子 -->
          <path d="M185 220 Q215 170 235 190 L185 220 Z" fill="rgba(255,255,255,0.9)" stroke="#ff9f43" stroke-width="2"/>
          <path d="M190 215 Q210 180 225 195" stroke="#ff7675" stroke-width="1.5" fill="none"/>
        </svg>
      `;
    } else if (prop.type === 'crystal_lantern') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <line x1="190" y1="210" x2="220" y2="200" stroke="#795548" stroke-width="3"/>
          <rect x="210" y="200" width="20" height="28" rx="4" fill="#feca57" stroke="#795548" stroke-width="2"/>
          <circle cx="220" cy="214" r="6" fill="#ffffff" class="aura-sparkle"/>
        </svg>
      `;
    } else if (prop.type === 'teddy_bear') {
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <circle cx="190" cy="215" r="14" fill="#d35400"/>
          <circle cx="190" cy="198" r="10" fill="#d35400"/>
          <circle cx="183" cy="190" r="4" fill="#e67e22"/>
          <circle cx="197" cy="190" r="4" fill="#e67e22"/>
          <circle cx="187" cy="196" r="1.5" fill="#2f3542"/>
          <circle cx="193" cy="196" r="1.5" fill="#2f3542"/>
        </svg>
      `;
    }
    return '';
  }

  getFaceMakeupSvg(makeup) {
    let leftEye = `<ellipse cx="125" cy="80" rx="7" ry="9" fill="${makeup.eyeColor === 'oddeye' ? '#0984e3' : makeup.eyeColor}"/>`;
    let rightEye = `<ellipse cx="155" cy="80" rx="7" ry="9" fill="${makeup.eyeColor === 'oddeye' ? '#f1c40f' : makeup.eyeColor}"/>`;

    if (makeup.mood === 'wink') {
      rightEye = `<path d="M148 80 Q155 74 162 80" stroke="#2f3542" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    }

    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <!-- 眉 -->
        <path d="M118 68 Q125 64 132 68" stroke="#795548" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M148 68 Q155 64 162 68" stroke="#795548" stroke-width="2.5" stroke-linecap="round" fill="none"/>

        <!-- 瞳とハイライト -->
        ${leftEye}
        ${rightEye}
        <circle cx="123" cy="77" r="3" fill="#ffffff"/>
        <circle cx="127" cy="83" r="1.5" fill="#ffffff"/>
        ${makeup.mood !== 'wink' ? '<circle cx="153" cy="77" r="3" fill="#ffffff"/><circle cx="157" cy="83" r="1.5" fill="#ffffff"/>' : ''}

        <!-- まつ毛 -->
        <path d="M117 74 Q125 71 133 74" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        ${makeup.mood !== 'wink' ? '<path d="M147 74 Q155 71 163 74" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round" fill="none"/>' : ''}

        <!-- チーク -->
        <ellipse cx="118" cy="92" rx="7" ry="4" fill="${makeup.blush}" opacity="0.6"/>
        <ellipse cx="162" cy="92" rx="7" ry="4" fill="${makeup.blush}" opacity="0.6"/>

        <!-- リップ・口元 -->
        <path d="M136 102 Q140 106 144 102" stroke="${makeup.lip}" stroke-width="2.5" stroke-linecap="round" fill="${makeup.lip}"/>
      </svg>
    `;
  }

  getFrontHairSvg(hair) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <defs>
          <linearGradient id="frontHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${hair.color}"/>
            <stop offset="100%" stop-color="${hair.shadow}"/>
          </linearGradient>
        </defs>

        <!-- 前髪＆頭頂部（頭のてっぺんから包み込むフルキャップヘア） -->
        <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q172 88 156 76 Q140 92 124 76 Q108 88 96 75 Z" fill="url(#frontHairGrad)" stroke="${hair.shadow}" stroke-width="1.8"/>
        
        <!-- サイドの髪束（顔まわり） -->
        <path d="M98 70 Q88 115 95 160 Q105 135 108 95 Z" fill="url(#frontHairGrad)" stroke="${hair.shadow}" stroke-width="1.5"/>
        <path d="M182 70 Q192 115 185 160 Q175 135 172 95 Z" fill="url(#frontHairGrad)" stroke="${hair.shadow}" stroke-width="1.5"/>

        <!-- 天使の輪・髪の光沢ハイライト -->
        <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)" transform="rotate(-3 140 44)"/>
      </svg>
    `;
  }

  getHeadwearSvg(head) {
    if (head.id === 'head_1' || head.id === 'head_4' || head.id === 'head_6') {
      // 王冠・ティアラ
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M118 34 L125 22 L132 30 L140 15 L148 30 L155 22 L162 34 Z" fill="${head.color}" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="140" cy="18" r="3" fill="#ffffff"/>
          <circle cx="125" cy="24" r="2.5" fill="#ff7675"/>
          <circle cx="155" cy="24" r="2.5" fill="#ff7675"/>
        </svg>
      `;
    } else if (head.id === 'head_2') {
      // 薔薇の花冠
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M108 36 Q140 28 172 36" stroke="#2ed573" stroke-width="3" fill="none"/>
          <circle cx="120" cy="34" r="6" fill="#ff4757"/><circle cx="130" cy="31" r="5" fill="#ff7675"/>
          <circle cx="140" cy="30" r="7" fill="#ff4757"/><circle cx="150" cy="31" r="5" fill="#ff7675"/>
          <circle cx="160" cy="34" r="6" fill="#ff4757"/>
        </svg>
      `;
    } else if (head.id === 'head_5' || head.id === 'head_7') {
      // リボン
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <path d="M140 26 L120 14 Q115 31 136 30 Z" fill="${head.color}" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M140 26 L160 14 Q165 31 144 30 Z" fill="${head.color}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="140" cy="26" r="4.5" fill="#f1c40f" stroke="#ffffff" stroke-width="1"/>
        </svg>
      `;
    }
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <text x="132" y="32" font-size="20">${head.icon || '👑'}</text>
      </svg>
    `;
  }

  getStageSvg(stage) {
    const sId = stage.id;
    if (sId === 'stage_1') {
      // 1. お城の豪華な大広間
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_1" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#1b0a2a"/><stop offset="50%" stop-color="#3b114d"/><stop offset="100%" stop-color="#781d42"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_1)"/>
          <!-- 中央アーチ窓＆星空 -->
          <path d="M100 90 Q160 55 220 90 L220 220 L100 220 Z" fill="#0c1033" stroke="#f1c40f" stroke-width="3"/>
          <line x1="160" y1="70" x2="160" y2="220" stroke="#f1c40f" stroke-width="2"/>
          <line x1="100" y1="145" x2="220" y2="145" stroke="#f1c40f" stroke-width="2"/>
          <circle cx="125" cy="115" r="1.5" fill="#fff"/><circle cx="190" cy="105" r="2" fill="#fff"/><circle cx="175" cy="180" r="1.5" fill="#feca57"/>
          <!-- シャンデリア -->
          <line x1="160" y1="0" x2="160" y2="45" stroke="#f1c40f" stroke-width="2.5"/>
          <path d="M130 45 Q160 55 190 45" stroke="#f1c40f" stroke-width="2.5" fill="none"/>
          <path d="M110 58 Q160 72 210 58" stroke="#f1c40f" stroke-width="2" fill="none"/>
          <circle cx="110" cy="55" r="3.5" fill="#fffa65"/><circle cx="135" cy="43" r="3.5" fill="#fffa65"/><circle cx="160" cy="40" r="4.5" fill="#fffa65"/><circle cx="185" cy="43" r="3.5" fill="#fffa65"/><circle cx="210" cy="55" r="3.5" fill="#fffa65"/>
          <polygon points="160,60 156,70 160,80 164,70" fill="#74b9ff" opacity="0.9"/>
          <!-- 大理石の柱 -->
          <rect x="0" y="0" width="40" height="480" fill="#2c2c54"/><rect x="4" y="0" width="32" height="480" fill="#40407a"/>
          <rect x="0" y="0" width="40" height="24" fill="#f1c40f"/><rect x="0" y="450" width="40" height="30" fill="#f1c40f"/>
          <rect x="280" y="0" width="40" height="480" fill="#2c2c54"/><rect x="284" y="0" width="32" height="480" fill="#40407a"/>
          <rect x="280" y="0" width="40" height="24" fill="#f1c40f"/><rect x="280" y="450" width="40" height="30" fill="#f1c40f"/>
          <!-- ドレープカーテン -->
          <path d="M40 0 Q85 110 40 200 L40 0 Z" fill="#b33939" opacity="0.85"/>
          <path d="M280 0 Q235 110 280 200 L280 0 Z" fill="#b33939" opacity="0.85"/>
          <!-- レッドカーペット -->
          <polygon points="115,310 205,310 250,480 70,480" fill="#c0392b" stroke="#f1c40f" stroke-width="2"/>
        </svg>
      `;
    } else if (sId === 'stage_2') {
      // 2. 星空のバルコニー
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_2" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#05051e"/><stop offset="60%" stop-color="#0c2461"/><stop offset="100%" stop-color="#1e3799"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_2)"/>
          <!-- 月＆光輪 -->
          <circle cx="250" cy="70" r="26" fill="rgba(254, 202, 87, 0.25)"/>
          <path d="M260 52 Q238 70 260 88 Q242 82 242 70 Q242 58 260 52 Z" fill="#ffeaa7"/>
          <!-- 星空 -->
          <circle cx="45" cy="45" r="2" fill="#fff"/><circle cx="110" cy="35" r="1.5" fill="#fff"/><circle cx="75" cy="85" r="2" fill="#feca57"/><circle cx="175" cy="55" r="1.5" fill="#fff"/><circle cx="285" cy="115" r="2" fill="#fff"/><circle cx="55" cy="150" r="1.5" fill="#fff"/><circle cx="215" cy="135" r="2" fill="#fffa65"/>
          <path d="M45 45 L75 85 L110 35" stroke="rgba(255,255,255,0.3)" stroke-dasharray="2,2"/>
          <!-- 遠くのお城の塔 -->
          <polygon points="35,240 55,185 75,240" fill="#080c24"/><rect x="45" y="240" width="20" height="130" fill="#080c24"/>
          <polygon points="85,260 105,215 125,260" fill="#0a1033"/><rect x="95" y="260" width="20" height="110" fill="#0a1033"/>
          <polygon points="235,250 255,195 275,250" fill="#0a1033"/><rect x="245" y="250" width="20" height="120" fill="#0a1033"/>
          <circle cx="55" cy="225" r="3" fill="#fffa65"/><circle cx="105" cy="245" r="3" fill="#fffa65"/><circle cx="255" cy="235" r="3" fill="#fffa65"/>
          <!-- バルコニーの手すり -->
          <rect x="0" y="375" width="320" height="105" fill="#2f3542"/>
          <line x1="0" y1="375" x2="320" y2="375" stroke="#f1c40f" stroke-width="4"/>
          <line x1="0" y1="405" x2="320" y2="405" stroke="#f1c40f" stroke-width="3"/>
          <rect x="20" y="375" width="10" height="30" fill="#747d8c"/><rect x="55" y="375" width="10" height="30" fill="#747d8c"/><rect x="90" y="375" width="10" height="30" fill="#747d8c"/><rect x="220" y="375" width="10" height="30" fill="#747d8c"/><rect x="255" y="375" width="10" height="30" fill="#747d8c"/><rect x="290" y="375" width="10" height="30" fill="#747d8c"/>
        </svg>
      `;
    } else if (sId === 'stage_3') {
      // 3. 満開のローズガーデン
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_3" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#74b9ff"/><stop offset="50%" stop-color="#ffccd5"/><stop offset="100%" stop-color="#55efc4"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_3)"/>
          <!-- 白いパーゴラアーチ -->
          <path d="M50 125 Q160 55 270 125" stroke="#ffffff" stroke-width="6" fill="none"/>
          <line x1="70" y1="125" x2="70" y2="340" stroke="#ffffff" stroke-width="6"/>
          <line x1="250" y1="125" x2="250" y2="340" stroke="#ffffff" stroke-width="6"/>
          <!-- 薔薇のツタ -->
          <path d="M45 130 Q160 50 275 130" stroke="#2ed573" stroke-width="12" fill="none"/>
          <circle cx="75" cy="100" r="9" fill="#ff4757"/><circle cx="105" cy="72" r="10" fill="#ff6b81"/><circle cx="160" cy="52" r="12" fill="#ff4757"/><circle cx="215" cy="72" r="10" fill="#ff6b81"/><circle cx="245" cy="100" r="9" fill="#ff4757"/>
          <circle cx="60" cy="150" r="8" fill="#ff6b81"/><circle cx="60" cy="200" r="9" fill="#ff4757"/><circle cx="260" cy="150" r="8" fill="#ff6b81"/><circle cx="260" cy="200" r="9" fill="#ff4757"/>
          <!-- 噴水 -->
          <ellipse cx="160" cy="255" rx="35" ry="10" fill="#74b9ff" stroke="#ffffff" stroke-width="2"/>
          <path d="M160 255 Q150 215 160 195 Q170 215 160 255" fill="rgba(255,255,255,0.7)"/>
          <!-- 舞い散る花びら -->
          <ellipse cx="110" cy="180" rx="5" ry="3" fill="#ff7675" transform="rotate(25 110 180)"/>
          <ellipse cx="210" cy="200" rx="5" ry="3" fill="#ff7675" transform="rotate(-30 210 200)"/>
          <ellipse cx="140" cy="300" rx="6" ry="3" fill="#ff4757" transform="rotate(45 140 300)"/>
          <!-- 花壇＆芝生 -->
          <rect x="0" y="380" width="320" height="100" fill="#20bf6b"/>
          <circle cx="25" cy="420" r="12" fill="#eb4d4b"/><circle cx="50" cy="430" r="10" fill="#f7b731"/><circle cx="270" cy="420" r="12" fill="#eb4d4b"/><circle cx="295" cy="430" r="10" fill="#f7b731"/>
        </svg>
      `;
    } else if (sId === 'stage_4') {
      // 4. クリスタル氷の宮殿
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_4" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#00cec9"/><stop offset="50%" stop-color="#0984e3"/><stop offset="100%" stop-color="#dfe6e9"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_4)"/>
          <!-- オーロラ -->
          <path d="M0 40 Q80 10 160 50 Q240 90 320 40 L320 0 L0 0 Z" fill="rgba(85, 239, 196, 0.4)"/>
          <path d="M0 70 Q100 120 200 60 Q280 20 320 80 L320 0 L0 0 Z" fill="rgba(129, 236, 236, 0.3)"/>
          <!-- 氷の結晶マンダラ -->
          <circle cx="160" cy="140" r="42" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
          <line x1="160" y1="85" x2="160" y2="195" stroke="#ffffff" stroke-width="3"/>
          <line x1="105" y1="140" x2="215" y2="140" stroke="#ffffff" stroke-width="3"/>
          <line x1="121" y1="101" x2="199" y2="179" stroke="#ffffff" stroke-width="3"/>
          <line x1="121" y1="179" x2="199" y2="101" stroke="#ffffff" stroke-width="3"/>
          <!-- 氷柱＆氷の柱 -->
          <polygon points="0,0 20,0 25,120 15,180 0,200" fill="rgba(255,255,255,0.6)" stroke="#81ecec" stroke-width="1.5"/>
          <polygon points="320,0 300,0 295,120 305,180 320,200" fill="rgba(255,255,255,0.6)" stroke="#81ecec" stroke-width="1.5"/>
          <polygon points="55,0 65,0 60,60" fill="#ffffff" opacity="0.8"/>
          <polygon points="115,0 125,0 120,75" fill="#ffffff" opacity="0.8"/>
          <polygon points="195,0 205,0 200,75" fill="#ffffff" opacity="0.8"/>
          <polygon points="255,0 265,0 260,60" fill="#ffffff" opacity="0.8"/>
          <!-- クリスタル床 -->
          <rect x="0" y="375" width="320" height="105" fill="#74b9ff"/>
          <line x1="0" y1="375" x2="320" y2="375" stroke="#ffffff" stroke-width="3"/>
          <polygon points="45,420 65,390 85,420" fill="rgba(255,255,255,0.5)"/>
          <polygon points="235,420 255,390 275,420" fill="rgba(255,255,255,0.5)"/>
        </svg>
      `;
    } else if (sId === 'stage_5') {
      // 5. 妖精のフラワーステージ
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_5" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#006266"/><stop offset="50%" stop-color="#009432"/><stop offset="100%" stop-color="#1289A7"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_5)"/>
          <!-- 大樹の枝 -->
          <path d="M0 0 Q60 80 0 160 L0 0 Z" fill="#3d1e06"/>
          <path d="M320 0 Q260 80 320 160 L320 0 Z" fill="#3d1e06"/>
          <path d="M0 20 Q160 80 320 20 L320 0 L0 0 Z" fill="#3d1e06"/>
          <!-- 光るキノコ -->
          <path d="M20 280 Q45 220 70 280 Z" fill="#ff4757"/><rect x="40" y="280" width="10" height="40" fill="#dfe4ea"/>
          <circle cx="35" cy="250" r="3" fill="#fff"/><circle cx="55" cy="255" r="4" fill="#fff"/>
          <path d="M245 270 Q275 200 305 270 Z" fill="#00d2d3"/><rect x="270" y="270" width="10" height="45" fill="#dfe4ea"/>
          <circle cx="265" cy="235" r="3" fill="#fff"/><circle cx="285" cy="240" r="4" fill="#fff"/>
          <!-- 妖精の光 -->
          <circle cx="55" cy="110" r="6" fill="#f6e58d"/><circle cx="95" cy="170" r="5" fill="#55efc4"/>
          <circle cx="225" cy="130" r="7" fill="#f6e58d"/><circle cx="265" cy="180" r="5" fill="#fd79a8"/>
          <!-- 苔の丘の床 -->
          <path d="M0 380 Q160 340 320 380 L320 480 L0 480 Z" fill="#1b8c3a"/>
        </svg>
      `;
    } else if (sId === 'stage_6') {
      // 6. 夕暮れトワイライト城
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_6" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#6c5ce7"/><stop offset="35%" stop-color="#fd79a8"/><stop offset="70%" stop-color="#e17055"/><stop offset="100%" stop-color="#fdcb6e"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_6)"/>
          <!-- 夕焼け雲 -->
          <ellipse cx="75" cy="85" rx="55" ry="16" fill="rgba(255, 234, 167, 0.45)"/>
          <ellipse cx="245" cy="115" rx="65" ry="18" fill="rgba(255, 234, 167, 0.45)"/>
          <!-- お城の尖塔シルエット -->
          <polygon points="75,180 95,95 115,180" fill="#2d3436"/><rect x="83" y="180" width="24" height="150" fill="#2d3436"/>
          <line x1="95" y1="95" x2="95" y2="80" stroke="#f1c40f" stroke-width="2"/><polygon points="95,80 115,87 95,95" fill="#e74c3c"/>
          <polygon points="205,190 225,115 245,190" fill="#2d3436"/><rect x="213" y="190" width="24" height="140" fill="#2d3436"/>
          <line x1="225" y1="115" x2="225" y2="100" stroke="#f1c40f" stroke-width="2"/><polygon points="225,100 245,107 225,115" fill="#e74c3c"/>
          <rect x="105" y="240" width="110" height="90" fill="#2d3436"/>
          <circle cx="95" cy="190" r="3" fill="#ffeaa7"/><circle cx="225" cy="200" r="3" fill="#ffeaa7"/>
          <!-- 城壁テラス床 -->
          <rect x="0" y="380" width="320" height="100" fill="#636e72"/>
          <rect x="0" y="360" width="28" height="25" fill="#636e72"/><rect x="48" y="360" width="28" height="25" fill="#636e72"/><rect x="244" y="360" width="28" height="25" fill="#636e72"/><rect x="292" y="360" width="28" height="25" fill="#636e72"/>
          <line x1="0" y1="385" x2="320" y2="385" stroke="#ffeaa7" stroke-width="3"/>
        </svg>
      `;
    } else if (sId === 'stage_7') {
      // 7. 魔法のかぼちゃの馬車
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_7" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#191970"/><stop offset="60%" stop-color="#483d8b"/><stop offset="100%" stop-color="#8a2be2"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_7)"/>
          <!-- 街灯 -->
          <line x1="30" y1="180" x2="30" y2="390" stroke="#f1c40f" stroke-width="4"/>
          <path d="M15 180 Q30 150 45 180 Z" fill="#f1c40f"/><circle cx="30" cy="190" r="10" fill="#ffeaa7"/>
          <line x1="290" y1="180" x2="290" y2="390" stroke="#f1c40f" stroke-width="4"/>
          <path d="M275 180 Q290 150 305 180 Z" fill="#f1c40f"/><circle cx="290" cy="190" r="10" fill="#ffeaa7"/>
          <!-- かぼちゃの馬車 -->
          <ellipse cx="160" cy="195" rx="60" ry="50" fill="none" stroke="#f1c40f" stroke-width="3.5"/>
          <path d="M160 145 L160 245" stroke="#f1c40f" stroke-width="2.5"/>
          <ellipse cx="160" cy="195" rx="30" ry="50" fill="none" stroke="#f1c40f" stroke-width="2"/>
          <circle cx="160" cy="142" r="5" fill="#f1c40f"/><polygon points="160,137 165,127 160,131 155,127" fill="#2ed573"/>
          <circle cx="110" cy="250" r="20" fill="none" stroke="#f1c40f" stroke-width="3.5"/>
          <circle cx="210" cy="250" r="20" fill="none" stroke="#f1c40f" stroke-width="3.5"/>
          <!-- 魔法の軌跡 -->
          <path d="M40 310 Q160 170 280 270" stroke="#feca57" stroke-width="3" stroke-dasharray="6,4" fill="none"/>
          <polygon points="115,125 119,133 127,133 121,139 123,147 115,142 107,147 109,139 103,133 111,133" fill="#fffa65"/>
          <polygon points="205,115 209,123 217,123 211,129 213,137 205,132 197,137 199,129 193,123 201,123" fill="#fffa65"/>
          <!-- 石畳の床 -->
          <rect x="0" y="380" width="320" height="100" fill="#2f3542"/>
          <ellipse cx="60" cy="410" rx="20" ry="10" fill="#57606f"/><ellipse cx="120" cy="415" rx="22" ry="11" fill="#747d8c"/><ellipse cx="180" cy="410" rx="20" ry="10" fill="#57606f"/><ellipse cx="240" cy="415" rx="22" ry="11" fill="#747d8c"/>
        </svg>
      `;
    } else if (sId === 'stage_8') {
      // 8. ステンドグラス大聖堂
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_8" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#0c102b"/><stop offset="60%" stop-color="#1a1c3b"/><stop offset="100%" stop-color="#2d3436"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_8)"/>
          <!-- ローズウィンドウ（大ステンドグラス） -->
          <circle cx="160" cy="140" r="65" fill="#1e272e" stroke="#f1c40f" stroke-width="4"/>
          <circle cx="160" cy="140" r="55" fill="#ff4757" opacity="0.8"/>
          <circle cx="160" cy="140" r="38" fill="#70a1ff" opacity="0.8"/>
          <circle cx="160" cy="140" r="22" fill="#f1c40f" opacity="0.9"/>
          <path d="M160 75 L160 205 M95 140 L225 140 M115 95 L205 185 M115 185 L205 95" stroke="#f1c40f" stroke-width="2.5"/>
          <circle cx="160" cy="140" r="9" fill="#2ed573"/>
          <!-- ゴシックアーチ -->
          <path d="M0 230 Q160 50 320 230" stroke="#f1c40f" stroke-width="4" fill="none"/>
          <path d="M40 270 Q160 110 280 270" stroke="#dfe4ea" stroke-width="2.5" fill="none"/>
          <!-- 光の筋 -->
          <polygon points="160,140 0,420 70,480" fill="rgba(255, 71, 87, 0.15)"/>
          <polygon points="160,140 120,480 200,480" fill="rgba(241, 196, 15, 0.2)"/>
          <polygon points="160,140 250,480 320,420" fill="rgba(112, 161, 255, 0.15)"/>
          <!-- 燭台キャンドル -->
          <rect x="25" y="310" width="8" height="28" fill="#ffffff"/><circle cx="29" cy="306" r="4" fill="#f1c40f"/>
          <rect x="287" y="310" width="8" height="28" fill="#ffffff"/><circle cx="291" cy="306" r="4" fill="#f1c40f"/>
          <!-- 大聖堂床 -->
          <rect x="0" y="380" width="320" height="100" fill="#1e272e"/>
          <line x1="0" y1="380" x2="320" y2="380" stroke="#f1c40f" stroke-width="3"/>
        </svg>
      `;
    } else if (sId === 'stage_9') {
      // 9. スウィートドリームルーム
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_9" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#fd79a8"/><stop offset="50%" stop-color="#ffb8b8"/><stop offset="100%" stop-color="#f8a5c2"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_9)"/>
          <!-- 天蓋カーテン＆リボン -->
          <path d="M0 0 Q160 65 320 0 L320 55 Q160 115 0 55 Z" fill="#ffffff" opacity="0.9"/>
          <path d="M0 0 Q75 170 0 330 Z" fill="#ffffff" opacity="0.85"/>
          <path d="M320 0 Q245 170 320 330 Z" fill="#ffffff" opacity="0.85"/>
          <circle cx="160" cy="70" r="13" fill="#ff4757"/>
          <path d="M160 70 L140 60 Q135 80 156 77 Z" fill="#ff6b81"/><path d="M160 70 L180 60 Q185 80 164 77 Z" fill="#ff6b81"/>
          <!-- クモ＆クッション -->
          <ellipse cx="55" cy="310" rx="32" ry="16" fill="#ffffff" opacity="0.8"/>
          <ellipse cx="265" cy="310" rx="32" ry="16" fill="#ffffff" opacity="0.8"/>
          <circle cx="265" cy="290" r="11" fill="#e17055"/><circle cx="258" cy="280" r="4" fill="#e17055"/><circle cx="272" cy="280" r="4" fill="#e17055"/>
          <!-- フリルカーペット床 -->
          <rect x="0" y="380" width="320" height="100" fill="#f78fb3"/>
          <path d="M0 380 Q160 395 320 380" stroke="#ffffff" stroke-width="4" stroke-dasharray="6,6" fill="none"/>
        </svg>
      `;
    } else {
      // 10. スポットライトランウェイ
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_10" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stop-color="#0a0a14"/><stop offset="50%" stop-color="#1e1e38"/><stop offset="100%" stop-color="#2d1b4e"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_10)"/>
          <!-- トラス -->
          <line x1="0" y1="28" x2="320" y2="28" stroke="#718093" stroke-width="3.5"/>
          <line x1="0" y1="42" x2="320" y2="42" stroke="#718093" stroke-width="2.5"/>
          <line x1="20" y1="28" x2="38" y2="42" stroke="#718093" stroke-width="1.5"/><line x1="58" y1="28" x2="76" y2="42" stroke="#718093" stroke-width="1.5"/><line x1="240" y1="28" x2="258" y2="42" stroke="#718093" stroke-width="1.5"/><line x1="280" y1="28" x2="298" y2="42" stroke="#718093" stroke-width="1.5"/>
          <!-- 交差するスポットライト -->
          <polygon points="35,28 105,480 205,480" fill="rgba(255, 71, 87, 0.3)"/>
          <polygon points="285,28 215,480 115,480" fill="rgba(0, 210, 211, 0.3)"/>
          <polygon points="160,28 95,480 225,480" fill="rgba(254, 202, 87, 0.25)"/>
          <!-- フラッシュ＆ボケ光 -->
          <circle cx="160" cy="28" r="10" fill="#fffa65"/><circle cx="35" cy="28" r="7" fill="#ff6b81"/><circle cx="285" cy="28" r="7" fill="#00d2d3"/>
          <circle cx="65" cy="170" r="12" fill="rgba(255,255,255,0.15)"/><circle cx="255" cy="210" r="16" fill="rgba(255,255,255,0.12)"/>
          <!-- ランウェイキャットウォーク床 -->
          <polygon points="95,310 225,310 275,480 45,480" fill="#130f40" stroke="#ff4757" stroke-width="3"/>
          <line x1="95" y1="310" x2="45" y2="480" stroke="#00d2d3" stroke-width="3"/>
          <line x1="225" y1="310" x2="275" y2="480" stroke="#00d2d3" stroke-width="3"/>
        </svg>
      `;
    }
  }

  takePrincessPhoto() {
    window.soundSystem.playCameraShutter();
    window.soundSystem.playFanfare();

    // フラッシュ演出
    const flash = document.createElement('div');
    flash.className = 'camera-flash-overlay';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // パーティクル
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 80);

    // ポラロイド写真プレビュー生成
    if (this.photoPreviewCardEl) {
      const dress = this.database.dress.find(d => d.id === this.selected.dress);
      const stage = this.database.stage.find(s => s.id === this.selected.stage);

      this.photoPreviewCardEl.innerHTML = `
        <div class="polaroid-frame">
          <div class="polaroid-photo-view" style="position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; pointer-events: none; z-index: 0;">
              ${this.getStageSvg(stage)}
            </div>
            <div class="doll-clone-preview" style="position: relative; z-index: 1;">
              ${this.dollContainerEl.innerHTML}
            </div>
            <span class="photo-sparkle-decor" style="position: relative; z-index: 2;">✨ ⭐ ✨</span>
          </div>
          <div class="polaroid-caption">
            <h3 class="polaroid-title">👑 ロイヤル・プリンセス 👑</h3>
            <p class="polaroid-desc">「${dress.name}」コーデ ＆ 「${stage.name}」</p>
          </div>
        </div>
      `;
    }

    if (this.photoModalEl) {
      this.photoModalEl.classList.add('show');
    }
  }
}

window.GamePrincess = GamePrincess;
