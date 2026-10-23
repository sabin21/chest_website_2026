
// --- project-view-head-row pin ---
const headRow = document.querySelector(".project-view-head-row.row-1");

if (headRow) {
  const headParent = headRow.closest(".project-view-head");
  const floatingWrap = document.querySelector(".project-floating-wrap");
  let pinned = false;
  const threshold = headRow.getBoundingClientRect().top;

  function checkPin(scroll) {
    const shouldPin = scroll >= threshold;
    if (shouldPin === pinned) return;
    pinned = shouldPin;

    if (shouldPin) {
      headParent.style.paddingBottom = headRow.offsetHeight + "px";
      headRow.classList.add("scrolled");
      floatingWrap?.classList.add("active");
    } else {
      headRow.classList.remove("scrolled");
      headParent.style.paddingBottom = "";
      floatingWrap?.classList.remove("active");
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

// --- .btn-project-share popover ---
const shareWrap = document.querySelector(".share-wrap");

if (shareWrap) {
  const shareBtn = shareWrap.querySelector(".btn-project-share");
  const sharePopover = shareWrap.querySelector(".share-popover");
  const copyLabel = shareWrap.querySelector('[data-share="link"] .label');
  const copyLabelDefault = copyLabel?.textContent;
  let copyResetTimer = null;

  function closeShare() {
    shareWrap.classList.remove("open");
    shareBtn.setAttribute("aria-expanded", "false");
  }

  function toggleShare() {
    const isOpen = shareWrap.classList.toggle("open");
    shareBtn.setAttribute("aria-expanded", String(isOpen));
  }

  function copyShareLink() {
    navigator.clipboard.writeText(location.href).then(() => {
      if (!copyLabel) return;
      copyLabel.textContent = "복사완료";
      clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        copyLabel.textContent = copyLabelDefault;
        closeShare();
      }, 1200);
    });
  }

  function shareKakao() {
    if (!window.Kakao?.isInitialized?.()) return;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title:
          document.querySelector(".project-title")?.textContent?.trim() ||
          document.title,
        description: location.href,
        imageUrl: new URL("img/dummy_sample/project_content.png", location.href).href,
        link: { mobileWebUrl: location.href, webUrl: location.href },
      },
    });
  }

  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleShare();
  });

  sharePopover.addEventListener("click", (e) => {
    if (e.target.closest('[data-share="link"]')) {
      copyShareLink();
    } else if (e.target.closest('[data-share="kakao"]')) {
      shareKakao();
      closeShare();
    }
  });

  document.addEventListener("click", (e) => {
    if (!shareWrap.contains(e.target)) closeShare();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeShare();
  });
}

// --- project-floating-wrap footer 회피 ---
const floatingEl = document.querySelector(".project-floating-wrap");
const footerEl = document.querySelector(".app-footer");

if (floatingEl && footerEl) {
  const FLOATING_GAP = 32; // footer 위 기본 여백 (px)
  const mobileQuery = window.matchMedia("(max-width: 1200px)");

  function checkFloating() {
    if (mobileQuery.matches) {
      floatingEl.style.bottom = "";
      return;
    }
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
