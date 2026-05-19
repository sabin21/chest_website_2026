const MOBILE_BREAKPOINT = 1024;

function initLenis() {
  if (window.innerWidth < MOBILE_BREAKPOINT) return;

  const lenis = new Lenis({
    wrapper: document.querySelector('.app-root'),
    content: document.querySelector('.app-main'),
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

initLenis();
