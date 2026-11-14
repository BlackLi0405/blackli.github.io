"""把全站共用的上方選單列與頁尾套用到每個頁面。

用法：python3 tools/site_chrome.py
每頁會在 <!-- SITE-NAV:START/END --> 與 <!-- SITE-FOOT:START/END --> 之間放入最新版本；
沒有標記的頁面會自動加上。要改選單或頁尾，只要改這個檔案再重跑一次。
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRAND = "曹濬騰早起工作"
LINKS = [  # (文字, 路徑, 判斷目前頁面用的 key)
    ("首頁", "index.html", "home"),
    ("財經早報", "finance.html", "finance"),
    ("國際早報", "world.html", "world"),
    ("深度拆解", "deep.html", "deep"),
    ("理財小工具", "calc.html", "calc"),
    ("關於本站", "about.html", "about"),
]
FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' rx='16' fill='%23E8B44C'/%3E%3Ctext x='32' y='45' font-size='36' "
           "font-weight='900' text-anchor='middle' fill='%230E1726' font-family='sans-serif'%3E%E6%97%A9%3C/text%3E%3C/svg%3E")

def page_key(rel):
    if rel.startswith("reports/world-"): return "world"
    if rel.startswith("reports/deep-") or rel.startswith("tools/deep"): return "deep"
    if rel.startswith("reports/"): return "finance"
    return {"index.html": "home", "finance.html": "finance", "world.html": "world", "deep.html": "deep",
            "calc.html": "calc", "about.html": "about", "method.html": "about"}.get(rel, "")

def nav(pre, key):
    def a(t, href, k, cls=""):
        cur = ' aria-current="page"' if k == key else ""
        return f'<a href="{pre}{href}"{cur}>{t}</a>'
    links = "".join(a(*l) for l in LINKS)
    return (f'<!-- SITE-NAV:START -->\n<div class="sb"><div class="sb-in">'
            f'<a class="sb-logo" href="{pre}index.html"><span class="sb-mark">早</span>{BRAND}</a>'
            f'<nav class="sb-links" aria-label="主選單">{links}</nav>'
            f'<details class="sb-menu"><summary aria-label="開啟選單"><span class="bars"></span>選單</summary>'
            f'<nav class="sb-drop" aria-label="主選單">{links}</nav></details>'
            f'</div></div>\n<!-- SITE-NAV:END -->')

def foot(pre):
    p = pre
    return (f'<!-- SITE-FOOT:START -->\n<div class="sf"><div class="sf-in">'
            f'<div><div class="sf-brand"><span class="sb-mark">早</span>{BRAND}</div>'
            f'<p>資訊轉譯站：幫你分清楚事實、觀點、立場與利益，用幾分鐘看懂複雜的事。</p></div>'
            f'<div><h5>內容</h5><ul><li><a href="{p}finance.html">財經早報</a></li>'
            f'<li><a href="{p}world.html">國際早報</a></li><li><a href="{p}deep.html">深度拆解</a></li>'
            f'<li><a href="{p}calc.html">理財小工具</a></li></ul></div>'
            f'<div><h5>網站資訊</h5><ul><li><a href="{p}about.html">關於本站</a></li>'
            f'<li><a href="{p}method.html">我怎麼拆解資訊</a></li><li><a href="{p}method.html#sources">來源原則</a></li>'
            f'<li><a href="{p}about.html#disclaimer">免責聲明</a></li></ul></div>'
            f'</div><div class="sf-bottom"><span>© 2026 {BRAND}</span>'
            f'<span>內容整理自公開新聞報導，僅供參考，不構成投資建議。</span></div></div>\n<!-- SITE-FOOT:END -->')

def apply(path):
    rel = path.relative_to(ROOT).as_posix()
    pre = "../" if "/" in rel else ""
    s = path.read_text(encoding="utf-8")
    head = f'<link rel="icon" href="{FAVICON}">\n<link rel="stylesheet" href="{pre}site.css">'
    s = re.sub(r'<!-- SITE-HEAD:START -->.*?<!-- SITE-HEAD:END -->\n?', '', s, flags=re.S)
    s = s.replace("</head>", f"<!-- SITE-HEAD:START -->\n{head}\n<!-- SITE-HEAD:END -->\n</head>", 1)
    n, f = nav(pre, page_key(rel)), foot(pre)
    if "<!-- SITE-NAV:START -->" in s:
        s = re.sub(r'<!-- SITE-NAV:START -->.*?<!-- SITE-NAV:END -->', lambda m: n, s, flags=re.S)
    else:
        s = re.sub(r'<body>\n?', lambda m: "<body>\n" + n + "\n", s, count=1)
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
