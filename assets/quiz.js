/* 今日小考：首頁、新聞頁、每篇文章底下共用。
   BBQuiz.mount(el, {base:'', pick:true})      今天的 3 題（pick：可以選日期）
   BBQuiz.article(el, {base:'../', path:'reports/2026-11-28.html'})  只出跟這篇有關的題目
   成績只存在讀者自己的瀏覽器（bb.quiz、bb.quizq）。 */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const md = d => `${+d.slice(5, 7)}/${+d.slice(8)}`;
  const S = {
    get(k, d) { try { const v = localStorage.getItem('bb.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bb.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const today = (o = 0) => new Date(Date.now() + 8 * 3600e3 + o * 864e5).toISOString().slice(0, 10);
  const load = base => fetch(base + 'data/quiz.json', {cache: 'no-cache'}).then(r => r.json()).then(j => (j.quizzes || []).filter(q => q.questions && q.questions.length));

  // 連續幾天有作答、這 7 天答對幾題
  function record() {
    const r = S.get('quiz', {});
    let streak = 0;
    for (let i = r[today()] ? 0 : 1; r[today(-i)]; i++) streak++;
    let ok = 0, all = 0;
    for (let i = 0; i < 7; i++) { const x = r[today(-i)]; if (x) { ok += x.score; all += x.total; } }
    return {streak, ok, all};
  }
  const recLine = () => {
    const {streak, ok, all} = record();
    if (!all) return '答錯不扣分，每題都會告訴你答案在哪篇文章。';
    return `${streak > 1 ? `連續答題 <b>${streak}</b> 天・` : ''}這 7 天答對 <b>${ok}</b>／${all} 題`;
  };

  // 一題一題作答；done(marks) 在最後一題答完後呼叫
  function run(box, qs, o, head, done) {
    let i = 0; const marks = [];
    const show = () => {
      const q = qs[i];
      box.innerHTML = head() + `<div class="qz-prog">${qs.map((_, n) => `<i class="${n < i ? (marks[n] ? 'ok' : 'ng') : n === i ? 'cur' : ''}"></i>`).join('')}</div>
        <p class="qz-q"><span>${i + 1}/${qs.length}</span>${esc(q.q)}</p>
        <div class="qz-opts">${q.options.map((t, n) => `<button type="button" data-n="${n}"><b>${'ABCD'[n]}</b>${esc(t)}</button>`).join('')}</div>
        <div class="qz-ex" hidden></div>`;
      o.bind && o.bind();
      box.querySelector('.qz-opts').onclick = e => {
        const b = e.target.closest('button'); if (!b || b.disabled) return;
        const n = +b.dataset.n, ok = n === q.answer; marks[i] = ok;
        box.querySelectorAll('.qz-opts button').forEach(x => { x.disabled = true; if (+x.dataset.n === q.answer) x.classList.add('ok'); });
        if (!ok) b.classList.add('ng');
        const here = o.path && q.link === o.path;
        const ex = box.querySelector('.qz-ex'); ex.hidden = false;
        ex.innerHTML = `<b>${ok ? '答對了' : '差一點'}</b>${esc(q.explain)}
          <div class="qz-row">${q.link && !here ? `<a href="${esc(o.base + q.link)}">${ok ? '看這篇文章' : '這題在這篇文章裡，回去讀'}</a>` : ''}
          <button type="button" class="btn qz-next">${i < qs.length - 1 ? '下一題' : '看成績'}</button></div>`;
        ex.querySelector('.qz-next').onclick = () => { i++; i < qs.length ? show() : done(marks); };
        ex.querySelector('.qz-next').focus({preventScroll: true});
      };
    };
    show();
  }

  function mount(box, o = {}) {
    o = {base: '', pick: false, ...o};
    load(o.base).then(all => {
      if (!all.length) { box.innerHTML = '<p class="qz-muted">今天的小考還沒出好，早上 7 點後再來看看。</p>'; return; }
      const start = k => {
        const qz = all[k], res = S.get('quiz', {});
        const label = qz.date === today() ? '今天' : md(qz.date);
        const head = () => `<div class="qz-head"><div><h3>看懂了沒？${label}的 ${qz.questions.length} 題</h3><p class="qz-rec">${recLine()}</p></div>
          ${o.pick && all.length > 1 ? `<select class="qz-pick" aria-label="換一天的小考">${all.map((q, n) => `<option value="${n}"${n === k ? ' selected' : ''}>${md(q.date)}${res[q.date] ? `（${res[q.date].score}/${res[q.date].total}）` : ''}</option>`).join('')}</select>` : ''}</div>`;
        o.bind = () => { const p = box.querySelector('.qz-pick'); if (p) p.onchange = () => start(+p.value); };
        const finish = marks => {
          const score = marks.filter(Boolean).length, total = qz.questions.length, r = S.get('quiz', {});
          r[qz.date] = {score, total}; S.set('quiz', r);
          const wrong = qz.questions.filter((_, n) => !marks[n]);
          const msg = score === total ? '全對，這兩天的新聞你都看懂了。' : score >= total - 1 ? '只差一題，很不錯。' : '沒關係，點進文章再看一次就記住了。';
          box.innerHTML = head() + `<div class="qz-done"><div class="qz-big">${score}<small>/${total}</small></div><p>${msg}</p>
            ${wrong.length ? `<ul class="qz-wrong">${wrong.map(q => `<li><a href="${esc(o.base + q.link)}">${esc(q.q)}</a></li>`).join('')}</ul>` : ''}
            <button type="button" class="qz-again">再做一次</button></div>`;
          o.bind(); box.querySelector('.qz-again').onclick = () => start(k);
        };
        const prev = res[qz.date];
        if (prev && !o.fresh) {
          box.innerHTML = head() + `<div class="qz-done"><div class="qz-big">${prev.score}<small>/${prev.total}</small></div><p>${label}的已經做過了。</p><button type="button" class="qz-again">再做一次</button></div>`;
          o.bind(); box.querySelector('.qz-again').onclick = () => { o.fresh = true; start(k); };
          return;
        }
        run(box, qz.questions, o, head, finish);
      };
      start(0);
    }).catch(() => { box.innerHTML = '<p class="qz-muted">小考暫時載入不了，請稍後再試。</p>'; });
  }

  function article(box, o = {}) {
    o = {base: '../', ...o};
    load(o.base).then(all => {
      const qs = []; all.forEach(z => z.questions.forEach(q => { if (q.link === o.path) qs.push(q); }));
      if (!qs.length) return;
      const head = () => `<div class="qz-head"><div><h3>這篇有 ${qs.length} 題，答答看？</h3><p class="qz-rec">答完可以去做今天其他題。</p></div></div>`;
      box.hidden = false;
      box.innerHTML = head() + `<button type="button" class="btn qz-go">開始</button>`;
      box.querySelector('.qz-go').onclick = () => run(box, qs, o, head, marks => {
        const s = marks.filter(Boolean).length;
        box.innerHTML = head() + `<div class="qz-done"><div class="qz-big">${s}<small>/${qs.length}</small></div><p>${s === qs.length ? '這篇你看懂了。' : '再往上看一次就記住了。'}</p><a class="btn" href="${o.base}index.html#quiz">去做今天的小考</a></div>`;
      });
    }).catch(() => {});
  }

  window.BBQuiz = {mount, article, record};
})();
