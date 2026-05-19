async function initAppHeader() {
  const el = document.getElementById('app-header');
  if (!el) return;

  const res = await fetch('components/app-header.html');
  if (!res.ok) return;

  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  el.innerHTML = doc.body.innerHTML;

  el.querySelector('.btn-gnb-burger')?.addEventListener('click', function () {
    this.classList.toggle('active');
  });

  initHeaderDropdown(el, '.lang-wrap',   '.lang',   '.lang-popover');
  initHeaderDropdown(el, '.branch-wrap', '.branch', '.branch-popover');

  document.addEventListener('click', () => {
    el.querySelectorAll('.dropdown-wrap.open').forEach(d => d.classList.remove('open'));
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
