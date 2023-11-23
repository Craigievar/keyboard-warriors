import React, { useState } from "react";

import EndGameMessage from "../Components/EndGameMessage";
import LobbyState from "../Models/LobbyState";
import PlayerState from "../Models/PlayerState";

interface LobbyViewProps {
  playerState: PlayerState | null; // Replace with your appropriate type
  onStartGame: () => void;
  onLeaveGame: () => void;
  onAddBot: () => void;
  onRemoveBots: () => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({
  playerState,
  onStartGame,
  onLeaveGame,
  onAddBot,
  onRemoveBots,
}) => {
  const [endGamePopupClosed, setEndGamePopupClosed] = useState(false);
  return (
    <div>
      {/* todo clean up the logic for won/lost - really this can just be a triggered alert */}
      <div>
        {playerState &&
          (playerState.won === true || playerState.alive === false) &&
          !endGamePopupClosed && (
            <EndGameMessage
              playerState={playerState}
              hide={() => {
                setEndGamePopupClosed(true);
              }}
            />
          )}
      </div>
      <p>{playerState?.playersInLobby} Players in Lobby</p>
      <p>Lobby Code: {playerState?.lobbyCode}</p>
      <div>
        <button onClick={onStartGame}>Start Game</button>
      </div>
      <div>
        <button onClick={onLeaveGame}>Leave Game</button>
      </div>
      <div>
        <button onClick={onAddBot}>Add Bot</button>
      </div>
      <div>
        <button onClick={onRemoveBots}>Remove All Bots</button>
      </div>
      {/* Display other lobby related information */}
    </div>
  );
};

export default LobbyView;
