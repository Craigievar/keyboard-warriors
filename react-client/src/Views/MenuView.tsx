import React, { useState } from "react";

import { connected } from "process";

interface MenuViewProps {
  isConnected: boolean;
  onJoin: () => void;
  onJoinByCode: (code: string) => void;
  onCreateGame: () => void;
  onSetName: (name: string) => void;
}

const MenuView: React.FC<MenuViewProps> = ({
  isConnected,
  onJoin,
  onJoinByCode,
  onCreateGame,
  onSetName,
}: MenuViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(event.target.value);
  };

  return (
    <div>
      {!isConnected && (
        <div>
          <div className="loading-circle"></div>
        </div>
      )}
      <div>
        {isConnected && (
          <input
            type="text"
            value={nameValue}
            placeholder="Set Your Name"
            onChange={handleNameChange}
          />
        )}
      </div>
      <div>
        {isConnected && (
          <button onClick={() => onSetName(nameValue)}>Set Name</button>
        )}
      </div>
      <div>
        <div>
          {isConnected && (
            <input
              type="text"
              value={inputValue}
              placeholder="Room Code"
              onChange={handleInputChange}
            />
          )}
        </div>
        <div>
          {isConnected && (
            <button onClick={() => onJoinByCode(inputValue)}>
              Join Game By Code
            </button>
          )}
        </div>
      </div>
      <div>
        {isConnected && <button onClick={onJoin}>Join Random Game</button>}
      </div>
      {isConnected && <button onClick={onCreateGame}>Create Game</button>}
    </div>
  );
};

export default MenuView;
