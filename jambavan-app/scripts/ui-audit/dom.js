() => {
  const visible = el => {
    const box = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    if (!box.width || !box.height || box.right <= 0 || css.visibility === 'hidden' || css.display === 'none' || el.closest('.sr-only,[aria-hidden="true"],#codex-browser-sidebar-comments-root')) return false;
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open && !parent.querySelector(':scope > summary')?.contains(el)) return false;
    }
    return true;
  };
  const walker = document.createTreeWalker(document.body, 4);
  const text = [];
  while (walker.nextNode()) {
    const node = walker.currentNode, el = node.parentElement;
    if (!el || !node.textContent.trim() || !visible(el) || el.closest('script,style')) continue;
    text.push({text:node.textContent.trim().slice(0,90),size:parseFloat(getComputedStyle(el).fontSize),class:typeof el.className==='string'?el.className:el.tagName});
  }
  const buttons = [...document.querySelectorAll('button,summary')].filter(visible).map(el=>({name:el.getAttribute('aria-label')||el.textContent.trim().slice(0,80),height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width}));
  const task=document.querySelector('.task-card');
  const control=document.querySelector('input:not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea');
  return {
    title:document.querySelector('h1')?.textContent,
    width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,
    bodyFont:getComputedStyle(document.body).fontFamily,
    minTextSize:text.length?Math.min(...text.map(n=>n.size)):null,
    smallText:text.filter(n=>n.size<13),
    shortButtons:buttons.filter(b=>b.height<43.9),
    firstTaskTop:task?Math.round(task.getBoundingClientRect().top+scrollY):null,
    firstTaskHeight:task?Math.round(task.getBoundingClientRect().height):null,
    firstInputFont:control?getComputedStyle(control).fontSize:null,
    brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),
    openTaskDetails:document.querySelectorAll('.task-details[open]').length,
    openBlockers:document.querySelectorAll('.blocker-checkin[open]').length,
    displayFont:getComputedStyle(document.querySelector('h1')).fontFamily,
    image:document.querySelector('.page-artwork')?.getAttribute('src'),
    artworkWidth:document.querySelector('.page-artwork')?.getBoundingClientRect().width,
  };
}
