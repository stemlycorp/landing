<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import NavBar from "$lib/components/NavBar.svelte";

  let canvasEl;
  let heroContainerEl;

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
    colors: ["#5ea0ff", "#7db9ff", "#b4d8ff"],
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

  const TREE_HIDE_BREAKPOINT = {
    width: 320,
    height: 360,
  };

  class Branch {
    constructor(x, y, angle, length, depth, seed) {
      this.x = x;
      this.y = y;
      this.angleBase = angle;
      this.length = length;
      this.depth = depth;
      this.seed = seed;
      this.progress = 0;
      this.children = null;
    }

    get angle() {
      const t = performance.now() / 1000;
      const sway =
        Math.sin(t * CONFIG.windFreq + this.seed) *
        CONFIG.windAmp *
        (1 - this.depth / CONFIG.maxDepth);
      return this.angleBase + sway;
    }

    get endX() {
      return this.x + Math.cos(this.angle) * this.length;
    }

    get endY() {
      return this.y - Math.sin(this.angle) * this.length;
    }

    update() {
      if (this.progress < 1) {
        this.progress = Math.min(1, this.progress + CONFIG.growthSpeed);
        return true;
      } else if (!this.children && this.depth < CONFIG.maxDepth) {
        this.children = [];
        const base = this.angleBase;
        const jitterL = (Math.random() - 0.5) * CONFIG.angleJitter;
        const jitterR = (Math.random() - 0.5) * CONFIG.angleJitter;
        const jitterLen = 1 + (Math.random() - 0.5) * CONFIG.lengthJitter * 2;
        const len = this.length * CONFIG.lengthDecay * jitterLen;
        this.children.push(
          new Branch(
            this.endX,
            this.endY,
            base - CONFIG.branchAngle + jitterL,
            len,
            this.depth + 1,
            this.seed * 1.3 + 1.1
          )
        );
        this.children.push(
          new Branch(
            this.endX,
            this.endY,
            base + CONFIG.branchAngle + jitterR,
            len,
            this.depth + 1,
            this.seed * 1.7 + 2.2
          )
        );
        return true;
      } else if (this.children) {
        let any = false;
        for (const c of this.children) any = c.update() || any;
        return any;
      }
      return false;
    }

    draw(ctx) {
      const endX = this.x + Math.cos(this.angle) * this.length * this.progress;
      const endY = this.y - Math.sin(this.angle) * this.length * this.progress;

      ctx.save();
      ctx.lineCap = "round";
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

      ctx.restore();

      if (this.children) {
        for (const c of this.children) c.draw(ctx);
      }
    }
  }

  const hexToRgb = (hex) => {
    const v = hex.replace("#", "");
    return {
      r: parseInt(v.substring(0, 2), 16),
      g: parseInt(v.substring(2, 4), 16),
      b: parseInt(v.substring(4, 6), 16),
    };
  };

  const lerpColor = (a, b, t) => {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const r = Math.round(ca.r + (cb.r - ca.r) * t);
    const g = Math.round(ca.g + (cb.g - ca.g) * t);
    const bl = Math.round(ca.b + (cb.b - ca.b) * t);
    return `rgb(${r},${g},${bl})`;
  };

  const colorByDepth = (depth, maxDepth) => {
    const t = depth / Math.max(1, maxDepth);
    const idx = Math.min(
      Math.floor(t * (CONFIG.colors.length - 1)),
      CONFIG.colors.length - 2
    );
    const localT = t * (CONFIG.colors.length - 1) - idx;
    const c1 = CONFIG.colors[idx];
    const c2 = CONFIG.colors[idx + 1];
    return lerpColor(c1, c2, localT);
  };

  function setupFractalTree(canvas, heroContainer) {
    if (typeof window === "undefined" || !canvas) return () => {};
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    let roots = [];
    let animationId = null;
    let treeHiddenForBreakpoint = false;
    let lastCanvasRect = null;
    let rootSeed = null;
    let resizeTimeout = null;
    let heroObserver;

    const drawGroundLine = (groundY) => {
      ctx.save();
      ctx.strokeStyle = "rgba(94,160,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 2);
      ctx.lineTo(canvas.clientWidth, groundY + 2);
      ctx.stroke();
      ctx.restore();
    };

    const applyResponsiveTuning = () => {
      CONFIG.growthSpeed = BASE_CONFIG.growthSpeed;
    };

    const enforceTreeVisibility = () => {
      const shouldHide =
        window.innerWidth <= TREE_HIDE_BREAKPOINT.width ||
        window.innerHeight <= TREE_HIDE_BREAKPOINT.height;
      treeHiddenForBreakpoint = shouldHide;
      canvas.classList.toggle("tree-hidden", shouldHide);
      if (shouldHide) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return shouldHide;
    };

    const resizeCanvas = () => {
      const target = heroContainer || canvas.parentElement || canvas;
      const rect = target.getBoundingClientRect();
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastCanvasRect = rect;
      return rect;
    };

    const initTree = (regenerateSeed = false) => {
      roots = [];
      const rect = lastCanvasRect || canvas.getBoundingClientRect();
      const cx = rect.width * 0.5;
      const footerMargin = Math.max(48, Math.min(96, rect.height * 0.12));
      const groundY = rect.height - footerMargin;

      const base = Math.min(rect.width, rect.height);
      const baseLen = 150;
      let responsiveScale = (base / 900) * 1.1;
      responsiveScale = Math.max(0.85, Math.min(1.35, responsiveScale));
      if (rect.width < 768) {
        responsiveScale *= 0.9;
      }
      const maxLen = rect.height * 0.65;
      const minLen = 110;
      const len = Math.min(maxLen, Math.max(minLen, baseLen * responsiveScale));

      if (regenerateSeed || rootSeed === null) {
        rootSeed = Math.random() * 10;
      }

      roots.push(new Branch(cx, groundY, Math.PI / 2, len, 0, rootSeed));
    };

    const clearWithTrail = () => {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(6,9,15,${CONFIG.backgroundFade})`;
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.restore();
    };

    const drawFrame = () => {
      clearWithTrail();
      const rect = lastCanvasRect || canvas.getBoundingClientRect();
      const groundY = rect.height - Math.max(48, Math.min(96, rect.height * 0.12));
      drawGroundLine(groundY);

      let any = false;
      for (const r of roots) {
        any = r.update() || any;
        r.draw(ctx);
      }

      if (any) {
        animationId = requestAnimationFrame(drawFrame);
      } else {
        animationId = null;
      }
    };

    const startTree = (regenerateSeed = false) => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (enforceTreeVisibility()) return;
      applyResponsiveTuning();
      initTree(regenerateSeed);
      animationId = requestAnimationFrame(drawFrame);
    };

    const scheduleResizeRedraw = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        startTree(false);
      }, 180);
    };

    const handleRegrow = () => {
      rootSeed = null;
      startTree(true);
    };

    const pointerEvent = window.PointerEvent ? "pointerdown" : "click";
    canvas.addEventListener(pointerEvent, handleRegrow);

    const handleResize = () => scheduleResizeRedraw();
    window.addEventListener("resize", handleResize);

    const handleLoad = () => {
      resizeCanvas();
      rootSeed = null;
      startTree(true);
    };
    window.addEventListener("load", handleLoad);
    handleLoad();

    if (typeof ResizeObserver !== "undefined" && heroContainer) {
      heroObserver = new ResizeObserver(() => {
        scheduleResizeRedraw();
      });
      heroObserver.observe(heroContainer);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleLoad);
      canvas.removeEventListener(pointerEvent, handleRegrow);
      if (heroObserver) heroObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }

  onMount(() => {
    const cleanupTree = setupFractalTree(canvasEl, heroContainerEl);

    return () => {
      cleanupTree();
    };
  });
</script>

<svelte:head>
  <title>Stemly - Engineering Meets Intelligence</title>
</svelte:head>

<header class="site-header" aria-label="Primary">
  <a class="logo" href="/">
    <span class="brand-letters">
      <span class="brand-stem">Stem</span><span class="brand-ly">ly</span>
    </span>
  </a>
  <NavBar lang="ko" active="home" path="/" />
</header>

<main class="hero" bind:this={heroContainerEl}>
  <canvas
    id="treeCanvas"
    aria-label="Fractal Tree Growth Animation"
    bind:this={canvasEl}
  ></canvas>
  <div class="overlay minimalist">
    <div class="hero-headlines">
      <h1>Engineering<br />Meets<br />Intelligence.</h1>
      <p>AI · Data · Software — built right.</p>
    </div>
    <div class="brand-tile" aria-hidden="true">
      <span class="brand-letters">
        <span class="brand-stem">Stem</span><span class="brand-ly">ly</span>
      </span>
      <span class="brand-caption">Adaptive Intelligence Works</span>
    </div>
  </div>
</main>
