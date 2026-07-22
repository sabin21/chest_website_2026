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
   .donation-redball-wrap 핀
---------------------------------------- */

ScrollTrigger.create({
  trigger: ".container-root",
  start: "top top",
  end: "bottom bottom",
  pin: ".donation-redball-wrap",
  pinSpacing: false,
});

gsap.from(".donation-redball-wrap", {
  x: -window.innerWidth,
  duration: 1.2,
  ease: "power3.out",
});

gsap.to(".redball-inner", {
  y: -10,
  duration: 1,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

/* --------------------------------------
donation hero image motion
----------------------------------------*/

const coverWrap = document.querySelector(".donation-hero-pict-wrap");
const cover = document.querySelector(".donation-cover");
const coverImage = document.querySelector(".donation-cover .cover-image");
const coverCopy = document.querySelector(".donation-cover .intro-copy");
const coverVideoWrap = cover?.querySelector(".donation-intro-video-wrap");
const isVideoCover = !!coverVideoWrap;

/* cover 박스 확대 모션은 이미지/비디오 버전 공통 */
gsap.to(cover, {
  width: "calc(100vw - 48px)",
  height: "calc(100vh - 48px)",
  left: 24,
  top: 24,
  borderRadius: "24px",
  ease: "none",
  scrollTrigger: {
    trigger: ".container-root",
    start: "+=100",
    end: "+=200",
    scrub: 1,
    invalidateOnRefresh: true,
  },
});

/* 이미지 blur + coverCopy 등장 모션은 이미지/비디오 버전 공통 */
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".container-root",
      start: "+=200",
      end: "+=300",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  })
  .to(coverImage, { filter: "blur(15px)", opacity: 0.5, ease: "none" }, 0)
  .to(coverCopy, { opacity: 1, top: "calc(50% - 150px)", ease: "none" }, 0);

if (isVideoCover) {
  /* 비디오 버전 — 위 모션이 끝난 뒤 coverImage/coverCopy를 사라지게 해서 비디오를 드러냄
     (타임라인 하나에 scrollTrigger 하나만 붙여서 테스트) */
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".container-root",
        start: "+=800",
        end: "+=1000",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
    .to(coverImage, { opacity: 0, ease: "none" }, 0)
    .to(coverCopy, { opacity: 0, ease: "none" }, 0);
}

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
    spaceBetween: 24,
    loop: false,
    // autoplay     : {
    //   delay: 2000,
    // },
  });
});
