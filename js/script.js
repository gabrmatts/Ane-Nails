(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const body = document.body;

  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
  }

  function toggleMenu() {
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

  /* ---------- Hero entrance animation ---------- */
  const animatedItems = document.querySelectorAll(".animate-item");
  setTimeout(() => {
    animatedItems.forEach((el) => el.classList.add("is-visible"));
  }, 150);

  /* ---------- Header background on scroll ---------- */
  const header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 50);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    ".about__grid, .section-head, .service-card, .spotlight, .gallery__item, .perk, .testimonial-card, .faq-item, .contact-card, .final-cta__inner"
  );
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

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove("is-open");
      });
      item.classList.toggle("is-open", !isOpen);
    });
  });

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
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
      lightboxCaption.textContent = caption;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeMenu();
    }
  });
})();