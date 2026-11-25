/* BlackLi Board 全站共用小功能：連續天數、回到頂端、文章閱讀工具（30 秒版、聽文章、字級）、名詞小黑板 */
(function () {
  'use strict';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bb.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bb.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const today = (off = 0) => new Date(Date.now() + off * 864e5).toLocaleDateString('sv-SE', {timeZone: 'Asia/Taipei'});

  /* ---------- 連續來訪天數 ---------- */
  const days = store.get('days', []);
  if (days[days.length - 1] !== today()) { days.push(today()); store.set('days', days.slice(-400)); }
  function streak() {
    const set = new Set(days); let n = 0;
    for (let i = 0; set.has(today(-i)); i++) n++;
    return n;
  }
  /* ---------- 今日一問：每天換一題，首頁和身心頁共用 ---------- */
  /* 每題標出參考的自我覺察書籍或研究（題目為本站自行撰寫，只取觀念、不引用原文） */
  const QUESTIONS = [
    ['今天讓你不舒服的那件事，先別問「我為什麼會這樣」，改問「是什麼讓我這樣反應」，答案是什麼？', '《深度洞察力》'],
    ['如果請一位信任的朋友說出你最常被誤會的地方，你猜他會說什麼？', '《深度洞察力》'],
    ['你心中的自己，和同事眼中的你，最大的落差可能在哪裡？', '《深度洞察力》'],
    ['你最重視的三個價值是什麼？這週的時間花在哪裡，有反映出它們嗎？', '《深度洞察力》'],
    ['現在的感覺如果不能用「好」「不好」「累」來形容，你會用哪個更精準的詞？', '《情緒跟你以為的不一樣》'],
    ['今天的煩躁，有沒有可能其實是餓了、睏了，或身體太累？', '《情緒跟你以為的不一樣》'],
    ['最近一次情緒很強烈之前，你的身體先出現了什麼訊號？', '《情緒跟你以為的不一樣》'],
    ['這週你的睡眠、飲食、活動，哪一項最透支？它怎麼影響你的心情？', '《情緒跟你以為的不一樣》'],
    ['最近有沒有一句話，你很想說出口，卻因為怕被看輕而吞了回去？', '《脆弱的力量》'],
    ['你最常用來保護自己的「盔甲」是什麼？追求完美、讓自己很忙，還是用玩笑帶過？', '《脆弱的力量》'],
    ['當你覺得丟臉時，你通常怎麼對自己說話？', '《脆弱的力量》'],
    ['你現在煩惱的事，有多少其實是「別人的課題」，不是你的？', '《被討厭的勇氣》'],
    ['如果不用在意別人怎麼看，這週你會做出哪個不一樣的決定？', '《被討厭的勇氣》'],
    ['你最近一次很想得到別人認同，是想證明什麼？', '《被討厭的勇氣》'],
    ['今天有一件你改變不了的事，你可以選擇用什麼態度面對它？', '《活出意義來》'],
    ['最近做的哪一件事，讓你覺得「這是有意義的」？', '《活出意義來》'],
    ['一年後回頭看，你覺得這段辛苦的日子會教會你什麼？', '《活出意義來》'],
    ['最近有沒有一件事，你在心裡說「我就是不擅長」？如果改成「我還不擅長」，感覺有什麼不同？', '《心態致勝》'],
    ['最近一次失敗或被批評，你把它解讀成「我不行」，還是「我還在學」？', '《心態致勝》'],
    ['你羨慕的人身上，有哪一項能力其實是可以練出來的？', '《心態致勝》'],
    ['最近讓你生氣的一句話，如果只寫下發生的事實、不加評價，會怎麼寫？', '《非暴力溝通》'],
    ['上一次跟人起爭執，背後你真正沒被滿足的需要是什麼？', '《非暴力溝通》'],
    ['有沒有一個請求，你一直用抱怨代替，沒有直接說出口？', '《非暴力溝通》'],
    ['今天你對某個人或某則新聞的第一印象，冷靜下來再想，還站得住腳嗎？', '《快思慢想》'],
    ['最近有哪個決定，是在很累或很趕的時候做的？如果明天重新想，會一樣嗎？', '《快思慢想》'],
    ['你想成為什麼樣的人？今天做的哪一件小事，是在為這個身分投一票？', '《原子習慣》'],
    ['有一個你想改掉的習慣，通常是被什麼情境「觸發」的？', '《原子習慣》'],
    ['如果好朋友遇到你現在的處境，你會怎麼安慰他？你願意也這樣對自己說嗎？', '克莉絲汀・聶夫的自我疼惜研究'],
    ['你現在的難受，有哪一部分其實是很多人也會經歷的？', '克莉絲汀・聶夫的自我疼惜研究'],
    ['腦中一直重複的那個念頭，試著改成「我注意到，我有一個想法：……」，感覺有什麼不同？', '蘇珊・大衛的情緒靈敏力']
  ];
  const pickQ = (d = today()) => { const n = Math.floor(new Date(d + 'T12:00:00+08:00').getTime() / 864e5); return QUESTIONS[((n % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length]; };
  const question = d => pickQ(d)[0];
  const questionSrc = d => pickQ(d)[1];
  window.BB = {store, today, streak, question, questionSrc, total: () => days.length, app: () => document.documentElement.dataset.bbPlatform};
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
  document.querySelectorAll('[data-bb-question-src]').forEach(el => { el.textContent = '題目參考：' + questionSrc(); });
  document.querySelectorAll('[data-bb-streak]').forEach(el => {
    const n = streak();
    el.innerHTML = n > 1 ? `連續來了 <b>${n}</b> 天` : `今天是第 1 天，明天再來就連續 2 天`;
  });


  /* ---------- 回到頂端：只在長頁面出現 ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bb-top'; btn.textContent = '↑ 回到頂端';
    btn.onclick = () => scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    document.body.appendChild(btn);
    const tick = () => btn.classList.toggle('on', document.documentElement.scrollHeight > innerHeight * 2.5 && scrollY > innerHeight);
    addEventListener('scroll', tick, {passive: true}); tick();
  });

  /* ---------- 文章閱讀工具 ---------- */
  const isArticle = /\/reports\/[^/]+\.html$/.test(location.pathname) && document.querySelector('main');
  if (isArticle) {
    const seen = store.get('seen', []), me = location.pathname.split('/').slice(-2).join('/');
    if (!seen.includes(me)) { seen.push(me); store.set('seen', seen.slice(-300)); }
    const anchor = document.querySelector('header .lede') || document.querySelector('header .tldr') || document.querySelector('header h1');
    const bar = document.createElement('div'); bar.className = 'bb-tools';
    bar.innerHTML = '<button type="button" data-t="short" aria-pressed="false">30 秒版</button>' +
      ('speechSynthesis' in window ? '<button type="button" data-t="listen" aria-pressed="false">聽文章</button>' : '') +
      '<button type="button" data-t="big" aria-pressed="false">Aa 大字</button>';
    if (anchor) anchor.after(bar);
    const main = document.querySelector('main');
    const note = document.createElement('p'); note.className = 'bb-short-note bb-keep';
    note.textContent = '現在是 30 秒版：只顯示重點、數字和「這跟你有什麼關係」。想看完整內容，再按一次「30 秒版」。';
    main.prepend(note);
    const pref = store.get('read', {});
    if (location.hash === '#30s') pref.short = true; // 從首頁「30 秒看重點」進來：這次直接開 30 秒版，不改存下來的偏好
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
        if (speaking) { speechSynthesis.cancel(); speaking = false; b.setAttribute('aria-pressed', 'false'); b.textContent = '聽文章'; return; }
        const parts = [document.querySelector('header h1'), ...main.querySelectorAll('h2,h3,p,li,td,.tldr,.box')]
          .filter(el => el && el.offsetParent !== null && !el.closest('.src,.bb-short-note'))
          .map(el => el.innerText.trim()).filter(Boolean);
        const text = parts.join('。\n').replace(/[【】]/g, '');
        const voices = speechSynthesis.getVoices();
        const chunks = text.match(/[\s\S]{1,180}(?:[。！？\n]|$)/g) || [text];
        speaking = true; b.setAttribute('aria-pressed', 'true'); b.textContent = '停止朗讀';
        chunks.forEach((c, i) => {
          const u = new SpeechSynthesisUtterance(c); u.lang = 'zh-TW'; u.rate = 1.05;
          const v = voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang)); if (v) u.voice = v;
          if (i === chunks.length - 1) u.onend = () => { speaking = false; b.setAttribute('aria-pressed', 'false'); b.textContent = '聽文章'; };
          speechSynthesis.speak(u);
        });
      }
    });
    window.addEventListener('pagehide', () => { try { speechSynthesis.cancel(); } catch (e) {} });

    /* 往下讀時：選單下方一條粉筆黃進度線；讀到四層的哪一層，左下角顯示「正在讀：事實」 */
    const sb = document.querySelector('.sb');
    if (sb) {
      const bar2 = document.createElement('div'); bar2.className = 'bb-progress'; sb.appendChild(bar2);
      const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar2.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
      addEventListener('scroll', prog, {passive: true}); prog();
    }
    const heads = [...main.querySelectorAll('h3')].filter(h => h.querySelector('.lab.fact,.lab.view,.lab.stance,.lab.interest'));
    if (heads.length && 'IntersectionObserver' in window) {
      const pill = document.createElement('div'); pill.className = 'bb-layer'; pill.setAttribute('aria-hidden', 'true'); document.body.appendChild(pill);
      const NAME = {fact: '事實', view: '觀點', stance: '立場', interest: '利益'};
      // 每個四層小標到下一個小標之間算一段；看目前畫面中線落在哪一段
      const kindOf = h => Object.keys(NAME).find(k => h.querySelector('.lab.' + k));
      const upd = () => {
        const mid = innerHeight * 0.45; let cur = null;
        for (const h of heads) { if (h.getBoundingClientRect().top < mid) cur = h; }
        const end = cur && cur.closest('article'); const out = !cur || (end && end.getBoundingClientRect().bottom < mid);
        if (out) { pill.classList.remove('on'); return; }
        const k = kindOf(cur); pill.innerHTML = `正在讀<span class="layer ${k}">${NAME[k]}</span>`; pill.classList.add('on');
      };
      addEventListener('scroll', upd, {passive: true}); upd();
    }
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
