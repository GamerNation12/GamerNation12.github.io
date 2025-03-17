// First, let's ensure all our DOM elements exist
document.addEventListener('DOMContentLoaded', () => {
  // Initialize WebSocket connection
  let webSocket = new WebSocket("wss://api.lanyard.rest/socket");
  let discordID = '759433582107426816';

  async function updateAllData() {
      try {
          const lanyard = await fetch('https://api.lanyard.rest/v1/users/759433582107426816');
          const lanyardData = await lanyard.json();
            
          // Update Discord info
          if (lanyardData.data.discord_user) {
              if (discordName) discordName.textContent = lanyardData.data.discord_user.username;
              if (avatarLink) avatarLink.src = `https://cdn.discordapp.com/avatars/${discordID}/${lanyardData.data.discord_user.avatar}`;
              if (discordMotd) {
                  const customStatus = lanyardData.data.activities.find(activity => activity.type === 4);
                  discordMotd.textContent = customStatus?.state || lanyardData.data.discord_status || 'Online';
              }
          }
      } catch (error) {
          console.log('Error fetching data:', error);
      }
  }

  // Start the update cycle
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