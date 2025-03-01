document.addEventListener("DOMContentLoaded", function() {
  // Element declarations (ensure these IDs exist in your HTML)
  const trackName = document.getElementById("trackName");
  const trackArtist = document.getElementById("trackArtist");
  const trackLink = document.getElementById("trackLink");
  const trackProgress = document.getElementById("trackProgress");
  const discordName = document.getElementById("discordName");
  const discordMotd = document.getElementById("discordMotd");
  const avatarLink = document.getElementById("avatarLink");
  const discordAvatar = document.getElementById("discordAvatar");
  const statusCircle = document.getElementById("statusCircle");

  const discordID = '759433582107426816';
  let startTime, endTime, duration; // For Spotify

  // Format time (if you're using time displays)
  function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Fetch data from Lanyard API (for Discord and Spotify info)
  function updateData() {
    fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Lanyard response:", data);
        const e = data; // using shorthand

        // Update Discord info
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
              status === "idle" ? "#f0b232" :
              status === "dnd" ? "#f23f43" : "#80848e";
          }
          const customStatus = (e.data.activities || []).find(activity => activity.type === 4);
          discordMotd.innerText = customStatus && customStatus.state 
            ? customStatus.state 
            : e.data.discord_user.bio || "No status message";
        }

        // Update Spotify info if listening
        if (e.data && e.data["listening_to_spotify"]) {
          trackName.innerText = e.data.spotify.song;
          trackArtist.innerText = e.data.spotify.artist.replaceAll(";", ",");
          document.getElementById("trackImg").src = e.data.spotify.album_art_url;
          trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

          // Update timestamps and calculate duration
          const rawStart = e.data.spotify.timestamps.start;
          const rawEnd = e.data.spotify.timestamps.end;
          startTime = rawStart < 1e11 ? rawStart * 1000 : rawStart;
          endTime = rawEnd < 1e11 ? rawEnd * 1000 : rawEnd;
          duration = endTime - startTime;
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } // end updateData

  // Smooth progress update using requestAnimationFrame:
  function updateProgress() {
    if (startTime && endTime && duration) {
      const currentTime = Date.now();
      if (currentTime >= endTime) {
        trackProgress.style.width = "100%";
      } else {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        trackProgress.style.width = `${progress}%`;
      }
    }
    requestAnimationFrame(updateProgress);
  }

  // Initial fetch and continual updates
  updateData();
  setInterval(updateData, 1000); // Refresh data every second
  requestAnimationFrame(updateProgress);

  // Age calculation function
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

  // Update age on window load
  window.addEventListener('load', function() {
    const birthDate = "27.7.232323";
    const age = calculateAge(birthDate);
    const ageElement = document.getElementById("age");
    if (ageElement) {
      ageElement.textContent = age;
    }
  });

  const gradients = [
    "#004ef7, #0084ff",
    "#ff8400, #ffc900",
    "#660acf, #ac00cf",
  ];
  const chosenGradient = gradients[Math.floor(Math.random() * gradients.length)];
  const nameNeksio = document.getElementById("nameNeksio");
  nameNeksio.style.backgroundImage = `linear-gradient(to right, ${chosenGradient})`;

  // JavaScript to update the progress bar linked with Spotify
  async function updateSpotifyProgress() {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const progress = data.progress_ms;
        const duration = data.item.duration_ms;
        const progressPercent = (progress / duration) * 100;

        document.getElementById('timeElapsed').textContent = new Date(progress).toISOString().substr(14, 5);
        document.getElementById('timeDuration').textContent = new Date(duration).toISOString().substr(14, 5);
        document.getElementById('trackProgress').style.width = `${progressPercent}%`;
      }
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
    }
  }

  setInterval(updateSpotifyProgress, 1000);
});
