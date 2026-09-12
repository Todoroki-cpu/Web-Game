/**
 * characters.js - アンパンマン風キャラクターのSVG描画とアニメーション管理
 */

class CharacterManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentCharacter = 'anpan';
    this.state = 'idle'; // idle, talking, eating, celebrate
    this.blinkTimer = null;
    this.isBlinking = false;
    
    this.init();
  }

  init() {
    this.render();
    this.startBlinkLoop();
  }

  setCharacter(charName) {
    this.currentCharacter = charName;
    this.render();
  }

  setState(state) {
    this.state = state;
    this.render();

    if (state === 'eating') {
      // 食べるアニメーション後にidleへ戻す
      setTimeout(() => {
        if (this.state === 'eating') {
          this.setState('celebrate');
        }
      }, 1200);
    } else if (state === 'celebrate') {
      setTimeout(() => {
        if (this.state === 'celebrate') {
          this.setState('idle');
        }
      }, 2500);
    }
  }

  startBlinkLoop() {
    const loop = () => {
      const delay = 2500 + Math.random() * 2000;
      this.blinkTimer = setTimeout(() => {
        this.isBlinking = true;
        this.render();
        setTimeout(() => {
          this.isBlinking = false;
          this.render();
          loop();
        }, 180);
      }, delay);
    };
    loop();
  }

  render() {
    if (!this.container) return;
    let svg = '';

    switch (this.currentCharacter) {
      case 'anpan':
        svg = this.getAnpanSvg();
        break;
      case 'baikin':
        svg = this.getBaikinSvg();
        break;
      case 'shokupan':
        svg = this.getShokupanSvg();
        break;
      case 'melonpan':
        svg = this.getMelonSvg();
        break;
      default:
        svg = this.getAnpanSvg();
    }

    const animClass = `char-${this.state}`;
    this.container.innerHTML = `<div class="character-wrapper ${animClass}">${svg}</div>`;
  }

  // あんぱんヒーロー
  getAnpanSvg() {
    const isEat = this.state === 'eating';
    const isCeleb = this.state === 'celebrate';
    const isTalk = this.state === 'talking';

    // 目の状態
    let eyeLeft = `<circle cx="82" cy="85" r="7" fill="#222" /><circle cx="80" cy="82" r="2.5" fill="#fff" />`;
    let eyeRight = `<circle cx="118" cy="85" r="7" fill="#222" /><circle cx="116" cy="82" r="2.5" fill="#fff" />`;
    if (this.isBlinking) {
      eyeLeft = `<path d="M75 86 Q82 92 89 86" stroke="#222" stroke-width="4" stroke-linecap="round" fill="none" />`;
      eyeRight = `<path d="M111 86 Q118 92 125 86" stroke="#222" stroke-width="4" stroke-linecap="round" fill="none" />`;
    } else if (isCeleb) {
      eyeLeft = `<path d="M74 88 Q82 78 90 88" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
      eyeRight = `<path d="M110 88 Q118 78 126 88" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    // 口の状態
    let mouth = `<path d="M86 118 Q100 135 114 118" stroke="#5c190c" stroke-width="4" stroke-linecap="round" fill="#d63031" />`;
    if (isEat) {
      mouth = `<ellipse cx="100" cy="122" rx="14" ry="18" fill="#d63031" stroke="#5c190c" stroke-width="3" />
               <path d="M90 128 Q100 135 110 128" fill="#fff" />`;
    } else if (isTalk) {
      mouth = `<ellipse cx="100" cy="122" rx="10" ry="12" fill="#d63031" stroke="#5c190c" stroke-width="3" />`;
    } else if (isCeleb) {
      mouth = `<path d="M82 116 Q100 142 118 116 Z" fill="#d63031" stroke="#5c190c" stroke-width="3.5" />
               <path d="M88 117 Q100 124 112 117" stroke="#fff" stroke-width="3" fill="none" />`;
    }

    // 腕の状態
    let arms = `
      <!-- 通常の腕 -->
      <path d="M55 155 Q35 170 45 185" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="43" cy="188" r="9" fill="#fbc531" stroke="#e17055" stroke-width="3" />
      <path d="M145 155 Q165 170 155 185" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="157" cy="188" r="9" fill="#fbc531" stroke="#e17055" stroke-width="3" />
    `;
    if (isCeleb) {
      arms = `
        <!-- 万歳の腕 -->
        <path d="M55 155 Q30 130 35 115" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="35" cy="110" r="10" fill="#fbc531" stroke="#e17055" stroke-width="3" />
        <path d="M145 155 Q170 130 165 115" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="165" cy="110" r="10" fill="#fbc531" stroke="#e17055" stroke-width="3" />
      `;
    }

    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <defs>
          <radialGradient id="breadGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fedbb5" />
            <stop offset="70%" stop-color="#e99757" />
            <stop offset="100%" stop-color="#c97334" />
          </radialGradient>
          <radialGradient id="cheekGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ff7675" />
            <stop offset="60%" stop-color="#d63031" />
            <stop offset="100%" stop-color="#b71540" />
          </radialGradient>
          <radialGradient id="noseGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ffa502" />
            <stop offset="60%" stop-color="#ff7f50" />
            <stop offset="100%" stop-color="#e55039" />
          </radialGradient>
        </defs>

        <!-- マント (茶色/黒) -->
        <path d="M60 145 Q40 195 30 205 Q100 215 170 205 Q160 195 140 145 Z" fill="#573e32" />

        <!-- からだ (赤い服) -->
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#e84118" rx="8" />
        
        <!-- 黄色いベルト -->
        <rect x="60" y="172" width="80" height="12" fill="#fbc531" />
        <circle cx="100" cy="178" r="9" fill="#e84118" />
        <circle cx="100" cy="178" r="6" fill="#fbc531" />

        <!-- あし -->
        <ellipse cx="80" cy="202" rx="14" ry="10" fill="#fbc531" stroke="#e17055" stroke-width="2" />
        <ellipse cx="120" cy="202" rx="14" ry="10" fill="#fbc531" stroke="#e17055" stroke-width="2" />

        <!-- うで -->
        ${arms}

        <!-- まんまる顔 -->
        <circle cx="100" cy="95" r="58" fill="url(#breadGrad)" stroke="#b3541e" stroke-width="3.5" />

        <!-- 眉毛 -->
        <path d="M72 70 Q83 62 92 72" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <path d="M108 72 Q117 62 128 70" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />

        <!-- 目 -->
        ${eyeLeft}
        ${eyeRight}

        <!-- ほっぺ（左） -->
        <circle cx="68" cy="106" r="18" fill="url(#cheekGrad)" stroke="#a31920" stroke-width="2" />
        <ellipse cx="64" cy="100" rx="5" ry="3" fill="#ffffff" opacity="0.75" />

        <!-- ほっぺ（右） -->
        <circle cx="132" cy="106" r="18" fill="url(#cheekGrad)" stroke="#a31920" stroke-width="2" />
        <ellipse cx="128" cy="100" rx="5" ry="3" fill="#ffffff" opacity="0.75" />

        <!-- はな（中央） -->
        <circle cx="100" cy="104" r="20" fill="url(#noseGrad)" stroke="#c23616" stroke-width="2.5" />
        <ellipse cx="95" cy="97" rx="6" ry="3.5" fill="#ffffff" opacity="0.8" />

        <!-- お口 -->
        ${mouth}
      </svg>
    `;
  }

  // ばいきんトモダチ（かわいいライバルキャラ）
  getBaikinSvg() {
    const isEat = this.state === 'eating';
    const isCeleb = this.state === 'celebrate';
    
    let mouth = `
      <path d="M75 110 L125 110 Q100 135 75 110 Z" fill="#ffffff" stroke="#2f3542" stroke-width="3" />
      <line x1="87" y1="110" x2="87" y2="120" stroke="#2f3542" stroke-width="2" />
      <line x1="100" y1="110" x2="100" y2="124" stroke="#2f3542" stroke-width="2" />
      <line x1="113" y1="110" x2="113" y2="120" stroke="#2f3542" stroke-width="2" />
    `;

    if (isEat) {
      mouth = `<ellipse cx="100" cy="120" rx="16" ry="16" fill="#d63031" stroke="#2f3542" stroke-width="3" />`;
    }

    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <defs>
          <radialGradient id="baikinBody" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#57606f" />
            <stop offset="60%" stop-color="#2f3542" />
            <stop offset="100%" stop-color="#1e272e" />
          </radialGradient>
        </defs>

        <!-- つの（2本） -->
        <path d="M75 55 Q60 15 45 25 Q65 45 75 60" fill="#2f3542" stroke="#1e272e" stroke-width="2" />
        <circle cx="43" cy="23" r="8" fill="#e74c3c" />
        <path d="M125 55 Q140 15 155 25 Q135 45 125 60" fill="#2f3542" stroke="#1e272e" stroke-width="2" />
        <circle cx="157" cy="23" r="8" fill="#e74c3c" />

        <!-- からだ -->
        <circle cx="100" cy="170" r="30" fill="url(#baikinBody)" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#747d8c" />
        <ellipse cx="120" cy="202" rx="12" ry="8" fill="#747d8c" />

        <!-- あたま -->
        <circle cx="100" cy="95" r="55" fill="url(#baikinBody)" stroke="#1e272e" stroke-width="3" />

        <!-- ほっぺ（ピンク） -->
        <ellipse cx="65" cy="105" rx="10" ry="7" fill="#ff7675" opacity="0.8" />
        <ellipse cx="135" cy="105" rx="10" ry="7" fill="#ff7675" opacity="0.8" />

        <!-- 目（おおきな白い目） -->
        <ellipse cx="78" cy="80" rx="14" ry="18" fill="#ffffff" stroke="#1e272e" stroke-width="3" />
        <ellipse cx="122" cy="80" rx="14" ry="18" fill="#ffffff" stroke="#1e272e" stroke-width="3" />
        <circle cx="${this.isBlinking ? 78 : 82}" cy="80" r="${this.isBlinking ? 1 : 6}" fill="#1e272e" />
        <circle cx="${this.isBlinking ? 122 : 118}" cy="80" r="${this.isBlinking ? 1 : 6}" fill="#1e272e" />

        <!-- はな（青紫色） -->
        <ellipse cx="100" cy="96" rx="11" ry="8" fill="#9b59b6" stroke="#2f3542" stroke-width="2" />

        <!-- おくち -->
        ${mouth}
      </svg>
    `;
  }

  // しょくぱんプリンス
  getShokupanSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- マント -->
        <path d="M60 145 Q40 195 30 205 Q100 215 170 205 Q160 195 140 145 Z" fill="#ffffff" stroke="#dfe4ea" stroke-width="2" />
        <!-- からだ -->
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#ffffff" stroke="#ced6e0" stroke-width="2" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#747d8c" />
        <ellipse cx="120" cy="202" rx="12" ry="8" fill="#747d8c" />

        <!-- 食パンの顔 -->
        <path d="M50 50 Q100 35 150 50 L155 130 Q100 145 45 130 Z" fill="#ffffff" stroke="#c07d3b" stroke-width="8" />

        <!-- 優しい目 -->
        <ellipse cx="80" cy="85" rx="5" ry="7" fill="#2ed573" stroke="#222" stroke-width="2" />
        <ellipse cx="120" cy="85" rx="5" ry="7" fill="#2ed573" stroke="#222" stroke-width="2" />

        <!-- 蝶ネクタイ -->
        <path d="M90 145 L110 145 L105 155 L110 165 L90 165 L95 155 Z" fill="#e74c3c" />

        <!-- 笑顔 -->
        <path d="M88 110 Q100 125 112 110" stroke="#c07d3b" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </svg>
    `;
  }

  // めろんぱんちゃん
  getMelonSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- からだ -->
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#2ed573" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#ffa502" />
        <ellipse cx="120" cy="202" rx="12" ry="8" fill="#ffa502" />

        <!-- メロンパン頭 -->
        <circle cx="100" cy="95" r="56" fill="#badc58" stroke="#6ab04c" stroke-width="4" />
        <!-- 格子模様 -->
        <path d="M60 70 L140 120 M60 120 L140 70 M80 50 L120 140 M120 50 L80 140" stroke="#6ab04c" stroke-width="2.5" opacity="0.6" />

        <!-- 大きく輝く目 -->
        <ellipse cx="78" cy="90" rx="9" ry="13" fill="#22a6b3" />
        <circle cx="76" cy="86" r="4" fill="#ffffff" />
        <ellipse cx="122" cy="90" rx="9" ry="13" fill="#22a6b3" />
        <circle cx="120" cy="86" r="4" fill="#ffffff" />

        <!-- ほっぺ -->
        <ellipse cx="62" cy="108" rx="8" ry="6" fill="#ff7675" opacity="0.7" />
        <ellipse cx="138" cy="108" rx="8" ry="6" fill="#ff7675" opacity="0.7" />

        <!-- お口 -->
        <path d="M90 115 Q100 128 110 115" stroke="#eb4d4b" stroke-width="3" fill="#ff7979" />
      </svg>
    `;
  }
}

window.CharacterManager = CharacterManager;
