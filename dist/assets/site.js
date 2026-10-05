const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileViewport = window.matchMedia('(max-width: 650px)');
const runningAnimations = new Set();
const easeSettle = 'cubic-bezier(.22, 1, .36, 1)';

function animate(element, frames, options = {}) {
  if (reducedMotion.matches || !element?.animate) return null;
  const animation = element.animate(frames, { duration: 440, easing: easeSettle, ...options });
  runningAnimations.add(animation);
  animation.finished.then(
    () => runningAnimations.delete(animation),
    () => runningAnimations.delete(animation)
  );
  return animation;
}

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    for (const animation of runningAnimations) animation.finish();
  }
});

const menuButton = document.querySelector('.mobile-toggle');
const navigation = document.querySelector('#main-nav');
let menuAnimation;
let menuRevision = 0;

function setMenu(open, immediate = false) {
  if (!menuButton || !navigation) return;
  const revision = ++menuRevision;
  const interrupted = menuAnimation?.playState === 'running' ? getComputedStyle(navigation) : null;
  const currentFrame = interrupted ? { opacity: interrupted.opacity, transform: interrupted.transform } : null;
  menuAnimation?.cancel();
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.inert = !open && mobileViewport.matches;

  const finish = () => {
    if (revision !== menuRevision) return;
    navigation.classList.toggle('open', open);
    navigation.inert = !open && mobileViewport.matches;
  };
  if (open) navigation.classList.add('open');
  const visible = navigation.classList.contains('open');
  menuAnimation = !immediate && mobileViewport.matches && visible
    ? animate(navigation, open
      ? [currentFrame || { opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }]
      : [currentFrame || { opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-5px)' }],
    { duration: open ? 320 : 160 })
    : null;
  if (menuAnimation) menuAnimation.finished.then(finish, () => {});
  else finish();
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false, true);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (menuButton?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenu(false);
});
mobileViewport.addEventListener('change', () => setMenu(false, true));
setMenu(false, true);

const search = document.querySelector('#product-search');
const cards = [...document.querySelectorAll('.catalogue-grid .product-card')];
function filterProducts() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  for (const card of cards) {
    const visible = card.dataset.name.includes(query);
    card.hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('.result-count').textContent = `${count} product${count === 1 ? '' : 's'}`;
  document.querySelector('.empty-state').hidden = count !== 0;
}
search?.addEventListener('input', filterProducts);
document.querySelector('#clear-search')?.addEventListener('click', () => {
  search.value = '';
  filterProducts();
  search.focus();
});

// Decode the next packshot before replacing the current one. A later click wins.
const mainPhoto = document.querySelector('#main-product-photo');
const thumbnails = [...document.querySelectorAll('.thumbnail')];
let photoRevision = 0;
let photoAnimation;
if (mainPhoto && thumbnails.length) {
  const gallery = document.querySelector('.product-gallery');
  const status = document.createElement('p');
  status.className = 'gallery-status sr-only';
  status.setAttribute('role', 'status');
  gallery.append(status);

  for (const button of thumbnails) button.addEventListener('click', async () => {
    const revision = ++photoRevision;
    photoAnimation?.cancel();
    status.textContent = '';
    status.classList.add('sr-only');
    gallery.removeAttribute('aria-busy');
    if (button.classList.contains('selected')) return;
    gallery.setAttribute('aria-busy', 'true');
    const preview = new Image();
    preview.sizes = mainPhoto.sizes;
    if (button.dataset.srcset) preview.srcset = button.dataset.srcset;
    preview.src = button.dataset.image;

    try {
      if (preview.decode) await preview.decode();
      else await new Promise((resolve, reject) => {
        if (preview.complete) return preview.naturalWidth ? resolve() : reject();
        preview.onload = resolve;
        preview.onerror = reject;
      });
      if (revision !== photoRevision) return;
      if (button.dataset.srcset) mainPhoto.srcset = button.dataset.srcset;
      else mainPhoto.removeAttribute('srcset');
      mainPhoto.src = button.dataset.image;
      mainPhoto.alt = button.getAttribute('aria-label').replace(/^Show/, 'TreeBites');
      for (const thumb of thumbnails) {
        thumb.classList.toggle('selected', thumb === button);
        thumb.setAttribute('aria-pressed', String(thumb === button));
      }
      photoAnimation = animate(mainPhoto, [{ opacity: .35 }, { opacity: 1 }], { duration: 240 });
    } catch {
      if (revision !== photoRevision) return;
      status.classList.remove('sr-only');
      status.textContent = 'This image could not load. Please try again.';
    } finally {
      if (revision === photoRevision) gallery.removeAttribute('aria-busy');
    }
  });
}

// Native disclosure sizing happens once. Only its text fades: no per-frame
// height changes, repeated measurements or layout work during the animation.
for (const details of document.querySelectorAll('.faq-list details, .product-accordions details')) {
  const content = details.querySelector('p, dl');
  let contentAnimation;
  details.addEventListener('toggle', () => {
    contentAnimation?.cancel();
    if (details.open && content) {
      contentAnimation = animate(content, [{ opacity: .3 }, { opacity: 1 }], { duration: 180 });
    }
  });
}

// A short fade on a few below-fold headings. Cards, packshots and the hero stay
// still while scrolling; visible content never jumps back to a starting pose.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal.unobserve(entry.target);
      if (entry.boundingClientRect.bottom <= 0) continue;
      animate(entry.target, [{ opacity: .5 }, { opacity: 1 }], { duration: 280 });
    }
  }, { threshold: .2 });
  for (const element of document.querySelectorAll('.section-heading, .story-section-heading')) {
    if (element.getBoundingClientRect().top >= window.innerHeight) reveal.observe(element);
  }
}
