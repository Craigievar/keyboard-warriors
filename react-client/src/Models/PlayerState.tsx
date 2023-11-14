interface PlayerState {
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
  players: {
    words: number;
    alive: number;
  }[];
}
export default PlayerState;
