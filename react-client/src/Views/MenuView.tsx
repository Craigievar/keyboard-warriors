import React from "react";
import { connected } from "process";

interface MenuViewProps {
  isConnected: boolean;
  onConnect: () => void;
  onJoin: () => void;
  onDisconnect: () => void;
  onCreateGame: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({
  onConnect,
  isConnected,
  onDisconnect,
  onJoin,
  onCreateGame,
}: MenuViewProps) => {
  return (
    <div>
      <button onClick={onConnect} disabled={isConnected}>
        Connect
      </button>
      <button onClick={onDisconnect} disabled={!isConnected}>
        Disconnect
      </button>
      {isConnected && <button onClick={onJoin}>Join Random Game</button>}
      {isConnected && <button onClick={onCreateGame}>Create Game</button>}
    </div>
  );
};

export default MenuView;
