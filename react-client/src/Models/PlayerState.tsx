interface PlayerState {
  id: string;
  name: string;
  nextWords: string[];
  wordsInQueue: number;
  kills: number;
  prevWords: string[];
  alive: boolean;
  rightAnswers: number;
  wrongAnswers: number;
  playersLeft: number | null;
  currentGameState: "LOBBY" | "INGAME" | null;
  won: boolean | null;
  lobbyCode: string;
  playersInLobby: string;
  playerStates: {
    id: string;
    words: number;
    alive: boolean;
    name: string;
  }[];
}
export default PlayerState;
