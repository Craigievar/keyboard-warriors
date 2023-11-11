import React, { useState } from "react";

import PlayerState from "../Models/PlayerState";

interface InGameViewProps {
  playerState: PlayerState | null; // Replace with your appropriate type
  sendWord: (word: string) => void;
}

const InGameView: React.FC<InGameViewProps> = ({ playerState, sendWord }) => {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendWord(inputValue);
      setInputValue("");
      //client side reaction
    }
  };

  return (
    <div>
      $
      {playerState?.alive ? (
        <div>
          <h1>Type Your Word</h1>
          <p>
            {playerState?.nextWords.length === 0
              ? "-"
              : playerState?.nextWords[0]}{" "}
          </p>{" "}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
          <p>
            {playerState?.wordsInQueue} / 20 Words in Queue (you die at 20!!!)
          </p>
        </div>
      ) : (
        <div>
          <h1>YOU DIED</h1>
        </div>
      )}
      <h1>Game Info</h1>
      <p>{playerState?.playersLeft} Players Alive</p>
      <p>{playerState?.kills} Players Killed</p>
      <p>{playerState?.rightAnswers} Correct Answers</p>
      <p>{playerState?.wrongAnswers} Incorrect Answers</p>
    </div>
  );
};

export default InGameView;
