const root = document.documentElement;
try {
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  else if (matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';
} catch (e) {}

document.querySelector('.theme-btn').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

const menu = document.getElementById('menu');
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

// Work page filters
const fbtns = document.querySelectorAll('.filters button');
if (fbtns.length) {
  const tiles = document.querySelectorAll('.tile');
  const empty = document.querySelector('.empty');
  fbtns.forEach(b => b.addEventListener('click', () => {
    fbtns.forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    let shown = 0;
    tiles.forEach(t => {
      const ok = f === 'all' || t.dataset.cat.split(' ').includes(f);
      t.hidden = !ok;
      if (ok) shown++;
    });
    // first visible tile becomes the wide feature tile
    tiles.forEach(t => t.classList.remove('feature'));
    const first = [...tiles].find(t => !t.hidden);
    if (first && f === 'all') first.classList.add('feature');
    empty.hidden = shown > 0;
  }));
}

// Click a project with a real image -> open the full image in a lightbox
(() => {
  const links = document.querySelectorAll('.tile[data-full]');
  if (!links.length) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lb-close" aria-label="Close">×</button><p class="lb-title"></p><img alt="">';
  document.body.appendChild(box);
  const img = box.querySelector('img'), title = box.querySelector('.lb-title'), closeBtn = box.querySelector('.lb-close');
  let last = null;
  const open = a => {
    last = a;
    img.src = a.dataset.full;
    img.alt = a.dataset.title || 'Project image';
    img.style.maxHeight = a.dataset.fit ? 'calc(100vh - 150px)' : '';
    title.textContent = a.dataset.title || '';
    box.scrollTop = 0;
    box.classList.add('open');
    document.body.classList.add('lb-lock');
    closeBtn.focus();
  };
  const close = () => {
    box.classList.remove('open');
    document.body.classList.remove('lb-lock');
    if (last) last.focus();
  };
  links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a); }));
  box.addEventListener('click', e => { if (e.target !== img) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
})();
