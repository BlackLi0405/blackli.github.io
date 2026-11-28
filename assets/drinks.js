/* 飲料新品：讀 data/drinks-new.csv，畫出每杯的樣子（依口味上色）。飲料頁和工具首頁共用。
   CSV 欄位：品牌,日期,品名,說明,來源網址，之後可以多：口味,優惠,優惠到,官網（沒有就從說明裡判斷） */
(() => {
  function parseCSV(t) {
    t = t.replace(/^﻿/, ''); const rows = []; let r = [], f = '', q = false;
    for (let i = 0; i < t.length; i++) { const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; } else if (c !== '\r') f += c; }
    if (f || r.length) { r.push(f); rows.push(r); }
    const h = rows.shift() || [];
    return rows.filter(x => x.some(v => v.trim())).map(x => Object.fromEntries(h.map((k, i) => [k.trim(), (x[i] || '').trim()])));
  }
  // 口味 → 顏色（先比對的優先）
  const FLAVORS = [
    [/草莓|莓/, '#E8798F', '草莓'], [/抹茶/, '#7FA65A', '抹茶'], [/可可|巧克力|HERSHEY/i, '#7B4A32', '可可'],
    [/芋/, '#A88BC6', '芋頭'], [/開心果/, '#A9BA6A', '開心果'], [/哈密瓜/, '#F0B26E', '哈密瓜'], [/柚/, '#EFCB57', '柚子'],
    [/芒果/, '#F2A93B', '芒果'], [/葡萄/, '#8C5BA6', '葡萄'], [/檸檬/, '#EDD86A', '檸檬'], [/栗|焙茶|焙/, '#A0704C', '焙茶・栗子'],
    [/太妃|焦糖|黑糖/, '#C2854A', '焦糖'], [/綠奶|奶綠/, '#C8D5A0', '奶綠'], [/綠茶|烏龍/, '#C3C46E', '茶'], [/紅茶|奶茶/, '#B8743F', '紅茶']
  ];
  const look = n => {
    const s = `${n['口味'] || ''} ${n['品名']} ${n['說明']}`;
    const f = FLAVORS.find(([re]) => re.test(`${n['口味'] || ''} ${n['品名']}`)) || FLAVORS.find(([re]) => re.test(s)) || [null, '#D6AE84', ''];
    return {color: f[1], flavor: n['口味'] || f[2], milk: /奶|拿鐵|雪|歐蕾|鮮乳|燕麥/.test(n['品名']), cream: /奶霜|奶蓋|雪|厚奶/.test(n['品名'] + n['說明']),
      pearls: /波波|珍珠|Q|糰子|凍/.test(n['品名'])};
  };
  // 優惠：有「優惠」欄就用它（過了「優惠到」就不顯示），沒有就從說明裡找
  const deal = n => {
    if (n['優惠到'] && n['優惠到'] < new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10)) return '';
    return n['優惠'] || ((n['說明'].match(/[^，。；]*(買一送一|第二杯|折|半價|送)[^，。；]*/) || [])[0] || '');
  };
  const mix = (hex, w) => { const c = parseInt(hex.slice(1), 16), r = c >> 16, g = c >> 8 & 255, b = c & 255, m = v => Math.round(v + (255 - v) * w);
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1); };
  // 一杯飲料（SVG）
  function cup(n, size = 120) {
    const L = look(n), body = L.milk ? mix(L.color, .35) : L.color, id = 'c' + Math.random().toString(36).slice(2, 7);
    return `<svg class="dk-cup" width="${size * .72}" height="${size}" viewBox="0 0 72 100" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="M14 22h44l-5 72a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z"/></clipPath></defs>
      <rect x="38" y="2" width="5" height="34" rx="2" transform="rotate(12 40 20)" fill="var(--hl)"/>
      <g clip-path="url(#${id})">
        <rect x="0" y="22" width="72" height="80" fill="${mix(L.color, .82)}"/>
        <rect x="0" y="${L.cream ? 38 : 30}" width="72" height="80" fill="${body}"/>
        ${L.cream ? `<rect x="0" y="27" width="72" height="12" fill="#FFF6E6"/>` : ''}
        ${L.milk ? `<path d="M0 62 C18 56 30 70 72 60 V100 H0Z" fill="${L.color}" opacity=".45"/>` : ''}
        ${L.pearls ? [14, 26, 38, 50, 20, 32, 44, 56].map((x, i) => `<circle cx="${x + 2}" cy="${i < 4 ? 90 : 82}" r="4.2" fill="#3A2A22"/>`).join('') : ''}
      </g>
      <path d="M14 22h44l-5 72a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z" fill="none" stroke="var(--ink)" stroke-opacity=".35" stroke-width="1.5"/>
      <rect x="10" y="17" width="52" height="6" rx="3" fill="var(--ink)" opacity=".7"/>
    </svg>`;
  }
  const load = (base = '') => fetch(base + 'data/drinks-new.csv', {cache: 'no-cache'}).then(r => r.ok ? r.text() : '').then(t => parseCSV(t).sort((a, b) => b['日期'].localeCompare(a['日期'])));
  window.BBDrinks = {load, cup, look, deal};
})();
