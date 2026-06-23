async function initBreadcrumb() {
  const el = document.getElementById("app-breadcrumb");
  if (!el) return;

  const res = await fetch("components/breadcrumb.html");
  if (!res.ok) return;

  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  el.innerHTML = doc.body.innerHTML;
}

initBreadcrumb();
