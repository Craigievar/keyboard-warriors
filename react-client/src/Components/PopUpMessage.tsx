import "../App.css";

import React, { useEffect } from "react";

interface PopUpMessageProps {
  message: string;
  onDisappear: () => void;
}

const PopUpMessage: React.FC<PopUpMessageProps> = ({
  message,
  onDisappear,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDisappear();
    }, 3000); // Disappears after 1 second
    return () => clearTimeout(timer);
  }, [onDisappear]);

  return <div className="popup-message">{message}</div>;
};

export default PopUpMessage;
