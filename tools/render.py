"""Render IG story cards (1080x1920 PNG) from stories.json.

mode "board"：每日一張「今天的黑板」限動（只講一件事，下方留空間給 IG 測驗／連結貼圖）。
設 RENDER_HTML=1 時只輸出 HTML（本機預覽用，不需要 playwright）。"""
import json, os, sys, html
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else "stories.json")
out = Path(sys.argv[2] if len(sys.argv) > 2 else "out")
out.mkdir(exist_ok=True)
d = json.loads(src.read_text(encoding="utf-8"))
e = lambda s: html.escape(s).replace("\n", "<br>")
BRAND = "BlackLi Board"
LOGO = '<svg width="56" height="56" style="vertical-align:middle;margin-right:16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="44" fill="#23392F"/><path transform="translate(107.67 144.00) scale(-0.05906 -0.05906)" fill="#F2EFE6" d="M96 0H798C1121 0 1320 177 1320 422C1320 632 1166 769 974 776V792C1147 825 1262 953 1262 1118C1262 1344 1082 1490 742 1490H96ZM500 322V638H696C818 638 894 579 894 474C894 375 825 322 690 322ZM500 888V1172H672C772 1172 846 1121 846 1030C846 938 772 888 666 888Z"/><path transform="translate(92.33 144.00) scale(0.05906 -0.05906)" fill="#F4D35E" d="M96 0H798C1121 0 1320 177 1320 422C1320 632 1166 769 974 776V792C1147 825 1262 953 1262 1118C1262 1344 1082 1490 742 1490H96ZM500 322V638H696C818 638 894 579 894 474C894 375 825 322 690 322ZM500 888V1172H672C772 1172 846 1121 846 1030C846 938 772 888 666 888Z"/></svg>'
UP, DOWN = "#FF7A86", "#4ADE80"  # 台灣慣例：漲紅跌綠

