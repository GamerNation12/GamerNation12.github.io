document.addEventListener('DOMContentLoaded', function() {
  const mobileMenu = document.getElementById('mobile-menu');
  const navbarMenu = document.querySelector('.navbar-menu');

  mobileMenu.addEventListener('click', function() {
    navbarMenu.classList.toggle('active');
  });

  // Element declarations (ensure these IDs exist in your HTML)
  const trackName     = document.getElementById("trackName");
  const trackArtist   = document.getElementById("trackArtist");
  const trackLink     = document.getElementById("trackLink");
  const trackProgress = document.getElementById("trackProgress");
  const discordName   = document.getElementById("discordName");
  const discordMotd   = document.getElementById("discordMotd");
  const avatarLink    = document.getElementById("avatarLink");
  const discordAvatar = document.getElementById("discordAvatar");
  const statusCircle  = document.getElementById("statusCircle");
  
  // Elements for time display:
  const timeElapsed   = document.getElementById("timeElapsed");
  const timeDuration  = document.getElementById("timeDuration");
  
  // New: control bar element to reflect (or control) progress
  const controlBar = document.getElementById("controlBar");

  const discordID     = '759433582107426816';
  // These variables will be set when Lanyard returns Spotify data
  let startTime, endTime, duration;

  // Helper: Format milliseconds into mm:ss
  function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Fetch data from Lanyard API (includes Discord info and Spotify metadata)
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
              trackName.innerText   = e.data.spotify.song;
              trackArtist.innerText = e.data.spotify.artist.replaceAll(";", ",");
              document.getElementById("trackImg").src = e.data.spotify.album_art_url;
              trackLink.href        = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

              const rawStart = e.data.spotify.timestamps.start;
              const rawEnd   = e.data.spotify.timestamps.end;
              startTime = rawStart < 1e11 ? rawStart * 1000 : rawStart;
              endTime   = rawEnd   < 1e11 ? rawEnd   * 1000 : rawEnd;
              duration  = endTime - startTime;
          } else {
              startTime = endTime = duration = null;
          }
      })
      .catch(error => {
          console.error("Error fetching Lanyard data:", error);
      });
function animateProgress() {
    if (startTime && endTime && duration) {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progressPercent = Math.min(Math.max((elapsed / duration) * 100, 0), 100);

        trackProgress.style.width = `${progressPercent}%`;
        timeElapsed.textContent = formatTime(elapsed);
        timeDuration.textContent = formatTime(duration);
        
        if (elapsed < duration) {
            requestAnimationFrame(animateProgress);
        }
    } else {
        trackProgress.style.width = "0%";
        timeElapsed.textContent = "0:00";
        timeDuration.textContent = "0:00";
        requestAnimationFrame(animateProgress);
    }
}

// Initialize: Fetch Lanyard metadata every second and start the animation loop
updateData();
setInterval(updateData, 1000);
requestAnimationFrame(animateProgress);  // --- Additional Code (for age and styling) ---
  function calculateAge(birthDate) {
    const today = new Date();
    const parts = birthDate.split(".");
    const birthDay = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthYear = parseInt(parts[2], 10);
    let ageYears = today.getFullYear() - birthYear;
    const ageMonths = today.getMonth() + 1 - birthMonth;
    const ageDays = today.getDate() - birthDay;
    if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
      ageYears--;
    }
    return ageYears;
  }

  window.addEventListener('load', function() {
    const birthDate = "27.7.232323";
    const age = calculateAge(birthDate);
    const ageElement = document.getElementById("age");
    if (ageElement) {
      ageElement.textContent = age;
    }
  });

  // Optional styling: set a gradient background for the name element
  const gradients = [
    "#004ef7, #0084ff",
    "#ff8400, #ffc900",
    "#660acf, #ac00cf",
  ];
  const chosenGradient = gradients[Math.floor(Math.random() * gradients.length)];
  const nameNeksio = document.getElementById("nameNeksio");
  if (nameNeksio) {
    nameNeksio.style.backgroundImage = `linear-gradient(to right, ${chosenGradient})`;
  }
});