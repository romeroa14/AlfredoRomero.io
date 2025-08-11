(function(){
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=new Date().getFullYear();}

  function updateHeaderHeight(){
    const header=document.querySelector('.header');
    if(!header) return;
    const h=header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-h', h+ 'px');
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, {passive:true});

  // Header sticky effects
  function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  
  window.addEventListener('scroll', handleHeaderScroll, {passive: true});

  // Scroll Animations with Intersection Observer
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          
          // Special handling for stagger animations
          if (entry.target.classList.contains('stagger-container')) {
            const items = entry.target.querySelectorAll('.stagger-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animated');
              }, index * 100);
            });
          }
          
          // Special handling for text reveal
          if (entry.target.classList.contains('text-reveal')) {
            entry.target.classList.add('revealed');
            const spans = entry.target.querySelectorAll('span');
            spans.forEach((span, index) => {
              setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
              }, index * 50);
            });
          }
          
          // Special handling for section reveal
          if (entry.target.classList.contains('section-reveal')) {
            entry.target.classList.add('revealed');
          }
          
          // Special handling for card animations
          if (entry.target.classList.contains('card-animate')) {
            entry.target.classList.add('animated');
          }
          
          // Special handling for counter animations
          if (entry.target.classList.contains('counter-animate')) {
            entry.target.classList.add('animated');
            animateCounter(entry.target);
          }
          
          // Special handling for progress bars
          if (entry.target.classList.contains('progress-bar')) {
            entry.target.classList.add('animated');
          }
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(`
      .animate-on-scroll,
      .fade-in-up,
      .fade-in-left,
      .fade-in-right,
      .fade-in-scale,
      .slide-in-up,
      .slide-in-down,
      .stagger-container,
      .section-reveal,
      .card-animate,
      .text-reveal,
      .counter-animate,
      .progress-bar
    `);

    animatedElements.forEach(el => observer.observe(el));
  }

  // Counter animation function
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target') || element.textContent);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  // Parallax effect for background elements
  function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-speed') || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    }, {passive: true});
  }

  // Smooth reveal for sections
  function initSectionReveals() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-10% 0px -10% 0px'
    });

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // Initialize all animations
  function initAnimations() {
    initScrollAnimations();
    initParallax();
    initSectionReveals();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      const el=document.querySelector(id);
      if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}    
    });
  });
})();
