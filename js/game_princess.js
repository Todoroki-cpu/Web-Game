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
        { id: 'shoe_1', name: 'シンデレラガラスの靴', icon: '🥿', color: '#a4b0be', gem: '✨', type: 'glass_slippers' },
        { id: 'shoe_2', name: 'ローズリボンパンプス', icon: '👠', color: '#ff7597', gem: '🎀', type: 'rose_pumps' },
        { id: 'shoe_3', name: 'ダイヤモンドストラップ', icon: '👡', color: '#74b9ff', gem: '💎', type: 'diamond_sandals' },
        { id: 'shoe_4', name: 'ゴールドラメヒール', icon: '👠', color: '#f1c40f', gem: '🌟', type: 'gold_heels' },
        { id: 'shoe_5', name: 'レースアップシアーブーツ', icon: '👢', color: '#ffffff', gem: '🤍', type: 'laceup_boots' },
        { id: 'shoe_6', name: 'アイスクリスタルミュール', icon: '🥿', color: '#81ecec', gem: '❄️', type: 'ice_mules' },
        { id: 'shoe_7', name: 'ベルベットルビーヒール', icon: '👠', color: '#c0392b', gem: '🔴', type: 'ruby_heels' },
        { id: 'shoe_8', name: 'パールフラットシューズ', icon: '🩰', color: '#f5cd79', gem: '⚪', type: 'ballet_flats' },
        { id: 'shoe_9', name: 'バタフライアンクル靴', icon: '👡', color: '#a29bfe', gem: '🦋', type: 'butterfly_anklet' },
        { id: 'shoe_10', name: 'スターダストプラットフォーム', icon: '👠', color: '#2f3542', gem: '🌠', type: 'stardust_platform' }
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
        thumbPreview = `<div class="item-thumb-color" style="padding:0; overflow:hidden; border:1.5px solid ${item.subColor || '#ff4757'};">${this.getDressSvgThumbnail(item)}</div>`;
      } else if (categoryId === 'hair') {
        thumbPreview = `<div class="item-thumb-color" style="padding:0; overflow:hidden; border:1.5px solid ${item.shadow || '#f1c40f'};">${this.getHairSvgThumbnail(item)}</div>`;
      } else if (categoryId === 'stage') {
        thumbPreview = `<div class="item-thumb-color" style="padding:0; overflow:hidden; border:1.5px solid #ffbe76;">${this.getStageSvg(item)}</div>`;
      } else if (categoryId === 'makeup') {
        thumbPreview = `<div class="item-thumb-color" style="background: #ffeaa7;">${item.mood === 'wink' ? '😉' : (item.mood === 'heart' ? '😍' : '✨')}</div>`;
      } else if (categoryId === 'shoes') {
        thumbPreview = `<div class="item-thumb-color" style="padding:0; overflow:hidden; border:1.5px solid ${item.color || '#ff9f1a'};">${this.getShoesSvgThumbnail(item)}</div>`;
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
    const t = hair.type;
    const gradId = `backHairGrad_${hair.id}`;
    const defs = `
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${hair.color}"/>
          <stop offset="100%" stop-color="${hair.shadow}"/>
        </linearGradient>
      </defs>
    `;

    if (t === 'twin_roll') {
      // 2. ツインロール
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- ツインテール根本お団子 -->
          <circle cx="70" cy="85" r="18" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <circle cx="210" cy="85" r="18" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- 縦ロールツインドリル -->
          <path d="M55 85 Q30 150 50 250 Q75 260 85 235 Q65 150 85 85 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <path d="M225 85 Q250 150 230 250 Q205 260 195 235 Q215 150 195 85 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- ロールの螺旋ハイライト -->
          <path d="M40 140 Q65 160 80 140 M45 190 Q65 210 82 190" stroke="#ffffff" stroke-width="2.5" opacity="0.6" fill="none"/>
          <path d="M240 140 Q215 160 200 140 M235 190 Q215 210 198 190" stroke="#ffffff" stroke-width="2.5" opacity="0.6" fill="none"/>
        </svg>
      `;
    } else if (t === 'high_pony') {
      // 3. 高めポニーテール
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- ポニーテール結び目 -->
          <ellipse cx="140" cy="45" rx="30" ry="20" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- なびくポニーテール -->
          <path d="M150 40 Q210 20 240 90 Q260 180 225 260 Q195 240 215 170 Q210 90 160 48 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <circle cx="160" cy="42" r="6" fill="#ff4757"/>
        </svg>
      `;
    } else if (t === 'half_up') {
      // 4. ハーフアップ
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 上半分まとめ髪 -->
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q210 120 140 130 Q70 120 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- 下半分の流れるウェーブ -->
          <path d="M90 120 Q60 200 70 290 Q140 315 210 290 Q220 200 190 120 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <ellipse cx="140" cy="70" rx="14" ry="8" fill="#a29bfe" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'rose_up') {
      // 5. エレガントローズ（アップスタイル）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 頭頂部の大きなローズシニヨン -->
          <ellipse cx="140" cy="18" rx="38" ry="26" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <path d="M115 18 Q140 2 165 18 Q140 34 115 18" stroke="${hair.shadow}" stroke-width="2.5" fill="none"/>
          <circle cx="125" cy="14" r="3.5" fill="#ffffff"/><circle cx="155" cy="14" r="3.5" fill="#ffffff"/>
          <circle cx="140" cy="18" r="4" fill="#ff7675"/>
        </svg>
      `;
    } else if (t === 'soft_bob') {
      // 6. ふんわり内巻きボブ
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 肩上の短め丸みボブ -->
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q215 125 195 175 Q140 188 85 175 Q65 125 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <path d="M85 175 Q140 192 195 175" stroke="${hair.shadow}" stroke-width="3" fill="none"/>
        </svg>
      `;
    } else if (t === 'side_braid') {
      // 7. サイドテール三つ編み
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q210 130 140 140 Q85 130 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- 左肩に垂れる三つ編み -->
          <path d="M95 120 Q65 170 70 230 Q60 275 75 310 Q90 300 95 240 Q110 170 115 120 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <circle cx="75" cy="305" r="5" fill="#ff4757"/>
        </svg>
      `;
    } else if (t === 'starlight_long') {
      // 8. 姫カット超ロングストレート
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 膝下までまっすぐ伸びるスーパーロング -->
          <polygon points="85,75 78,22 140,20 202,22 195,75 228,200 220,365 60,365 52,200" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <line x1="100" y1="120" x2="100" y2="360" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
          <line x1="180" y1="120" x2="180" y2="360" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        </svg>
      `;
    } else if (t === 'crown_braid') {
      // 9. クラシカル王冠三つ編み
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q205 130 140 135 Q75 130 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <!-- 後頭部を包む三つ編みクラウン -->
          <path d="M85 70 Q140 100 195 70" stroke="${hair.shadow}" stroke-width="8" stroke-dasharray="6,4" fill="none"/>
        </svg>
      `;
    } else if (t === 'fairy_short') {
      // 10. フェアリーショート
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- すっきり短いピクシーショート -->
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q205 110 170 130 Q140 135 110 130 Q75 110 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
        </svg>
      `;
    } else {
      // 1. ロイヤルウェーブ (デフォルト)
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M85 75 Q78 22 140 20 Q202 22 195 75 Q240 140 235 260 Q215 320 185 325 Q140 335 95 325 Q65 320 45 260 Q40 140 85 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <path d="M50 230 Q40 290 65 325 Q85 335 105 315" fill="${hair.color}" opacity="0.6"/>
          <path d="M230 230 Q240 290 215 325 Q195 335 175 315" fill="${hair.color}" opacity="0.6"/>
        </svg>
      `;
    }
  }

  getBodySvg(makeup) {
    return `
      <svg viewBox="0 0 280 400" class="doll-svg">
        <!-- 首と肩 -->
        <path d="M128 115 L128 135 L105 145 L90 220 L105 220 L115 155 L140 155 L165 155 L175 220 L190 220 L175 145 L152 135 L152 115 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        
        <!-- 頭部・顔の輪郭 -->
        <path d="M102 75 Q100 115 140 125 Q180 115 178 75 Q175 40 140 40 Q105 40 102 75 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        
        <!-- 脚・レッグ（すらりと伸びたきれいな足） -->
        <path d="M118 245 L116 344 L130 344 L132 245 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        <path d="M148 245 L150 344 L164 344 L162 245 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>

        <!-- キャミソール＆ペチパンツ（ベース下着） -->
        <path d="M115 145 Q140 155 165 145 L170 210 Q140 215 110 210 Z" fill="#ffccd5" stroke="#ff8da1" stroke-width="1.5"/>
        <path d="M108 208 Q140 215 172 208 L175 245 Q158 250 140 240 Q122 250 105 245 Z" fill="#ffccd5" stroke="#ff8da1" stroke-width="1.5"/>
        <!-- レースフリル -->
        <path d="M115 145 Q140 150 165 145" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,4" fill="none"/>
      </svg>
    `;
  }

  getShoesSvgThumbnail(shoe) {
    const t = shoe.type || 'glass_slippers';
    const c = shoe.color || '#a4b0be';

    if (t === 'glass_slippers') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#f1f2f6"/>
          <path d="M8 26 Q12 16 26 18 L34 24 Q36 28 32 29 L10 29 Z" fill="rgba(164, 176, 190, 0.4)" stroke="#74b9ff" stroke-width="1.5"/>
          <path d="M10 29 L8 35 L12 35 L13 29 Z" fill="#74b9ff"/>
          <circle cx="28" cy="22" r="4" fill="#ffffff"/>
          <text x="24" y="25" font-size="9">✨</text>
        </svg>
      `;
    } else if (t === 'rose_pumps') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#fff0f5"/>
          <path d="M8 26 Q12 16 26 18 L34 24 Q36 28 32 29 L10 29 Z" fill="${c}" stroke="#ff4757" stroke-width="1.5"/>
          <path d="M10 29 L8 35 L11 35 L12 29 Z" fill="#ff4757"/>
          <circle cx="28" cy="21" r="5" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <text x="24" y="25" font-size="9">🎀</text>
        </svg>
      `;
    } else if (t === 'diamond_sandals') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#e8f4f8"/>
          <path d="M10 28 L32 28 Q34 30 30 31 L10 31 Z" fill="${c}" stroke="#2f3542" stroke-width="1.2"/>
          <path d="M10 31 L8 36 L11 36 L12 31 Z" fill="#2f3542"/>
          <path d="M14 28 L20 18 L26 28 M18 18 L22 18" stroke="${c}" stroke-width="2" fill="none"/>
          <text x="22" y="24" font-size="9">💎</text>
        </svg>
      `;
    } else if (t === 'gold_heels') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#fffbe6"/>
          <path d="M8 25 Q12 15 26 17 L34 23 Q36 27 32 28 L10 28 Z" fill="${c}" stroke="#d35400" stroke-width="1.5"/>
          <path d="M10 28 L7 36 L10 36 L12 28 Z" fill="#d35400"/>
          <polygon points="28,17 30,22 34,22 31,25 32,29 28,26 24,29 25,25 22,22 26,22" fill="#ffffff" stroke="#e67e22" stroke-width="0.8"/>
        </svg>
      `;
    } else if (t === 'laceup_boots') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#f8f9fa"/>
          <path d="M14 8 L24 8 L24 22 L34 26 Q35 30 31 31 L14 31 Z" fill="${c}" stroke="#2f3542" stroke-width="1.5"/>
          <path d="M14 31 L12 36 L17 36 L18 31 Z" fill="#2f3542"/>
          <path d="M18 10 L24 16 M24 12 L18 18 M18 18 L24 24" stroke="#ff4757" stroke-width="1.5"/>
          <circle cx="14" cy="8" r="2" fill="#ff7675"/><circle cx="19" cy="8" r="2" fill="#ff7675"/><circle cx="24" cy="8" r="2" fill="#ff7675"/>
        </svg>
      `;
    } else if (t === 'ice_mules') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#e0f7fa"/>
          <path d="M16 26 L26 18 L34 24 Q36 28 32 29 L18 29 Z" fill="${c}" stroke="#00bcd4" stroke-width="1.5"/>
          <path d="M18 29 L16 35 L19 35 L20 29 Z" fill="#00bcd4"/>
          <text x="22" y="24" font-size="10">❄️</text>
        </svg>
      `;
    } else if (t === 'ruby_heels') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#ffebee"/>
          <path d="M8 25 Q12 15 26 17 L34 23 Q36 27 32 28 L10 28 Z" fill="${c}" stroke="#2f3542" stroke-width="1.5"/>
          <path d="M10 28 L8 35 L11 35 L12 28 Z" fill="#f1c40f"/>
          <polygon points="28,19 32,22 30,26 26,26 24,22" fill="#ff4757" stroke="#f1c40f" stroke-width="1.2"/>
        </svg>
      `;
    } else if (t === 'ballet_flats') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#fff9db"/>
          <path d="M10 26 Q18 24 28 24 Q35 26 34 31 L10 31 Z" fill="${c}" stroke="#e67e22" stroke-width="1.5"/>
          <path d="M15 10 L25 24 M25 10 L15 24" stroke="#ffb8b8" stroke-width="1.8"/>
          <circle cx="20" cy="24" r="2" fill="#ffffff"/><circle cx="24" cy="24" r="2" fill="#ffffff"/><circle cx="28" cy="25" r="2" fill="#ffffff"/>
        </svg>
      `;
    } else if (t === 'butterfly_anklet') {
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#f3e5f5"/>
          <path d="M8 26 Q12 16 26 18 L34 24 Q36 28 32 29 L10 29 Z" fill="${c}" stroke="#6c5ce7" stroke-width="1.5"/>
          <path d="M10 29 L8 35 L11 35 L12 29 Z" fill="#6c5ce7"/>
          <path d="M14 18 Q6 10 12 6 Q20 12 16 18 Z" fill="#a29bfe" stroke="#ffffff" stroke-width="1"/>
          <text x="24" y="24" font-size="9">🦋</text>
        </svg>
      `;
    } else {
      // stardust_platform
      return `
        <svg viewBox="0 0 40 40" class="stage-thumb-svg">
          <rect width="40" height="40" fill="#2f3542"/>
          <path d="M8 22 Q12 14 26 16 L34 21 Q36 24 32 25 L10 25 Z" fill="#57606f" stroke="#feca57" stroke-width="1.2"/>
          <rect x="8" y="25" width="26" height="7" rx="2" fill="#1e272e" stroke="#feca57" stroke-width="1.2"/>
          <circle cx="14" cy="28" r="1.5" fill="#feca57"/><circle cx="21" cy="28" r="1.5" fill="#feca57"/><circle cx="28" cy="28" r="1.5" fill="#feca57"/>
          <text x="24" y="20" font-size="9">⭐</text>
        </svg>
      `;
    }
  }

  getShoesSvg(shoe) {
    const t = shoe.type || 'glass_slippers';
    const c = shoe.color || '#a4b0be';

    if (t === 'glass_slippers') {
      // 1. シンデレラガラスの靴（透明クリスタルグラデーション＆星屑ジュエル＆ガラスヒール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <defs>
            <linearGradient id="glassGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
              <stop offset="50%" stop-color="rgba(116, 185, 255, 0.6)"/>
              <stop offset="100%" stop-color="rgba(223, 230, 233, 0.9)"/>
            </linearGradient>
            <linearGradient id="glassGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
              <stop offset="50%" stop-color="rgba(116, 185, 255, 0.6)"/>
              <stop offset="100%" stop-color="rgba(223, 230, 233, 0.9)"/>
            </linearGradient>
          </defs>
          <!-- 左足ガラスの靴 -->
          <path d="M114 340 L132 340 L136 354 Q123 358 110 352 Z" fill="url(#glassGradLeft)" stroke="#74b9ff" stroke-width="1.8"/>
          <path d="M112 352 L110 357 L115 357 L116 353 Z" fill="rgba(116,185,255,0.8)" stroke="#74b9ff" stroke-width="1"/>
          <path d="M115 342 Q123 338 131 342" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <polygon points="124,342 126,346 130,346 127,349 128,353 124,350 120,353 121,349 118,346 122,346" fill="#ffffff" stroke="#74b9ff" stroke-width="0.8"/>
          <circle cx="124" cy="348" r="2" fill="#74b9ff"/>

          <!-- 右足ガラスの靴 -->
          <path d="M148 340 L166 340 L170 352 Q157 358 144 354 Z" fill="url(#glassGradRight)" stroke="#74b9ff" stroke-width="1.8"/>
          <path d="M164 353 L165 357 L170 357 L168 352 Z" fill="rgba(116,185,255,0.8)" stroke="#74b9ff" stroke-width="1"/>
          <path d="M149 342 Q157 338 165 342" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <polygon points="158,342 160,346 164,346 161,349 162,353 158,350 154,353 155,349 152,346 156,346" fill="#ffffff" stroke="#74b9ff" stroke-width="0.8"/>
          <circle cx="158" cy="348" r="2" fill="#74b9ff"/>
        </svg>
      `;
    } else if (t === 'rose_pumps') {
      // 2. ローズリボンパンプス（つま先リボン＆ピンクローズコサージュ＆ピンヒール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足パンプス -->
          <path d="M112 338 L132 338 L136 355 Q123 360 108 353 Z" fill="${c}" stroke="#ff4757" stroke-width="1.8"/>
          <path d="M110 353 L108 358 L113 358 L114 353 Z" fill="#ff4757" stroke="#2f3542" stroke-width="1"/>
          <path d="M116 340 Q123 336 130 340" stroke="#ffffff" stroke-width="2" fill="none"/>
          <!-- リボン＆ローズ -->
          <path d="M118 348 Q113 343 118 340 Q124 345 124 348 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M130 348 Q135 343 130 340 Q124 345 124 348 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <circle cx="124" cy="348" r="3.5" fill="#ff4757" stroke="#ffffff" stroke-width="1"/>

          <!-- 右足パンプス -->
          <path d="M148 338 L168 338 L172 353 Q157 360 144 355 Z" fill="${c}" stroke="#ff4757" stroke-width="1.8"/>
          <path d="M166 353 L167 358 L172 358 L170 353 Z" fill="#ff4757" stroke="#2f3542" stroke-width="1"/>
          <path d="M150 340 Q157 336 164 340" stroke="#ffffff" stroke-width="2" fill="none"/>
          <!-- リボン＆ローズ -->
          <path d="M152 348 Q147 343 152 340 Q158 345 158 348 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M164 348 Q169 343 164 340 Q158 345 158 348 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <circle cx="158" cy="348" r="3.5" fill="#ff4757" stroke="#ffffff" stroke-width="1"/>
        </svg>
      `;
    } else if (t === 'diamond_sandals') {
      // 3. ダイヤモンドストラップ（足首クロスストラップ＆大粒ダイヤスタッズ）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足ストラップサンダル -->
          <rect x="114" y="330" width="16" height="3" rx="1.5" fill="${c}" stroke="#2f3542" stroke-width="1"/>
          <line x1="116" y1="333" x2="128" y2="346" stroke="${c}" stroke-width="2.5"/>
          <line x1="128" y1="333" x2="116" y2="346" stroke="${c}" stroke-width="2.5"/>
          <path d="M110 348 L134 348 L135 355 Q123 358 108 354 Z" fill="#dfe4ea" stroke="#2f3542" stroke-width="1.5"/>
          <path d="M110 354 L108 358 L112 358 L113 354 Z" fill="#2f3542"/>
          <polygon points="122,333 124,330 126,333 124,336" fill="#74b9ff" stroke="#ffffff" stroke-width="1"/>
          <polygon points="122,347 124,344 126,347 124,350" fill="#74b9ff" stroke="#ffffff" stroke-width="1"/>

          <!-- 右足ストラップサンダル -->
          <rect x="150" y="330" width="16" height="3" rx="1.5" fill="${c}" stroke="#2f3542" stroke-width="1"/>
          <line x1="152" y1="333" x2="164" y2="346" stroke="${c}" stroke-width="2.5"/>
          <line x1="164" y1="333" x2="152" y2="346" stroke="${c}" stroke-width="2.5"/>
          <path d="M146 348 L170 348 L172 354 Q157 358 144 355 Z" fill="#dfe4ea" stroke="#2f3542" stroke-width="1.5"/>
          <path d="M168 354 L169 358 L173 358 L171 354 Z" fill="#2f3542"/>
          <polygon points="156,333 158,330 160,333 158,336" fill="#74b9ff" stroke="#ffffff" stroke-width="1"/>
          <polygon points="156,347 158,344 160,347 158,350" fill="#74b9ff" stroke="#ffffff" stroke-width="1"/>
        </svg>
      `;
    } else if (t === 'gold_heels') {
      // 4. ゴールドラメヒール（黄金の王冠バックル＆ゴールドスティレットヒール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足ゴールドヒール -->
          <path d="M112 338 L132 338 L136 355 Q123 360 108 353 Z" fill="${c}" stroke="#d35400" stroke-width="1.8"/>
          <path d="M110 353 L107 359 L112 359 L114 353 Z" fill="#d35400" stroke="#f1c40f" stroke-width="1"/>
          <!-- 王冠バックル -->
          <polygon points="118,348 120,343 124,345 128,343 130,348" fill="#ffffff" stroke="#d35400" stroke-width="1.2"/>
          <circle cx="120" cy="343" r="1" fill="#ff4757"/><circle cx="124" cy="345" r="1" fill="#74b9ff"/><circle cx="128" cy="343" r="1" fill="#ff4757"/>

          <!-- 右足ゴールドヒール -->
          <path d="M148 338 L168 338 L172 353 Q157 360 144 355 Z" fill="${c}" stroke="#d35400" stroke-width="1.8"/>
          <path d="M166 353 L167 359 L172 359 L170 353 Z" fill="#d35400" stroke="#f1c40f" stroke-width="1"/>
          <!-- 王冠バックル -->
          <polygon points="152,348 154,343 158,345 162,343 164,348" fill="#ffffff" stroke="#d35400" stroke-width="1.2"/>
          <circle cx="154" cy="343" r="1" fill="#ff4757"/><circle cx="158" cy="345" r="1" fill="#74b9ff"/><circle cx="162" cy="343" r="1" fill="#ff4757"/>
        </svg>
      `;
    } else if (t === 'laceup_boots') {
      // 5. レースアップシアーブーツ（足首上まで覆う編み上げ白ブーツ＆フリル履き口）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足ブーツ本体 -->
          <path d="M115 315 L131 315 L131 340 L136 355 Q123 359 108 353 L115 340 Z" fill="${c}" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M110 353 L108 358 L114 358 L115 353 Z" fill="#2f3542"/>
          <!-- 履き口フリル -->
          <path d="M114 315 Q123 311 132 315" stroke="#ff7675" stroke-width="3" stroke-dasharray="3,3" fill="none"/>
          <!-- 編み上げリボン紐 -->
          <line x1="118" y1="318" x2="128" y2="326" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="128" y1="318" x2="118" y2="326" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="118" y1="326" x2="128" y2="334" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="128" y1="326" x2="118" y2="334" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="118" y1="334" x2="128" y2="342" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="128" y1="334" x2="118" y2="342" stroke="#ff4757" stroke-width="1.5"/>

          <!-- 右足ブーツ本体 -->
          <path d="M149 315 L165 315 L165 340 L172 353 Q157 359 144 355 L149 340 Z" fill="${c}" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M166 353 L165 358 L171 358 L170 353 Z" fill="#2f3542"/>
          <!-- 履き口フリル -->
          <path d="M148 315 Q157 311 166 315" stroke="#ff7675" stroke-width="3" stroke-dasharray="3,3" fill="none"/>
          <!-- 編み上げリボン紐 -->
          <line x1="152" y1="318" x2="162" y2="326" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="162" y1="318" x2="152" y2="326" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="152" y1="326" x2="162" y2="334" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="162" y1="326" x2="152" y2="334" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="152" y1="334" x2="162" y2="342" stroke="#ff4757" stroke-width="1.5"/>
          <line x1="162" y1="334" x2="152" y2="342" stroke="#ff4757" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'ice_mules') {
      // 6. アイスクリスタルミュール（かかと開きミュール＆雪の結晶ブローチ＆氷柱ヒール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足ミュール -->
          <path d="M118 342 L134 340 L136 354 Q123 358 112 352 Z" fill="${c}" stroke="#00cec9" stroke-width="1.8"/>
          <path d="M112 352 L110 358 L114 358 L115 352 Z" fill="#81ecec" stroke="#00cec9" stroke-width="1"/>
          <!-- 雪の結晶チャーム -->
          <line x1="126" y1="341" x2="126" y2="351" stroke="#ffffff" stroke-width="2"/>
          <line x1="121" y1="346" x2="131" y2="346" stroke="#ffffff" stroke-width="2"/>
          <line x1="122" y1="342" x2="130" y2="350" stroke="#ffffff" stroke-width="1.5"/>
          <line x1="130" y1="342" x2="122" y2="350" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="126" cy="346" r="1.5" fill="#81ecec"/>

          <!-- 右足ミュール -->
          <path d="M146 340 L162 342 L168 352 Q157 358 144 354 Z" fill="${c}" stroke="#00cec9" stroke-width="1.8"/>
          <path d="M164 353 L165 358 L169 358 L168 352 Z" fill="#81ecec" stroke="#00cec9" stroke-width="1"/>
          <!-- 雪の結晶チャーム -->
          <line x1="156" y1="341" x2="156" y2="351" stroke="#ffffff" stroke-width="2"/>
          <line x1="151" y1="346" x2="161" y2="346" stroke="#ffffff" stroke-width="2"/>
          <line x1="152" y1="342" x2="160" y2="350" stroke="#ffffff" stroke-width="1.5"/>
          <line x1="160" y1="342" x2="152" y2="350" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="156" cy="346" r="1.5" fill="#81ecec"/>
        </svg>
      `;
    } else if (t === 'ruby_heels') {
      // 7. ベルベットルビーヒール（真紅のベルベット＆ゴールドソール＆特大ルビージュエル）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足ルビーヒール -->
          <path d="M112 338 L132 338 L136 355 Q123 360 108 353 Z" fill="${c}" stroke="#78281f" stroke-width="1.8"/>
          <path d="M108 353 Q123 360 136 355" stroke="#f1c40f" stroke-width="2" fill="none"/>
          <path d="M110 353 L108 358 L113 358 L114 353 Z" fill="#f1c40f" stroke="#78281f" stroke-width="1"/>
          <!-- ルビージュエル -->
          <polygon points="124,342 129,345 129,351 124,354 119,351 119,345" fill="#e74c3c" stroke="#f1c40f" stroke-width="1.5"/>
          <circle cx="124" cy="348" r="1.5" fill="#ffffff"/>

          <!-- 右足ルビーヒール -->
          <path d="M148 338 L168 338 L172 353 Q157 360 144 355 Z" fill="${c}" stroke="#78281f" stroke-width="1.8"/>
          <path d="M144 355 Q157 360 172 353" stroke="#f1c40f" stroke-width="2" fill="none"/>
          <path d="M166 353 L167 358 L172 358 L170 353 Z" fill="#f1c40f" stroke="#78281f" stroke-width="1"/>
          <!-- ルビージュエル -->
          <polygon points="158,342 163,345 163,351 158,354 153,351 153,345" fill="#e74c3c" stroke="#f1c40f" stroke-width="1.5"/>
          <circle cx="158" cy="348" r="1.5" fill="#ffffff"/>
        </svg>
      `;
    } else if (t === 'ballet_flats') {
      // 8. パールフラットシューズ（足首巻きサテンリボン＆ラウンドトゥ＆パール縁取り）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足バレエシューズ -->
          <line x1="116" y1="322" x2="130" y2="334" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="130" y1="322" x2="116" y2="334" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="116" y1="334" x2="130" y2="344" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="130" y1="334" x2="116" y2="344" stroke="#ffb8b8" stroke-width="2.5"/>
          <path d="M112 344 Q123 340 134 344 Q138 356 123 356 Q108 356 112 344 Z" fill="${c}" stroke="#d35400" stroke-width="1.5"/>
          <!-- パール縁取り -->
          <circle cx="116" cy="344" r="1.8" fill="#ffffff"/><circle cx="120" cy="343" r="1.8" fill="#ffffff"/><circle cx="124" cy="343" r="1.8" fill="#ffffff"/><circle cx="128" cy="344" r="1.8" fill="#ffffff"/>

          <!-- 右足バレエシューズ -->
          <line x1="150" y1="322" x2="164" y2="334" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="164" y1="322" x2="150" y2="334" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="150" y1="334" x2="164" y2="344" stroke="#ffb8b8" stroke-width="2.5"/>
          <line x1="164" y1="334" x2="150" y2="344" stroke="#ffb8b8" stroke-width="2.5"/>
          <path d="M146 344 Q157 340 168 344 Q172 356 157 356 Q142 356 146 344 Z" fill="${c}" stroke="#d35400" stroke-width="1.5"/>
          <!-- パール縁取り -->
          <circle cx="150" cy="344" r="1.8" fill="#ffffff"/><circle cx="154" cy="343" r="1.8" fill="#ffffff"/><circle cx="158" cy="343" r="1.8" fill="#ffffff"/><circle cx="162" cy="344" r="1.8" fill="#ffffff"/>
        </svg>
      `;
    } else if (t === 'butterfly_anklet') {
      // 9. バタフライアンクル靴（足首に大きく広がる立体バタフライウィング＆ラベンダーヒール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足バタフライウィングアンクレット -->
          <path d="M116 332 Q96 318 102 308 Q118 316 117 332 Z" fill="rgba(162, 155, 254, 0.85)" stroke="#6c5ce7" stroke-width="1.5"/>
          <path d="M116 332 Q100 338 105 344 Q116 340 117 332 Z" fill="rgba(162, 155, 254, 0.85)" stroke="#6c5ce7" stroke-width="1.5"/>
          <rect x="114" y="331" width="16" height="3" rx="1.5" fill="#6c5ce7"/>
          <path d="M112 338 L132 338 L136 355 Q123 360 108 353 Z" fill="${c}" stroke="#6c5ce7" stroke-width="1.8"/>
          <path d="M110 353 L108 358 L113 358 L114 353 Z" fill="#6c5ce7"/>
          <circle cx="116" cy="332" r="3" fill="#ffffff" stroke="#6c5ce7" stroke-width="1"/>

          <!-- 右足バタフライウィングアンクレット -->
          <path d="M164 332 Q184 318 178 308 Q162 316 163 332 Z" fill="rgba(162, 155, 254, 0.85)" stroke="#6c5ce7" stroke-width="1.5"/>
          <path d="M164 332 Q180 338 175 344 Q164 340 163 332 Z" fill="rgba(162, 155, 254, 0.85)" stroke="#6c5ce7" stroke-width="1.5"/>
          <rect x="150" y="331" width="16" height="3" rx="1.5" fill="#6c5ce7"/>
          <path d="M148 338 L168 338 L172 353 Q157 360 144 355 Z" fill="${c}" stroke="#6c5ce7" stroke-width="1.8"/>
          <path d="M166 353 L167 358 L172 358 L170 353 Z" fill="#6c5ce7"/>
          <circle cx="164" cy="332" r="3" fill="#ffffff" stroke="#6c5ce7" stroke-width="1"/>
        </svg>
      `;
    } else {
      // 10. スターダストプラットフォーム（厚底ウェッジソール＆ゴールドスタースタッズ＆夜空グラデーション）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          <!-- 左足プラットフォーム厚底 -->
          <rect x="114" y="330" width="16" height="3" rx="1.5" fill="#2f3542" stroke="#feca57" stroke-width="1"/>
          <rect x="114" y="335" width="16" height="3" rx="1.5" fill="#2f3542" stroke="#feca57" stroke-width="1"/>
          <path d="M112 340 L132 340 L136 348 L108 348 Z" fill="${c}" stroke="#feca57" stroke-width="1.5"/>
          <path d="M106 348 L138 348 L138 357 L106 357 Z" fill="#1e272e" stroke="#feca57" stroke-width="1.5"/>
          <polygon points="114,352 116,349 118,352 115,354 117,357 114,355 111,357 113,354 110,352 113,352" fill="#feca57"/>
          <polygon points="128,352 130,349 132,352 129,354 131,357 128,355 125,357 127,354 124,352 127,352" fill="#feca57"/>

          <!-- 右足プラットフォーム厚底 -->
          <rect x="150" y="330" width="16" height="3" rx="1.5" fill="#2f3542" stroke="#feca57" stroke-width="1"/>
          <rect x="150" y="335" width="16" height="3" rx="1.5" fill="#2f3542" stroke="#feca57" stroke-width="1"/>
          <path d="M148 340 L168 340 L172 348 L144 348 Z" fill="${c}" stroke="#feca57" stroke-width="1.5"/>
          <path d="M142 348 L174 348 L174 357 L142 357 Z" fill="#1e272e" stroke="#feca57" stroke-width="1.5"/>
          <polygon points="150,352 152,349 154,352 151,354 153,357 150,355 147,357 149,354 146,352 149,352" fill="#feca57"/>
          <polygon points="164,352 166,349 168,352 165,354 167,357 164,355 161,357 163,354 160,352 163,352" fill="#feca57"/>
        </svg>
      `;
    }
  }

  getHairSvgThumbnail(hair) {
    return `
      <svg viewBox="50 10 180 220" style="width:100%; height:100%; display:block; background:#fff5f7;">
        ${this.getBackHairSvg(hair)}
        <ellipse cx="140" cy="85" rx="34" ry="40" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="1.5"/>
        <circle cx="126" cy="82" r="3" fill="#0984e3"/><circle cx="154" cy="82" r="3" fill="#0984e3"/>
        <path d="M136 98 Q140 102 144 98" stroke="#ff7675" stroke-width="2" fill="#ff7675"/>
        ${this.getFrontHairSvg(hair)}
      </svg>
    `;
  }

  getDressSvgThumbnail(dress) {
    return `
      <svg viewBox="45 130 190 230" style="width:100%; height:100%; display:block; background:#fbfbfb;">
        ${this.getDressSvg(dress)}
      </svg>
    `;
  }

  getDressSvg(dress) {
    const t = dress.type;
    const gId = `dressGrad_${dress.id}`;
    const defs = `
      <defs>
        <linearGradient id="${gId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${dress.mainColor}"/>
          <stop offset="60%" stop-color="${dress.subColor}"/>
          <stop offset="100%" stop-color="${dress.mainColor}"/>
        </linearGradient>
        <linearGradient id="dressShine_${dress.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.4)"/>
        </linearGradient>
      </defs>
    `;

    if (t === 'cinderella_gown') {
      // 1. シンデレラクリスタル（ペプラム付き大舞踏会ガウン）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- ドーム型大パニエスカート -->
          <path d="M118 190 Q140 195 162 190 Q220 260 225 348 Q140 360 55 348 Q60 260 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M118 190 Q140 195 162 190 Q220 260 225 348 Q140 360 55 348 Q60 260 118 190 Z" fill="url(#dressShine_${dress.id})"/>
          <!-- 左右のシルバードレープペプラム（腰の羽根飾り） -->
          <path d="M118 190 Q85 190 70 215 Q95 235 120 210 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="1.5"/>
          <path d="M162 190 Q195 190 210 215 Q185 235 160 210 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="1.5"/>
          <!-- 裾のクリスタルレース -->
          <path d="M65 344 Q140 365 215 344" stroke="#ffffff" stroke-width="5" stroke-dasharray="6,6" fill="none"/>
          <!-- トップ＆オフショルダー -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <circle cx="140" cy="155" r="5" fill="#ffffff" stroke="#74b9ff" stroke-width="1.5"/>
          <path d="M96 144 Q115 132 125 144 Q112 154 96 144 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="1.5"/>
          <path d="M184 144 Q165 132 155 144 Q168 154 184 144 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'rose_frill') {
      // 2. ロイヤルローズピンク（3段ティアードフリル）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 3段フリルスカート -->
          <path d="M118 190 Q140 196 162 190 Q190 225 198 245 Q140 255 82 245 Q90 225 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M90 240 Q140 255 190 240 Q212 285 215 300 Q140 310 65 300 Q68 285 90 240 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M72 295 Q140 310 208 295 Q228 340 230 350 Q140 365 50 350 Q52 340 72 295 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <!-- フリル白レース縁取り -->
          <path d="M80 245 Q140 258 200 245" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,4" fill="none"/>
          <path d="M65 300 Q140 315 215 300" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,4" fill="none"/>
          <path d="M50 350 Q140 365 230 350" stroke="#ffffff" stroke-width="4" stroke-dasharray="5,5" fill="none"/>
          <!-- トップ -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <circle cx="140" cy="155" r="5" fill="#ffffff" stroke="#ff4757" stroke-width="1.5"/>
          <path d="M98 145 Q115 135 125 145 Q112 155 98 145 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M182 145 Q165 135 155 145 Q168 155 182 145 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'midnight_star') {
      // 3. スターダストネイビー（星形ギザギザ裾＆シアーサイドトレーン）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 星空のサイドシアートレイン -->
          <path d="M110 190 Q40 270 45 350 Q75 350 100 290 Z" fill="rgba(87, 96, 111, 0.45)" stroke="#feca57" stroke-width="1"/>
          <path d="M170 190 Q240 270 235 350 Q205 350 180 290 Z" fill="rgba(87, 96, 111, 0.45)" stroke="#feca57" stroke-width="1"/>
          <!-- 星形カットのスカート -->
          <polygon points="118,190 162,190 220,290 195,355 160,315 140,355 120,315 85,355 60,290" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <polygon points="195,355 160,315 140,355 120,315 85,355" fill="none" stroke="#feca57" stroke-width="2.5"/>
          <!-- トップ＆星屑ブローチ -->
          <path d="M112 140 Q140 148 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <polygon points="140,150 142,155 148,155 143,159 145,164 140,161 135,164 137,159 132,155 138,155" fill="#feca57"/>
          <path d="M96 142 Q115 130 125 142 Z" fill="#2f3542" stroke="#feca57" stroke-width="1.5"/>
          <path d="M184 142 Q165 130 155 142 Z" fill="#2f3542" stroke="#feca57" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'fairy_chiffon') {
      // 4. フラワーフェアリー（花びらカット＆リーフドレス）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 重なる花びらスカート -->
          <path d="M118 190 Q140 195 162 190 L205 250 L160 340 L120 250 Z" fill="url(#${gId})" stroke="#00b894" stroke-width="1.8"/>
          <path d="M118 190 Q140 195 162 190 L160 250 L120 340 L75 250 Z" fill="url(#${gId})" stroke="#00b894" stroke-width="1.8"/>
          <path d="M118 190 Q140 195 162 190 L185 270 L140 350 L95 270 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.8"/>
          <!-- つる草ベルト＆花飾り -->
          <path d="M116 195 Q140 202 164 195" stroke="#2ed573" stroke-width="4" fill="none"/>
          <circle cx="140" cy="198" r="5" fill="#ff7675"/><circle cx="132" cy="197" r="3.5" fill="#ffeaa7"/><circle cx="148" cy="197" r="3.5" fill="#ffeaa7"/>
          <!-- 花びらトップ -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#00b894" stroke-width="1.8"/>
          <path d="M96 142 Q115 130 125 142 Z" fill="#55efc4" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M184 142 Q165 130 155 142 Z" fill="#55efc4" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'aurora_mermaid') {
      // 5. オーロラマーメイド（タイト＆フィッシュテール）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- マーメイドラインスカート -->
          <path d="M118 190 Q140 195 162 190 Q175 250 165 295 Q140 298 115 295 Q105 250 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <!-- 裾の広がった魚尾フリル -->
          <path d="M115 295 Q140 298 165 295 Q210 330 230 355 Q140 348 50 355 Q70 330 115 295 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M50 355 Q140 345 230 355" stroke="${dress.glow}" stroke-width="3" fill="none"/>
          <!-- トップ -->
          <path d="M112 140 Q140 148 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <circle cx="140" cy="155" r="5" fill="${dress.glow}" stroke="#ffffff" stroke-width="1.5"/>
          <!-- 貝殻風ショルダー -->
          <path d="M96 142 Q115 130 125 142 Z" fill="${dress.subColor}" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M184 142 Q165 130 155 142 Z" fill="${dress.subColor}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'sunlight_ball') {
      // 6. サンライトゴールド（ロココ調超ワイドパニエ＆ゴールドドレープ）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 超ワイド横広がりパニエスカート -->
          <path d="M118 190 Q140 195 162 190 Q240 220 235 348 Q140 360 45 348 Q40 220 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M118 190 Q140 195 162 190 Q240 220 235 348 Q140 360 45 348 Q40 220 118 190 Z" fill="url(#dressShine_${dress.id})"/>
          <!-- ロココ調ゴールドフェストゥーン（花綱ドレープ） -->
          <path d="M120 210 Q80 260 50 320" stroke="#f1c40f" stroke-width="3" fill="none"/>
          <path d="M160 210 Q200 260 230 320" stroke="#f1c40f" stroke-width="3" fill="none"/>
          <circle cx="80" cy="260" r="4" fill="#ffffff"/><circle cx="200" cy="260" r="4" fill="#ffffff"/>
          <!-- トップ -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <circle cx="140" cy="155" r="5" fill="#f1c40f" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M96 142 Q115 130 125 142 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M184 142 Q165 130 155 142 Z" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'snow_frost') {
      // 7. スノークイーン（純白ハイネック＆氷のケープマント）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 氷のマントトレイン -->
          <path d="M100 145 Q40 260 45 350 Q140 360 235 350 Q240 260 180 145 Z" fill="rgba(129, 236, 236, 0.35)" stroke="#81ecec" stroke-width="1.5"/>
          <!-- ドレス本体 -->
          <path d="M118 190 Q140 195 162 190 Q205 260 215 345 Q140 355 65 345 Q75 260 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M65 345 Q140 355 215 345" stroke="#74b9ff" stroke-width="4" stroke-dasharray="5,5" fill="none"/>
          <!-- ハイネック＆トップ -->
          <path d="M112 135 L128 128 L152 128 L168 135 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <polygon points="140,145 144,153 140,161 136,153" fill="#81ecec" stroke="#ffffff" stroke-width="1"/>
          <!-- クリスタルショルダー -->
          <polygon points="98,142 110,132 124,142 112,150" fill="#ffffff" stroke="#81ecec" stroke-width="1.5"/>
          <polygon points="182,142 170,132 156,142 168,150" fill="#ffffff" stroke="#81ecec" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'sweet_lolita') {
      // 8. スイートロリータ（ひざ丈カップケーキパニエ）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- ふんわり丸いひざ丈ショートスカート -->
          <path d="M118 190 Q140 195 162 190 Q225 240 215 295 Q140 310 65 295 Q55 240 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M65 295 Q140 310 215 295" stroke="#ffffff" stroke-width="6" stroke-dasharray="6,4" fill="none"/>
          <!-- エプロン風ホワイトリボン -->
          <path d="M125 192 Q140 230 110 270 Q140 280 170 270 Q140 230 155 192 Z" fill="rgba(255,255,255,0.7)"/>
          <circle cx="140" cy="205" r="5" fill="#ff4757"/>
          <!-- トップ＆パフスリーブ -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <circle cx="106" cy="146" r="12" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="174" cy="146" r="12" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'twilight_gown') {
      // 9. トワイライトマジック（前後アシンメトリー・フィッシュテール＆月夜のローブ）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 後ろのロングトレイン -->
          <path d="M105 190 Q45 280 50 355 Q140 365 230 355 Q235 280 175 190 Z" fill="#4834d4" stroke="#e0c3fc" stroke-width="1.8"/>
          <!-- 前側の短いハイロースカート（脚が見える） -->
          <path d="M118 190 Q140 195 162 190 Q195 230 175 265 Q140 275 105 265 Q85 230 118 190 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M105 265 Q140 275 175 265" stroke="#f1c40f" stroke-width="3" fill="none"/>
          <!-- トップ＆三日月ベルト -->
          <path d="M112 140 Q140 148 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <path d="M140 195 Q145 192 143 186 Q138 188 138 192 Z" fill="#f1c40f"/>
          <!-- シアーショルダードレープ -->
          <path d="M96 142 Q115 130 125 142 Z" fill="#8e44ad" stroke="#e0c3fc" stroke-width="1.5"/>
          <path d="M184 142 Q165 130 155 142 Z" fill="#8e44ad" stroke="#e0c3fc" stroke-width="1.5"/>
        </svg>
      `;
    } else {
      // 10. クラシカルルビー（ベルベットオープンローブ＆ゴールドアンダースカート）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 下地のゴールド刺繍アンダースカート -->
          <path d="M118 190 Q140 195 162 190 Q215 260 220 348 Q140 360 60 348 Q65 260 118 190 Z" fill="#f5cd79" stroke="#f1c40f" stroke-width="2"/>
          <!-- 前開きベルベットローブ（左右に分かれた真紅のガウン） -->
          <path d="M118 190 Q95 240 60 348 Q100 350 120 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <path d="M162 190 Q185 240 220 348 Q180 350 160 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="2"/>
          <!-- 襟元のファー＆ジュエル -->
          <path d="M112 140 Q140 150 168 140 L164 195 Q140 200 116 195 Z" fill="url(#${gId})" stroke="#2f3542" stroke-width="1.8"/>
          <ellipse cx="140" cy="144" rx="26" ry="7" fill="#ffffff" stroke="#ced6e0" stroke-width="1.5"/>
          <circle cx="140" cy="155" r="5" fill="#f1c40f" stroke="#ffffff" stroke-width="1.5"/>
          <!-- ロイヤルベルベットスリーブ -->
          <rect x="94" y="140" width="16" height="22" rx="4" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
          <rect x="170" y="140" width="16" height="22" rx="4" fill="${dress.mainColor}" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;
    }
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
    const t = hair.type;
    const gradId = `frontHairGrad_${hair.id}`;
    const defs = `
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${hair.color}"/>
          <stop offset="100%" stop-color="${hair.shadow}"/>
        </linearGradient>
      </defs>
    `;

    if (t === 'twin_roll') {
      // 2. パステルピンクツイン（パッツン前髪＋サイドリボン＆ツインドリル）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- パッツン前髪＆頭頂部 -->
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q168 84 140 84 Q112 84 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- サイドロック -->
          <path d="M98 70 Q90 105 96 140 Q105 125 106 90 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q190 105 184 140 Q175 125 174 90 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <!-- ツインテール結び目のピンクのリボン -->
          <circle cx="70" cy="85" r="5" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M70 85 L55 75 Q50 90 68 88 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M70 85 L85 75 Q90 90 72 88 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <circle cx="210" cy="85" r="5" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M210 85 L195 75 Q190 90 208 88 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <path d="M210 85 L225 75 Q230 90 212 88 Z" fill="#ff7675" stroke="#ffffff" stroke-width="1"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)" transform="rotate(-3 140 44)"/>
        </svg>
      `;
    } else if (t === 'high_pony') {
      // 3. クリスタルシルバー（すっきりアップバング）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- 引き締めアップ前髪 -->
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q170 82 155 74 Q140 85 125 74 Q110 82 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- 繊細な触覚サイドヘア -->
          <path d="M100 75 Q92 110 96 145" stroke="url(#${gradId})" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          <path d="M180 75 Q188 110 184 145" stroke="url(#${gradId})" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          <ellipse cx="140" cy="42" rx="26" ry="4" fill="rgba(255,255,255,0.7)" transform="rotate(-2 140 42)"/>
        </svg>
      `;
    } else if (t === 'half_up') {
      // 4. オーロララベンダー（ふんわりセンターパート＋サイド編み込み）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q174 86 158 76 Q140 84 122 76 Q106 86 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- サイドのゆるふわウェーブ束 -->
          <path d="M98 70 Q82 110 92 155 Q104 135 106 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q198 110 188 155 Q176 135 174 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="45" rx="28" ry="4" fill="rgba(255,255,255,0.65)" transform="rotate(-3 140 45)"/>
        </svg>
      `;
    } else if (t === 'rose_up') {
      // 5. エレガントローズ（ノーブルなカール前髪＋後れ毛）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q175 88 156 74 Q140 86 124 74 Q105 88 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- 耳前のエレガントな巻き毛 -->
          <path d="M100 75 Q90 100 96 125 Q102 120 104 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M180 75 Q190 100 184 125 Q178 120 176 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)"/>
        </svg>
      `;
    } else if (t === 'soft_bob') {
      // 6. ミルキーミントボブ（ほっぺを包む内巻きボブ）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q168 85 140 82 Q112 85 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- ほっぺを包み込む内巻きサイド -->
          <path d="M98 70 Q78 105 88 150 Q106 160 108 140 Q104 110 106 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q202 105 192 150 Q174 160 172 140 Q176 110 174 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="45" rx="28" ry="4" fill="rgba(255,255,255,0.65)"/>
        </svg>
      `;
    } else if (t === 'side_braid') {
      // 7. ルビーレッドサイド（アシンメトリー前髪＋左胸に垂れる大三つ編み）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q168 86 145 78 Q118 88 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- 左肩から胸元に垂れる三つ編み -->
          <path d="M98 75 Q75 110 80 160 Q65 200 78 245 Q90 240 94 200 Q104 150 106 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="2"/>
          <circle cx="78" cy="245" r="4.5" fill="#f1c40f"/>
          <!-- 右側はすっきり -->
          <path d="M182 70 Q188 100 184 125 Q176 115 174 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)"/>
        </svg>
      `;
    } else if (t === 'starlight_long') {
      // 8. 姫カット超ロング（パッツン前髪＋直角姫カットサイド）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q160 82 140 82 Q120 82 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- 姫カット（あごラインで水平に切り揃えられたサイド） -->
          <polygon points="98,70 86,130 106,130 108,70" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <polygon points="182,70 194,130 174,130 172,70" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.7)"/>
        </svg>
      `;
    } else if (t === 'crown_braid') {
      // 9. クラシカル王冠三つ編み
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <!-- おでこを囲む三つ編みバンド -->
          <path d="M90 60 Q140 25 190 60" stroke="${hair.shadow}" stroke-width="8" stroke-dasharray="6,4" fill="none"/>
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q172 88 156 76 Q140 92 124 76 Q108 88 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <path d="M98 70 Q90 100 95 130 Q104 120 106 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q190 100 185 130 Q176 120 174 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
        </svg>
      `;
    } else if (t === 'fairy_short') {
      // 10. フェアリーショート（ハネ感のある軽快ピクシー）
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q175 88 162 76 Q150 92 140 78 Q130 92 118 76 Q105 88 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <!-- 外ハネのサイド毛先 -->
          <path d="M98 70 Q80 85 85 110 Q98 100 104 85 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q200 85 195 110 Q182 100 176 85 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)"/>
        </svg>
      `;
    } else {
      // 1. ロイヤルウェーブ (デフォルト)
      return `
        <svg viewBox="0 0 280 400" class="doll-svg">
          ${defs}
          <path d="M96 75 Q92 24 140 22 Q188 24 184 75 Q172 88 156 76 Q140 92 124 76 Q108 88 96 75 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.8"/>
          <path d="M98 70 Q88 115 95 160 Q105 135 108 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <path d="M182 70 Q192 115 185 160 Q175 135 172 95 Z" fill="url(#${gradId})" stroke="${hair.shadow}" stroke-width="1.5"/>
          <ellipse cx="140" cy="44" rx="28" ry="4" fill="rgba(255,255,255,0.65)" transform="rotate(-3 140 44)"/>
        </svg>
      `;
    }
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
