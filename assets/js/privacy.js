(() => {
  'use strict';

  const script = document.currentScript;
  const key = 'zaprzatany.privacy.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let choice = null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.version === 1 && typeof saved.analytics === 'boolean' &&
        typeof saved.youtube === 'boolean' && Number.isFinite(saved.time) &&
        saved.time <= Date.now() && Date.now() - saved.time < lifetime) choice = saved;
  } catch { /* Without storage, consent applies only to this page. */ }

  const panel = document.getElementById('privacy-panel');
  const closeButton = document.querySelector('[data-privacy-close]');
  const analytics = document.getElementById('privacy-analytics');
  const youtube = document.getElementById('privacy-youtube');
  let analyticsLoaded = false;
  let expiry;

  window.zaprzatanyBeforeSend = (_type, payload) =>
    choice?.analytics && Date.now() - choice.time < lifetime ? payload : false;

  const loadVideo = (container) => {
    if (container.querySelector('iframe')) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(container.dataset.videoId)}`;
    frame.title = container.dataset.videoTitle;
    frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    container.append(frame);
    container.querySelector('.youtube-placeholder').hidden = true;
  };

  const apply = () => {
    if (choice?.analytics && !analyticsLoaded && script.dataset.umamiId) {
      analyticsLoaded = true;
      const tracker = document.createElement('script');
      tracker.src = 'https://cloud.umami.is/script.js';
      tracker.dataset.websiteId = script.dataset.umamiId;
      tracker.dataset.beforeSend = 'zaprzatanyBeforeSend';
      tracker.dataset.excludeSearch = 'true';
      tracker.dataset.excludeHash = 'true';
      tracker.dataset.doNotTrack = 'true';
      document.head.append(tracker);
    }
    if (choice?.youtube) document.querySelectorAll('[data-video-id]').forEach(loadVideo);
    clearTimeout(expiry);
    // Recheck long-lived tabs without exceeding the browser's timeout limit.
    if (choice) expiry = setTimeout(() => {
      if (Date.now() - choice.time >= lifetime) location.reload();
      else apply();
    }, Math.min(lifetime - (Date.now() - choice.time), 2147483647));
  };

  const openSettings = () => {
    closeButton.hidden = !choice;
    analytics.checked = choice?.analytics === true;
    youtube.checked = choice?.youtube === true;
    panel.hidden = false;
    document.getElementById('privacy-title').focus();
  };

  closeButton.hidden = !choice;
  closeButton.addEventListener('click', () => {
    if (!choice) return;
    panel.hidden = true;
    document.querySelector('.site-footer [data-privacy-settings]').focus({ preventScroll: true });
  });

  document.addEventListener('click', (event) => {
    if (!choice || panel.hidden || panel.contains(event.target) ||
        event.target.closest('[data-privacy-settings]')) return;
    const focusWasInside = panel.contains(document.activeElement);
    panel.hidden = true;
    if (focusWasInside) {
      document.querySelector('.site-footer [data-privacy-settings]').focus({ preventScroll: true });
    }
  });

  document.querySelectorAll('[data-privacy-settings]').forEach((link) => {
    link.hidden = false;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (choice && !panel.hidden) {
        panel.hidden = true;
        link.focus({ preventScroll: true });
      } else {
        openSettings();
      }
    });
  });
  document.querySelectorAll('[data-video-consent]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => loadVideo(button.closest('[data-video-id]')));
  });
  document.querySelectorAll('[data-privacy-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.privacyChoice;
      const previousAnalytics = choice?.analytics;
      choice = {
        version: 1,
        time: Date.now(),
        analytics: action === 'accept' || (action === 'save' && analytics.checked),
        youtube: action === 'accept' || (action === 'save' && youtube.checked),
      };
      try { localStorage.setItem(key, JSON.stringify(choice)); } catch { /* Page-only choice. */ }
      if (!choice.youtube) document.querySelectorAll('[data-video-id]').forEach((container) => {
        container.querySelector('iframe')?.remove();
        container.querySelector('.youtube-placeholder').hidden = false;
      });
      panel.hidden = true;
      // Unload an already running tracker on withdrawal, including its listeners.
      if (previousAnalytics && !choice.analytics) location.reload();
      else apply();
      document.querySelector('.site-footer [data-privacy-settings]').focus({ preventScroll: true });
    });
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      choice = null;
      location.reload();
    }
  });
  if (!choice) panel.hidden = false;
  apply();
})();
