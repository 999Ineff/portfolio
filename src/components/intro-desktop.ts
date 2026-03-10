/**
 * intro-desktop.ts — Ineffable Solutions
 * Phase 2, Track A, Session 2A-3
 *
 * Three.js + GSAP intro animation for desktop devices (1200px+, GPU tier 2+).
 * Dynamically imported by IntroAnimation.astro when device qualifies.
 *
 * API CONTRACT:
 *   initDesktopIntro({ container, onComplete, gsap }) → { timeline, cleanup }
 *
 * STORYBOARD (5.0s total):
 *   0.0s   Void. Three.js initialised. Camera (0,1.5,12), FOV 75.
 *   0.0–0.4s  Nebula fade-in (3,000 particles, two colour clusters).
 *   0.5s   Nebula fully visible, particles drifting.
 *   0.8s   Assembly particles spawn (800). Gold PointLight starts.
 *   1.0s   Assembly begins: uProgress 1→0 over 1.5s (power3.out).
 *   2.0s   Laptop fully assembled. Screen text "Initializing...".
 *   2.5s   Camera fly-through begins → (0,0.3,3.5), FOV→50, 2.0s.
 *   3.0s   Midpoint. Screen "Ready." (gold). Nebula fading.
 *   3.5s   IS monogram on CanvasTexture. Laptop chassis fading.
 *   4.5s   Screen 80% viewport. Laptop invisible.
 *   4.75s  Canvas opacity → 0.2. localStorage set.
 *   5.0s   Canvas opacity → 0. Full cleanup. onComplete().
 */

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  PointLight,
  Group,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  MeshBasicMaterial,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  AdditiveBlending,
  Points,
  CanvasTexture,
  Texture,
  Material,
  Vector3,
} from 'three';

// Namespace alias — keeps existing THREE.Foo references working without
// rewriting every call site. Tree-shaking still applies because named
// imports tell bundlers exactly what's needed.
const THREE = {
  WebGLRenderer, Scene, PerspectiveCamera, AmbientLight, PointLight,
  Group, BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments,
  MeshBasicMaterial, Mesh, BufferGeometry, BufferAttribute, ShaderMaterial,
  AdditiveBlending, Points, CanvasTexture, Texture, Material, Vector3,
};

// ── Design tokens (from design-tokens.css — replicated for use inside Three.js) ──
const TOKEN = {
  BG:        0x0a0a12,  // --bg-deep
  BG_CSS:    '#0a0a12',
  GOLD:      0xffc13b,  // --gold
  GOLD_CSS:  '#ffc13b',
  CYAN:      0x00e5ff,  // --cyan
  CYAN_CSS:  '#00e5ff',
  TEXT:      '#e8eaf0', // --text-primary
  ELEVATED:  '#1a1a28', // --bg-elevated (laptop chassis)
} as const;

// ── Nebula vertex shader ─────────────────────────────────────────────────────
const NEBULA_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec3 pos = position;
    // Gentle drift — multiplier kept small for the performance budget
    pos.x += sin(uTime * 0.15 + position.y * 2.0) * 0.3;
    pos.y += cos(uTime * 0.12 + position.x * 1.5) * 0.2;
    pos.z += sin(uTime * 0.10 + position.z * 3.0) * 0.15;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ── Nebula fragment shader ───────────────────────────────────────────────────
const NEBULA_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
    alpha *= uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ── Assembly vertex shader ───────────────────────────────────────────────────
const ASSEMBLY_VERT = /* glsl */ `
  uniform float uProgress;
  attribute vec3 aTarget;

  void main() {
    // position = scattered start, aTarget = final laptop position
    // uProgress 1.0 → 0.0 means particles converge toward aTarget
    vec3 pos = mix(aTarget, position, uProgress);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.5 * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ── Assembly fragment shader ─────────────────────────────────────────────────
const ASSEMBLY_FRAG = /* glsl */ `
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    // Warm gold-ish assembly particles
    gl_FragColor = vec4(0.9, 0.85, 0.5, alpha);
  }
