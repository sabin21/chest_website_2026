async function initAppFooter() {
  const el = document.getElementById("app-footer");
  if (!el) return;
  const res = await fetch("components/app-footer.html");
  if (!res.ok) return;
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  el.innerHTML = doc.body.innerHTML;
}

initAppFooter();
