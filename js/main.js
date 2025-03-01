










});  }    });      progressBar.style.width = percentage + '%';      const percentage = (audio.currentTime / audio.duration) * 100;    audio.addEventListener('timeupdate', function() {  if (audio && progressBar) {  const audio = document.querySelector('audio'); // Assuming you have an audio element  const progressBar = document.querySelector('.trackProgress');document.addEventListener('DOMContentLoaded', function() {