document.querySelectorAll(".btn-calendar").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector('input[type="date"]');
    if (typeof input?.showPicker === "function") {
      input.showPicker();
    } else {
      input?.focus();
    }
  });
});
