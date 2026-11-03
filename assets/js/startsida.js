/* En ren hjälpfunktion: förbereder bara en mailto-länk och skickar inga uppgifter. */
function buildMailto(values) {
  const clean = value => String(value || '').trim();
  const company = clean(values.foretag).replace(/[\r\n]+/g, ' ');
  const subject = 'Intresse för ANBRA' + (company ? ' – ' + company : '');
  const body = 'Namn: ' + clean(values.namn) + '\nFöretag: ' + company + '\nE-post: ' + clean(values.epost) + '\n\n' + clean(values.meddelande);
  return 'mailto:hej@anbra.se?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
(() => {
  const root = document.documentElement;
  const motionButton = document.querySelector('.motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 880px)');
  const menuCompact = window.matchMedia('(max-width: 600px)');
  let userPaused = false;
  function syncMotion() {
    const blocked = reduced.matches || compact.matches;
    const paused = blocked || userPaused;
    root.dataset.motion = paused ? 'off' : 'on';
    motionButton.disabled = blocked;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('span').textContent = reduced.matches ? 'Rörelse av enligt din inställning' : compact.matches ? 'Stillbild på mindre skärm' : paused ? 'Starta bildens rörelse' : 'Pausa bildens rörelse';
    motionButton.querySelector('use').setAttribute('href', paused ? '#play' : '#pause');
  }
  motionButton.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  reduced.addEventListener('change', syncMotion);
  compact.addEventListener('change', syncMotion);
  syncMotion();
  const syncVisibility = () => { root.dataset.pageHidden = String(document.hidden); };
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('nav-links');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Stäng menyn' : 'Öppna menyn');
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
  });
  menuCompact.addEventListener('change', () => setMenu(false));

  /* Länkarna fungerar som vanliga ankarlänkar utan JavaScript. */
  const tablist = document.querySelector('.step-tabs');
  const tabs = Array.from(tablist.querySelectorAll('.step-tab'));
  const panels = tabs.map(tab => document.querySelector(tab.getAttribute('href')));
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
  });
  function activateStep(index, focus) {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[tabIndex].hidden = !active;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => { event.preventDefault(); activateStep(index, false); });
    tab.addEventListener('keydown', event => {
      let target = null;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (event.key === ' ') target = index;
      if (target !== null) { event.preventDefault(); activateStep(target, true); }
    });
  });
  const hashIndex = panels.findIndex(panel => '#' + panel.id === window.location.hash);
  activateStep(hashIndex < 0 ? 0 : hashIndex, false);

  document.getElementById('kontaktform').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    window.location.href = buildMailto({ namn: form.elements['Namn'].value, foretag: form.elements['Företag'].value, epost: form.elements['E-post'].value, meddelande: form.elements['Meddelande'].value });
  });
})();
