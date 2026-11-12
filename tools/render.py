"""Render IG story cards (1080x1920 PNG) from stories.json."""
import json, sys, html
from pathlib import Path
from playwright.sync_api import sync_playwright

src = Path(sys.argv[1] if len(sys.argv) > 1 else "stories.json")
out = Path(sys.argv[2] if len(sys.argv) > 2 else "out")
out.mkdir(exist_ok=True)
d = json.loads(src.read_text(encoding="utf-8"))
e = lambda s: html.escape(s).replace("\n", "<br>")
UP, DOWN = "#FF4D5E", "#22C55E"  # 台灣慣例：漲紅跌綠

BASE = """
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1920px; }
body { font-family:'Noto Sans CJK TC',sans-serif; color:#F5F1E8;
  background:#0E1726; position:relative; overflow:hidden; }
.glow { position:absolute; width:1200px; height:1200px; border-radius:50%;
  filter:blur(40px); opacity:.55; }
.grid { position:absolute; inset:0; opacity:.07;
  background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
  background-size:90px 90px; }
.wrap { position:absolute; left:90px; right:90px; top:270px; bottom:360px;
  display:flex; flex-direction:column; }
.brand { font-size:30px; letter-spacing:3px; color:#E8B44C; font-weight:700; }
.date { font-size:30px; color:#9AA6B8; margin-top:10px; letter-spacing:2px; }
.foot { position:absolute; left:90px; right:90px; bottom:380px; display:flex;
  justify-content:space-between; font-size:26px; color:#7C889B; }
"""

def page(body, glow_color, glow_pos):
    return f"""<html><head><meta charset="utf-8"><style>{BASE}</style></head><body>
<div class="glow" style="background:radial-gradient({glow_color},transparent 65%);{glow_pos}"></div>
<div class="grid"></div>{body}</body></html>"""

def cover():
    items = "".join(
        f"""<div style="display:flex;gap:34px;align-items:flex-start;padding:38px 0;border-top:2px solid #2A3850">
        <div style="font-size:64px;font-weight:900;color:#E8B44C;line-height:1;min-width:70px">{i+1:02d}</div>
        <div><div style="font-size:26px;color:#9AA6B8;letter-spacing:4px;margin-bottom:10px">{e(s['tag'])}</div>
        <div style="font-size:44px;font-weight:700;line-height:1.35">{e(s['headline'].replace(chr(10),' '))}</div></div></div>"""
        for i, s in enumerate(d["stories"]))
    body = f"""<div class="wrap">
      <div class="brand">曹濬騰自主學習</div>
      <div class="date">{e(d['date'])}　{e(d['weekday'])}</div>
      <div style="font-size:104px;font-weight:900;line-height:1.15;margin:70px 0 60px">{e(d['title'])}</div>
      {items}
    </div>
    <div class="foot"><span>往右滑看重點 → 完整報導點連結</span><span>僅供參考，非投資建議</span></div>"""
    return page(body, "#1E4A8A", "left:-300px;top:-400px;")

def card(i, s):
    col = UP if s["dir"] == "up" else DOWN
    bullets = "".join(
        f"""<div style="display:flex;gap:26px;margin-bottom:34px">
        <div style="width:14px;height:14px;border-radius:50%;background:#E8B44C;margin-top:20px;flex:none"></div>
        <div style="font-size:40px;line-height:1.5">{e(b)}</div></div>""" for b in s["bullets"])
    chg = f'<span style="font-size:44px;font-weight:700;color:{col}">{e(s["change"])}</span>' if s["change"] else ""
    body = f"""<div class="wrap">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:32px;font-weight:700;background:#E8B44C;color:#0E1726;padding:10px 30px;border-radius:40px">{e(s['tag'])}</div>
        <div class="date" style="margin:0">{e(d['date'])}</div></div>
      <div style="font-size:86px;font-weight:900;line-height:1.25;margin:60px 0 56px">{e(s['headline'])}</div>
      <div style="background:rgba(255,255,255,.06);border:2px solid #2A3850;border-left:10px solid {col};border-radius:28px;padding:44px 50px;margin-bottom:64px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:30px;color:#9AA6B8">{e(s['stat_label'])}</span>{chg}</div>
        <div style="font-size:124px;font-weight:900;color:{col};line-height:1.1">{e(s['stat'])}</div>
      </div>
      {bullets}
    </div>
    <div class="foot"><span>資料來源：{e(s['source'])}</span><span>{i+1} / {len(d['stories'])}</span></div>"""
    return page(body, col + "55", "right:-500px;top:-500px;")

pages = [cover()] + [card(i, s) for i, s in enumerate(d["stories"])]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    for n, h in enumerate(pages):
        pg.set_content(h); pg.wait_for_timeout(200)
        f = out / f"story_{n+1}.png"; pg.screenshot(path=str(f)); print(f)
    b.close()
