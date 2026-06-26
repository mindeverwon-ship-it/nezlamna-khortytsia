/* ============================================================
   НЕЗЛАМНА ХОРТИЦЯ — motion design (After Effects style)

   • GSAP ScrollTrigger — кінематографічна поява блоків + рух камери.
   • Lenis — плавний інерційний скрол.
   • Фото — у повних натуральних пропорціях (без обрізки).
   • Надійність: без pin; якщо GSAP не завантажився — базовий режим
     на IntersectionObserver; safety-net не дає нічому застрягти прихованим.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const isMobile = window.matchMedia('(max-width: 760px)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================ НАВІГАЦІЯ */
  const nav = $('#nav');
  const burger = $('#burger');
  const navLinks = $('#navLinks');

  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  burger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#navLinks a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
    })
  );

  const navObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        $$('#navLinks a').forEach((a) => a.classList.remove('active'));
        $(`#navLinks a[href="#${e.target.id}"]`)?.classList.add('active');
      }
    }),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  $$('section[id]').forEach((s) => navObserver.observe(s));

  /* ============================================================ ПРОГРЕС */
  const progress = $('#scrollProgress');
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ============================================================ ГАЛЕРЕЯ + LIGHTBOX */
  const gallery = [
    { file: 'images/photos/photo-01.jpg', cap: 'Прибирання території' },
    { file: 'images/photos/photo-02.jpg', cap: 'Підвезена вода для поливу' },
    { file: 'images/photos/photo-03.jpg', cap: 'Спільне фото учасників' },
    { file: 'images/photos/photo-04.jpg', cap: 'Разом — сила' },
    { file: 'images/photos/photo-05.jpg', cap: 'Громада на старті' },
    { file: 'images/photos/photo-06.jpg', cap: 'Команда перед висадкою' },
    { file: 'images/photos/photo-07.jpg', cap: 'Слово до учасників' },
    { file: 'images/photos/photo-08.jpg', cap: 'Молодь за роботою' },
    { file: 'images/photos/photo-09.jpg', cap: 'Біля «готелю» для комах' },
    { file: 'images/photos/photo-10.jpg', cap: 'Майструють еко-локацію' },
    { file: 'images/photos/photo-11.jpg', cap: 'Стенд «Готель для комах»' },
    { file: 'images/photos/photo-12.jpg', cap: 'Оновлений парк улітку' },
    { file: 'images/photos/photo-13.jpg', cap: 'Встановлення будиночка' },
    { file: 'images/photos/photo-14.jpg', cap: '«Готель» для комах у руках' },
    { file: 'images/photos/photo-15.jpg', cap: 'Юні охоронці природи' },
  ];

  const masonry = $('#masonry');
  if (masonry) {
    gallery.forEach((g, i) => {
      const item = document.createElement('div');
      item.className = 'masonry__item reveal';
      const img = document.createElement('img');
      const medium = g.file.replace(/\.jpg$/, '-1280.jpg');
      img.src = g.file;
      img.srcset = medium + ' 1280w, ' + g.file + ' 2048w';
      img.sizes = '(max-width:760px) 100vw, (max-width:1024px) 50vw, 33vw';
      img.alt = g.cap;
      img.loading = 'lazy';
      img.decoding = 'async';
      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(i));
      masonry.appendChild(item);
    });
  }

  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  let lbIndex = 0;
  function openLightbox(i) {
    lbIndex = i;
    const g = gallery[i];
    lbImg.src = g.file; lbImg.alt = g.cap; lbCap.textContent = g.cap;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function navLightbox(d) { lbIndex = (lbIndex + d + gallery.length) % gallery.length; openLightbox(lbIndex); }
  $('#lbClose')?.addEventListener('click', closeLightbox);
  $('#lbPrev')?.addEventListener('click', () => navLightbox(-1));
  $('#lbNext')?.addEventListener('click', () => navLightbox(1));
  lb?.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  /* ============================================================ ЛІЧИЛЬНИКИ */
  const countObserver = new IntersectionObserver(
    (entries, obs) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const start = performance.now(), dur = 1600;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    }), { threshold: 0.6 }
  );
  $$('.kpi__num').forEach((c) => countObserver.observe(c));

  /* ============================================================ HERO СЛАЙДШОУ
     Усі слайди — position:absolute inset:0 (у вікні), тож loading=lazy не діє і
     браузер тягнув би всі 5 великих фото одразу = лаги на старті. Тому
     завантажуємо лише перше фото, а решту — ліниво, по одному наперед. */
  const heroSlides = $$('#heroSlides .hero__slide');
  const loadHeroSlide = (i) => {
    const img = heroSlides[i] && heroSlides[i].querySelector('.hero__slide-img');
    if (img && img.dataset.src) {
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      delete img.dataset.src; delete img.dataset.srcset;
    }
  };
  // зняти src/srcset з усіх, крім першого — щоб не вантажились на старті
  heroSlides.forEach((s, i) => {
    if (i === 0) return;
    const img = s.querySelector('.hero__slide-img');
    if (!img) return;
    if (img.getAttribute('srcset')) { img.dataset.srcset = img.getAttribute('srcset'); img.removeAttribute('srcset'); }
    if (img.getAttribute('src')) { img.dataset.src = img.getAttribute('src'); img.removeAttribute('src'); }
  });
  if (heroSlides.length > 1 && !reduced) {
    let hi = 0;
    // перший слайд вже видно — підвантажимо наступний наперед, коли браузер звільниться
    (window.requestIdleCallback || window.setTimeout)(() => loadHeroSlide(1), 1500);
    setInterval(() => {
      heroSlides[hi].classList.remove('is-active');
      hi = (hi + 1) % heroSlides.length;
      heroSlides[hi].classList.add('is-active');
      loadHeroSlide((hi + 1) % heroSlides.length); // готуємо наступний наперед
    }, 5200);
  }

  /* ============================================================ ТИТРИ (слова) */
  if (!reduced) {
    $$('.h2, .chapter__text h3').forEach((h) => {
      const text = h.textContent;
      h.textContent = '';
      text.split(/(\s+)/).forEach((tok, i) => {
        if (/^\s+$/.test(tok)) { h.appendChild(document.createTextNode(tok)); return; }
        const w = document.createElement('span'); w.className = 'word';
        const inner = document.createElement('span'); inner.className = 'word__i';
        inner.style.setProperty('--wi', i);
        inner.textContent = tok;
        w.appendChild(inner); h.appendChild(w);
      });
    });
  }

  /* ============================================================ SMOOTH SCROLL (Lenis) */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, smoothTouch: false });
    window.lenis = lenis;
    lenis.on('scroll', updateProgress);
    if (hasGSAP) {
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.3 });
      else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ============================================================ «ХРЕБЕТ» історії */
  const sf = $('#spineFill');
  const track = $('#storyTrack');
  if (sf && track && !reduced) {
    const onTrack = () => {
      const rect = track.getBoundingClientRect();
      const total = rect.height;
      const passed = Math.min(Math.max(window.innerHeight * 0.5 - rect.top, 0), total);
      sf.style.height = (total > 0 ? (passed / total) * 100 : 0) + '%';
    };
    onTrack();
    window.addEventListener('scroll', onTrack, { passive: true });
    window.addEventListener('resize', onTrack);
  } else if (sf) {
    sf.style.height = '100%';
  }

  /* ============================================================ РЕЖИМИ */
  if (reduced) {
    $$('.reveal, .chapter, .climax').forEach((el) => el.classList.add('in'));
  } else if (hasGSAP) {
    initMotion();
  } else {
    initFallback();
  }

  /* ---------- Кінематографічний режим (GSAP) ---------- */
  function initMotion() {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    document.documentElement.classList.add('has-gsap');

    /* На мобільному прибираємо анімовані blur-фільтри — вони найбільше «лагають»
       при скролі на телефонах. Рух (поява, зсув) лишається плавним. */
    const fx = (v) => (isMobile ? undefined : v);

    const onEnter = (trigger, start) => ({ trigger, start: start || 'top 86%' });

    /* HERO — кінематографічна поява + вихід.
       Фото з'являється ЛИШЕ через прозорість (без scale повноекранного кадру) —
       масштабування великого фото на старті найбільше «душить» завантаження. */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__slides', { autoAlpha: 0, duration: isMobile ? 0.8 : 1.2 }, 0)
      .from('.hero__title', { autoAlpha: 0, yPercent: 8, scale: 1.06, filter: fx('blur(16px)'), duration: 1.5 }, 0.4)
      .from('.hero__kicker', { autoAlpha: 0, y: 24, duration: 1 }, '-=1.1')
      .from('.hero__subtitle', { autoAlpha: 0, y: 24, filter: fx('blur(8px)'), duration: 1 }, '-=0.8')
      .from('.hero .btn--accent', { autoAlpha: 0, y: 20, duration: 0.8 }, '-=0.7')
      .from('.hero__scroll', { autoAlpha: 0, duration: 0.8 }, '-=0.4');

    /* scrub-паралакс hero рахується щокадру — на мобільному він дає ривки, тож лише на ПК */
    if (!isMobile) {
      gsap.to('.hero__slides', { yPercent: 10, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__content', { yPercent: -26, autoAlpha: 0, filter: 'blur(6px)', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '72% top', scrub: true } });
    } else {
      gsap.to('.hero__content', { yPercent: -18, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: 0.3 } });
    }

    /* Заголовки — титрова поява по словах */
    gsap.utils.toArray('.h2, .chapter__text h3').forEach((h) => {
      const inners = h.querySelectorAll('.word__i');
      if (!inners.length) return;
      gsap.from(inners, { yPercent: 118, duration: 0.9, ease: 'power4.out', stagger: 0.045,
        scrollTrigger: onEnter(h, 'top 88%') });
    });

    /* Параграфи / підписи — Fade Up + Blur */
    gsap.utils.toArray('.section__sub, .chapter__text p, .chapter__caption, .pull').forEach((p) => {
      gsap.from(p, { autoAlpha: 0, y: 26, filter: fx('blur(10px)'), duration: 1.05, ease: 'power2.out',
        scrollTrigger: onEnter(p, 'top 90%') });
    });

    /* Загальні блоки */
    gsap.utils.toArray('.reveal:not(.kpis):not(.results):not(.roadmap)').forEach((el) => {
      gsap.from(el, { autoAlpha: 0, y: 44, duration: 1, ease: 'power3.out', scrollTrigger: onEnter(el) });
    });
    gsap.utils.toArray('.roadmap').forEach((r) => {
      gsap.from(r.querySelectorAll('li'), { autoAlpha: 0, y: 22, duration: 0.6, ease: 'power2.out',
        stagger: 0.05, scrollTrigger: onEnter(r, 'top 90%') });
    });
    if ($('.kpis')) gsap.from('.kpi', { autoAlpha: 0, y: 40, scale: 0.9, duration: 0.8,
      ease: 'back.out(1.5)', stagger: 0.1, scrollTrigger: onEnter('.kpis', 'top 85%') });
    if ($('.results')) gsap.from('.result-card', { autoAlpha: 0, y: 50, duration: 0.8,
      ease: 'power3.out', stagger: 0.09, scrollTrigger: onEnter('.results', 'top 82%') });

    /* Глави — «вспливання» (фото повне, анімуємо контейнер) */
    gsap.utils.toArray('.chapter').forEach((ch) => {
      gsap.from(ch.querySelector('.chapter__media'), { autoAlpha: 0, y: 80, scale: 0.96,
        duration: 1.1, ease: 'power3.out', scrollTrigger: onEnter(ch, 'top 80%') });
    });

    /* КІНО-СЦЕНИ — наближення фону + поява рядків (усі .climax) */
    gsap.utils.toArray('.climax').forEach((sc) => {
      const bg = sc.querySelector('.climax__bg img');
      if (bg && !isMobile) gsap.fromTo(bg, { scale: 1.06 }, { scale: 1.18, ease: 'none',
        scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(sc.querySelectorAll('.climax__line'), { autoAlpha: 0, yPercent: 70, filter: fx('blur(12px)'),
        duration: 1, stagger: 0.3, ease: 'power2.out', scrollTrigger: onEnter(sc, 'top 62%') });
    });

    /* SAFETY NET — нічого не лишається прихованим */
    const guard = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        setTimeout(() => {
          if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
            gsap.set(el, { autoAlpha: 1, clearProps: 'transform,filter' });
          }
        }, 600);
      });
    }, { threshold: 0.1 });
    $$('.reveal, .chapter, .kpi, .result-card, .climax__line, .chapter__media, .chapter__text p, .section__sub')
      .forEach((el) => guard.observe(el));

    window.addEventListener('load', () => ST.refresh());
  }

  /* ---------- Базовий режим (без GSAP): IntersectionObserver + CSS ---------- */
  function initFallback() {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    $$('.reveal, .chapter, .climax').forEach((el) => revealObserver.observe(el));
  }

  /* ============================================================ QR-КОД */
  const qrSrc = (url, size) =>
    'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
    '&margin=0&color=0B2818&data=' + encodeURIComponent(url);

  function renderQR(boxEl, url, size) {
    if (!boxEl) return;
    boxEl.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'QR-код сторінки';
    img.src = qrSrc(url, size);
    img.addEventListener('error', () => {
      boxEl.innerHTML = '<p style="color:#0B2818;font-size:.8rem;max-width:180px">QR з\'явиться онлайн.<br>Адреса:<br><b style="word-break:break-all">' + url + '</b></p>';
    });
    boxEl.appendChild(img);
  }

  // Поки сайт не опубліковано (localhost / file://), QR має вести на щось робоче —
  // тому за замовчуванням кодуємо Facebook-сторінку. Після публікації — адресу сайту.
  const FB = 'https://www.facebook.com/vkgunpzp?locale=ru_RU';
  const host = location.hostname;
  const isLocal = location.protocol === 'file:' || !location.href.startsWith('http') ||
    host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '';
  const defaultUrl = isLocal ? FB : location.href;

  const qrModal = $('#qrModal');
  const qrUrlInput = $('#qrUrl');
  const qrStatus = $('#qrStatus');
  if (qrUrlInput) qrUrlInput.value = defaultUrl;

  const setStatus = (url) => {
    if (!qrStatus) return;
    qrStatus.textContent = /facebook\.com/.test(url)
      ? '🔗 QR веде на Facebook (працює вже зараз)'
      : '✅ QR веде на сайт';
  };

  renderQR($('#qrInline'), defaultUrl, 180);
  setStatus(defaultUrl);

  const refreshQR = () => {
    const u = (qrUrlInput && qrUrlInput.value.trim()) || defaultUrl;
    renderQR($('#qrModalImg'), u, 240);
    renderQR($('#qrInline'), u, 180);
    setStatus(u);
  };

  $('#qrBtn')?.addEventListener('click', () => {
    refreshQR();
    qrModal.classList.add('open'); qrModal.setAttribute('aria-hidden', 'false');
  });
  const closeQR = () => { qrModal.classList.remove('open'); qrModal.setAttribute('aria-hidden', 'true'); };
  $('#qrClose')?.addEventListener('click', closeQR);
  qrModal?.addEventListener('click', (e) => { if (e.target === qrModal) closeQR(); });
  $('#qrUpdate')?.addEventListener('click', refreshQR);

  $('#qrDownload')?.addEventListener('click', async () => {
    const u = (qrUrlInput && qrUrlInput.value.trim()) || defaultUrl;
    try {
      const res = await fetch(qrSrc(u, 600));
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr-nezlamna-khortytsia.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      window.open(qrSrc(u, 600), '_blank');
    }
  });
})();
