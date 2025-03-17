// First, let's ensure all our DOM elements exist
document.addEventListener('DOMContentLoaded', () => {
  // Initialize WebSocket connection
  let webSocket = new WebSocket("wss://api.lanyard.rest/socket");
  let discordID = '759433582107426816';
// Canvas optimization for Spotify panel
function createOptimizedCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    return { canvas, ctx };
}

async function updateAllData() {
    try {
        const lanyard = await fetch('https://api.lanyard.rest/v1/users/759433582107426816');
        const lanyardData = await lanyard.json();
        
        // Spotify panel color handling with optimized canvas
        if (lanyardData.data.spotify) {
            const spotifyPanel = document.querySelector('.spotifyPanel');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = lanyardData.data.spotify.album_art_url;
            
            img.onload = function() {
                const { canvas, ctx } = createOptimizedCanvas();
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const leftColor = ctx.getImageData(0, img.height/2, 1, 1).data;
                const rightColor = ctx.getImageData(img.width-1, img.height/2, 1, 1).data;
                
                spotifyPanel.style.background = `linear-gradient(to right, 
                    rgba(${leftColor[0]}, ${leftColor[1]}, ${leftColor[2]}, 0.3),
                    rgba(${rightColor[0]}, ${rightColor[1]}, ${rightColor[2]}, 0.3))`;
            }
            
            // Update Spotify info
            document.getElementById('trackName').textContent = lanyardData.data.spotify.song;
            document.getElementById('trackArtist').textContent = lanyardData.data.spotify.artist;
            document.getElementById('trackImg').src = lanyardData.data.spotify.album_art_url;
        }
        // Discord updates
        if (lanyardData.data.discord_user) {
            // Update avatar with the correct URL format
            avatarLink.src = `https://cdn.discordapp.com/avatars/${discordID}/${lanyardData.data.discord_user.avatar}.png`;
            
            // Rest of your Discord user updates
            discordName.textContent = lanyardData.data.discord_user.username;
            const customStatus = lanyardData.data.activities.find(activity => activity.type === 4);
            discordMotd.textContent = customStatus?.state || lanyardData.data.discord_status || 'Online';
        }
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

// Initialize updates
setInterval(updateAllData, 1000);
updateAllData();
  // Handle WebSocket messages
  webSocket.addEventListener("message", (event) => {
      const wsData = JSON.parse(event.data);

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
  });
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
document.addEventListener('DOMContentLoaded', () => {
  const ageElement = document.getElementById("age");
  if (ageElement) {
      const birthDate = "27.7.2323";
      const age = calculateAge(birthDate);
      ageElement.textContent = age;
  }
});