// --- project-view-head-row pin ---
const headRow = document.querySelector(".project-view-head-row");

if (headRow) {
  const headParent = headRow.closest(".project-view-head");
  let pinned = false;
  const threshold = headRow.getBoundingClientRect().top;

  function checkPin(scroll) {
    const shouldPin = scroll >= threshold;
    if (shouldPin === pinned) return;
    pinned = shouldPin;

    if (shouldPin) {
      headParent.style.paddingBottom = headRow.offsetHeight + "px";
      headRow.classList.add("scrolled");
    } else {
      headRow.classList.remove("scrolled");
      headParent.style.paddingBottom = "";
    }
  }

  if (window.__lenis) {
    window.__lenis.on("scroll", ({ scroll }) => checkPin(scroll));
  } else {
    const wrapper = document.querySelector(".app-root") || window;
    wrapper.addEventListener("scroll", () =>
      checkPin(wrapper === window ? window.scrollY : wrapper.scrollTop)
    );
  }
}

// --- project-floating-wrap footer 회피 ---
const floatingEl = document.querySelector(".project-floating-wrap");
const footerEl = document.querySelector(".app-footer");

if (floatingEl && footerEl) {
  const FLOATING_GAP = 32; // footer 위 기본 여백 (px)

  function checkFloating() {
    const footerTop = footerEl.getBoundingClientRect().top;
    const overlap = window.innerHeight - footerTop; // footer가 뷰포트 안으로 들어온 높이
    floatingEl.style.bottom =
      (overlap > 0 ? overlap + FLOATING_GAP : FLOATING_GAP) + "px";
  }

  if (window.__lenis) {
    window.__lenis.on("scroll", checkFloating);
  } else {
    const wrapper = document.querySelector(".app-root") || window;
    wrapper.addEventListener("scroll", checkFloating);
  }
}
