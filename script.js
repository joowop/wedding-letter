/* =========================================================
   Wedding Invitation — script.js
   서주완 ♡ 최윤경 (2027.04.17)
   Vanilla JS only. Implements motion-spec.md Must/Should items.
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------
  // PLACEHOLDERS — 실제 운영 시 아래 값을 채워주세요.
  // ---------------------------------------------------------
  const KAKAO_JS_KEY     = 'bdddda1a3673fb88f27bbcb1266f855e'; // 카카오 JavaScript 키 (공개 값, 등록된 도메인에서만 동작)
  const SHARE_URL        = location.origin + location.pathname;   // 쿼리·해시를 뺀 청첩장 주소
  const SHARE_TITLE      = '서주완 ♡ 최윤경 결혼합니다';
  const SHARE_DESC       = '2027년 4월 17일 토요일 오전 11시\n파티움하우스 수원 2층 그레이스켈리홀';
  const SHARE_IMAGE      = location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'images/og-thumbnail.png';
  const TARGET_DATE_STR  = '2027-04-17';
  const TARGET_HOUR      = 11;

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced     = () => reducedMotion.matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const haptic = (n) => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };

  // ---------------------------------------------------------
  // 1. HERO entrance step-in
  // ---------------------------------------------------------
  function setupHero() {
    const hero = $('.hero');
    if (!hero) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('is-loaded'));
    });

    // 스크롤 시 스크롤 인디케이터 fadeOut 300ms (motion §2-1 step 7)
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        hero.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------------------------------------------------------
  // 2. IntersectionObserver fade reveal
  // ---------------------------------------------------------
  function setupReveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;

    // 공통 섹션(2-6): 헤더 → 본문 stagger 80ms. 코너 장식은 제외.
    $$('.venue, .account, .guestbook, .share').forEach(sec => {
      sec.classList.add('reveal-stagger');
      let i = 0;
      Array.from(sec.children).forEach(child => {
        if (child.classList.contains('corner-deco')) return;
        child.classList.add('stagger-item');
        child.style.setProperty('--stagger-i', String(i++));
      });
    });

    if (isReduced()) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));

    // 갤러리 첫 슬라이드 blur reveal
    const firstSlide = $('.gallery-slide:first-child');
    if (firstSlide) firstSlide.classList.add('first-reveal');
  }

  // ---------------------------------------------------------
  // 3. 개나리 꽃잎 파티클 (motion §1-A)
  //    꽃잎 낱장 70% / 네 갈래 꽃 20% / 연두 잎 10%, dt 기반 적분,
  //    좌우 살랑임 + 뒤집힘 + 8~15s 봄바람 돌풍, 개수·DPR 강등, 탭 숨김·lightbox 시 정지
  // ---------------------------------------------------------
  const petalsAPI = { pause() {}, resume() {} };

  function setupPetals() {
    if (isReduced()) return;                       // §1-A-6: canvas 루프 미생성 (정적 장식은 CSS가 표시)
    const canvas = $('.bg-petals');
    const staticDeco = $('.bg-petals-static');
    if (!canvas || !window.Path2D) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- 파라미터 (§1-A-4 CFG 그대로) ---
    const CFG = {
      mix: { petal: 0.70, flower: 0.20, leaf: 0.10 },
      colors: {
        petal: [['#F2C230', .5], ['#F7D561', .3], ['#E8B21E', .2]],
        leaf:  [['#B4C77A', .7], ['#C5D48F', .3]],
      },
      size:    { petal: [10, 18], flower: [14, 22], leaf: [10, 16] },
      alpha:   { petal: [.35, .70], flower: [.40, .70], leaf: [.35, .55] },
      passSec: [25, 15],                            // z=0 → 25s, z=1 → 15s
      swayAmp: { petal: [20, 50], flower: [20, 40], leaf: [20, 50] },
      swayPer: { petal: [3, 6],   flower: [4, 6],   leaf: [3, 5] },
      lean:    { petal: .35, flower: .15, leaf: .30 },
      spin:    { petal: [.3, .9], flower: [.1, .4], leaf: [.2, .6] },
      flip:    { petal: [1.6, 3.2], flower: [.8, 1.6], leaf: [1.2, 2.4] },
      sens:    { petal: [.7, 1], flower: [.6, .9], leaf: [.7, 1] },
      windBase: 10,
      gust: { gap: [8, 15], first: [4, 7], dur: [2, 3], peak: 45, spin: .8, flip: .6, fall: .15 },
      margin: 40,
    };
    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;
    const pick = list => { let r = Math.random(); for (const [v, w] of list) { if ((r -= w) <= 0) return v; } return list[0][0]; };

    // --- 형태: 단위 Path2D 1회 생성 후 캐시 (§1-A-3) ---
    function petalPath(L) {                        // base (0, +L/2) → tip (0, -L/2)
      const hw = 0.22 * L, p = new Path2D();
      p.moveTo(0, 0.5 * L);
      p.bezierCurveTo( 1.3 * hw,  0.25 * L,  1.2 * hw, -0.30 * L,  0.25 * hw, -0.48 * L);
      p.quadraticCurveTo(0, -0.54 * L, -0.25 * hw, -0.48 * L);
      p.bezierCurveTo(-1.2 * hw, -0.30 * L, -1.3 * hw,  0.25 * L,  0,         0.5 * L);
      p.closePath();
      return p;
    }
    const UNIT_PETAL = petalPath(1);
    const UNIT_FLOWER_PETAL = petalPath(0.5);
    const FLOWER_ANGLES = [0, 92, 178, 272].map(d => d * Math.PI / 180);
    const UNIT_LEAF = (() => {
      const hw = 0.28, p = new Path2D();
      p.moveTo(0, -0.5);
      p.quadraticCurveTo( 2 * hw, 0, 0, 0.5);
      p.quadraticCurveTo(-2 * hw, 0, 0, -0.5);
      p.closePath();
      return p;
    })();
    const UNIT_VEIN = (() => {                     // (Nice) 중앙 잎맥
      const p = new Path2D();
      p.moveTo(0, 0.45);
      p.lineTo(0, -0.2);
      return p;
    })();

    function drawFlower(petalColor, centerColor) { // ctx는 이미 translate/rotate/scale(D) 상태
      ctx.fillStyle = petalColor;
      for (const a of FLOWER_ANGLES) {
        ctx.save();
        ctx.rotate(a);
        ctx.translate(0, -0.25);
        ctx.fill(UNIT_FLOWER_PETAL);
        ctx.restore();
      }
      ctx.fillStyle = centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 바람 (전역 1개 상태, 시뮬레이션 시계 기준 → 일시정지 후에도 돌풍 타이밍 유지) ---
    const wind = { env: 0, gustStart: 0, gustDur: 0, nextGust: 0 };
    let simT = 0;
    function updateWind(t) {
      if (!wind.nextGust) wind.nextGust = t + rand(...CFG.gust.first);
      if (!wind.gustDur && t >= wind.nextGust) { wind.gustStart = t; wind.gustDur = rand(...CFG.gust.dur); }
      if (wind.gustDur) {
        const u = (t - wind.gustStart) / wind.gustDur;
        if (u >= 1) { wind.env = 0; wind.gustDur = 0; wind.nextGust = t + rand(...CFG.gust.gap); }
        else wind.env = 0.5 - 0.5 * Math.cos(2 * Math.PI * u);
      }
    }

    class Particle {
      constructor(W, H, init) { this.reset(W, H, init); }
      reset(W, H, init) {
        const r = Math.random();
        this.type = r < CFG.mix.petal ? 'petal' : r < CFG.mix.petal + CFG.mix.flower ? 'flower' : 'leaf';
        const t = this.type, z = Math.random();
        this.color  = t === 'leaf' ? pick(CFG.colors.leaf) : pick(CFG.colors.petal);
        this.center = this.color === '#E8B21E' ? '#F7D561' : '#E8B21E';   // flower 중심점
        this.vein   = this.color === '#E8B21E' ? '#F2C230' : '#E8B21E';   // petal 잎맥
        this.size   = lerp(...CFG.size[t], z);
        this.alpha  = lerp(...CFG.alpha[t], z);
        this.fall   = (H + 2 * CFG.margin) / lerp(...CFG.passSec, z);    // px/s
        this.amp    = rand(...CFG.swayAmp[t]);
        this.per    = rand(...CFG.swayPer[t]);
        this.phase  = Math.random() * Math.PI * 2;
        this.spin   = rand(...CFG.spin[t]) * (Math.random() < .5 ? -1 : 1);
        this.flipV  = rand(...CFG.flip[t]);
        this.flipPh = Math.random() * Math.PI * 2;
        this.sens   = lerp(...CFG.sens[t], z);
        this.rot    = Math.random() * Math.PI * 2;
        this.x0     = init ? Math.random() * W : rand(-0.15 * W, W);           // 바람 상류 바이어스
        this.y      = init ? rand(-CFG.margin, H) : -CFG.margin - Math.random() * 60;
        this.drift  = 0;
        this.swayT  = Math.random() * this.per;
        this.x = this.x0; this.lean = 0;
      }
      step(dt, W, H) {
        const e = wind.env, g = CFG.gust;
        this.y      += this.fall * (1 - g.fall * e) * dt;
        this.drift  += (CFG.windBase + g.peak * e) * this.sens * dt;
        this.swayT  += dt;
        this.rot    += this.spin  * (1 + g.spin * e) * dt;
        this.flipPh += this.flipV * (1 + g.flip * e) * dt;
        const arg = (2 * Math.PI * this.swayT) / this.per + this.phase;
        this.x    = this.x0 + this.drift + Math.sin(arg) * this.amp;
        this.lean = Math.cos(arg) * CFG.lean[this.type];
        const m = CFG.margin;
        if (this.x > W + m) this.x0 -= W + 2 * m;           // 좌우 랩어라운드
        else if (this.x < -m) this.x0 += W + 2 * m;
        if (this.y > H + m) this.reset(W, H, false);
      }
      draw() {
        const c = Math.cos(this.flipPh);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot + this.lean);
        if (this.type === 'flower') {
          ctx.scale(this.size, this.size * (0.6 + 0.4 * Math.abs(c)));   // 기울어짐만
          ctx.globalAlpha = this.alpha;
          drawFlower(this.color, this.center);
        } else {
          const sx = Math.abs(c) < 0.15 ? (c < 0 ? -0.15 : 0.15) : c;     // 완전 소멸(깜빡임) 방지
          ctx.scale(this.size * sx, this.size);
          ctx.globalAlpha = this.alpha * (c < 0 ? 0.8 : 1);               // 뒷면은 살짝 옅게
          ctx.fillStyle = this.color;
          ctx.fill(this.type === 'leaf' ? UNIT_LEAF : UNIT_PETAL);
          if (this.type === 'petal' && this.size >= 14) {                 // (Nice) 잎맥 0.6px
            ctx.globalAlpha *= 0.5;
            ctx.strokeStyle = this.vein;
            ctx.lineWidth = 0.6 / (this.size * Math.abs(sx));
            ctx.stroke(UNIT_VEIN);
          }
        }
        ctx.restore();
      }
    }

    // --- 개수·DPR (§1-A-2 개수 결정) ---
    const conn = navigator.connection || {};
    const lowEnd = (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
                   (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2) ||
                   !!conn.saveData;
    let degrade = 0;                                 // 0: 정상, 1: FPS 강등 1단계, 2: OFF
    let W = 0, H = 0, maxH = 0;
    let particles = [];

    function baseCount(w) { return w < 360 ? 12 : w < 480 ? 16 : w < 1024 ? 18 : 20; }
    function targetCount() {
      let c = baseCount(W);
      if (lowEnd) c = Math.min(c, 12);
      if (degrade >= 1) c = Math.max(8, Math.round(c * 0.6));
      return c;
    }
    function sizeCanvas() {
      const cap = degrade >= 1 ? 1 : (lowEnd ? 1.5 : 2);
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';             // 지금까지 본 최대 innerHeight (주소창 변화 대응)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawnAll() {
      particles = Array.from({ length: targetCount() }, () => new Particle(W, H, true));
    }

    // --- FPS 측정 (로드 후 5s 창, 강등은 되돌리지 않음) ---
    let fpsStart = 0, fpsFrames = 0, fpsDone = false, fpsPrev = 0;
    function measureFps(now) {
      if (fpsDone) return;
      // 한 프레임 간격이 250ms 를 넘으면 기기 성능이 아니라 브라우저 스로틀링(백그라운드/가려진 창)으로 보고 창을 다시 시작
      const gap = fpsPrev ? now - fpsPrev : 0;
      fpsPrev = now;
      if (gap > 250) { fpsStart = 0; }
      if (!fpsStart) { fpsStart = now; fpsFrames = 0; return; }
      fpsFrames++;
      const elapsed = now - fpsStart;
      if (elapsed < 5000) return;
      const fps = (fpsFrames * 1000) / elapsed;
      fpsStart = 0;
      // 기준을 명세(50/40fps)보다 낮춤: iOS 저전력 모드 등 30fps 로 고정되는 정상 기기에서
      // 꽃잎이 꺼지지 않게 하기 위함. 30fps 고정 기기는 그대로 유지, 실제로 느린 기기만 강등.
      if (degrade === 0 && fps < 28) {
        degrade = 1;                                 // count ×0.6 (최소 8) + DPR 1, 재측정
        sizeCanvas();
        particles.length = Math.min(particles.length, targetCount());
      } else if (degrade === 1 && fps < 18) {
        disable();                                   // canvas OFF + 정적 장식
      } else {
        fpsDone = true;
      }
    }
    function disable() {
      degrade = 2;
      fpsDone = true;
      stop();
      canvas.style.display = 'none';
      if (staticDeco) staticDeco.classList.add('is-forced');
    }

    // --- 루프 (dt 기반, 최대 50ms 클램프) ---
    let rafId = 0, last = 0, running = false;
    const pausedBy = new Set();
    function loop(nowMs) {
      const dt = Math.min(0.05, (nowMs - (last || nowMs)) / 1000);
      last = nowMs;
      simT += dt;
      updateWind(simT);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) { particles[i].step(dt, W, H); particles[i].draw(); }
      measureFps(nowMs);
      if (running) rafId = requestAnimationFrame(loop);
    }
    function start() {
      if (running || degrade >= 2 || pausedBy.size) return;
      running = true;
      last = 0;
      fpsStart = 0; fpsPrev = 0;                     // FPS 측정 창 리셋
      rafId = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }
    petalsAPI.pause  = (reason) => { pausedBy.add(reason); stop(); };
    petalsAPI.resume = (reason) => { pausedBy.delete(reason); start(); };

    // --- resize: 폭이 바뀐 경우에만 재할당 (150ms debounce) ---
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (degrade >= 2) return;
        const w = window.innerWidth, h = window.innerHeight;
        if (w !== W) {
          W = w; maxH = h; H = maxH;
          sizeCanvas();
          spawnAll();
        } else if (h > maxH) {                       // 더 큰 높이만 반영 (파티클 유지)
          maxH = h; H = maxH;
          sizeCanvas();
        }
      }, 150);
    }, { passive: true });

    // --- 탭 비활성 시 정지 ---
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') petalsAPI.pause('hidden');
      else petalsAPI.resume('hidden');
    });

    W = window.innerWidth;
    maxH = H = window.innerHeight;
    sizeCanvas();
    spawnAll();
    if (document.visibilityState === 'hidden') pausedBy.add('hidden');
    start();
  }

  // ---------------------------------------------------------
  // 4. Calendar render + D-day count-up (motion §3-1)
  // ---------------------------------------------------------
  function setupCalendar() {
    const tbl = $('.cal');
    if (!tbl) return;
    const target = new Date(TARGET_DATE_STR + 'T00:00:00');
    const y = target.getFullYear();
    const m = target.getMonth();
    const first = new Date(y, m, 1).getDay();
    const last  = new Date(y, m + 1, 0).getDate();
    const tbody = tbl.querySelector('tbody');

    let html = '<tr>';
    for (let i = 0; i < first; i++) html += '<td></td>';
    for (let d = 1; d <= last; d++) {
      const dow = (first + d - 1) % 7;
      const cls = [];
      if (d === target.getDate()) cls.push('today');
      if (dow === 0) cls.push('sun');
      if (dow === 6) cls.push('sat');
      html += `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}><span>${d}</span></td>`;
      if ((first + d) % 7 === 0 && d !== last) html += '</tr><tr>';
    }
    html += '</tr>';
    tbody.innerHTML = html;

    // D-day 계산: 자정 → 자정 기준으로 정수 일수만 비교 (시각 무관)
    const ddayNum = $('#dday-num');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(y, m, target.getDate(), 0, 0, 0);
    const diff = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    const ddayLabel = $('.dday-label');
    const ddayBlock = $('.dday');

    if (diff > 0) {
      ddayNum.dataset.target = String(diff);
      ddayNum.textContent = isReduced() ? String(diff) : '0';
    } else if (diff === 0) {
      ddayBlock.innerHTML = '<span class="script" style="font-size:24px;color:var(--color-accent)">오늘</span><br><span style="font-size:14px;color:var(--color-muted)">저희 두 사람의 약속이 시작됩니다</span>';
      if (ddayLabel) ddayLabel.style.display = 'none';
    } else {
      ddayNum.dataset.target = String(-diff);
      ddayNum.textContent = isReduced() ? String(-diff) : '0';
      if (ddayLabel) ddayLabel.textContent = `함께 걸어가는 날 +`;
      ddayBlock.firstChild.textContent = 'D + ';
    }

    // count-up 애니메이션
    if (!isReduced() && diff !== 0) {
      const onIntersect = (entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          countUp(ddayNum, parseInt(ddayNum.dataset.target, 10), 1200);
          obs.disconnect();
        });
      };
      new IntersectionObserver(onIntersect, { threshold: 0.4 })
        .observe($('#calendar'));
    }
  }

  function countUp(el, target, dur) {
    const start = performance.now();
    const live = el.closest('[aria-live]');
    if (live) live.setAttribute('aria-busy', 'true');  // 카운트 중간 값은 스크린리더에 읽히지 않게
    function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) { requestAnimationFrame(tick); return; }
      if (live) live.setAttribute('aria-busy', 'false');
      // (Nice) 카운트업 종료 직후 flip 1회 — 400ms --ease-emphasized
      if (el.animate && !isReduced()) {
        el.animate([
          { transform: 'perspective(400px) rotateX(70deg)', opacity: 0.4 },
          { transform: 'perspective(400px) rotateX(0deg)',  opacity: 1 }
        ], { duration: 400, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
      }
    }
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------
  // 5. Gallery: swipe + nav + dots + auto-play (motion §3-2)
  // ---------------------------------------------------------
  let galleryAPI = null;
  function setupGallery() {
    const stage = $('.gallery-stage');
    const track = $('#gallery-track');
    if (!stage || !track) return;
    const slides = $$('.gallery-slide', track);
    const N = slides.length;
    // 점 인디케이터·카운터는 DOM 의 슬라이드 수 기준으로 생성
    const dotsWrap = $('#gallery-dots');
    if (dotsWrap) dotsWrap.innerHTML = '<li></li>'.repeat(N);
    const dots   = $$('#gallery-dots li');
    const curEl  = $('#gallery-cur');
    const totEl  = $('#gallery-total');
    if (totEl) totEl.textContent = String(N);
    const prev   = $('.gallery-prev');
    const next   = $('.gallery-next');
    let idx = 0;
    let auto = null;
    let dragX = 0;
    let dragStartX = 0;
    let dragging = false;
    let inViewport = false;
    let userPaused = false;

    function show(i, withTransition = true) {
      idx = ((i % N) + N) % N;
      track.style.transition = withTransition ? '' : 'none';
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === idx));
      if (curEl) curEl.textContent = String(idx + 1);
      slides.forEach((s, k) => {
        s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
      });
    }
    function startAuto() {
      if (isReduced() || userPaused || !inViewport) return;
      stopAuto();
      auto = setInterval(() => show(idx + 1), 5000);
    }
    function stopAuto() {
      if (auto) { clearInterval(auto); auto = null; }
    }
    function pauseUser(durationMs = 10000) {
      userPaused = true;
      stopAuto();
      clearTimeout(pauseUser._t);
      pauseUser._t = setTimeout(() => { userPaused = false; startAuto(); }, durationMs);
    }

    // Touch events
    track.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragX = 0;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      dragX = e.touches[0].clientX - dragStartX;
      const w = stage.clientWidth || 1;
      track.style.transform = `translateX(calc(-${idx * 100}% + ${dragX}px))`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      const threshold = 50;
      if (dragX > threshold) { show(idx - 1); haptic(8); }
      else if (dragX < -threshold) { show(idx + 1); haptic(8); }
      else { show(idx); }
      pauseUser(10000);
    });

    // Click navigation
    prev?.addEventListener('click', () => { show(idx - 1); haptic(8); pauseUser(10000); });
    next?.addEventListener('click', () => { show(idx + 1); haptic(8); pauseUser(10000); });

    // Click slide → lightbox
    slides.forEach((slide, i) => {
      const img = $('img', slide);
      img?.addEventListener('click', () => {
        if (Math.abs(dragX) > 5) return; // 스와이프 후 클릭 무시
        openLightbox(i);
      });
    });

    // Keyboard
    stage.tabIndex = 0;
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { show(idx - 1); haptic(8); pauseUser(10000); }
      if (e.key === 'ArrowRight') { show(idx + 1); haptic(8); pauseUser(10000); }
    });

    // Auto-play viewport gating
    new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (inViewport) startAuto(); else stopAuto();
    }, { threshold: 0.4 }).observe(stage);

    show(0);
    galleryAPI = { show, count: N };
  }

  // ---------------------------------------------------------
  // 6. Lightbox + pinch zoom + double-tap (motion §3-5)
  // ---------------------------------------------------------
  let lightboxAPI = null;
  function setupLightbox() {
    const lb = $('#lightbox');
    const img = $('#lightbox-img');
    const close = $('#lightbox-close');
    if (!lb || !img || !close) return;

    const slides = $$('.gallery-slide img');
    let scale = 1;
    let originX = 0, originY = 0;
    let lastDist = 0;
    let lastTap = 0;
    let panStart = null;
    let prevFocus = null;
    let currentIdx = 0;
    let single = false;   // true: 약도 등 단독 이미지 (갤러리 순번·좌우 이동과 분리)

    function setTransform() {
      img.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    }
    function reset() {
      scale = 1; originX = 0; originY = 0;
      img.style.transform = '';
    }

    function open(i) {
      single = false;
      currentIdx = i;
      show(slides[i].src, slides[i].alt, '사진 확대 보기');
    }
    function openSingle(src, alt, label) {
      single = true;
      show(src, alt, label || '이미지 확대 보기');
    }
    function show(src, alt, label) {
      reset();
      img.src = src;
      img.alt = alt || '';
      lb.setAttribute('aria-label', label);
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      prevFocus = document.activeElement;
      close.focus();
      haptic(25);
      petalsAPI.pause('lightbox');                  // §1-A-5: 모달 뒤 캔버스 연산 정지
    }
    function closeFn() {
      if (lb.hidden) return;
      lb.classList.remove('is-open');
      haptic(15);
      setTimeout(() => {
        lb.hidden = true;
        reset();
        document.body.style.overflow = '';
        if (prevFocus && prevFocus.focus) prevFocus.focus();
        petalsAPI.resume('lightbox');
      }, isReduced() ? 0 : 220);
    }
    function showIdx(i) {
      currentIdx = i;
      img.src = slides[currentIdx].src;
      img.alt = slides[currentIdx].alt || '';
      reset();
      galleryAPI.show(currentIdx);
    }

    close.addEventListener('click', closeFn);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeFn(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeFn();
      if (e.key === 'Tab') { e.preventDefault(); close.focus(); }   // 포커스 트랩 (모달 내 포커스 가능 요소는 닫기 버튼 1개)
      if (single) return;
      if (e.key === 'ArrowLeft' && galleryAPI) showIdx((currentIdx - 1 + galleryAPI.count) % galleryAPI.count);
      if (e.key === 'ArrowRight' && galleryAPI) showIdx((currentIdx + 1) % galleryAPI.count);
    });

    // 위→아래 swipe 100px 로 닫기 (확대하지 않은 상태에서만)
    let swipeStartY = null, swipeDY = 0;

    // Pinch / double-tap zoom
    img.addEventListener('touchstart', (e) => {
      lb.classList.add('is-zooming');
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      } else if (e.touches.length === 1) {
        const now = Date.now();
        swipeStartY = scale <= 1.05 ? e.touches[0].clientY : null;
        swipeDY = 0;
        if (now - lastTap < 300) {
          swipeStartY = null;
          scale = scale > 1.05 ? 1 : 2.5;
          originX = 0; originY = 0;
          lb.classList.remove('is-zooming'); // smooth transition
          setTransform();
          haptic(10);
        } else {
          if (scale > 1) {
            panStart = { x: e.touches[0].clientX - originX, y: e.touches[0].clientY - originY };
          }
        }
        lastTap = now;
      }
    }, { passive: true });

    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        if (lastDist > 0) {
          scale = clamp(scale * (d / lastDist), 1, 3);
          setTransform();
        }
        lastDist = d;
      } else if (e.touches.length === 1 && panStart && scale > 1) {
        originX = e.touches[0].clientX - panStart.x;
        originY = e.touches[0].clientY - panStart.y;
        setTransform();
      } else if (e.touches.length === 1 && swipeStartY !== null) {
        swipeDY = Math.max(0, e.touches[0].clientY - swipeStartY);
        img.style.transform = `translateY(${swipeDY}px)`;
      }
    }, { passive: true });

    img.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        if (swipeStartY !== null && swipeDY > 100) {
          swipeStartY = null; swipeDY = 0;
          lb.classList.remove('is-zooming');
          closeFn();
          return;
        }
        swipeStartY = null; swipeDY = 0;
        lastDist = 0;
        panStart = null;
        if (scale < 1.05) reset();
        lb.classList.remove('is-zooming');
      }
    });

    lightboxAPI = { open, openSingle };
    window.openLightbox = open; // 갤러리에서 호출

    // 약도: 탭/Enter/Space → 단독 lightbox (핀치 줌·더블탭은 위 로직 공유)
    const mapCard = $('#venue-map');
    const mapImg = mapCard && $('img', mapCard);
    if (mapCard && mapImg) {
      const openMap = () => openSingle(mapImg.currentSrc || mapImg.src, mapImg.alt, '약도 확대 보기');
      mapCard.addEventListener('click', openMap);
      mapCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); openMap(); }
      });
    }
  }

  // local helper bridge
  function openLightbox(i) {
    if (lightboxAPI) lightboxAPI.open(i);
  }

  // ---------------------------------------------------------
  // 7. Copy account number + toast (motion §3-3)
  // ---------------------------------------------------------
  async function copyText(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e2) { return false; }
    }
  }

  function setupCopy() {
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        // 은행 앱 입력란에 바로 붙여넣도록 숫자만 복사
        const txt = (btn.dataset.copy || '').replace(/\D/g, '');
        if (await copyText(txt)) {
          btn.classList.add('is-copied');
          haptic(15);
          showToast('계좌번호가 복사되었습니다');
          setTimeout(() => btn.classList.remove('is-copied'), 1400);
        } else {
          showToast('복사에 실패했습니다. 직접 선택해주세요');
        }
      });
    });

    // 주소 복사: 텍스트 그대로 복사 (숫자 필터 적용하지 않음)
    $$('[data-copy-text]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (await copyText(btn.dataset.copyText || '')) {
          haptic(15);
          showToast('주소가 복사되었습니다');
        } else {
          showToast('복사에 실패했습니다. 직접 선택해주세요');
        }
      });
    });
  }

  // ---------------------------------------------------------
  // 8. Toast
  // ---------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => { t.hidden = true; }, 320);
    }, 1500);
  }

  // ---------------------------------------------------------
  // 9. Music toggle (motion §3-6)
  // ---------------------------------------------------------
  function setupMusic() {
    const btn = $('#music-toggle');
    const audio = $('#bgm');
    if (!btn || !audio) return;
    audio.volume = 0;

    let fadeToken = 0;                               // 새 페이드가 시작되면 이전 페이드는 무효
    function fadeVolume(target, dur) {
      const token = ++fadeToken;
      const start = audio.volume;
      const t0 = performance.now();
      function tick(now) {
        if (token !== fadeToken) return;
        const t = clamp((now - t0) / dur, 0, 1);
        audio.volume = start + (target - start) * t;  // iOS 는 volume 이 읽기 전용이라 무시됨(재생/정지는 정상)
        if (t < 1) requestAnimationFrame(tick);
        else if (target === 0) audio.pause();
      }
      requestAnimationFrame(tick);
    }

    let wantPlaying = false;                         // 지금 재생 중이어야 하는 상태인가
    let userPaused = false;                          // 사용자가 직접 끈 뒤에는 자동으로 다시 켜지 않음
    function setState(on) {
      wantPlaying = on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? '배경음악 일시정지' : '배경음악 재생');
    }
    async function playMusic() {
      await audio.play();                            // 자동재생이 막혀 있으면 여기서 reject
      setState(true);
      fadeVolume(0.4, 1500);
    }
    function pauseMusic() {
      setState(false);
      fadeVolume(0, 600);
    }

    btn.addEventListener('click', async () => {
      btn.classList.remove('is-rippling');
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
      haptic(10);
      removeUnlock();
      try {
        if (!wantPlaying) {
          userPaused = false;
          await playMusic();
        } else {
          userPaused = true;
          pauseMusic();
        }
      } catch (e) {
        showToast('음악을 재생할 수 없어요');
      }
    });

    // --- 자동 재생 ---
    // 브라우저는 사용자의 터치 전에는 소리 재생을 막는다(특히 iOS Safari, Android Chrome).
    // 1) 페이지가 열리면 바로 재생을 시도하고, 2) 막히면 화면을 처음 터치하는 순간 시작한다.
    const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'];
    function removeUnlock() {
      UNLOCK_EVENTS.forEach((t) => document.removeEventListener(t, unlock, true));
    }
    function unlock(e) {
      if (userPaused || wantPlaying) { removeUnlock(); return; }
      if (e.target && btn.contains(e.target)) return;   // 음악 버튼은 자체 핸들러가 처리
      playMusic().then(removeUnlock).catch(() => {});   // 실패하면 다음 터치에서 다시 시도
    }
    playMusic().catch(() => {
      UNLOCK_EVENTS.forEach((t) => document.addEventListener(t, unlock, { capture: true, passive: true }));
    });

    // 다른 앱·탭으로 나가면 멈추고, 돌아오면 이어서 재생
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        fadeToken++;
        audio.pause();
      } else if (wantPlaying && !userPaused) {
        audio.play().then(() => fadeVolume(0.4, 600)).catch(() => {});
      }
    });
  }

  // ---------------------------------------------------------
  // 10. Share (Kakao / link copy) (motion §3-7)
  // ---------------------------------------------------------
  function setupShare() {
    const btnLink  = $('#share-link');
    const btnKakao = $('#share-kakao');

    btnLink?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        haptic(15);
        showToast('청첩장 링크가 복사되었습니다');
      } catch (e) {
        showToast('복사에 실패했습니다');
      }
    });

    btnKakao?.addEventListener('click', () => {
      haptic(15);
      // Kakao SDK 사용 가능 시
      if (window.Kakao && KAKAO_JS_KEY) {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: SHARE_TITLE,
              description: SHARE_DESC,
              imageUrl: SHARE_IMAGE,
              link: { mobileWebUrl: SHARE_URL, webUrl: SHARE_URL }
            },
            buttons: [
              { title: '청첩장 보기', link: { mobileWebUrl: SHARE_URL, webUrl: SHARE_URL } }
            ]
          });
          return;
        } catch (e) { /* fallthrough */ }
      }
      // Web Share API 폴백
      if (navigator.share) {
        navigator.share({ title: SHARE_TITLE, text: SHARE_DESC, url: location.href }).catch(() => {});
        return;
      }
      // 최종 폴백: 링크 복사
      navigator.clipboard?.writeText(location.href);
      showToast('청첩장 링크가 복사되었습니다');
    });
  }

  // ---------------------------------------------------------
  // 11. Guestbook — 페이지 내장 방명록 (Firestore REST, SDK 없음)
  //     보안 규칙: firestore.rules (읽기 누구나·목록 limit ≤ 50, 생성만 허용)
  //     사용자 입력은 textContent 로만 렌더링 (innerHTML 금지)
  // ---------------------------------------------------------
  const FS_PROJECT = 'wedding-letter-e18cd';
  const FS_DOCS    = `projects/${FS_PROJECT}/databases/(default)/documents`;
  const FS_BASE    = `https://firestore.googleapis.com/v1/${FS_DOCS}`;
  const GB_PAGE    = 20;
  const GB_COOLDOWN_MS = 30000;
  const GB_LAST_KEY = 'gb-last-submit';

  async function fsRequest(path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(`${FS_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();                       // JSON 파싱 오류도 throw
    } finally {
      clearTimeout(timer);
    }
  }

  function randomDocId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    let id = '';
    for (let i = 0; i < bytes.length; i++) id += chars[bytes[i] % chars.length];
    return id;
  }

  function formatGbDate(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  }

  function setupGuestbook() {
    const section  = $('#guestbook');
    const form     = $('#gb-form');
    const nameEl   = $('#gb-name');
    const msgEl    = $('#gb-message');
    const nameErr  = $('#gb-name-error');
    const msgErr   = $('#gb-message-error');
    const countNum = $('#gb-count-num');
    const submit   = $('#gb-submit');
    const statusEl = $('#gb-status');
    const retryBtn = $('#gb-retry');
    const list     = $('#gb-list');
    const moreBtn  = $('#gb-more');
    if (!section || !form || !list) return;

    // ---- 목록 ----
    let lastTs = null;       // 마지막으로 받은 글의 createdAt (다음 페이지 기준)
    let loading = false;
    const shownIds = new Set();  // 작성 직후 추가한 글이 목록 응답과 겹치지 않게

    function renderItem(entry, isNew) {
      const li = document.createElement('li');
      li.className = 'gb-item' + (isNew && !isReduced() ? ' is-new' : '');
      const head = document.createElement('p');
      head.className = 'gb-item-head';
      const name = document.createElement('strong');
      name.className = 'gb-item-name';
      name.textContent = entry.name;
      const date = document.createElement('time');
      date.className = 'gb-item-date';
      date.dateTime = entry.createdAt || '';
      date.textContent = formatGbDate(entry.createdAt);
      head.append(name, date);
      const msg = document.createElement('p');
      msg.className = 'gb-item-msg';
      msg.textContent = entry.message;
      li.append(head, msg);
      return li;
    }

    function parseEntries(rows) {
      if (!Array.isArray(rows) || rows.some(r => r && r.error)) throw new Error('bad response');
      return rows
        .filter(r => r && r.document && r.document.fields)
        .map(r => {
          const f = r.document.fields;
          return {
            name: (f.name && f.name.stringValue) || '',
            message: (f.message && f.message.stringValue) || '',
            createdAt: (f.createdAt && f.createdAt.timestampValue) || '',
            id: String(r.document.name || '').split('/').pop(),
          };
        });
    }

    function setStatus(text) { statusEl.textContent = text; }

    async function loadPage(more) {
      if (loading) return;
      loading = true;
      retryBtn.hidden = true;
      moreBtn.hidden = true;
      if (!more) {
        setStatus('불러오는 중…');
        list.textContent = '';       // 다시 시도 시 처음부터
        shownIds.clear();
        lastTs = null;
      } else { moreBtn.disabled = true; }

      const query = {
        from: [{ collectionId: 'guestbook' }],
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: GB_PAGE,
      };
      if (more && lastTs) query.startAt = { values: [{ timestampValue: lastTs }], before: false };

      try {
        const entries = parseEntries(await fsRequest(':runQuery', { structuredQuery: query }));
        const frag = document.createDocumentFragment();
        entries.forEach(e => {
          if (e.id && shownIds.has(e.id)) return;
          if (e.id) shownIds.add(e.id);
          frag.appendChild(renderItem(e, false));
        });
        list.appendChild(frag);
        if (entries.length) lastTs = entries[entries.length - 1].createdAt;
        setStatus(list.children.length ? '' : '첫 번째 축하 메시지를 남겨 주세요');
        moreBtn.hidden = entries.length < GB_PAGE;
      } catch (e) {
        if (more) {
          moreBtn.hidden = false;
          showToast('잠시 후 다시 시도해 주세요');
        } else {
          setStatus('방명록을 불러오지 못했습니다');
          retryBtn.hidden = false;
        }
      } finally {
        moreBtn.disabled = false;
        loading = false;
      }
    }

    retryBtn.addEventListener('click', () => loadPage(false));
    moreBtn.addEventListener('click', () => loadPage(true));

    // 섹션이 화면에 가까워질 때 한 번만 불러오기
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        if (entries.some(e => e.isIntersecting)) {
          obs.disconnect();
          loadPage(false);
        }
      }, { rootMargin: '200px 0px' });
      io.observe(section);
    } else {
      loadPage(false);
    }

    // ---- 작성 ----
    const updateCount = () => { countNum.textContent = String(msgEl.value.length); };
    msgEl.addEventListener('input', () => {
      updateCount();
      if (msgEl.value.trim()) { msgErr.textContent = ''; msgEl.removeAttribute('aria-invalid'); }
    });
    nameEl.addEventListener('input', () => {
      if (nameEl.value.trim()) { nameErr.textContent = ''; nameEl.removeAttribute('aria-invalid'); }
    });
    updateCount();

    let lastSubmitAt = 0;
    function readLastSubmit() {
      let stored = 0;
      try { stored = Number(localStorage.getItem(GB_LAST_KEY)) || 0; } catch (e) {}
      return Math.max(lastSubmitAt, stored);
    }
    function writeLastSubmit(t) {
      lastSubmitAt = t;
      try { localStorage.setItem(GB_LAST_KEY, String(t)); } catch (e) {}
    }

    let submitting = false;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (submitting) return;

      const name = nameEl.value.trim();
      const message = msgEl.value.trim();
      nameErr.textContent = '';
      msgErr.textContent = '';
      nameEl.removeAttribute('aria-invalid');
      msgEl.removeAttribute('aria-invalid');
      if (!name) {
        nameErr.textContent = '이름을 입력해 주세요';
        nameEl.setAttribute('aria-invalid', 'true');
      }
      if (!message) {
        msgErr.textContent = '메시지를 입력해 주세요';
        msgEl.setAttribute('aria-invalid', 'true');
      }
      if (!name) { nameEl.focus(); return; }
      if (!message) { msgEl.focus(); return; }
      if (name.length > 20 || message.length > 300) return;   // maxlength 우회 대비

      const now = Date.now();
      if (now - readLastSubmit() < GB_COOLDOWN_MS) {
        showToast('잠시 후 다시 남겨 주세요');
        return;
      }

      submitting = true;
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = '남기는 중…';
      try {
        const docId = randomDocId();
        const res = await fsRequest(':commit', {
          writes: [{
            update: {
              name: `${FS_DOCS}/guestbook/${docId}`,
              fields: { name: { stringValue: name }, message: { stringValue: message } },
            },
            updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
            currentDocument: { exists: false },
          }],
        });
        const ts = res && res.writeResults && res.writeResults[0] &&
                   res.writeResults[0].transformResults && res.writeResults[0].transformResults[0] &&
                   res.writeResults[0].transformResults[0].timestampValue;
        writeLastSubmit(Date.now());
        shownIds.add(docId);
        list.insertBefore(renderItem({ name, message, createdAt: ts || new Date().toISOString() }, true), list.firstChild);
        if (!lastTs && ts) lastTs = ts;
        // 목록이 실패/빈 상태였다면 안내 문구 정리 (실패 상태의 '다시 시도'는 유지)
        if (retryBtn.hidden) setStatus('');
        msgEl.value = '';
        updateCount();
        haptic(15);
        showToast('소중한 마음이 전해졌습니다');
      } catch (e) {
        showToast('잠시 후 다시 시도해 주세요');
      } finally {
        submitting = false;
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }

  // ---------------------------------------------------------
  // 12. 코너·디바이더 개나리 가지 살랑임 (motion §3-12, Nice)
  //     viewport 안에서만 animation-play-state: running, 위상은 요소마다 랜덤
  // ---------------------------------------------------------
  function setupBranchSway() {
    if (isReduced()) return;
    const els = $$('.corner-deco, .divider');
    if (!els.length || !('IntersectionObserver' in window)) return;
    els.forEach(el => { el.style.animationDelay = `-${(Math.random() * 6).toFixed(2)}s`; });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('is-swaying', e.isIntersecting));
    }, { threshold: 0 });
    els.forEach(el => io.observe(el));
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  function init() {
    setupHero();
    setupReveal();
    setupPetals();
    setupBranchSway();
    setupCalendar();
    setupGallery();
    setupLightbox();
    setupCopy();
    setupMusic();
    setupShare();
    setupGuestbook();

    // reduced-motion 변경 시 단순 reload (모션 일관성 보장)
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', () => location.reload());
    } else if (reducedMotion.addListener) {
      reducedMotion.addListener(() => location.reload());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
