(() => {
  // Decide visibility before the body is parsed, independently of panel setup.
  let saved;
  try { saved = JSON.parse(localStorage.getItem('zaprzatany.privacy.v1')); } catch {}
  const now = Date.now();
  const valid = saved && saved.version === 1 &&
    typeof saved.analytics === 'boolean' && typeof saved.youtube === 'boolean' &&
    Number.isFinite(saved.time) && saved.time <= now &&
    now - saved.time < 180 * 24 * 60 * 60 * 1000;
  if (!valid) document.documentElement.setAttribute('data-privacy-pending', '');
})();
