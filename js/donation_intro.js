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
}

ScrollTrigger.defaults({ scroller });

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
});

/* ----------------------------------------
   .donation-redball-wrap 핀
   .container-root 가 뷰포트를 통과하는 동안
   .donation-redball-wrap 의 화면 위치 고정
---------------------------------------- */

ScrollTrigger.create({
  trigger: ".container-root",
  start: "top top",
  end: "bottom bottom",
  pin: ".donation-redball-wrap",
  pinSpacing: false,
});

/* ----------------------------------------*/

const coverWrap = document.querySelector(".donation-hero-pict-wrap");
const cover = document.querySelector(".donation-cover");
const coverImage = document.querySelector(".donation-cover .cover-image");
const coverCopy = document.querySelector(".donation-cover .intro-copy");

gsap.to(cover, {
  width: "calc(100vw - 48px)",
  height: "calc(100vh - 48px)",
  left: 24,
  top: 24,
  borderRadius: "24px",
  ease: "none",
  scrollTrigger: {
    trigger: ".donation-hero-wrap",
    start: "+=200",
    end: "+=350",
    scrub: 1,
    invalidateOnRefresh: true,
  },
});

gsap.to(coverImage, {
  filter: "blur(15px)",
  opacity: 0.5,
  ease: "none",
  scrollTrigger: {
    trigger: ".container-root",
    start: "+=350",
    end: "+=400",
    scrub: 1,
    invalidateOnRefresh: true,
  },
});

gsap.to(coverCopy, {
  opacity: 1,
  top: "calc(50% - 150px)",
  ease: "none",
  scrollTrigger: {
    trigger: ".container-root",
    start: "+=350",
    end: "+=400",
    scrub: 1,
    invalidateOnRefresh: true,
  },
});

ScrollTrigger.create({
  trigger: ".donation-hero-wrap",
  start: "top -200",
  end: "bottom bottom",
  pin: coverWrap,
  // pinSpacing: false,
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


/* ----------------------------------------
   .scene-2 가 viewport 중앙에 진입하면
   .app-main 배경을 white로 전환 (+=200 구간에 걸쳐 scrub)
---------------------------------------- */

gsap.to(".app-main", {
  backgroundColor: "#EDE4D6",
  ease: "none",
  scrollTrigger: {
    trigger: ".scene-2",
    start: "bottom bottom",
    end: "+=200",
    scrub: 1,
  },
});

/* ----------------------------------------*/

document.querySelectorAll(".section-content").forEach((section) => {
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
    spaceBetween: 24,
    loop: false,
    // autoplay     : {
    //   delay: 2000,
    // },
  });
});
