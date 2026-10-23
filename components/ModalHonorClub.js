async function initModalHonorClub() {
  const overlay = document.getElementById("modal-honor-club");
  if (!overlay) return;

  const res = await fetch("components/modal-honor-club.html");
  if (!res.ok) return;

  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  overlay.innerHTML = doc.body.innerHTML;

  const btnModalClose = overlay.querySelector(".btn-modal-close");
  const menuItems = overlay.querySelectorAll(".club-menu-item");

  function openModal() {
    overlay.classList.add("is-open");
    window.__lenis?.stop();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    window.__lenis?.start();
  }

  btnModalClose?.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // 모달 상단 지역 메뉴 활성화 토글
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // 지역클럽 리스트의 "상세보기" 버튼 → 모달 오픈
  document.querySelectorAll(".club-item .btn-club-detail").forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
}

initModalHonorClub();
