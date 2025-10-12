const chosenGradient =
        gradients[Math.floor(Math.random() * gradients.length)];
      const nameNeksio = document.getElementById("nameNeksio");
      nameNeksio.style.backgroundImage = `linear-gradient(to right, ${chosenGradient})`;
// Inline album updater: fetch Lanyard separately so album logic stays in this file
      (function () {
        const DISCORD_USER_ID = "759433582107426816";
        const LANYARD_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

        async function updateAlbum() {
          try {
            const res = await fetch(LANYARD_URL);
            const json = await res.json();
            if (!json.success) return;
            const spotify = json.data.spotify;
            const albumEl = document.getElementById("trackAlbum");
            const spotifyPanel = document.querySelector(".spotifyPanel");
            if (!albumEl || !spotifyPanel) return;

            if (
              spotify &&
              (spotify.album || spotify.album_art_url || spotify.song)
            ) {
              albumEl.textContent = spotify.album || "";
              albumEl.style.display = spotify.album ? "block" : "none";
              // update aria-label to include album when available
              const trackName =
                spotify.song ||
                document.getElementById("trackName").textContent ||
                "song";
              const albumLabel = spotify.album ? ` from ${spotify.album}` : "";
              spotifyPanel.setAttribute(
                "aria-label",
                `Open ${trackName}${albumLabel} on Spotify`
              );

              // Improve contrast/readability by sampling the album art and adjusting colors
              try {
                if (spotify.album_art_url) {
                  const img = new Image();
                  img.crossOrigin = "Anonymous";
                  img.src = spotify.album_art_url;
                  img.onload = function () {
                    try {
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d", {
                        willReadFrequently: true,
                      });
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                      const cx = Math.floor(img.width / 2);
                      const cy = Math.floor(img.height / 2);
                      const center = ctx.getImageData(cx, cy, 1, 1).data;
                      const left = ctx.getImageData(0, cy, 1, 1).data;
                      const right = ctx.getImageData(
                        img.width - 1,
                        cy,
                        1,
                        1
                      ).data;

                      // compute luminance for center pixel
                      const r = center[0],
                        g = center[1],
                        b = center[2];
                      const luminance =
                        (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

                      // choose text colors based on luminance
                      const primaryText =
                        luminance < 0.6 ? "#ffffff" : "#000000";
                      const secondaryText =
                        luminance < 0.6
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(0,0,0,0.65)";

                      const trackNameEl = document.getElementById("trackName");
                      const trackArtistEl =
                        document.getElementById("trackArtist");
                      if (trackNameEl) trackNameEl.style.color = primaryText;
                      if (trackArtistEl)
                        trackArtistEl.style.color = secondaryText;
                      if (albumEl) albumEl.style.color = secondaryText;

                      // stronger, more opaque gradient using sampled edge colors to improve contrast
                      spotifyPanel.style.background = `linear-gradient(to right, rgba(${left[0]}, ${left[1]}, ${left[2]}, 0.7), rgba(${right[0]}, ${right[1]}, ${right[2]}, 0.7))`;
                    } catch (e) {
                      // ignore canvas or CORS errors
                    }
                  };
                } else {
                  // no album art - reset to defaults
                  spotifyPanel.style.background = "";
                  const trackNameEl = document.getElementById("trackName");
                  const trackArtistEl = document.getElementById("trackArtist");
                  if (trackNameEl) trackNameEl.style.color = "#ffffff";
                  if (trackArtistEl) trackArtistEl.style.color = "#747474";
                  if (albumEl) albumEl.style.color = "#8b8b8b";
                }
              } catch (e) {
                // ignore
              }
            } else {
              albumEl.textContent = "";
              albumEl.style.display = "none";
              spotifyPanel.setAttribute(
                "aria-label",
                `Open ${
                  document.getElementById("trackName").textContent || "song"
                } on Spotify`
              );
              // reset colors to defaults when not listening
              spotifyPanel.style.background = "";
              const trackNameEl = document.getElementById("trackName");
              const trackArtistEl = document.getElementById("trackArtist");
              if (trackNameEl) trackNameEl.style.color = "#ffffff";
              if (trackArtistEl) trackArtistEl.style.color = "#747474";
              if (albumEl) albumEl.style.color = "#8b8b8b";
            }
          } catch (e) {
            // ignore errors; don't break page
          }
        }

        // initial run and periodic refresh to keep in sync with the external script
        updateAlbum();
        setInterval(updateAlbum, 15000);
      })();
      // Force cover link to specific Spotify profile and protect against overwrites
      (function () {
        const PROFILE_URL =
          "https://open.spotify.com/user/qjopfnl6fsvtpqqs1abznvcys?si=79f9d28a42494658";
        const link = document.getElementById("trackLink");
        if (!link) return;
        function apply() {
          link.href = PROFILE_URL;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.style.cursor = "pointer";
        }
        apply();
        // Observe attribute changes and restore if something else changes the href
        const mo = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.type === "attributes" && m.attributeName === "href") {
              if (link.getAttribute("href") !== PROFILE_URL) apply();
            }
          }
        });
        mo.observe(link, { attributes: true, attributeFilter: ["href"] });
      })();
      // Make the whole spotify panel clickable (defined in this file per request)
      (function () {
        function setPanelInteractive(enabled, panel, linkEl, songTitle) {
          // Force disabled: never make the spotify panel clickable per user request
          enabled = false;
          if (!panel) return;
          if (enabled) {
            panel.tabIndex = 0;
            panel.setAttribute("role", "link");
            panel.setAttribute(
              "aria-label",
              songTitle
                ? `Open ${songTitle} on Spotify`
                : "Open track on Spotify"
            );
            panel.style.cursor = "pointer";
            panel.onclick = function (ev) {
              // if click was directly on the anchor, let default happen
              if (
                ev.target &&
                ev.target.closest &&
                ev.target.closest("#trackLink")
              )
                return;
              try {
                const href = linkEl && linkEl.getAttribute("href");
                if (href) window.open(href, "_blank", "noopener,noreferrer");
              } catch (e) {}
            };
            panel.onkeydown = function (ev) {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                try {
                  const href = linkEl && linkEl.getAttribute("href");
                  if (href) window.open(href, "_blank", "noopener,noreferrer");
                } catch (e) {}
              }
            };
          } else {
            panel.removeAttribute("tabindex");
            panel.removeAttribute("role");
            panel.removeAttribute("aria-label");
            panel.style.cursor = "default";
            panel.onclick = null;
            panel.onkeydown = null;
          }
        }

        document.addEventListener("DOMContentLoaded", function () {
          const panel = document.querySelector(".spotifyPanel");
          const linkEl = document.getElementById("trackLink");
          const trackNameEl = document.getElementById("trackName");

          if (!panel || !linkEl) return;

          // initial enable/disable based on current href
          const checkAndApply = () => {
            const href = linkEl.getAttribute("href");
            const valid =
              href &&
              href.trim() !== "" &&
              href.trim().toLowerCase() !== "null";
            const songTitle = trackNameEl ? trackNameEl.textContent : "";
            setPanelInteractive(!!valid, panel, linkEl, songTitle);
          };

          // Observe changes to href attribute so when other script sets it we react
          const mo = new MutationObserver(() => checkAndApply());
          mo.observe(linkEl, { attributes: true, attributeFilter: ["href"] });

          // Also run once now
          checkAndApply();
        });
      })();
      // Lanyard API integration
      const DISCORD_USER_ID = "759433582107426816";
      const lanyardUrl = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

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

      fetch(lanyardUrl)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) return;
          const user = data.data.discord_user;
          const status = data.data.discord_status;
          const avatar = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=80`
            : `https://cdn.discordapp.com/embed/avatars/${
                parseInt(user.discriminator) % 5
              }.png`;

          document.getElementById("discordAvatar").src = avatar;
          document.getElementById("discordName").textContent = user.username;
          // Set status dot color and tooltip
          const statusDot = document.getElementById("discordStatusDot");
          statusDot.style.background = getStatusColor(status);
          statusDot.title = getStatusText(status);
          document.getElementById(
            "avatarLink"
          ).href = `https://discord.com/users/${user.id}`;

          // Show custom status if available
          const activities = data.data.activities || [];
          const customStatus = activities.find(
            (act) => act.type === 4 && act.state
          );
          document.getElementById("discordCustomStatus").textContent =
            customStatus ? customStatus.state : "";

          // Show RPC / game activity if present
          try {
            const rpcNameEl = document.getElementById("rpcName");
            const rpcDetailsEl = document.getElementById("rpcDetails");
            const rpcIconEl = document.getElementById("rpcIcon");

            // Prefer activities that represent a game/stream/watch (type 0,1,3)
            const gameActivity = activities.find((a) =>
              [0, 1, 3].includes(a.type)
            );

            if (gameActivity) {
              rpcNameEl.textContent = gameActivity.name || "Playing";
              // combine details and state if both exist
              const details = [gameActivity.details, gameActivity.state]
                .filter(Boolean)
                .join(" - ");
              rpcDetailsEl.textContent = details || "";

              // Attempt to resolve an icon for the activity
              let iconSet = false;
              if (gameActivity.assets) {
                const imgKey =
                  gameActivity.assets.large_image ||
                  gameActivity.assets.small_image;
                if (imgKey) {
                  if (imgKey.startsWith("http")) {
                    rpcIconEl.src = imgKey;
                    iconSet = true;
                  } else if (
                    gameActivity.application_id &&
                    !imgKey.includes(":")
                  ) {
                    // construct app asset URL when possible
                    rpcIconEl.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${imgKey}.png`;
                    iconSet = true;
                  }
                }
              }
              if (!iconSet) rpcIconEl.src = "game.png";
            } else {
              // No game activity
              document.getElementById("rpcName").textContent = "None";
              document.getElementById("rpcDetails").textContent =
                "I'm not currently playing anything";
              document.getElementById("rpcIcon").src = "game.png";
            }
          } catch (e) {
            // Fail silently but preserve previous default UI
            console.warn("Error updating RPC panel:", e);
          }
        })
        .catch(() => {
          document.getElementById("discordName").textContent = "Unavailable";
          const statusDot = document.getElementById("discordStatusDot");
          statusDot.style.background = "#747f8d";
          statusDot.title = "Offline";
          document.getElementById("discordCustomStatus").textContent = "";
        });
            const gradients = [
        "#004ef7, #0084ff",
        "#ff8400, #ffc900",
        "#660acf, #ac00cf",
      ];