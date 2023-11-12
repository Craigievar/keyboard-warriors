import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

import AttackedData from "./Models/AttackedData";
import InGameView from "./Views/InGameView";
import KilledPlayerData from "./Models/KilledPlayerData";
import LobbyState from "./Models/LobbyState";
import LobbyView from "./Views/LobbyView";
import MenuView from "./Views/MenuView";
import PlayerState from "./Models/PlayerState";
import PopUpMessage from "./Components/PopUpMessage";

// const server = "http://localhost:3000";
const server = "https://keyboard-warriors-6471fc11631d.herokuapp.com/";
const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<"MENU" | "LOBBY" | "INGAME">(
    "MENU"
  );
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [isShaking, setIsShaking] = useState(false);
  const [playerRecentlyDied, setPlayerRecentlyDied] = useState(false);

  const playSound = (soundFile: string): void => {
    new Audio(soundFile).play();
  };

  const handleConnect = () => {
    const newSocket = io(server);

    newSocket.on("connect", () => {
      console.log("Connected to the socket server " + server);
      setGameState("MENU"); // Update the game state as needed
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from the socket server");
      setGameState("MENU");
      setSocket(null);
    });

    newSocket.on("player_state", (status: string) => {
      const data: PlayerState = JSON.parse(status);
      console.log(`Update from server ${new Date().toISOString()}`);
      setPlayerState(data);
      setGameState(data.currentGameState as "MENU" | "LOBBY" | "INGAME");
    });

    newSocket.on("attacked", (data: AttackedData) => {
      setPopupMessage(`Attacked by ${data.attackerName ?? "Unknown"}`);
      console.log("attacked msg");
      // playSound("path/to/attack-sound.mp3");
    });

    newSocket.on("killedPlayer", (data: KilledPlayerData) => {
      setPopupMessage(`Killed ${data.victimName}`);
      console.log("killed player msg");
      // playSound("path/to/killed-sound.mp3");
    });

    newSocket.on("screenShake", () => {
      console.log("screen shake msg");
      setIsShaking(true);
      // playSound("path/to/shake-sound.mp3");
      setTimeout(() => setIsShaking(false), 1000); // Stop shaking after 1 second
    });

    newSocket.on("playerDied", () => {
      console.log("player died msg");
      // Implement flashing text logic
      setPlayerRecentlyDied(true);
      setTimeout(() => setPlayerRecentlyDied(false), 300);
      // playSound("path/to/death-sound.mp3");
    });

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
    console.log("Joining a game with code " + code);
    socket?.emit("join_game_code", { code: code });
  };

  const handleStartGame = () => {
    socket?.emit("start_game");
  };

  const handleLeaveGame = () => {
    socket?.emit("leave_game");
  };

  const handleAddBot = () => {
    socket?.emit("add_bot");
  };

  const onRemoveBots = () => {
    socket?.emit("remove_bots");
  };

  const renderView = () => {
    const isConnected = socket !== null && socket?.connected;
    switch (gameState) {
      case "LOBBY":
        return (
          <LobbyView
            playerState={playerState}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
            onAddBot={handleAddBot}
            onRemoveBots={onRemoveBots}
          />
        );
      case "INGAME":
        return (
          <div>
            {popupMessage && (
              <PopUpMessage
                message={popupMessage}
                onDisappear={() => setPopupMessage("")}
              />
            )}
            <InGameView
              playerState={playerState}
              sendWord={sendWord}
              playerRecentlyDied={playerRecentlyDied}
            />
          </div>
        );
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

  useEffect(() => {
    handleConnect();
  }, []);

  return (
    <div className={`${isShaking ? "shake" : ""}`}>
      {" "}
      <div className="view-container">
        <header>
          <h1>Keyboard Warriors</h1>
        </header>
        {renderView()}
      </div>
    </div>
  );
};

export default App;
