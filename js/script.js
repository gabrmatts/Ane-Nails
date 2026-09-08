(function () {
  "use strict";

  const body = document.body;

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

  /* ---------- Gallery carousel ---------- */
  const galleryTrack = document.getElementById("galleryTrack");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const galleryDots = document.getElementById("galleryDots");
  const galleryCounter = document.getElementById("galleryCounter");

  if (galleryTrack) {
    const slides = Array.from(galleryTrack.querySelectorAll(".gallery-carousel__slide"));
    const total = slides.length;

    if (galleryCounter && total) {
      galleryCounter.textContent = `01 / ${String(total).padStart(2, "0")}`;
    }

    if (galleryDots && slides.length > 1) {
      slides.forEach((slide, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para foto ${i + 1}`);
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
          slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
        galleryDots.appendChild(dot);
      });
    }

    const dots = galleryDots ? Array.from(galleryDots.children) : [];

    function setCurrentSlide(index) {
      slides.forEach((slide, i) => slide.classList.toggle("is-current", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      if (galleryCounter && total) {
        galleryCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
      }
    }

    if (slides.length) setCurrentSlide(0);

    function scrollByStep(direction) {
      const slide = slides[0];
      if (!slide) return;
      const gap = 16;
      const amount = (slide.getBoundingClientRect().width + gap) * direction;
      galleryTrack.scrollBy({ left: amount, behavior: "smooth" });
    }

    if (galleryPrev) galleryPrev.addEventListener("click", () => scrollByStep(-1));
    if (galleryNext) galleryNext.addEventListener("click", () => scrollByStep(1));

    if (slides.length) {
      let scrollTimeout;
      galleryTrack.addEventListener(
        "scroll",
        () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            const trackRect = galleryTrack.getBoundingClientRect();
            let closestIndex = 0;
            let closestDistance = Infinity;
            slides.forEach((slide, i) => {
              const distance = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            });
            setCurrentSlide(closestIndex);
          }, 110);
        },
        { passive: true }
      );
    }

    let isDragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    galleryTrack.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartScroll = galleryTrack.scrollLeft;
      galleryTrack.classList.add("is-dragging");
      galleryTrack.setPointerCapture(e.pointerId);
    });

    galleryTrack.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX;
      if (Math.abs(delta) > 5) dragMoved = true;
      galleryTrack.scrollLeft = dragStartScroll - delta;
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      galleryTrack.classList.remove("is-dragging");
    }
    galleryTrack.addEventListener("pointerup", endDrag);
    galleryTrack.addEventListener("pointercancel", endDrag);

    slides.forEach((slide) => {
      slide.addEventListener(
        "click",
        (e) => {
          if (dragMoved) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        },
        true
      );
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  let currentGalleryIndex = 0;

  function renderLightboxItem(index) {
    const item = galleryItems[index];
    if (!item) return;
    const caption = item.getAttribute("data-caption") || "";
    const imgEl = item.querySelector("img");

    lightboxImage.innerHTML = "";
    if (imgEl) {
      const clone = imgEl.cloneNode(true);
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.objectFit = "cover";
      clone.style.borderRadius = "18px";
      lightboxImage.appendChild(clone);
    } else {
      lightboxImage.textContent = caption || "Foto";
    }

    if (lightboxCaption) lightboxCaption.textContent = caption;
    currentGalleryIndex = index;
  }

  if (lightbox && lightboxImage && galleryItems.length > 0) {
    galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        renderLightboxItem(index);
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        body.classList.add("no-scroll");
      });
    });

    function showNext(direction) {
      const nextIndex = (currentGalleryIndex + direction + galleryItems.length) % galleryItems.length;
      renderLightboxItem(nextIndex);
    }

    if (lightboxPrev) lightboxPrev.addEventListener("click", () => showNext(-1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => showNext(1));

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      body.classList.remove("no-scroll");
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) {
        if (e.key === "Escape") closeMenu();
        return;
      }
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showNext(-1);
      if (e.key === "ArrowRight") showNext(1);
    });
  }
})();