(function() {
  const DISCORD_ID = '759433582107426816';
  const WEBSOCKET_URL = "wss://api.lanyard.rest/socket";

  const trackName = document.getElementById("trackName");
  const trackArtist = document.getElementById("trackArtist");
  const trackLink = document.getElementById("trackLink");

  const dscName = document.getElementById("nameNeksio");
  const discordName = document.getElementById("discordName");
  const discordMotd = document.getElementById("discordMotd");
  const avatarLink = document.getElementById("avatarLink");

  const rpcName = document.getElementById("rpcName");
  const rpcDetails = document.getElementById("rpcDetails");

  const webSocket = new WebSocket(WEBSOCKET_URL);

  fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
    .then((response) => {
      console.log('Response Status:', response.status); // Log the response status
      if (!response.ok) {
        return response.text().then(text => { // Get the response body as text
          throw new Error(`Network response was not ok: ${text}`);
        });
      }
      return response.json();
    })
    .then((e) => {
      console.log(e);

      if (e.data && e.data.discord_user) {
        discordName.innerText = `@${e.data.discord_user.username}`;
        avatarLink.href = `https://discord.com/users/${DISCORD_ID}`;
        document.getElementById("discordAvatar").src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${e.data.discord_user.avatar}.png?size=4096`;
        const statusColors = {
          "online": "#23a55a",
          "idle": "#f0b232",
          "dnd": "#f23f43",
          "offline": "#80848e"
        };
        document.getElementById("statusCircle").style.backgroundColor = statusColors[e.data.discord_status] || "#80848e";
      }

      const customStatus = e.data.activities?.find(activity => activity.type === 4);
      discordMotd.innerText = customStatus?.state || e.data.discord_user.bio || "No status message";

      if (e.data.listening_to_spotify) {
        trackName.innerText = e.data.spotify.song;
        let artists = e.data.spotify.artist;
        trackArtist.innerText = artists.replace(/;/g, ",");
        document.getElementById("trackImg").src = e.data.spotify.album_art_url;
        trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;
      } else {
        trackName.innerText = "None";
        trackArtist.innerText = "I'm not currently listening to anything";
        document.getElementById("trackImg").src = "music.png";
      }

      if (e.data.activities?.length > 0) {
        const gameActivity = e.data.activities.find(activity => activity.type === 0);
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
      alert('Failed to fetch Discord data. Please try again later.');
    });

  webSocket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (event.data == '{"op":1,"d":{"heartbeat_interval":30000}}') {
      webSocket.send(JSON.stringify({
        op: 2,
        d: {
          subscribe_to_id: DISCORD_ID,
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
        trackArtist.innerText = artists.replace(/;/g, ",");
        document.getElementById("trackImg").src = data.d.spotify.album_art_url;
        trackLink.href = `https://open.spotify.com/track/${data.d.spotify.track_id}`;
      } else if (data.d.activities?.length > 0) {
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
    if (activity.assets) {
      document.getElementById("rpcIcon").src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
      document.getElementById("rpcSmallIcon").src = activity.assets.small_image ? 
        `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png` : 
        `./transparent.png`;
    } else {
      resetRpcInfo();
    }
  }

  function resetRpcInfo() {
    rpcName.innerText = "None";
    rpcDetails.innerText = "I'm not currently playing anything";
    
    const rpcIcon = document.getElementById("rpcIcon");
    const rpcSmallIcon = document.getElementById("rpcSmallIcon");

    if (rpcIcon) {
      rpcIcon.src = `gamer.png`;
    } else {
      console.error('RPC Icon element not found');
    }

    if (rpcSmallIcon) {
      rpcSmallIcon.src = `gamer.png`;
    } else {
      console.error('RPC Small Icon element not found');
    }
  }
})();