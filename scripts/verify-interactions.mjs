// Browser-API unit checks; these do not replace a visual browser review.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function fixture({ reduced = false, mobile = true, webAnimations = true } = {}) {
  const animations = [], images = [];
  class Events {
    events = new Map();
    addEventListener(type, callback) { this.events.set(type, [...(this.events.get(type) || []), callback]); }
    fire(type, extra = {}) {
      const event = { target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
      const pending = (this.events.get(type) || []).map(callback => callback(event));
      return { event, done: Promise.all(pending) };
    }
  }
  class Element extends Events {
    attributes = new Map(); children = []; dataset = {}; open = false; hidden = false;
    style = { removeProperty(name) { delete this[name]; } };
    classes = new Set();
    constructor() {
      super();
      this.classList = {
        add: name => this.classes.add(name), remove: name => this.classes.delete(name),
        contains: name => this.classes.has(name),
        toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name)
      };
      if (!webAnimations) this.animate = undefined;
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    append(child) { this.children.push(child); }
    closest() { return null; }
    focus() { this.focused = true; }
    getBoundingClientRect() { return { height: this.open ? 220 : 80 }; }
    animate(frames, options) {
      let resolve, reject;
      const animation = { element: this, frames, options, playState: 'running',
        finished: new Promise((yes, no) => { resolve = yes; reject = no; }),
        finish() { this.playState = 'finished'; resolve(); },
        cancel() { this.playState = 'idle'; reject(new Error('cancelled')); }
      };
      animations.push(animation);
      return animation;
    }
  }
  const document = new Events();
  const nodes = Object.fromEntries(['.mobile-toggle', '#main-nav', '#product-search', '.result-count', '.empty-state', '#clear-search', '#main-product-photo', '.product-gallery'].map(selector => [selector, new Element()]));
  const thumbs = [new Element(), new Element()];
  thumbs.forEach((thumb, index) => {
    thumb.dataset = { image: `photo-${index}.webp`, srcset: `photo-${index}.webp 900w` };
    thumb.setAttribute('aria-label', `Show photo ${index}`);
    thumb.setAttribute('aria-pressed', String(index === 0));
  });
  thumbs[0].classList.add('selected');
  nodes['#main-product-photo'].src = 'photo-0.webp';
  nodes['#main-product-photo'].sizes = '48vw';
  const cards = ['pumpkin seeds', 'pure ghee'].map(name => { const card = new Element(); card.dataset.name = name; return card; });
  const details = new Element(), summary = new Element(), detailContent = new Element();
  summary.getBoundingClientRect = () => ({ height: 79 });
  details.querySelector = selector => selector === 'summary' ? summary : detailContent;
  document.querySelector = selector => nodes[selector] || null;
  document.querySelectorAll = selector => ({ '.thumbnail': thumbs, '.catalogue-grid .product-card': cards, '.faq-list details, .product-accordions details': [details] }[selector] || []);
  document.createElement = () => new Element();
  const preference = Object.assign(new Events(), { matches: reduced });
  const viewport = Object.assign(new Events(), { matches: mobile });
  class Image {
    constructor() { images.push(this); }
    decode() { return new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject; }); }
  }
  vm.runInNewContext(source, {
    document, window: { matchMedia: query => query.includes('reduced-motion') ? preference : viewport },
    Image, getComputedStyle: () => ({ borderTopWidth: '0px', borderBottomWidth: '1px', opacity: '0.5', transform: 'translateY(-4px)' })
  });
  return { nodes, thumbs, cards, details, summary, detailContent, preference, viewport, document, animations, images };
}

// Rapid menu reversals settle on the last request; Escape restores focus.
{
  const f = fixture();
  const button = f.nodes['.mobile-toggle'], nav = f.nodes['#main-nav'];
  assert.equal(nav.inert, true);
  button.fire('click'); button.fire('click'); button.fire('click');
  f.animations.at(-1).finish(); await flush();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(nav.classList.contains('open'), true); assert.equal(nav.inert, false);
  f.document.fire('keydown', { key: 'Escape' });
  assert.equal(button.focused, true); assert.equal(nav.inert, true);
  f.animations.at(-1).finish(); await flush();
  assert.equal(nav.classList.contains('open'), false);
  f.viewport.matches = false; f.viewport.fire('change');
  assert.equal(nav.inert, false, 'Desktop navigation remains keyboard accessible');
}

