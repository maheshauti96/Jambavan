import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import postcss from 'postcss';

// Keep the layouts of the existing workflows while removing their old theme and tiny type.
const source = execFileSync('git', ['show', 'db0af0d:jambavan-app/client/src/index.css'], { encoding: 'utf8' });
const css = postcss.parse(source);
const core = /\.(?:avatar|sidebar|main-nav|brand-lockup|brand-mark|workspace-switcher|nav-label|settings-link|head-card|sidebar-spacer|main-content|topbar|top-actions|crumbs|search-button|mobile-menu|content-wrap|ramayana-ribbon|page-heading|app-footer|footer-dot|toast|task-card|task-list|task-meta-row|task-owner-row|task-card-topline|priority|ack-row|category-pill|kind-pill|team-pill|hanuman-pill|owner-team|owner-name|owner-only|done-stamp|task-progress|assistant-strip|assistant-list|assistant-chip|task-source|attachment-|subtask-|inline-subtask-|blocker-checkin|handover-summary|completion-audit|journal-|hanuman-journal|assignment-notes|dependency-blocked|dependency-downstream|metric-grid|metric-card|metric-icon|filter-row|select-wrap|category-strip|category-tabs|section-header|focus-banner|hanuman-overview|latest-notices)(?:[\s.:>#\[,-]|$)/;
css.walkComments(node => node.remove());
css.walkAtRules(node => { if (['import', 'theme', 'custom-variant', 'layer'].includes(node.name)) node.remove(); });
css.walkRules(rule => {
  if (rule.selector === ':root' || /^(?:html|body|\*|button, input, select|button)$/.test(rule.selector) || core.test(rule.selector)) rule.remove();
});
const aliases = { ink: 'ink', saffron: 'saffron-700', mint: 'forest-700', coral: 'danger-700', parchment: 'cream-100', shadow: 'e1' };
css.walkDecls(decl => {
  decl.value = decl.value.replace(/var\(--(ink|saffron|mint|coral|parchment|shadow)\)/g, (_, key) => `var(--jb-${aliases[key]})`);
  if (decl.prop === 'outline' && ['none', '0'].includes(decl.value)) { decl.remove(); return; }
  if (decl.prop === 'font-size') {
    const pixels = /^([\d.]+)px$/.exec(decl.value);
    if (pixels && Number(pixels[1]) < 13) decl.value = '13px';
  }
  if (decl.prop === 'color' && /^#[0-9a-f]{6}$/i.test(decl.value)) {
    const c = decl.value.slice(1), rgb = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16));
    const selector = decl.parent.selector ?? '';
    const white = rgb.every(v => v > 240);
    decl.value = white ? decl.value : /overdue|danger|suspended|blocked/.test(selector) ? 'var(--jb-danger-700)' : /complete|done|available/.test(selector) ? 'var(--jb-forest-700)' : 'var(--jb-earth-600)';
  }
});
for (let pass = 0; pass < 3; pass++) css.walkAtRules(rule => { if (rule.nodes?.length === 0) rule.remove(); });
fs.mkdirSync('client/src/styles', { recursive: true });
fs.writeFileSync('client/src/styles/sections.css', '/* Existing screen layouts. Shared type, controls and theme live in workspace.css. */\n' + css.toString());
console.log('Generated sections.css from the original screen layouts.');
