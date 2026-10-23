async function initModalDonationRequest() {
  const overlay = document.getElementById("modal-request-consultation");
  if (!overlay) return;

  const res = await fetch("components/modal-donation-request.html");
  if (!res.ok) return;

  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  overlay.innerHTML = doc.body.innerHTML;

  const btnModalClose = overlay.querySelector(".btn-modal-close");

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
}

initModalDonationRequest();
