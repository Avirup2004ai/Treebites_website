// Inlined immediately after the progress element, so feedback can begin while
// the document is parsing. Native links, history and scroll behavior stay intact.
(() => {
  const progress = document.getElementById('page-progress');
  if (!progress) return;
  let hideTimer;
  let recoveryTimer;
  let revision = 0;

  function reset() {
    revision++;
    clearTimeout(hideTimer);
    clearTimeout(recoveryTimer);
    progress.hidden = true;
    progress.classList.remove('is-complete');
    progress.setAttribute('aria-hidden', 'true');
  }

  function start(watchForCancellation = false) {
    revision++;
    clearTimeout(hideTimer);
    clearTimeout(recoveryTimer);
    progress.classList.remove('is-complete');
    progress.hidden = false;
    progress.removeAttribute('aria-hidden');
    // A stopped or cancelled navigation must never leave stale feedback behind.
    if (watchForCancellation) recoveryTimer = setTimeout(reset, 15000);
  }

  function complete() {
    if (progress.hidden) return;
    clearTimeout(recoveryTimer);
    progress.classList.add('is-complete');
    progress.setAttribute('aria-hidden', 'true');
    const current = ++revision;
    hideTimer = setTimeout(() => {
      if (current === revision) reset();
    }, 240);
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, window.location.href);
    if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
    if (/\.[^/]+$/.test(destination.pathname) && !/\.html?$/i.test(destination.pathname)) return;
    // No preventDefault, fetch router or intentional navigation delay.
    start(true);
  });

  window.addEventListener('load', complete, { once: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted) reset();
  });
  window.addEventListener('pagehide', reset);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') reset();
  });

  if (document.readyState !== 'complete') start();
})();
