/**
 * characters.js - アンパンマン風 ＆ サンリオ風キャラクターのSVG描画とアニメーション管理
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
      // アンパンマン風
      case 'anpan': svg = this.getAnpanSvg(); break;
      case 'baikin': svg = this.getBaikinSvg(); break;
      case 'shokupan': svg = this.getShokupanSvg(); break;
      case 'melonpan': svg = this.getMelonSvg(); break;

      // サンリオ風
      case 'kitty': svg = this.getKittySvg(); break;
      case 'cinna': svg = this.getCinnaSvg(); break;
      case 'purin': svg = this.getPurinSvg(); break;
      case 'melody': svg = this.getMelodySvg(); break;

      default: svg = this.getAnpanSvg();
    }

    const animClass = `char-${this.state}`;
    this.container.innerHTML = `<div class="character-wrapper ${animClass}">${svg}</div>`;
  }

  // =========================================================================
  // サンリオ風キャラクター群
  // =========================================================================

  // 1. リボンキャット (キティ風)
  getKittySvg() {
    const isCeleb = this.state === 'celebrate';
    const isTalk = this.state === 'talking';

    let eyes = `
      <ellipse cx="78" cy="92" rx="4" ry="7" fill="#222"/>
      <ellipse cx="122" cy="92" rx="4" ry="7" fill="#222"/>
    `;
    if (this.isBlinking) {
      eyes = `
        <path d="M72 92 Q78 97 84 92" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M116 92 Q122 97 128 92" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    } else if (isCeleb) {
      eyes = `
        <path d="M72 94 Q78 86 84 94" stroke="#222" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M116 94 Q122 86 128 94" stroke="#222" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      `;
    }

    let mouth = ``;
    if (isTalk || isCeleb) {
      mouth = `<ellipse cx="100" cy="115" rx="6" ry="7" fill="#ff7675"/>`;
    }

    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- からだ (青いサロペット＆赤シャツ) -->
        <rect x="70" y="140" width="60" height="50" rx="16" fill="#e74c3c"/>
        <path d="M72 155 L128 155 L128 195 L72 195 Z" fill="#0984e3" rx="8"/>
        <!-- サロペットの黄色いボタン -->
        <circle cx="80" cy="162" r="4" fill="#f1c40f"/>
        <circle cx="120" cy="162" r="4" fill="#f1c40f"/>
        <!-- 手足 -->
        <circle cx="58" cy="160" r="10" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>
        <circle cx="142" cy="160" r="10" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>
        <ellipse cx="82" cy="198" rx="12" ry="8" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>
        <ellipse cx="118" cy="198" rx="12" ry="8" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>

        <!-- ネコ耳 (左・右) -->
        <polygon points="50,65 40,25 80,45" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>
        <polygon points="150,65 160,25 120,45" fill="#ffffff" stroke="#2f3542" stroke-width="3"/>

        <!-- 顔 (楕円) -->
        <ellipse cx="100" cy="95" rx="64" ry="52" fill="#ffffff" stroke="#2f3542" stroke-width="3.5"/>

        <!-- 赤いリボン (左耳元) -->
        <g transform="translate(48, 25) scale(0.9)">
          <circle cx="30" cy="30" r="10" fill="#ff4757" stroke="#c0392b" stroke-width="2"/>
          <path d="M22 30 L5 12 Q0 30 5 48 Z" fill="#ff4757" stroke="#c0392b" stroke-width="2"/>
          <path d="M38 30 L55 12 Q60 30 55 48 Z" fill="#ff4757" stroke="#c0392b" stroke-width="2"/>
        </g>

        <!-- 目 -->
        ${eyes}

        <!-- 黄色いお鼻 -->
        <ellipse cx="100" cy="103" rx="6" ry="4.5" fill="#f1c40f" stroke="#e67e22" stroke-width="1.5"/>

        <!-- ヒゲ (左右各3本) -->
        <line x1="45" y1="88" x2="25" y2="84" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="45" y1="96" x2="22" y2="96" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="45" y1="104" x2="25" y2="108" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>

        <line x1="155" y1="88" x2="175" y2="84" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="155" y1="96" x2="178" y2="96" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="155" y1="104" x2="175" y2="108" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round"/>

        ${mouth}
      </svg>
    `;
  }

  // 2. フラッフィーパピー (シナモン風)
  getCinnaSvg() {
    const isCeleb = this.state === 'celebrate';

    let eyes = `
      <ellipse cx="80" cy="92" rx="6" ry="8" fill="#3498db"/>
      <circle cx="78" cy="89" r="2.5" fill="#ffffff"/>
      <ellipse cx="120" cy="92" rx="6" ry="8" fill="#3498db"/>
      <circle cx="118" cy="89" r="2.5" fill="#ffffff"/>
    `;
    if (this.isBlinking) {
      eyes = `
        <path d="M74 92 Q80 97 86 92" stroke="#3498db" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M114 92 Q120 97 126 92" stroke="#3498db" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      `;
    }

    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- 長いたれ耳 (左・右) -->
        <path d="M55 85 C20 70 5 110 20 135 C35 155 60 130 65 105 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="3"/>
        <path d="M145 85 C180 70 195 110 180 135 C165 155 140 130 135 105 Z" fill="#ffffff" stroke="#74b9ff" stroke-width="3"/>

        <!-- からだ -->
        <ellipse cx="100" cy="165" rx="35" ry="30" fill="#ffffff" stroke="#74b9ff" stroke-width="2.5"/>
        <circle cx="75" cy="188" r="8" fill="#ffffff" stroke="#74b9ff" stroke-width="2"/>
        <circle cx="125" cy="188" r="8" fill="#ffffff" stroke="#74b9ff" stroke-width="2"/>

        <!-- 顔 -->
        <ellipse cx="100" cy="95" rx="55" ry="42" fill="#ffffff" stroke="#74b9ff" stroke-width="3"/>

        <!-- ほっぺ (ピンク) -->
        <ellipse cx="66" cy="104" rx="10" ry="7" fill="#ff7675" opacity="0.6"/>
        <ellipse cx="134" cy="104" rx="10" ry="7" fill="#ff7675" opacity="0.6"/>

        <!-- 目 -->
        ${eyes}

        <!-- おくち -->
        <path d="M94 104 Q100 112 106 104" stroke="#ff7675" stroke-width="3" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // 3. ベレーパピー (プリン風)
  getPurinSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- からだ (黄金色のまんまるボディ) -->
        <ellipse cx="100" cy="150" rx="58" ry="48" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3"/>
        <circle cx="50" cy="145" r="10" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2.5"/>
        <circle cx="150" cy="145" r="10" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2.5"/>
        <ellipse cx="78" cy="195" rx="14" ry="9" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2.5"/>
        <ellipse cx="122" cy="195" rx="14" ry="9" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2.5"/>

        <!-- たれ耳 -->
        <ellipse cx="48" cy="95" rx="12" ry="24" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3" transform="rotate(15 48 95)"/>
        <ellipse cx="152" cy="95" rx="12" ry="24" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3" transform="rotate(-15 152 95)"/>

        <!-- 頭 -->
        <circle cx="100" cy="100" r="50" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3"/>

        <!-- 茶色いベレー帽 -->
        <ellipse cx="100" cy="56" rx="28" ry="12" fill="#6d4c41"/>
        <rect x="98" y="44" width="4" height="8" rx="2" fill="#6d4c41"/>

        <!-- つぶらな瞳 -->
        <circle cx="82" cy="98" r="4.5" fill="#2d3436"/>
        <circle cx="118" cy="98" r="4.5" fill="#2d3436"/>

        <!-- 鼻と口 -->
        <circle cx="100" cy="105" r="3.5" fill="#2d3436"/>
        <path d="M94 112 Q100 118 106 112" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // 4. ピンクバニー (メロディ風)
  getMelodySvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <!-- ピンクの頭巾の耳 (左・右) -->
        <ellipse cx="75" cy="40" rx="14" ry="32" fill="#ff7675" stroke="#e17055" stroke-width="2.5" transform="rotate(-10 75 40)"/>
        <ellipse cx="125" cy="40" rx="14" ry="32" fill="#ff7675" stroke="#e17055" stroke-width="2.5" transform="rotate(10 125 40)"/>

        <!-- からだ (青いワンピース) -->
        <path d="M75 140 L125 140 L135 190 L65 190 Z" fill="#74b9ff" rx="10"/>
        <ellipse cx="80" cy="195" rx="10" ry="6" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>
        <ellipse cx="120" cy="195" rx="10" ry="6" fill="#ffffff" stroke="#dfe4ea" stroke-width="2"/>

        <!-- ピンクの頭巾 -->
        <circle cx="100" cy="95" r="54" fill="#ff7675" stroke="#e17055" stroke-width="3"/>
        <!-- お顔 (白い窓) -->
        <ellipse cx="100" cy="102" rx="38" ry="32" fill="#ffffff"/>

        <!-- お花ピン (右耳元) -->
        <circle cx="130" cy="65" r="7" fill="#ffffff"/>
        <circle cx="130" cy="65" r="3.5" fill="#f1c40f"/>

        <!-- 目 -->
        <ellipse cx="88" cy="100" rx="3.5" ry="6" fill="#2d3436"/>
        <ellipse cx="112" cy="100" rx="3.5" ry="6" fill="#2d3436"/>

        <!-- 黄色いお鼻 -->
        <ellipse cx="100" cy="106" rx="4" ry="3" fill="#f1c40f"/>
        <!-- 笑顔のおくち -->
        <path d="M96 114 Q100 120 104 114" stroke="#2d3436" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // =========================================================================
  // アンパンマン風キャラクター群（既存）
  // =========================================================================
  getAnpanSvg() {
    const isEat = this.state === 'eating';
    const isCeleb = this.state === 'celebrate';
    const isTalk = this.state === 'talking';

    let eyeLeft = `<circle cx="82" cy="85" r="7" fill="#222" /><circle cx="80" cy="82" r="2.5" fill="#fff" />`;
    let eyeRight = `<circle cx="118" cy="85" r="7" fill="#222" /><circle cx="116" cy="82" r="2.5" fill="#fff" />`;
    if (this.isBlinking) {
      eyeLeft = `<path d="M75 86 Q82 92 89 86" stroke="#222" stroke-width="4" stroke-linecap="round" fill="none" />`;
      eyeRight = `<path d="M111 86 Q118 92 125 86" stroke="#222" stroke-width="4" stroke-linecap="round" fill="none" />`;
    } else if (isCeleb) {
      eyeLeft = `<path d="M74 88 Q82 78 90 88" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
      eyeRight = `<path d="M110 88 Q118 78 126 88" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    }

    let mouth = `<path d="M86 118 Q100 135 114 118" stroke="#5c190c" stroke-width="4" stroke-linecap="round" fill="#d63031" />`;
    if (isEat) {
      mouth = `<ellipse cx="100" cy="122" rx="14" ry="18" fill="#d63031" stroke="#5c190c" stroke-width="3" /><path d="M90 128 Q100 135 110 128" fill="#fff" />`;
    } else if (isTalk) {
      mouth = `<ellipse cx="100" cy="122" rx="10" ry="12" fill="#d63031" stroke="#5c190c" stroke-width="3" />`;
    } else if (isCeleb) {
      mouth = `<path d="M82 116 Q100 142 118 116 Z" fill="#d63031" stroke="#5c190c" stroke-width="3.5" /><path d="M88 117 Q100 124 112 117" stroke="#fff" stroke-width="3" fill="none" />`;
    }

    let arms = `
      <path d="M55 155 Q35 170 45 185" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="43" cy="188" r="9" fill="#fbc531" stroke="#e17055" stroke-width="3" />
      <path d="M145 155 Q165 170 155 185" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="157" cy="188" r="9" fill="#fbc531" stroke="#e17055" stroke-width="3" />
    `;
    if (isCeleb) {
      arms = `
        <path d="M55 155 Q30 130 35 115" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="35" cy="110" r="10" fill="#fbc531" stroke="#e17055" stroke-width="3" />
        <path d="M145 155 Q170 130 165 115" stroke="#e17055" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="165" cy="110" r="10" fill="#fbc531" stroke="#e17055" stroke-width="3" />
      `;
    }

    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <path d="M60 145 Q40 195 30 205 Q100 215 170 205 Q160 195 140 145 Z" fill="#573e32" />
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#e84118" rx="8" />
        <rect x="60" y="172" width="80" height="12" fill="#fbc531" />
        <circle cx="100" cy="178" r="9" fill="#e84118" /><circle cx="100" cy="178" r="6" fill="#fbc531" />
        <ellipse cx="80" cy="202" rx="14" ry="10" fill="#fbc531" stroke="#e17055" stroke-width="2" />
        <ellipse cx="120" cy="202" rx="14" ry="10" fill="#fbc531" stroke="#e17055" stroke-width="2" />
        ${arms}
        <circle cx="100" cy="95" r="58" fill="#e99757" stroke="#b3541e" stroke-width="3.5" />
        <path d="M72 70 Q83 62 92 72" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <path d="M108 72 Q117 62 128 70" stroke="#222" stroke-width="4.5" stroke-linecap="round" fill="none" />
        ${eyeLeft} ${eyeRight}
        <circle cx="68" cy="106" r="18" fill="#ff7675" stroke="#a31920" stroke-width="2" />
        <circle cx="132" cy="106" r="18" fill="#ff7675" stroke="#a31920" stroke-width="2" />
        <circle cx="100" cy="104" r="20" fill="#ff7f50" stroke="#c23616" stroke-width="2.5" />
        <ellipse cx="95" cy="97" rx="6" ry="3.5" fill="#ffffff" opacity="0.8" />
        ${mouth}
      </svg>
    `;
  }

  getBaikinSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <path d="M75 55 Q60 15 45 25 Q65 45 75 60" fill="#2f3542" stroke="#1e272e" stroke-width="2" />
        <circle cx="43" cy="23" r="8" fill="#e74c3c" />
        <path d="M125 55 Q140 15 155 25 Q135 45 125 60" fill="#2f3542" stroke="#1e272e" stroke-width="2" />
        <circle cx="157" cy="23" r="8" fill="#e74c3c" />
        <circle cx="100" cy="170" r="30" fill="#2f3542" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#747d8c" /><ellipse cx="120" cy="202" rx="12" ry="8" fill="#747d8c" />
        <circle cx="100" cy="95" r="55" fill="#2f3542" stroke="#1e272e" stroke-width="3" />
        <ellipse cx="65" cy="105" rx="10" ry="7" fill="#ff7675" opacity="0.8" /><ellipse cx="135" cy="105" rx="10" ry="7" fill="#ff7675" opacity="0.8" />
        <ellipse cx="78" cy="80" rx="14" ry="18" fill="#ffffff" stroke="#1e272e" stroke-width="3" />
        <ellipse cx="122" cy="80" rx="14" ry="18" fill="#ffffff" stroke="#1e272e" stroke-width="3" />
        <circle cx="80" cy="80" r="6" fill="#1e272e" /><circle cx="120" cy="80" r="6" fill="#1e272e" />
        <ellipse cx="100" cy="96" rx="11" ry="8" fill="#9b59b6" stroke="#2f3542" stroke-width="2" />
        <path d="M75 110 L125 110 Q100 135 75 110 Z" fill="#ffffff" stroke="#2f3542" stroke-width="3" />
      </svg>
    `;
  }

  getShokupanSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <path d="M60 145 Q40 195 30 205 Q100 215 170 205 Q160 195 140 145 Z" fill="#ffffff" stroke="#dfe4ea" stroke-width="2" />
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#ffffff" stroke="#ced6e0" stroke-width="2" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#747d8c" /><ellipse cx="120" cy="202" rx="12" ry="8" fill="#747d8c" />
        <path d="M50 50 Q100 35 150 50 L155 130 Q100 145 45 130 Z" fill="#ffffff" stroke="#c07d3b" stroke-width="8" />
        <ellipse cx="80" cy="85" rx="5" ry="7" fill="#2ed573" stroke="#222" stroke-width="2" />
        <ellipse cx="120" cy="85" rx="5" ry="7" fill="#2ed573" stroke="#222" stroke-width="2" />
        <path d="M90 145 L110 145 L105 155 L110 165 L90 165 L95 155 Z" fill="#e74c3c" />
        <path d="M88 110 Q100 125 112 110" stroke="#c07d3b" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </svg>
    `;
  }

  getMelonSvg() {
    return `
      <svg viewBox="0 0 200 220" width="100%" height="100%" class="character-svg">
        <path d="M65 140 L135 140 L140 195 L60 195 Z" fill="#2ed573" />
        <ellipse cx="80" cy="202" rx="12" ry="8" fill="#ffa502" /><ellipse cx="120" cy="202" rx="12" ry="8" fill="#ffa502" />
        <circle cx="100" cy="95" r="56" fill="#badc58" stroke="#6ab04c" stroke-width="4" />
        <path d="M60 70 L140 120 M60 120 L140 70 M80 50 L120 140 M120 50 L80 140" stroke="#6ab04c" stroke-width="2.5" opacity="0.6" />
        <ellipse cx="78" cy="90" rx="9" ry="13" fill="#22a6b3" /><circle cx="76" cy="86" r="4" fill="#ffffff" />
        <ellipse cx="122" cy="90" rx="9" ry="13" fill="#22a6b3" /><circle cx="120" cy="86" r="4" fill="#ffffff" />
        <ellipse cx="62" cy="108" rx="8" ry="6" fill="#ff7675" opacity="0.7" /><ellipse cx="138" cy="108" rx="8" ry="6" fill="#ff7675" opacity="0.7" />
        <path d="M90 115 Q100 128 110 115" stroke="#eb4d4b" stroke-width="3" fill="#ff7979" />
      </svg>
    `;
  }
}

window.CharacterManager = CharacterManager;
