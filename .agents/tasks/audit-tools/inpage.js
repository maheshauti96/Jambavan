// Injected into the page after each load. Temporary audit helpers.
window.__jv = (() => {
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05; };
  const norm = s => (s || "").replace(/\s+/g, " ").trim();
  function clickText(text, sel = "button, a, label", exact = false) {
    const els = [...document.querySelectorAll(sel)].filter(visible);
    const el = els.find(e => exact ? norm(e.innerText) === text : norm(e.innerText).includes(text)) || els.find(e => e.getAttribute("aria-label") === text);
    if (!el) return false; el.scrollIntoView({ block: "center" }); el.click(); return norm(el.innerText) || el.getAttribute("aria-label");
  }
  function homeHook() {
    const root = document.querySelector(".jambavan-app"); const k = Object.keys(root).find(x => x.startsWith("__reactFiber"));
    let f = root[k];
    while (f) { if (typeof f.type === "function" && f.memoizedState && typeof f.memoizedState.memoizedState === "string") return f.memoizedState; f = f.return; }
    return null;
  }
  function setView(key) { const h = homeHook(); h.queue.dispatch(key); return true; }
  function parse(c) { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; }
  function lum({ r, g, b }) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
  const mix = (top, base) => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
  function bgOf(el) {
    const layers = []; let e = el; let gradient = false;
    while (e && e !== document.documentElement) {
      const cs = getComputedStyle(e); const c = parse(cs.backgroundColor);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !(c && c.a >= 1)) gradient = true;
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
      e = e.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = mix(layers[i], base);
    return { bg: base, gradient };
  }
  const hex = c => "#" + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  function contrast(scopeSel = "body") {
    const scope = document.querySelector(scopeSel) || document.body;
    const out = {}; let checked = 0; const sizes = { lt10: 0, lt12: 0, lt14: 0, total: 0 };
    for (const el of scope.querySelectorAll("*")) {
      if (["SCRIPT", "STYLE", "SVG", "PATH"].includes(el.tagName.toUpperCase())) continue;
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(" ");
      if (!own || !visible(el)) continue;
      const cs = getComputedStyle(el); const size = parseFloat(cs.fontSize); const weight = Number(cs.fontWeight) || 400;
      sizes.total++; if (size < 10) sizes.lt10++; if (size < 12) sizes.lt12++; if (size < 14) sizes.lt14++;
      const fg0 = parse(cs.color); const { bg, gradient } = bgOf(el); const fg = mix({ ...fg0, a: fg0.a * Number(cs.opacity || 1) }, bg);
      const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const large = size >= 24 || (size >= 18.66 && weight >= 700); const need = large ? 3 : 4.5; checked++;
      if (ratio < need) {
        const key = `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""} < ${el.parentElement?.className?.toString().split(" ")[0] || el.parentElement?.tagName.toLowerCase()}`;
        const o = out[key] || (out[key] = { count: 0, minRatio: 99, sample: "", fg: "", bg: "", fontSize: size, gradient });
        o.count++; if (ratio < o.minRatio) { o.minRatio = +ratio.toFixed(2); o.sample = own.slice(0, 60); o.fg = hex(fg); o.bg = hex(bg); o.fontSize = size; o.gradient = gradient; }
      }
    }
    const fails = Object.entries(out).map(([sel, v]) => ({ sel, ...v })).sort((a, b) => a.minRatio - b.minRatio);
    return { checked, failingElements: fails.reduce((s, f) => s + f.count, 0), fails: fails.slice(0, 40), sizes };
  }
  function tapTargets() {
    const els = [...document.querySelectorAll("button, a[href], input, select, textarea, [role=button]")].filter(visible);
    const small = els.map(e => { const r = e.getBoundingClientRect(); return { t: norm(e.innerText || e.getAttribute("aria-label") || e.getAttribute("placeholder") || e.type).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; });
    return { total: els.length, under24: small.filter(s => s.h < 24 || s.w < 24).length, under44: small.filter(s => s.h < 44).length, samples: small.filter(s => s.h < 24 || s.w < 24).slice(0, 12) };
  }
  function unlabeled() {
    const fields = [...document.querySelectorAll("input, select, textarea")].filter(visible);
    const bad = fields.filter(f => !(f.labels && f.labels.length) && !f.getAttribute("aria-label") && !f.getAttribute("aria-labelledby"));
    const noId = fields.filter(f => !f.id && !f.name);
    const iconBtns = [...document.querySelectorAll("button")].filter(visible).filter(b => !norm(b.innerText) && !b.getAttribute("aria-label"));
    return { fields: fields.length, withoutAccessibleName: bad.map(f => f.placeholder || f.type).slice(0, 15), withoutIdOrName: noId.length, iconButtonsWithoutName: iconBtns.length };
  }
  // IR1-2: under isMobile emulation Chrome widens the layout viewport to fit wide content, so scrollWidth and
  // innerWidth grow together and comparing them certifies nothing (proposal §2.4). Compare against the emulated
  // device width passed in by the driver (falling back to visualViewport.width), and list the outermost elements
  // whose right edge passes it.
  function overflow(deviceWidth) {
    const ref = deviceWidth || Math.round(window.visualViewport?.width || innerWidth);
    const de = document.documentElement;
    const clippedBy = el => { for (let a = el.parentElement; a && a !== de; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.position === "fixed") return true; if (cs.overflowX !== "visible" && a.getBoundingClientRect().right <= ref + 1) return true; } return false; };
    const over = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right + scrollX > ref + 1; };
    // A culprit sticks out of its parent's right edge, or is wider than the device while its parent is not
    // (the parent then grew to fit it). Containers that only grew because a descendant did are not listed.
    const sticksOut = el => { const p = el.parentElement; if (!p || p === de) return false; const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect(); return r.right > pr.right + 1; };
    const culprits = [...document.body.querySelectorAll("*")]
      .filter(el => over(el) && getComputedStyle(el).position !== "fixed" && !clippedBy(el) && (sticksOut(el) || (el.parentElement && !over(el.parentElement))))
      .map(el => ({ el: `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""}`, right: Math.round(el.getBoundingClientRect().right + scrollX) }))
      .slice(0, 8);
    return { deviceWidth: ref, scrollWidth: de.scrollWidth, innerWidth, visualViewportWidth: Math.round(window.visualViewport?.width || 0), overflowX: de.scrollWidth > ref + 1, culprits };
  }
  function modalInfo() {
    const m = document.querySelector(".task-modal, .notification-panel"); if (!m) return null;
    const r = m.getBoundingClientRect(); const cs = getComputedStyle(m);
    const scrollable = /(auto|scroll)/.test(cs.overflowY) && m.scrollHeight > m.clientHeight;
    return { cls: m.className, role: m.getAttribute("role") || m.parentElement.getAttribute("role"), ariaModal: m.getAttribute("aria-modal") || m.parentElement.getAttribute("aria-modal"), top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), innerHeight, clippedTop: r.top < 0, clippedBottom: r.bottom > innerHeight + 1, scrollable, heading: norm(m.querySelector("h2, strong")?.innerText) };
  }
  function focusInfo() {
    const a = document.activeElement; if (!a || a === document.body) return { el: "body" };
    const cs = getComputedStyle(a);
    return { el: `${a.tagName.toLowerCase()}.${a.className}`.slice(0, 60), text: norm(a.innerText || a.getAttribute("aria-label") || a.placeholder).slice(0, 40), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, boxShadow: cs.boxShadow, insideModal: !!a.closest(".task-modal") };
  }
  function images() { const imgs = [...document.querySelectorAll("img")]; return { total: imgs.length, broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length, sampleSrc: imgs[0]?.getAttribute("src"), sampleAlt: imgs[0]?.alt }; }
  function navButtons() { return [...document.querySelectorAll(".sidebar button")].map(b => ({ text: norm(b.innerText), active: b.classList.contains("active") })); }
  const text = sel => norm(document.querySelector(sel)?.innerText);
  const texts = sel => [...document.querySelectorAll(sel)].map(e => norm(e.innerText));
  return { clickText, setView, contrast, tapTargets, unlabeled, overflow, modalInfo, focusInfo, images, navButtons, text, texts, norm, visible };
})();
true;
