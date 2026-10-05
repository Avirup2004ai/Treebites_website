const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const icons = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/>',
  facebook: '<path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.972h-1.513c-1.49 0-1.956.931-1.956 1.887v2.262h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.1 24 12.073Z"/>'
};

export function renderSocialLinks(site) {
  return `<div class="footer-socials" role="group" aria-label="Follow TreeBites">${[
    ['instagram', 'Instagram'], ['facebook', 'Facebook']
  ].map(([key, name]) => {
    const icon = `<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">${icons[key]}</svg>`;
    const address = site[key]?.trim();
    if (!address) return `<span class="social-link social-link--unavailable">${icon}<span class="social-link-label">${name}<small>Link unavailable</small></span></span>`;
    const url = new URL(address);
    if (url.protocol !== 'https:' || ![`${key}.com`, `www.${key}.com`, `m.${key}.com`].includes(url.hostname) || url.pathname === '/' || url.username || url.password) {
      throw new Error(`Set ${key} to TreeBites' official HTTPS profile URL in site.config.json.`);
    }
    return `<a class="social-link" href="${escape(url.href)}" target="_blank" rel="noopener noreferrer" aria-label="TreeBites on ${name} (opens in a new tab)">${icon}<span class="social-link-label">${name}</span></a>`;
  }).join('')}</div>`;
}
