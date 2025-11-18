/*
  Stemly — Fractal Tree Growth
  - Canvas-based recursive growth animation
  - Glowing lines, subtle wind sway, hex nodes at joints
  - Responsive & reduced-motion aware
*/

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const heroContainer = document.querySelector('.hero');

// ---------------- Config ----------------
const CONFIG = {
  maxDepth: 6,
  initialLength: 140,
  branchAngle: Math.PI / 4.8,
  lengthDecay: 0.72,
  angleJitter: 0.03,
  lengthJitter: 0.02,
  glow: 12,
  lineWidth: 2.4,
  backgroundFade: 0.08,
  colors: ['#5ea0ff', '#7db9ff', '#b4d8ff'],
  hexEvery: Infinity,
  windAmp: 0.0,
  windFreq: 0.0,
  growthSpeed: 0.06,
};
const BASE_CONFIG = {
  lineWidth: CONFIG.lineWidth,
  glow: CONFIG.glow,
  maxDepth: CONFIG.maxDepth,
  growthSpeed: CONFIG.growthSpeed,
};

function applyResponsiveTuning(){
  CONFIG.growthSpeed = BASE_CONFIG.growthSpeed;
}

// Utility random with seed per branch
function randRange(seed, min, max) {
  return min + (Math.sin(seed * 999) * 0.5 + 0.5) * (max - min);
}

// Compute color by depth (lerp across palette)
function colorByDepth(depth, maxDepth) {
  const t = depth / Math.max(1, maxDepth);
  const idx = Math.min(Math.floor(t * (CONFIG.colors.length - 1)), CONFIG.colors.length - 2);
  const localT = (t * (CONFIG.colors.length - 1)) - idx;
  const c1 = CONFIG.colors[idx];
  const c2 = CONFIG.colors[idx+1];
  return lerpColor(c1, c2, localT);
}

