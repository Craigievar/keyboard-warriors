import { io } from "socket.io-client";

const SOCKET_URL = "https://keyboard-warriors-6471fc11631d.herokuapp.com"; // Replace with your Socket.IO server URL
const NUM_CONNECTIONS_PER_GAME = parseInt(process.argv[2], 10) || 100; // Number of connections from input argument
const NUM_GAMES = parseInt(process.argv[3], 10) || 100; // Number of connections from input argument

// Function to create a Socket.IO connection
function createSocketConnection(index: number) {
  const socket = io(SOCKET_URL);

  socket.on("connect", () => {
    console.log(`Connection ${index} opened`);
    socket.emit("join_game_any");

    setInterval(() => {
      if (Math.random() < 0.1) {
        socket.emit("start_game");
      }
    }, 10000); // Every 10 seconds

    setInterval(() => {
      const word = "my word";
      socket.emit("input", { word });
    }, 6000 * Math.random());
  });

  socket.on("message", (message) => {
    console.log(`Received message from connection ${index}: ${message}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Connection ${index} disconnected: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Connection ${index} error: ${error}`);
  });
}

// Function to create connections with a delay
async function createConnections() {
  for (let j = 0; j < NUM_GAMES; j++) {
    for (let i = 0; i < NUM_CONNECTIONS_PER_GAME; i++) {
      console.log("Creating client");
      createSocketConnection(i);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for 0.25 seconds
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

createConnections();
