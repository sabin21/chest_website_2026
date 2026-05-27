const MOBILE_BREAKPOINT = 1024;

function initLenis() {
  if (window.innerWidth < MOBILE_BREAKPOINT) return;

  const lenis = new Lenis({
    wrapper: document.querySelector('.app-root'),
    content: document.querySelector('.app-main'),
  });

  // 전역 노출 — GSAP ScrollTrigger 등 다른 스크립트에서 참조
  window.__lenis = lenis;

  if (window.gsap) {
    // GSAP ticker가 Lenis를 구동 (ScrollTrigger 공식 권장 방식)
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    // GSAP 없는 페이지는 기존 RAF 방식 유지
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

initLenis();
