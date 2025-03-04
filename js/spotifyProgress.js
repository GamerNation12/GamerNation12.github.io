document.addEventListener('DOMContentLoaded', () => {
  const progressContainer = document.querySelector('.progressContainer');
  const trackProgress = document.querySelector('.trackProgress');

  function updateProgressBar(progress) {
    trackProgress.style.width = `${progress}%`;
  }

  function simulateProgress() {
    let progress = 0;
    setInterval(() => {
      if (progress <= 100) {
        updateProgressBar(progress);
        progress += 1;
      }
    }, 1000);
  }

  simulateProgress();
});