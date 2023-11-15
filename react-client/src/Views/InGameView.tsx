import { Dangerous, Keyboard } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import PlayerState from "../Models/PlayerState";
import { styled } from "@mui/material/styles";

interface InGameViewProps {
  playerState: PlayerState | null; // Replace with your appropriate type
  sendWord: (word: string) => void;
  playerRecentlyDied: boolean;
  removeWordLocally: (answerWasCorrect: boolean) => void;
}

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface KeyboardViewProps {
  words: number;
  alive: boolean;
  size: number;
}

function interpolateColor(words: number) {
  const maxWords = 20;
  // Ensure that words do not exceed maxWords
  words = Math.min(words, maxWords);

  // Calculate the red component (0 for 0 words, 255 for 20 words)
  const redComponent = Math.round((words / maxWords) * 255);
  // Calculate the blue component (255 for 0 words, 0 for 20 words)
  const blueComponent = 255 - redComponent;

  // Return the rgb color string
  return `rgb(${redComponent}, 0, ${blueComponent})`;
}

const KeyboardView: React.FC<KeyboardViewProps> = ({ words, alive, size }) => {
  const keyboardColor = alive ? interpolateColor(words) : "grey";
  // const className = alive ? "" : "dead-keyboard continuous-spin";

  return alive ? (
    <Keyboard style={{ color: keyboardColor, fontSize: size }}></Keyboard>
  ) : (
    <Dangerous style={{ color: keyboardColor, fontSize: size }}></Dangerous>
  );
};

const InGameView: React.FC<InGameViewProps> = ({
  playerState,
  sendWord,
  playerRecentlyDied,
  removeWordLocally,
}) => {
  const [borderColor, setBorderColor] = useState("lightblue");
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (
        playerState &&
        playerState?.nextWords.length > 0 &&
        inputValue.trim().toLowerCase() ===
          playerState?.nextWords[0].trim().toLowerCase()
      ) {
        setBorderColor("green");
        removeWordLocally(true);
      } else {
        setBorderColor("red");
        removeWordLocally(false);
      }
      setTimeout(() => setBorderColor("lightblue"), 300);

      sendWord(inputValue);
      setInputValue("");
      //client side reaction
    }
  };

  const createStyledBox = (flexDirection: "column" | "row") =>
    styled(Box)({
      backgroundColor: "black",
      borderRadius: "10px",
      border: `2px solid ${borderColor}`,
      width: "600px",
      height: "600",
      display: "flex",
      flexDirection: flexDirection, // Use the passed-in flex direction
      alignItems: "center",
      justifyContent: "center",
    });

  const StyledBoxColumn = createStyledBox("column");
  const StyledBoxRow = createStyledBox("row");

  return (
    <div>
      <div>
        {playerState?.alive ? (
          <div>
            <h2>
              {playerState?.nextWords.length === 0
                ? "-"
                : playerState?.nextWords[0]}{" "}
            </h2>{" "}
            <input
              type="text"
              style={{ fontSize: 20, borderColor: borderColor }}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
          </div>
        ) : (
          <div>
            <h1>YOU DIED</h1>
          </div>
        )}
      </div>
      <div>
        <StyledBoxColumn>
          <div>
            {KeyboardView({
              words: playerState?.wordsInQueue ?? 0,
              alive: playerState?.alive ?? true,
              size: 100,
            })}
          </div>
          <div>
            <p>{playerState?.wordsInQueue} / 20 Words</p>
          </div>
          <div>
            <p>{playerState?.kills} Kills</p>
          </div>
          <div>
            <div className={playerRecentlyDied ? "flashing-text" : ""}>
              <p>
                {(playerState?.playersLeft ?? 0) - (playerState?.alive ? 1 : 0)}{" "}
                Enemies Alive
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap", // Allow wrapping
              alignItems: "center",
              justifyContent: "center",
              width: "50%",
            }}
          >
            {playerState?.playerStates
              .filter((p) => p.id !== playerState.id)
              .map((p, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      width: `calc(20% - 20px)`, // Adjust width to account for margins
                      margin: "10px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {KeyboardView({ words: p.words, alive: p.alive, size: 50 })}
                  </div>
                );
              })}
          </div>
        </StyledBoxColumn>
      </div>
    </div>
  );
};

export default InGameView;
