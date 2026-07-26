gsap.registerPlugin(ScrollTrigger);

const scroller = document.querySelector(".app-root");
const lenis = window.__lenis;

/* ----------------------------------------
   Lenis → ScrollTrigger 동기화
   scroller가 window가 아닌 .app-root이므로
   scrollerProxy로 스크롤 위치를 명시적으로 연결
---------------------------------------- */

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scroller, {
    scrollTop(value) {
      if (arguments.length) lenis.scrollTo(value, { immediate: true });
      return lenis.animatedScroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
}

ScrollTrigger.defaults({ scroller });


/* ----------------------------------------
   .donation-redball-wrap 고정
---------------------------------------- */

if (window.innerWidth > 1024) {
  gsap.from(".donation-redball-wrap", {
    x: -window.innerWidth,
    duration: 1.2,
    ease: "power3.out",
  });
}

gsap.to(".redball-inner", {
  y: -10,
  duration: 1,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

/* --- .donation-redball-wrap이 footer를 침범하지 않도록 회피 --- */
const redballEl = document.querySelector(".donation-redball-wrap");
const redballFooterEl = document.querySelector(".app-footer");

if (redballEl && redballFooterEl) {
  const REDBALL_FOOTER_GAP = 40;
  let redballShiftY = 0;

  function checkRedballFooter() {
    const footerTop = redballFooterEl.getBoundingClientRect().top;
    // getBoundingClientRect()는 이전에 적용한 이동값이 반영된 상태이므로,
    // 되돌려서 원래(이동 전) 위치 기준으로 다시 계산한다.
    const naturalBottom = redballEl.getBoundingClientRect().bottom - redballShiftY;
    const overlap = naturalBottom + REDBALL_FOOTER_GAP - footerTop;
    redballShiftY = overlap > 0 ? -overlap : 0;
    gsap.set(redballEl, { y: redballShiftY });
  }

  if (window.__lenis) {
    window.__lenis.on("scroll", checkRedballFooter);
  } else {
    const wrapper = document.querySelector(".app-root") || window;
    wrapper.addEventListener("scroll", checkRedballFooter);
  }
  ScrollTrigger.addEventListener("refresh", checkRedballFooter);
  checkRedballFooter();
}

/* --------------------------------------
donation hero image motion
----------------------------------------*/

const coverWrap = document.querySelector(".donation-hero-pict-wrap");
const cover = document.querySelector(".donation-cover");
const coverImage = document.querySelector(".donation-cover .cover-image");
const coverCopy = document.querySelector(".donation-cover .intro-copy");

const coverMotionMM = gsap.matchMedia();

coverMotionMM.add(
  {
    isMobileSmall: "(max-width: 640px)",
    isDefault: "(min-width: 641px)",
  },
  (context) => {
    const { isMobileSmall } = context.conditions;

    gsap.to(cover, {
      width: isMobileSmall ? "calc(100vw - 24px)" : "calc(100vw - 48px)",
      height: isMobileSmall ? "calc(100vh - 76px)" : "calc(100vh - 48px)",
      left: isMobileSmall ? 12 : 24,
      top: isMobileSmall ? 12 : 24,
      borderRadius: "24px",
      ease: "none",
      scrollTrigger: {
        trigger: ".container-root",
        start: "+=200",
        end: "+=250",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".container-root",
          start: "+=250",
          end: "+=400",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      .to(coverImage, { filter: "blur(15px)", opacity: 0.6, ease: "none" }, 0.25)
      .to(
        coverCopy,
        {
          opacity: 1,
          top: isMobileSmall ? "calc(50% - 100px)" : "calc(50% - 170px)",
          ease: "none",
        },
        0,
      );
  },
);

ScrollTrigger.create({
  trigger: coverWrap,
  start: "top top",
  endTrigger: ".donation-hero-wrap",
  end: "bottom bottom",
  pin: coverWrap,
});

/* ---------------------------------------- */

const pict1 = document.querySelector(".pict-1");
const pict2 = document.querySelector(".pict-2");

gsap.fromTo(
  pict1,
  { scale: 0.95 },
  { scale: 1, duration: 1, ease: "sine.inOut", repeat: -1, yoyo: true },
);
gsap.fromTo(
  pict2,
  { scale: 1 },
  { scale: 0.95, duration: 1, ease: "sine.inOut", repeat: -1, yoyo: true },
);

const tlPict = gsap.timeline({
  scrollTrigger: {
    trigger: ".container-root",
    start: "+=100",
    end: "+=200",
    scrub: 1,
    // pinSpacing:false
  },
});

tlPict
  .to(pict1, { scale: 0, opacity:0, ease: "power3.in" }, 0)
  .to(pict2, { scale: 0, opacity:0, ease: "power3.in" }, 0);


gsap.to(".app-main", {
  backgroundColor: "#E2E8F2",
  ease: "none",
  scrollTrigger: {
    trigger: ".scene-last",
    start: "top 50%",
    end: "+=200",
    scrub: 1,
  },
});

/* ----------------------------------------*/

document.querySelectorAll(".don-intro-section-content").forEach((section) => {
  const el = section.querySelector(".carousel-card-row");
  if (!el) return;

  new Swiper(el, {
    slidesPerView: "auto",
    freeMode: true,
    grabCursor: true,
    navigation: {
      nextEl: section.querySelector(".nav-next"),
      prevEl: section.querySelector(".nav-prev"),
    },
    pagination: {
      el: section.querySelector(".swiper-pagination"),
      clickable: true,
    },
    spaceBetween: 12,
    breakpoints: {
      640: { spaceBetween: 16 },
      1024: { spaceBetween: 24 },
    },
    loop: false,
  });
});

/* ----------------------------------------
   기부상담신청 모달 오픈
---------------------------------------- */

document.querySelectorAll("#btn-request-consultation, #btn-request-consultation-redball").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("modal-request-consultation")?.classList.add("is-open");
  });
});

document.getElementById("btn-workshop-receipt")?.addEventListener("click", () => {
  document.getElementById("modal-workshop-receipt")?.classList.add("is-open");
});
