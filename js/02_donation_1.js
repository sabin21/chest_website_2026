(function () {
  const step1   = document.getElementById('donation-step-1');
  const step2   = document.getElementById('donation-step-2');
  const step3   = document.getElementById('donation-step-3');
  const overlay = document.querySelector('.modal-overlay');
  const btnClose = overlay.querySelector('.btn-close');

  /* ── step reveal ── */
  function revealAndScroll(target) {
    target.style.display = 'block';
    const lenis = window.__lenis;
    lenis ? lenis.scrollTo(target, { offset: -100 }) : target.scrollIntoView({ behavior: 'smooth' });
  }

  step1.querySelector('.dummy-img').addEventListener('click', () => revealAndScroll(step2));
  step2.querySelector('.dummy-img').addEventListener('click', () => revealAndScroll(step3));

  /* ── modal ── */
  function openModal() {
    overlay.classList.add('is-open');
    window.__lenis?.stop();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    window.__lenis?.start();
  }

  document.querySelectorAll('.banner-consulting').forEach(el => {
    el.addEventListener('click', openModal);
  });

  btnClose.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}());
