import { GameRoom } from "./GameRoom";
import { Socket } from "socket.io";
import { WORDS_TO_DIE } from "../config";
import { randomWord } from "../gamelogic";

// Player object. Can be in a game or not.
// Interacts with the game it's in for game loop
// to consider: solve circular dependency?
export class Player {
  name: string;
  alive: boolean;
  lastAttacker: Player | null;
  lastTarget: Player | null;
  lastKilled: Player | null;
  deathTime: number | null;
  won: boolean;
  nextWords: Array<string>;
  prevWords: Array<string>;
  kills: number;
  rightAnswers: number;
  wrongAnswers: number;
  timesAttacked: number;
  canShake: boolean;
  screenShakeUntilMs: number | null;
  isBot: boolean;
  difficulty: number | null;
  updated: boolean;
  networkInputs: string[];
  game: GameRoom | null;
  id: string;
  socket: Socket;
  sendMessage: (id: string, header: string, message: string) => void;

  constructor(
    socket: Socket,
    messageFn: (id: string, header: string, message: string) => void
  ) {
    this.name = "";
    this.alive = true;
    this.lastAttacker = null;
    this.lastTarget = null;
    this.lastKilled = null;
    this.deathTime = null;
    this.won = false;
    this.nextWords = [];
    this.prevWords = [];
    this.kills = 0;
    this.rightAnswers = 0;
    this.wrongAnswers = 0;
    this.timesAttacked = 0;
    this.canShake = true;
    this.screenShakeUntilMs = null;
    this.isBot = false;
    this.difficulty = null;
    this.updated = false;
    this.networkInputs = [];
    this.game = null;
    this.id = socket.id;
    this.socket = socket;
    this.sendMessage = messageFn;
  }

  public checkIfDied() {
    const died = this.nextWords.length > WORDS_TO_DIE;
    if (died) {
      console.log(`Player ${this.name} (${this.id}) died`);
      this.alive = false;
      if (this.lastAttacker) {
        this.lastAttacker.addKill();
      }
      this.deathTime = Date.now();
      this.updated = true;
    }
  }

  public addKill() {
    this.updated = true;
    this.kills++;
    //todo send message?
  }

  public markAttacker(attacker: Player) {
    this.timesAttacked++;
    this.updated = true;
    this.lastAttacker = attacker;
    attacker.lastTarget = this;
  }

  public processNetworkInputs() {
    // console.log("processing inputs");
    if (!this.game || !this.alive) {
      return;
    }
    // console.log(this.networkInputs);
    for (const s of this.networkInputs) {
      console.log(`Comparing ${s} to ${this.nextWords[0]}`);
      if (s.toLowerCase() === this.nextWords[0].toLowerCase()) {
        this.rightAnswers++;
        this.nextWords.shift();
        this.networkInputs.shift();
        this.game.sendAttack(this, s);
      } else {
        this.wrongAnswers++;
        this.nextWords.shift();

        this.networkInputs.shift();
        this.addWord(randomWord());
        this.addWord(randomWord());
      }
      this.prevWords.push(s);
      this.updated = true;
    }
  }

  public addInput(word: string) {
    // doesn't count as an update, since we update when
    // we process on the next tick
    this.networkInputs.push(word);
    console.log(this.networkInputs);
  }

  public addWord(word: string) {
    this.nextWords.push(word);
    this.checkIfDied();
    this.updated = true;
  }

  public hasUpdate(): boolean {
    return this.updated;
  }

  public getPlayerGameState() {
    return JSON.stringify({
      nextWords: this.nextWords.slice(0, 4),
      wordsInQueue: this.nextWords.length,
      kills: this.kills,
      prevWords: this.prevWords.slice(0, 10),
      alive: this.alive,
      rightAnswers: this.rightAnswers,
      wrongAnswers: this.wrongAnswers,
      playersLeft: this.game?.playersAlive(),
      currentGameState: this.game?.state,
      won: this.won,
      //todo factor these into separate websocket calls
      playersInLobby: this.game?.players.length,
      lobbyCode: this.game?.code,
    });
  }

  public message(header: string, message: string) {
    this.sendMessage(this.id, header, message);
  }

  public sendUpdate() {
    // return this.updated;
    this.message("player_state", this.getPlayerGameState());
  }

  public setUpForGame() {
    this.alive = true;
    this.lastAttacker = null;
    this.lastTarget = null;
    this.lastKilled = null;
    this.deathTime = null;
    this.won = false;
    this.nextWords = [];
    this.prevWords = [];
    this.kills = 0;
    this.rightAnswers = 0;
    this.wrongAnswers = 0;
    this.timesAttacked = 0;
    this.updated = true;
    this.networkInputs = [];
  }
}

export type GameState = "INGAME" | "LOBBY";
