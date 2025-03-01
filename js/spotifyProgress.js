document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.querySelector('.trackProgress');
  const audio = document.querySelector('audio'); // Assuming you have an audio element

  if (audio && progressBar) {
    audio.addEventListener('timeupdate', function() {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = percentage + '%';
    });
  }
});
