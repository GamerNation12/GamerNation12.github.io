document.addEventListener('DOMContentLoaded', () => {
  const trackProgress = document.querySelector('.track-progress');
  const timeElapsed = document.getElementById('timeElapsed');
  const timeDuration = document.getElementById('timeDuration');

  function updateProgressBar(progress, elapsed, duration) {
    trackProgress.style.width = `${progress}%`;
    timeElapsed.textContent = elapsed;
    timeDuration.textContent = duration;
  }

  function simulateProgress() {
    let progress = 0;
    let elapsed = 0;
    const duration = 180; // example duration in seconds
    setInterval(() => {
      if (progress <= 100) {
        updateProgressBar(progress, formatTime(elapsed), formatTime(duration));
        progress += (100 / duration);
        elapsed += 1;
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  simulateProgress();
});