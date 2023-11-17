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

interface KeyboardViewProps {
  words: number;
  alive: boolean;
  size: number;
  name: string;
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

const KeyboardView: React.FC<KeyboardViewProps> = ({
  words,
  alive,
  size,
  name,
}) => {
  const keyboardColor = alive ? interpolateColor(words) : "grey";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ margin: 0 }}>
        {alive ? (
          <Keyboard style={{ color: keyboardColor, fontSize: size }}></Keyboard>
        ) : (
          <Dangerous
            style={{ color: keyboardColor, fontSize: size }}
          ></Dangerous>
        )}
      </div>
      <div style={{ margin: 0 }}>
        <p style={{ fontSize: (20 * size) / 120 }}>{name.slice(0, 10)}</p>
      </div>
    </div>
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
              style={{ fontSize: 20, marginBottom: "20px" }}
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
              size: 120,
              name: playerState?.name ?? "",
            })}
          </div>
          <div>
            <p>
              {playerState?.wordsInQueue} / 20 Words, {playerState?.kills}{" "}
              Kills, and{" "}
              {(playerState?.playersLeft ?? 0) - (playerState?.alive ? 1 : 0)}
              Enemies Alive
            </p>
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
                    {KeyboardView({
                      words: p.words,
                      alive: p.alive,
                      name: p.name,
                      size: 50,
                    })}
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
