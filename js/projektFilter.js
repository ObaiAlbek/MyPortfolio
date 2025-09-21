/* projects.js – Suche + Filter für Projekte */
(() => {
  const $  = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const search = $('#projectSearch');
  const chips  = $$('.chip');
  const cards  = $$('.project-card');

  let active = localStorage.getItem('proj.filter') || 'all';
  const norm = s => (s || '').toLowerCase();

  function apply() {
    const term = norm(search?.value);

    cards.forEach(card => {
      const tags  = norm(card.dataset.tags);
      const title = norm(card.querySelector('h3')?.textContent);
      const text  = norm(card.textContent);

      const inFilter = active === 'all' || tags.includes(norm(active));
      const inSearch = !term || tags.includes(term) || title.includes(term) || text.includes(term);

      card.hidden = !(inFilter && inSearch);
    });

    chips.forEach(c => c.classList.toggle('is-active', (c.dataset.filter || 'all') === active));

    const counter = $('#projectCount');
    if (counter) counter.textContent = cards.filter(c => !c.hidden).length;
  }

  function setFilter(f) {
    active = f || 'all';
    localStorage.setItem('proj.filter', active);
    apply();
  }

  chips.forEach(ch => ch.addEventListener('click', () => setFilter(ch.dataset.filter)));
  if (search) {
    let t;
    search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(apply, 120);
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { search.value = ''; apply(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setFilter(active));
  } else {
    setFilter(active);
  }
})();
