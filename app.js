document.addEventListener('DOMContentLoaded', () => {

  // Dynamically inject Base64 images
  if (typeof IMAGES !== 'undefined') {
    const heroBg1 = document.getElementById('heroBg1');
    const heroBg2 = document.getElementById('heroBg2');
    const teamHoursSection = document.querySelector('.team-hours');
    const blogImg1 = document.getElementById('blogImg1');
    const blogImg2 = document.getElementById('blogImg2');
    const blogImg3 = document.getElementById('blogImg3');

    if (heroBg1) heroBg1.style.backgroundImage = `url('${IMAGES.hero}')`;
    if (heroBg2) heroBg2.style.backgroundImage = `url('${IMAGES.teamBg}')`;
    if (teamHoursSection) teamHoursSection.style.backgroundImage = `url('${IMAGES.teamBg}')`;
    
    if (blogImg1) blogImg1.src = IMAGES.blogTools;
    if (blogImg2) blogImg2.src = IMAGES.blogHaircut;
    if (blogImg3) blogImg3.src = IMAGES.blogShave;
  }

  /* ==========================================
     GLOBAL DOM SELECTORS & STATE
     ========================================== */
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Slider State
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  let currentSlide = 0;
  let slideInterval;

  // Booking Modal State
  const bookingModal = document.getElementById('bookingModal');
  const bookNowCTAs = document.querySelectorAll('.btn-book-now');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalSteps = document.querySelectorAll('.modal-step');
  const stepNodes = document.querySelectorAll('.step-node');
  const progressFill = document.querySelector('.progress-bar-fill');
  
  const prevStepBtn = document.getElementById('prevStep');
  const nextStepBtn = document.getElementById('nextStep');
  const successCloseBtn = document.getElementById('successClose');
  
  let activeStep = 0; // 0-indexed steps: 0, 1, 2, 3, 4 (Success)
  let selectedService = { name: '', price: '' };
  let selectedBarber = { name: '', role: '' };
  let selectedDate = '';
  let selectedTime = '';

  /* ==========================================
     SCROLL EFFECTS (STICKY HEADER & ACTIVE LINKS)
     ========================================== */
  const handleScroll = () => {
    // Header transition on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Nav Links tracking
    let scrollPosition = window.scrollY + 150;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init on load

  /* ==========================================
     MOBILE NAVIGATION MENU
     ========================================== */
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu on clicking any navigation link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  /* ==========================================
     HERO SLIDER LOGIC (AUTOMATED & MANUAL)
     ========================================== */
  const showSlide = (n) => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  };

  const nextSlide = () => {
    showSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    showSlide(currentSlide - 1);
  };

  // Start Autoplay
  const startSlideShow = () => {
    slideInterval = setInterval(nextSlide, 6000);
  };

  // Reset Autoplay on manual action
  const resetSlideShow = () => {
    clearInterval(slideInterval);
    startSlideShow();
  };

  if (nextBtn && prevBtn && slides.length > 0) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetSlideShow();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetSlideShow();
    });

    startSlideShow();
  }

  /* ==========================================
     REVEAL ANIMATIONS ON SCROLL (INTERSECTION OBSERVER)
     ========================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }

  /* ==========================================
     CUSTOM DYNAMIC NOTIFICATION SYSTEM
     ========================================== */
  const showNotification = (message, iconSVG = null) => {
    // Create container if missing
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-notification';
    
    const svgIcon = iconSVG || `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    
    toast.innerHTML = `
      ${svgIcon}
      <div class="notification-content">${message}</div>
    `;

    container.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
      toast.style.transition = 'all 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4000);
  };

  /* ==========================================
     INTERACTIVE DYNAMIC BOOKING MODAL WIZARD
     ========================================== */

  // Form selections and bindings
  const serviceCards = document.querySelectorAll('.service-options .option-card');
  const barberCards = document.querySelectorAll('.barber-options .barber-card');
  const timeSlots = document.querySelectorAll('.time-slots-grid .time-slot');
  const datePicker = document.getElementById('bookingDate');
  
  // Set date picker minimum to today
  if (datePicker) {
    const today = new Date().toISOString().split('T')[0];
    datePicker.min = today;
  }

  // Open booking modal
  bookNowCTAs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Auto-preselect service if clicked from a specific service card pricing link
      const preselectedService = btn.getAttribute('data-service');
      if (preselectedService) {
        const optionCard = document.querySelector(`.option-card[data-value="${preselectedService}"]`);
        if (optionCard) {
          serviceCards.forEach(c => c.classList.remove('selected'));
          optionCard.classList.add('selected');
          selectedService.name = optionCard.querySelector('.option-name').textContent;
          selectedService.price = optionCard.querySelector('.option-price').textContent;
        }
      }

      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      goToStep(0);
    });
  });

  // Close booking modal
  const closeModal = () => {
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset state after animation closes
    setTimeout(() => {
      activeStep = 0;
      selectedService = { name: '', price: '' };
      selectedBarber = { name: '', role: '' };
      selectedDate = '';
      selectedTime = '';
      
      serviceCards.forEach(c => c.classList.remove('selected'));
      barberCards.forEach(c => c.classList.remove('selected'));
      timeSlots.forEach(s => s.classList.remove('selected'));
      if (datePicker) datePicker.value = '';
      
      document.getElementById('clientName').value = '';
      document.getElementById('clientPhone').value = '';
      document.getElementById('clientEmail').value = '';
      document.getElementById('bookingNotes').value = '';
    }, 400);
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeModal();
    }
  });

  // Step Navigation Engine
  const goToStep = (stepIndex) => {
    activeStep = stepIndex;

    // Show/Hide steps
    modalSteps.forEach((step, idx) => {
      step.classList.toggle('active', idx === activeStep);
    });

    // Update steps visual indicators
    stepNodes.forEach((node, idx) => {
      node.classList.remove('active', 'completed');
      if (idx === activeStep) {
        node.classList.add('active');
      } else if (idx < activeStep) {
        node.classList.add('completed');
      }
    });

    // Update Progress Bar Line width
    const totalSteps = stepNodes.length - 1; // Success step not in indicators
    const progressPercent = (Math.min(activeStep, totalSteps) / totalSteps) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // Manage Next/Prev footer button displays
    if (activeStep === 0) {
      prevStepBtn.style.display = 'none';
      nextStepBtn.textContent = 'NEXT STEP';
      nextStepBtn.style.display = 'inline-flex';
      if (successCloseBtn) successCloseBtn.style.display = 'none';
    } else if (activeStep === 3) {
      prevStepBtn.style.display = 'inline-flex';
      nextStepBtn.textContent = 'CONFIRM BOOKING';
      nextStepBtn.style.display = 'inline-flex';
      if (successCloseBtn) successCloseBtn.style.display = 'none';
    } else if (activeStep === 4) {
      // Success step
      prevStepBtn.style.display = 'none';
      nextStepBtn.style.display = 'none';
      if (successCloseBtn) successCloseBtn.style.display = 'inline-flex';
    } else {
      prevStepBtn.style.display = 'inline-flex';
      nextStepBtn.textContent = 'NEXT STEP';
      nextStepBtn.style.display = 'inline-flex';
      if (successCloseBtn) successCloseBtn.style.display = 'none';
    }
  };

  // Card Selections triggers
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedService.name = card.querySelector('.option-name').textContent.trim();
      selectedService.price = card.querySelector('.option-price').textContent.trim();
    });
  });

  barberCards.forEach(card => {
    card.addEventListener('click', () => {
      barberCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedBarber.name = card.querySelector('.barber-name').textContent.trim();
      selectedBarber.role = card.querySelector('.barber-role').textContent.trim();
    });
  });

  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.textContent.trim();
    });
  });

  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      selectedDate = e.target.value;
    });
  }

  // Validate Step before advancing
  const validateStep = (step) => {
    if (step === 0) {
      if (!selectedService.name) {
        showNotification('Please select a service before proceeding.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }
    } else if (step === 1) {
      if (!selectedBarber.name) {
        showNotification('Please select a preferred stylist.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }
    } else if (step === 2) {
      if (!selectedDate) {
        showNotification('Please select a date for your visit.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }
      if (!selectedTime) {
        showNotification('Please select an available time slot.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }
    } else if (step === 3) {
      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const email = document.getElementById('clientEmail').value.trim();

      if (!name || !phone || !email) {
        showNotification('Please complete all contact details.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return false;
      }
    }
    return true;
  };

  // Compile Summary details for success screen
  const compileBookingSummary = () => {
    document.getElementById('summaryService').textContent = selectedService.name;
    document.getElementById('summaryPrice').textContent = selectedService.price;
    document.getElementById('summaryBarber').textContent = selectedBarber.name;
    
    // Format date beautifully
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    document.getElementById('summaryDateTime').textContent = `${formattedDate} @ ${selectedTime}`;
  };

  // Click handler next/confirm button
  nextStepBtn.addEventListener('click', () => {
    if (!validateStep(activeStep)) return;

    if (activeStep === 3) {
      // Complete booking process
      compileBookingSummary();
      goToStep(4);
      showNotification('Appointment successfully booked! See you soon.');
    } else {
      goToStep(activeStep + 1);
    }
  });

  // Click handler prev button
  prevStepBtn.addEventListener('click', () => {
    if (activeStep > 0) {
      goToStep(activeStep - 1);
    }
  });

  // Success step closing trigger
  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', closeModal);
  }

  /* ==========================================
     NEWSLETTER FORM HANDLING WITH VALIDATION
     ========================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('.newsletter-input');
      const email = emailInput.value.trim();

      if (!email) {
        showNotification('Please enter your email address.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please provide a valid email address.', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`);
        return;
      }

      // Success
      showNotification('Thank you for subscribing to our newsletter!', `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`);
      emailInput.value = '';
    });
  }
});
