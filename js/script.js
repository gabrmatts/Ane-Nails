(function () {
  "use strict";

  const body = document.body;

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  // BUGFIX: .header-container usa backdrop-filter, o que faz vários navegadores
  // (Safari/iOS e Chrome) tratarem ele como "containing block" de elementos
  // position:fixed. Isso prendia o menu mobile dentro da barrinha do header
  // em vez de cobrir a tela inteira. Solução: mover o menu para o final do
  // <body> enquanto estiver aberto no mobile, e devolver ao lugar original
  // (dentro do header) ao fechar ou ao voltar para o desktop.
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

    // Se a tela virar desktop com o menu mobile aberto (ex: rotação de
    // tablet ou redimensionamento), fecha e restaura o menu no lugar certo.
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

  /* ---------- Hero entrance animation ---------- */
  const animatedItems = document.querySelectorAll(".animate-item");
  if (animatedItems.length > 0) {
    setTimeout(() => {
      animatedItems.forEach((el) => el.classList.add("is-visible"));
    }, 150);
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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

  /* ---------- Feedback (carrossel em destaque, um por vez) ---------- */
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

    // Swipe no mobile
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

  /* ---------- Gallery filters ---------- */
  const galleryFilters = document.getElementById("galleryFilters");
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryEmpty = document.getElementById("galleryEmpty");

  if (galleryFilters && galleryGrid) {
    const filterButtons = Array.from(galleryFilters.querySelectorAll(".gallery__filter"));
    const items = Array.from(galleryGrid.querySelectorAll(".gallery__item"));

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");

        filterButtons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });

        let visibleCount = 0;
        items.forEach((item) => {
          const matches = filter === "all" || item.getAttribute("data-category") === filter;
          item.classList.toggle("is-hidden", !matches);
          if (matches) visibleCount++;
        });

        if (galleryEmpty) galleryEmpty.hidden = visibleCount > 0;
      });
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