/* ============================================
   TRAMA — App functionality
   Progress tracking, completion, dashboard
   ============================================ */

(function () {
  const PROGRESS_KEY = 'trama_progress';
  const TOTAL_SESSIONS = 24;

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch { return {}; }
  }

  function saveProgress(p) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  }

  function isComplete(sessionId) {
    return !!loadProgress()[sessionId]?.completed;
  }

  function setComplete(sessionId, value) {
    const p = loadProgress();
    if (!p[sessionId]) p[sessionId] = {};
    p[sessionId].completed = !!value;
    p[sessionId].timestamp = Date.now();
    saveProgress(p);
    document.dispatchEvent(new CustomEvent('progresschange', { detail: { sessionId, value } }));
  }

  function countComplete() {
    const p = loadProgress();
    return Object.values(p).filter(s => s?.completed).length;
  }

  /* ---- Initialize completion control on session pages ---- */
  function initCompleteControl() {
    const ctrl = document.querySelector('[data-complete-session]');
    if (!ctrl) return;
    const sessionId = ctrl.dataset.completeSession;
    const checkbox = ctrl.querySelector('input[type="checkbox"]');
    const update = () => {
      const done = isComplete(sessionId);
      checkbox.checked = done;
      ctrl.classList.toggle('is-complete', done);
    };
    update();
    ctrl.addEventListener('click', e => {
      if (e.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;
      }
      setComplete(sessionId, checkbox.checked);
      update();
    });
  }

  /* ---- Initialize session cards on dashboard ---- */
  function initSessionCards() {
    document.querySelectorAll('[data-session-id]').forEach(card => {
      const id = card.dataset.sessionId;
      if (isComplete(id)) {
        card.classList.add('completed');
        const mark = card.querySelector('.session-card-foot');
        if (mark && !mark.querySelector('.completed-mark')) {
          const span = document.createElement('span');
          span.className = 'completed-mark';
          span.innerHTML = '✓ <span data-lang="es">Completada</span><span data-lang="en">Completed</span>';
          mark.appendChild(span);
        }
      }
    });
  }

  /* ---- Initialize progress bar ---- */
  function initProgressBar() {
    const bar = document.querySelector('.progress-fill');
    const stats = document.querySelector('.progress-stats');
    if (!bar) return;
    const done = countComplete();
    const pct = Math.round((done / TOTAL_SESSIONS) * 100);
    bar.style.width = pct + '%';
    if (stats) {
      stats.innerHTML = `
        <span><strong>${done}</strong> / ${TOTAL_SESSIONS} <span data-lang="es">sesiones</span><span data-lang="en">sessions</span></span>
        <span>${pct}%</span>
      `;
    }
  }

  /* ---- Generic localStorage textarea/journal helper ---- */
  function initJournalAreas() {
    document.querySelectorAll('[data-journal-key]').forEach(area => {
      const key = 'trama_journal_' + area.dataset.journalKey;
      area.value = localStorage.getItem(key) || '';
      const status = area.parentElement.querySelector('.tool-status');
      let timer;
      area.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          localStorage.setItem(key, area.value);
          if (status) {
            status.textContent = window.TRAMA_i18n.getLang() === 'es'
              ? '✓ Guardado automáticamente · ' + new Date().toLocaleTimeString()
              : '✓ Auto-saved · ' + new Date().toLocaleTimeString();
          }
        }, 500);
      });
    });
  }

  /* ---- Init ---- */
  function init() {
    initCompleteControl();
    initSessionCards();
    initProgressBar();
    initJournalAreas();
    document.addEventListener('progresschange', initProgressBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TRAMA = {
    loadProgress, saveProgress, isComplete, setComplete, countComplete,
    TOTAL_SESSIONS
  };
})();