// Selecting the original image cancels an outstanding request without a stale swap.
{
  const f = fixture(), photo = f.nodes['#main-product-photo'];
  const first = f.thumbs[1].fire('click');
  assert.equal(photo.src, 'photo-0.webp');
  f.thumbs[0].fire('click'); f.images[0].resolve(); await first.done;
  assert.equal(photo.src, 'photo-0.webp');
  assert.equal(f.nodes['.product-gallery'].getAttribute('aria-busy'), null);
  const failed = f.thumbs[1].fire('click'); f.images[1].reject(); await failed.done;
  assert.equal(photo.src, 'photo-0.webp'); assert.equal(f.thumbs[0].getAttribute('aria-pressed'), 'true');
  assert.match(f.nodes['.product-gallery'].children[0].textContent, /could not load/);
  const success = f.thumbs[1].fire('click'); f.images[2].resolve(); await success.done;
  assert.equal(photo.src, 'photo-1.webp'); assert.equal(photo.srcset, 'photo-1.webp 900w');
  assert.equal(f.thumbs[1].getAttribute('aria-pressed'), 'true');
  assert.equal(f.nodes['.product-gallery'].getAttribute('aria-busy'), null);
}

// Disclosure controls stay native; only their content fades, without layout animation.
{
  const f = fixture();
  assert.equal(f.summary.fire('click').event.defaultPrevented, false);
  f.details.open = true; f.details.fire('toggle');
  assert.equal(f.animations.at(-1).element, f.detailContent);
  assert.ok(f.animations.at(-1).frames.every(frame => Object.keys(frame).join() === 'opacity'));
  f.details.open = false; f.details.fire('toggle'); await flush();
  assert.equal(f.animations.at(-1).playState, 'idle');
  assert.equal(f.details.style.overflow, undefined);
  f.details.open = true; f.details.fire('toggle');
  f.preference.matches = true; f.preference.fire('change'); await flush();
  assert.equal(f.details.open, true); assert.equal(f.animations.at(-1).playState, 'finished');
  const previousCount = f.animations.length;
  f.details.open = false; f.details.fire('toggle');
  f.details.open = true; f.details.fire('toggle');
  assert.equal(f.animations.length, previousCount, 'Reduced motion creates no new animations');
}

// Reduced motion and browsers without Web Animations retain all controls.
for (const options of [{ reduced: true }, { webAnimations: false }]) {
  const f = fixture(options);
  f.nodes['.mobile-toggle'].fire('click');
  assert.equal(f.nodes['#main-nav'].classList.contains('open'), true);
  assert.equal(f.summary.fire('click').event.defaultPrevented, false);
  const click = f.thumbs[1].fire('click'); f.images[0].resolve(); await click.done;
  assert.equal(f.nodes['#main-product-photo'].src, 'photo-1.webp');
  assert.equal(f.animations.length, 0);
}

// Search remains immediate and clearing restores the full catalogue.
{
  const f = fixture(), search = f.nodes['#product-search'];
  search.value = '  GHEE '; search.fire('input');
  assert.equal(f.cards[0].hidden, true); assert.equal(f.cards[1].hidden, false);
  assert.equal(f.nodes['.result-count'].textContent, '1 product');
  search.value = 'no match'; search.fire('input'); assert.equal(f.nodes['.empty-state'].hidden, false);
  f.nodes['#clear-search'].fire('click');
  assert.equal(f.nodes['.result-count'].textContent, '2 products'); assert.equal(search.focused, true);
}

console.log('Interaction checks passed: rapid menu toggles, native disclosures with opacity-only fades, keyboard focus, gallery races and failures, reduced motion, API fallback, and search.');
