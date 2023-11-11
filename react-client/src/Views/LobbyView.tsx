import LobbyState from "../Models/LobbyState";
import PlayerState from "../Models/PlayerState";
import React from "react";

interface LobbyViewProps {
  playerState: PlayerState | null; // Replace with your appropriate type
  onStartGame: () => void;
  onLeaveGame: () => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({
  playerState,
  onStartGame,
  onLeaveGame,
}) => {
  return (
    <div>
      {/* todo clean up the logic for won/lost - really this can just be a triggered alert */}
      <p>
        {playerState?.won === true
          ? "You won the last game!"
          : playerState?.alive === false
          ? "You lost the last game!"
          : ""}
      </p>
      <p>{playerState?.playersInLobby} Players in Lobby</p>
      <p>Lobby Code: {playerState?.lobbyCode}</p>
      <button onClick={onStartGame}>Start Game</button>
      <button onClick={onLeaveGame}>Leave Game</button>
      {/* Display other lobby related information */}
    </div>
  );
};

export default LobbyView;
