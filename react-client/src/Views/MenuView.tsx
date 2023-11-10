import React, { useState } from "react";

import { connected } from "process";

interface MenuViewProps {
  isConnected: boolean;
  onConnect: () => void;
  onJoin: () => void;
  onJoinByCode: (code: string) => void;
  onDisconnect: () => void;
  onCreateGame: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({
  onConnect,
  isConnected,
  onDisconnect,
  onJoin,
  onJoinByCode,
  onCreateGame,
}: MenuViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };
  return (
    <div>
      <div>
        <button onClick={onConnect} disabled={isConnected}>
          Connect
        </button>
      </div>
      <div>
        <button onClick={onDisconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>
      <div>
        {isConnected && <button onClick={onJoin}>Join Random Game</button>}
      </div>
      <div>
        {isConnected && (
          <input type="text" value={inputValue} onChange={handleInputChange} />
        )}
        {isConnected && (
          <button onClick={() => onJoinByCode(inputValue)}>
            Join Game By Code
          </button>
        )}
      </div>
      {isConnected && <button onClick={onCreateGame}>Create Game</button>}
    </div>
  );
};

export default MenuView;
