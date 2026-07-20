async function initBreadcrumb() {
  const el = document.getElementById("app-breadcrumb");
  if (!el) return;

  const [htmlRes, menuRes] = await Promise.all([
    fetch("components/breadcrumb.html"),
    fetch("components/gnb-menu.json"),
  ]);
  if (!htmlRes.ok) return;

  const doc = new DOMParser().parseFromString(await htmlRes.text(), "text/html");
  el.innerHTML = doc.body.innerHTML;

  if (!menuRes.ok) return;
  const menuData = await menuRes.json();

  const itemsWrap = el.querySelector(".breadcrumb-items");
  if (!itemsWrap) return;

  const match = findCurrentMenuMatch(menuData);
  if (!match) return;

  const { top, child, grandchild } = match;
  const currentPage = normalizeHref(location.pathname);

  let html = renderBreadcrumbItem(
    top.label,
    menuData.map((m) => ({
      label: m.label,
      href: m.children[0]?.href || m.href,
      active: m.id === top.id,
    }))
  );

  if (child) {
    html += renderBreadcrumbItem(
      child.label,
      top.children.map((c) => ({
        label: c.label,
        href: c.children?.[0]?.href || c.href,
        active: c === child,
      }))
    );
  }

  if (grandchild) {
    html += renderBreadcrumbItem(
      grandchild.label,
      child.children.map((gc) => ({
        label: gc.label,
        href: gc.href,
        active: normalizeHref(gc.href) === currentPage,
      }))
    );
  }

  itemsWrap.innerHTML = html;

  bindBreadcrumbDropdowns(el);
}

function normalizeHref(href) {
  if (!href) return "";
  try {
    return new URL(href, location.href).pathname.split("/").pop().toLowerCase();
  } catch {
    return href;
  }
}

function findCurrentMenuMatch(menuData) {
  const currentPage = normalizeHref(location.pathname);

  // 정확히 depth-2 페이지 자신과 일치하는 경우를 우선 매칭
  for (const top of menuData) {
    const child = top.children.find(
      (c) => normalizeHref(c.href) === currentPage
    );
    if (child) return { top, child, grandchild: null };
  }

  // depth-3(하위 탭) 매칭
  for (const top of menuData) {
    for (const child of top.children) {
      if (!child.children) continue;
      const grandchild = child.children.find(
        (gc) => normalizeHref(gc.href) === currentPage
      );
      if (grandchild) return { top, child, grandchild };
    }
  }

  for (const top of menuData) {
    if (normalizeHref(top.href) === currentPage)
      return { top, child: null, grandchild: null };
  }

  return null;
}

function renderBreadcrumbItem(label, options) {
  const optionsHtml = options
    .map(
      ({ label: optLabel, href, active }) =>
        `<li data-href="${href}" class="${active ? "active" : ""}">${optLabel}</li>`
    )
    .join("");

  return `
    <div class="dropdown-wrap breadcrumb-dropdown">
      <button class="breadcrumb-item" type="button">
        <span class="breadcrumb-text">${label}</span>
        <svg class="breadcrumb-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
          <path d="M3 5L7 9.5L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <ul class="breadcrumb-popover">${optionsHtml}</ul>
    </div>`;
}

function bindBreadcrumbDropdowns(el) {
  const wraps = el.querySelectorAll(".breadcrumb-dropdown");

  wraps.forEach((wrap) => {
    const btn = wrap.querySelector(".breadcrumb-item");
    const popover = wrap.querySelector(".breadcrumb-popover");
    if (!btn || !popover) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains("open");
      el.querySelectorAll(".breadcrumb-dropdown.open").forEach((d) =>
        d.classList.remove("open")
      );
      if (!isOpen) wrap.classList.add("open");
    });

    popover.addEventListener("click", (e) => {
      const item = e.target.closest("li[data-href]");
      if (!item) return;
      window.location.href = item.dataset.href;
    });
  });

  document.addEventListener("click", () => {
    el.querySelectorAll(".breadcrumb-dropdown.open").forEach((d) =>
      d.classList.remove("open")
    );
  });
}

initBreadcrumb();
