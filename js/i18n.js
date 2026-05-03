/* ============================================
   TRAMA — Bilingual i18n system
   Switches all data-lang elements between ES/EN
   Persists choice in localStorage
   ============================================ */

(function () {
  const STORAGE_KEY = 'trama_lang';
  const DEFAULT = 'es';
  const SUPPORTED = ['es', 'en'];

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const browser = (navigator.language || 'es').slice(0, 2);
    return SUPPORTED.includes(browser) ? browser : DEFAULT;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function init() {
    const lang = getLang();
    setLang(lang);
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TRAMA_i18n = { getLang, setLang };
})();
