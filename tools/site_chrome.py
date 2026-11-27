"""把全站共用的上方選單列、頁尾、配色與小功能套用到每個頁面（BlackLi Board）。

用法：python3 tools/site_chrome.py
每頁會在 <!-- SITE-NAV:START/END --> 與 <!-- SITE-FOOT:START/END --> 之間放入最新版本；
沒有標記的頁面會自動加上。要改選單或頁尾，只要改這個檔案再重跑一次。
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRAND = "BlackLi Board"
LINKS = [  # (文字, 路徑, 判斷目前頁面用的 key, 選單裡的小字說明)；點左邊的網站名稱也會回首頁
    ("今天", "index.html", "home", "今日拆解・小考・今日一問"),
    ("新聞", "news.html", "news", "財經・國際・盤後・盤前"),
    ("專欄", "weekly.html", "weekly", "生活・科技・社會・身心・深度拆解"),
    ("工具", "tools.html", "tools", "出遊・排行程・理財・休假"),
    ("關於", "about.html", "about", "網站初衷與拆解方法"),
]

def page_key(rel):
    if re.match(r"reports/(life|tech|society|deep)-|tools/deep", rel): return "weekly"
    if re.match(r"reports/mind-|tools/mind", rel): return "weekly"
    if re.match(r"reports/fun-|tools/fun", rel): return "fun"
    if rel.startswith("reports/") or re.match(r"tools/(brief|close|pre)-", rel): return "news"
    return {"index.html": "home", "news.html": "news", "finance.html": "news", "world.html": "news",
            "weekly.html": "weekly", "deep.html": "weekly", "mind.html": "weekly", "fun.html": "fun",
            "tools.html": "tools", "calc.html": "tools", "trip.html": "tools", "travel.html": "tools",
            "about.html": "about", "method.html": "about", "app.html": "tools", "leave.html": "tools", "skills.html": "tools", "career.html": "tools", "guide.html": "tools", "saved.html": "home", "memo.html": "tools", "offline.html": ""}.get(rel, "")

def logo(pre):
    return f'<img src="{pre}assets/logo.svg" alt="" width="36" height="36">BlackLi <b>Board</b>'

def nav(pre, key):
    def a(t, href, k, sub, drop):
        cur = ' aria-current="page"' if k == key else ""
        return f'<a href="{pre}{href}"{cur}>{t}' + (f'<small>{sub}</small>' if drop else '') + '</a>'
    links = "".join(a(*l, False) for l in LINKS)
    drop = "".join(a(*l, True) for l in LINKS)
    return (f'<!-- SITE-NAV:START -->\n<div class="sb"><div class="sb-in">'
            f'<a class="sb-logo" href="{pre}index.html" aria-label="{BRAND} 首頁">{logo(pre)}</a>'
            f'<nav class="sb-links" aria-label="主選單">{links}</nav>'
            f'<details class="sb-menu"><summary aria-label="開啟選單"><span class="bars"></span>選單</summary>'
            f'<nav class="sb-drop" aria-label="主選單">{drop}</nav></details>'
            f'</div></div>\n<!-- SITE-NAV:END -->')

def foot(pre):
    p = pre
    small = logo(pre).replace(' width="36" height="36"', ' width="30" height="30"')
    return (f'<!-- SITE-FOOT:START -->\n<div class="sf"><div class="sf-in">'
            f'<div><div class="sf-brand">{small}</div>'
            f'<p>把複雜的事寫在黑板上：分清楚事實、觀點、立場與利益，用幾分鐘看懂。</p>'
            f'<p class="bb-theme" role="group" aria-label="外觀">外觀<button type="button" data-set-theme="dark">黑板</button><button type="button" data-set-theme="light">白天</button></p></div>'
            f'<div><h5>每天讀</h5><ul><li><a href="{p}index.html">今天</a></li><li><a href="{p}news.html">新聞</a></li>'
            f'<li><a href="{p}weekly.html">專欄</a></li><li><a href="{p}mind.html">自己</a></li><li><a href="{p}fun.html">輕鬆</a></li></ul></div>'
            f'<div><h5>工具</h5><ul><li><a href="{p}travel.html">出遊情報</a></li><li><a href="{p}trip.html">幫我排行程</a></li>'
            f'<li><a href="{p}calc.html">理財小工具</a></li><li><a href="{p}leave.html">休假中心</a></li><li><a href="{p}app.html">裝到手機</a></li></ul></div>'
            f'<div><h5>關於</h5><ul><li><a href="{p}about.html">關於本站</a></li>'
            f'<li><a href="{p}method.html">我怎麼拆解資訊</a></li><li><a href="{p}method.html#sources">來源原則</a></li>'
            f'<li><a href="{p}about.html#disclaimer">免責聲明</a></li></ul></div>'
            f'</div><div class="sf-bottom"><span>© 2026 {BRAND}</span>'
            f'<span>內容整理自公開資料與新聞報導，僅供參考，不構成投資建議。</span></div></div>\n<!-- SITE-FOOT:END -->')

def apply(path):
    rel = path.relative_to(ROOT).as_posix()
    pre = "../" if "/" in rel else ""
    s = path.read_text(encoding="utf-8")
    head = (f'<link rel="icon" href="{pre}assets/logo.svg" type="image/svg+xml">\n'
            # 外觀由網站自己決定：預設黑板（深色），讀者可以在頁尾切成白天；不跟手機設定走
            f'<script>(function(){{var t="dark";try{{t=localStorage.getItem("bb-theme")||"dark"}}catch(e){{}}document.documentElement.dataset.theme=t}})();</script>\n'
            f'<meta name="theme-color" content="#1A2C23">\n'
            f'<link rel="manifest" href="{pre}manifest.webmanifest">\n'
            f'<link rel="apple-touch-icon" href="{pre}assets/icons/apple-touch-icon.png">\n'
            f'<meta name="mobile-web-app-capable" content="yes">\n'
            f'<meta name="apple-mobile-web-app-capable" content="yes">\n'
            f'<meta name="apple-mobile-web-app-title" content="BlackLi">\n'
            f'<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
            f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chiron+Hei+HK:wght@400;500;700&display=swap">\n'
            f'<link rel="stylesheet" href="{pre}site.css">\n<script src="{pre}assets/site.js" defer></script>')
    s = re.sub(r'<!-- SITE-HEAD:START -->.*?<!-- SITE-HEAD:END -->\n?', '', s, flags=re.S)
    s = s.replace("</head>", f"<!-- SITE-HEAD:START -->\n{head}\n<!-- SITE-HEAD:END -->\n</head>", 1)
    n, f = nav(pre, page_key(rel)), foot(pre)
    if "<!-- SITE-NAV:START -->" in s:
        s = re.sub(r'<!-- SITE-NAV:START -->.*?<!-- SITE-NAV:END -->', lambda m: n, s, flags=re.S)
    else:
        s = re.sub(r"<body([^>]*)>\n?", lambda m: f"<body{m.group(1)}>\n" + n + "\n", s, count=1)
    if "<!-- SITE-FOOT:START -->" in s:
        s = re.sub(r'<!-- SITE-FOOT:START -->.*?<!-- SITE-FOOT:END -->', lambda m: f, s, flags=re.S)
    else:
        s = s.replace("</body>", f + "\n</body>", 1)
    path.write_text(s, encoding="utf-8")
    return rel

if __name__ == "__main__":
    pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "reports").glob("*.html")) + sorted((ROOT / "tools").glob("*.html"))
    for p in pages:
        if p.exists(): print("updated", apply(p))
