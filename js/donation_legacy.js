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
   #app-header / #app-breadcrumb 는 fetch로 비동기 로드되어
   ScrollTrigger 최초 계산 이후 레이아웃 높이가 바뀔 수 있음
   (특히 #app-breadcrumb 는 일반 흐름 요소라 아래 컨텐츠를 밀어내림)
   → 로드 완료 시점에 한 번 더 refresh 해서 위치 오차를 보정
---------------------------------------- */

(() => {
  const breadcrumbEl = document.getElementById("app-breadcrumb");
  if (!breadcrumbEl) return;

  const mo = new MutationObserver(() => {
    ScrollTrigger.refresh();
    mo.disconnect();
  });
  mo.observe(breadcrumbEl, { childList: true });
})();

/* ----------------------------------------
   기부상담신청 모달 오픈
---------------------------------------- */

document.querySelectorAll("#btn-request-consultation, #btn-request-consultation-redball").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("modal-request-consultation")?.classList.add("is-open");
  });
});

/* ----------------------------------------
   .honor-back-wrap 스크롤 배경 연출
   section-1 / section-2 / section-3 이 트리거될 때마다
   - .honor-back-wrap 의 배경색
   - .back-shape-1 / 2 / 3 의 path fill / position / scale
   을 scrub 으로 부드럽게 전환
---------------------------------------- */

(() => {
  const backWrap = document.querySelector(".honor-back-wrap");
  if (!backWrap) return;

  /*
    섹션별 목표 상태 (값만 수정하면 됨)
    - back  : .honor-back-wrap 배경색
    - shapes[selector]
        fill  : path fill 색상
        x, y  : 기준 위치에서의 이동량(px)
        scale : 확대/축소 배율
  */
  const scenes = [
    {
      trigger: ".section-honor.section-1",
      back: "#481C33",
      shapes: {
        ".back-shape-1": { fill: "#741935", x: 0, y: 0, scale: 1 },
        ".back-shape-2": { fill: "#6A3042", x: 0, y: 0, scale: 1 },
        ".back-shape-3": { fill: "#481645", x: 0, y: 0, scale: 1 },
      },
    },
    {
      trigger: ".section-honor.section-2",
      back: "#0b1226",
      shapes: {
        ".back-shape-1": { fill: "#123a4a", x: -120, y: 80, scale: 1.2 },
        ".back-shape-2": { fill: "#1d4b8f", x: 120, y: 60, scale: 1.15 },
        ".back-shape-3": { fill: "#0a2a3a", x: -60, y: -80, scale: 0.9 },
      },
    },
    {
      trigger: ".section-honor.section-3",
      back: "#0F1D1C",
      shapes: {
        ".back-shape-1": { fill: "#1E2F24", x: 60, y: -60, scale: 0.85 },
        ".back-shape-2": { fill: "#1E3827", x: -100, y: -40, scale: 1.3 },
        ".back-shape-3": { fill: "#1E2F24", x: 80, y: 100, scale: 1.1 },
      },
    },
    {
      trigger: ".section-honor.section-5",
      back: "#0b1226",
      shapes: {
        ".back-shape-1": { fill: "#123a4a", x: 60, y: -60, scale: 0.85 },
        ".back-shape-2": { fill: "#1d4b8f", x: -100, y: -40, scale: 1.3 },
        ".back-shape-3": { fill: "#0a2a3a", x: 80, y: 100, scale: 1.1 },
      },
    },
  ];

  // 선택자 → { svg, path } 캐시
  const shapeEls = {};
  Object.keys(scenes[0].shapes).forEach((sel) => {
    const svg = backWrap.querySelector(sel);
    if (svg) shapeEls[sel] = { svg, path: svg.querySelector("path") };
  });

  // 한 씬의 목표 상태를 tween 대상 배열로 변환
  const applyScene = (scene, method, tl) => {
    // method: "set" | "to"
    const add = (target, vars) => {
      if (method === "set") gsap.set(target, vars);
      else tl.to(target, { ...vars, ease: "none", immediateRender: false }, 0);
    };

    add(backWrap, { backgroundColor: scene.back });

    Object.entries(scene.shapes).forEach(([sel, s]) => {
      const el = shapeEls[sel];
      if (!el) return;
      if (el.path && s.fill) add(el.path, { fill: s.fill });
      add(el.svg, { x: s.x, y: s.y, scale: s.scale, transformOrigin: "center center" });
    });
  };

  // 초기 상태 고정
  applyScene(scenes[0], "set");

  // 이후 섹션들: 화면에 들어오는 구간 동안 목표 상태로 scrub 전환
  scenes.slice(1).forEach((scene) => {
    const trigger = document.querySelector(scene.trigger);
    if (!trigger) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: "top bottom",
        end: "top center",
        scrub: true,
      },
    });

    applyScene(scene, "to", tl);
  });

  ScrollTrigger.refresh();
})();

/* ----------------------------------------
   .hero-cover-wrap 확대 + blur 연출
   (don_intro_good_family.html 의 .donation-cover 확대 연출과 동일한 구조)

   모바일(≤1024px)에서는 pin+스크롤 연출 자체를 제거하고,
   hero-cover-wrap 을 처음부터 전체화면 크기(완성 상태)로 고정 표시함
---------------------------------------- */

(() => {
  const section2 = document.querySelector(".section-honor.section-2");
  const heroCover = section2?.querySelector(".hero-cover-wrap");
  if (!section2 || !heroCover) return;

  const heroCoverMM = gsap.matchMedia();

  heroCoverMM.add(
    {
      isMobile: "(max-width: 1024px)",
      isDesktop: "(min-width: 1025px)",
    },
    (context) => {
      const { isMobile } = context.conditions;

      if (isMobile) {
        gsap.set(heroCover, { width: "100vw", height: "100vh" });
        gsap.set('.cover-img', { opacity: 0.6, filter: "blur(10px)" });
        gsap.set('.cover-copy', { opacity: 1, y: 0 });
        return;
      }

      ScrollTrigger.create({
        trigger: section2,
        start: "top top",
        end: "+=600",
        pin: true,
        pinType: "transform",
      });

      /*
        타임라인 총 길이(250px 스크롤 구간)를 duration:1 로 두고,
        각 tween 의 4번째 인자(포지션)로 시작 시점을, duration 으로
        진행 구간을 조절. 값만 바꾸면 순서/타이밍을 자유롭게 재배치 가능.
          - width  : 0     ~ 0.6
          - height : 0.1   ~ 0.7  (width 보다 살짝 늦게 시작)
          - filter : 0.4   ~ 1    (확대가 어느 정도 진행된 후 blur 시작)
      */
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section2,
            start: "top top",
            end: "+=250",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(heroCover, { width: "50%" }, { width: "100%", duration: 0.6 }, 0)
        .fromTo(heroCover, { height: "40%" }, { height: "100%", duration: 0.6 }, 0)
        .fromTo('.cover-img', { opacity: 1 }, { opacity: 0.6, duration: 0.6 }, 0)
        .fromTo('.cover-copy', { opacity: 0, y:50 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
        .fromTo('.cover-img', { filter: "blur(0px)" }, { filter: "blur(32px)", duration: 0.6 }, 0.4);
    },
  );
})();
