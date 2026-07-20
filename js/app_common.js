const MOBILE_BREAKPOINT = 1024;

function initLenis() {
  if (typeof Lenis === "undefined") return; // lenis.min.js 미포함 페이지는 네이티브 스크롤 사용
  if (window.innerWidth < MOBILE_BREAKPOINT) return;

  const lenis = new Lenis({
    wrapper: document.querySelector(".app-root"),
    content: document.querySelector(".app-main"),
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

function initGnbSwipe() {
  const gnbWraps = document.querySelectorAll(".page-head-gnb-wrap");
  if (!gnbWraps.length) return;

  function scrollActiveIntoView() {
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;

    gnbWraps.forEach((wrap) => {
      const activeLink = wrap.querySelector("a.active");
      if (!activeLink) return;

      // scrollIntoView는 상위 스크롤 컨테이너(body 등)까지 움직일 수 있으므로
      // .page-head-gnb-wrap의 scrollLeft만 직접 계산해서 이동시킨다.
      const targetLeft =
        activeLink.offsetLeft -
        wrap.clientWidth / 2 +
        activeLink.offsetWidth / 2;

      wrap.scrollLeft = Math.max(
        0,
        Math.min(targetLeft, wrap.scrollWidth - wrap.clientWidth)
      );
    });
  }

  scrollActiveIntoView();
  window.addEventListener("resize", scrollActiveIntoView);
}

initGnbSwipe();

function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const siblings = item.parentElement.querySelectorAll(
        ":scope > .faq-item.active"
      );
      siblings.forEach((sibling) => {
        if (sibling !== item) sibling.classList.remove("active");
      });

      item.classList.toggle("active");
    });
  });
}

initFaqAccordion();
