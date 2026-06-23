function setActiveSlide(swiper) {
  swiper.slides.forEach((slide) => slide.classList.remove("active"));
  swiper.slides[swiper.activeIndex]?.classList.add("active");
}

const swiper = new Swiper(".hero-swiper-wrap", {
  loop: true,
  slidesPerView: 1,
  speed: 1,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".hero-swiper-wrap .swiper-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".hero-swiper-wrap .nav-prev",
    nextEl: ".hero-swiper-wrap .nav-next",
  },
  on: {
    afterInit: setActiveSlide,
    slideChange: setActiveSlide,
  },
});

const btnPause = document.querySelector(".swiper-btn-pause");
const iconPause = btnPause.querySelector(".icon-pause");
const iconPlay = btnPause.querySelector(".icon-play");

btnPause.addEventListener("click", () => {
  if (swiper.autoplay.running) {
    swiper.autoplay.stop();
    iconPause.style.display = "none";
    iconPlay.style.display = "";
    btnPause.setAttribute("aria-label", "자동재생 시작");
  } else {
    swiper.autoplay.start();
    iconPause.style.display = "";
    iconPlay.style.display = "none";
    btnPause.setAttribute("aria-label", "자동재생 일시정지");
  }
});
