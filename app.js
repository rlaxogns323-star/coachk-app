/* COACH K 운동 기록 앱
   기록은 이 휴대폰(브라우저)에만 저장됩니다. 저장 이름: coachk_log_v1 */
(function () {
  'use strict';

  /* ───────── 기본 도구 ───────── */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MUS = window.COACHK_MUSCLES;
  const CATS = window.COACHK_CATEGORIES;
  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const KEY = 'coachk_log_v1';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ICON = {
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>'
  };

  /* ───────── 저장 ───────── */
  const blank = () => ({ v: 1, workouts: [], custom: [], settings: { rest: 90 } });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const d = JSON.parse(raw);
      const b = blank();
      return {
        v: 1,
        workouts: Array.isArray(d.workouts) ? d.workouts : [],
        custom: Array.isArray(d.custom) ? d.custom : [],
        settings: Object.assign(b.settings, d.settings || {})
      };
    } catch (e) { return blank(); }
  }
  let DB = load();
  let saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    const run = () => {
      try { localStorage.setItem(KEY, JSON.stringify(DB)); }
      catch (e) { toast('저장하지 못했습니다. 휴대폰 저장 공간을 확인해 주세요.'); }
    };
    if (now) run(); else saveTimer = setTimeout(run, 250);
  }
  window.addEventListener('pagehide', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(true); });
  // 오래 안 써도 기록이 지워지지 않도록 브라우저에 요청 (지원하는 곳만)
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

  /* ───────── 운동 정보 ───────── */
  let EXI = null;
  function exIndex() {
    if (!EXI) { EXI = {}; window.COACHK_EXERCISES.concat(DB.custom).forEach((e) => { EXI[e.id] = e; }); }
    return EXI;
  }
  const resetExIndex = () => { EXI = null; };
  const getEx = (id) => exIndex()[id] || { id, name: '삭제된 운동', en: '', cat: '', kind: 'weight', p: [], s: [] };
  const pickable = () => window.COACHK_EXERCISES.concat(DB.custom.filter((c) => !c.hidden));

  const FIELDS = {
    weight: [['w', '무게', 'kg', 'decimal'], ['r', '횟수', '회', 'numeric']],
    reps: [['r', '횟수', '회', 'numeric']],
    time: [['t', '시간', '초', 'numeric']],
    cardio: [['m', '시간', '분', 'decimal'], ['d', '거리', 'km', 'decimal']]
  };
  const KIND_LABEL = { weight: '무게 × 횟수', reps: '횟수만', time: '시간(초)', cardio: '유산소(분·km)' };
  const isNum = (v) => typeof v === 'number' && !isNaN(v);
  const hasVal = (s) => ['w', 'r', 't', 'm', 'd'].some((k) => isNum(s[k]));
  const fmtN = (n) => (Math.round(n * 10) / 10).toLocaleString('ko-KR');

  function setText(s, kind) {
    if (kind === 'weight') return (isNum(s.w) && s.w > 0 ? fmtN(s.w) + 'kg × ' : '') + (isNum(s.r) ? s.r : 0) + '회';
    if (kind === 'reps') return (isNum(s.r) ? s.r : 0) + '회';
    if (kind === 'time') return (isNum(s.t) ? s.t : 0) + '초';
    return (isNum(s.m) ? fmtN(s.m) : 0) + '분' + (isNum(s.d) ? ' · ' + fmtN(s.d) + 'km' : '');
  }

  /* ───────── 날짜 ───────── */
  const z = (n) => String(n).padStart(2, '0');
  const ymd = (d) => { d = d || new Date(); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
  const parseYmd = (s) => { const a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const fmtDate = (s, year) => { const d = parseYmd(s); return (year ? d.getFullYear() + '년 ' : '') + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + DAYS[d.getDay()] + ')'; };
  const fmtShort = (s) => { const d = parseYmd(s); return (d.getMonth() + 1) + '/' + d.getDate(); };
  function fmtDur(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    return m < 60 ? m + '분' : Math.floor(m / 60) + '시간 ' + (m % 60) + '분';
  }
  function weekStart(d) { d = new Date(d); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); d.setHours(0, 0, 0, 0); return d; }

  /* ───────── 계산 ───────── */
  const sortW = (a, b) => (b.date.localeCompare(a.date)) || ((b.start || 0) - (a.start || 0));
  const recorded = (it) => it.sets.filter(hasVal);
  function wStats(w) {
    let sets = 0, vol = 0;
    w.items.forEach((it) => {
      const kind = getEx(it.ex).kind;
      recorded(it).forEach((s) => { sets++; if (kind === 'weight' && isNum(s.w) && isNum(s.r)) vol += s.w * s.r; });
    });
    return { sets, vol, ex: w.items.filter((it) => recorded(it).length).length };
  }
  function muscleLoad(list) {
    const L = {};
    list.forEach((w) => w.items.forEach((it) => {
      const n = recorded(it).length; if (!n) return;
      const e = getEx(it.ex);
      e.p.forEach((m) => { L[m] = (L[m] || 0) + n; });
      e.s.forEach((m) => { L[m] = (L[m] || 0) + n * 0.5; });
    }));
    return L;
  }
  function heatOf(L) {
    const vals = Object.values(L); if (!vals.length) return {};
    const max = Math.max.apply(null, vals); const h = {};
    for (const k in L) { const r = L[k] / max; h[k] = r > 0.66 ? 3 : r > 0.33 ? 2 : 1; }
    return h;
  }
  function prevFor(exId, w) {
    const list = DB.workouts.filter((x) => x.id !== w.id && (x.date < w.date || (x.date === w.date && (x.start || 0) < (w.start || 0)))).sort(sortW);
    for (const x of list) {
      const it = x.items.find((i) => i.ex === exId && recorded(i).length);
      if (it) return { date: x.date, sets: recorded(it) };
    }
    return null;
  }
  const activeW = () => DB.workouts.find((w) => !w.end);
  const findW = (id) => DB.workouts.find((w) => w.id === id);

  /* ───────── 화면 상태 ───────── */
  const state = { tab: 'today', detail: null, calMonth: ymd().slice(0, 7), progEx: null };
  const view = $('#view');

  function render() {
    const titles = { today: '오늘 운동', history: '운동 기록', progress: '성장', more: '더보기' };
    $$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === state.tab));
    const dw = state.detail && findW(state.detail);
    $('#backBtn').hidden = !dw;
    if (dw) {
      $('#topTitle').textContent = fmtDate(dw.date);
      view.innerHTML = editorHTML(dw, false);
    } else {
      $('#topTitle').textContent = titles[state.tab];
      if (state.tab === 'today') view.innerHTML = todayHTML();
      else if (state.tab === 'history') view.innerHTML = historyHTML();
      else if (state.tab === 'progress') view.innerHTML = progressHTML();
      else view.innerHTML = moreHTML();
    }
    view.classList.toggle('has-rest', !$('#rest').hidden);
    tickElapsed();
  }

  /* ───────── 근육 표시 조각 ───────── */
  const mini = (opt) => '<div class="mini">' + window.bodyMapSVG(opt) + '</div>';
  const chipList = (ids, cls) => ids.map((m) => `<span class="mchip ${cls}">${esc(MUS[m] ? MUS[m].ko : m)}</span>`).join('');

  /* ───────── 오늘 운동 ───────── */
  function todayHTML() {
    const a = activeW();
    if (a) return editorHTML(a, true);
    const today = ymd();
    const ws = weekStart(new Date());
    const week = DB.workouts.filter((w) => w.end && parseYmd(w.date) >= ws);
    const wsets = week.reduce((n, w) => n + wStats(w).sets, 0);
    const wvol = week.reduce((n, w) => n + wStats(w).vol, 0);
    const doneToday = DB.workouts.filter((w) => w.date === today && w.end);
    let h = '';
    if (!isStandalone() && isMobile()) {
      h += '<div class="install-hint"><span>홈 화면에 설치하면 앱처럼 바로 열립니다</span><a href="index.html?stay=1#install">설치 방법</a></div>';
    }
    h += `<section class="hero">
      <div class="date">${fmtDate(today, true)}</div>
      <h2>${doneToday.length ? '오늘도 해냈습니다!' : '오늘 운동을 기록해 볼까요?'}</h2>
      <p>${doneToday.length ? '한 번 더 운동하셨다면 새로 기록해 주세요.' : '종목을 고르고 세트마다 무게와 횟수를 적으면 됩니다.'}</p>
      <button class="btn" type="button" data-act="start">${ICON.plus}오늘 운동 시작하기</button>
    </section>`;
    h += `<div class="sec"><div class="sec-h"><h2>이번 주</h2><span class="more">월요일부터</span></div>
      <div class="stats">
        <div class="stat"><b>${week.length}회</b><span>운동</span></div>
        <div class="stat"><b>${wsets}</b><span>세트</span></div>
        <div class="stat"><b>${wvol >= 10000 ? fmtN(wvol / 1000) + 't' : fmtN(wvol) + 'kg'}</b><span>들어 올린 무게</span></div>
      </div></div>`;
    const recent = DB.workouts.filter((w) => w.end && w.items.length).sort(sortW).slice(0, 4);
    if (recent.length) {
      h += '<div class="sec"><div class="sec-h"><h2>지난 운동 그대로 하기</h2></div><div class="list">';
      recent.forEach((w) => {
        const st = wStats(w);
        const names = w.items.map((it) => getEx(it.ex).name);
        h += `<button class="row-card" type="button" data-act="repeat" data-id="${w.id}">
          ${mini({ heat: heatOf(muscleLoad([w])) })}
          <div class="grow"><h3>${esc(names.slice(0, 2).join(', '))}${names.length > 2 ? ' 외 ' + (names.length - 2) + '개' : ''}</h3>
          <p>${fmtDate(w.date)} · ${st.ex}종목 ${st.sets}세트</p></div>${ICON.chev}</button>`;
      });
      h += '</div></div>';
    }
    return h;
  }

  function editorHTML(w, active) {
    let h = `<section class="card">
      <div class="w-head">
        <label class="w-date">${esc(fmtDate(w.date, true))} ${ICON.cal}
          <input type="date" value="${w.date}" max="${ymd()}" data-act="date" data-wid="${w.id}" aria-label="운동한 날짜 바꾸기"></label>
        ${active ? `<span class="w-elapsed" id="elapsed" data-start="${w.start}"></span>` : `<span class="w-elapsed">${w.end && w.start ? fmtDur(w.end - w.start) : ''}</span>`}
      </div>
      <textarea class="w-memo" rows="1" placeholder="메모 (컨디션, 느낀 점 등)" data-act="memo" data-wid="${w.id}">${esc(w.memo)}</textarea>
    </section>`;
    w.items.forEach((it, i) => { h += exCardHTML(w, it, i); });
    if (!w.items.length) h += '<p class="empty">아래 버튼을 눌러 오늘 할 운동을 골라 주세요.</p>';
    h += `<button class="add-ex" type="button" data-act="add-ex" data-wid="${w.id}">${ICON.plus}운동 추가하기</button>`;
    if (active) {
      h += `<div class="finish-area">
        <button class="btn" type="button" data-act="finish" data-wid="${w.id}">${ICON.check}운동 마치기</button>
        <button class="btn danger" type="button" data-act="cancel-w" data-wid="${w.id}">이번 운동 취소하기</button></div>`;
    } else {
      h += `<div class="finish-area">
        <button class="btn dark" type="button" data-act="show-summary" data-wid="${w.id}">이날 쓴 근육 보기</button>
        <button class="btn danger" type="button" data-act="del-w" data-wid="${w.id}">이 기록 삭제하기</button></div>`;
    }
    return h;
  }

  function exCardHTML(w, it, i) {
    const e = getEx(it.ex);
    const f = FIELDS[e.kind] || FIELDS.weight;
    const prev = prevFor(it.ex, w);
    let h = `<article class="ex" data-uid="${it.uid}">
      <div class="ex-head">
        <div class="ex-no">${i + 1}</div>
        <div class="ex-title"><h3>${esc(e.name)}</h3><p>${esc(e.en)}${e.cat ? ' · ' + esc(e.cat) : ''}</p></div>
        <button class="icon-btn" type="button" data-act="ex-menu" data-wid="${w.id}" data-i="${i}" aria-label="${esc(e.name)} 메뉴">${ICON.dots}</button>
      </div>
      <button class="ex-map" type="button" data-act="map" data-ex="${esc(e.id)}" aria-label="${esc(e.name)} 근육 자세히 보기">
        ${window.bodyMapSVG({ primary: e.p, secondary: e.s })}
        <div class="mus-list">
          ${e.p.length ? '<div class="lbl">주로 쓰는 근육</div><div class="chips">' + chipList(e.p, 'p') + '</div>' : ''}
          ${e.s.length ? '<div class="lbl">도와주는 근육</div><div class="chips">' + chipList(e.s, 's') + '</div>' : ''}
          <span class="zoom">크게 보기 ›</span>
        </div>
      </button>`;
    if (prev) h += `<p class="prev">지난번 ${fmtShort(prev.date)} · <b>${esc(prev.sets.slice(0, 4).map((s) => setText(s, e.kind)).join(', '))}${prev.sets.length > 4 ? ' …' : ''}</b></p>`;
    h += `<div class="sets"><div class="set-row head ${f.length === 1 ? 'one' : ''}"><span>세트</span>${f.map((x) => `<span>${x[1]}(${x[2]})</span>`).join('')}<span>완료</span></div>`;
    it.sets.forEach((s, j) => {
      const ph = placeholderFor(it, j, prev);
      h += `<div class="set-row ${f.length === 1 ? 'one' : ''} ${s.done ? 'done' : ''}">
        <span class="set-no">${j + 1}</span>
        ${f.map((x) => `<div class="set-cell"><input class="set-in" type="text" inputmode="${x[3]}" enterkeyhint="next" autocomplete="off"
            data-wid="${w.id}" data-i="${i}" data-j="${j}" data-f="${x[0]}" value="${isNum(s[x[0]]) ? s[x[0]] : ''}"
            placeholder="${ph && isNum(ph[x[0]]) ? ph[x[0]] : ''}" aria-label="${j + 1}세트 ${x[1]}"><span class="set-unit">${x[2]}</span></div>`).join('')}
        <button class="set-ok" type="button" data-act="toggle" data-wid="${w.id}" data-i="${i}" data-j="${j}" aria-label="${j + 1}세트 완료" aria-pressed="${!!s.done}">${ICON.check}</button>
      </div>`;
    });
    h += `</div><div class="ex-actions">
        <button type="button" data-act="add-set" data-wid="${w.id}" data-i="${i}">+ 세트 추가</button>
        ${it.sets.length ? `<button type="button" class="minus" data-act="del-set" data-wid="${w.id}" data-i="${i}" aria-label="마지막 세트 지우기">− 세트</button>` : ''}
      </div></article>`;
    return h;
  }

  // 칸이 비어 있을 때 흐리게 보여 줄 값: 지난번 같은 세트 → 바로 위 세트
  function placeholderFor(it, j, prev) {
    if (prev && prev.sets[j]) return prev.sets[j];
    for (let k = j - 1; k >= 0; k--) if (hasVal(it.sets[k])) return it.sets[k];
    if (prev && prev.sets.length) return prev.sets[prev.sets.length - 1];
    return null;
  }

  /* ───────── 기록(달력) ───────── */
  function historyHTML() {
    const [y, m] = state.calMonth.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const days = new Date(y, m, 0).getDate();
    const inMonth = DB.workouts.filter((w) => w.end && w.date.startsWith(state.calMonth)).sort(sortW);
    const byDay = {};
    inMonth.forEach((w) => { (byDay[w.date] = byDay[w.date] || []).push(w); });
    const today = ymd();
    let h = `<section class="card"><div class="cal-h">
      <button type="button" data-act="cal" data-d="-1" aria-label="이전 달">‹</button>
      <strong>${y}년 ${m}월</strong>
      <button type="button" data-act="cal" data-d="1" aria-label="다음 달">›</button></div>
      <div class="cal">${DAYS.map((d) => `<div class="dw">${d}</div>`).join('')}`;
    for (let k = 0; k < first.getDay(); k++) h += '<span class="d out"></span>';
    for (let d = 1; d <= days; d++) {
      const key = state.calMonth + '-' + z(d);
      const list = byDay[key];
      h += `<button type="button" class="d ${list ? 'has' : ''} ${list && list.length > 1 ? 'multi' : ''} ${key === today ? 'today' : ''}"
        ${list ? `data-act="open-w" data-id="${list[0].id}"` : 'disabled'} aria-label="${m}월 ${d}일${list ? ' 운동 기록 있음' : ''}">${d}</button>`;
    }
    h += `</div><p class="small muted" style="margin-top:10px">이번 달 <b class="gold">${Object.keys(byDay).length}일</b> 운동하셨습니다.</p></section>`;
    h += '<div class="sec"><div class="sec-h"><h2>이번 달 기록</h2></div>';
    if (!inMonth.length) h += '<p class="empty">이 달에는 기록이 없습니다.</p>';
    else {
      h += '<div class="list">';
      inMonth.forEach((w) => {
        const st = wStats(w);
        const names = w.items.map((it) => getEx(it.ex).name);
        h += `<button class="row-card" type="button" data-act="open-w" data-id="${w.id}">
          ${mini({ heat: heatOf(muscleLoad([w])) })}
          <div class="grow"><h3>${fmtDate(w.date)}</h3>
          <p>${esc(names.slice(0, 3).join(', '))}${names.length > 3 ? ' 외 ' + (names.length - 3) + '개' : ''}</p>
          <p>${st.ex}종목 · ${st.sets}세트${st.vol ? ' · ' + fmtN(st.vol) + 'kg' : ''}</p></div>${ICON.chev}</button>`;
      });
      h += '</div>';
    }
    return h + '</div>';
  }

  /* ───────── 성장 ───────── */
  function progressHTML() {
    const done = DB.workouts.filter((w) => w.end);
    if (!done.length) return '<p class="empty">운동을 기록하면 이곳에<br>이번 주 많이 쓴 근육과 종목별 성장 그래프가 나타납니다.</p>';
    const ws = weekStart(new Date());
    const week = done.filter((w) => parseYmd(w.date) >= ws);
    const L = muscleLoad(week);
    const top = Object.keys(L).sort((a, b) => L[b] - L[a]).slice(0, 4);
    let h = `<section class="card"><div class="sec-h"><h2>이번 주 많이 쓴 근육</h2><span class="more">${week.length}회 운동</span></div>
      <div class="big-map">${window.bodyMapSVG({ heat: heatOf(L), title: '이번 주 많이 쓴 근육' })}</div>
      <div class="legend"><span><i style="background:#D6AC42"></i>많이</span><span><i style="background:rgba(214,172,66,.66)"></i>보통</span><span><i style="background:rgba(214,172,66,.38)"></i>조금</span><span><i style="background:#2E2E2E"></i>안 씀</span></div>
      ${top.length ? '<div class="top-mus">' + chipList(top, 'p') + '</div>' : '<p class="small muted" style="text-align:center;margin-top:8px">이번 주에는 아직 기록이 없습니다.</p>'}
    </section>`;

    // 기록이 있는 종목 (최근 한 순서)
    const seen = [];
    done.slice().sort(sortW).forEach((w) => w.items.forEach((it) => { if (recorded(it).length && !seen.includes(it.ex)) seen.push(it.ex); }));
    if (!state.progEx || !seen.includes(state.progEx)) state.progEx = seen[0];
    h += `<div class="sec"><div class="sec-h"><h2>종목별 성장</h2></div>
      <select class="sel" data-act="prog-ex" aria-label="종목 고르기">${seen.map((id) => `<option value="${esc(id)}" ${id === state.progEx ? 'selected' : ''}>${esc(getEx(id).name)}</option>`).join('')}</select>`;
    if (state.progEx) h += progressDetail(state.progEx, done);
    return h + '</div>';
  }

  function progressDetail(exId, done) {
    const e = getEx(exId);
    const sessions = [];
    done.slice().sort((a, b) => -sortW(a, b)).forEach((w) => {
      const sets = []; w.items.filter((it) => it.ex === exId).forEach((it) => sets.push.apply(sets, recorded(it)));
      if (!sets.length) return;
      let best;
      if (e.kind === 'weight') {
        best = sets.reduce((b, s) => ((s.w || 0) > (b.w || 0) || ((s.w || 0) === (b.w || 0) && (s.r || 0) > (b.r || 0)) ? s : b), sets[0]);
        sessions.push({ date: w.date, y: best.w || 0, best, sets });
      } else if (e.kind === 'reps') { best = sets.reduce((b, s) => ((s.r || 0) > (b.r || 0) ? s : b)); sessions.push({ date: w.date, y: best.r || 0, best, sets }); }
      else if (e.kind === 'time') { best = sets.reduce((b, s) => ((s.t || 0) > (b.t || 0) ? s : b)); sessions.push({ date: w.date, y: best.t || 0, best, sets }); }
      else { const tot = sets.reduce((n, s) => n + (s.m || 0), 0); sessions.push({ date: w.date, y: tot, best: { m: tot }, sets }); }
    });
    const unit = { weight: 'kg', reps: '회', time: '초', cardio: '분' }[e.kind];
    const label = { weight: '그날 가장 무거운 무게', reps: '그날 가장 많은 횟수', time: '그날 가장 긴 시간', cardio: '그날 운동한 시간' }[e.kind];
    const pr = sessions.reduce((b, s) => (!b || s.y > b.y ? s : b), null);
    let h = `<div class="chart">${lineChart(sessions.slice(-12), unit)}</div><p class="small muted" style="margin-top:6px">그래프: ${label} (최근 12번)</p>`;
    if (pr) h += `<div class="pr"><span class="tag">최고 기록</span><b>${esc(setText(pr.best, e.kind))}</b><span>${fmtDate(pr.date)}</span></div>`;
    h += '<div class="hist-rows">' + sessions.slice().reverse().slice(0, 8).map((s) =>
      `<div><span>${fmtDate(s.date)}</span><span>${esc(s.sets.map((x) => setText(x, e.kind)).join(', '))}</span></div>`).join('') + '</div>';
    return h;
  }

  function lineChart(pts, unit) {
    const W = 340, H = 180, L = 40, R = 14, T = 18, B = 28;
    if (!pts.length) return '';
    const ys = pts.map((p) => p.y);
    let lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    if (lo === hi) { lo = Math.max(0, lo - 5); hi = hi + 5; }
    const pad = (hi - lo) * 0.15; lo = Math.max(0, lo - pad); hi += pad;
    const x = (i) => (pts.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (pts.length - 1));
    const y = (v) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="성장 그래프">`;
    [hi, (hi + lo) / 2, lo].forEach((v) => {
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#262626"/><text x="${L - 6}" y="${y(v) + 4}" fill="#8A8A8A" font-size="11" text-anchor="end">${fmtN(v)}</text>`;
    });
    s += `<text x="${L - 6}" y="10" fill="#8A8A8A" font-size="10" text-anchor="end">${unit}</text>`;
    if (pts.length > 1) s += `<polyline fill="none" stroke="#D6AC42" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((p, i) => x(i) + ',' + y(p.y)).join(' ')}"/>`;
    pts.forEach((p, i) => {
      const last = i === pts.length - 1;
      s += `<circle cx="${x(i)}" cy="${y(p.y)}" r="${last ? 5 : 3.5}" fill="${last ? '#D6AC42' : '#0E0E0E'}" stroke="#D6AC42" stroke-width="2"/>`;
      if (last) s += `<text x="${Math.min(x(i), W - R - 4)}" y="${y(p.y) - 10}" fill="#F0D48A" font-size="12" font-weight="700" text-anchor="end">${fmtN(p.y)}${unit}</text>`;
    });
    const lab = (i, anchor) => `<text x="${x(i)}" y="${H - 8}" fill="#8A8A8A" font-size="11" text-anchor="${anchor}">${fmtShort(pts[i].date)}</text>`;
    s += lab(0, pts.length === 1 ? 'middle' : 'start');
    if (pts.length > 1) s += lab(pts.length - 1, 'end');
    return s + '</svg>';
  }

  /* ───────── 더보기 ───────── */
  function moreHTML() {
    const r = DB.settings.rest;
    const cnt = DB.workouts.filter((w) => w.end).length;
    const custom = DB.custom.filter((c) => !c.hidden);
    let h = `<section class="card"><div class="sec-h"><h2>세트 사이 휴식 타이머</h2></div>
      <p class="small muted">세트 완료(✓)를 누르면 자동으로 시작됩니다.</p>
      <div class="seg" style="margin-top:10px">${[0, 60, 90, 120, 180].map((s) => `<button type="button" data-act="rest-set" data-s="${s}" class="${r === s ? 'on' : ''}">${s ? (s % 60 ? fmtN(s / 60) + '분' : s / 60 + '분') : '끄기'}</button>`).join('')}</div>
    </section>
    <section class="card"><div class="sec-h"><h2>기록 백업</h2><span class="more">지금 ${cnt}개</span></div>
      <p class="small muted">기록은 이 휴대폰에만 저장됩니다. 휴대폰을 바꾸거나 앱을 지우기 전에 백업 파일을 저장해 두세요.</p>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn sm" type="button" data-act="export">백업 파일 저장</button>
        <button class="btn sm ghost" type="button" data-act="import">백업 불러오기</button>
      </div>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </section>
    <section class="card"><div class="sec-h"><h2>내가 만든 운동</h2></div>
      ${custom.length ? '<div class="menu">' + custom.map((c) => `<button type="button" data-act="custom-del" data-id="${esc(c.id)}"><span style="flex:1">${esc(c.name)}<br><span class="small muted">${esc(c.cat)} · ${KIND_LABEL[c.kind]}</span></span><span class="small" style="color:var(--danger)">지우기</span></button>`).join('') + '</div>' : '<p class="small muted">운동 추가하기 → 맨 아래 "목록에 없는 운동 직접 만들기"에서 만들 수 있습니다.</p>'}
    </section>
    <section class="card"><div class="sec-h"><h2>앱 정보</h2></div>
      <div class="menu">
        ${isStandalone() ? '' : '<button type="button" data-act="go" data-href="index.html?stay=1#install">홈 화면에 설치하는 방법</button>'}
        <button type="button" data-act="go" data-href="index.html?stay=1">COACH K 운동 기록 소개</button>
        <button type="button" class="danger" data-act="wipe">모든 기록 지우기</button>
      </div>
      <p class="small muted" style="margin-top:14px;text-align:center">기록이 쌓이면, 몸이 바뀝니다.<br>© COACH K</p>
    </section>`;
    return h;
  }

  /* ───────── 아래 창 / 확인 창 / 알림 ───────── */
  const sheetWrap = $('#sheetWrap'), sheet = $('#sheet');
  let sheetOpen = false, sheetOnClose = null;
  function openSheet(title, body, foot, onClose) {
    sheet.innerHTML = `<div class="sh-head"><h2>${title}</h2><button class="sh-x" type="button" data-act="sheet-close" aria-label="닫기">×</button></div>
      <div class="sh-body">${body}</div>${foot ? '<div class="sh-foot">' + foot + '</div>' : ''}`;
    if (!sheetOpen) { history.pushState({ sheet: 1 }, ''); }
    sheetOpen = true; sheetOnClose = onClose || null;
    sheetWrap.hidden = false; document.body.style.overflow = 'hidden';
    $('.sh-body', sheet).scrollTop = 0;
  }
  function closeSheet(fromPop) {
    if (!sheetOpen) return;
    sheetOpen = false; sheetWrap.hidden = true; document.body.style.overflow = '';
    const cb = sheetOnClose; sheetOnClose = null; if (cb) cb();
    if (!fromPop) { ignorePop = true; history.back(); }
  }
  let ignorePop = false;
  sheetWrap.addEventListener('click', (e) => { if (e.target === sheetWrap) closeSheet(); });
  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    if (sheetOpen) { closeSheet(true); return; }
    if (state.detail) { state.detail = null; render(); window.scrollTo(0, 0); }
  });

  function ask(title, text, okLabel, kind) {
    return new Promise((resolve) => {
      $('#dlgTitle').textContent = title; $('#dlgText').textContent = text || '';
      const btns = $('#dlgBtns');
      btns.innerHTML = `<button type="button" data-v="0">취소</button><button type="button" data-v="1" class="${kind || 'primary'}">${esc(okLabel || '확인')}</button>`;
      const wrap = $('#dialogWrap'); wrap.hidden = false;
      btns.lastChild.focus();
      btns.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; wrap.hidden = true; btns.onclick = null; resolve(b.dataset.v === '1'); };
    });
  }
  let toastT = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ───────── 운동 고르기 창 ───────── */
  const picker = { wid: null, cat: '전체', q: '', sel: [] };
  function openPicker(wid) {
    picker.wid = wid; picker.cat = '전체'; picker.q = ''; picker.sel = [];
    const cats = ['전체'].concat(CATS, DB.custom.some((c) => !c.hidden) ? ['내 운동'] : []);
    openSheet('운동 고르기',
      `<input class="search" type="search" placeholder="운동 이름 찾기 (예: 스쿼트)" data-act="pick-q" aria-label="운동 이름 찾기">
       <div class="cats">${cats.map((c) => `<button type="button" class="cat ${c === '전체' ? 'on' : ''}" data-act="pick-cat" data-c="${c}">${c}</button>`).join('')}</div>
       <div class="pick-list" id="pickList"></div>
       <button type="button" class="custom-link" data-act="custom-new">+ 목록에 없는 운동 직접 만들기</button>`,
      '<button class="btn" type="button" data-act="pick-done" id="pickDone" disabled>운동을 골라 주세요</button>');
    renderPickList();
  }
  function renderPickList() {
    const q = picker.q.trim().replace(/\s/g, '').toLowerCase();
    const list = pickable().filter((e) => {
      if (picker.cat === '내 운동') { if (!String(e.id).startsWith('c_')) return false; }
      else if (picker.cat !== '전체' && e.cat !== picker.cat) return false;
      if (!q) return true;
      return (e.name + e.en).replace(/\s/g, '').toLowerCase().includes(q);
    });
    $('#pickList').innerHTML = list.length ? list.map((e) => {
      const on = picker.sel.includes(e.id);
      return `<button type="button" class="pick ${on ? 'on' : ''}" data-act="pick" data-ex="${esc(e.id)}" aria-pressed="${on}">
        ${mini({ primary: e.p, secondary: e.s })}
        <div class="grow"><h3>${esc(e.name)}</h3><p>${esc(e.en)} · ${esc(e.cat)}</p><div class="chips">${chipList(e.p, 'p')}</div></div>
        <span class="tick">${ICON.check}</span></button>`;
    }).join('') : '<p class="empty">찾는 운동이 없습니다.<br>아래에서 직접 만들 수 있습니다.</p>';
    const btn = $('#pickDone');
    btn.disabled = !picker.sel.length;
    btn.textContent = picker.sel.length ? picker.sel.length + '개 운동 추가하기' : '운동을 골라 주세요';
  }

  /* ───────── 직접 운동 만들기 ───────── */
  const draft = { name: '', cat: '하체', kind: 'weight', p: [], s: [] };
  function openCustom() {
    Object.assign(draft, { name: '', cat: '하체', kind: 'weight', p: [], s: [] });
    openSheet('운동 직접 만들기', customBody(), '<button class="btn" type="button" data-act="custom-save">저장하고 추가하기</button>');
  }
  function customBody() {
    return `<div class="field"><label for="cName">운동 이름</label><input type="text" id="cName" maxlength="30" placeholder="예: 케이블 힙 어브덕션" value="${esc(draft.name)}" data-act="c-name"></div>
      <div class="field"><span class="lbl">부위</span><div class="seg">${CATS.map((c) => `<button type="button" class="${draft.cat === c ? 'on' : ''}" data-act="c-cat" data-v="${c}">${c}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">기록 방식</span><div class="seg">${Object.keys(KIND_LABEL).map((k) => `<button type="button" class="${draft.kind === k ? 'on' : ''}" data-act="c-kind" data-v="${k}">${KIND_LABEL[k]}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">쓰는 근육</span>
        <p class="hint">한 번 누르면 <b class="gold">주로 쓰는 근육</b>, 두 번 누르면 도와주는 근육, 세 번 누르면 취소됩니다.</p>
        <div class="seg" id="cMus" style="margin-top:10px">${musButtons()}</div>
        <div class="big-map" style="margin-top:12px" id="cMap">${window.bodyMapSVG({ primary: draft.p, secondary: draft.s })}</div></div>`;
  }
  function musButtons() {
    return Object.keys(MUS).map((m) => `<button type="button" data-act="c-mus" data-v="${m}" class="${draft.p.includes(m) ? 'on' : draft.s.includes(m) ? 'sec-on' : ''}">${MUS[m].ko}</button>`).join('');
  }

  /* ───────── 근육 자세히 / 운동 완료 요약 ───────── */
  function openMuscles(exId) {
    const e = getEx(exId);
    const item = (m, color) => `<div class="mus-item"><i style="background:${color}"></i><b>${esc(MUS[m].ko)}</b><span>${esc(MUS[m].en)}</span></div>`;
    openSheet(esc(e.name),
      `<div class="big-map">${window.bodyMapSVG({ primary: e.p, secondary: e.s, title: e.name + ' 근육' })}</div>
       <div class="legend"><span><i style="background:#D6AC42"></i>주로 쓰는 근육</span><span><i style="background:#7C6633"></i>도와주는 근육</span></div>
       <div class="mus-table">${e.p.length ? '<h3>주로 쓰는 근육</h3>' + e.p.map((m) => item(m, '#D6AC42')).join('') : ''}
       ${e.s.length ? '<h3>도와주는 근육</h3>' + e.s.map((m) => item(m, '#7C6633')).join('') : ''}</div>
       <p class="hint" style="margin-top:12px">자세와 기구에 따라 쓰이는 근육은 조금씩 달라질 수 있습니다.</p>`);
  }
  function openSummary(w, justDone) {
    const st = wStats(w);
    const L = muscleLoad([w]);
    const top = Object.keys(L).sort((a, b) => L[b] - L[a]).slice(0, 5);
    openSheet(justDone ? '운동 완료' : fmtDate(w.date) + ' 운동',
      `${justDone ? '<div class="done-hero"><span class="badge">COACH K</span><h3>오늘 운동 완료!</h3><p>기록이 쌓이면, 몸이 바뀝니다.</p></div>' : ''}
       <div class="stats">
         <div class="stat"><b>${w.end && w.start ? fmtDur(w.end - w.start) : '-'}</b><span>운동 시간</span></div>
         <div class="stat"><b>${st.ex}종목</b><span>${st.sets}세트</span></div>
         <div class="stat"><b>${fmtN(st.vol)}kg</b><span>들어 올린 무게</span></div>
       </div>
       <div class="sec"><div class="sec-h"><h2>오늘 쓴 근육</h2></div>
       <div class="big-map">${window.bodyMapSVG({ heat: heatOf(L), title: '이날 쓴 근육' })}</div>
       <div class="top-mus">${chipList(top, 'p')}</div></div>`,
      '<button class="btn" type="button" data-act="sheet-close">확인</button>');
  }

  /* ───────── 운동 메뉴 ───────── */
  function openExMenu(w, i) {
    const it = w.items[i]; const e = getEx(it.ex);
    openSheet(esc(e.name),
      `<div class="menu">
        <button type="button" data-act="ex-up" data-wid="${w.id}" data-i="${i}" ${i === 0 ? 'disabled' : ''}>위로 옮기기</button>
        <button type="button" data-act="ex-down" data-wid="${w.id}" data-i="${i}" ${i === w.items.length - 1 ? 'disabled' : ''}>아래로 옮기기</button>
        <button type="button" data-act="map" data-ex="${esc(e.id)}">쓰는 근육 크게 보기</button>
        <button type="button" class="danger" data-act="ex-del" data-wid="${w.id}" data-i="${i}">이 운동 빼기</button>
      </div>`);
  }

  /* ───────── 휴식 타이머 ───────── */
  const rest = { end: 0, iv: null };
  const mmss = (s) => z(Math.floor(s / 60)) + ':' + z(s % 60);
  function startRest(sec) {
    rest.end = Date.now() + sec * 1000;
    $('#rest').hidden = false; view.classList.add('has-rest');
    clearInterval(rest.iv); rest.iv = setInterval(tickRest, 250); tickRest();
  }
  function tickRest() {
    const left = Math.ceil((rest.end - Date.now()) / 1000);
    if (left <= 0) {
      stopRest();
      try { if (navigator.vibrate) navigator.vibrate([250, 120, 250]); } catch (e) {}
      toast('휴식 끝! 다음 세트를 시작하세요');
      return;
    }
    $('#restTime').textContent = mmss(left);
  }
  function stopRest() { clearInterval(rest.iv); $('#rest').hidden = true; view.classList.remove('has-rest'); }

  function tickElapsed() {
    const el = $('#elapsed'); if (!el) return;
    el.textContent = '진행 ' + fmtDur(Date.now() - Number(el.dataset.start));
  }
  setInterval(tickElapsed, 20000);

  /* ───────── 백업 ───────── */
  async function exportBackup() {
    save(true);
    const name = 'coachk-운동기록-' + ymd() + '.json';
    const file = new File([JSON.stringify(DB)], name, { type: 'application/json' });
    if (isMobile() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'COACH K 운동 기록 백업' }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    toast('백업 파일을 저장했습니다.');
  }
  async function importBackup(file) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { toast('백업 파일을 읽지 못했습니다.'); return; }
    if (!data || !Array.isArray(data.workouts)) { toast('COACH K 백업 파일이 아닙니다.'); return; }
    const ids = new Set(DB.workouts.map((w) => w.id));
    const add = data.workouts.filter((w) => w && w.id && w.date && Array.isArray(w.items) && !ids.has(w.id));
    const cids = new Set(DB.custom.map((c) => c.id));
    const addC = (data.custom || []).filter((c) => c && c.id && !cids.has(c.id));
    const ok = await ask('백업을 불러올까요?', `새 기록 ${add.length}개를 지금 기록에 더합니다.\n이미 있는 기록은 그대로 둡니다.`, '불러오기');
    if (!ok) return;
    DB.workouts = DB.workouts.concat(add); DB.custom = DB.custom.concat(addC); resetExIndex();
    save(true); render(); toast(`기록 ${add.length}개를 불러왔습니다.`);
  }

  /* ───────── 동작 처리 ───────── */
  function newWorkout(items) {
    const w = { id: uid(), date: ymd(), start: Date.now(), end: null, memo: '', items: items || [] };
    DB.workouts.push(w); save(true);
    state.tab = 'today'; state.detail = null;
    return w;
  }

  document.addEventListener('click', async (ev) => {
    const tab = ev.target.closest('.tab');
    if (tab) {
      if (state.detail) { state.detail = null; history.replaceState(null, ''); }
      state.tab = tab.dataset.tab; render(); window.scrollTo(0, 0); return;
    }
    const el = ev.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
    const act = el.dataset.act;
    const w = el.dataset.wid ? findW(el.dataset.wid) : null;
    const i = el.dataset.i != null ? Number(el.dataset.i) : null;
    const j = el.dataset.j != null ? Number(el.dataset.j) : null;

    switch (act) {
      case 'back': history.back(); break;
      case 'sheet-close': closeSheet(); break;
      case 'start': { const nw = newWorkout(); render(); openPicker(nw.id); break; }
      case 'repeat': {
        const src = findW(el.dataset.id); if (!src) break;
        newWorkout(src.items.map((it) => ({ uid: uid(), ex: it.ex, sets: (recorded(it).length ? recorded(it) : it.sets).map(() => ({})) })));
        render(); toast('지난 운동을 불러왔습니다. 흐린 숫자는 지난번 기록입니다.'); break;
      }
      case 'add-ex': openPicker(w.id); break;
      case 'add-set': {
        w.items[i].sets.push({}); save(); render();
        const card = $(`.ex[data-uid="${w.items[i].uid}"]`); const ins = card && $$('.set-in', card);
        if (ins && ins.length) ins[ins.length - (FIELDS[getEx(w.items[i].ex).kind] || FIELDS.weight).length].focus({ preventScroll: false });
        break;
      }
      case 'del-set': {
        const sets = w.items[i].sets; const last = sets[sets.length - 1];
        if (last && hasVal(last) && !(await ask('마지막 세트를 지울까요?', '적어 둔 숫자도 함께 지워집니다.', '지우기', 'danger'))) break;
        sets.pop(); save(); render(); break;
      }
      case 'toggle': {
        const it = w.items[i]; const s = it.sets[j];
        if (!s.done && !hasVal(s)) {
          const ph = placeholderFor(it, j, prevFor(it.ex, w));
          if (ph && hasVal(ph)) ['w', 'r', 't', 'm', 'd'].forEach((k) => { if (isNum(ph[k])) s[k] = ph[k]; });
          if (!hasVal(s)) { toast('숫자를 먼저 적어 주세요.'); const inp = $(`.set-in[data-wid="${w.id}"][data-i="${i}"][data-j="${j}"]`); if (inp) inp.focus(); break; }
        }
        s.done = !s.done; save();
        const y = window.scrollY; render(); window.scrollTo(0, y);
        if (s.done && !w.end && DB.settings.rest > 0) startRest(DB.settings.rest);
        break;
      }
      case 'ex-menu': openExMenu(w, i); break;
      case 'ex-up': case 'ex-down': {
        const k = act === 'ex-up' ? i - 1 : i + 1;
        if (k < 0 || k >= w.items.length) break;
        const t = w.items[i]; w.items[i] = w.items[k]; w.items[k] = t; save(); closeSheet(); render(); break;
      }
      case 'ex-del': {
        const it = w.items[i];
        closeSheet();
        if (recorded(it).length && !(await ask(getEx(it.ex).name + '을(를) 뺄까요?', '이 운동에 적은 세트 기록도 함께 지워집니다.', '빼기', 'danger'))) break;
        w.items.splice(i, 1); save(); render(); break;
      }
      case 'map': openMuscles(el.dataset.ex); break;
      case 'finish': {
        const st = wStats(w);
        if (!st.sets) {
          if (await ask('적은 기록이 없습니다', '이번 운동을 기록 없이 닫을까요?', '닫기', 'danger')) {
            DB.workouts = DB.workouts.filter((x) => x.id !== w.id); save(true); stopRest(); render();
          }
          break;
        }
        if (!(await ask('운동을 마칠까요?', `${st.ex}종목 ${st.sets}세트를 저장합니다.\n숫자를 적지 않은 빈 세트는 빼고 저장합니다.`, '마치기'))) break;
        w.items.forEach((it) => { it.sets = it.sets.filter(hasVal); });
        w.items = w.items.filter((it) => it.sets.length);
        w.end = Date.now(); save(true); stopRest(); render(); window.scrollTo(0, 0);
        openSummary(w, true);
        break;
      }
      case 'cancel-w':
        if (await ask('이번 운동을 취소할까요?', '지금까지 적은 기록이 모두 지워집니다.', '취소하기', 'danger')) {
          DB.workouts = DB.workouts.filter((x) => x.id !== w.id); save(true); stopRest(); render(); toast('운동을 취소했습니다.');
        }
        break;
      case 'del-w':
        if (await ask('이 기록을 삭제할까요?', fmtDate(w.date) + ' 운동 기록이 지워지며 되돌릴 수 없습니다.', '삭제', 'danger')) {
          DB.workouts = DB.workouts.filter((x) => x.id !== w.id); save(true); history.back(); toast('기록을 삭제했습니다.');
        }
        break;
      case 'show-summary': openSummary(w, false); break;
      case 'open-w': {
        const t = findW(el.dataset.id); if (!t) break;
        if (!t.end) { state.tab = 'today'; render(); break; }
        state.detail = t.id; history.pushState({ detail: t.id }, ''); render(); window.scrollTo(0, 0); break;
      }
      case 'cal': {
        const [y, m] = state.calMonth.split('-').map(Number);
        const d = new Date(y, m - 1 + Number(el.dataset.d), 1);
        state.calMonth = d.getFullYear() + '-' + z(d.getMonth() + 1); render(); break;
      }
      // 운동 고르기
      case 'pick': {
        const id = el.dataset.ex; const k = picker.sel.indexOf(id);
        if (k >= 0) picker.sel.splice(k, 1); else picker.sel.push(id);
        renderPickList(); break;
      }
      case 'pick-cat':
        picker.cat = el.dataset.c; $$('.cat', sheet).forEach((c) => c.classList.toggle('on', c.dataset.c === picker.cat));
        renderPickList(); break;
      case 'pick-done': {
        const tw = findW(picker.wid); if (!tw) break;
        const first = tw.items.length;
        picker.sel.forEach((id) => tw.items.push({ uid: uid(), ex: id, sets: [{}, {}, {}] }));
        save(true); closeSheet(); render();
        const card = $$('.ex')[first]; if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      // 직접 만들기
      case 'custom-new': openCustom(); break;
      case 'c-cat': draft.cat = el.dataset.v; $$('[data-act="c-cat"]', sheet).forEach((b) => b.classList.toggle('on', b.dataset.v === draft.cat)); break;
      case 'c-kind': draft.kind = el.dataset.v; $$('[data-act="c-kind"]', sheet).forEach((b) => b.classList.toggle('on', b.dataset.v === draft.kind)); break;
      case 'c-mus': {
        const m = el.dataset.v;
        if (draft.p.includes(m)) { draft.p = draft.p.filter((x) => x !== m); draft.s.push(m); }
        else if (draft.s.includes(m)) draft.s = draft.s.filter((x) => x !== m);
        else draft.p.push(m);
        $('#cMap').innerHTML = window.bodyMapSVG({ primary: draft.p, secondary: draft.s });
        $('#cMus').innerHTML = musButtons(); break;
      }
      case 'custom-save': {
        draft.name = ($('#cName').value || '').trim();
        if (!draft.name) { toast('운동 이름을 적어 주세요.'); $('#cName').focus(); break; }
        if (!draft.p.length) { toast('주로 쓰는 근육을 하나 이상 골라 주세요.'); break; }
        const c = { id: 'c_' + uid(), name: draft.name, en: '내가 만든 운동', cat: draft.cat, kind: draft.kind, p: draft.p.slice(), s: draft.s.slice() };
        DB.custom.push(c); resetExIndex();
        const tw = picker.wid && findW(picker.wid);
        if (tw) tw.items.push({ uid: uid(), ex: c.id, sets: [{}, {}, {}] });
        save(true); closeSheet(); render(); toast(c.name + '을(를) 추가했습니다.');
        break;
      }
      // 더보기
      case 'rest-set': DB.settings.rest = Number(el.dataset.s); save(); render(); break;
      case 'rest-add': rest.end += 30000; tickRest(); break;
      case 'rest-stop': stopRest(); break;
      case 'export': exportBackup(); break;
      case 'import': $('#importFile').click(); break;
      case 'custom-del': {
        const c = DB.custom.find((x) => x.id === el.dataset.id); if (!c) break;
        if (await ask(c.name + '을(를) 지울까요?', '운동 목록에서만 빠지고, 이미 적은 기록은 그대로 남습니다.', '지우기', 'danger')) {
          c.hidden = true; resetExIndex(); save(); render();
        }
        break;
      }
      case 'go': location.href = el.dataset.href; break;
      case 'wipe':
        if (await ask('모든 기록을 지울까요?', '운동 기록과 내가 만든 운동이 모두 지워지며 되돌릴 수 없습니다.\n먼저 백업 파일을 저장해 두시길 권합니다.', '다음', 'danger') &&
            await ask('정말 모두 지울까요?', '마지막 확인입니다.', '모두 지우기', 'danger')) {
          DB = blank(); resetExIndex(); save(true); stopRest(); render(); toast('모든 기록을 지웠습니다.');
        }
        break;
    }
  });

  // 숫자·메모 입력 (화면을 다시 그리지 않고 바로 저장)
  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.classList.contains('set-in')) {
      const w = findW(el.dataset.wid); if (!w) return;
      const s = w.items[Number(el.dataset.i)].sets[Number(el.dataset.j)];
      const raw = el.value.replace(',', '.').replace(/[^0-9.]/g, '');
      if (raw !== el.value) el.value = raw;
      const n = parseFloat(raw);
      if (raw === '' || isNaN(n)) delete s[el.dataset.f]; else s[el.dataset.f] = n;
      save(); return;
    }
    const act = el.dataset.act;
    if (act === 'memo') { const w = findW(el.dataset.wid); if (w) { w.memo = el.value; save(); } }
    else if (act === 'pick-q') { picker.q = el.value; renderPickList(); }
    else if (act === 'c-name') { draft.name = el.value; }
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset.act === 'date' && el.value) {
      const w = findW(el.dataset.wid); if (!w) return;
      w.date = el.value; save(true); render(); toast(fmtDate(w.date) + '로 바꿨습니다.');
    } else if (el.dataset.act === 'prog-ex') { state.progEx = el.value; render(); }
    else if (el.id === 'importFile' && el.files && el.files[0]) { importBackup(el.files[0]); el.value = ''; }
  });
  // 숫자 칸에서 '다음' 누르면 옆 칸으로
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { if (!$('#dialogWrap').hidden) return; if (sheetOpen) closeSheet(); return; }
    if (ev.key !== 'Enter' || !ev.target.classList.contains('set-in')) return;
    ev.preventDefault();
    const all = $$('.set-in'); const k = all.indexOf(ev.target);
    if (all[k + 1]) all[k + 1].focus(); else ev.target.blur();
  });

  /* ───────── 환경 ───────── */
  function isStandalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function isMobile() { return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  render();
})();
