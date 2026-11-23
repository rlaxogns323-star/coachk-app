/* COACH K — 전신 근육 지도 (앞·뒤)
   bodyMapSVG({ primary: [...], secondary: [...], heat: {근육id: 1~3} }) → SVG 문자열
   좌표: 한 사람 그림은 가로 200 × 세로 400. 왼쪽 절반만 그리고 오른쪽은 거울처럼 뒤집어 그립니다. */
(function () {
  const MUSCLES = {
    traps:       { ko: '승모근',        en: 'Trapezius' },
    delts_front: { ko: '앞어깨',        en: 'Anterior deltoid' },
    delts_side:  { ko: '옆어깨',        en: 'Lateral deltoid' },
    delts_rear:  { ko: '뒷어깨',        en: 'Posterior deltoid' },
    chest_upper: { ko: '윗가슴',        en: 'Upper chest' },
    chest:       { ko: '가슴',          en: 'Pectoralis major' },
    biceps:      { ko: '이두근',        en: 'Biceps' },
    triceps:     { ko: '삼두근',        en: 'Triceps' },
    forearms:    { ko: '전완근',        en: 'Forearms' },
    abs:         { ko: '복근',          en: 'Rectus abdominis' },
    obliques:    { ko: '옆구리',        en: 'Obliques' },
    upper_back:  { ko: '등 중앙',       en: 'Rhomboids' },
    lats:        { ko: '광배근',        en: 'Latissimus dorsi' },
    lower_back:  { ko: '허리',          en: 'Erector spinae' },
    glutes:      { ko: '엉덩이',        en: 'Gluteus maximus' },
    glute_med:   { ko: '옆 엉덩이',     en: 'Gluteus medius' },
    quads:       { ko: '허벅지 앞',     en: 'Quadriceps' },
    adductors:   { ko: '허벅지 안쪽',   en: 'Adductors' },
    hamstrings:  { ko: '허벅지 뒤',     en: 'Hamstrings' },
    calves:      { ko: '종아리',        en: 'Calves' }
  };

  /* 몸 바탕(실루엣) — 왼쪽 절반 */
  const BASE_HALF = [
    // 몸통
    'M100,54 L91,56 C80,60 70,63 64,68 C60,80 62,96 66,112 C68,130 70,150 72,170 C70,186 66,198 64,210 L100,214 Z',
    // 팔
    'M66,66 C54,66 47,76 46,92 C44,110 44,128 46,146 C41,166 37,188 36,212 C34,222 33,232 34,242 C36,250 44,250 46,242 C47,232 48,222 50,212 C55,190 60,168 62,150 C64,130 65,110 66,94 Z',
    // 다리
    'M64,206 C61,238 61,270 68,300 C64,324 64,350 70,374 L66,390 L88,390 L86,374 C90,350 90,324 86,302 C93,272 98,240 100,212 Z'
  ];

  /* 앞모습 근육 (왼쪽 절반) */
  const FRONT = {
    traps:       ['M92,52 C88,58 80,62 70,66 L92,63 Z'],
    delts_front: ['M72,66 C65,67 60,73 59,82 C58,91 59,99 61,105 C64,96 68,89 73,84 Z'],
    delts_side:  ['M69,65 C57,64 49,72 48,86 C47,96 50,104 54,110 C56,101 57,91 58,82 C60,73 64,67 69,65 Z'],
    chest_upper: ['M98,66 L76,66 C71,72 69,78 69,85 L98,83 Z'],
    chest:       ['M98,85 L69,87 C67,97 71,106 80,110 C88,113 94,111 98,107 Z'],
    biceps:      ['M55,110 C51,120 49,132 50,146 L60,146 C62,132 62,118 60,104 Z'],
    forearms:    ['M49,150 C43,166 39,186 38,210 L48,212 C51,192 56,170 60,150 Z'],
    obliques:    ['M71,114 C74,134 76,156 75,180 L86,186 L86,116 Z'],
    quads:       ['M70,212 C64,238 64,266 72,294 L86,296 C91,270 94,242 95,216 Z'],
    adductors:   ['M96,214 C95,232 92,248 88,264 C93,256 97,246 99,236 L99,212 Z'],
    calves:      ['M68,306 C64,326 65,350 72,370 L82,370 C85,350 86,326 84,306 Z']
  };
  const FRONT_CENTER = {
    abs: ['M87,114 Q100,111 113,114 L113,186 Q100,198 87,186 Z']
  };
  // 복근 칸 나누는 선 (색칠 안 함)
  const FRONT_DECO = 'M100,114 L100,192 M88,129 L112,129 M88,145 L112,145 M88,162 L112,162';

  /* 뒷모습 근육 (왼쪽 절반) */
  const BACK = {
    traps:       ['M100,48 L91,54 C84,58 76,62 70,66 L87,71 C91,82 95,94 100,104 Z'],
    delts_rear:  ['M70,66 C58,64 49,72 48,88 C48,97 50,104 53,109 C56,97 62,87 72,81 Z'],
    upper_back:  ['M87,73 L74,74 C71,81 71,89 73,96 L94,100 Z'],
    lats:        ['M68,92 C66,112 70,133 79,152 C85,160 92,164 98,166 L98,114 L95,103 L73,98 Z'],
    lower_back:  ['M98,118 L91,121 C89,140 89,162 91,184 L98,190 Z'],
    triceps:     ['M53,110 C49,120 47,133 48,148 L58,148 C60,134 60,118 59,104 Z'],
    forearms:    ['M48,152 C42,168 39,188 38,210 L48,212 C51,192 56,170 59,152 Z'],
    glute_med:   ['M75,182 C70,189 67,197 66,206 L80,198 L92,186 Z'],
    glutes:      ['M98,190 L88,189 C76,198 68,212 70,228 C77,238 90,240 98,234 Z'],
    hamstrings:  ['M70,238 C66,258 68,278 74,296 L88,296 C92,276 94,258 96,242 Z'],
    calves:      ['M71,304 C64,320 64,338 70,352 L85,352 C89,338 89,320 85,304 Z']
  };

  function half(paths, cls, attrs) {
    return paths.map((d) =>
      `<path class="${cls}" d="${d}" ${attrs}/><path class="${cls}" d="${d}" ${attrs} transform="translate(200,0) scale(-1,1)"/>`
    ).join('');
  }

  function fillFor(id, opt) {
    if (opt.primary && opt.primary.includes(id)) return 'var(--mus-primary, #D6AC42)';
    if (opt.secondary && opt.secondary.includes(id)) return 'var(--mus-secondary, #7C6633)';
    if (opt.heat && opt.heat[id]) {
      const lv = Math.max(1, Math.min(3, opt.heat[id]));
      return ['', 'rgba(214,172,66,0.38)', 'rgba(214,172,66,0.66)', '#D6AC42'][lv];
    }
    return 'var(--mus-idle, #2E2E2E)';
  }

  function figure(view, opt, dx) {
    const set = view === 'front' ? FRONT : BACK;
    let s = `<g transform="translate(${dx},0)">`;
    // 머리·목
    s += '<ellipse cx="100" cy="28" rx="16" ry="20" class="bm-base"/>';
    s += '<path class="bm-base" d="M92,44 L108,44 L109,58 L91,58 Z"/>';
    s += half(BASE_HALF, 'bm-base', '');
    for (const id in set) {
      s += half(set[id], 'bm-m', `data-m="${id}" style="fill:${fillFor(id, opt)}"`);
    }
    if (view === 'front') {
      for (const id in FRONT_CENTER) {
        s += FRONT_CENTER[id].map((d) => `<path class="bm-m" data-m="${id}" d="${d}" style="fill:${fillFor(id, opt)}"/>`).join('');
      }
      s += `<path d="${FRONT_DECO}" class="bm-deco"/>`;
    }
    s += `<text x="100" y="404" class="bm-label">${view === 'front' ? '앞' : '뒤'}</text>`;
    s += '</g>';
    return s;
  }

  function bodyMapSVG(opt) {
    opt = opt || {};
    const title = opt.title ? `<title>${opt.title}</title>` : '';
    return `<svg class="bodymap" viewBox="0 0 420 412" role="img" aria-label="${opt.title || '근육 지도'}" xmlns="http://www.w3.org/2000/svg">${title}` +
      figure('front', opt, 0) + figure('back', opt, 220) + '</svg>';
  }

  window.COACHK_MUSCLES = MUSCLES;
  window.bodyMapSVG = bodyMapSVG;
})();
