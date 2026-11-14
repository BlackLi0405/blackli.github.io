/* BlackLi Board 全站共用小功能：連續上課天數、文章閱讀工具（30 秒版、聽文章、字級）、名詞小黑板 */
(function () {
  'use strict';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bb.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bb.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const today = (off = 0) => new Date(Date.now() + off * 864e5).toLocaleDateString('sv-SE', {timeZone: 'Asia/Taipei'});

  /* ---------- 連續上課天數 ---------- */
  const days = store.get('days', []);
  if (days[days.length - 1] !== today()) { days.push(today()); store.set('days', days.slice(-400)); }
  function streak() {
    const set = new Set(days); let n = 0;
    for (let i = 0; set.has(today(-i)); i++) n++;
    return n;
  }
  /* ---------- 今日一問：每天換一題，首頁和身心頁共用 ---------- */
  const QUESTIONS = [
    '今天有什麼小事讓你覺得被理解？', '最近一次真心笑出來，是因為什麼？', '如果今天只能完成一件事，你會選哪一件？',
    '這週有沒有一個你想放下的念頭？', '你最近在擔心的事，有多少是你能控制的？', '今天的身體，想跟你說什麼？',
    '最近有誰讓你想說聲謝謝？', '如果十年後的你回頭看今天，會給你什麼建議？', '你最近一次好好休息，是什麼時候？',
    '有什麼事你一直想開始，卻一直往後延？', '今天看到的新聞裡，哪一則讓你情緒最大？為什麼？', '你最喜歡自己的哪一個習慣？',
    '最近有沒有一句話，讓你一直想到？', '如果今晚只做一件讓自己放鬆的事，你會做什麼？', '你最近對自己太嚴格的地方是什麼？',
    '這個月你最想好好陪伴的人是誰？', '今天有沒有一個瞬間，讓你覺得「還好有出門」？', '你現在最需要的，是休息、陪伴，還是改變？',
    '最近學到的一件事是什麼？', '如果把煩惱寫在黑板上，你會寫哪一句？寫完再把它擦掉。', '你最近一次說「不」是什麼時候？感覺如何？',
    '有什麼東西你花了錢，卻讓你很開心？', '今天的你，跟一年前的你最大的不同是什麼？', '你覺得「夠了」的生活是什麼樣子？',
    '最近有沒有一個地方，讓你想再去一次？', '你在什麼時候最像自己？', '如果明天放一天假，你最想怎麼過？',
    '有什麼事你其實已經做得很好，只是沒注意到？', '你最近一次為自己做了什麼？', '今天睡前，想對自己說哪一句話？'
  ];
  const question = (d = today()) => { const n = Math.floor(new Date(d + 'T12:00:00+08:00').getTime() / 864e5); return QUESTIONS[((n % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length]; };
  window.BB = {store, today, streak, question, total: () => days.length, app: () => document.documentElement.dataset.bbPlatform};
  /* ---------- 裝到手機（App）：離線功能與安裝按鈕 ---------- */
  const me = document.currentScript && document.currentScript.src;
  if ('serviceWorker' in navigator && me && window.isSecureContext) {
    navigator.serviceWorker.register(new URL('../sw.js', me), {scope: new URL('../', me).pathname}).catch(() => {});
  }
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent;
  const platform = standalone ? 'installed' : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/.test(ua) ? 'android' : 'desktop';
  document.documentElement.dataset.bbPlatform = platform;
  let deferred = null;
  const showBtns = () => document.querySelectorAll('[data-bb-install]').forEach(b => { b.hidden = !deferred; });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; showBtns(); });
  window.addEventListener('appinstalled', () => { deferred = null; showBtns(); document.documentElement.dataset.bbPlatform = 'installed'; });
  document.addEventListener('click', async e => {
    const b = e.target.closest && e.target.closest('[data-bb-install]'); if (!b || !deferred) return;
    deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; showBtns();
  });
  document.addEventListener('DOMContentLoaded', showBtns);

  document.querySelectorAll('[data-bb-question]').forEach(el => { el.textContent = question(); });
  document.querySelectorAll('[data-bb-streak]').forEach(el => {
    const n = streak();
    el.innerHTML = n > 1 ? `🔥 連續上課 <b>${n}</b> 天` : `✏️ 今天第 1 天上課，明天再來就連續 2 天`;
  });

  /* ---------- 文章閱讀工具 ---------- */
  const isArticle = /\/reports\/[^/]+\.html$/.test(location.pathname) && document.querySelector('main');
  if (isArticle) {
    const anchor = document.querySelector('header .lede') || document.querySelector('header .tldr') || document.querySelector('header h1');
    const bar = document.createElement('div'); bar.className = 'bb-tools';
    bar.innerHTML = '<button type="button" data-t="short" aria-pressed="false">⏱️ 30 秒版</button>' +
      ('speechSynthesis' in window ? '<button type="button" data-t="listen" aria-pressed="false">🔊 聽文章</button>' : '') +
      '<button type="button" data-t="big" aria-pressed="false">Aa 大字</button>';
    if (anchor) anchor.after(bar);
    const main = document.querySelector('main');
    const note = document.createElement('p'); note.className = 'bb-short-note bb-keep';
    note.textContent = '現在是 30 秒版：只顯示重點、數字和「這跟你有什麼關係」。想看完整內容，再按一次「30 秒版」。';
    main.prepend(note);
    const pref = store.get('read', {});
    const apply = () => {
      document.body.classList.toggle('bb-short', !!pref.short);
      document.body.classList.toggle('bb-big', !!pref.big);
      bar.querySelector('[data-t="short"]').setAttribute('aria-pressed', String(!!pref.short));
      bar.querySelector('[data-t="big"]').setAttribute('aria-pressed', String(!!pref.big));
    };
    apply();
    let speaking = false;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const t = b.dataset.t;
      if (t === 'short' || t === 'big') { pref[t] = !pref[t]; store.set('read', pref); apply(); return; }
      if (t === 'listen') {
        if (speaking) { speechSynthesis.cancel(); speaking = false; b.setAttribute('aria-pressed', 'false'); b.textContent = '🔊 聽文章'; return; }
        const parts = [document.querySelector('header h1'), ...main.querySelectorAll('h2,h3,p,li,td,.tldr,.box')]
          .filter(el => el && el.offsetParent !== null && !el.closest('.src,.bb-short-note'))
          .map(el => el.innerText.trim()).filter(Boolean);
        const text = parts.join('。\n').replace(/[【】]/g, '');
        const voices = speechSynthesis.getVoices();
        const chunks = text.match(/[\s\S]{1,180}(?:[。！？\n]|$)/g) || [text];
        speaking = true; b.setAttribute('aria-pressed', 'true'); b.textContent = '⏹ 停止朗讀';
        chunks.forEach((c, i) => {
          const u = new SpeechSynthesisUtterance(c); u.lang = 'zh-TW'; u.rate = 1.05;
          const v = voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang)); if (v) u.voice = v;
          if (i === chunks.length - 1) u.onend = () => { speaking = false; b.setAttribute('aria-pressed', 'false'); b.textContent = '🔊 聽文章'; };
          speechSynthesis.speak(u);
        });
      }
    });
    window.addEventListener('pagehide', () => { try { speechSynthesis.cancel(); } catch (e) {} });
  }

  /* ---------- 名詞小黑板：文章裡第一次出現的專有名詞，點一下看白話解釋 ---------- */
  const TERMS = {
    '三大法人': '外資、投信、自營商這三類機構投資人的合稱。他們買賣金額大，常被拿來觀察大資金的方向。',
    '外資': '外國的機構投資人，例如國外的基金、銀行。台股裡外資持股比例很高，買賣動向很受關注。',
    '投信': '投資信託公司，也就是發行共同基金、ETF 的公司，用投資人的錢去買股票。',
    '自營商': '證券公司用自己的錢買賣股票，賺的是自己的價差。',
    '加權指數': '台股最常看的指數，用上市公司的市值加權計算，台積電這類大公司影響最大。',
    '櫃買指數': '在櫃買中心交易的股票（多是中小型公司）組成的指數，可以看中小型股的表現。',
    '費半': '費城半導體指數，由美國主要半導體公司組成，常被當成全球晶片產業的溫度計。',
    '殖利率': '債券的殖利率是買進後每年大約能拿到的報酬率；股票的殖利率則是股利除以股價。',
    '公債殖利率': '政府債券的報酬率。美國公債殖利率上升，通常代表借錢成本變高，會影響股市和房貸利率。',
    'PPI': '生產者物價指數，衡量企業買原料、批發商品的價格變化，常被視為消費物價的前兆。',
    'CPI': '消費者物價指數，衡量一般人買東西的價格變化，是判斷通膨最常用的數字。',
    '聯準會': '美國的中央銀行（Fed），負責決定美國的利率，影響全世界的資金流向。',
    '升息': '中央銀行調高利率。借錢變貴，通常用來壓抑通膨，但也可能讓股市承壓。',
    '降息': '中央銀行調低利率。借錢變便宜，通常用來刺激經濟。',
    '通膨': '通貨膨脹，東西整體變貴、同樣的錢能買到的變少。',
    'ADR': '美國存託憑證，讓外國公司（例如台積電）的股票能在美國股市交易。',
    '本益比': '股價除以每股盈餘，代表用幾年的獲利才能「賺回」股價，常用來判斷股價貴不貴。',
    '期貨': '約定在未來某個時間、用某個價格買賣的合約。美股開盤前的期貨漲跌，常被當成開盤方向的參考。',
    '法說會': '公司對法人（投資機構）說明營運狀況和展望的會議，常會影響股價。',
    'GDP': '國內生產毛額，一個國家一段時間內生產的所有東西的總價值，用來衡量經濟規模和成長。',
    '關稅': '貨物進口時要繳的稅。提高關稅會讓進口品變貴，常被用在貿易談判。',
    '停火': '交戰雙方同意暫時停止攻擊，不代表戰爭正式結束。',
    'APEC': '亞太經濟合作會議，台灣以「中華台北」名義參加的少數重要國際組織之一。',
    '成交金額': '一天之內所有股票買賣的總金額，可以看市場熱不熱絡。',
    '半導體': '晶片產業的統稱，從設計、製造到封裝測試，是台灣最重要的產業。'
  };
  if (isArticle) {
    const main = document.querySelector('main');
    const keys = Object.keys(TERMS).sort((a, b) => b.length - a.length);
    const done = new Set();
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {acceptNode: n =>
      n.parentElement.closest('a,h1,h2,h3,th,.src,.bb-term,.stat,script,style,.tag,.lab') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      let t = node.nodeValue;
      for (const k of keys) {
        if (done.has(k)) continue;
        const i = t.indexOf(k); if (i < 0) continue;
        if (keys.some(o => o !== k && o.includes(k) && t.indexOf(o) >= 0 && t.indexOf(o) <= i && t.indexOf(o) + o.length > i)) continue;
        done.add(k);
        const before = document.createTextNode(t.slice(0, i)), after = document.createTextNode(t.slice(i + k.length));
        const a = document.createElement('abbr'); a.className = 'bb-term'; a.tabIndex = 0; a.textContent = k; a.dataset.k = k;
        node.replaceWith(before, a, after);
        t = after.nodeValue; node.nodeValue = t;
        // 同一段文字只標一個詞，避免太花
        break;
      }
    }
    let pop = null;
    const close = () => { if (pop) { pop.remove(); pop = null; } };
    document.addEventListener('click', e => {
      const a = e.target.closest('.bb-term');
      close(); if (!a) return;
      pop = document.createElement('div'); pop.className = 'bb-pop';
      pop.innerHTML = `<b>${a.dataset.k}</b>${TERMS[a.dataset.k]}`;
      document.body.appendChild(pop);
      const r = a.getBoundingClientRect(); const w = Math.min(300, innerWidth - 24);
      pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + scrollX)) + 'px';
      pop.style.top = (r.bottom + scrollY + 8) + 'px';
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('bb-term')) e.target.click(); });
  }
})();
