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
    console.log(e); // Log the entire response to check its structure

    if (e.data.discord_user) {
      if (discordName) {
        discordName.innerText = `@${e.data.discord_user.username}`;
      } else {
        console.error('Element with id "discordName" not found.');
      }

      if (avatarLink) {
        avatarLink.href = `https://discord.com/users/${discordID}`;
      } else {
        console.error('Element with id "avatarLink" not found.');
      }

      const discordAvatar = document.getElementById("discordAvatar");
      if (discordAvatar) {
        discordAvatar.src = `https://cdn.discordapp.com/avatars/${discordID}/${e.data.discord_user.avatar}.png?size=4096`;
      } else {
        console.error('Element with id "discordAvatar" not found.');
      }

      const statusCircle = document.getElementById("statusCircle");
      if (statusCircle) {
        switch (e.data.discord_status) {
          case 'online':
            statusCircle.style.backgroundColor = "#23a55a";
            break;
          case 'idle':
            statusCircle.style.backgroundColor = "#f0b232";
            break;
          case 'dnd':
            statusCircle.style.backgroundColor = "#f23f43";
            break;
          case 'offline':
            statusCircle.style.backgroundColor = "#80848e";
            break;
        }
      } else {
        console.error('Element with id "statusCircle" not found.');
      }
    }

    // Set custom or regular status message
    const customStatus = e.data.activities.find(activity => activity.type === 4); // type 4 indicates custom status
    if (customStatus && customStatus.state) {
      if (discordMotd) {
        discordMotd.innerText = customStatus.state;
      } else {
        console.error('Element with id "discordMotd" not found.');
      }
    } else if (e.data.discord_user.bio) {
      if (discordMotd) {
        discordMotd.innerText = e.data.discord_user.bio;
      } else {
        console.error('Element with id "discordMotd" not found.');
      }
    } else {
      if (discordMotd) {
        discordMotd.innerText = "No status message";
      } else {
        console.error('Element with id "discordMotd" not found.');
      }
    }

    if (e.data.listening_to_spotify) {
      if (trackName) {
        trackName.innerText = e.data.spotify.song;
      } else {
        console.error('Element with id "trackName" not found.');
      }

      if (trackArtist) {
        trackArtist.innerText = e.data.spotify.artist.replace(/;/g, ",");
      } else {
        console.error('Element with id "trackArtist" not found.');
      }

      const trackImg = document.getElementById("trackImg");
      if (trackImg) {
        trackImg.src = e.data.spotify.album_art_url;
      } else {
        console.error('Element with id "trackImg" not found.');
      }

      if (trackLink) {
        trackLink.href = `https://open.spotify.com/track/${e.data.spotify.track_id}`;
      } else {
        console.error('Element with id "trackLink" not found.');
      }
    } else {
      if (trackName) {
        trackName.innerText = "None";
      } else {
        console.error('Element with id "trackName" not found.');
      }

      if (trackArtist) {
        trackArtist.innerText = "I'm not currently listening to anything";
      } else {
        console.error('Element with id "trackArtist" not found.');
      }

      const trackImg = document.getElementById("trackImg");
      if (trackImg) {
        trackImg.src = "music.png";
      } else {
        console.error('Element with id "trackImg" not found.');
      }
    }

    if (e.data.activities.length > 0) {
      const gameActivity = e.data.activities.find(activity => activity.type === 0);
      if (gameActivity) {
        if (rpcName) {
          rpcName.innerText = gameActivity.name;
        } else {
          console.error('Element with id "rpcName" not found.');
        }

        if (rpcDetails) {
          rpcDetails.innerText = gameActivity.details ? gameActivity.details + (gameActivity.state ? "\n" + gameActivity.state : "") : "";
        } else {
          console.error('Element with id "rpcDetails" not found.');
        }

        const rpcIcon = document.getElementById("rpcIcon");
        if (rpcIcon) {
          rpcIcon.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.large_image}.png`;
        } else {
          console.error('Element with id "rpcIcon" not found.');
        }

        const rpcSmallIcon = document.getElementById("rpcSmallIcon");
        if (rpcSmallIcon) {
          if (gameActivity.assets.small_image) {
            rpcSmallIcon.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.small_image}.png`;
          } else {
            rpcSmallIcon.src = `./template/transparent.png`;
          }
        } else {
          console.error('Element with id "rpcSmallIcon" not found.');
        }
      } else {
        if (rpcName) {
          rpcName.innerText = "None";
        } else {
          console.error('Element with id "rpcName" not found.');
        }

        if (rpcDetails) {
          rpcDetails.innerText = "I'm not currently playing anything";
        } else {
          console.error('Element with id "rpcDetails" not found.');
        }

        const rpcIcon = document.getElementById("rpcIcon");
        if (rpcIcon) {
          rpcIcon.src = `game.png`;
        } else {
          console.error('Element with id "rpcIcon" not found.');
        }

        const rpcSmallIcon = document.getElementById("rpcSmallIcon");
        if (rpcSmallIcon) {
          rpcSmallIcon.src = `gamer.png`;
        } else {
          console.error('Element with id "rpcSmallIcon" not found.');
        }
      }
    } else {
      if (rpcName) {
        rpcName.innerText = "None";
      } else {
        console.error('Element with id "rpcName" not found.');
      }

      if (rpcDetails) {
        rpcDetails.innerText = "I'm not currently playing anything";
      } else {
        console.error('Element with id "rpcDetails" not found.');
      }

      const rpcIcon = document.getElementById("rpcIcon");
      if (rpcIcon) {
        rpcIcon.src = `gamer.png`;
      } else {
        console.error('Element with id "rpcIcon" not found.');
      }

      const rpcSmallIcon = document.getElementById("rpcSmallIcon");
      if (rpcSmallIcon) {
        rpcSmallIcon.src = `gamer.png`;
      } else {
        console.error('Element with id "rpcSmallIcon" not found.');
      }
    }
  })
  .catch((error) => {
    console.error('There was a problem with the fetch operation:', error);
  });

