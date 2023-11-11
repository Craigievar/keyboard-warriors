import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

import InGameView from "./Views/InGameView";
import LobbyState from "./Models/LobbyState";
import LobbyView from "./Views/LobbyView";
import MenuView from "./Views/MenuView";
import PlayerState from "./Models/PlayerState";

const server = "https://keyboard-warriors-6471fc11631d.herokuapp.com/";

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<"MENU" | "LOBBY" | "INGAME">(
    "MENU"
  );
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);

  // const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);

  const handleConnect = () => {
    const newSocket = io(server);

    newSocket.on("connect", () => {
      console.log("Connected to the socket server");
      setGameState("MENU"); // Update the game state as needed
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from the socket server");
      setGameState("MENU");
      setSocket(null);
    });

    newSocket.on("player_state", (status: string) => {
      const data: PlayerState = JSON.parse(status);
      setPlayerState(data);
      console.log(data);
      console.log(playerState);
      setGameState(data.currentGameState as "MENU" | "LOBBY" | "INGAME");
    });

    // Additional socket event listeners as needed...

    setSocket(newSocket);
  };

  const handleDisconnect = () => {
    console.log("Disconnecting");
    socket?.disconnect();
    setSocket(null);
  };

  const handleCreateGame = () => {
    socket?.emit("create_game");
  };

  const handleJoinGame = () => {
    console.log("Joining a a game");
    socket?.emit("join_game_any");
  };

  const sendWord = (word: string) => {
    console.log("Sending " + word);
    socket?.emit("input", { word: word });
  };

  const handleJoinGameByCode = (code: string) => {
    console.log("Joining a  game with code " + code);
    socket?.emit("join_game_code", { code: code });
  };

  const handleStartGame = () => {
    socket?.emit("start_game");
  };

  const handleLeaveGame = () => {
    socket?.emit("leave_game");
  };

  const renderView = () => {
    const isConnected = socket !== null && socket?.connected;
    console.log(isConnected);
    switch (gameState) {
      case "LOBBY":
        return (
          <LobbyView
            playerState={playerState}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
          />
        );
      case "INGAME":
        return <InGameView playerState={playerState} sendWord={sendWord} />;
      default:
        return (
          <MenuView
            isConnected={isConnected}
            onConnect={handleConnect}
            onJoinByCode={handleJoinGameByCode}
            onJoin={handleJoinGame}
            onDisconnect={handleDisconnect}
            onCreateGame={handleCreateGame}
          />
        );
    }
  };

  return (
    <div>
      <header>
        <h1>Keyboard Warriors</h1>
      </header>
      {renderView()}
    </div>
  );
};

export default App;
