/* ========================================
   MAIN SCRIPT
   伊根の舟屋ガイドツアー
   ======================================== */

(function () {
  'use strict';

  // ========================================
  // DOM Elements
  // ========================================
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');

  // ========================================
  // Header Scroll Effect
  // ========================================
  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // ========================================
  // Mobile Menu Toggle
  // ========================================
  function toggleMobileMenu() {
    menuBtn.classList.toggle('active');
    nav.classList.toggle('active');
    
    // Toggle aria-expanded
    const isExpanded = menuBtn.classList.contains('active');
    menuBtn.setAttribute('aria-expanded', isExpanded);
    menuBtn.setAttribute('aria-label', isExpanded ? 'メニューを閉じる' : 'メニューを開く');
  }

  menuBtn.addEventListener('click', toggleMobileMenu);

  // Close menu when clicking on a link
  nav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      nav.classList.remove('active');
    });
  });

  // ========================================
  // Gallery Carousel
  // ========================================
  const GalleryCarousel = {
    currentIndex: 0,
    slideCount: 0,
    slidesPerView: 1,
    autoPlayInterval: null,
    autoPlayDelay: 5000,

    init() {
      if (!galleryTrack) return;
      
      this.slideCount = galleryTrack.children.length;
      this.updateSlidesPerView();
      this.bindEvents();
      this.startAutoPlay();
    },

    updateSlidesPerView() {
      const width = window.innerWidth;
      
      if (width >= 1024) {
        this.slidesPerView = 3;
      } else if (width >= 768) {
        this.slidesPerView = 2;
      } else {
        this.slidesPerView = 1;
      }
    },

    bindEvents() {
      galleryPrev.addEventListener('click', () => this.prev());
      galleryNext.addEventListener('click', () => this.next());
      
      window.addEventListener('resize', () => {
        this.updateSlidesPerView();
        this.goTo(this.currentIndex);
      });

      // Pause autoplay on hover
      galleryTrack.parentElement.addEventListener('mouseenter', () => this.stopAutoPlay());
      galleryTrack.parentElement.addEventListener('mouseleave', () => this.startAutoPlay());

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;

      galleryTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        this.stopAutoPlay();
      }, { passive: true });

      galleryTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
        this.startAutoPlay();
      }, { passive: true });
    },

    handleSwipe(startX, endX) {
      const threshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    },

    goTo(index) {
      const maxIndex = this.slideCount - this.slidesPerView;
      this.currentIndex = Math.max(0, Math.min(index, maxIndex));
      
      const translateX = -(this.currentIndex * (100 / this.slidesPerView));
      galleryTrack.style.transform = `translateX(${translateX}%)`;
    },

    prev() {
      this.goTo(this.currentIndex - 1);
    },

    next() {
      const maxIndex = this.slideCount - this.slidesPerView;
      
      if (this.currentIndex >= maxIndex) {
        this.goTo(0);
      } else {
        this.goTo(this.currentIndex + 1);
      }
    },

    startAutoPlay() {
      this.stopAutoPlay();
      this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
    },

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    }
  };

  GalleryCarousel.init();

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      if (href === '#') return;
      
      e.preventDefault();
      
      const target = document.querySelector(href);
      
      if (target) {
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========================================
  // Intersection Observer for Animations
  // ========================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add fade-in animation to sections
  document.querySelectorAll('.section-header, .feature, .plan-card, .news__item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(el);
  });

  // Add CSS for visible state
  const style = document.createElement('style');
  style.textContent = `
    .is-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

})();
