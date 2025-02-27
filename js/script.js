let trackName = document.getElementById("trackName");
let trackArtist = document.getElementById("trackArtist");
let trackLink = document.getElementById("trackLink");
let trackProgress = document.getElementById("trackProgress");

let dscName = document.getElementById("nameNeksio");
let discordName = document.getElementById("discordName");
let discordMotd = document.getElementById("discordMotd");
let avatarLink = document.getElementById("avatarLink");

let rpcName = document.getElementById("rpcName");
let rpcDetails = document.getElementById("rpcDetails");

let discordID = '759433582107426816';

// Fetch data from Lanyard API for other panels
fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
  .then((response) => response.json())
  .then((e) => {
    console.log(e);  // Log the entire response to check its structure

    if (e.data["discord_user"]) {
      discordName.innerText = `@${e.data.discord_user.username}`;
      avatarLink.href = `https://discord.com/users/${discordID}`;
      document.getElementById(
        "discordAvatar"
      ).src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data["discord_user"].avatar}.png?size=4096`;
      if (e.data.discord_status == "online") {
        document.getElementById("statusCircle").style.backgroundColor =
          "#23a55a";
      } else if (e.data.discord_status == "idle") {
        document.getElementById("statusCircle").style.backgroundColor =
          "#f0b232";
      } else if (e.data.discord_status == "dnd") {
        document.getElementById("statusCircle").style.backgroundColor =
          "#f23f43";
      } else if (e.data.discord_status == "offline") {
        document.getElementById("statusCircle").style.backgroundColor =
          "#80848e";
      }
    }

    // Set custom or regular status message
    const customStatus = e.data.activities.find(activity => activity.type === 4); // type 4 indicates custom status
    if (customStatus && customStatus.state) {
      discordMotd.innerText = customStatus.state;
    } else if (e.data.discord_user.bio) {
      discordMotd.innerText = e.data.discord_user.bio;
    } else {
      discordMotd.innerText = "No status message";
    }

    if (e.data["listening_to_spotify"]) {
      trackName.innerText = `${e.data.spotify.song}`;
      let artists = e.data.spotify.artist;
      let artistFinal = artists.replaceAll(";", ",");
      trackArtist.innerText = artistFinal;
      document.getElementById("trackImg").src = e.data.spotify.album_art_url;
      trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;

      /* filepath: /c:/Users/minec/OneDrive/Documents/GitHub/GamerNation12/js/script.js */
// Inside the spotify condition
if (e.data["listening_to_spotify"]) {
  // ...existing code...
  
  // Update progress bar
  const duration = e.data.spotify.timestamps.end - e.data.spotify.timestamps.start;
  const startTime = e.data.spotify.timestamps.start;
  const endTime = e.data.spotify.timestamps.end;

  function updateProgressBar() {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min((elapsed / duration) * 100, 100);
    trackProgress.style.width = `${progress}%`;

    if (currentTime < endTime) {
      requestAnimationFrame(updateProgressBar);
    }
  }

      updateProgressBar();
    } else {
      trackName.innerText = "None";
      trackArtist.innerText = "I'm not currently listening to anything";
      document.getElementById("trackImg").src = "music.png";
      trackProgress.style.width = "0%";
    }

    if (e.data["activities"].length > 0) {
      const gameActivity = e.data["activities"].find(activity => activity.type === 0);
      if (gameActivity) {
        rpcName.innerText = gameActivity.name;
        rpcDetails.innerText = gameActivity.details ? gameActivity.details + (gameActivity.state ? "\n" + gameActivity.state : "") : "";
        document.getElementById(
          "rpcIcon"
        ).src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.large_image}.png`;
        if (gameActivity.assets.small_image) {
          document.getElementById(
            "rpcSmallIcon"
          ).src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.small_image}.png`;
        } else {
          document.getElementById(
            "rpcSmallIcon"
          ).src = `./template/transparent.png`;
        }
      } else {
        rpcName.innerText = "None";
        rpcDetails.innerText = "I'm not currently playing anything";
        document.getElementById("rpcIcon").src = `game.png`;
        document.getElementById(
          "rpcSmallIcon"
        ).src = `gamer.png`;
      }
    } else {
      rpcName.innerText = "None";
      rpcDetails.innerText = "I'm not currently playing anything";
      document.getElementById("rpcIcon").src = `gamer.png`;
      document.getElementById(
        "rpcSmallIcon"
      ).src = `gamer.png`;
    }
  });

function calculateAge(birthDate) {
  var today = new Date();
  var parts = birthDate.split(".");
  var birthDay = parseInt(parts[0], 10);
  var birthMonth = parseInt(parts[1], 10);
  var birthYear = parseInt(parts[2], 10);

  var ageYears = today.getFullYear() - birthYear;
  var ageMonths = today.getMonth() + 1 - birthMonth;
  var ageDays = today.getDate() - birthDay;

  if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
    ageYears--;
  }

  return ageYears;
}

window.onload = function() {
  var birthDate = "27.7.232323";
  var age = calculateAge(birthDate);
  var ageElement = document.getElementById("age");
  ageElement.textContent = age;

  // Create the countdown element
  var countdownElement = document.createElement('div');
  countdownElement.id = 'refreshCountdown';
  countdownElement.className = 'countdown';
  document.body.appendChild(countdownElement);

  // Start the countdown timer
  startCountdown(60); // 1 minute
};

function startCountdown(duration) {
  var timer = duration, minutes, seconds;
  var countdownElement = document.getElementById('refreshCountdown');
  var countdownInterval = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    countdownElement.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      clearInterval(countdownInterval);
      location.reload();
    }
  }, 1000);
}