BASE = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1920px; }
body { font-family:'Noto Sans CJK TC',sans-serif; color:#F2EFE6;
  background:#1E3329; position:relative; overflow:hidden; }
.glow { position:absolute; width:1200px; height:1200px; border-radius:50%;
  filter:blur(40px); opacity:.55; }
.grid { position:absolute; inset:0; opacity:.07;
  background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
  background-size:90px 90px; }
.wrap { position:absolute; left:90px; right:90px; top:270px; bottom:360px;
  display:flex; flex-direction:column; }
.brand { font-size:30px; letter-spacing:3px; color:#F4D35E; font-weight:700; }
.date { font-size:30px; color:#B7C2B9; margin-top:10px; letter-spacing:2px; }
.foot { position:absolute; left:90px; right:90px; bottom:380px; display:flex;
  justify-content:space-between; font-size:26px; color:#93A397; }
"""

def page(body, glow_color, glow_pos):
    return f"""<html><head><meta charset="utf-8"><style>{BASE}</style></head><body>
<div class="glow" style="background:radial-gradient({glow_color},transparent 65%);{glow_pos}"></div>
<div class="grid"></div>{body}</body></html>"""

def cover():
    items = "".join(
        f"""<div style="display:flex;gap:34px;align-items:flex-start;padding:38px 0;border-top:2px solid #3A5546">
        <div style="font-size:64px;font-weight:900;color:#F4D35E;line-height:1;min-width:70px">{i+1:02d}</div>
        <div><div style="font-size:26px;color:#B7C2B9;letter-spacing:4px;margin-bottom:10px">{e(s['tag'])}</div>
        <div style="font-size:44px;font-weight:700;line-height:1.35">{e(s['headline'].replace(chr(10),' '))}</div></div></div>"""
        for i, s in enumerate(d["stories"]))
    body = f"""<div class="wrap">
      <div class="brand">{LOGO}{BRAND}</div>
      <div class="date">{e(d['date'])}　{e(d['weekday'])}</div>
      <div style="font-size:104px;font-weight:900;line-height:1.15;margin:70px 0 60px">{e(d['title'])}</div>
      {items}
    </div>
    <div class="foot"><span>往右滑看重點 → 完整報導點連結</span><span>僅供參考，非投資建議</span></div>"""
    return page(body, "#3E6B55", "left:-300px;top:-400px;")

def card(i, s):
    col = UP if s["dir"] == "up" else DOWN
    bullets = "".join(
        f"""<div style="display:flex;gap:26px;margin-bottom:34px">
        <div style="width:14px;height:14px;border-radius:50%;background:#F4D35E;margin-top:20px;flex:none"></div>
        <div style="font-size:40px;line-height:1.5">{e(b)}</div></div>""" for b in s["bullets"])
    chg = f'<span style="font-size:44px;font-weight:700;color:{col}">{e(s["change"])}</span>' if s["change"] else ""
    body = f"""<div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:32px;font-weight:700;background:#F4D35E;color:#1E3329;padding:10px 30px;border-radius:40px">{e(s['tag'])}</div>
        <div class="date" style="margin:0">{e(d['date'])}</div></div>
      <div style="font-size:86px;font-weight:900;line-height:1.25;margin:60px 0 56px">{e(s['headline'])}</div>
      <div style="background:rgba(255,255,255,.06);border:2px solid #3A5546;border-left:10px solid {col};border-radius:28px;padding:44px 50px;margin-bottom:64px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:30px;color:#B7C2B9">{e(s['stat_label'])}</span>{chg}</div>
        <div style="font-size:124px;font-weight:900;color:{col};line-height:1.1">{e(s['stat'])}</div>
      </div>
      {bullets}
    </div>
    <div class="foot"><span>資料來源：{e(s['source'])}</span><span>{i+1} / {len(d['stories'])}</span></div>"""
    return page(body, col + "55", "right:-500px;top:-500px;")

def stat_row(s):
    """財經單張：每則可加 stat／stat_label／change／dir（選填），國際不填就不顯示。"""
    if not s.get("stat"):
        return ""
    col = UP if s.get("dir", "up") == "up" else DOWN
    chg = f'<span style="font-size:34px;font-weight:700;color:{col}">{e(s["change"])}</span>' if s.get("change") else ""
    return f"""<div style="display:flex;align-items:baseline;gap:20px;flex-wrap:wrap;margin-bottom:6px">
        <span style="font-size:54px;font-weight:900;color:{col};line-height:1.1">{e(s['stat'])}</span>{chg}
        <span style="font-size:28px;color:#B7C2B9">{e(s.get('stat_label',''))}</span></div>"""

def digest():
    acc = d.get("accent", "#F4D35E")
    tight = any(s.get("stat") for s in d["stories"])  # 有數字列時縮小間距，避免撞到頁尾
    pad, tmar = ("20px", "28px 0 14px") if tight else ("30px", "40px 0 24px")
    items = "".join(
        f"""<div style="padding:{pad} 0;border-top:2px solid #3A5546">
        <div style="display:flex;align-items:center;gap:22px;margin-bottom:16px">
          <div style="font-size:56px;font-weight:900;color:{acc};line-height:1">{i+1:02d}</div>
          <div style="font-size:26px;font-weight:700;color:#1E3329;background:{acc};padding:6px 20px;border-radius:30px">{e(s['tag'])}</div></div>
        <div style="font-size:50px;font-weight:900;line-height:1.3;margin-bottom:14px">{e(s['headline'])}</div>
        {stat_row(s)}
        <div style="font-size:32px;line-height:1.5;color:#DCE3DA">{e(s['summary'])}</div></div>"""
        for i, s in enumerate(d["stories"]))
    body = f"""<div class="wrap">
      <div class="brand">{LOGO}{BRAND}</div>
      <div class="date">{e(d['date'])}　{e(d['weekday'])}</div>
      <div style="font-size:88px;font-weight:900;line-height:1.15;margin:{tmar}">{e(d['title'])}</div>
      {items}
    </div>
    <div class="foot"><span>完整報導點連結 →</span><span>資料來源：{e(d.get('source',''))}</span></div>"""
    return page(body, acc + "66", "left:-300px;top:-400px;")


CHALK_GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .95 0 0 0 0 .94 0 0 0 0 .9 0 0 0 .10 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
CHALK_LINE = '<svg width="420" height="22" viewBox="0 0 240 10" preserveAspectRatio="none" style="display:block;margin:34px 0 0"><path d="M2 6 C40 3 70 7 110 5 S180 2 238 6" fill="none" stroke="#F4D35E" stroke-width="3" stroke-linecap="round"/><path d="M8 8 C60 6 120 8 200 7" fill="none" stroke="#F4D35E" stroke-width="1.2" stroke-linecap="round" opacity=".5"/></svg>'

def board():
    """今天的黑板：一件事、一句話、一個數字（選填）。y 1300～1620 留白放 IG 貼圖。"""
    num = ""
    if d.get("stat"):
        col = {"up": UP, "down": DOWN}.get(d.get("dir"), "#F4D35E")
        num = f"""<div style="margin-top:56px;display:flex;align-items:baseline;gap:24px;flex-wrap:wrap">
          <span style="font-size:96px;font-weight:900;color:{col};line-height:1">{e(d['stat'])}</span>
          <span style="font-size:32px;color:#B7C2B9">{e(d.get('stat_label',''))}</span></div>"""
    note = "僅供參考，非投資建議" if d.get("finance") else ""
    body = f"""<div style="position:absolute;inset:0;background:{CHALK_GRAIN},radial-gradient(ellipse 60% 35% at 20% 18%,rgba(242,239,230,.07),transparent 70%),radial-gradient(ellipse 50% 30% at 85% 85%,rgba(242,239,230,.05),transparent 70%)"></div>
    <div style="position:absolute;left:96px;right:96px;top:250px">
      <div class="brand" style="letter-spacing:0">{LOGO}{BRAND}</div>
      <div style="font-size:30px;color:#B7C2B9;margin-top:56px">{e(d['date'])} {e(d['weekday'])}，{e(d.get('kicker','今天弄懂一件事'))}</div>
      <div style="font-size:92px;font-weight:900;line-height:1.28;margin-top:22px">{e(d['headline'])}</div>
      {CHALK_LINE}
      <div style="font-size:42px;line-height:1.6;color:#E4E9E2;margin-top:40px">{e(d['oneline'])}</div>
      {num}
    </div>
    <div style="position:absolute;left:96px;right:96px;bottom:300px;display:flex;justify-content:space-between;font-size:26px;color:#93A397">
      <span>資料來源：{e(d.get('source',''))}</span><span>{note}</span></div>"""
    return f"""<html><head><meta charset="utf-8"><style>{BASE}</style></head><body style="background:#23392F">{body}</body></html>"""

if d.get("mode") == "board":
    pages = [board()]
elif d.get("mode") == "digest":
    pages = [digest()]
else:
    pages = [cover()] + [card(i, s) for i, s in enumerate(d["stories"])]
name = lambda n: out / (f"{d.get('file', 'world')}_{n+1}" if d.get("mode") in ("digest", "board") else f"story_{n+1}")
if os.environ.get("RENDER_HTML"):
    for n, h in enumerate(pages):
        f = name(n).with_suffix(".html"); f.write_text(h, encoding="utf-8"); print(f)
    sys.exit()
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    for n, h in enumerate(pages):
        pg.set_content(h); pg.wait_for_timeout(200)
        f = name(n).with_suffix(".png"); pg.screenshot(path=str(f)); print(f)
    b.close()
