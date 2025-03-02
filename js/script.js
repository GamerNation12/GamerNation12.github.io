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
        console.log("Lanyard response:", data);
        const e = data; // shorthand
        
        // Update Discord info if available
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
        
        // Update Spotify metadata if listening (used for song info & progress)
        if (e.data && e.data["listening_to_spotify"] &&
            e.data.spotify && e.data.spotify.timestamps) {
          // Set the song's details
          trackName.innerText   = e.data.spotify.song;
          trackArtist.innerText = e.data.spotify.artist.replaceAll(";", ",");
          document.getElementById("trackImg").src = e.data.spotify.album_art_url;
          trackLink.href        = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

          // Retrieve and convert timestamps
          const rawStart = e.data.spotify.timestamps.start;
          const rawEnd   = e.data.spotify.timestamps.end;
          // Convert from seconds to milliseconds if necessary
          startTime = rawStart < 1e11 ? rawStart * 1000 : rawStart;
          endTime   = rawEnd   < 1e11 ? rawEnd   * 1000 : rawEnd;
          duration  = endTime - startTime;
          console.log("Spotify Timestamps:", { startTime, endTime, duration });
        } else {
          // If not listening to Spotify, clear timestamps
          startTime = endTime = duration = null;
          console.log("Not listening to Spotify.");
        }
      })
      .catch(error => {
        console.error("Error fetching Lanyard data:", error);
      });
  }

  // Animate the progress bar based on either Spotify song duration or a fallback pulsing effect.
  // Also link the progress percentage to the control bar value.
  function animateProgress() {
    let progressPercent;
    if (startTime && endTime && duration) {
      // Spotify is active – update progress based on song duration
      const currentTime = Date.now();
      let elapsed = currentTime - startTime;
      if (elapsed > duration) {
        elapsed = duration; // Cap at duration if song has ended
      }
      progressPercent = (elapsed / duration) * 100;
      if (timeElapsed) timeElapsed.textContent = formatTime(elapsed);
      if (timeDuration) timeDuration.textContent = formatTime(duration);

      // Use Discord status color for the progress bar
      if (statusCircle) {
        let statusColor = window.getComputedStyle(statusCircle).backgroundColor;
        trackProgress.style.backgroundColor = statusColor;
      }
    } else {
      // Not listening to Spotify – use a pulsing animation based on a sine function
      progressPercent = Math.abs(Math.sin(Date.now() / 1000)) * 100;
      // Set fallback background color from Discord status
      let statusColor = "#80848e";
      if (statusCircle) {
        statusColor = window.getComputedStyle(statusCircle).backgroundColor;
      }
      trackProgress.style.backgroundColor = statusColor;
      if (timeElapsed) timeElapsed.textContent = "";
      if (timeDuration) timeDuration.textContent = "";
    }

    // Update control bar value (if present) to reflect computed progress
    if (controlBar) {
      controlBar.value = progressPercent;
    }
    // Update visual progress bar width
    trackProgress.style.width = `${progressPercent}%`;
    requestAnimationFrame(animateProgress);
  }

  // Initialize: Fetch Lanyard metadata every second and start the animation loop
  updateData();
  setInterval(updateData, 1000);
  requestAnimationFrame(animateProgress);

  // --- Additional Code (for age and styling) ---
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