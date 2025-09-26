  // --- Mobile Navigation Toggle (FIXED) ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu'); // FIX: statt '.nav'
    const pageBody = document.body;

    function openNav() {
      navMenu.classList.add('active');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Menü schließen');
      navToggle.textContent = '✕';
      pageBody.classList.add('no-scroll');
    }

    function closeNav() {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
      navToggle.textContent = '☰';
      pageBody.classList.remove('no-scroll');
    }

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        if (isOpen) {
          closeNav();
        } else {
          openNav();
        }
      });

      // Links im Menü schließen das Menü wieder
      document.querySelectorAll('.nav-menu .nav-link').forEach(a => {
        a.addEventListener('click', () => closeNav());
      });

      // ESC zum Schließen
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          closeNav();
        }
      });
    }

    // Active-Nav via IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const links = [...document.querySelectorAll('.nav-link')];
    const byHash = h => links.find(a => a.getAttribute('href') === h);

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          links.forEach(a => a.removeAttribute('aria-current'));
          const active = byHash(id);
          if (active) active.setAttribute('aria-current', 'page');
        }
      });
    }, {rootMargin: '-40% 0px -50% 0px', threshold: 0.01});

    sections.forEach(s => s.id && io.observe(s));