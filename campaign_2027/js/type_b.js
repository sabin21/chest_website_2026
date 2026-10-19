import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// 새로고침 시 브라우저가 이전 스크롤 위치를 복원하지 않고 항상 맨 위에서 시작
ScrollTrigger.clearScrollMemory('manual');   // history.scrollRestoration = 'manual' 포함
window.scrollTo(0, 0);

// 부드러운 스크롤: GSAP ticker로 Lenis를 구동하고 스크롤마다 ScrollTrigger 갱신
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const MODEL_URL = './models/ondo_tower_baked_web.glb';

//-------------------------------------//
//-------------------------------------//
//Three.js 설정

const canvas = document.getElementById('main-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
const tower = new THREE.Group();
scene.add(tower);

// 바닥면 그림자
function groundShadow(radius){
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128,128,0,128,128,128);
  grd.addColorStop(0,'rgba(58,42,34,0.3)'); grd.addColorStop(1,'rgba(58,42,34,0)');
  g.fillStyle = grd; g.fillRect(0,0,256,256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius*2, radius*2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI/2; m.position.y = 0.01;
  return m;
}


// 간판 텍스트: "나눔온도" "{온도}도" ----//

const gauges = []; // Thermo_Red_Front / Back  (scale.y 0~1 = 0~100도)

const SIGN_FONT = '"Pretendard GOV","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
const SIGN_COLOR = '#1f9f37'; 
const signTexts = [];  // { ctx, tex, value }

function makeSignText(signMesh){
  signMesh.updateWorldMatrix(true, false);
  const box = new THREE.Box3().setFromObject(signMesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const out = Math.sign(center.z) || 1;            // 탑 바깥쪽(+Z 정면 / -Z 뒷면)

  const W = 1024, H = Math.round(W * size.y / size.x);
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x, size.y),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })
  );
  mesh.position.set(center.x, center.y, center.z + out * (size.z / 2 + 0.003));
  if (out < 0) mesh.rotation.y = Math.PI;
  tower.add(mesh);

  const item = { ctx, tex, W, H, value: null };
  signTexts.push(item);
  return item;
}

