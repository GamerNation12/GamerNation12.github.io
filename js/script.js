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
        
        // Spotify panel color handling
        if (data.data.spotify) {
            const spotifyPanel = document.querySelector('.spotifyPanel');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = data.data.spotify.album_art_url;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Get colors from left and right edges
                const leftColor = ctx.getImageData(0, img.height/2, 1, 1).data;
                const rightColor = ctx.getImageData(img.width-1, img.height/2, 1, 1).data;
                
                // Apply gradient
                spotifyPanel.style.background = `linear-gradient(to right, 
                    rgba(${leftColor[0]}, ${leftColor[1]}, ${leftColor[2]}, 0.3),
                    rgba(${rightColor[0]}, ${rightColor[1]}, ${rightColor[2]}, 0.3))`;
            }
            
            // Update other Spotify info
            document.getElementById('trackName').textContent = data.data.spotify.song;
            document.getElementById('trackArtist').textContent = data.data.spotify.artist;
            document.getElementById('trackImg').src = data.data.spotify.album_art_url;
        }
        
        // Rest of your existing update code...
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

setInterval(updateAllData, 1000);
updateAllData();

webSocket.addEventListener("message", (event) => {
  data = JSON.parse(event.data);

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
  var birthDate = "27.7.232323";
  var age = calculateAge(birthDate);
  var ageElement = document.getElementById("age");
  ageElement.textContent = age;
};

// Discord panel updates
if (data.data.discord_user) {
    // Update Discord username and avatar
    discordName.textContent = data.data.discord_user.username;
    avatarLink.src = `https://cdn.discordapp.com/avatars/${discordID}/${data.data.discord_user.avatar}`;
    
    // Update Discord status/MOTD
    if (data.data.discord_status) {
        discordMotd.textContent = data.data.discord_status;
    }
    
    // Update custom status if available
    const customStatus = data.data.activities.find(activity => activity.type === 4);
    if (customStatus && customStatus.state) {
        discordMotd.textContent = customStatus.state;
    }
}