webSocket.addEventListener("message", (event) => {
  let data = JSON.parse(event.data);

  if (event.data === '{"op":1,"d":{"heartbeat_interval":30000}}') {
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

  if (data.t === "PRESENCE_UPDATE") {
    if (data.d.spotify) {
      if (trackName) {
        trackName.innerText = data.d.spotify.song;
      } else {
        console.error('Element with id "trackName" not found.');
      }

      if (trackArtist) {
        trackArtist.innerText = data.d.spotify.artist.replace(/;/g, ",");
      } else {
        console.error('Element with id "trackArtist" not found.');
      }

      const trackImg = document.getElementById("trackImg");
      if (trackImg) {
        trackImg.src = data.d.spotify.album_art_url;
      } else {
        console.error('Element with id "trackImg" not found.');
      }

      if (trackLink) {
        trackLink.href = `https://open.spotify.com/track/${data.d.spotify.track_id}`;
      } else {
        console.error('Element with id "trackLink" not found.');
      }
    } else if (data.d.activities.length > 0) {
      const gameActivity = data.d.activities.find(activity => activity.type === 0);
      if (gameActivity) {
        if (rpcName) {
          rpcName.innerText = gameActivity.name;
        } else {
          console.error('Element with id "rpcName" not found.');
        }

        if (rpcDetails) {
          rpcDetails.innerText = gameActivity.details ? gameActivity.details + (gameActivity.state ? "\n" + gameActivity.state : "") : "";
        } else {
          console.error('Element with id "rpcDetails" not found.');
        }

        const rpcIcon = document.getElementById("rpcIcon");
        if (rpcIcon) {
          rpcIcon.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.large_image}.png`;
        } else {
          console.error('Element with id "rpcIcon" not found.');
        }

        const rpcSmallIcon = document.getElementById("rpcSmallIcon");
        if (rpcSmallIcon) {
          if (gameActivity.assets.small_image) {
            rpcSmallIcon.src = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${gameActivity.assets.small_image}.png`;
          } else {
            rpcSmallIcon.src = `./template/transparent.png`;
          }
        } else {
          console.error('Element with id "rpcSmallIcon" not found.');
        }
      } else {
        if (rpcName) {
          rpcName.innerText = "None";
        } else {
          console.error('Element with id "rpcName" not found.');
        }

        if (rpcDetails) {
          rpcDetails.innerText = "I'm not currently playing anything";
        } else {
          console.error('Element with id "rpcDetails" not found.');
        }

        const rpcIcon = document.getElementById("rpcIcon");
        if (rpcIcon) {
          rpcIcon.src = `game.png`;
        } else {
          console.error('Element with id "rpcIcon" not found.');
        }

        const rpcSmallIcon = document.getElementById("rpcSmallIcon");
        if (rpcSmallIcon) {
          rpcSmallIcon.src = `gamer.png`;
        } else {
          console.error('Element with id "rpcSmallIcon" not found.');
        }
      }
    } else {
      if (rpcName) {
        rpcName.innerText = "None";
      } else {
        console.error('Element with id "rpcName" not found.');
      }

      if (rpcDetails) {
        rpcDetails.innerText = "I'm not currently playing anything";
      } else {
        console.error('Element with id "rpcDetails" not found.');
      }

      const rpcIcon = document.getElementById("rpcIcon");
      if (rpcIcon) {
        rpcIcon.src = `gamer.png`;
      } else {
        console.error('Element with id "rpcIcon" not found.');
      }

      const rpcSmallIcon = document.getElementById("rpcSmallIcon");
      if (rpcSmallIcon) {
        rpcSmallIcon.src = `gamer.png`;
      } else {
        console.error('Element with id "rpcSmallIcon" not found.');
      }
    }
  }
});

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

window.onload = function() {
  // Existing onload code...

  const birthDate = "01.23.2006";
  const age = calculateAge(birthDate);
  const ageElement = document.getElementById("age");
  if (ageElement) {
    ageElement.textContent = age;
  } else {
    console.error('Element with id "age" not found.');
  }

  // Countdown timer for auto-refresh
  function startCountdown(duration, element) {
    let timer = duration, minutes, seconds;
    setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      if (element) {
        element.textContent = minutes + ":" + seconds;
      } else {
        console.error('Element with id "timer" not found.');
      }

      if (--timer < 0) {
        timer = duration;
      }
    }, 1000);
  }

  const countdownElement = document.getElementById("timer");
  const countdownDuration = 60 * 3; // 3 minutes countdown
  startCountdown(countdownDuration, countdownElement);
};