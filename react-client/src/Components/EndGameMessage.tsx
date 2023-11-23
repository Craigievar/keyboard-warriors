import "../App.css";

import React, { useEffect } from "react";

import PlayerState from "../Models/PlayerState";

interface EndGameMessageProps {
  playerState: PlayerState;
  hide: () => void;
}

const EndGameMessage: React.FC<EndGameMessageProps> = ({
  playerState,
  hide,
}) => {
  const {
    prevWordCount,
    rightAnswers,
    lastGameDuration,
    kills,
    won,
    rank,
    playersInGame,
  } = playerState;
  const wpm = lastGameDuration > 0 ? rightAnswers / (lastGameDuration / 60) : 0;
  return (
    <div className="endgame-screen">
      <h1>Game Report</h1>
      <div>
        <p>
          {`${
            won
              ? "YOU WON!"
              : `You came in rank ${rank} out of ${playersInGame}`
          }`}
        </p>
      </div>
      <div>
        <p>
          {kills > 0
            ? `You KOed ${kills} other player${kills > 1 ? "s" : ""}. Nice!`
            : `You didn't manage to KO anybody - try again?`}
        </p>
      </div>
      <div>
        <p>
          You typed {rightAnswers} words with{" "}
          {Math.round((rightAnswers / prevWordCount) * 1000) / 10}% accuracy...
        </p>
      </div>
      <div>
        <p>That's {Math.round(wpm * 10) / 10} words per minute!</p>
      </div>
      <div>
        <p>
          {" "}
          <button onClick={() => hide()}>Close</button>
        </p>
      </div>
    </div>
  );
};

export default EndGameMessage;
