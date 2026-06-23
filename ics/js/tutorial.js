/* ============================================
   Tutorial Module - Onboarding Walkthrough
   ============================================ */

const TutorialModule = (() => {
  let currentStep = 0;
  let active = false;

  function start() {
    if (localStorage.getItem('tutorial_dismissed')) return;
    currentStep = 0;
    active = true;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
      overlay.classList.add('open');
      ModalManager.close('form-modal');
      showStep(0);
    }
  }

  function showStep(index) {
    currentStep = index;
    const step = TUTORIAL_STEPS[index];
    if (!step) {
      end();
      return;
    }

    const targetEl = document.querySelector(step.target);
    const spotlight = document.getElementById('tutorial-spotlight');
    const tooltip = document.getElementById('tutorial-tooltip');

    if (!targetEl || !spotlight || !tooltip) return;

    // Position spotlight
    const rect = targetEl.getBoundingClientRect();
    const padding = 8;
    spotlight.style.top = `${rect.top - padding}px`;
    spotlight.style.left = `${rect.left - padding}px`;
    spotlight.style.width = `${rect.width + padding * 2}px`;
    spotlight.style.height = `${rect.height + padding * 2}px`;

    // Position tooltip
    tooltip.style.top = '';
    tooltip.style.left = '';
    tooltip.style.bottom = '';
    tooltip.style.right = '';

    switch (step.position) {
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 16}px`;
        tooltip.style.left = `${Math.max(16, rect.left)}px`;
        break;
      case 'top':
        tooltip.style.bottom = `${window.innerHeight - rect.top + 16}px`;
        tooltip.style.left = `${Math.max(16, rect.left)}px`;
        break;
      case 'left':
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.right = `${window.innerWidth - rect.left + 16}px`;
        break;
      case 'right':
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.left = `${rect.right + 16}px`;
        break;
    }

    // Update content
    tooltip.querySelector('.tutorial-tooltip-step').textContent = `Paso ${index + 1} de ${TUTORIAL_STEPS.length}`;
    tooltip.querySelector('.tutorial-tooltip-title').textContent = step.title;
    tooltip.querySelector('.tutorial-tooltip-desc').textContent = step.description;

    // Update progress dots
    const dotsContainer = tooltip.querySelector('.tutorial-tooltip-progress');
    dotsContainer.innerHTML = TUTORIAL_STEPS.map((_, i) => {
      let cls = 'tutorial-tooltip-dot';
      if (i < index) cls += ' completed';
      if (i === index) cls += ' active';
      return `<span class="${cls}"></span>`;
    }).join('');

    // Update nav buttons
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : '';
    if (nextBtn) {
      nextBtn.textContent = index === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente';
    }

    // Reset animation
    tooltip.style.animation = 'none';
    tooltip.offsetHeight; // trigger reflow
    tooltip.style.animation = '';
  }

  function next() {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      showStep(currentStep + 1);
    } else {
      end();
    }
  }

  function prev() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  }

  function skip() {
    end();
  }

  function end() {
    active = false;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.remove('open');

    const noShow = document.getElementById('tutorial-no-show-check');
    if (noShow && noShow.checked) {
      localStorage.setItem('tutorial_dismissed', 'true');
    }
  }

  function reset() {
    localStorage.removeItem('tutorial_dismissed');
    Toast.show('Tutorial reiniciado. Se mostrará la próxima vez que crees un evento.', 'info');
  }

  function init() {
    const prevBtn = document.getElementById('tutorial-prev');
    const nextBtn = document.getElementById('tutorial-next');
    const skipBtn = document.getElementById('tutorial-skip');

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (skipBtn) skipBtn.addEventListener('click', skip);
  }

  return { init, start, next, prev, skip, reset };
})();
