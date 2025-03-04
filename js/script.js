document.addEventListener('DOMContentLoaded', function() {
  const mobileMenu = document.getElementById('mobile-menu');
  const navbarMenu = document.querySelector('.navbar-menu');
  const discordID = '759433582107426816';
  let startTime, endTime, duration;

  function formatTime(ms) {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor(ms / 1000 / 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateData() {
      fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
          .then(response => response.json())
          .then(data => {
              const e = data;
                
              if (e.data && e.data["discord_user"]) {
                  discordName.innerText = `@${e.data.discord_user.username}`;
                  avatarLink.href = `https://discord.com/users/${discordID}`;
                  if (discordAvatar) {
                      discordAvatar.src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data["discord_user"].avatar}.png?size=4096`;
                  }
                  if (statusCircle) {
                      let status = e.data.discord_status;
                      statusCircle.style.backgroundColor =
                          status === "online" ? "#23a55a" :
                          status === "idle"   ? "#f0b232" :
                          status === "dnd"    ? "#f23f43" : "#80848e";
                  }
                  const customStatus = (e.data.activities || []).find(activity => activity.type === 4);
                  discordMotd.innerText = customStatus && customStatus.state
                      ? customStatus.state
                      : e.data.discord_user.bio || "No status message";
              }
                
              if (e.data && e.data["listening_to_spotify"] &&
                  e.data.spotify && e.data.spotify.timestamps) {
                  trackName.innerText = e.data.spotify.song;
                  trackArtist.innerText = e.data.spotify.artist.replaceAll(";", ",");
                  document.getElementById("trackImg").src = e.data.spotify.album_art_url;
                  trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

                  const rawStart = e.data.spotify.timestamps.start;
                  const rawEnd = e.data.spotify.timestamps.end;
                  startTime = rawStart < 1e11 ? rawStart * 1000 : rawStart;
                  endTime = rawEnd < 1e11 ? rawEnd * 1000 : rawEnd;
                  duration = endTime - startTime;
              } else {
                  startTime = endTime = duration = null;
              }
          })
          .catch(error => {
              console.error("Error fetching Lanyard data:", error);
          });
  }

  function animateProgress() {
      if (startTime && endTime && duration) {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progressPercent = Math.min(Math.max((elapsed / duration) * 100, 0), 100);

          trackProgress.style.width = `${progressPercent}%`;
          timeElapsed.textContent = formatTime(elapsed);
          timeDuration.textContent = formatTime(duration);
      } else {
          trackProgress.style.width = "0%";
          timeElapsed.textContent = "0:00";
          timeDuration.textContent = "0:00";
      }
      requestAnimationFrame(animateProgress);
  }

  // Initialize everything
  updateData();
  setInterval(updateData, 1000);
  requestAnimationFrame(animateProgress);
});