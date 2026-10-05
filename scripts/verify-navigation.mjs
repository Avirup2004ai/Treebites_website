import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/navigation.js', import.meta.url), 'utf8');
function fixture(readyState = 'loading') {
  const events = new Map(), timers = new Map(), classes = new Set(), attributes = new Map();
  let timerId = 0;
  const progress = {
    hidden: true,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name)
  };
  const listen = (type, fn) => events.set(type, [...(events.get(type) || []), fn]);
  vm.runInNewContext(source, {
    URL,
    document: { readyState, getElementById: () => progress, addEventListener: listen },
    window: { location: new URL('http://localhost:5173/products/'), addEventListener: listen },
    setTimeout: (fn, delay) => { timers.set(++timerId, { fn, delay }); return timerId; },
    clearTimeout: id => timers.delete(id)
  });
  const fire = (type, event = {}) => { for (const handler of events.get(type) || []) handler(event); };
  const click = (href, options = {}) => {
    const link = { href, target: options.target || '', hasAttribute: key => key === 'download' && Boolean(options.download) };
    const event = { button: 0, target: { closest: () => link }, defaultPrevented: false, ...options };
    event.target = { closest: () => link };
    fire('click', event);
    assert.equal(event.defaultPrevented, Boolean(options.defaultPrevented), 'Native navigation is not intercepted');
  };
  const tick = delay => {
    for (const [id, timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn(); }
  };
  return { progress, classes, attributes, timers, fire, click, tick };
}

// Initial loading persists until load, then completes without delaying the page.
{
  const f = fixture();
  assert.equal(f.progress.hidden, false);
  assert.equal(f.timers.size, 0, 'Real initial loads do not use a fake completion timer');
  f.fire('load'); assert.equal(f.classes.has('is-complete'), true);
  f.tick(240); assert.equal(f.progress.hidden, true);
}

// Internal navigation starts immediately; an earlier completion cannot hide it.
{
  const f = fixture();
  f.fire('load'); f.click('/our-story/'); f.tick(240);
  assert.equal(f.progress.hidden, false);
  assert.equal(f.classes.has('is-complete'), false);
  f.fire('pagehide'); assert.equal(f.progress.hidden, true);
  f.fire('pageshow', { persisted: true }); assert.equal(f.progress.hidden, true);
  f.click('/categories/'); f.fire('keydown', { key: 'Escape' });
  assert.equal(f.progress.hidden, true);
  f.click('/categories/'); f.tick(15000); assert.equal(f.progress.hidden, true);
}

// Hashes, downloads, external links and modified clicks do not show a loader.
for (const [href, options] of [
  ['/products/#item', {}], ['/products/', {}],
  ['/categories/', { ctrlKey: true }], ['/categories/', { metaKey: true }],
  ['/categories/', { shiftKey: true }], ['/categories/', { altKey: true }],
  ['/categories/', { button: 1 }], ['/categories/', { target: '_blank' }],
  ['/categories/', { download: true }], ['/categories/', { defaultPrevented: true }],
  ['https://www.amazon.in/dp/example', {}], ['https://fashinoworld.com/products/example', {}],
  ['mailto:contact.fashino@gmail.com', {}], ['/assets/example.webp', {}]
]) {
  const f = fixture('complete'); f.click(href, options);
  assert.equal(f.progress.hidden, true, `Unexpected loader for ${href} ${JSON.stringify(options)}`);
}
console.log('Navigation checks passed: initial loading, native link handling, completion, rapid clicks, history restoration, cancellation, and external/modified-click exclusions.');
