
// --- campaign-field-wrap 카드 선택 토글 ---
const fieldItems = document.querySelectorAll(".campaign-field-wrap > li");

fieldItems.forEach((item) => {
  item.addEventListener("click", () => {
    fieldItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  });
});

// --- donation-item-wrap 는 아직 연결된 페이지가 없어 클릭 이동을 막음 ---
document.querySelectorAll(".donation-item-wrap").forEach((wrap) => {
  wrap.addEventListener("click", (e) => e.preventDefault());
});

// --- 원본(chest.or.kr)의 AOS 스크롤 모션을 GSAP ScrollTrigger로 재현 ---
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const revealOnScroll = (elements, from, durationMs, delayMs = 0, start = "top 85%") => {
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        from,
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: durationMs / 1000,
          delay: delayMs / 1000,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    });
  };

  // campaign-tit: zoom-in
  revealOnScroll(document.querySelectorAll(".campaign-tit"), { opacity: 0, scale: 0.6 }, 500);

  // campaign-tower-img: flip-right
  revealOnScroll(
    document.querySelectorAll(".campaign-tower-img img"),
    { rotateY: -100, transformPerspective: 2500, transformOrigin: "center" },
    700,
    0,
    "top 90%"
  );

  // 사랑의온도탑 설명 블록: fade-up
  revealOnScroll(document.querySelectorAll(".campaign-tower > div:nth-child(2)"), { opacity: 0, y: 60 }, 500);

  // 3대 지원분야 타이틀: fade-right
  revealOnScroll(document.querySelectorAll(".campaign-field > h3"), { opacity: 0, x: -60 }, 700, 100);

  // 3대 지원분야 카드: fade-up (순차 지연)
  const fieldDelays = [100, 250, 400];
  document.querySelectorAll(".campaign-field-wrap > li").forEach((el, i) => {
    revealOnScroll([el], { opacity: 0, y: 60 }, 600, fieldDelays[i] || 0);
  });

  // 기부방법 카드 묶음: fade-up
  revealOnScroll(document.querySelectorAll(".donation-item-wrap"), { opacity: 0, y: 60 }, 500);
}
