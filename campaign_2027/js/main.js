import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MODEL_URL = './models/ondo_tower_baked_web.glb';

const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;   // 구운 텍스처 색을 그대로
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.15;
controls.maxPolarAngle = Math.PI * 0.52;

// 바닥 그림자(가짜): 부드러운 원형 그라데이션
function groundShadow(radius){
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128,128,0,128,128,128);
  grd.addColorStop(0,'rgba(58,42,34,0.35)'); grd.addColorStop(1,'rgba(58,42,34,0)');
  g.fillStyle = grd; g.fillRect(0,0,256,256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius*2, radius*2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI/2; m.position.y = 0.01;
  return m;
}

const gauges = [];        // Thermo_Red_Front / Back  (scale.y 0~1 = 0~100도)

// ── 간판 텍스트: "나눔온도" / "{온도}도" ─────────────────────────────
// 간판(Tower_Sign_Front/Back)은 흰색 판이고, 글자는 three.js에서 캔버스로 그려 앞면에 붙인다.
const SIGN_FONT = '"Pretendard","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
const SIGN_COLOR_1 = '#1f9f37';   // 나눔온도
const SIGN_COLOR_2 = '#00921b';   // ○○도
const signTexts = [];             // { ctx, tex, value }

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
  scene.add(mesh);

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
  const maxW = W * 0.78;
  // 윗줄
  fitFont(ctx, '나눔온도', maxW, H * 0.30);
  ctx.fillStyle = SIGN_COLOR_1;
  ctx.fillText('나눔온도', W / 2, H * 0.29);
  // 아랫줄 (숫자는 게이지와 연동)
  // '100도'를 가운데 정렬했을 때의 위치를 기준으로 '도'를 고정하고,
  // 숫자는 '도' 바로 왼쪽에 오른쪽 정렬해서 자릿수가 바뀌어도 '도'가 움직이지 않게 한다.
  fitFont(ctx, '100도', maxW, H * 0.34);       // 글자 크기는 '100도' 기준으로 고정
  const fullW = ctx.measureText('100도').width;
  const unitW = ctx.measureText('도').width;
  const unitX = W / 2 + fullW / 2 - unitW;     // '도' 왼쪽 끝 x (고정)
  const y2 = H * 0.68;
  ctx.fillStyle = SIGN_COLOR_2;
  ctx.textAlign = 'left';
  ctx.fillText('도', unitX, y2);
  ctx.textAlign = 'right';
  ctx.fillText(String(value), unitX, y2);
  item.tex.needsUpdate = true;
}
let targetTemp = 0.5, currentTemp = 0.5;

const loadingEl = document.getElementById('loading');
const pctEl = document.getElementById('pct');

new GLTFLoader().load(MODEL_URL, (gltf) => {
  const model = gltf.scene;
  scene.add(model);

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
  scene.add(groundShadow(Math.max(size.x, size.z) * 0.9));
  controls.target.set(center.x, center.y * 0.82, center.z);
  camera.position.set(center.x + r * 1.05, center.y + r * 0.2, center.z + r * 1.9);   // 정면(+Z)에서 비스듬히
  controls.minDistance = r * 0.6;
  controls.maxDistance = r * 3;
  controls.update();

  setTemp(Number(tempInput.value));
  currentTemp = targetTemp;
  // 웹폰트가 늦게 로드되는 경우를 대비해 폰트 준비 후 한 번 더 그림
  document.fonts?.ready.then(() => signTexts.forEach((t) => { t.value = null; }));
  loadingEl.remove();
}, (e) => {
  if (e.total) pctEl.textContent = Math.round(e.loaded / e.total * 100) + '%';
}, (err) => {
  console.error(err);
  loadingEl.classList.add('err');
  loadingEl.innerHTML = '모델을 불러오지 못했습니다.<br>파일을 직접 열지 말고 로컬 서버로 실행해 주세요.<br>(예: 이 폴더에서 <code>python -m http.server</code>)';
});

// UI
const tempInput = document.getElementById('temp');
const tempLabel = document.getElementById('tempLabel');
function setTemp(v){ targetTemp = v / 100; tempLabel.textContent = v.toFixed(1) + '°'; }
tempInput.addEventListener('input', () => setTemp(Number(tempInput.value)));

const rotateBtn = document.getElementById('rotateBtn');
rotateBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  rotateBtn.setAttribute('aria-pressed', String(controls.autoRotate));
  rotateBtn.textContent = controls.autoRotate ? '회전 멈춤' : '자동 회전';
});

// 크기 대응
function resize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 45 : 35;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// 루프
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const k = 1 - Math.exp(-dt * 6);

  currentTemp += (targetTemp - currentTemp) * k;
  if (Math.abs(targetTemp - currentTemp) < 0.0005) currentTemp = targetTemp;
  for (const g of gauges) g.scale.y = Math.max(currentTemp, 0.0001);
  const shown = Math.round(currentTemp * 100);
  for (const t of signTexts) drawSign(t, shown);

  controls.update();
  renderer.render(scene, camera);
});
