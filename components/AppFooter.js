async function initAppFooter() {
  const el = document.getElementById("app-footer");
  if (!el) return;
  const res = await fetch("components/app-footer.html");
  if (!res.ok) return;
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  el.innerHTML = doc.body.innerHTML;

  const langWrap = el.querySelector(".footer-lang-wrap");
  const langBtn = el.querySelector(".footer-lang-btn");
  const langLabel = el.querySelector(".lang-label");
  const langDropdown = el.querySelector(".footer-lang-dropdown");

  if (langWrap && langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langWrap.classList.toggle("is-open");
    });

    langDropdown.querySelectorAll("button").forEach((item) => {
      item.addEventListener("click", () => {
        langLabel.textContent = item.textContent;
        langWrap.classList.remove("is-open");
      });
    });

    document.addEventListener("click", () => {
      langWrap.classList.remove("is-open");
    });
  }
}

initAppFooter();
