/**
 * game_princess.js - 3Dプリンセス着せ替えゲーム (Royal Princess 3D Dress-up)
 * Three.js WebGL による完全立体・360度3D回転キャラクターモデル
 * 8カテゴリ × 各10種類（計80アイテム）、3Dターンテーブル、写真撮影、優雅なロイヤルワルツBGM
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

    // Three.js 関連オブジェクト
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.turntableGroup = null;
    this.characterGroup = null;
    this.pedestalMesh = null;
    this.pedestalGlow = null;
    this.animTime = 0;
    this.isThreeInitialized = false;

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
    this.stageSceneEl = document.getElementById('princess-stage-scene');
    this.canvasEl = document.getElementById('princess-three-canvas');
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
    if (window.soundSystem) {
      window.soundSystem.startPrincessBgm();
      window.soundSystem.playSparkle();
    }

    if (!this.isThreeInitialized) {
      this.initThree();
    } else {
      this.onResize();
    }

    this.toggleAutoSpin(false);
    this.rotationAngle = 0;
    if (this.turntableGroup) {
      this.turntableGroup.rotation.y = 0;
    }

    this.renderCategoryTabs();
    this.renderItemsGrid(this.currentCategory);
    this.buildCharacter3D();
    this.updateStageBackground();
  }

  stop() {
    this.toggleAutoSpin(false);
  }

  // =========================================================================
  // Three.js WebGL 3D シーン初期化
  // =========================================================================
  initThree() {
    if (!window.THREE || !this.canvasEl) return;

    const width = this.canvasEl.clientWidth || 320;
    const height = this.canvasEl.clientHeight || 460;

    // 1. シーン作成
    this.scene = new THREE.Scene();

    // 2. カメラ作成 (全身が綺麗に収まるアングル)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 1.05, 4.3);
    this.camera.lookAt(0, 0.95, 0);

    // 3. レンダラー作成 (背景透過・アンチエイリアス・高画質バッファ)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasEl,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // 4. ライティング設定 (アニメ調リッチスタジオライティング)
    const ambientLight = new THREE.AmbientLight(0xfff5f8, 0.85);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(2.5, 4, 3.5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffe4e8, 0.5);
    fillLight.position.set(-2.5, 2.5, 2.5);
    this.scene.add(fillLight);

    // 後方からのリムライト（髪やドレスの輪郭を美しく光らせる）
    const rimLight = new THREE.DirectionalLight(0xffeaa7, 0.7);
    rimLight.position.set(0, 3, -3.5);
    this.scene.add(rimLight);

    // 5. 3D 回転ターンテーブル＆キャラクターグループ
    this.turntableGroup = new THREE.Group();
    this.scene.add(this.turntableGroup);

    // 3D ターンテーブル台座（円形ゴールドステップ＆発光ディスク）
    const pedestalGeo = new THREE.CylinderGeometry(1.05, 1.15, 0.1, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf1c40f,
      metalness: 0.7,
      roughness: 0.25
    });
    this.pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    this.pedestalMesh.position.y = -0.05;
    this.turntableGroup.add(this.pedestalMesh);

    const glowGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.02, 36);
    this.pedestalGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf5cd79,
      emissive: 0xf5cd79,
      emissiveIntensity: 0.2,
      roughness: 0.3
    });
    this.pedestalGlow = new THREE.Mesh(glowGeo, this.pedestalGlowMat);
    this.pedestalGlow.position.y = 0.01;
    this.turntableGroup.add(this.pedestalGlow);

    // キャラクター親グループ
    this.characterGroup = new THREE.Group();
    this.turntableGroup.add(this.characterGroup);

    this.isThreeInitialized = true;

    // リサイズ監視
    window.addEventListener('resize', () => this.onResize());
    if (window.ResizeObserver && this.stageSceneEl) {
      const ro = new ResizeObserver(() => this.onResize());
      ro.observe(this.stageSceneEl);
    }

    // レンダリングループ開始
    this.animate();
  }

  onResize() {
    if (!this.renderer || !this.camera || !this.canvasEl) return;
    const width = this.canvasEl.clientWidth;
    const height = this.canvasEl.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.renderer || !this.scene || !this.camera) return;

    this.animTime += 0.025;

    // 微細な息づかい・浮遊アニメーション
    if (this.characterGroup) {
      this.characterGroup.position.y = Math.sin(this.animTime * 1.5) * 0.012;
    }

    // 羽やオーラのゆらめき
    if (this.wingsMesh) {
      this.wingsMesh.rotation.y = Math.sin(this.animTime * 3) * 0.12;
    }
    if (this.auraGroup) {
      this.auraGroup.rotation.y += 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // =========================================================================
  // イベントバインド
  // =========================================================================
  bindEvents() {
    const dragTarget = this.stageSceneEl || this.canvasEl;
    if (dragTarget) {
      const onStart = (e) => {
        if (e.target.closest('button') || e.target.closest('.stage-action-btn')) return;
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
        this.rotationAngle = (this.startAngle + deltaX * 0.015);
        if (this.turntableGroup) {
          this.turntableGroup.rotation.y = this.rotationAngle;
        }
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

    // 自動回転ボタン
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
      if (window.soundSystem) window.soundSystem.playSparkle();
      const spinLoop = () => {
        if (!this.isAutoSpinning) return;
        this.rotationAngle += 0.018;
        if (this.turntableGroup) {
          this.turntableGroup.rotation.y = this.rotationAngle;
        }
        this.spinAnimId = requestAnimationFrame(spinLoop);
      };
      this.spinAnimId = requestAnimationFrame(spinLoop);
    }
  }

  // =========================================================================
  // カテゴリ＆アイテムUI描画
  // =========================================================================
  renderCategoryTabs() {
    if (!this.categoriesTabsEl) return;
    this.categoriesTabsEl.innerHTML = '';

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'princess-cat-btn' + (cat.id === this.currentCategory ? ' active' : '');
      btn.dataset.category = cat.id;
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span><span class="cat-label">${cat.name}</span>`;

      btn.addEventListener('click', () => {
        if (window.soundSystem) window.soundSystem.playPop();
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

    items.forEach((item) => {
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
    if (window.soundSystem) {
      window.soundSystem.playDressSwoosh();
      window.soundSystem.playSparkle();
    }

    if (this.stageWrapperEl) {
      const rect = this.stageWrapperEl.getBoundingClientRect();
      this.app.particles.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    }

    this.renderItemsGrid(this.currentCategory);
    this.buildCharacter3D();

    if (category === 'stage') {
      this.updateStageBackground();
    }
  }

  randomizeCoordinate() {
    if (window.soundSystem) {
      window.soundSystem.playMagicChime ? window.soundSystem.playMagicChime() : window.soundSystem.playFanfare();
      window.soundSystem.playSparkle();
    }

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
    this.buildCharacter3D();
    this.updateStageBackground();
  }

  updateStageBackground() {
    const stageItem = this.database.stage.find(s => s.id === this.selected.stage) || this.database.stage[0];
    const sceneryBgEl = document.getElementById('princess-scenery-bg');
    if (sceneryBgEl) {
      sceneryBgEl.innerHTML = this.getStageSvg(stageItem);
    }
    if (this.pedestalGlowMat) {
      this.pedestalGlowMat.color.set(stageItem.floor || '#f5cd79');
      this.pedestalGlowMat.emissive.set(stageItem.floor || '#f5cd79');
    }
  }

  // =========================================================================
  // Three.js 立体3Dプリンセスモデル構築 (全カテゴリ 3D Mesh 生成)
  // =========================================================================
  buildCharacter3D() {
    if (!this.characterGroup || !window.THREE) return;

    // 既存の3Dメッシュをメモリ解放してクリア
    while (this.characterGroup.children.length > 0) {
      const obj = this.characterGroup.children[0];
      this.characterGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
    this.wingsMesh = null;
    this.auraGroup = null;

    const hair = this.database.hair.find(h => h.id === this.selected.hair) || this.database.hair[0];
    const dress = this.database.dress.find(d => d.id === this.selected.dress) || this.database.dress[0];
    const head = this.database.headwear.find(h => h.id === this.selected.headwear) || this.database.headwear[0];
    const makeup = this.database.makeup.find(m => m.id === this.selected.makeup) || this.database.makeup[0];
    const jewel = this.database.jewelry.find(j => j.id === this.selected.jewelry) || this.database.jewelry[0];
    const prop = this.database.props.find(p => p.id === this.selected.props) || this.database.props[0];
    const shoe = this.database.shoes.find(s => s.id === this.selected.shoes) || this.database.shoes[0];

    // 1. 素体（ヘッド・フェイス・首・上半身・腕・脚）
    this.create3DBody(makeup);

    // 2. 3D 立体ヘアスタイル（10種）
    this.create3DHair(hair);

    // 3. 3D 立体ドレス・ガウン（10種）
    this.create3DDress(dress);

    // 4. 3D ティアラ・頭飾り（10種）
    this.create3DHeadwear(head);

    // 5. 3D ジュエリー＆背中の羽・オーラ（10種）
    this.create3DJewelry(jewel);

    // 6. 3D 手持ちアイテム（10種）
    this.create3DProp(prop);

    // 7. 3D くつ・ガラスの靴（10種）
    this.create3DShoes(shoe);
  }

  // --- 1. 3D素体とダイナミック高解像度フェイス ---
  create3DBody(makeup) {
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffede6,
      roughness: 0.35,
      metalness: 0.05
    });

    // 頭部 3D 球体
    const headGeo = new THREE.SphereGeometry(0.28, 32, 24);
    headGeo.scale(1.0, 1.08, 0.95);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 1.52, 0);
    this.characterGroup.add(headMesh);

    // フェイスダイナミックテクスチャ（大きなアニメ瞳・キラキラハイライト・チーク・リップ）
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const ctx = faceCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    // チーク
    const blushColor = makeup.blush || '#ffb8b8';
    const leftBlushGrad = ctx.createRadialGradient(165, 305, 0, 165, 305, 45);
    leftBlushGrad.addColorStop(0, blushColor + 'b0');
    leftBlushGrad.addColorStop(1, blushColor + '00');
    ctx.fillStyle = leftBlushGrad;
    ctx.beginPath();
    ctx.arc(165, 305, 45, 0, Math.PI * 2);
    ctx.fill();

    const rightBlushGrad = ctx.createRadialGradient(347, 305, 0, 347, 305, 45);
    rightBlushGrad.addColorStop(0, blushColor + 'b0');
    rightBlushGrad.addColorStop(1, blushColor + '00');
    ctx.fillStyle = rightBlushGrad;
    ctx.beginPath();
    ctx.arc(347, 305, 45, 0, Math.PI * 2);
    ctx.fill();

    // 瞳の描画
    const drawEye = (cx, cy, isLeft) => {
      const eyeColor = makeup.eyeColor === 'oddeye' ? (isLeft ? '#0984e3' : '#f1c40f') : (makeup.eyeColor || '#0984e3');
      const isWink = !isLeft && makeup.mood === 'wink';

      if (isWink) {
        // ウインク目
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 36, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // まつげ
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy + 2);
        ctx.lineTo(cx + 42, cy - 8);
        ctx.stroke();
        return;
      }

      // 白目
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 52, 0, 0, Math.PI * 2);
      ctx.fill();

      // 虹彩グラデーション
      const irisGrad = ctx.createLinearGradient(cx, cy - 45, cx, cy + 45);
      irisGrad.addColorStop(0, '#130f40');
      irisGrad.addColorStop(0.35, eyeColor);
      irisGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 30, 44, 0, 0, Math.PI * 2);
      ctx.fill();

      // 瞳孔
      ctx.fillStyle = '#0a0a1e';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 14, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // キラキラハイライト
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 14, 10, 15, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, cy + 16, 6, 0, Math.PI * 2);
      ctx.fill();

      if (makeup.mood === 'heart') {
        ctx.fillStyle = '#ff7597';
        ctx.font = '24px sans-serif';
        ctx.fillText('💖', cx - 12, cy + 14);
      }

      // 上まつげアイライン
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 40, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // 目尻まつげ
      ctx.lineWidth = 6;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(cx - 30, cy - 20);
        ctx.lineTo(cx - 48, cy - 28);
      } else {
        ctx.moveTo(cx + 30, cy - 20);
        ctx.lineTo(cx + 48, cy - 28);
      }
      ctx.stroke();
    };

    drawEye(170, 240, true);
    drawEye(342, 240, false);

    // 眉毛
    ctx.strokeStyle = '#636e72';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(170, 185, 36, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(342, 185, 36, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // 鼻
    ctx.fillStyle = '#fab1a0';
    ctx.beginPath();
    ctx.arc(256, 305, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 口・リップグロス
    const lipColor = makeup.lip || '#ff7675';
    ctx.fillStyle = lipColor;
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (makeup.mood === 'cat') {
      ctx.moveTo(230, 355);
      ctx.quadraticCurveTo(243, 368, 256, 356);
      ctx.quadraticCurveTo(269, 368, 282, 355);
      ctx.stroke();
    } else {
      ctx.arc(256, 345, 18, 0.15, Math.PI - 0.15);
      ctx.fill();
      ctx.stroke();
      // リップハイライト
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(256, 354, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false
    });
    const facePlaneGeo = new THREE.PlaneGeometry(0.48, 0.48);
    const facePlane = new THREE.Mesh(facePlaneGeo, faceMat);
    facePlane.position.set(0, 1.51, 0.265);
    this.characterGroup.add(facePlane);

    // 耳
    const earGeo = new THREE.SphereGeometry(0.06, 12, 12);
    earGeo.scale(0.5, 1.0, 0.7);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.27, 1.51, -0.02);
    this.characterGroup.add(leftEar);
    const rightEar = leftEar.clone();
    rightEar.position.x = 0.27;
    this.characterGroup.add(rightEar);

    // 首
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.2, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.28, 0);
    this.characterGroup.add(neckMesh);

    // 上半身（デコルテ・肩・胸）
    const torsoGeo = new THREE.CylinderGeometry(0.12, 0.095, 0.38, 20);
    const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
    torsoMesh.position.set(0, 1.02, 0);
    this.characterGroup.add(torsoMesh);

    // 腕（左腕・右腕）
    const armGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.45, 16);
    const leftArm = new THREE.Mesh(armGeo, skinMat);
    leftArm.position.set(-0.21, 0.98, 0.02);
    leftArm.rotation.z = 0.18;
    this.characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinMat);
    rightArm.position.set(0.21, 0.98, 0.04);
    rightArm.rotation.z = -0.22;
    rightArm.rotation.x = -0.25; // 前方に少し曲げてアイテムを持たせる
    this.characterGroup.add(rightArm);

    // 手（左手・右手）
    const handGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(-0.25, 0.74, 0.02);
    this.characterGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0.26, 0.75, 0.14);
    this.characterGroup.add(rightHand);

    // 脚（左右）
    const legGeo = new THREE.CylinderGeometry(0.05, 0.038, 0.68, 16);
    const leftLeg = new THREE.Mesh(legGeo, skinMat);
    leftLeg.position.set(-0.06, 0.42, 0);
    this.characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, skinMat);
    rightLeg.position.set(0.06, 0.42, 0);
    this.characterGroup.add(rightLeg);
  }

  // --- 2. 3D ヘアスタイル（10種完全立体造形） ---
  create3DHair(hair) {
    const hairColor = parseInt(hair.color.replace('#', '0x'), 16);
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.35,
      metalness: 0.12
    });

    const hairGroup = new THREE.Group();
    this.characterGroup.add(hairGroup);

    // 共通ベース：頭頂部ヘアキャップ
    const capGeo = new THREE.SphereGeometry(0.3, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    capGeo.scale(1.02, 1.05, 1.02);
    const capMesh = new THREE.Mesh(capGeo, hairMat);
    capMesh.position.set(0, 1.54, 0);
    hairGroup.add(capMesh);

    // 前髪・フェイスサイドバングス（立体的に額とお顔を包み込む）
    const bangsGeo = new THREE.CylinderGeometry(0.31, 0.32, 0.18, 20, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const bangsMesh = new THREE.Mesh(bangsGeo, hairMat);
    bangsMesh.position.set(0, 1.62, 0.02);
    hairGroup.add(bangsMesh);

    // サイドの姫毛・横髪
    const sideLockGeo = new THREE.CylinderGeometry(0.035, 0.015, 0.42, 12);
    const leftLock = new THREE.Mesh(sideLockGeo, hairMat);
    leftLock.position.set(-0.25, 1.40, 0.12);
    leftLock.rotation.z = -0.12;
    hairGroup.add(leftLock);

    const rightLock = new THREE.Mesh(sideLockGeo, hairMat);
    rightLock.position.set(0.25, 1.40, 0.12);
    rightLock.rotation.z = 0.12;
    hairGroup.add(rightLock);

    const t = hair.type;

    if (t === 'royal_wave') {
      // 1. ロイヤルゴールデン：背中と肩周りに豊かに広がるウェーブヘア
      const backGeo = new THREE.CylinderGeometry(0.28, 0.42, 0.85, 20, 1, true, Math.PI * 0.4, Math.PI * 1.2);
      const backMesh = new THREE.Mesh(backGeo, hairMat);
      backMesh.position.set(0, 1.15, -0.06);
      hairGroup.add(backMesh);

      // 肩にかかる左右のロール束
      for (let i = -1; i <= 1; i += 2) {
        const curlGeo = new THREE.TorusGeometry(0.12, 0.045, 12, 24, Math.PI * 1.4);
        const curlMesh = new THREE.Mesh(curlGeo, hairMat);
        curlMesh.position.set(i * 0.24, 1.12, 0.05);
        curlMesh.rotation.y = i * 0.6;
        hairGroup.add(curlMesh);
      }
    } else if (t === 'twin_roll') {
      // 2. パステルピンクツイン：両サイドの巨大縦ロール・ツインドリル
      for (let i = -1; i <= 1; i += 2) {
        // お団子根本
        const bunGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const bunMesh = new THREE.Mesh(bunGeo, hairMat);
        bunMesh.position.set(i * 0.35, 1.65, -0.02);
        hairGroup.add(bunMesh);

        // スパイラルドリルロール（積層トーラス＆円錐）
        for (let j = 0; j < 5; j++) {
          const rollGeo = new THREE.TorusGeometry(0.09 - j * 0.012, 0.038, 12, 20);
          const rollMesh = new THREE.Mesh(rollGeo, hairMat);
          rollMesh.position.set(i * (0.35 + Math.sin(j * 0.8) * 0.03), 1.55 - j * 0.14, -0.02 + Math.cos(j * 0.8) * 0.03);
          rollMesh.rotation.x = Math.PI / 2;
          hairGroup.add(rollMesh);
        }
      }
    } else if (t === 'high_pony') {
      // 3. クリスタルシルバー：高めポニーテール
      const knotGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const knotMesh = new THREE.Mesh(knotGeo, hairMat);
      knotMesh.position.set(0, 1.76, -0.2);
      hairGroup.add(knotMesh);

      const ponyGeo = new THREE.CylinderGeometry(0.08, 0.03, 0.85, 16);
      const ponyMesh = new THREE.Mesh(ponyGeo, hairMat);
      ponyMesh.position.set(0.08, 1.35, -0.38);
      ponyMesh.rotation.x = -0.45;
      ponyMesh.rotation.z = -0.15;
      hairGroup.add(ponyMesh);
    } else if (t === 'half_up') {
      // 4. オーロララベンダー：ハーフアップ＆優美なロングバック
      const bunGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16);
      const bunMesh = new THREE.Mesh(bunGeo, hairMat);
      bunMesh.position.set(0, 1.62, -0.22);
      bunMesh.rotation.x = 0.5;
      hairGroup.add(bunMesh);

      const backGeo = new THREE.CylinderGeometry(0.24, 0.36, 0.95, 18, 1, true, Math.PI * 0.35, Math.PI * 1.3);
      const backMesh = new THREE.Mesh(backGeo, hairMat);
      backMesh.position.set(0, 1.05, -0.05);
      hairGroup.add(backMesh);
    } else if (t === 'rose_up') {
      // 5. エレガントローズ：頭頂部のローズシニヨンアップ
      const roseGroup = new THREE.Group();
      roseGroup.position.set(0, 1.84, -0.05);
      for (let r = 0; r < 4; r++) {
        const ringGeo = new THREE.TorusGeometry(0.06 + r * 0.035, 0.03, 12, 18);
        const ringMesh = new THREE.Mesh(ringGeo, hairMat);
        ringMesh.rotation.x = Math.PI / 2 + (r * 0.2);
        roseGroup.add(ringMesh);
      }
      hairGroup.add(roseGroup);
    } else if (t === 'soft_bob') {
      // 6. ミルキーミントボブ：首元を包み込むふんわり内巻きボブ
      const bobGeo = new THREE.SphereGeometry(0.36, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.7);
      bobGeo.scale(1.0, 0.9, 1.05);
      const bobMesh = new THREE.Mesh(bobGeo, hairMat);
      bobMesh.position.set(0, 1.48, -0.02);
      hairGroup.add(bobMesh);
    } else if (t === 'side_braid') {
      // 7. ルビーレッドサイド：左肩に垂れる三つ編み
      for (let b = 0; b < 6; b++) {
        const braidNodeGeo = new THREE.SphereGeometry(0.065 - b * 0.006, 12, 12);
        const braidNode = new THREE.Mesh(braidNodeGeo, hairMat);
        braidNode.position.set(-0.22 - b * 0.015, 1.42 - b * 0.12, 0.12 + Math.sin(b) * 0.03);
        hairGroup.add(braidNode);
      }
    } else if (t === 'starlight_long') {
      // 8. スターライトシフォン：超ロングストレート
      const longGeo = new THREE.CylinderGeometry(0.26, 0.38, 1.35, 20, 1, true, Math.PI * 0.3, Math.PI * 1.4);
      const longMesh = new THREE.Mesh(longGeo, hairMat);
      longMesh.position.set(0, 0.85, -0.05);
      hairGroup.add(longMesh);
    } else if (t === 'crown_braid') {
      // 9. ショコラクラシカル：王冠ブレード編み込み
      const crownBraidGeo = new THREE.TorusGeometry(0.29, 0.04, 14, 28);
      const crownBraidMesh = new THREE.Mesh(crownBraidGeo, hairMat);
      crownBraidMesh.position.set(0, 1.62, 0);
      crownBraidMesh.rotation.x = Math.PI / 2 - 0.15;
      hairGroup.add(crownBraidMesh);

      const backGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.7, 16, 1, true, Math.PI * 0.4, Math.PI * 1.2);
      const backMesh = new THREE.Mesh(backGeo, hairMat);
      backMesh.position.set(0, 1.2, -0.05);
      hairGroup.add(backMesh);
    } else if (t === 'fairy_short') {
      // 10. フェアリーショート：軽快なショートカット
      for (let s = 0; s < 8; s++) {
        const spikeGeo = new THREE.ConeGeometry(0.06, 0.22, 8);
        const spikeMesh = new THREE.Mesh(spikeGeo, hairMat);
        const angle = (s / 8) * Math.PI * 2;
        spikeMesh.position.set(Math.cos(angle) * 0.25, 1.55 + Math.sin(s) * 0.05, Math.sin(angle) * 0.25);
        spikeMesh.rotation.z = Math.cos(angle) * 0.5;
        spikeMesh.rotation.x = Math.sin(angle) * 0.5;
        hairGroup.add(spikeMesh);
      }
    }
  }

  // --- 3. 3D 立体ドレス・衣装（10種完全3Dシルエット） ---
  create3DDress(dress) {
    const mainColor = parseInt(dress.mainColor.replace('#', '0x'), 16);
    const subColor = parseInt(dress.subColor.replace('#', '0x'), 16);

    const dressMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.3,
      metalness: 0.15
    });

    const subDressMat = new THREE.MeshStandardMaterial({
      color: subColor,
      roughness: 0.35,
      metalness: 0.1
    });

    const dressGroup = new THREE.Group();
    this.characterGroup.add(dressGroup);

    // ビスチェ・コルセット胴体（全ドレス共通フィット）
    const corsetGeo = new THREE.CylinderGeometry(0.13, 0.105, 0.32, 20);
    const corsetMesh = new THREE.Mesh(corsetGeo, dressMat);
    corsetMesh.position.set(0, 0.98, 0);
    dressGroup.add(corsetMesh);

    // デコルテフリル・胸元トリム
    const trimGeo = new THREE.TorusGeometry(0.135, 0.02, 10, 24);
    const trimMesh = new THREE.Mesh(trimGeo, subDressMat);
    trimMesh.position.set(0, 1.13, 0);
    trimMesh.rotation.x = Math.PI / 2;
    dressGroup.add(trimMesh);

    const t = dress.type;

    if (t === 'cinderella_gown') {
      // 1. シンデレラ：大きくふくらむドーム型ボールガウン ＆ パフスリーブ
      const skirtGeo = new THREE.SphereGeometry(0.72, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
      skirtGeo.scale(1.0, 1.15, 0.95);
      const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
      skirtMesh.position.set(0, 0.84, 0);
      skirtMesh.rotation.x = Math.PI;
      dressGroup.add(skirtMesh);

      // パフスリーブ（両肩の雲のようなふんわり袖）
      for (let i = -1; i <= 1; i += 2) {
        const puffGeo = new THREE.SphereGeometry(0.09, 16, 16);
        const puffMesh = new THREE.Mesh(puffGeo, subDressMat);
        puffMesh.position.set(i * 0.19, 1.12, 0.02);
        dressGroup.add(puffMesh);
      }
    } else if (t === 'rose_frill') {
      // 2. ロイヤルローズピンク：3段ティアードフリルスカート
      for (let f = 0; f < 3; f++) {
        const frillGeo = new THREE.ConeGeometry(0.38 + f * 0.18, 0.36, 24, 1, true);
        const frillMesh = new THREE.Mesh(frillGeo, f % 2 === 0 ? dressMat : subDressMat);
        frillMesh.position.set(0, 0.72 - f * 0.22, 0);
        dressGroup.add(frillMesh);
      }
    } else if (t === 'midnight_star') {
      // 3. スターダストネイビー：星空Aラインガウン ＆ 星屑ケープ
      const skirtGeo = new THREE.ConeGeometry(0.68, 0.88, 28, 1, true);
      const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
      skirtMesh.position.set(0, 0.44, 0);
      dressGroup.add(skirtMesh);

      // 肩にかかるショールケープ
      const capeGeo = new THREE.CylinderGeometry(0.18, 0.32, 0.45, 20, 1, true, Math.PI * 0.3, Math.PI * 1.4);
      const capeMesh = new THREE.Mesh(capeGeo, subDressMat);
      capeMesh.position.set(0, 0.98, -0.02);
      dressGroup.add(capeMesh);
    } else if (t === 'fairy_chiffon') {
      // 4. フラワーフェアリー：花びら重なるシフォンスカート
      for (let p = 0; p < 8; p++) {
        const petalGeo = new THREE.ConeGeometry(0.22, 0.65, 12);
        petalGeo.scale(1.0, 1.0, 0.35);
        const petalMesh = new THREE.Mesh(petalGeo, p % 2 === 0 ? dressMat : subDressMat);
        const angle = (p / 8) * Math.PI * 2;
        petalMesh.position.set(Math.cos(angle) * 0.22, 0.52, Math.sin(angle) * 0.22);
        petalMesh.rotation.z = Math.cos(angle) * 0.35;
        petalMesh.rotation.x = Math.sin(angle) * 0.35;
        dressGroup.add(petalMesh);
      }
    } else if (t === 'aurora_mermaid') {
      // 5. オーロラマーメイド：マーメイドライン＆裾フリル
      const hipGeo = new THREE.CylinderGeometry(0.105, 0.24, 0.55, 20);
      const hipMesh = new THREE.Mesh(hipGeo, dressMat);
      hipMesh.position.set(0, 0.65, 0);
      dressGroup.add(hipMesh);

      const tailGeo = new THREE.ConeGeometry(0.65, 0.42, 24, 1, true);
      const tailMesh = new THREE.Mesh(tailGeo, subDressMat);
      tailMesh.position.set(0, 0.22, 0);
      dressGroup.add(tailMesh);
    } else if (t === 'sunlight_ball') {
      // 6. サンライトゴールド：パニエ広がる宮廷ガウン
      const skirtGeo = new THREE.SphereGeometry(0.78, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
      skirtGeo.scale(1.2, 1.1, 0.85);
      const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
      skirtMesh.position.set(0, 0.84, 0);
      skirtMesh.rotation.x = Math.PI;
      dressGroup.add(skirtMesh);
    } else if (t === 'snow_frost') {
      // 7. スノークイーン：氷のファセットガウン ＆ 立ち襟
      const iceSkirtGeo = new THREE.CylinderGeometry(0.11, 0.72, 0.85, 8, 1, true);
      const iceSkirt = new THREE.Mesh(iceSkirtGeo, dressMat);
      iceSkirt.position.set(0, 0.44, 0);
      dressGroup.add(iceSkirt);

      // 高い立ち襟
      const collarGeo = new THREE.CylinderGeometry(0.14, 0.09, 0.2, 16, 1, true, Math.PI * 0.4, Math.PI * 1.2);
      const collar = new THREE.Mesh(collarGeo, subDressMat);
      collar.position.set(0, 1.24, -0.04);
      dressGroup.add(collar);
    } else if (t === 'sweet_lolita') {
      // 8. スイートロリータ：カップケーキベルスカート ＆ 背中の大きなリボン
      const bellGeo = new THREE.SphereGeometry(0.55, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.65);
      const bellMesh = new THREE.Mesh(bellGeo, dressMat);
      bellMesh.position.set(0, 0.68, 0);
      bellMesh.rotation.x = Math.PI;
      dressGroup.add(bellMesh);

      // 背中のビッグリボン
      const ribbonGeo = new THREE.TorusGeometry(0.14, 0.045, 12, 20);
      const ribbonMesh = new THREE.Mesh(ribbonGeo, subDressMat);
      ribbonMesh.position.set(0, 0.85, -0.22);
      dressGroup.add(ribbonMesh);
    } else if (t === 'twilight_gown') {
      // 9. トワイライト：前が短く後ろが長いフィッシュテールガウン
      const highLowGeo = new THREE.CylinderGeometry(0.11, 0.65, 0.85, 24, 1, true);
      highLowGeo.scale(1.0, 1.0, 1.3);
      const highLow = new THREE.Mesh(highLowGeo, dressMat);
      highLow.position.set(0, 0.46, -0.15);
      highLow.rotation.x = 0.25;
      dressGroup.add(highLow);
    } else if (t === 'velvet_ruby') {
      // 10. クラシカルルビー：重厚なベルベットガウン ＆ 白ファー裾
      const skirtGeo = new THREE.ConeGeometry(0.65, 0.85, 24, 1, true);
      const skirtMesh = new THREE.Mesh(skirtGeo, dressMat);
      skirtMesh.position.set(0, 0.44, 0);
      dressGroup.add(skirtMesh);

      // ファートリム
      const furGeo = new THREE.TorusGeometry(0.66, 0.05, 12, 32);
      const furMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const furMesh = new THREE.Mesh(furGeo, furMat);
      furMesh.position.set(0, 0.02, 0);
      furMesh.rotation.x = Math.PI / 2;
      dressGroup.add(furMesh);
    }
  }

  // --- 4. 3D ティアラ・頭飾り（10種） ---
  create3DHeadwear(head) {
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.80, 0.02);
    this.characterGroup.add(headGroup);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.85, roughness: 0.2 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0x74b9ff, metalness: 0.3, roughness: 0.1 });

    const id = head.id;

    if (id === 'head_1') {
      // ダイヤモンドティアラ
      const bandGeo = new THREE.TorusGeometry(0.22, 0.015, 8, 24, Math.PI);
      const band = new THREE.Mesh(bandGeo, goldMat);
      band.rotation.x = Math.PI / 2 - 0.2;
      headGroup.add(band);

      for (let s = -2; s <= 2; s++) {
        const spikeGeo = new THREE.ConeGeometry(0.025, 0.08 - Math.abs(s) * 0.015, 8);
        const spike = new THREE.Mesh(spikeGeo, crystalMat);
        spike.position.set(s * 0.07, 0.06 - Math.abs(s) * 0.01, 0.15 - Math.abs(s) * 0.02);
        headGroup.add(spike);
      }
    } else if (id === 'head_2') {
      // ローズフラワークラウン
      for (let r = 0; r < 7; r++) {
        const flowerGeo = new THREE.SphereGeometry(0.038, 12, 12);
        const flowerMat = new THREE.MeshStandardMaterial({ color: r % 2 === 0 ? 0xff7675 : 0xffc5d3, roughness: 0.4 });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        const angle = (r / 6) * Math.PI * 0.8 - Math.PI * 0.4;
        flower.position.set(Math.sin(angle) * 0.24, 0.02, Math.cos(angle) * 0.24);
        headGroup.add(flower);
      }
    } else if (id === 'head_3') {
      // バタフライカチューシャ
      const wingGeo = new THREE.ConeGeometry(0.06, 0.12, 4);
      wingGeo.scale(1.0, 1.0, 0.1);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xa29bfe, transparent: true, opacity: 0.85 });
      const wingLeft = new THREE.Mesh(wingGeo, wingMat);
      wingLeft.position.set(-0.06, 0.08, 0.15);
      wingLeft.rotation.z = 0.5;
      headGroup.add(wingLeft);
      const wingRight = wingLeft.clone();
      wingRight.position.x = 0.06;
      wingRight.rotation.z = -0.5;
      headGroup.add(wingRight);
    } else if (id === 'head_4') {
      // 星屑のゴールドティアラ
      const starGeo = new THREE.OctahedronGeometry(0.045);
      for (let st = -2; st <= 2; st++) {
        const star = new THREE.Mesh(starGeo, goldMat);
        star.position.set(st * 0.08, 0.06, 0.18 - Math.abs(st) * 0.02);
        headGroup.add(star);
      }
    } else if (id === 'head_5' || id === 'head_7') {
      // リボン
      const bowColor = id === 'head_7' ? 0xff4757 : 0xffffff;
      const bowMat = new THREE.MeshStandardMaterial({ color: bowColor, roughness: 0.3 });
      const bowGeo = new THREE.TorusGeometry(0.12, 0.04, 10, 20);
      const bow = new THREE.Mesh(bowGeo, bowMat);
      bow.position.set(0, 0.06, 0.12);
      bow.rotation.x = Math.PI / 2;
      headGroup.add(bow);
    } else if (id === 'head_6') {
      // 氷の結晶クラウン
      for (let ic = -3; ic <= 3; ic++) {
        const iceGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.12 - Math.abs(ic) * 0.015, 6);
        const ice = new THREE.Mesh(iceGeo, crystalMat);
        ice.position.set(ic * 0.05, 0.08 - Math.abs(ic) * 0.01, 0.18 - Math.abs(ic) * 0.02);
        headGroup.add(ice);
      }
    } else if (id === 'head_8') {
      // フェザーコーム
      const featherGeo = new THREE.ConeGeometry(0.04, 0.22, 6);
      featherGeo.scale(1.0, 1.0, 0.2);
      const featherMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const feather = new THREE.Mesh(featherGeo, featherMat);
      feather.position.set(0.18, 0.05, 0.12);
      feather.rotation.z = -0.6;
      headGroup.add(feather);
    } else if (id === 'head_9') {
      // 月桂樹ゴールド冠
      const wreathGeo = new THREE.TorusGeometry(0.24, 0.02, 8, 24, Math.PI * 1.2);
      const wreath = new THREE.Mesh(wreathGeo, goldMat);
      wreath.rotation.x = Math.PI / 2 - 0.2;
      headGroup.add(wreath);
    } else if (id === 'head_10') {
      // キャットジュエル耳
      for (let c = -1; c <= 1; c += 2) {
        const earGeo = new THREE.ConeGeometry(0.06, 0.12, 4);
        const earMat = new THREE.MeshStandardMaterial({ color: 0xfd79a8, metalness: 0.4 });
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(c * 0.18, 0.08, 0.05);
        ear.rotation.z = -c * 0.3;
        headGroup.add(ear);
      }
    }
  }

  // --- 5. 3D ジュエリー＆背中の羽・オーラ（10種） ---
  create3DJewelry(jewel) {
    const jewelGroup = new THREE.Group();
    this.characterGroup.add(jewelGroup);

    const id = jewel.id;

    if (id === 'jewel_1') {
      // ロイヤルパールチョーカー
      for (let p = 0; p < 12; p++) {
        const pearlGeo = new THREE.SphereGeometry(0.015, 8, 8);
        const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.3 });
        const pearl = new THREE.Mesh(pearlGeo, pearlMat);
        const angle = (p / 12) * Math.PI * 2;
        pearl.position.set(Math.sin(angle) * 0.08, 1.25, Math.cos(angle) * 0.08);
        jewelGroup.add(pearl);
      }
    } else if (id === 'jewel_2' || id === 'jewel_8') {
      // ドロップダイヤ / ハートペンダント
      const gemColor = id === 'jewel_8' ? 0xff4757 : 0x74b9ff;
      const gemGeo = new THREE.OctahedronGeometry(0.035);
      const gemMat = new THREE.MeshStandardMaterial({ color: gemColor, metalness: 0.6, roughness: 0.1 });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(0, 1.15, 0.12);
      jewelGroup.add(gem);
    } else if (id === 'jewel_3') {
      // 光る妖精の羽 (3D立体半透明メッシュ)
      this.wingsMesh = new THREE.Group();
      this.wingsMesh.position.set(0, 1.15, -0.12);
      const wingGeo = new THREE.ConeGeometry(0.24, 0.65, 12);
      wingGeo.scale(1.0, 1.0, 0.1);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x55efc4,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        metalness: 0.2
      });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.25, 0.1, 0);
      leftWing.rotation.z = 0.8;
      this.wingsMesh.add(leftWing);

      const rightWing = leftWing.clone();
      rightWing.position.x = 0.25;
      rightWing.rotation.z = -0.8;
      this.wingsMesh.add(rightWing);
      jewelGroup.add(this.wingsMesh);
    } else if (id === 'jewel_4') {
      // 純白の天使の羽
      this.wingsMesh = new THREE.Group();
      this.wingsMesh.position.set(0, 1.18, -0.12);
      const wingGeo = new THREE.ConeGeometry(0.28, 0.8, 14);
      wingGeo.scale(1.0, 1.0, 0.15);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.35, 0.15, 0);
      leftWing.rotation.z = 0.9;
      this.wingsMesh.add(leftWing);

      const rightWing = leftWing.clone();
      rightWing.position.x = 0.35;
      rightWing.rotation.z = -0.9;
      this.wingsMesh.add(rightWing);
      jewelGroup.add(this.wingsMesh);
    } else if (id === 'jewel_7') {
      // バタフライオーラ球
      this.auraGroup = new THREE.Group();
      for (let a = 0; a < 6; a++) {
        const orbGeo = new THREE.SphereGeometry(0.04, 12, 12);
        const orbMat = new THREE.MeshStandardMaterial({
          color: a % 2 === 0 ? 0xa29bfe : 0xfeca57,
          emissive: 0xffffff,
          emissiveIntensity: 0.5
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        const angle = (a / 6) * Math.PI * 2;
        orb.position.set(Math.sin(angle) * 0.65, 0.8 + Math.sin(a * 2) * 0.3, Math.cos(angle) * 0.65);
        this.auraGroup.add(orb);
      }
      jewelGroup.add(this.auraGroup);
    }
  }

  // --- 6. 3D 手持ちアイテム（10種右手保持） ---
  create3DProp(prop) {
    const propGroup = new THREE.Group();
    propGroup.position.set(0.28, 0.76, 0.18); // 右手位置
    this.characterGroup.add(propGroup);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.8, roughness: 0.2 });
    const id = prop.id;

    if (id === 'prop_1') {
      // 星のまほうステッキ
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.65, 12);
      const rod = new THREE.Mesh(rodGeo, goldMat);
      propGroup.add(rod);

      const starGeo = new THREE.OctahedronGeometry(0.07);
      const starMat = new THREE.MeshStandardMaterial({ color: 0xfffa65, emissive: 0xfffa65, emissiveIntensity: 0.4 });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.y = 0.34;
      propGroup.add(star);
    } else if (id === 'prop_2') {
      // ロイヤルローズブーケ
      for (let r = 0; r < 5; r++) {
        const roseGeo = new THREE.SphereGeometry(0.045, 10, 10);
        const roseMat = new THREE.MeshStandardMaterial({ color: 0xff4757, roughness: 0.4 });
        const rose = new THREE.Mesh(roseGeo, roseMat);
        rose.position.set(Math.sin(r) * 0.05, 0.1 + Math.cos(r) * 0.04, 0.02);
        propGroup.add(rose);
      }
    } else if (id === 'prop_3') {
      // レース扇子
      const fanGeo = new THREE.CylinderGeometry(0.18, 0.02, 0.22, 12, 1, true, 0, Math.PI * 0.8);
      const fanMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, side: THREE.DoubleSide });
      const fan = new THREE.Mesh(fanGeo, fanMat);
      fan.position.set(0, 0.1, 0);
      fan.rotation.x = Math.PI / 2;
      propGroup.add(fan);
    } else if (id === 'prop_4') {
      // ランタン
      const lanternGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8);
      const lanternMat = new THREE.MeshStandardMaterial({ color: 0xfeca57, emissive: 0xfeca57, emissiveIntensity: 0.6 });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(0, -0.15, 0);
      propGroup.add(lantern);
    } else if (id === 'prop_5') {
      // テディベア
      const bearMat = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.7 });
      const bearBody = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), bearMat);
      bearBody.position.set(0, 0.05, 0);
      propGroup.add(bearBody);
      const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), bearMat);
      bearHead.position.set(0, 0.16, 0);
      propGroup.add(bearHead);
    } else if (id === 'prop_6') {
      // 三日月ロッド
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 12), goldMat);
      propGroup.add(rod);
      const moon = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI * 1.3), goldMat);
      moon.position.set(0, 0.32, 0);
      propGroup.add(moon);
    } else if (id === 'prop_7') {
      // ハープ
      const harp = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 20, Math.PI), goldMat);
      harp.position.set(0, 0.1, 0);
      propGroup.add(harp);
    } else if (id === 'prop_8') {
      // 魔法の手鏡
      const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), goldMat);
      mirror.position.set(0, 0.12, 0);
      mirror.rotation.x = Math.PI / 2;
      propGroup.add(mirror);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), goldMat);
      handle.position.set(0, -0.02, 0);
      propGroup.add(handle);
    } else if (id === 'prop_9') {
      // レース日傘
      const umbrellaGeo = new THREE.ConeGeometry(0.28, 0.15, 16, 1, true);
      const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xff7597, roughness: 0.4, side: THREE.DoubleSide });
      const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
      umbrella.position.set(0.05, 0.35, -0.05);
      umbrella.rotation.x = 0.4;
      propGroup.add(umbrella);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 8), goldMat);
      rod.position.set(0.05, 0.15, -0.05);
      rod.rotation.x = 0.4;
      propGroup.add(rod);
    } else if (id === 'prop_10') {
      // ティーセット
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 14), cupMat);
      saucer.position.set(0, 0.02, 0);
      propGroup.add(saucer);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.04, 12), cupMat);
      cup.position.set(0, 0.05, 0);
      propGroup.add(cup);
    }
  }

  // --- 7. 3D くつ・ガラスの靴（10種） ---
  create3DShoes(shoe) {
    const shoeColor = parseInt(shoe.color.replace('#', '0x'), 16);
    const shoeMat = new THREE.MeshStandardMaterial({
      color: shoeColor,
      roughness: 0.2,
      metalness: shoe.id === 'shoe_1' ? 0.8 : 0.2
    });

    for (let s = -1; s <= 1; s += 2) {
      const shoeGeo = new THREE.BoxGeometry(0.065, 0.04, 0.11);
      const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      shoeMesh.position.set(s * 0.06, 0.04, 0.02);
      this.characterGroup.add(shoeMesh);

      // ヒール
      const heelGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.06, 8);
      const heel = new THREE.Mesh(heelGeo, shoeMat);
      heel.position.set(s * 0.06, 0.03, -0.02);
      this.characterGroup.add(heel);
    }
  }

  // =========================================================================
  // 2D サムネイル ＆ 2D 背景ステージ SVG 生成ヘルパー
  // =========================================================================
  getDressSvgThumbnail(dress) {
    return `
      <svg viewBox="0 0 40 40" class="stage-thumb-svg">
        <rect width="40" height="40" fill="${dress.mainColor}"/>
        <path d="M12 10 L28 10 L24 20 L36 38 L4 38 L16 20 Z" fill="${dress.subColor}"/>
        <circle cx="20" cy="18" r="4" fill="#ffffff" opacity="0.6"/>
      </svg>
    `;
  }

  getHairSvgThumbnail(hair) {
    return `
      <svg viewBox="0 0 40 40" class="stage-thumb-svg">
        <rect width="40" height="40" fill="${hair.shadow}"/>
        <circle cx="20" cy="18" r="12" fill="${hair.color}"/>
        <path d="M12 18 Q20 30 28 18" stroke="${hair.shadow}" stroke-width="3" fill="none"/>
      </svg>
    `;
  }

  getStageSvg(stage) {
    const t = stage.type;
    if (t === 'ballroom') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#1e272e"/><stop offset="50%" stop-color="#2f3542"/><stop offset="100%" stop-color="#8c7ae6"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_1)"/>
          <path d="M0 0 L70 0 L55 480 L0 480 Z" fill="#c0392b" opacity="0.9"/>
          <path d="M320 0 L250 0 L265 480 L320 480 Z" fill="#c0392b" opacity="0.9"/>
          <line x1="160" y1="0" x2="160" y2="70" stroke="#f1c40f" stroke-width="2"/>
          <circle cx="160" cy="75" r="14" fill="#f1c40f"/><circle cx="135" cy="85" r="8" fill="#f1c40f"/><circle cx="185" cy="85" r="8" fill="#f1c40f"/>
        </svg>
      `;
    } else if (t === 'balcony') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#051937"/><stop offset="60%" stop-color="#004d7a"/><stop offset="100%" stop-color="#008793"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_2)"/>
          <circle cx="260" cy="70" r="32" fill="#fff9db"/>
          <circle cx="45" cy="65" r="2" fill="#ffffff"/><circle cx="120" cy="40" r="2.5" fill="#ffffff"/><circle cx="200" cy="110" r="2" fill="#ffffff"/>
        </svg>
      `;
    } else if (t === 'garden') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffb8b8"/><stop offset="50%" stop-color="#ff7675"/><stop offset="100%" stop-color="#55efc4"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_3)"/>
          <circle cx="35" cy="380" r="45" fill="#ff4757" opacity="0.85"/>
          <circle cx="285" cy="380" r="45" fill="#ff4757" opacity="0.85"/>
        </svg>
      `;
    } else if (t === 'ice_palace') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0984e3"/><stop offset="50%" stop-color="#74b9ff"/><stop offset="100%" stop-color="#dfe4ea"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_4)"/>
          <polygon points="160,20 190,180 130,180" fill="rgba(255,255,255,0.7)"/>
        </svg>
      `;
    } else if (t === 'fairy_forest') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_5" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#00b894"/><stop offset="50%" stop-color="#55efc4"/><stop offset="100%" stop-color="#ffeaa7"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_5)"/>
        </svg>
      `;
    } else if (t === 'twilight') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_6" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#6c5ce7"/><stop offset="50%" stop-color="#e84393"/><stop offset="100%" stop-color="#fdcb6e"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_6)"/>
        </svg>
      `;
    } else if (t === 'carriage') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#1e1b4b"/><stop offset="50%" stop-color="#312e81"/><stop offset="100%" stop-color="#c7d2fe"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_7)"/>
        </svg>
      `;
    } else if (t === 'cathedral') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_8" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#18181b"/><stop offset="50%" stop-color="#3f3f46"/><stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_8)"/>
        </svg>
      `;
    } else if (t === 'dream_room') {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_9" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fda4af"/><stop offset="50%" stop-color="#fbcfe8"/><stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_9)"/>
        </svg>
      `;
    } else {
      return `
        <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice" class="princess-scenery-svg">
          <defs>
            <linearGradient id="sc_bg_10" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0a0a14"/><stop offset="50%" stop-color="#1e1e38"/><stop offset="100%" stop-color="#2d1b4e"/>
            </linearGradient>
          </defs>
          <rect width="320" height="480" fill="url(#sc_bg_10)"/>
          <line x1="0" y1="28" x2="320" y2="28" stroke="#718093" stroke-width="3.5"/>
          <polygon points="35,28 105,480 205,480" fill="rgba(255, 71, 87, 0.3)"/>
          <polygon points="285,28 215,480 115,480" fill="rgba(0, 210, 211, 0.3)"/>
        </svg>
      `;
    }
  }

  // =========================================================================
  // 📸 写真撮影（Three.js WebGL キャプチャ合成）
  // =========================================================================
  takePrincessPhoto() {
    if (window.soundSystem) {
      window.soundSystem.playCameraShutter();
      window.soundSystem.playFanfare();
    }

    // フラッシュ演出
    const flash = document.createElement('div');
    flash.className = 'camera-flash-overlay';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // パーティクル
    this.app.particles.explode(window.innerWidth / 2, window.innerHeight / 2, 80);

    // Three.js Canvas から現在の3Dレンダリング画像をキャプチャ
    let imgDataUrl = '';
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      imgDataUrl = this.renderer.domElement.toDataURL('image/png');
    }

    if (this.photoPreviewCardEl) {
      const dress = this.database.dress.find(d => d.id === this.selected.dress);
      const stage = this.database.stage.find(s => s.id === this.selected.stage);

      this.photoPreviewCardEl.innerHTML = `
        <div class="polaroid-frame">
          <div class="polaroid-photo-view" style="position: relative; overflow: hidden; background: #1e272e;">
            <div style="position: absolute; inset: 0; pointer-events: none; z-index: 0;">
              ${this.getStageSvg(stage)}
            </div>
            ${imgDataUrl ? `<img src="${imgDataUrl}" style="position: relative; z-index: 1; width: 100%; height: 100%; object-fit: contain;" alt="Princess 3D Photo">` : ''}
            <span class="photo-sparkle-decor" style="position: absolute; top: 8px; right: 8px; z-index: 2;">✨ ⭐ ✨</span>
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
