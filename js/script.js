// Centralized Lanyard + UI update logic
document.addEventListener("DOMContentLoaded", () => {
  const DISCORD_ID = "759433582107426816";
  const LANYARD_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;
  const WS_URL = "wss://api.lanyard.rest/socket";

  // Helper: canvas color sampler for Spotify artwork
  function createOptimizedCanvas() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    return { canvas, ctx };
  }

  function getStatusColor(status) {
    switch (status) {
      case "online":
        return "#43b581";
      case "idle":
        return "#faa61a";
      case "dnd":
        return "#f04747";
      case "offline":
        return "#747f8d";
      default:
        return "#747f8d";
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "online":
        return "Online";
      case "idle":
        return "Idle";
      case "dnd":
        return "Do Not Disturb";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  }

  async function updateAllData() {
    try {
      const res = await fetch(LANYARD_URL);
      const json = await res.json();
      if (!json.success) return;

      const data = json.data;
      const user = data.discord_user;
      const status = data.discord_status;
      const activities = data.activities || [];

      // DOM references (guarded)
      const avatarEl = document.getElementById("discordAvatar");
      const avatarLinkEl = document.getElementById("avatarLink");
      const discordNameEl = document.getElementById("discordName");
      const statusDotEl = document.getElementById("discordStatusDot");
      const discordCustomStatusEl = document.getElementById(
        "discordCustomStatus"
      );

      const spotifyPanel = document.querySelector(".spotifyPanel");
      const trackNameEl = document.getElementById("trackName");
      const trackArtistEl = document.getElementById("trackArtist");
      const trackImgEl = document.getElementById("trackImg");

      const rpcNameEl = document.getElementById("rpcName");
      const rpcDetailsEl = document.getElementById("rpcDetails");
      const rpcIconEl = document.getElementById("rpcIcon");

      // Avatar and user info
      if (user) {
        const avatarUrl = user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=80`
          : `https://cdn.discordapp.com/embed/avatars/${
              parseInt(user.discriminator) % 5
            }.png`;
        if (avatarEl) avatarEl.src = avatarUrl;
        if (avatarLinkEl)
          avatarLinkEl.href = `https://discord.com/users/${user.id}`;
        if (discordNameEl) discordNameEl.textContent = user.username || "";
        if (statusDotEl) {
          statusDotEl.style.background = getStatusColor(status);
          statusDotEl.title = getStatusText(status);
        }
      }

      // Custom status
      if (discordCustomStatusEl) {
        const customStatus = activities.find((a) => a.type === 4 && a.state);
        discordCustomStatusEl.textContent = customStatus?.state || "";
      }

      // Spotify handling
      if (
        data.spotify &&
        spotifyPanel &&
        trackImgEl &&
        trackNameEl &&
        trackArtistEl
      ) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = data.spotify.album_art_url;
        img.onload = function () {
          try {
            const { canvas, ctx } = createOptimizedCanvas();
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const leftColor = ctx.getImageData(
              0,
              Math.floor(img.height / 2),
              1,
              1
            ).data;
            const rightColor = ctx.getImageData(
              img.width - 1,
              Math.floor(img.height / 2),
              1,
              1
            ).data;
            spotifyPanel.style.background = `linear-gradient(to right, rgba(${leftColor[0]}, ${leftColor[1]}, ${leftColor[2]}, 0.3), rgba(${rightColor[0]}, ${rightColor[1]}, ${rightColor[2]}, 0.3))`;
          } catch (e) {
            // ignore canvas errors
          }
        };
        trackNameEl.textContent = data.spotify.song || "";
        trackArtistEl.textContent = data.spotify.artist || "";
        trackImgEl.src = data.spotify.album_art_url || "";
      } else if (trackNameEl && trackArtistEl) {
        // fallback when not listening
        trackNameEl.textContent = "Nothing";
        trackArtistEl.textContent = "I'm not currently listening anything";
        if (trackImgEl) trackImgEl.src = "null";
      }

      // RPC / Game activity
      if (rpcNameEl && rpcDetailsEl && rpcIconEl) {
        const gameActivity = activities.find((a) => [0, 1, 3].includes(a.type));
        if (gameActivity) {
          rpcNameEl.textContent = gameActivity.name || "Playing";
          const details = [gameActivity.details, gameActivity.state]
            .filter(Boolean)
            .join(" - ");
          rpcDetailsEl.textContent = details || "";

          let iconSet = false;
          if (gameActivity.assets) {
            const imgKey =
              gameActivity.assets.large_image ||
              gameActivity.assets.small_image;
            if (imgKey) {
              if (imgKey.startsWith("http")) {
                rpcIconEl.src = imgKey;
                iconSet = true;
              } else if (gameActivity.application_id && !imgKey.includes(":")) {
                rpcIconEl.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${imgKey}.png`;
                iconSet = true;
              }
            }
          }
          if (!iconSet) rpcIconEl.src = "game.png";
        } else {
          rpcNameEl.textContent = "None";
          rpcDetailsEl.textContent = "I'm not currently playing anything";
          rpcIconEl.src = "game.png";
        }
      }
    } catch (err) {
      // Non-fatal - log for debugging
      console.error("updateAllData error", err);
    }
  }

  // Start updater and heartbeat (polling fallback)
  updateAllData();
  setInterval(updateAllData, 15000);

  // WebSocket: subscribe to lanyard events to get real-time updates
  try {
    const ws = new WebSocket(WS_URL);
    ws.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.op === 1 && msg.d && msg.d.heartbeat_interval) {
          // subscribe
          ws.send(
            JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } })
          );
          const interval = msg.d.heartbeat_interval;
          setInterval(() => {
            ws.send(
              JSON.stringify({ op: 3, d: { heartbeat_interval: interval } })
            );
          }, interval);
        }
        // Lanyard also sends partial data updates with op 0 (dispatch) containing 'd'
        if (msg.op === 0 && msg.t === "INIT_STATE") {
          // initial state - call updateAllData to refresh UI
          updateAllData();
        }
        if (msg.op === 0 && (msg.t === "INIT_STATE") === false) {
          // other events fall back to polling refresh
          updateAllData();
        }
      } catch (e) {
        // ignore parse errors
      }
    });
  } catch (e) {
    // websocket not available; polling will keep UI updated
  }
});

// Age calculation
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

// Handle age display
document.addEventListener("DOMContentLoaded", () => {
  const ageElement = document.getElementById("age");
  if (ageElement) {
    const birthDate = "27.7.2323";
    const age = calculateAge(birthDate);
    ageElement.textContent = age;
  }
});
