/* ──────────────────────────────────────
   열매모아 — Project swiper
────────────────────────────────────── */
const projectSwiper = new Swiper('.project-swiper', {
  slidesPerView: 'auto',
  spaceBetween: 20,
  slidesOffsetBefore: Math.max(0, (window.innerWidth - 1456) / 2 + (window.innerWidth < 1200 ? 16 : 0)),
  slidesOffsetAfter: 40,
  navigation: {
    prevEl: '.project-prev',
    nextEl: '.project-next',
  },
  breakpoints: {
    0:    { slidesOffsetBefore: 16 },
    1200: { slidesOffsetBefore: Math.max(0, (window.innerWidth - 1456) / 2) },
  },
});

/* ──────────────────────────────────────
   열매이야기 — News tabs
────────────────────────────────────── */
document.querySelectorAll('.news-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