`;

// ── Public API ───────────────────────────────────────────────────────────────

export function initDesktopIntro(config: {
  container: HTMLElement;
  onComplete: () => void;
  gsap: any;
}): {
  timeline: any;
  cleanup: () => void;
} {
  const { container, onComplete, gsap } = config;

  // Track resources for cleanup
  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const createdElements: HTMLElement[] = [];
  let animationId = 0;

  // ── Hide mobile content if present ────────────────────────────────────────
  const mobileContent = document.getElementById('intro-mobile-content');
  if (mobileContent) {
    mobileContent.style.display = 'none';
  }

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,          // CSS background shows through
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // fully transparent — CSS bg handles colour

  // Position canvas absolutely inside container (which is fixed, inset-0, z-9999)
  const canvas = renderer.domElement;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);

  // ── Scene ─────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.5, 12);

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
  scene.add(ambientLight);

  const goldLight = new THREE.PointLight(TOKEN.GOLD, 0, 8);
  goldLight.position.set(0.5, 0.5, 2);
  scene.add(goldLight);

  const cyanLight = new THREE.PointLight(TOKEN.CYAN, 0, 6);
  cyanLight.position.set(0, 0.2, 1.5);
  scene.add(cyanLight);

  // ── Nebula Particles (3,000) ──────────────────────────────────────────────
  const NEBULA_COUNT = 3000;

  const nebulaPositions = new Float32Array(NEBULA_COUNT * 3);
  const nebulaSizes     = new Float32Array(NEBULA_COUNT);
  const nebulaColors    = new Float32Array(NEBULA_COUNT * 3);

  // Colour cluster RGB values
  const cyanRGB  = { r: 0 / 255,   g: 229 / 255, b: 255 / 255 }; // #00e5ff
  const goldRGB  = { r: 255 / 255, g: 193 / 255, b: 59 / 255 };  // #ffc13b

  for (let i = 0; i < NEBULA_COUNT; i++) {
    const i3 = i * 3;
    const half = NEBULA_COUNT / 2;

    if (i < half) {
      // Cyan cluster near (-2, 1, -3)
      nebulaPositions[i3]     = -2 + (Math.random() - 0.5) * 8;
      nebulaPositions[i3 + 1] =  1 + (Math.random() - 0.5) * 6;
      nebulaPositions[i3 + 2] = -3 + (Math.random() - 0.5) * 6;
      // ±10% colour variation
      nebulaColors[i3]     = Math.min(1, cyanRGB.r + (Math.random() - 0.5) * 0.1);
      nebulaColors[i3 + 1] = Math.min(1, cyanRGB.g + (Math.random() - 0.5) * 0.1);
      nebulaColors[i3 + 2] = Math.min(1, cyanRGB.b + (Math.random() - 0.5) * 0.1);
    } else {
      // Gold cluster near (2, -0.5, -2)
      nebulaPositions[i3]     =  2 + (Math.random() - 0.5) * 8;
      nebulaPositions[i3 + 1] = -0.5 + (Math.random() - 0.5) * 6;
      nebulaPositions[i3 + 2] = -2 + (Math.random() - 0.5) * 6;
      nebulaColors[i3]     = Math.min(1, goldRGB.r + (Math.random() - 0.5) * 0.1);
      nebulaColors[i3 + 1] = Math.min(1, goldRGB.g + (Math.random() - 0.5) * 0.1);
      nebulaColors[i3 + 2] = Math.min(1, goldRGB.b + (Math.random() - 0.5) * 0.1);
    }

    nebulaSizes[i] = 2 + Math.random() * 6; // 2–8
  }

  const nebulaGeo = new THREE.BufferGeometry();
  nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
  nebulaGeo.setAttribute('aSize',    new THREE.BufferAttribute(nebulaSizes, 1));
  nebulaGeo.setAttribute('aColor',   new THREE.BufferAttribute(nebulaColors, 3));
  disposables.push(nebulaGeo);

  const nebulaUniforms = {
    uTime:    { value: 0 },
    uOpacity: { value: 0 },
  };

  const nebulaMat = new THREE.ShaderMaterial({
    uniforms:       nebulaUniforms,
    vertexShader:   NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    transparent:    true,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending,
    vertexColors:   false,
  });
  disposables.push(nebulaMat);

  const nebulaPoints = new THREE.Points(nebulaGeo, nebulaMat);
  scene.add(nebulaPoints);

  // ── CanvasTexture (Screen Content) ────────────────────────────────────────
  const SCREEN_W = 512;
  const SCREEN_H = 384;

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width  = SCREEN_W;
  screenCanvas.height = SCREEN_H;
  const sCtx = screenCanvas.getContext('2d')!;

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  disposables.push(screenTexture);

  // Helper: redraw the screen canvas with a given text + colour
  function drawScreenText(
    line1:  string,
    color1: string,
    line2?: string,
    color2?: string,
  ): void {
    sCtx.fillStyle = TOKEN.BG_CSS;
    sCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // Subtle scanline grid
    sCtx.strokeStyle = 'rgba(255,255,255,0.03)';
    sCtx.lineWidth = 1;
    for (let y = 0; y < SCREEN_H; y += 16) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(SCREEN_W, y);
      sCtx.stroke();
    }

    // IS monogram corner mark
    sCtx.fillStyle = TOKEN.GOLD_CSS;
    sCtx.font = 'bold 18px "JetBrains Mono", monospace';
    sCtx.textAlign = 'left';
    sCtx.fillText('IS', 18, 34);

    // Blinking cursor dot
    sCtx.fillStyle = TOKEN.CYAN_CSS;
    sCtx.beginPath();
    sCtx.arc(SCREEN_W - 18, 28, 5, 0, Math.PI * 2);
    sCtx.fill();

    // Main text line 1
    sCtx.font = '22px "JetBrains Mono", monospace';
    sCtx.textAlign = 'center';
    sCtx.fillStyle = color1;
    sCtx.fillText(line1, SCREEN_W / 2, SCREEN_H / 2 - (line2 ? 14 : 0));

    // Optional second line
    if (line2 && color2) {
      sCtx.fillStyle = color2;
      sCtx.font = '16px "JetBrains Mono", monospace';
      sCtx.fillText(line2, SCREEN_W / 2, SCREEN_H / 2 + 22);
    }

    screenTexture.needsUpdate = true;
  }

  // Draw the final IS monogram frame (used at t=3.5s)
  function drawMonogramFrame(): void {
    sCtx.fillStyle = TOKEN.BG_CSS;
    sCtx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // Gold "I" — large, centred
    sCtx.font = 'bold 96px "Cabinet Grotesk", system-ui, sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillStyle = TOKEN.GOLD_CSS;
    sCtx.shadowColor = 'rgba(255,193,59,0.6)';
    sCtx.shadowBlur = 24;
    sCtx.fillText('I', SCREEN_W / 2, SCREEN_H / 2 + 12);
    sCtx.shadowBlur = 0;

    // "Ineffable" subtitle
    sCtx.font = '22px "Satoshi", system-ui, sans-serif';
    sCtx.fillStyle = TOKEN.TEXT;
    sCtx.fillText('Ineffable', SCREEN_W / 2, SCREEN_H / 2 + 60);

    screenTexture.needsUpdate = true;
  }

  // Initial screen state
  drawScreenText('> _', TOKEN.CYAN_CSS);

  // ── Laptop Geometry ───────────────────────────────────────────────────────
  // All parts are grouped and the group is centred near origin.
  // Layout (y=0 is the table surface):
  //   Base plate from y=0 to y=0.08
  //   Screen lid: angled ~20° back from vertical, pivot at y=0.08, z=1.0

  const laptopGroup = new THREE.Group();
  scene.add(laptopGroup);

  const chassisMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a28,
    transparent: true,
    opacity: 1,
  });
  disposables.push(chassisMat);

  // Screen material (CanvasTexture)
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture,
    transparent: true,
    opacity: 1,
  });
  disposables.push(screenMat);

  // Edge highlight material (gold-tinted lines)
  const edgeMat = new THREE.LineBasicMaterial({
    color: TOKEN.GOLD,
    transparent: true,
    opacity: 0.5,
  });
  disposables.push(edgeMat);

  // ── Base plate (laptop bottom)
  const baseGeo = new THREE.BoxGeometry(3.0, 0.08, 2.0);
  disposables.push(baseGeo);
  const baseMesh = new THREE.Mesh(baseGeo, chassisMat);
  baseMesh.position.set(0, 0.04, 0);
  laptopGroup.add(baseMesh);

  // Wireframe edges on base
  const baseEdges = new THREE.EdgesGeometry(baseGeo);
  disposables.push(baseEdges);
  const baseWire = new THREE.LineSegments(baseEdges, edgeMat);
  baseWire.position.copy(baseMesh.position);
  laptopGroup.add(baseWire);

  // ── Keyboard surface (recessed slightly)
  const keyboardGeo = new THREE.BoxGeometry(2.6, 0.01, 1.6);
  disposables.push(keyboardGeo);
  const keyboardMesh = new THREE.Mesh(keyboardGeo, new THREE.MeshBasicMaterial({
    color: 0x141420,
  }));
  disposables.push(keyboardMesh.material as THREE.Material);
  keyboardMesh.position.set(0, 0.09, 0.1);
  laptopGroup.add(keyboardMesh);

  // ── Hinge bar
  const hingeGeo = new THREE.BoxGeometry(2.8, 0.06, 0.08);
  disposables.push(hingeGeo);
  const hingeMesh = new THREE.Mesh(hingeGeo, chassisMat);
  hingeMesh.position.set(0, 0.08, -0.96);
  laptopGroup.add(hingeMesh);

  // ── Lid (screen back panel) — angled 20° from vertical (~70° from horizontal)
  // Pivot is at the back edge of the base (z = -1.0, y = 0.08)
  // Lid face: 2.8 wide, 2.0 tall, 0.04 thick
  const LID_ANGLE_DEG = 70; // angle from horizontal
  const LID_ANGLE = (LID_ANGLE_DEG * Math.PI) / 180;
  const LID_H = 2.0;

  const lidGeo = new THREE.BoxGeometry(2.8, LID_H, 0.04);
  disposables.push(lidGeo);
  const lidMesh = new THREE.Mesh(lidGeo, chassisMat);

  // Rotate lid around X axis so it tilts back
  lidMesh.rotation.x = -(Math.PI / 2 - LID_ANGLE);
  // Position: pivot at hinge point — lid centre is half its height away from pivot
  lidMesh.position.set(
    0,
    0.08 + (LID_H / 2) * Math.sin(LID_ANGLE),
    -0.96 - (LID_H / 2) * Math.cos(LID_ANGLE),
  );
  laptopGroup.add(lidMesh);

  // Lid edge highlight
  const lidEdges = new THREE.EdgesGeometry(lidGeo);
  disposables.push(lidEdges);
  const lidWire = new THREE.LineSegments(lidEdges, edgeMat);
  lidWire.rotation.copy(lidMesh.rotation);
  lidWire.position.copy(lidMesh.position);
  laptopGroup.add(lidWire);

  // ── Screen panel (inset 0.05 from lid face — this has the CanvasTexture)
  const SCREEN_GEO_W = 2.55;
  const SCREEN_GEO_H = 1.7;
  const screenPanelGeo = new THREE.BoxGeometry(SCREEN_GEO_W, SCREEN_GEO_H, 0.01);
  disposables.push(screenPanelGeo);
  const screenPanelMesh = new THREE.Mesh(screenPanelGeo, screenMat);

  // Inherit lid's rotation, offset slightly in front of lid face
  screenPanelMesh.rotation.copy(lidMesh.rotation);
  const INSET = 0.04; // z offset toward camera from lid face
  screenPanelMesh.position.set(
    0,
    0.08 + (LID_H / 2) * Math.sin(LID_ANGLE) - 0.05,
    -0.96 - (LID_H / 2) * Math.cos(LID_ANGLE) + INSET,
  );
  laptopGroup.add(screenPanelMesh);

  // Record screen world position for camera lookAt target
  // (Computed once after object is added to scene, updated below)
  const screenCenter = new THREE.Vector3();
  screenPanelMesh.getWorldPosition(screenCenter);

  // Centre the laptop group so it sits at a natural view angle
  laptopGroup.position.set(0, -0.5, 0);

  // Recompute screen world position after group offset
  screenPanelMesh.getWorldPosition(screenCenter);

  // ── Assembly Particles (800) ──────────────────────────────────────────────
  const ASSEMBLY_COUNT = 800;

  // Scattered start positions (random sphere of radius 6)
  const assemblyStart  = new Float32Array(ASSEMBLY_COUNT * 3);
  // Target positions — sampled on the laptop geometry surfaces
  const assemblyTarget = new Float32Array(ASSEMBLY_COUNT * 3);

  // Pre-compute laptop surface sample points
  // We sample proportionally across four main surfaces:
  //   base plate: 30%, keyboard: 10%, lid: 40%, screen: 20%
  const SAMPLE_SURFACES = [
    { count: 240, cx: 0, cy: 0.04, cz: 0, hw: 1.5, hh: 0.04, hd: 1.0 },   // base
    { count:  80, cx: 0, cy: 0.09, cz: 0.1, hw: 1.3, hh: 0.01, hd: 0.8 }, // keyboard
    // Lid and screen use separate logic below (rotated)
  ];

  let sampleIdx = 0;

  // Flat surface sampler
  for (const surf of SAMPLE_SURFACES) {
    for (let k = 0; k < surf.count && sampleIdx < ASSEMBLY_COUNT; k++, sampleIdx++) {
      const i3 = sampleIdx * 3;
      assemblyTarget[i3]     = surf.cx + (Math.random() - 0.5) * surf.hw * 2;
      assemblyTarget[i3 + 1] = surf.cy + (Math.random() - 0.5) * surf.hh * 2;
      assemblyTarget[i3 + 2] = surf.cz + (Math.random() - 0.5) * surf.hd * 2;
    }
  }

  // Lid surface — rotated, must un-rotate back to local then world-transform
  const lidSampleCount = 320;
  for (let k = 0; k < lidSampleCount && sampleIdx < ASSEMBLY_COUNT; k++, sampleIdx++) {
    const i3 = sampleIdx * 3;
    const lu = (Math.random() - 0.5) * 2.8; // local u (width)
    const lv = (Math.random() - 0.5) * 2.0; // local v (height)
    // Apply lid rotation + position transform (mirrors lidMesh setup above)
    const worldX = lu;
    const worldY = lidMesh.position.y + lv * Math.sin(LID_ANGLE);
    const worldZ = lidMesh.position.z - lv * Math.cos(LID_ANGLE);
    // Account for laptopGroup offset
    assemblyTarget[i3]     = worldX;
    assemblyTarget[i3 + 1] = worldY + laptopGroup.position.y;
    assemblyTarget[i3 + 2] = worldZ + laptopGroup.position.z;
  }

  // Fill remaining with screen area
  while (sampleIdx < ASSEMBLY_COUNT) {
    const i3 = sampleIdx * 3;
    const su = (Math.random() - 0.5) * SCREEN_GEO_W;
    const sv = (Math.random() - 0.5) * SCREEN_GEO_H;
    assemblyTarget[i3]     = su;
    assemblyTarget[i3 + 1] = screenPanelMesh.position.y + sv * Math.sin(LID_ANGLE) + laptopGroup.position.y;
    assemblyTarget[i3 + 2] = screenPanelMesh.position.z - sv * Math.cos(LID_ANGLE) + laptopGroup.position.z;
    sampleIdx++;
  }

  // Scattered start positions
  for (let i = 0; i < ASSEMBLY_COUNT; i++) {
    const i3 = i * 3;
    // Random positions spread across a wide volume
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 3 + Math.random() * 4;
    assemblyStart[i3]     = r * Math.sin(phi) * Math.cos(theta);
    assemblyStart[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    assemblyStart[i3 + 2] = r * Math.cos(phi) - 2; // bias toward negative z
  }

  const assemblyGeo = new THREE.BufferGeometry();
  // 'position' holds the scattered start points
  assemblyGeo.setAttribute('position', new THREE.BufferAttribute(assemblyStart.slice(), 3));
  // 'aTarget' holds the laptop surface target points
  assemblyGeo.setAttribute('aTarget',  new THREE.BufferAttribute(assemblyTarget, 3));
  disposables.push(assemblyGeo);

  const assemblyUniforms = {
    uProgress: { value: 1.0 }, // starts scattered, animates to 0.0
  };

  const assemblyMat = new THREE.ShaderMaterial({
    uniforms:       assemblyUniforms,
    vertexShader:   ASSEMBLY_VERT,
    fragmentShader: ASSEMBLY_FRAG,
    transparent:    true,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending,
  });
  disposables.push(assemblyMat);

  const assemblyPoints = new THREE.Points(assemblyGeo, assemblyMat);
  assemblyPoints.visible = false; // hidden until t=0.8s
  scene.add(assemblyPoints);

  // ── Animation Loop ────────────────────────────────────────────────────────
  function animate(): void {
    animationId = requestAnimationFrame(animate);
    nebulaUniforms.uTime.value = performance.now() * 0.001;
    renderer.render(scene, camera);
  }
  animate();

  // ── Resize Handler ────────────────────────────────────────────────────────
  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // ── GSAP Master Timeline ──────────────────────────────────────────────────
  const tl = gsap.timeline({
    onComplete: () => {
      // Only call the config callback — IntroAnimation.astro's finishIntro()
      // handles setVisitedFlag + cleanup via currentCleanup(). Calling doCleanup
      // here too would double-dispose Three.js resources.
      onComplete();
    },
  });

  // ── t=0.0–0.4s: Nebula fade-in ───────────────────────────────────────────
  tl.to(nebulaUniforms.uOpacity, {
    value: 1,
    duration: 0.4,
    ease: 'power1.in',
  }, 0);

  // Ambient light intensity 0→0.3
  tl.to(ambientLight, {
    intensity: 0.3,
    duration: 0.5,
    ease: 'power1.in',
  }, 0);

  // ── t=0.8s: Assembly particles appear + gold light ramps ─────────────────
  tl.add(() => {
    assemblyPoints.visible = true;
    drawScreenText('Initializing...', TOKEN.CYAN_CSS);
  }, 0.8);

  tl.to(goldLight, {
    intensity: 0.8,
    duration: 0.8,
    ease: 'power2.out',
  }, 0.8);

  // ── t=1.0s: Assembly convergence (uProgress 1.0 → 0.0) ───────────────────
  tl.to(assemblyUniforms.uProgress, {
    value: 0,
    duration: 1.5,
    ease: 'power3.out',
  }, 1.0);

  // ── t=1.5s: Laptop meshes fade up as assembly converges ──────────────────
  // Chassis starts fully transparent, fades in as particles arrive
  gsap.set([baseMesh.material, lidMesh.material, hingeMesh.material], { opacity: 0 });
  tl.to([baseMesh.material, lidMesh.material, hingeMesh.material], {
    opacity: 1,
    duration: 1.0,
    ease: 'power2.out',
  }, 1.5);

  // Screen panel fades up too
  gsap.set(screenMat, { opacity: 0 });
  tl.to(screenMat, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, 1.7);

  // Cyan screen light on
  tl.to(cyanLight, {
    intensity: 0.4,
    duration: 0.6,
    ease: 'power2.out',
  }, 1.8);

  // ── t=2.0s: Screen text "Initializing..." (already set at 0.8s) ──────────
  // Edge glow pulses — animate edgeMat opacity up
  tl.to(edgeMat, {
    opacity: 0.85,
    duration: 0.6,
    ease: 'power2.out',
  }, 2.0);

  // ── t=2.5s: "Connecting..." + camera fly-through begins ──────────────────
  tl.add(() => {
    drawScreenText('Connecting...', TOKEN.TEXT);
  }, 2.5);

  // Camera position tween
  tl.to(camera.position, {
    x: 0,
    y: 0.3,
    z: 3.5,
    duration: 2.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.lookAt(screenCenter),
  }, 2.5);

  // FOV tween (simultaneous)
  tl.to(camera, {
    fov: 50,
    duration: 2.0,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix(),
  }, 2.5);

  // ── t=3.0s: Screen "Ready." (gold), nebula fading ────────────────────────
  tl.add(() => {
    drawScreenText('Ready.', TOKEN.GOLD_CSS);
  }, 3.0);

  // Nebula fades out
  tl.to(nebulaUniforms.uOpacity, {
    value: 0,
    duration: 1.2,
    ease: 'power2.in',
  }, 3.0);

  // ── t=3.5s: IS monogram on screen ────────────────────────────────────────
  tl.add(() => {
    drawMonogramFrame();
  }, 3.5);

  // Laptop chassis begins fading (power2.out)
  tl.to([
    baseMesh.material,
    lidMesh.material,
    hingeMesh.material,
    keyboardMesh.material,
    edgeMat,
  ], {
    opacity: 0,
    duration: 1.0,
    ease: 'power2.out',
  }, 3.5);

  // Assembly particles fade with chassis
  tl.to(assemblyMat, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
  }, 3.5);

  // Gold light dims
  tl.to(goldLight, {
    intensity: 0,
    duration: 0.8,
    ease: 'power2.out',
  }, 3.5);

  // ── t=4.5s: Canvas opacity → 0.2 (crossfade toward site) ─────────────────
  tl.to(canvas, {
    opacity: 0.2,
    duration: 0.25,
    ease: 'power1.inOut',
  }, 4.5);

  // ── t=4.75s: screen panel fully invisible ─────────────────────────────────
  tl.to(screenMat, {
    opacity: 0,
    duration: 0.2,
    ease: 'power1.inOut',
  }, 4.75);

  tl.to(cyanLight, {
    intensity: 0,
    duration: 0.25,
    ease: 'power1.inOut',
  }, 4.75);

  // ── t=5.0s: Canvas opacity → 0, cleanup fires via onComplete ──────────────
  tl.to(canvas, {
    opacity: 0,
    duration: 0.25,
    ease: 'power1.inOut',
  }, 5.0);

  // ── Cleanup function ──────────────────────────────────────────────────────
  function doCleanup(): void {
    // Stop animation loop
    cancelAnimationFrame(animationId);

    // Remove resize listener
    window.removeEventListener('resize', onResize);

    // Dispose all tracked geometries, materials, textures
    for (const d of disposables) {
      d.dispose();
    }

    // Traverse and dispose anything remaining in the scene
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.Points).isPoints) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      }
      if ((obj as THREE.LineSegments).isLineSegments) {
        const line = obj as THREE.LineSegments;
        if (line.geometry) line.geometry.dispose();
        if (line.material) (line.material as THREE.Material).dispose();
      }
    });

    // Dispose screen canvas texture
    screenTexture.dispose();

    // Dispose renderer context + remove from DOM
    renderer.dispose();
    renderer.domElement.remove();

    // Restore hidden mobile content if it was hidden
    if (mobileContent) {
      mobileContent.style.display = '';
    }

    // Remove any other elements created by this module
    for (const el of createdElements) {
      el.remove();
    }
  }

  return {
    timeline: tl,
    cleanup:  doCleanup,
  };
}
