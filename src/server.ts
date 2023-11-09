import cors = require("cors");

import * as http from "http";

import { GameRoom } from "./types/GameRoom";
import { Player } from "./types/Player";
import { Server as SocketIOServer } from "socket.io";
import { randomElement } from "./gamelogic";

import express = require("express");

const app = express();
app.use(cors()); // Enable CORS for all routes

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow only GET and POST requests
  },
});

let games = [] as GameRoom[];
const socketMap = new Map<string, Player>();
const startTime = Date.now();

function getPlayer(socket: any): Player | undefined {
  return socketMap.get(socket.id);
}

const sendSocketMessage = (id: string, header: string, message: string) => {
  // console.log("Sending " + header + " " + message);
  io.to(id).emit(header, message);
};

io.on("connection", (socket) => {
  console.log("New client connected");
  const player = new Player(socket, sendSocketMessage);

  socketMap.set(socket.id, player);

  socket.on("name", function (data) {
    const player = getPlayer(socket);
    if (player) {
      console.log("got player name");
      player.name = data.name;
    }
  });

  socket.on("leave_game", function () {
    console.log("disconnecting player");
    const player = getPlayer(socket);
    if (player && player.game) {
      io.to(player.socket.id).emit("current_game_code", "");
      player.game.removePlayer(player);
    }

    //todo
  });

  socket.on("create_game", function () {
    console.log("creating game");
    const player = getPlayer(socket);
    const game = new GameRoom();
    if (player) {
      game.addPlayer(player);
      games.push(game);
      console.log(JSON.stringify(player.game?.code));
    }
  });

  socket.on("join_game_code", function (data) {
    console.log("joining game by code");
    const player = getPlayer(socket);
    for (const g of games) {
      console.log((g as unknown as GameRoom).code);
    }

    const game = games.find((g) => g.code === data.code);
    if (game && game.state === "LOBBY") {
      if (player) {
        game.addPlayer(player);

        console.log(
          "Player " +
            player.id +
            " joining " +
            player.game?.roomId +
            " with code " +
            JSON.stringify(player.game?.code)
        );
      }
    } else {
      //todo return error
      console.log("No code");
    }
  });

  socket.on("join_game_any", function () {
    console.log("joining game");
    const publicGames = games.filter((g) => g.public);
    const player = getPlayer(socket);
    if (player) {
      const game = randomElement(publicGames) as GameRoom;
      if (game) {
        game.addPlayer(player);
        console.log(JSON.stringify(player.game));
      }
    }
    //todo if any open game exists, join it
    // otherwise leave
  });

  socket.on("start_game", function () {
    console.log("starting game");
    const player = getPlayer(socket);
    if (player && player.game && player.game.state === "LOBBY") {
      player.game.startGame();
    }
  });

  socket.on("input", function (data) {
    const player = getPlayer(socket);
    if (!player) {
      console.log("No player");
      return;
    }
    const game = player.game;
    if (!game) {
      console.log("No game");
      return;
    }
    if (game.state === "INGAME") {
      console.log("ingame");
      player.addInput(data.word);
    }
  });

  const intervalId = setInterval(() => {
    const secondsSinceStart = Math.floor((Date.now() - startTime) / 1000);
    socket.emit("time", secondsSinceStart);
  }, 1000);

  socket.on("disconnect", function () {
    console.log("disconnecting player");
    const player = getPlayer(socket);

    if (player && player.game) {
      player.game.removePlayer(player);
    }
    socketMap.delete(socket.id);
    //todo maybe rese tplayer data

    clearInterval(intervalId);
  });
});

console.log("Starting Server");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("Starting Server Game Loop Tick");
setInterval(function () {
  // console.log(`Ticking ${games.length} games`);
  io.emit("all_games", JSON.stringify({ game_list: games.map((g) => g.code) }));
  for (const game of games) {
    game.tick();
    if (game.shouldClean()) {
      game.clean();
      games = games.filter((g) => game.roomId !== g.roomId);
    }
  }
}, 1000 / 30);
