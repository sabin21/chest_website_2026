async function initAppQuickLink() {
  const el = document.getElementById('app-quick-link');
  if (!el) return;
  const res = await fetch('components/app-quick-link.html');
  if (!res.ok) return;
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  el.innerHTML = doc.body.innerHTML;
  observeFooter(el);
}

function observeFooter(el) {
  const footer = document.getElementById('app-footer');
  if (!footer) return;
  const thresholds = Array.from({ length: 101 }, (_, i) => i / 100);
  new IntersectionObserver((entries) => {
    const { isIntersecting, intersectionRect } = entries[0];
    el.style.bottom = isIntersecting ? `${intersectionRect.height + 32}px` : '';
  }, { threshold: thresholds }).observe(footer);
}

initAppQuickLink();
