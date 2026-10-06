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
   korea-map path ↔ club-item 연동
   - path 클릭 시 해당 path 와 data-region 이 같은 club-item 에 .active
   - 기존 .active 는 모두 제거
---------------------------------------- */

(() => {
  const map = document.querySelector("#korea-map");
  const clubList = document.querySelector(".club-list-wrap");
  if (!map || !clubList) return;

  const setActive = (region) => {
    document
      .querySelectorAll("#korea-map .active, .club-list-wrap .active")
      .forEach((el) => el.classList.remove("active"));

    if (!region) return;

    map.querySelector(`[data-region="${region}"]`)?.classList.add("active");
    clubList
      .querySelector(`.club-item[data-region="${region}"]`)
      ?.classList.add("active");
  };

  map.addEventListener("click", (e) => {
    const path = e.target.closest("[data-region]");
    if (!path || !map.contains(path)) return;
    setActive(path.dataset.region);
  });

  clubList.addEventListener("click", (e) => {
    const item = e.target.closest(".club-item[data-region]");
    if (!item || !clubList.contains(item)) return;
    setActive(item.dataset.region);
  });

  // 초기 선택
  setActive("seoul");
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
      back: "#1D3026",
      shapes: {
        ".back-shape-1": { fill: "#1D3026", x: 0, y: 0, scale: 1 },
        ".back-shape-2": { fill: "#1D3026", x: 0, y: 0, scale: 1 },
        ".back-shape-3": { fill: "#244031", x: 0, y: 0, scale: 1 },
      },
    },
    {
      trigger: ".section-honor.section-2",
      back: "#0F1D1C",
      shapes: {
        ".back-shape-1": { fill: "#1D3026", x: 0, y: 0, scale: 1 },
        ".back-shape-2": { fill: "#1D3026", x: 0, y: 0, scale: 1 },
        ".back-shape-3": { fill: "#244031", x: 0, y: 0, scale: 1 },
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
      trigger: ".section-honor.section-4",
      back: "#071926",
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
   section-2 누적 아너 회원 카운트업
   - 리드인 구간을 스크롤하는 동안 "시작"이 scrub 됨 (0 → 전체의 일부)
   - 리드인 구간을 지나면 나머지는 시간 기반 모션으로 자동 완주 (0 → 3,973)
---------------------------------------- */

(() => {
  const numEl = document.querySelector(".honor-counter .member-num");
  if (!numEl) return;

  const target = parseInt(numEl.textContent.replace(/[^\d]/g, ""), 10) || 0;

  // 스크롤에 연동되는 값(lead)과 자동 재생되는 값(full)을 분리
  const state = { lead: 0, full: 0, launched: false };
  const render = () => {
    const v = state.launched ? state.full : state.lead;
    numEl.textContent = Math.round(v).toLocaleString("en-US");
  };

  numEl.textContent = "0";

  // 리드인 구간에서 스크럽으로 도달하는 비율 (0.2 = 전체의 20%까지 스크롤로 진행)
  const LEADIN_RATIO = 0.2;

  // 위로 스크롤해 재진입할 때의 재생 상태 (리드인 스크럽이 끼어들지 않도록 가드)
  let replaying = false;

  // 현재값에서 target 까지 시간 기반으로 완주
  const playFull = (fromVal) => {
    state.launched = true;
    gsap.fromTo(
      state,
      { full: fromVal },
      {
        full: target,
        duration: 1.6,
        ease: "power2.out",
        overwrite: true,
        onUpdate: render,
      }
    );
  };

  const leadInTween = gsap.to(state, {
    lead: target * LEADIN_RATIO,
    ease: "none",
    onUpdate: render,
    scrollTrigger: {
      trigger: ".section-honor.local-club",
      start: "top 65%",
      end: "top 40%",
      scrub: true,
      // 리드인 구간으로 되돌아오면 다시 스크럽 모드 (재진입 재생 중에는 무시)
      onEnter: () => { if (!replaying) state.launched = false; },
      onEnterBack: () => { if (!replaying) { state.launched = false; state.full = 0; render(); } },
      // 아래로 리드인 구간을 지나면 나머지 자동 완주
      onLeave: () => { if (!replaying) playFull(state.lead); },
    },
  });

  // 0 으로 초기화
  const reset = () => {
    gsap.killTweensOf(state);
    state.lead = 0;
    state.full = 0;
    state.launched = false;
    leadInTween.progress(0);
    render();
  };

  ScrollTrigger.create({
    trigger: ".section-honor.local-club",
    start: "bottom top",
    // 아래로 스크롤해 섹션이 화면 위로 완전히 벗어남 → 초기화
    onEnter: () => {
      replaying = false;
      reset();
    },
    // 다시 위로 스크롤해 섹션이 화면에 재진입 → 초기화 후 처음부터 재생
    onLeaveBack: () => {
      reset();
      replaying = true;
      playFull(0);
    },
  });
})();
