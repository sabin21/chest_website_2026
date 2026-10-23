function setActiveSlide(swiper) {
  swiper.slides.forEach((slide) => slide.classList.remove("active"));
  swiper.slides[swiper.activeIndex]?.classList.add("active");
}

const swiper = new Swiper(".hero-swiper-wrap", {
  loop: true,
  slidesPerView: 1,
  speed: 1,
  spaceBetween: 40,
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

const fundingProjectSwiper = new Swiper(".swiper-funding-project", {
  slidesPerView: 1.25,
  spaceBetween: 16,
  navigation: {
    prevEl: ".section-funding-project .nav-prev",
    nextEl: ".section-funding-project .nav-next",
  },
  breakpoints: {
    768: {
      slidesPerView: 2.5,
      spaceBetween: 20,
    },
    1200: {
      slidesPerView: 3.5,
      spaceBetween: 24,
    },
  },
});

const noticesRailSwiper = new Swiper(".notices-rail", {
  slidesPerView: "auto",
  spaceBetween: 40,
  freeMode: true,
  loop: true,
  navigation: {
    prevEl: ".notice-strip-wrap .nav-prev",
    nextEl: ".notice-strip-wrap .nav-next",
  },
});

const donationItemsRowWrap = document.querySelector(".donation-type-link-wrap .items-row-wrap");

if (donationItemsRowWrap) {
  const donationItemsRow = donationItemsRowWrap.querySelector(".items-row");
  const donationScrollPrev = donationItemsRowWrap.querySelector(".scroll-arrow.prev");
  const donationScrollNext = donationItemsRowWrap.querySelector(".scroll-arrow.next");
  const donationScrollAmount = () => donationItemsRow.querySelector(".item-link")?.offsetWidth + 16 || 166;

  donationScrollPrev.addEventListener("click", () => {
    donationItemsRow.scrollBy({ left: -donationScrollAmount(), behavior: "smooth" });
  });
  donationScrollNext.addEventListener("click", () => {
    donationItemsRow.scrollBy({ left: donationScrollAmount(), behavior: "smooth" });
  });
}

const donationTabs = document.querySelectorAll(".home-donation-tab");

donationTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    donationTabs.forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".donation-form-wrap").forEach((form) => form.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`home-donation-${index + 1}`).classList.add("active");
  });
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
