async function initAppHeader() {
  const el = document.getElementById('app-header');
  if (!el) return;

  const [htmlRes, menuRes] = await Promise.all([
    fetch('components/app-header.html'),
    fetch('components/gnb-menu.json'),
  ]);
  if (!htmlRes.ok) return;

  const doc = new DOMParser().parseFromString(await htmlRes.text(), 'text/html');
  el.innerHTML = doc.body.innerHTML;

  if (menuRes.ok) {
    const menuData = await menuRes.json();
    applyGnbMenu(el, menuData);
  }

  el.querySelector('.btn-gnb-burger')?.addEventListener('click', function () {
    this.classList.toggle('active');
  });

  initHeaderDropdown(el, '.lang-wrap',   '.lang',   '.lang-popover');
  initHeaderDropdown(el, '.branch-wrap', '.branch', '.branch-popover');

  document.addEventListener('click', () => {
    el.querySelectorAll('.dropdown-wrap.open').forEach(d => d.classList.remove('open'));
  });
}

function applyGnbMenu(el, menuData) {
  const menuWraps = el.querySelectorAll('.gnb-menu-item-wrap');
  menuWraps.forEach((wrap, i) => {
    const menu = menuData[i];
    if (!menu) return;

    const subItemWrap = wrap.querySelector('.gnb-submenu-item-wrap');
    if (!subItemWrap) return;

    subItemWrap.innerHTML = menu.children
      .map(({ label, href }) => `
        <a href="${href}" class="gnb-submenu-item">
          <span class="gnb-submenu-text">${label}</span>
          <span class="gnb-submenu-icon"></span>
        </a>`)
      .join('');
  });
}

function initHeaderDropdown(root, wrapSel, btnSel, popoverSel) {
  const wrap    = root.querySelector(wrapSel);
  if (!wrap) return;
  const btn     = wrap.querySelector(btnSel);
  if (!btn) return;
  const text    = btn.querySelector('.text');
  const popover = wrap.querySelector(popoverSel);
  if (!popover) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains('open');
    root.querySelectorAll('.dropdown-wrap.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) wrap.classList.add('open');
  });

  popover.addEventListener('click', (e) => {
    const item = e.target.closest('li[data-value]');
    if (!item) return;
    if (text) text.textContent = item.dataset.value;
    wrap.classList.remove('open');
  });
}

initAppHeader();
