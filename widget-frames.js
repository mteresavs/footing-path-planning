window.addEventListener('message', (event) => {
  if (event.data?.type !== 'helix-widget-height' || !Number.isFinite(event.data.height)) return;
  for (const frame of document.querySelectorAll('iframe[data-helix-widget]')) {
    if (frame.contentWindow === event.source) frame.style.height = `${Math.max(180, Math.min(6000, event.data.height + 8))}px`;
  }
});
