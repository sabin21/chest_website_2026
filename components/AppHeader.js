async function initAppHeader() {
  const el = document.getElementById("app-header");
  if (!el) return;

  const [htmlRes, menuRes] = await Promise.all([
    fetch("components/app-header.html"),
    fetch("components/gnb-menu.json"),
  ]);
  if (!htmlRes.ok) return;

  const doc = new DOMParser().parseFromString(
    await htmlRes.text(),
    "text/html",
  );
  el.innerHTML = doc.body.innerHTML;

  if (menuRes.ok) {
    const menuData = await menuRes.json();
    applyGnbMenu(el, menuData);
  }

  const sitemapWrap = el.querySelector(".app-sitemap-wrap");
  const sitemapBtn = el.querySelector(".btn-gnb-sitemap");
  const sitemapBtnMo = el.querySelector(".btn-sitemap-mo");
  const burgerBtn = el.querySelector(".btn-gnb-burger");
  const headerUtilBar = el.querySelector(".header-util-bar");
  const mognbWrap = el.querySelector(".mo-gnb-wrap");

  sitemapBtn?.addEventListener("click", function () {
    this.classList.toggle("active");
    sitemapWrap?.classList.toggle("active");
  });

  sitemapBtnMo?.addEventListener("click", function () {
    // this.classList.toggle("active");
    sitemapWrap?.classList.toggle("active");
  });

  burgerBtn?.addEventListener("click", function () {
    this.classList.toggle("active");
    headerUtilBar?.classList.toggle("mo-gnb-active");
    mognbWrap?.classList.toggle("active");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      burgerBtn?.classList.remove("active");
      headerUtilBar?.classList.remove("mo-gnb-active");
      mognbWrap?.classList.remove("active");
    }
  });

  el.querySelector(".btn-sitemap-close")?.addEventListener("click", () => {
    sitemapBtn?.classList.remove("active");
    sitemapWrap?.classList.remove("active");
  });

  initHeaderDropdown(el, ".lang-wrap", ".lang", ".lang-popover");
  initHeaderDropdown(el, ".branch-wrap", ".branch", ".branch-popover");

  el.querySelectorAll(".mo-gnb-item-level1 > .label").forEach((label) => {
    label.addEventListener("click", (e) => {
      e.preventDefault();
      const item = label.closest(".mo-gnb-item-level1");
      el.querySelectorAll(".mo-gnb-item-level1.active").forEach((other) =>
        other.classList.remove("active"),
      );
      item.classList.add("active");
    });
  });

  el.querySelectorAll(".mo-gnb-item-level2 > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const item = link.closest(".mo-gnb-item-level2");
      if (!item.querySelector(".mo-gnb-level3-wrap")) return;

      const isActive = item.classList.contains("active");
      el.querySelectorAll(".mo-gnb-item-level2.active").forEach((other) =>
        other.classList.remove("active"),
      );
      if (!isActive) item.classList.add("active");
    });
  });

  document.addEventListener("click", () => {
    el.querySelectorAll(".dropdown-wrap.open").forEach((d) =>
      d.classList.remove("open"),
    );
  });
}

function applyGnbMenu(el, menuData) {
  const menuWraps = el.querySelectorAll(".gnb-menu-item-wrap");
  menuWraps.forEach((wrap, i) => {
    const menu = menuData[i];
    if (!menu) return;

    const subItemWrap = wrap.querySelector(".gnb-submenu-item-wrap");
    if (!subItemWrap) return;

    subItemWrap.innerHTML = menu.children
      .map(
        ({ label, href }) => `
        <a href="${href}" class="gnb-submenu-item">
          <span class="gnb-submenu-text">${label}</span>
          <span class="gnb-submenu-icon"></span>
        </a>`,
      )
      .join("");
  });
}

function initHeaderDropdown(root, wrapSel, btnSel, popoverSel) {
  const wrap = root.querySelector(wrapSel);
  if (!wrap) return;
  const btn = wrap.querySelector(btnSel);
  if (!btn) return;
  const text = btn.querySelector(".text");
  const popover = wrap.querySelector(popoverSel);
  if (!popover) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = wrap.classList.contains("open");
    root
      .querySelectorAll(".dropdown-wrap.open")
      .forEach((d) => d.classList.remove("open"));
    if (!isOpen) wrap.classList.add("open");
  });

  popover.addEventListener("click", (e) => {
    const item = e.target.closest("li[data-value]");
    if (!item) return;
    if (text) text.textContent = item.dataset.value;
    wrap.classList.remove("open");
  });
}

initAppHeader();
