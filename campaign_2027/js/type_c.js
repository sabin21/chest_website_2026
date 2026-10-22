// 탑 이미지 ↔ 지도 이미지 토글 (보이는 이미지 또는 토글 버튼 클릭 시 전환)
const groupRight = document.querySelector('.group-right');
const toggleBtn = document.querySelector('.btn-tower-toggle');

const toggleMap = () => groupRight?.classList.toggle('is-map');

groupRight?.addEventListener('click', (e) => {
  if (e.target.closest('.tower-img, .map-img')) toggleMap();
});
toggleBtn?.addEventListener('click', toggleMap);
