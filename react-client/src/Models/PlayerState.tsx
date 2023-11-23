interface PlayerState {
  id: string;
  name: string;
  nextWords: string[];
  wordsInQueue: number;
  kills: number;
  prevWords: string[];
  prevWordCount: number;
  alive: boolean;
  rightAnswers: number;
  wrongAnswers: number;
  playersLeft: number | null;
  currentGameState: "LOBBY" | "INGAME" | null;
  won: boolean | null;
  lobbyCode: string;
  playersInGame: number;
  rank: number;
  lastGameDuration: number;
  playersInLobby: string;
  playerStates: {
    id: string;
    words: number;
    alive: boolean;
    name: string;
  }[];
}
export default PlayerState;