function lerpColor(a, b, t){
  const ca = hexToRgb(a), cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r},${g},${bl})`;
}
function hexToRgb(hex) {
  const v = hex.replace('#','');
  return {
    r: parseInt(v.substring(0,2),16),
    g: parseInt(v.substring(2,4),16),
    b: parseInt(v.substring(4,6),16),
  };
}

// ---------------- Branch Model ----------------
class Branch {
  constructor(x, y, angle, length, depth, seed) {
    this.x = x;
    this.y = y;
    this.angleBase = angle;
    this.length = length;
    this.depth = depth;
    this.seed = seed;
    this.progress = 0; // 0..1 drawn
    this.children = null;
  }

  get angle() {
    const t = performance.now() / 1000;
    const sway = Math.sin(t * CONFIG.windFreq + this.seed) * CONFIG.windAmp * (1 - this.depth / CONFIG.maxDepth);
    return this.angleBase + sway;
  }

  update() {
    if (this.progress < 1) {
      this.progress = Math.min(1, this.progress + CONFIG.growthSpeed);
      return true;
    } else if (!this.children && this.depth < CONFIG.maxDepth) {
      // spawn children
      this.children = [];
      const base = this.angleBase;
      const jitterL = (Math.random() - 0.5) * CONFIG.angleJitter;
      const jitterR = (Math.random() - 0.5) * CONFIG.angleJitter;
      const jitterLen = 1 + (Math.random() - 0.5) * CONFIG.lengthJitter * 2;
      const len = this.length * CONFIG.lengthDecay * jitterLen;
      this.children.push(new Branch(this.endX, this.endY, base - CONFIG.branchAngle + jitterL, len, this.depth + 1, this.seed * 1.3 + 1.1));
      this.children.push(new Branch(this.endX, this.endY, base + CONFIG.branchAngle + jitterR, len, this.depth + 1, this.seed * 1.7 + 2.2));
      return true;
    } else if (this.children) {
      // update children
      let any = false;
      for (const c of this.children) any = c.update() || any;
      return any;
    }
    return false;
  }

  get endX() {
    const a = this.angle;
    return this.x + Math.cos(a) * this.length;
  }
  get endY() {
    const a = this.angle;
    return this.y - Math.sin(a) * this.length;
  }

  draw(ctx) {
    const endX = this.x + Math.cos(this.angle) * this.length * this.progress;
    const endY = this.y - Math.sin(this.angle) * this.length * this.progress;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = CONFIG.lineWidth;
    const color = colorByDepth(this.depth, CONFIG.maxDepth);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = CONFIG.glow;
    ctx.globalAlpha = 0.9;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Hex node every Nth depth when fully grown
    // no terminal nodes for icon style

    ctx.restore();

    // draw children if exist
    if (this.children) {
      for (const c of this.children) c.draw(ctx);
    }
  }
}

function drawHex(){/* no-op for this style */}

// -------------- Scene Setup --------------
let roots = [];
let animationId = null;
let treeHiddenForBreakpoint = false;
let lastCanvasRect = null;
let rootSeed = null;
let resizeTimeout = null;

const TREE_HIDE_BREAKPOINT = {
  width: 320,
  height: 360,
};

function drawGroundLine(groundY){
  ctx.save();
  ctx.strokeStyle = 'rgba(94,160,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 2);
  ctx.lineTo(canvas.clientWidth, groundY + 2);
  ctx.stroke();
  ctx.restore();
}

function enforceTreeVisibility(){
  const shouldHide = window.innerWidth <= TREE_HIDE_BREAKPOINT.width || window.innerHeight <= TREE_HIDE_BREAKPOINT.height;
  treeHiddenForBreakpoint = shouldHide;
  canvas.classList.toggle('tree-hidden', shouldHide);
  if (shouldHide) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  return shouldHide;
}

function resizeCanvas(){
  const target = heroContainer || canvas.parentElement || canvas;
  const rect = target.getBoundingClientRect();
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lastCanvasRect = rect;
  return rect;
}

function initTree(regenerateSeed = false) {
  roots = [];
  const rect = lastCanvasRect || canvas.getBoundingClientRect();
  const cx = rect.width * 0.5;
  const footerMargin = 90;
  const groundY = rect.height - footerMargin;

  const base = Math.min(rect.width, rect.height);
  const baseLen = 150;
  let responsiveScale = (base / 900) * 1.18;
  responsiveScale = Math.max(0.9, Math.min(1.3, responsiveScale));
  if (rect.width < 768) {
    responsiveScale *= 0.9;
  }
  const len = baseLen * responsiveScale;

  if (regenerateSeed || rootSeed === null) {
    rootSeed = Math.random()*10;
  }

  roots.push(new Branch(cx, groundY, Math.PI / 2, len, 0, rootSeed));
}

function clearWithTrail(){
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(6,9,15,${CONFIG.backgroundFade})`;
  ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);
  ctx.restore();
}

function drawFrame(){
  clearWithTrail();
  const rect = lastCanvasRect || canvas.getBoundingClientRect();
  const groundY = rect.height - 90;
  drawGroundLine(groundY);

  let any = false;
  for (const r of roots){
    any = r.update() || any;
    r.draw(ctx);
  }

  if (any) {
    animationId = requestAnimationFrame(drawFrame);
  } else {
    animationId = null;
  }
}

function startTree(regenerateSeed = false){
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (enforceTreeVisibility()) return;
  applyResponsiveTuning();
  initTree(regenerateSeed);
  animationId = requestAnimationFrame(drawFrame);
}

function scheduleResizeRedraw(){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
    startTree(false);
  }, 180);
}

window.addEventListener('resize', scheduleResizeRedraw);

if (typeof ResizeObserver !== 'undefined' && heroContainer) {
  const heroObserver = new ResizeObserver(() => {
    scheduleResizeRedraw();
  });
  heroObserver.observe(heroContainer);
}

const handleRegrow = () => {
  rootSeed = null;
  startTree(true);
};
if (window.PointerEvent) {
  canvas.addEventListener('pointerdown', handleRegrow);
} else {
  canvas.addEventListener('click', handleRegrow);
}

window.addEventListener('load', () => {
  resizeCanvas();
  rootSeed = null;
  startTree(true);
});
