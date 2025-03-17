let trackName = document.getElementById("trackName");
let trackArtist = document.getElementById("trackArtist");
let trackLink = document.getElementById("trackLink");

let dscName = document.getElementById("nameNeksio");
let discordName = document.getElementById("discordName");
let discordMotd = document.getElementById("discordMotd");
let avatarLink = document.getElementById("avatarLink");

let rpcName = document.getElementById("rpcName");
let rpcDetails = document.getElementById("rpcDetails");

let webSocket = new WebSocket("wss://api.lanyard.rest/socket");
let discordID = '759433582107426816';

async function updateAllData() {
    try {
        const lanyard = await fetch('https://api.lanyard.rest/v1/users/759433582107426816');
        const data = await lanyard.json();
        
        // Discord data
        if (data.data.discord_user) {
            dscName.textContent = data.data.discord_user.global_name;
            discordName.textContent = data.data.discord_user.username;
            avatarLink.src = `https://cdn.discordapp.com/avatars/${discordID}/${data.data.discord_user.avatar}`;
            
            // Status message handling
            const customStatus = data.data.activities.find(activity => activity.type === 4);
            discordMotd.textContent = customStatus?.state || data.data.discord_status || 'Online';
        }

        // Spotify data
        if (data.data.spotify) {
            trackName.textContent = data.data.spotify.song;
            trackArtist.textContent = data.data.spotify.artist;
            document.getElementById('trackImg').src = data.data.spotify.album_art_url;
            trackLink.href = `https://open.spotify.com/track/${data.data.spotify.track_id}`;
        }

        // Rich Presence data
        const gameActivity = data.data.activities.find(activity => activity.type === 0);
        if (gameActivity) {
            rpcName.textContent = gameActivity.name;
            rpcDetails.textContent = gameActivity.details ? 
                gameActivity.details + (gameActivity.state ? "\n" + gameActivity.state : "") : "";
            
            if (gameActivity.assets?.large_image) {
                document.getElementById("rpcIcon").src = 
                    `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.large_image}.png`;
            }
            
            document.getElementById("rpcSmallIcon").src = gameActivity.assets?.small_image ? 
                `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.small_image}.png` : 
                './template/transparent.png';
        }

    } catch (error) {
        console.log('Error fetching data:', error);
    }
setInterval(updateAllData, 1000);
updateAllData();
webSocket.addEventListener("message", (event) => {
  let data = JSON.parse(event.data);  // Define data properly here

  if (event.data == '{"op":1,"d":{"heartbeat_interval":30000}}') {
    webSocket.send(
      JSON.stringify({
        op: 2,
        d: {
          subscribe_to_id: discordID,
        },
      })
    );
    setInterval(() => {
      webSocket.send(
        JSON.stringify({
          op: 3,
          d: {
            heartbeat_interval: 30000,
          },
        })
      );
    }, 30000);
  }
  
  // Handle Discord panel updates here
  if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
    if (data.d.discord_user) {
      discordName.textContent = data.d.discord_user.username;
      avatarLink.src = `https://cdn.discordapp.com/avatars/${discordID}/${data.d.discord_user.avatar}`;
      
      if (data.d.discord_status) {
          discordMotd.textContent = data.d.discord_status;
      }
      
      const customStatus = data.d.activities.find(activity => activity.type === 4);
      if (customStatus && customStatus.state) {
          discordMotd.textContent = customStatus.state;
      }
    }
  }

  if (data.t == "PRESENCE_UPDATE") {
    if (data.d.spotify) {
      trackName.innerText = data.d.spotify.song;
      let artists = data.d.spotify.artist;
      let artistFinal = artists.replaceAll(";", ",");
      trackArtist.innerText = artistFinal;
      document.getElementById("trackImg").src = data.d.spotify.album_art_url;
      trackLink.href = `https://open.spotify.com/track/${data.d.spotify.track_id}`;
    } else if (data.d.activities.length > 0) {
      const gameActivity = data.d.activities.find(activity => activity.type === 0);
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
        document.getElementById("rpcIcon").src = `gamer.png`;
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
  const ageElement = document.getElementById("age");
  if (ageElement) {
    const birthDate = "27.7.2323";
    const age = calculateAge(birthDate);
    ageElement.textContent = age;
  }
};