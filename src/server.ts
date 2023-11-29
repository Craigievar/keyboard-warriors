import cors = require("cors");

import * as http from "http";

import { GameRoom } from "./types/GameRoom";
import { Player } from "./types/Player";
import { Server as SocketIOServer } from "socket.io";
import { randomElement } from "./gamelogic";

require("dotenv").config();

import express = require("express");

const Statsig = require("statsig-node");

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const statsigTier = process.env.STATSIG_TIER ?? "staging";

console.log("Initializing Statsig");
Statsig.initialize(process.env.STATSIG_SERVER_SECRET, {
  environment: { tier: statsigTier },
}).then(() => {
  console.log("Statsig initialized");
  const app = express();
  app.use(cors()); // Enable CORS for all routes

  app.get("/health", (req, res) => {
    res.send("I'm ok");
  });

  app.get("/socket_port", (req, res) => {
    res.send(PORT);
  });

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

  function serverTick() {
    const nextTick = Date.now() + 1000 / 30;

    for (const game of games) {
      game.tick();
      if (game.shouldClean()) {
        game.clean();
        games = games.filter((g) => game.roomId !== g.roomId);
      }
    }

    setTimeout(serverTick, nextTick > Date.now() ? nextTick - Date.now() : 0);
  }

  app.get("/status", (req, res) => {
    res.send(
      JSON.stringify({
        gameCount: games.length,
        playerCount: socketMap.size,
        games: games.map((g) => {
          return {
            state: g.state,
            code: g.code,
            playerCount: g.players.filter((p) => !p.isBot).length,
            bots: g.players.filter((p) => p.isBot).length,
            tps:
              g.state === "INGAME"
                ? 1000 * (g.ticks / (Date.now() - g.gameStartTime))
                : null,
          };
        }),
      })
    );
  });

  function getPlayer(socket: any): Player | undefined {
    return socketMap.get(socket.id);
  }

  const sendSocketMessage = (id: string, header: string, message: string) => {
    io.to(id).emit(header, message);
  };

  io.on("connection", (socket) => {
    console.log("New client connected");
    const player = new Player(socket, sendSocketMessage, false);
    player.sendUpdate();
    socketMap.set(socket.id, player);

    socket.on("name", function (data) {
      const player = getPlayer(socket);
      if (player) {
        console.log("got player name");
        player.name = data.name;
      }
    });

    socket.on("cookie_id", function (data) {
      const player = getPlayer(socket);
      if (player) {
        //todo hide client until cookie is set?
        console.log("got player cookie id " + data.id);
        player.cookieID = data.id;
      }
    });

    socket.on("leave_game", function () {
      console.log("disconnecting player");
      const player = getPlayer(socket);
      if (player && player.game) {
        player.message("current_game_code", "");
        player.game.removePlayer(player);
      }
    });

    socket.on("create_game", function () {
      console.log("creating game");
      const player = getPlayer(socket);
      if (player && player.game) {
        player.game.removePlayer(player);
      }
      const game = new GameRoom();
      if (player) {
        game.addPlayer(player);
        games.push(game);

        Statsig.logEvent(
          {
            customIDs: {
              gameID: game.roomId,
              socketID: player.id,
              cookieID: player.cookieID,
            },
          },
          "created_game"
        );
      }
    });

    socket.on("set_name", function (data) {
      const player = getPlayer(socket);
      if (player) {
        player.name = data.name.slice(0, 16);
      }
    });

    socket.on("join_game_code", function (data) {
      console.log("joining game by code");
      const player = getPlayer(socket);

      const game = games.find(
        (g) => g.code.toLowerCase().trim() === data.code.toLowerCase().trim()
      );
      if (game && game.state === "LOBBY") {
        if (player) {
          if (player.game) {
            player.game.removePlayer(player);
          }
          game.addPlayer(player);
          console.log(game?.roomId);
          Statsig.logEvent(
            {
              customIDs: {
                gameID: game.roomId,
                socketID: player.id,
                cookieID: player.cookieID,
              },
            },
            "joined_game",
            null,
            {
              used_code: true,
              joined_public: false,
            }
          );
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
      const publicGames = games.filter((g) => g.public && g.state === "LOBBY");
      const player = getPlayer(socket);

      if (player) {
        const game = randomElement(publicGames) as GameRoom;
        Statsig.logEvent(
          {
            customIDs: { socketID: player.id, cookieID: player.cookieID },
          },
          "searched_for_game"
        );
        if (games.length > 0 && game) {
          Statsig.logEvent(
            {
              customIDs: {
                gameID: game.roomId,
                socketID: player.id,
                cookieID: player.cookieID,
              },
            },
            "joined_game",
            null,
            {
              used_code: false,
              joined_public: true,
            }
          );
          game.addPlayer(player);
        } else {
          const game = new GameRoom();
          if (player) {
            game.addPlayer(player);
            games.push(game);
            console.log(game?.roomId);

            Statsig.logEvent(
              {
                customIDs: {
                  gameID: game.roomId,
                  socketID: player.id,
                  cookieID: player.cookieID,
                },
              },
              "created_game"
            );
            // console.log(JSON.stringify(player.game?.code));
          }
        }
      }
    });

    socket.on("add_bot", function () {
      const player = getPlayer(socket);
      if (player && player.game && player.game.state === "LOBBY") {
        player.game.addBot();
      }
    });

    socket.on("remove_bots", function () {
      const player = getPlayer(socket);
      if (player && player.game && player.game.state === "LOBBY") {
        for (const bot of player.game.players.filter((p) => p.isBot)) {
          player.game.removePlayer(bot);
        }
      }
    });

    socket.on("start_game", function () {
      const player = getPlayer(socket);
      if (
        player &&
        player.game &&
        player.game.state === "LOBBY" &&
        player.game.players.length > 1
      ) {
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
        if (player.alive === false) {
          console.log("Player is dead, can't send word");
        }
        player.addInput(data.word);
      }
    });

    socket.on("disconnect", function () {
      console.log("disconnecting player");
      const player = getPlayer(socket);

      if (player && player.game) {
        player.game.removePlayer(player);
      }
      socketMap.delete(socket.id);
    });
  });

  console.log("Starting Server");
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  console.log("Starting Server Game Loop Tick");

  serverTick();
});
