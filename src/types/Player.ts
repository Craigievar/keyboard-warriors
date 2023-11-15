import { generateRandomName, randomWord } from "../gamelogic";

import { GameRoom } from "./GameRoom";
import { Socket } from "socket.io";
import { WORDS_TO_DIE } from "../config";
import { randomUUID } from "crypto";

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
  socket: Socket | null;
  nextBotAttackTime: number;
  sendMessage: ((id: string, header: string, message: string) => void) | null;

  constructor(
    socket: Socket | null,
    messageFn: ((id: string, header: string, message: string) => void) | null,
    isBot: boolean
  ) {
    this.name = generateRandomName();
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
    this.id = socket?.id ?? randomUUID();
    this.socket = socket;
    this.sendMessage = messageFn;
    this.isBot = isBot;
    this.nextBotAttackTime = 0;
  }

  public checkIfDied() {
    const died = this.nextWords.length > WORDS_TO_DIE;
    if (died) {
      // console.log(
      //   `${this.isBot ? "Bot" : "Player"} ${this.name} (${this.id}) died`
      // );
      this.alive = false;
      if (this.lastAttacker) {
        this.lastAttacker.addKill();
        this.lastAttacker.message(
          "killedPlayer",
          this.name ?? "Unnamed Player"
        );
      }
      this.deathTime = Date.now();
      this.updated = true;
      this.game?.sendPlayerDiedAlert(this.lastAttacker);
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

  public handleCorrectAnswer() {
    this.rightAnswers++;
    this.game?.sendAttack(this, this.nextWords[0]);
    this.nextWords.shift();
    this.networkInputs.shift();
  }

  public handleWrongAnswer() {
    this.wrongAnswers++;
    this.nextWords.shift();
    this.networkInputs.shift();
    this.addWord(randomWord());
    this.addWord(randomWord());
  }

  public processNetworkInputs() {
    // console.log("processing inputs");
    if (!this.game || !this.alive || this.isBot) {
      return;
    }
    // console.log(this.networkInputs);
    for (const s of this.networkInputs) {
      // console.log(`Comparing ${s} to ${this.nextWords[0]}`);
      if (s.toLowerCase().trim() === this.nextWords[0].toLowerCase().trim()) {
        this.handleCorrectAnswer();
      } else {
        this.handleWrongAnswer();
      }
      this.prevWords.push(s);
      this.updated = true;
    }
  }

  public addInput(word: string) {
    // doesn't count as an update, since we update when
    // we process on the next tick
    this.networkInputs.push(word);
  }

  public addWord(word: string) {
    this.nextWords.push(word);
    this.checkIfDied();
    this.updated = true;
  }

  public hasUpdate(): boolean {
    return this.updated && !this.isBot;
  }

  public getPlayerGameState() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
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
      playerStates: this.game?.players.map((p) => {
        return {
          id: p.id,
          words: p.nextWords.length,
          alive: p.alive,
          name: p.name,
        };
      }),
    });
  }

  public message(header: string, message: any) {
    if (!this.isBot && this.sendMessage !== null) {
      this.sendMessage(this.id, header, message);
    }
  }

  public setNextAttackTimer() {
    // todo - handle bot difficulty etc.
    const max = 5000; //5 seconds
    const min = 1000; //1 second
    this.nextBotAttackTime =
      Date.now() + Math.floor(Math.random() * (max - min)) + min;
  }

  public botUpdate() {
    if (!this.alive) {
      return;
    }

    if (Date.now() >= this.nextBotAttackTime) {
      this.handleCorrectAnswer();
      this.setNextAttackTimer();
    }
  }

  public sendUpdate() {
    // return this.updated;
    if (this.isBot) {
      return;
    }

    this.message("player_state", this.getPlayerGameState());
    this.updated = false;
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

    if (this.isBot) {
      const max = 5000;
      const min = 1000; //1 second
      this.nextBotAttackTime =
        Date.now() + Math.floor(Math.random() * (max - min)) + min;
    }
  }
}

export type GameState = "INGAME" | "LOBBY";
