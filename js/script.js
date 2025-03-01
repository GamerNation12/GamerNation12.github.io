// Use DOMContentLoaded to ensure elements are available
document.addEventListener("DOMContentLoaded", function() {
  // Element declarations (ensure these IDs exist in your HTML)
  const avatarLink = document.getElementById("avatarLink");
  const discordName = document.getElementById("discordName");
  const discordMotd = document.getElementById("discordMotd");
  const trackName = document.getElementById("trackName");
  const trackArtist = document.getElementById("trackArtist");
  const trackLink = document.getElementById("trackLink");
  const trackProgress = document.getElementById("trackProgress");
  const discordAvatar = document.getElementById("discordAvatar");
  const statusCircle = document.getElementById("statusCircle");
  const timeElapsedElem = document.getElementById("timeElapsed"); // if exists
  const timeDurationElem = document.getElementById("timeDuration"); // if exists
  const rpcName = document.getElementById("rpcName");
  const rpcDetails = document.getElementById("rpcDetails");

  const discordID = '759433582107426816';
  let startTime, endTime, duration; // For Spotify

  // Format time in mm:ss
  function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Function to fetch and update both Discord and Spotify data
  function updateData() {
    fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Lanyard response:", data);
        const e = data; // using shorthand variable

        // Update Discord Info
        if (e.data && e.data["discord_user"]) {
          discordName.innerText = `@${e.data.discord_user.username}`;
          avatarLink.href = `https://discord.com/users/${discordID}`;
          if (discordAvatar) {
            discordAvatar.src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data["discord_user"].avatar}.png?size=4096`;
          }
          // Set status circle color based on status
          if (statusCircle) {
            if (e.data.discord_status === "online") {
              statusCircle.style.backgroundColor = "#23a55a";
            } else if (e.data.discord_status === "idle") {
              statusCircle.style.backgroundColor = "#f0b232";
            } else if (e.data.discord_status === "dnd") {
              statusCircle.style.backgroundColor = "#f23f43";
            } else {
              statusCircle.style.backgroundColor = "#80848e";
            }
          }
          
          // Set custom or regular status message
          const customStatus = (e.data.activities || []).find(activity => activity.type === 4);
          if (customStatus && customStatus.state) {
            discordMotd.innerText = customStatus.state;
          } else if (e.data.discord_user.bio) {
            discordMotd.innerText = e.data.discord_user.bio;
          } else {
            discordMotd.innerText = "No status message";
          }
        }

        // Update Spotify Info if listening
        if (e.data && e.data["listening_to_spotify"]) {
          // Update track info and link
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

  // Update progress bar every 250ms (Spotify progress only)
  setInterval(function() {
    if (startTime && endTime && duration) {
      const currentTime = Date.now();
      if (currentTime >= endTime) {
        trackProgress.style.width = "100%";
        // Optionally force a data refresh when song ends
        updateData();
      } else {
        const elapsed = currentTime - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        trackProgress.style.width = `${progress}%`;

        if (timeElapsedElem) {
          timeElapsedElem.textContent = formatTime(elapsed);
        }
        if (timeDurationElem) {
          timeDurationElem.textContent = formatTime(duration);
        }
      }
    }
  }, 250);

  // Re-fetch all data every 1000ms for improved responsiveness
  setInterval(updateData, 1000);
  
  // Initial fetch
  updateData();

  // Age calculation (if used elsewhere)
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
  window.onload = function() {
    const birthDate = "27.7.232323";
    const age = calculateAge(birthDate);
    const ageElement = document.getElementById("age");
    if (ageElement) {
      ageElement.textContent = age;
    }
  };
});