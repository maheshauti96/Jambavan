// Review H2 method: for every text node inside a scene (hero / band / dark reflection card), hide the text,
// screenshot its box, take the worst-case background pixel and compute contrast against the real text colour.
// Zero dependencies: minimal PNG decoder (8-bit RGB/RGBA, non-interlaced) on node:zlib.
import { launch } from "./cdp.mjs";
import { inflateSync } from "node:zlib";

const DIR = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/mocks";
const MOCKS = ["mock-1-home-feed", "mock-3-projects-dashboard-setu", "mock-4-my-day-handover"];
const SIZES = [[1280, 800, false], [1024, 768, false], [1536, 900, false], [844, 390, true], [768, 1024, true], [390, 844, true]];

function decodePng(buf) {
  let p = 8, w, h, ct, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; if (data[8] !== 8 || data[12]) throw new Error("unsupported png"); }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp, raw = inflateSync(Buffer.concat(idat)), out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = out.subarray(y * stride), prev = y ? out.subarray((y - 1) * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0, b = prev ? prev[x] : 0, c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      row[x] = v & 255;
    }
  }
  return { w, h, bpp, px: out };
}
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const collect = `(() => {
  const out = [];
  document.querySelectorAll('.scene, .reflect').forEach(scene => {
    const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement; if (el.closest('svg,[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      const m = cs.color.match(/[\\d.]+/g).map(Number);
      out.push({ text: n.textContent.trim().slice(0, 40), x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, color: m.slice(0, 3), size: parseFloat(cs.fontSize), bold: Number(cs.fontWeight) >= 700, btn: !!el.closest('button,.btn') });
    }
  });
  return out;
})()`;
const hide = `(() => { const s = document.createElement('style'); s.id='__hide'; s.textContent = '.scene *, .reflect * { color: transparent !important; text-shadow: none !important; } .scene button, .scene .btn, .reflect .btn, .scene svg:not(.l-env svg), .reflect .inner svg { visibility: hidden !important; }'; document.head.appendChild(s); return true; })()`;

const p = await launch(9341);
const results = [];
for (const name of MOCKS) for (const [w, h, m] of SIZES) {
  await p.viewport(w, h, m);
  await p.goto("file://" + encodeURI(`${DIR}/${name}.html`));
  await p.eval("document.fonts.ready.then(()=>true)"); await p.sleep(300);
  // Negative control: CONTROL=1 re-applies the round-1 scrim and text widths, which the review says let text sit over art.
  if (process.env.CONTROL) await p.eval(`(() => { const s = document.createElement('style'); s.textContent = '@media (min-width: 768px) { .scene > .l-scrim { background: linear-gradient(90deg, rgba(255,251,243,.97) 0%, rgba(255,251,243,.9) 34%, rgba(255,251,243,.25) 58%, rgba(255,251,243,0) 72%) !important; } .hero-copy, .scene .scene-copy { max-width: 560px !important; } .band .l-scrim { background: linear-gradient(90deg, rgba(255,251,243,.97) 0%, rgba(255,251,243,.88) 38%, rgba(255,251,243,.1) 66%, rgba(255,251,243,0) 80%) !important; } .reflect .l-scrim { background: linear-gradient(90deg, rgba(28,21,18,.88) 0%, rgba(28,21,18,.7) 50%, rgba(28,21,18,.1) 85%) !important; } .reflect .inner { max-width: 520px !important; } }'; document.head.appendChild(s); return 1; })()`);
  const boxes = (await p.eval(collect)).filter(b => !b.btn); // button labels sit on their own opaque fills
  await p.eval(hide); await p.sleep(100);
  let worst = null, fails = [];
  for (const b of boxes) {
    const r = await p.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
    const img = decodePng(Buffer.from(r.data, "base64"));
    let min = Infinity;
    for (let i = 0; i < img.px.length; i += img.bpp) { const c = ratio(b.color, [img.px[i], img.px[i + 1], img.px[i + 2]]); if (c < min) min = c; }
    const large = b.size >= 24 || (b.bold && b.size >= 18.66), need = large ? 3 : 4.5;
    const rec = { text: b.text, size: b.size, min: +min.toFixed(2), need };
    if (!worst || min / need < worst.min / worst.need) worst = rec;
    if (min < need) fails.push(rec);
  }
  results.push({ mock: name, viewport: `${w}x${h}`, textNodes: boxes.length, failures: fails.length, worst, fails: fails.slice(0, 5) });
}
console.log(JSON.stringify(results, null, 1));
await p.close();
