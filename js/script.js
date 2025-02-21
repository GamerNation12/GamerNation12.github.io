const trackName = document.getElementById("trackName");
const trackArtist = document.getElementById("trackArtist");
const trackLink = document.getElementById("trackLink");

const dscName = document.getElementById("nameNeksio");
const discordName = document.getElementById("discordName");
const discordMotd = document.getElementById("discordMotd");
const avatarLink = document.getElementById("avatarLink");

const rpcName = document.getElementById("rpcName");
const rpcDetails = document.getElementById("rpcDetails");

const webSocket = new WebSocket("wss://api.lanyard.rest/socket");
const discordID = '759433582107426816';

fetch(`https://api.lanyard.rest/v1/users/${discordID}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((e) => {
    console.log(e);  // Log the entire response to check its structure

    if (e.data["discord_user"]) {
      discordName.innerText = `@${e.data.discord_user.username}`;
      avatarLink.href = `https://discord.com/users/${discordID}`;
      document.getElementById("discordAvatar").src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data["discord_user"].avatar}.png?size=4096`;
      const statusColors = {
        "online": "#23a55a",
        "idle": "#f0b232",
        "dnd": "#f23f43",
        "offline": "#80848e"
      };
      document.getElementById("statusCircle").style.backgroundColor = statusColors[e.data.discord_status] || "#80848e";
    }

    const customStatus = e.data.activities.find(activity => activity.type === 4);
    discordMotd.innerText = customStatus?.state || e.data.discord_user.bio || "No status message";

    if (e.data["listening_to_spotify"]) {
      trackName.innerText = e.data.spotify.song;
      let artists = e.data.spotify.artist;
      let artistFinal = artists.replace(/;/g, ",");
      trackArtist.innerText = artistFinal;
      document.getElementById("trackImg").src = e.data.spotify.album_art_url;
      trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;
    } else {
      trackName.innerText = "None";
      trackArtist.innerText = "I'm not currently listening to anything";
      document.getElementById("trackImg").src = "music.png";
    }

    if (e.data["activities"].length > 0) {
      const gameActivity = e.data["activities"].find(activity => activity.type === 0);
      if (gameActivity) {
        setRpcInfo(gameActivity);
      } else {
        resetRpcInfo();
      }
    } else {
      resetRpcInfo();
    }
  })
  .catch((error) => {
    console.error('Fetch error:', error);
  });

webSocket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (event.data == '{"op":1,"d":{"heartbeat_interval":30000}}') {
    webSocket.send(JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: discordID,
      },
    }));
    setInterval(() => {
      webSocket.send(JSON.stringify({
        op: 3,
        d: {
          heartbeat_interval: 30000,
        },
      }));
    }, 30000);
  }
  
  if (data.t == "PRESENCE_UPDATE") {
    if (data.d.spotify) {
      trackName.innerText = data.d.spotify.song;
      let artists = data.d.spotify.artist;
      let artistFinal = artists.replace(/;/g, ",");
      trackArtist.innerText = artistFinal;
      document.getElementById("trackImg").src = data.d.spotify.album_art_url;
      trackLink.href = `https://open.spotify.com/track/${data.d.spotify.track_id}`;
    } else if (data.d.activities.length > 0) {
      const gameActivity = data.d.activities.find(activity => activity.type === 0);
      if (gameActivity) {
        setRpcInfo(gameActivity);
      } else {
        resetRpcInfo();
      }
    } else {
      resetRpcInfo();
    }
  }
});

function setRpcInfo(activity) {
  rpcName.innerText = activity.name;
  rpcDetails.innerText = activity.details ? activity.details + (activity.state ? "\n" + activity.state : "") : "";
  document.getElementById("rpcIcon").src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
  document.getElementById("rpcSmallIcon").src = activity.assets.small_image ? 
    `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png` : 
    `./transparent.png`;
}

function resetRpcInfo() {
  rpcName.innerText = "None";
  rpcDetails.innerText = "I'm not currently playing anything";
  document.getElementById("rpcIcon").src = `gamer.png`;
  document.getElementById("rpcSmallIcon").src = `gamer.png`;
}

function calculateAge(birthDate) {
  const today = new Date();
  const parts = birthDate.split(".");
  const birthDay = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10);
  const birthYear = parseInt(parts[2], 10);

  let ageYears = today.getFullYear() - birthYear;
  let ageMonths = today.getMonth() + 1 - birthMonth;
  let ageDays = today.getDate() - birthDay;

  if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
    ageYears--;
  }

  return ageYears;
}

window.onload = function() {
  const birthDate = prompt("Enter your birth date (DD.MM.YYYY):");
  const age = calculateAge(birthDate);
  const ageElement = document.getElementById("age");
  ageElement.textContent = age;
};