(function () {
  "use strict";

  const body = document.body;

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
  }

  function toggleMenu() {
    if (!hamburger || !navMenu) return;
    const isOpen = navMenu.classList.toggle("active");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("no-scroll", isOpen);
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
    ".about__grid, .section-head, .service-card, .spotlight, .gallery__item, .perk, .testimonial-card, .faq-item, .contact-card, .final-cta__inner"
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

  /* ---------- Testimonials carousel (setas + dots no mobile) ---------- */
  const testimonialsTrack = document.getElementById("testimonialsTrack");
  const testimonialsPrev = document.getElementById("testimonialsPrev");
  const testimonialsNext = document.getElementById("testimonialsNext");
  const testimonialsDots = document.getElementById("testimonialsDots");

  if (testimonialsTrack) {
    const cards = Array.from(testimonialsTrack.querySelectorAll(".testimonial-card"));

    if (testimonialsDots && cards.length > 1) {
      cards.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
          cards[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        });
        testimonialsDots.appendChild(dot);
      });
    }

    function scrollByCard(direction) {
      const card = cards[0];
      if (!card) return;
      const gap = 24;
      const amount = (card.getBoundingClientRect().width + gap) * direction;
      testimonialsTrack.scrollBy({ left: amount, behavior: "smooth" });
    }

    if (testimonialsPrev) testimonialsPrev.addEventListener("click", () => scrollByCard(-1));
    if (testimonialsNext) testimonialsNext.addEventListener("click", () => scrollByCard(1));

    if (testimonialsDots) {
      const dots = Array.from(testimonialsDots.children);
      let scrollTimeout;
      testimonialsTrack.addEventListener(
        "scroll",
        () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            const trackRect = testimonialsTrack.getBoundingClientRect();
            let closestIndex = 0;
            let closestDistance = Infinity;
            cards.forEach((card, i) => {
              const cardRect = card.getBoundingClientRect();
              const distance = Math.abs(cardRect.left - trackRect.left);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            });
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === closestIndex));
          }, 100);
        },
        { passive: true }
      );
    }
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