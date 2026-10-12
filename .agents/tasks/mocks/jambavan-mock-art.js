/* JAMBAVAN redesign — mock artwork + icon sprite + Ram Setu renderer.
   These are the reference shapes for client/src/components/jambavan/art/* (proposal §8).
   No deity figures: landscapes, architecture, symbols only. */
(function () {
  const S = 'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const icons = {
    // Ramayana symbols (proposal §7)
    squirrel: `<path ${S} d="M4.5 15.5c0-4.4 3.4-8.5 8-8.5 4.4 0 7.5 3.1 7.5 6.8 0 3.6-3.6 5.7-8 5.7-4.6 0-7.5-1.3-7.5-4z"/><path ${S} d="M9 9.8c1.4 1.6 1.9 4.2 1.3 7.3M12.6 8.2c1.3 1.9 1.7 4.8 1 8.4M16.1 9.4c.9 1.6 1.1 3.7.5 6"/>`,
    foot: `<ellipse ${S} cx="12" cy="15.3" rx="4.1" ry="5.4"/><circle cx="7.9" cy="7.6" r="1.25" fill="currentColor"/><circle cx="10.4" cy="5.9" r="1.35" fill="currentColor"/><circle cx="13.3" cy="5.6" r="1.35" fill="currentColor"/><circle cx="15.9" cy="6.9" r="1.2" fill="currentColor"/>`,
    pennant: `<path ${S} d="M6 21V3M6 4.5h11.5l-3 3.75 3 3.75H6"/>`,
    gada: `<circle ${S} cx="15.2" cy="8.8" r="4.6"/><path ${S} d="M12.1 5.6l6.3 6.4M15.2 4.2v9.2M12 11.9 4 20M5.6 16.9l1.6 1.6M18.6 5.4l1.7-1.7"/>`,
    arrow: `<path ${S} d="M4.5 19.5 19 5M13.5 5H19v5.5M4.5 19.5l-.8-3.6M4.5 19.5l3.6.8"/>`,
    hit: `<circle ${S} cx="11" cy="13" r="7.5"/><circle ${S} cx="11" cy="13" r="3.5"/><path ${S} d="M11 13 20.5 3.5M16.5 3.5h4v4"/>`,
    bridge: `<path ${S} d="M2.5 15.5h19M4 15.5c1.8-3.6 4.8-5.5 8-5.5s6.2 1.9 8 5.5M7 15.5V20M12 15.5V20M17 15.5V20M2.5 20h19"/>`,
    diya: `<path ${S} d="M3.5 14h17c-.9 3.8-4.2 6-8.5 6s-7.6-2.2-8.5-6z"/><path ${S} d="M12 3.5c2.2 2.6 2.6 4.9 0 7.5-2.6-2.6-2.2-4.9 0-7.5z"/>`,
    scroll: `<path ${S} d="M7 4h10.5A2.5 2.5 0 0 1 20 6.5V18a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V4zM7 4a2.5 2.5 0 0 0-2.5 2.5V8H7M10.5 9h6M10.5 12.5h6M10.5 16h4"/>`,
    bow: `<path ${S} d="M7 3c7.5 3.2 7.5 14.8 0 18M7 3v18M3.5 12h15M16 9.2l2.8 2.8-2.8 2.8"/>`,
    sena: `<path ${S} d="M5 20V5M5 6h6l-2 2.5L11 11H5M13 20V8M13 9h6l-2 2.5 2 2.5h-6"/>`,
    path: `<path ${S} stroke-dasharray="2.5 3" d="M12 21c-5-2.5 5-5.5 0-9s5-6.5 0-9"/>`,
    // standard UI icons (lucide-style)
    home: `<path ${S} d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5"/>`,
    users: `<circle ${S} cx="9" cy="8" r="3.5"/><path ${S} d="M3 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.7.8 2.7 2.6 3 5.2"/>`,
    chart: `<path ${S} d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>`,
    calendar: `<rect ${S} x="3.5" y="5" width="17" height="15" rx="2"/><path ${S} d="M3.5 10h17M8 3v4M16 3v4"/>`,
    megaphone: `<path ${S} d="M4 10v4h3l8 4V6L7 10H4zM18 9.5a3.5 3.5 0 0 1 0 5"/>`,
    user: `<circle ${S} cx="12" cy="8" r="4"/><path ${S} d="M4.5 20c1-3.8 4-5.7 7.5-5.7s6.5 1.9 7.5 5.7"/>`,
    shield: `<path ${S} d="M12 3.5 19 6v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-2.5z"/>`,
    clock: `<circle ${S} cx="12" cy="12" r="8.5"/><path ${S} d="M12 7.5V12l3 2"/>`,
    search: `<circle ${S} cx="10.5" cy="10.5" r="6.5"/><path ${S} d="m20 20-4.8-4.8"/>`,
    bell: `<path ${S} d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20.5a2.2 2.2 0 0 0 4 0"/>`,
    menu: `<path ${S} d="M4 7h16M4 12h16M4 17h16"/>`,
    plus: `<path ${S} d="M12 5v14M5 12h14"/>`,
    check: `<path ${S} d="m5 12.5 4.5 4.5L19 7.5"/>`,
    checks: `<path ${S} d="m2.5 12.5 4 4L15 8M10 16.5l1 1L20.5 8"/>`,
    x: `<path ${S} d="M6 6l12 12M18 6 6 18"/>`,
    pencil: `<path ${S} d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>`,
    more: `<circle cx="5.5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor"/>`,
    alert: `<circle ${S} cx="12" cy="12" r="8.5"/><path ${S} d="M12 7.5v5.5M12 16.3v.2"/>`,
    lock: `<rect ${S} x="5" y="10.5" width="14" height="10" rx="2"/><path ${S} d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
    flag: `<path ${S} d="M5 21V4M5 4.5h12l-2.5 4 2.5 4H5"/>`,
    thumb: `<path ${S} d="M7 11v9H4v-9h3zM7 11l4-7c1.6 0 2.5 1.2 2.2 2.8L12.6 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>`,
    clip: `<path ${S} d="m20 11.5-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7.2"/>`,
    chevron: `<path ${S} d="m6 9 6 6 6-6"/>`,
    archive: `<rect ${S} x="3.5" y="4" width="17" height="4.5" rx="1"/><path ${S} d="M5 8.5V20h14V8.5M10 12.5h4"/>`,
    notebook: `<rect ${S} x="5" y="3.5" width="14" height="17" rx="2"/><path ${S} d="M9 3.5v17M12 8h4M12 11.5h4"/>`,
    // round 2: PriorityBadge signal bars (N10) and Sanjeevani mountain (N8)
    sig3: `<path ${S} d="M5 19v-3M10 19v-7M15 19V8M20 19V4"/>`,
    sig2: `<path ${S} d="M5 19v-3M10 19v-7M15 19V8"/><path ${S} opacity=".3" d="M20 19V4"/>`,
    sig1: `<path ${S} d="M5 19v-3M10 19v-7"/><path ${S} opacity=".3" d="M15 19V8M20 19V4"/>`,
    sanjeevani: `<path ${S} d="M2.5 20 9 9l3.5 5 2.5-3.5L21.5 20z"/><path ${S} d="M14.5 6.5c1.6-2.4 4-3 6-2.6-.3 2.2-1.9 4-4.4 4.3M14.5 6.5c.4 1.1.4 2.2.1 3.3"/>`,
    // round 4: My Day (lucide Sunrise), in-app link arrow (lucide ArrowRight, review round 3 N8), handover relay, moon-and-cave (Jambavan)
    sunrise: `<path ${S} d="M12 2v6M5.2 10.2l1.4 1.4M2 18h2M20 18h2M17.4 11.6l1.4-1.4M22 22H2M8.5 5.5 12 2l3.5 3.5M16 18a4 4 0 0 0-8 0"/>`,
    arrowright: `<path ${S} d="M5 12h14M13 6l6 6-6 6"/>`,
    handover: `<path ${S} d="M3 15.5c2.5 0 4-1.5 5.5-1.5H12a1.5 1.5 0 0 1 0 3H9.5M3 20h9.5l6.5-3.2a1.6 1.6 0 0 0-1.4-2.9L14 15.5"/><path ${S} d="M9 8.5h11M16.5 5l3.5 3.5L16.5 12"/>`,
    mooncave: `<path ${S} d="M15.5 3.5a4.5 4.5 0 1 0 4 6.5 3.6 3.6 0 1 1-4-6.5z"/><path ${S} d="M2.5 21c2-5 5.5-8 9.5-8s7.5 3 9.5 8M9 21v-2.5a3 3 0 0 1 6 0V21"/>`,
    lock2: `<rect ${S} x="5" y="10.5" width="14" height="10" rx="2"/><path ${S} d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>`,
    trash: `<path ${S} d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>`,
  };
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${Object.entries(icons).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("")}</svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  // ---- architecture helpers (silhouettes, no figures) ----
  const shikhara = (x, base, w, h) => `M${x} ${base}V${base - h * .42}Q${x + w * .06} ${base - h * .86} ${x + w / 2} ${base - h}Q${x + w * .94} ${base - h * .86} ${x + w} ${base - h * .42}V${base}Z M${x + w / 2 - 2} ${base - h}h4v${-h * .1}h-4z`;
  const dome = (x, base, w, h) => `M${x} ${base}V${base - h * .55}A${w / 2} ${w * .55} 0 0 1 ${x + w} ${base - h * .55}V${base}Z M${x + w / 2 - 1.5} ${base - h * .55 - w * .55}v${-h * .16}h3v${h * .16}z`;
  const chhatri = (x, base, w) => `M${x} ${base}v${-w * .7}h${w}v${w * .7}z M${x - 3} ${base - w * .7}A${w / 2 + 3} ${w * .45} 0 0 1 ${x + w + 3} ${base - w * .7}z`;
  const wall = (x, base, w, h, step = 14) => { let d = `M${x} ${base}V${base - h}`; for (let i = x; i < x + w; i += step) d += `H${i + step / 2}v-5h${step / 2}v5`; return d + `H${x + w}V${base}Z`; };
  const tree = (x, base, r) => `M${x - 1.5} ${base}v${-r}h3v${r}z M${x} ${base - r * 2.6}m${-r} 0a${r} ${r * 1.1} 0 1 0 ${r * 2} 0a${r} ${r * 1.1} 0 1 0 ${-r * 2} 0`;
  const diya = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="8" cy="-6" fill="#FFD27A" opacity=".18"/><path d="M-6 0h12c-1 3-3.2 4-6 4s-5-1-6-4z" fill="#5C2E24"/><path d="M0-9c2.2 2.6 2.4 4.6 0 7-2.4-2.4-2.2-4.4 0-7z" fill="#F6B640"/></g>`;

  const env = {
    "ayodhya-dawn": () => {
      let far = "", near = "";
      [[860, 40, 70], [930, 26, 60], [1000, 54, 88], [1440, 50, 80], [1520, 36, 66]].forEach(([x, w, h]) => far += `<path d="${shikhara(x, 318, w, h)}"/>`);
      far += `<path d="${wall(820, 318, 780, 26)}"/>`;
      near += `<path d="${wall(1000, 336, 470, 40, 16)}"/>`;
      near += `<path d="${shikhara(1192, 300, 76, 168)}"/>`; // central temple: focal point / future hero-art safe zone
      near += `<path d="${dome(1090, 300, 70, 92)}"/><path d="${dome(1300, 300, 70, 92)}"/>`;
      near += `<path d="${chhatri(1040, 296, 26)}"/><path d="${chhatri(1404, 296, 26)}"/><path d="${chhatri(1160, 300, 16)}"/><path d="${chhatri(1284, 300, 16)}"/>`;
      near += `<rect x="1000" y="296" width="470" height="6"/>`;
      let diyas = ""; for (let i = 0; i < 16; i++) diyas += diya(1010 + i * 30, 347, 1.15);
      let trees = ""; [[700, 6], [722, 8], [748, 7], [772, 9], [800, 6]].forEach(([x, r]) => trees += `<path d="${tree(x, 322, r)}"/>`);
      let rays = ""; for (let i = 0; i < 9; i++) { const a = (-160 + i * 17) * Math.PI / 180; rays += `<path d="M1230 214 L${1230 + Math.cos(a - .045) * 700} ${214 + Math.sin(a - .045) * 700} L${1230 + Math.cos(a + .045) * 700} ${214 + Math.sin(a + .045) * 700}Z"/>`; }
      return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
        <defs><linearGradient id="ay-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8EAD1"/><stop offset=".6" stop-color="#F5D3A0"/><stop offset="1" stop-color="#EEB77E"/></linearGradient>
        <radialGradient id="ay-sun"><stop offset="0" stop-color="#FFF7E0"/><stop offset=".3" stop-color="#FDE3A8"/><stop offset="1" stop-color="#FDE3A8" stop-opacity="0"/></radialGradient>
        <linearGradient id="ay-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D2A2"/><stop offset="1" stop-color="#E7B57C"/></linearGradient></defs>
        <rect width="1600" height="400" fill="url(#ay-sky)"/>
        <g fill="#FFF4D8" opacity=".22">${rays}</g>
        <circle cx="1230" cy="214" r="230" fill="url(#ay-sun)"/><circle cx="1230" cy="214" r="44" fill="#FFF4D6"/>
        <path d="M0 300C210 262 380 284 560 266S900 268 1080 252s340 8 520-8V400H0z" fill="#E8B88A" opacity=".75"/>
        <g fill="#B97A5C" opacity=".45">${trees}</g>
        <g fill="#B97659" opacity=".55">${far}</g>
        <g fill="#7A3A2C" opacity=".9">${near}</g>
        <path d="M1229 132v-34" stroke="#5E1622" stroke-width="2"/><path d="M1230 99l22 6-22 7z" fill="#E8862A"/>
        <rect y="336" width="1600" height="64" fill="url(#ay-water)"/>
        <path d="M960 336h560v8H960z" fill="#5C2E24" opacity=".85"/>
        <g stroke="#FFF1D2" stroke-width="2" opacity=".55" stroke-linecap="round"><path d="M1040 366h60M1150 378h90M1290 366h50M1380 382h70M1110 392h40"/></g>
        ${diyas}
      </svg>`;
    },
    "lanka-strip": () => `<svg viewBox="0 0 900 64" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
        <defs><linearGradient id="lk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E1622"/><stop offset=".65" stop-color="#A2432A"/><stop offset="1" stop-color="#E8862A"/></linearGradient></defs>
        <rect width="900" height="64" fill="url(#lk-sky)"/>
        <circle cx="610" cy="50" r="40" fill="#F7C873" opacity=".35"/>
        <rect y="48" width="900" height="16" fill="#1E3A5F"/>
        <path d="M120 56h40M300 58h60M480 55h30" stroke="#F7EDCC" stroke-width="1.5" opacity=".4"/>
        <path d="M760 64V40l10-4 4-14 3 14 8-2 3-12 3 12 9 3 5-16 4 16 10 6 7-8 3 8 14 4 V64z" fill="#2A1212"/>
        <path d="M40 54C220 4 520 -2 742 28" stroke="#F7EDCC" stroke-width="1.6" stroke-dasharray="2 7" fill="none" stroke-linecap="round" opacity=".85"/>
        <circle cx="742" cy="28" r="3" fill="#FCE9A8"/>
      </svg>`,
    "setu-shore": () => {
      let stones = ""; for (let i = 0; i < 26; i++) { const x = 980 + i * 18, y = 318 - Math.sin(i / 25 * Math.PI) * 10 - i * .6; stones += `<rect x="${x}" y="${y}" width="14" height="9" rx="3.5"/>`; }
      return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
        <defs><linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4ECF1"/><stop offset=".7" stop-color="#F6E6C8"/><stop offset="1" stop-color="#F3D7A8"/></linearGradient>
        <linearGradient id="st-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FAEC4"/><stop offset="1" stop-color="#1E3A5F"/></linearGradient></defs>
        <rect width="1600" height="400" fill="url(#st-sky)"/>
        <circle cx="1450" cy="250" r="120" fill="#FFF3D3" opacity=".6"/>
        <path d="M1480 300l14-30 8 10 10-34 9 22 12-12 8 20 20 6 39 18z" fill="#6B4A52" opacity=".55"/>
        <rect y="300" width="1600" height="100" fill="url(#st-sea)"/>
        <g stroke="#F7EDCC" stroke-width="2" opacity=".35" stroke-linecap="round"><path d="M1060 344h70M1220 360h110M1400 336h60M1150 384h80"/></g>
        <path d="M760 400V250c30-30 60-62 98-70 30-6 46 22 70 30 24 8 52 6 72 24 18 16 22 40 32 66v100z" fill="#4E3A2A"/>
        <path d="M820 240c14-12 30-20 46-18M900 214c18 2 30 12 44 20" stroke="#2F5D3A" stroke-width="10" stroke-linecap="round" opacity=".8"/>
        <g fill="#2F5D3A" opacity=".9"><path d="${tree(800, 236, 9)}"/><path d="${tree(836, 214, 11)}"/><path d="${tree(874, 196, 8)}"/><path d="${tree(940, 214, 10)}"/></g>
        <g fill="#C9A97E" stroke="#7A5A36" stroke-width="1.2">${stones}</g>
        <path d="M1016 286v-26M1036 280v-30" stroke="#5E1622" stroke-width="2"/><path d="M1017 261l14 4-14 4zM1037 251l14 4-14 4z" fill="#E8862A"/>
      </svg>`;
    },
    "jambavan-dusk": () => `<svg viewBox="0 0 1200 200" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
        <defs><linearGradient id="jd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E3A5F"/><stop offset=".7" stop-color="#7A5A6A"/><stop offset="1" stop-color="#E9A86A"/></linearGradient></defs>
        <rect width="1200" height="200" fill="url(#jd)"/>
        <path d="M1010 46a26 26 0 1 0 22 40 22 22 0 1 1-22-40z" fill="#F7EDCC"/>
        <g fill="#F7EDCC" opacity=".7"><circle cx="860" cy="40" r="1.4"/><circle cx="930" cy="70" r="1.1"/><circle cx="1100" cy="34" r="1.3"/><circle cx="780" cy="64" r="1"/></g>
        <path d="M640 200c40-50 90-70 150-78 60-8 110 14 160 4 60-12 110-30 250-20v94z" fill="#2B2230"/>
        <path d="M900 200v-46c0-22 24-40 52-40s52 18 52 40v46z" fill="#1C1512"/>
        <g fill="#1F2A22">${[[700, 14], [740, 18], [784, 12], [1080, 16], [1120, 20], [1160, 14]].map(([x, r]) => `<path d="${tree(x, 200, r)}"/>`).join("")}</g>
      </svg>`,
  };
  // round 4: My Day band — forest hermitage (parnakuti) at sunrise, one diya on the step, a bow resting against the post. No figures.
  env["vanvas-ashram"] = () => {
    let trees = ""; [[760, 12], [800, 16], [846, 11], [1330, 15], [1372, 19], [1420, 13], [1466, 17], [1512, 12], [1560, 16]].forEach(([x, r]) => trees += `<path d="${tree(x, 300, r)}"/>`);
    let far = ""; [[700, 9], [900, 10], [960, 8], [1250, 9], [1290, 11]].forEach(([x, r]) => far += `<path d="${tree(x, 286, r)}"/>`);
    return `<svg viewBox="0 0 1600 400" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="va-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EEDD"/><stop offset=".55" stop-color="#F6DDB0"/><stop offset="1" stop-color="#EDC48C"/></linearGradient>
      <radialGradient id="va-sun"><stop offset="0" stop-color="#FFF6DC"/><stop offset=".35" stop-color="#FCE2A6"/><stop offset="1" stop-color="#FCE2A6" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="400" fill="url(#va-sky)"/>
      <circle cx="1180" cy="250" r="210" fill="url(#va-sun)"/><circle cx="1180" cy="262" r="38" fill="#FFF3D3"/>
      <path d="M0 290C240 250 420 268 640 258s420-26 620-8 260 18 340 6V400H0z" fill="#C9A26E" opacity=".55"/>
      <g fill="#7E8A5E" opacity=".55">${far}</g>
      <g fill="#3F5A3A" opacity=".9">${trees}</g>
      <path d="M1040 300l70-52 70 52z" fill="#7A4A2C"/><path d="M1052 300v-6h116v6z" fill="#5C3A22"/>
      <path d="M1058 300v46h104v-46" fill="#9A6A42"/><path d="M1096 346v-30h28v30z" fill="#3A2416"/>
      <path d="M1040 300l70-52 70 52" stroke="#5C3A22" stroke-width="4" fill="none"/>
      <path d="M1178 346c10-26 10-52 0-78" stroke="#5E1622" stroke-width="3" fill="none"/><path d="M1178 268v78" stroke="#5E1622" stroke-width="1.2"/>
      <rect x="1040" y="346" width="140" height="8" fill="#6B4A32"/>
      ${diya(1074, 346, 1.2)}
      <path d="M0 400C300 360 620 372 860 380s300-30 420-36 220 10 320 4V400z" fill="#B88C5A" opacity=".7"/>
      <path d="M1110 400c-30-16-60-20-110-24" stroke="#F7EDCC" stroke-width="3" stroke-dasharray="3 9" fill="none" opacity=".7" stroke-linecap="round"/>
    </svg>`;
  };
  document.querySelectorAll("[data-env]").forEach(el => { el.innerHTML = env[el.dataset.env](); });

  // ---- Ram Setu progress (proposal §10): 20 stones, stages at 20/40/60/80, complete at 100 ----
  // round 2: 0% reads "Ready for the first stone" (proposal §10); data-from highlights the stones a completion just placed.
  const stageOf = v => v >= 100 ? { n: 6, label: "Ram Setu complete" } : v <= 0 ? { n: 1, label: "Ready for the first stone" } : [
    { n: 1, label: "First stones placed" }, { n: 2, label: "The Setu takes shape" }, { n: 3, label: "Halfway across the ocean" },
    { n: 4, label: "Approaching Lanka" }, { n: 5, label: "Reaching the far shore" }][Math.min(4, Math.floor(Math.max(0, v) / 20))];
  // round 3 (review M4): stones agree with the stage labels — ≥1 stone above 0%, the 20th only at exactly 100%.
  const setuStones = pct => { const p = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0; return p === 0 ? 0 : p === 100 ? 20 : Math.min(19, Math.max(1, Math.round(p / 5))); };
  window.setuStones = setuStones;
  window.setuSvg = (v, from = v, size = "md") => {
    const placed = setuStones(v); const before = setuStones(from); const done = v >= 100; let s = "";
    for (let i = 0; i < 20; i++) {
      const t = i / 19, x = 46 + t * 228, y = 41 - Math.sin(t * Math.PI) * 7;
      const fresh = i >= before && i < placed;
      s += i < placed ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="10.5" height="8" rx="3" fill="${fresh ? "#E9C97E" : "#C9A97E"}" stroke="${fresh ? "#A88414" : "#7A5A36"}" stroke-width="${fresh ? 1.3 : .9}"/><path d="M${(x + 2).toFixed(1)} ${(y + 1.6).toFixed(1)}h6.5" stroke="#F7EDCC" stroke-width="1" stroke-linecap="round"/>`
        : `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="10.5" height="8" rx="3" fill="none" stroke="#8A8378" stroke-width=".9" stroke-dasharray="2 2" opacity=".7"/>`;
    }
    return `<svg class="setu" viewBox="0 0 320 72" preserveAspectRatio="${size === "sm" ? "xMinYMid meet" : "xMidYMid meet"}" aria-hidden="true" focusable="false">
      <rect y="44" width="320" height="28" fill="#E1E9F2"/><path d="M60 58h22M130 64h30M200 57h18M248 65h24" stroke="#1E3A5F" stroke-width="1.2" opacity=".3" stroke-linecap="round"/>
      <path d="M0 72V34q16-9 32-5l12 13v30z" fill="#4E3A2A"/><circle cx="12" cy="24" r="6" fill="#2F5D3A"/><circle cx="24" cy="21" r="7" fill="#2F5D3A"/>
      <path d="M320 72V30h-6l-2-12-3 12h-5l-2-8-2 8h-6q-8 4-16 14v28z" fill="${done ? "#7A1E2C" : "#5E1622"}"/>
      ${done ? `<path d="M44 42Q160 24 278 42" stroke="#C9A227" stroke-width="2.5" fill="none" opacity=".9"/><circle cx="298" cy="24" r="10" fill="#F7C873" opacity=".45"/><path d="M298 15c2.4 2.8 2.6 5 0 7.6-2.6-2.6-2.4-4.8 0-7.6z" fill="#E8862A"/>` : ""}
      ${s}
    </svg>`;
  };
  document.querySelectorAll("[data-setu]").forEach(el => {
    const v = Number(el.dataset.setu); const from = el.dataset.from ? Number(el.dataset.from) : v; const st = stageOf(v); const name = el.dataset.name || "Journey";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", `${name}: ${v}% complete, ${setuStones(v)} of 20 Setu stones placed. ${st.label}.`);
    const value = from !== v ? `${from}% → ${v}%` : `${v}%`;
    el.innerHTML = window.setuSvg(v, from, el.dataset.size || "md") + (el.dataset.compact ? "" : `<div class="setu-row"><strong>${value}</strong><span>${st.label}</span></div>`);
  });

  // ---- ChainSetu (proposal §10.3, round 4): one stone per task in dependency order ----
  // data-chain: d = done (placed), b = bottleneck that is Blocked, n = bottleneck not blocked, w = waiting. data-focus = this card's task.
  window.chainSvg = (states, focus = -1) => {
    const n = states.length, gap = 34, W = 56 + (n - 1) * gap + 40, H = 46; let g = "";
    states.forEach((st, i) => {
      const x = 34 + i * gap, y = 22 - Math.sin(((i + .5) / n) * Math.PI) * 5;
      if (st === "d") g += `<rect x="${x}" y="${y.toFixed(1)}" width="22" height="13" rx="4.5" fill="#C9A97E" stroke="#7A5A36" stroke-width="1.1"/><path d="M${x + 4} ${(y + 3).toFixed(1)}h13" stroke="#F7EDCC" stroke-width="1.3" stroke-linecap="round"/>`;
      else if (st === "b" || st === "n") g += `<rect x="${x - 3}" y="${(y - 3).toFixed(1)}" width="28" height="19" rx="7" fill="none" stroke="#A88414" stroke-width="1.6" stroke-dasharray="3 2.5"/><rect x="${x}" y="${y.toFixed(1)}" width="22" height="13" rx="4.5" fill="#FFFFFF" stroke="${st === "b" ? "#A8261B" : "#5A3F2E"}" stroke-width="1.8"/>`;
      else g += `<rect x="${x}" y="${y.toFixed(1)}" width="22" height="13" rx="4.5" fill="none" stroke="#8A8378" stroke-width="1.1" stroke-dasharray="2.5 2.5"/>`;
      if (i === focus) g += `<path d="M${x + 11} ${(y - 2).toFixed(1)}v-12" stroke="#7A1E2C" stroke-width="1.4"/><path d="M${x + 11} ${(y - 14).toFixed(1)}l8 2.5-8 2.5z" fill="#7A1E2C"/>`;
    });
    return `<svg class="chain-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">
      <rect y="32" width="${W}" height="14" fill="#E1E9F2"/>
      <path d="M0 46V24q10-6 20-3l8 8v17z" fill="#4E3A2A"/><circle cx="9" cy="18" r="5" fill="#2F5D3A"/>
      <path d="M${W} 46V22h-5l-2-9-2 9h-4l-2-6-2 6h-4q-6 3-10 10v14z" fill="#5E1622"/>
      ${g}</svg>`;
  };
  document.querySelectorAll("[data-chain]").forEach(el => {
    el.setAttribute("role", "img");
    el.innerHTML = window.chainSvg(el.dataset.chain.split(","), el.dataset.focus ? Number(el.dataset.focus) : -1);
  });
})();
