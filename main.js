import * as THREE from "three";

const canvas = document.querySelector("#planet-canvas");
const wrap = document.querySelector(".planet-wrap");

if (canvas && wrap) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 11.5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  scene.add(new THREE.AmbientLight(0xc5e8d5, 1.2));
  const keyLight = new THREE.DirectionalLight(0xfff1d5, 2.3);
  keyLight.position.set(-4, 5, 6);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x67f3c3, 55, 18);
  rimLight.position.set(4, -1, 4);
  scene.add(rimLight);

  const starPositions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i += 1) {
    const i3 = i * 3;
    const radius = 4 + Math.random() * 9;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    starPositions[i3] = radius * Math.sin(theta) * Math.cos(phi);
    starPositions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    starPositions[i3 + 2] = radius * Math.cos(theta);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xdaf2d4, size: 0.035, transparent: true, opacity: 0.8, sizeAttenuation: true }),
  );
  scene.add(stars);

  let width = 0;
  let height = 0;
  let frame = 0;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const bounds = wrap.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 520 ? 9.5 : 8;
    camera.updateProjectionMatrix();
  }

  function onPointerMove(event) {
    const bounds = wrap.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    wrap.style.setProperty("--bloom-tilt", `${x * 7}deg`);
    wrap.style.setProperty("--bloom-shift-x", `${x * 12}px`);
    wrap.style.setProperty("--bloom-shift-y", `${y * 10}px`);
  }

  function animate() {
    frame = requestAnimationFrame(animate);
    const time = performance.now() * 0.0003;
    if (!prefersReducedMotion) {
      stars.rotation.y = time * 0.08;
      stars.rotation.x = Math.sin(time) * 0.025;
    }
    renderer.render(scene, camera);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  wrap.addEventListener("pointermove", onPointerMove);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else animate();
  });

  resize();
  animate();
}