function fitFont(ctx, text, maxW, maxH){
  let px = maxH;
  ctx.font = `800 ${px}px ${SIGN_FONT}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) px = Math.floor(px * maxW / w);
  ctx.font = `800 ${px}px ${SIGN_FONT}`;
}

function drawSign(item, value){
  if (item.value === value) return;
  item.value = value;
  const { ctx, W, H } = item;
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const maxW = W * 0.8;
  // 윗줄
  fitFont(ctx, '나눔온도', maxW, H * 0.30);
  ctx.fillStyle = SIGN_COLOR;
  ctx.fillText('나눔온도', W / 2, H * 0.29);

  // 아랫줄 (숫자는 게이지와 연동)
  fitFont(ctx, '100.0도', maxW, H * 0.38);     // 글자 크기는 '100.0도' 기준으로 고정
  const fullW = ctx.measureText('100.0도').width;
  const unitW = ctx.measureText('도').width;
  const unitX = W / 2 + fullW / 2 - unitW;     // '도' 왼쪽 끝 x (고정)
  const y2 = H * 0.7;
  ctx.fillStyle = SIGN_COLOR;
  ctx.textAlign = 'left';
  ctx.fillText('도', unitX, y2);
  ctx.textAlign = 'right';
  ctx.fillText(value.toFixed(1), unitX, y2);
  item.tex.needsUpdate = true;
}
let targetTemp = 0.5, currentTemp = 0.5;

renderer.localClippingEnabled = true;
const FLOOR_CLIP = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);   // y >= 0 만 그림

// 카메라 상태: basePos/lookTarget(정면 고정)에 스크롤 구간의 scrollCam을 렌더 루프에서 합성
const basePos = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const scrollCam = {
  zoom: 0,    // 탑까지 거리를 이 비율만큼 줄임 (음수면 멀어짐: -0.25 → 거리 1.25배)
  shift: 0,   // 화면상 탑 위치를 오른쪽으로 미는 비율 (화면 폭 기준, 음수면 왼쪽)
  lift: 0,    // 화면상 탑 위치를 위로 올리는 비율 (화면 높이 기준)
};
const camOffset = new THREE.Vector3();

function updateCamera(){
  camOffset.subVectors(basePos, lookTarget).multiplyScalar(1 - scrollCam.zoom);
  camera.position.addVectors(lookTarget, camOffset);
  camera.lookAt(lookTarget);
  // 투영 영역만 옮겨 원근 왜곡 없이 탑을 화면 오른쪽·위로 보냄 (aspect도 함께 설정됨)
  const w = window.innerWidth, h = window.innerHeight;
  camera.setViewOffset(w, h, -w * scrollCam.shift, h * scrollCam.lift, w, h);
}

const loadingEl = document.getElementById('loading');
const pctEl = document.getElementById('pct');

new GLTFLoader().load(MODEL_URL, (gltf) => {
  const model = gltf.scene;
  tower.add(model);

  const signs = [];
  model.traverse((o) => {
    if (o.name.startsWith('Thermo_Red')) gauges.push(o);
    if (o.name === 'Tower_Sign_Front' || o.name === 'Tower_Sign_Back') signs.push(o);
  });
  model.updateMatrixWorld(true);
  signs.forEach(makeSignText);

  // 카메라 맞추기
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const r = Math.max(size.x, size.y, size.z);
  const shadow = groundShadow(Math.max(size.x, size.z) * 0.9);
  scene.add(shadow);

  // 회전축을 탑 중심(x, z)으로 이동 — 월드 좌표는 그대로 유지
  tower.position.set(center.x, 0, center.z);
  tower.children.forEach((c) => { c.position.x -= center.x; c.position.z -= center.z; });

  // 바닥(y=0) 아래로 내려간 탑 부분은 잘라내서 바닥에서 솟아나는 것처럼 보이게 함
  tower.traverse((o) => { if (o.material) o.material.clippingPlanes = [FLOOR_CLIP]; });

  // 카메라: 처음부터 탑 정면(+Z) 고정
  // CAM_DISTANCE: 보는 각도는 유지하고 거리만 배율 적용 (화면상 크기 ∝ 1/거리 → 1.25배 = 80% 크기)
  const CAM_DISTANCE = 1.25;
  lookTarget.set(center.x, center.y + 0.2, center.z);
  basePos.set(center.x, center.y - 2, center.z + r * 2.2)
    .sub(lookTarget).multiplyScalar(CAM_DISTANCE).add(lookTarget);

  // 하나의 타임라인: [0 ~ 'intro'] 로딩 인트로 → ['intro' ~ 끝] section-2 스크롤 구간
  const tl = gsap.timeline({ paused: true, defaults: { duration: 3, ease: 'power2.inOut' } });
  tl
    // 인트로: 탑이 바닥 아래에서 360도 회전하며 솟아남 → 정면을 보며 멈춤
    .fromTo(tower.position, { y: -box.max.y }, { y: 0, ease: 'power3.out' }, 0)
    .fromTo(tower.rotation, { y: 0 }, { y: Math.PI * 2, ease: 'power2.out' }, 0)
    .fromTo(shadow.material, { opacity: 0 }, { opacity: 1, duration: 2 }, 0.5)
    .fromTo('#btn-donate-1', { y: 300}, {y:0, duration: 0.5}, 2)
    .fromTo('.hero-copy-wrap', { y: "-80vh"}, {y:0, duration: 0.8}, 2)
    .fromTo('.model-pict', { x: "50vw"}, {x:0, duration: 0.8}, 2.5)
    .fromTo('.hero-content', { x: "-50vw"}, {x:0, duration: 0.8}, 3)
    // 솟아남이 끝난 뒤 탑을 화면 중앙에서 20% 왼쪽으로 이동
    .to(scrollCam, { shift: -0.08, duration: 1 }, 2)
    .addLabel('intro')
    // 스크롤: 탑이 왼쪽으로 이동하며 80% 크기로 작아짐(거리 1.25배)
    .to(scrollCam, {
      zoom: -0.25, shift: -0.3, lift: 0,
      duration: 1, ease: 'none',
    }, 'intro')
    .to('.model-pict', { x: "50vw", duration: 0.8}, 'intro')
    .to('.hero-content', { x: "-80vw", duration: 0.8}, 'intro')
    .to('.hero-copy-wrap', { y: "-80vh", duration: 0.8}, 'intro')
    .to('.hero-background-2', { opacity: 1, duration: 0.8}, 'intro')
    .fromTo('.local-map-title', { x: "-50vw"}, {x:0, duration: 0.8},'intro')
    .fromTo('.local-data-panel', { x: "80vw"}, {x:0, duration: 0.8}, 'intro')
    .fromTo('.map-wrap', { x: "80vw"}, {x:0, duration: 0.8}, 'intro');

  const introEnd = tl.labels.intro;
  const scrollLen = tl.duration() - introEnd;

  // 인트로는 시간으로 재생하고, 끝난 뒤부터 스크롤이 타임라인의 스크롤 구간을 제어
  tl.tweenTo('intro', {
    onComplete: () => {
      const seek = (progress) => gsap.to(tl, {
        time: introEnd + progress * scrollLen,
        duration: 1, ease: 'power1.out', overwrite: true,   // scrub: 1 과 같은 부드러운 추종
      });
      const st = ScrollTrigger.create({
        trigger: '.section-2',
        start: 'top bottom',
        end: '+=200',
        onUpdate: (self) => seek(self.progress),
      });
      seek(st.progress);   // 스크롤된 상태로 리로드한 경우 현재 위치까지 이어서 이동
    },
  });

  // 웹폰트가 늦게 로드되는 경우를 대비해 폰트 준비 후 한 번 더 그림
  // 캔버스 글자는 DOM에 없어 브라우저가 서브셋 폰트를 받지 않으므로, 필요한 굵기·글자를 직접 로드
  document.fonts?.load(`800 64px ${SIGN_FONT}`, '나눔온도0123456789.도')
    .then(() => signTexts.forEach((t) => { t.value = null; }));
  loadingEl.remove();
}, (e) => {
  if (e.total) pctEl.textContent = Math.round(e.loaded / e.total * 100) + '%';
}, (err) => {
  console.error(err);
  loadingEl.classList.add('err');
  loadingEl.innerHTML = '모델을 불러오지 못했습니다.<br>파일을 직접 열지 말고 로컬 서버로 실행해 주세요.<br>(예: 이 폴더에서 <code>python -m http.server</code>)';
});

// resize event ------------------- //

function resize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 45 : 35;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// 에니메이션 루프
let prevTime = null;
renderer.setAnimationLoop((time) => {
  const dt = prevTime === null ? 0 : Math.min((time - prevTime) / 1000, 0.05);
  prevTime = time;
  const k = 1 - Math.exp(-dt * 6);

  currentTemp += (targetTemp - currentTemp) * k;
  if (Math.abs(targetTemp - currentTemp) < 0.0005) currentTemp = targetTemp;
  for (const g of gauges) g.scale.y = Math.max(currentTemp, 0.0001);
  const shown = Math.round(currentTemp * 1000) / 10;   // 0.1도 단위
  for (const t of signTexts) drawSign(t, shown);

  updateCamera();
  renderer.render(scene, camera);
});

//----------------------------------------- //
//----------------------------------------- //
// 온도,모금액 Data 연동

// 온도탑 온도 설정 (0 ~ 100도)
function setTemp(v){ targetTemp = Math.min(100, Math.max(0, v)) / 100; }

// 초기값: HTML의 window.TOWER_CONFIG.initialTemp (없거나 숫자가 아니면 50도)
const initialTemp = Number(window.TOWER_CONFIG?.initialTemp);
setTemp(Number.isFinite(initialTemp) ? initialTemp : 50);
currentTemp = targetTemp;

// 지역 지도: path 클릭 시 window.REGION_DATA의 해당 지역 데이터를 패널에 표시
const koreaMap = document.getElementById('korea-map');
const localRegionEl = document.getElementById('local-region-kor');
const localTempEl = document.getElementById('local-temp');
const localAmountEl = document.getElementById('local-amount');
const amountFormat = new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function selectRegion(path){
  const data = window.REGION_DATA?.[path.dataset.region];
  if (!data) return;
  koreaMap.querySelector('path.active')?.classList.remove('active');
  path.classList.add('active');
  localRegionEl.textContent = data.name;
  localTempEl.textContent = data.temp.toFixed(1);
  localAmountEl.textContent = amountFormat.format(data.amount);   // 억원 단위
}

koreaMap?.addEventListener('click', (e) => {
  const path = e.target.closest('path[data-region]');
  if (path) selectRegion(path);
});

// 초기 표시: 서울
const initialRegion = koreaMap?.querySelector('path[data-region="seoul"]');
if (initialRegion) selectRegion(initialRegion);
