(function () {
  "use strict";

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  let navMenuAnchor = null;
  if (navMenu && navMenu.parentNode) {
    navMenuAnchor = document.createComment("nav-menu-anchor");
    navMenu.parentNode.insertBefore(navMenuAnchor, navMenu);
  }

  function moveMenuToBody() {
    if (navMenu && navMenu.parentNode !== body) {
      body.appendChild(navMenu);
    }
  }

  function restoreMenuPosition() {
    if (navMenu && navMenuAnchor && navMenu.parentNode === body) {
      navMenuAnchor.parentNode.insertBefore(navMenu, navMenuAnchor.nextSibling);
    }
  }

  function closeMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
    body.classList.remove("nav-open");
    restoreMenuPosition();
  }

  function toggleMenu() {
    if (!hamburger || !navMenu) return;
    const willOpen = !navMenu.classList.contains("active");
    if (willOpen) moveMenuToBody();

    const isOpen = navMenu.classList.toggle("active");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("no-scroll", isOpen);
    body.classList.toggle("nav-open", isOpen);

    if (!isOpen) restoreMenuPosition();
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) {
        if (navMenu.classList.contains("active")) closeMenu();
        else restoreMenuPosition();
      }
    });
  }

  /* ---------- Slider Antes / Depois ---------- */
  const sliders = document.querySelectorAll(".before-after-slider");

  sliders.forEach((slider) => {
    let isDragging = false;

    function updateSliderPosition(clientX) {
      const rect = slider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;
      slider.style.setProperty("--position", `${percentage.toFixed(2)}%`);
      slider.setAttribute("aria-valuenow", String(Math.round(percentage)));
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      updateSliderPosition(e.clientX);
    }

    function onPointerDown(e) {
      isDragging = true;
      slider.setPointerCapture(e.pointerId);
      updateSliderPosition(e.clientX);
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      slider.releasePointerCapture(e.pointerId);
    }

    slider.setAttribute("tabindex", "0");
    slider.setAttribute("role", "slider");
    slider.setAttribute("aria-label", "Comparador Antes e Depois");
    slider.setAttribute("aria-valuenow", "50");

    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", onPointerUp);
    slider.addEventListener("pointercancel", onPointerUp);

    slider.addEventListener("keydown", (e) => {
      let currentPos = parseFloat(slider.style.getPropertyValue("--position") || "50");
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        currentPos = Math.max(0, currentPos - 5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        currentPos = Math.min(100, currentPos + 5);
      } else {
        return;
      }
      slider.style.setProperty("--position", `${currentPos}%`);
      slider.setAttribute("aria-valuenow", String(Math.round(currentPos)));
    });
  });

  /* ---------- Hero carousel ---------- */
  const heroSlidesEl = document.getElementById("heroSlides");
  const heroFill = document.getElementById("heroFill");
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");
  const heroSlideTitle = document.getElementById("heroSlideTitle");
  const heroSlideDesc = document.getElementById("heroSlideDesc");

  if (heroSlidesEl && heroFill && heroSlideTitle && heroSlideDesc) {
    const heroSlideEls = Array.from(heroSlidesEl.querySelectorAll(".hero-slide"));
    let heroIndex = Math.max(0, heroSlideEls.findIndex((s) => s.classList.contains("is-active")));

    function renderHeroSlide(index) {
      heroSlideEls.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      const active = heroSlideEls[index];
      heroSlideTitle.style.opacity = "0";
      heroSlideDesc.style.opacity = "0";
      setTimeout(() => {
        heroSlideTitle.textContent = active.dataset.title || "";
        heroSlideDesc.textContent = active.dataset.desc || "";
        heroSlideTitle.style.opacity = "1";
        heroSlideDesc.style.opacity = "1";
      }, 280);
      heroIndex = index;
    }

    function startHeroProgress() {
      heroFill.classList.remove("is-animating");
      void heroFill.offsetWidth;
      heroFill.classList.add("is-animating");
    }

    function goToHeroSlide(index) {
      const total = heroSlideEls.length;
      const next = (index + total) % total;
      renderHeroSlide(next);
      startHeroProgress();
    }

    if (heroPrev) heroPrev.addEventListener("click", () => goToHeroSlide(heroIndex - 1));
    if (heroNext) heroNext.addEventListener("click", () => goToHeroSlide(heroIndex + 1));

    let heroTouchStartX = 0;
    const hero = document.getElementById("inicio");
    if (hero) {
      hero.addEventListener(
        "touchstart",
        (e) => {
          heroTouchStartX = e.touches[0].clientX;
        },
        { passive: true }
      );
      hero.addEventListener(
        "touchend",
        (e) => {
          const delta = e.changedTouches[0].clientX - heroTouchStartX;
          if (Math.abs(delta) < 50) return;
          goToHeroSlide(heroIndex + (delta < 0 ? 1 : -1));
        },
        { passive: true }
      );

      let heroMouseDownX = null;
      hero.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") return;
        heroMouseDownX = e.clientX;
      });
      hero.addEventListener("pointerup", (e) => {
        if (heroMouseDownX === null) return;
        const delta = e.clientX - heroMouseDownX;
        heroMouseDownX = null;
        if (Math.abs(delta) < 50) return;
        goToHeroSlide(heroIndex + (delta < 0 ? 1 : -1));
      });
    }

    heroFill.addEventListener("transitionend", () => {
      if (heroFill.classList.contains("is-animating")) {
        goToHeroSlide(heroIndex + 1);
      }
    });

    startHeroProgress();
  }

  /* ---------- About (carrossel de trajetória) ---------- */
  const aboutTrack = document.getElementById("aboutCarouselTrack");
  const aboutDotsWrap = document.getElementById("aboutCarouselDots");
  const aboutPrevBtn = document.getElementById("aboutCarouselPrev");
  const aboutNextBtn = document.getElementById("aboutCarouselNext");

  if (aboutTrack) {
    const aboutSlides = Array.from(aboutTrack.querySelectorAll(".about__carousel-slide"));
    let aboutIndex = Math.max(0, aboutSlides.findIndex((s) => s.classList.contains("is-active")));
    let aboutTimer = null;

    if (aboutDotsWrap && aboutSlides.length > 1) {
      aboutSlides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para foto ${i + 1} da trajetória`);
        if (i === aboutIndex) dot.classList.add("is-active");
        dot.addEventListener("click", () => goToAboutSlide(i));
        aboutDotsWrap.appendChild(dot);
      });
    }
    const aboutDots = aboutDotsWrap ? Array.from(aboutDotsWrap.children) : [];

    function renderAboutSlide(index) {
      aboutSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      aboutDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      aboutIndex = index;
    }

    function restartAboutAutoplay() {
      if (aboutSlides.length < 2) return;
      if (aboutTimer) clearInterval(aboutTimer);
      aboutTimer = setInterval(() => {
        const total = aboutSlides.length;
        renderAboutSlide((aboutIndex + 1) % total);
      }, 4500);
    }

    function goToAboutSlide(index) {
      const total = aboutSlides.length;
      renderAboutSlide((index + total) % total);
      restartAboutAutoplay();
    }

    if (aboutPrevBtn) aboutPrevBtn.addEventListener("click", () => goToAboutSlide(aboutIndex - 1));
    if (aboutNextBtn) aboutNextBtn.addEventListener("click", () => goToAboutSlide(aboutIndex + 1));

    let aboutTouchStartX = 0;
    aboutTrack.addEventListener(
      "touchstart",
      (e) => {
        aboutTouchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    aboutTrack.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - aboutTouchStartX;
        if (Math.abs(delta) < 40) return;
        goToAboutSlide(aboutIndex + (delta < 0 ? 1 : -1));
      },
      { passive: true }
    );

    restartAboutAutoplay();
  }

  /* ---------- Hero entrance animation ---------- */
  const animatedItems = document.querySelectorAll(".animate-item");
  if (animatedItems.length > 0) {
    setTimeout(() => {
      animatedItems.forEach((el) => el.classList.add("is-visible"));
    }, 160);
  }

  /* ---------- Header background on scroll ---------- */
  const header = document.getElementById("header");
  if (header) {
    function onScrollHeader() {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    ".about__grid, .section-head, .service-card, .spotlight, .gallery__item, .perk, .feedback, .faq-item, .contact-card, .final-cta__inner"
  );

  if (revealTargets.length > 0) {
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.13, rootMargin: "0px 0px -45px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;

      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          const openBtn = openItem.querySelector(".faq-item__question");
          if (openBtn) openBtn.setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Feedback (carrossel em destaque) ---------- */
  const feedbackStage = document.getElementById("feedbackStage");
  const feedbackPrev = document.getElementById("feedbackPrev");
  const feedbackNext = document.getElementById("feedbackNext");
  const feedbackDots = document.getElementById("feedbackDots");

  if (feedbackStage) {
    const slides = Array.from(feedbackStage.querySelectorAll(".feedback__slide"));
    let currentIndex = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));

    if (feedbackDots && slides.length > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
        if (i === currentIndex) dot.classList.add("is-active");
        dot.addEventListener("click", () => showSlide(i));
        feedbackDots.appendChild(dot);
      });
    }

    const dots = feedbackDots ? Array.from(feedbackDots.children) : [];

    function showSlide(index) {
      const total = slides.length;
      const nextIndex = (index + total) % total;
      if (nextIndex === currentIndex) return;
      slides[currentIndex].classList.remove("is-active");
      slides[nextIndex].classList.add("is-active");
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === nextIndex));
      currentIndex = nextIndex;
    }

    if (feedbackPrev) feedbackPrev.addEventListener("click", () => showSlide(currentIndex - 1));
    if (feedbackNext) feedbackNext.addEventListener("click", () => showSlide(currentIndex + 1));

    let touchStartX = 0;
    feedbackStage.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    feedbackStage.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) < 40) return;
        showSlide(currentIndex + (delta < 0 ? 1 : -1));
      },
      { passive: true }
    );
  }

  /* ============================================================
     GALERIA — carrossel (v3)
     - visual limpo, sem legendas nem numeração
     - setas com estado desabilitado, esmaecimento nas bordas
     - contador/pontos corretos até a última foto
     - arrastar com mouse (inércia + encaixe na foto mais próxima)
     - teclado (setas, Home, End), autoplay suave com pausas
     ============================================================ */
  let gallerySyncTo = null; // usado pelo lightbox para sincronizar o carrossel

  const galleryTrack = document.getElementById("galleryTrack");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const galleryDots = document.getElementById("galleryDots");
  const galleryCounter = document.getElementById("galleryCounter");

  if (galleryTrack) {
    const galleryRoot = galleryTrack.closest(".gallery-carousel");
    const slides = Array.from(galleryTrack.querySelectorAll(".gallery-carousel__slide"));
    const total = slides.length;
    const EDGE = 4; // tolerância (px) para considerar início/fim

    /* Acessibilidade do carrossel */
    galleryTrack.setAttribute("role", "region");
    galleryTrack.setAttribute("aria-roledescription", "carrossel");
    galleryTrack.setAttribute("aria-label", "Galeria de trabalhos");

    /* Rótulo acessível em cada foto (sem texto visível) */
    slides.forEach((slide, i) => {
      const text = slide.getAttribute("data-caption") || "Foto";
      slide.setAttribute("aria-label", `${text} — foto ${i + 1} de ${total}. Ampliar`);
    });

    /* Pontinhos */
    if (galleryDots && total > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para foto ${i + 1}`);
        dot.addEventListener("click", () => {
          scrollToIndex(i);
          restartAutoplay();
        });
        galleryDots.appendChild(dot);
      });
    }
    const dots = galleryDots ? Array.from(galleryDots.children) : [];

    /* Helpers de posição */
    function slideOffset(i) {
      const trackRect = galleryTrack.getBoundingClientRect();
      return slides[i].getBoundingClientRect().left - trackRect.left + galleryTrack.scrollLeft;
    }

    function stepSize() {
      if (total > 1) return Math.abs(slideOffset(1) - slideOffset(0)) || slides[0].offsetWidth;
      return slides[0] ? slides[0].offsetWidth : 0;
    }

    function maxScroll() {
      return galleryTrack.scrollWidth - galleryTrack.clientWidth;
    }

    function nearestIndex(position) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < total; i++) {
        const d = Math.abs(slideOffset(i) - position);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    }

    function scrollToIndex(i, behavior) {
      const index = Math.max(0, Math.min(total - 1, i));
      galleryTrack.scrollTo({
        left: slideOffset(index),
        behavior: behavior || (reduceMotion ? "auto" : "smooth"),
      });
    }

    function scrollByStep(direction) {
      galleryTrack.scrollBy({
        left: stepSize() * direction,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }

    gallerySyncTo = (i) => scrollToIndex(i, "auto");

    /* Estado visual (atual, contador, setas, bordas) */
    function updateState() {
      if (!total) return;
      const max = maxScroll();
      const left = galleryTrack.scrollLeft;
      const scrollable = max > EDGE;
      const atStart = left <= EDGE;
      const atEnd = !scrollable || left >= max - EDGE;

      let idx;
      if (!scrollable || atStart) idx = 0;
      else if (atEnd) idx = total - 1;
      else idx = nearestIndex(left);

      slides.forEach((slide, i) => slide.classList.toggle("is-current", i === idx));
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === idx);
        if (i === idx) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });

      if (galleryPrev) galleryPrev.disabled = !scrollable || atStart;
      if (galleryNext) galleryNext.disabled = !scrollable || atEnd;

      if (galleryRoot) {
        galleryRoot.classList.toggle("has-prev", scrollable && !atStart);
        galleryRoot.classList.toggle("has-next", scrollable && !atEnd);
      }
    }

    let rafId = null;
    galleryTrack.addEventListener(
      "scroll",
      () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateState();
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", updateState);

    /* Setas */
    if (galleryPrev) {
      galleryPrev.addEventListener("click", () => {
        scrollByStep(-1);
        restartAutoplay();
      });
    }
    if (galleryNext) {
      galleryNext.addEventListener("click", () => {
        scrollByStep(1);
        restartAutoplay();
      });
    }

    /* Teclado: setas, Home e End funcionam com o foco em qualquer foto */
    galleryTrack.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByStep(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByStep(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(total - 1);
      } else {
        return;
      }
      restartAutoplay();
    });

    /* Evita arrastar a imagem nativamente */
    galleryTrack.addEventListener("dragstart", (e) => e.preventDefault());

    /* Arrastar com o mouse (toque usa a rolagem nativa) */
    const drag = {
      active: false,
      moved: false,
      pointerId: null,
      startX: 0,
      startScroll: 0,
      lastX: 0,
      lastT: 0,
      velocity: 0,
    };
    let suppressClick = false;

    galleryTrack.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.startScroll = galleryTrack.scrollLeft;
      drag.lastX = e.clientX;
      drag.lastT = performance.now();
      drag.velocity = 0;
    });

    galleryTrack.addEventListener("pointermove", (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;

      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        // Só captura o ponteiro depois de arrastar de verdade,
        // senão o clique na foto (abrir lightbox) deixa de funcionar.
        drag.moved = true;
        galleryTrack.classList.add("is-dragging");
        try {
          galleryTrack.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
        stopAutoplay();
      }

      galleryTrack.scrollLeft = drag.startScroll - dx;

      const now = performance.now();
      const dt = now - drag.lastT;
      if (dt > 0) drag.velocity = (e.clientX - drag.lastX) / dt; // px/ms
      drag.lastX = e.clientX;
      drag.lastT = now;
    });

    function endDrag(e) {
      if (!drag.active || (e && e.pointerId !== drag.pointerId)) return;
      const wasMoved = drag.moved;
      drag.active = false;
      drag.moved = false;
      galleryTrack.classList.remove("is-dragging");

      if (wasMoved) {
        try {
          galleryTrack.releasePointerCapture(drag.pointerId);
        } catch (err) {
          /* ignore */
        }
        // Inércia: projeta a posição final e encaixa na foto mais próxima
        const projected = galleryTrack.scrollLeft - drag.velocity * 220;
        const target = Math.max(0, Math.min(maxScroll(), projected));
        scrollToIndex(nearestIndex(target));

        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        }, 0);
        restartAutoplay();
      }
    }
    galleryTrack.addEventListener("pointerup", endDrag);
    galleryTrack.addEventListener("pointercancel", endDrag);

    // Fase de captura: bloqueia o clique que "sobra" depois de um arrasto
    galleryTrack.addEventListener(
      "click",
      (e) => {
        if (suppressClick) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true
    );

    /* Autoplay suave: pausa com mouse/foco/toque, fora da tela e com lightbox aberto */
    const AUTOPLAY_MS = 5200;
    let autoTimer = null;
    let inView = false;
    let hovering = false;
    let focusedInside = false;
    let touching = false;

    function canAutoplay() {
      const lb = document.getElementById("lightbox");
      return (
        !reduceMotion &&
        total > 1 &&
        inView &&
        !hovering &&
        !focusedInside &&
        !touching &&
        !document.hidden &&
        !(lb && lb.classList.contains("is-open"))
      );
    }

    function autoStep() {
      if (!canAutoplay()) return;
      const atEnd = galleryTrack.scrollLeft >= maxScroll() - EDGE;
      if (atEnd) scrollToIndex(0);
      else scrollByStep(1);
    }

    function stopAutoplay() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      if (reduceMotion || total < 2) return;
      autoTimer = setInterval(autoStep, AUTOPLAY_MS);
    }

    if (galleryRoot) {
      galleryRoot.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") hovering = true;
      });
      galleryRoot.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") hovering = false;
      });
      galleryRoot.addEventListener("focusin", () => {
        focusedInside = true;
      });
      galleryRoot.addEventListener("focusout", () => {
        focusedInside = false;
      });
      galleryRoot.addEventListener(
        "touchstart",
        () => {
          touching = true;
        },
        { passive: true }
      );
      galleryRoot.addEventListener(
        "touchend",
        () => {
          // dá um tempo para o usuário olhar antes de voltar a avançar sozinho
          setTimeout(() => {
            touching = false;
          }, 6000);
        },
        { passive: true }
      );
    }

    if ("IntersectionObserver" in window) {
      const viewObserver = new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
        },
        { threshold: 0.35 }
      );
      viewObserver.observe(galleryTrack);
    } else {
      inView = true;
    }

    updateState();
    restartAutoplay();
  }

  /* ============================================================
     LIGHTBOX (v3)
     - imagem com transição e preload das vizinhas
     - swipe no celular, foco preso dentro do modal
     - ao fechar devolve o foco e sincroniza o carrossel
     ============================================================ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  let currentGalleryIndex = 0;
  let lastFocusedEl = null;

  /* Esc fecha o menu mobile mesmo se não houver lightbox */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (navMenu && navMenu.classList.contains("active")) closeMenu();
  });

  if (lightbox && lightboxImage && galleryItems.length > 0) {
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Foto ampliada");

    const preloaded = new Set();
    function preload(src) {
      if (!src || preloaded.has(src)) return;
      preloaded.add(src);
      const img = new Image();
      img.src = src;
    }

    function renderLightboxItem(index, direction) {
      const item = galleryItems[index];
      if (!item) return;
      const caption = item.getAttribute("data-caption") || "";
      const imgEl = item.querySelector("img");

      lightboxImage.replaceChildren();
      lightboxImage.dataset.dir = direction > 0 ? "next" : direction < 0 ? "prev" : "";

      if (imgEl) {
        const img = new Image();
        img.decoding = "async";
        img.src = imgEl.currentSrc || imgEl.src;
        img.alt = imgEl.alt || caption;
        lightboxImage.appendChild(img);
      } else {
        lightboxImage.textContent = caption || "Foto";
      }

      currentGalleryIndex = index;

      // pré-carrega as vizinhas para a troca ser instantânea
      const n = galleryItems.length;
      [(index + 1) % n, (index - 1 + n) % n].forEach((i) => {
        const neighbor = galleryItems[i].querySelector("img");
        if (neighbor) preload(neighbor.currentSrc || neighbor.src);
      });
    }

    function openLightbox(index, trigger) {
      lastFocusedEl = trigger || document.activeElement;
      renderLightboxItem(index, 0);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("no-scroll");
      if (lightboxClose) lightboxClose.focus({ preventScroll: true });
    }

    function closeLightbox() {
      if (!lightbox.classList.contains("is-open")) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      if (!body.classList.contains("nav-open")) body.classList.remove("no-scroll");

      // leva o carrossel até a foto que estava sendo vista
      if (gallerySyncTo) gallerySyncTo(currentGalleryIndex);

      if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
        lastFocusedEl.focus({ preventScroll: true });
      }
    }

    function showNext(direction) {
      const n = galleryItems.length;
      renderLightboxItem((currentGalleryIndex + direction + n) % n, direction);
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index, item));
    });

    if (lightboxPrev) lightboxPrev.addEventListener("click", () => showNext(-1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => showNext(1));
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    /* Swipe no celular */
    let lbTouchX = 0;
    let lbTouchY = 0;
    lightbox.addEventListener(
      "touchstart",
      (e) => {
        lbTouchX = e.touches[0].clientX;
        lbTouchY = e.touches[0].clientY;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - lbTouchX;
        const dy = e.changedTouches[0].clientY - lbTouchY;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
        showNext(dx < 0 ? 1 : -1);
      },
      { passive: true }
    );

    /* Teclado + foco preso dentro do modal */
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showNext(-1);
      } else if (e.key === "ArrowRight") {
        showNext(1);
      } else if (e.key === "Tab") {
        const focusables = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!focusables.includes(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
})();