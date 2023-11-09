import { generateRandomString, randomElement } from "../gamelogic";

import { Player } from "./Player";
import { randomUUID } from "crypto";
import words from "../WordList";

export class GameRoom {
  players: Player[];
  state: GameState;
  loadTime: number;
  delay: number;
  time: number;
  code: string;
  endTime: number | null;
  lastTickTimeMs: number | null;
  lastWordGeneratedMs: number | null;
  winner: Player | null;
  roomId: string;
  public: boolean;
  numPlayersAlive: number | null;
  lastPlayerJoinOrLeave: number | null;

  constructor() {
    this.players = [];
    this.state = "LOBBY";
    this.loadTime = 0;
    this.delay = 2000;
    this.time = Date.now();
    this.endTime = null;
    this.lastTickTimeMs = null;
    this.lastWordGeneratedMs = null;
    this.winner = null;
    this.roomId = randomUUID();
    this.code = generateRandomString(4);
    this.public = false;
    this.numPlayersAlive = null;
    this.lastPlayerJoinOrLeave = null;
  }

  public generateWords() {
    for (const player of this.players) {
      player.addWord(randomElement(words));
    }
  }

  public reset() {}

  public sendAttack(attacker: Player, word: string) {
    const target = randomElement(
      this.players.filter((p) => p.alive && p.id !== attacker.id)
    ) as Player;
    if (target) {
      console.log(
        `Sending attack from ${attacker.id} (${attacker.nextWords.length}) to ${target.id} (${target.nextWords.length})`
      );
      target.markAttacker(attacker);
      target.addWord(word);
    } else {
      console.log("Could not find target for attack");
    }
  }

  public checkForGameEnd() {
    if (this.numPlayersAlive && this.numPlayersAlive <= 1) {
      console.log(
        `Game over, winner is ${this.players.find((p) => p.alive)?.id}`
      );
      this.state = "LOBBY";
      this.endTime = Date.now();
      for (const player of this.players) {
        player.updated = true;
        if (player.alive) {
          this.winner = player;
          player.won = true;
        }
        player.sendUpdate();
      }
      this.sendCurrentPlayercount();
    }
  }

  public playersAlive() {
    return this.numPlayersAlive;
  }

  public calculatePlayersAlive() {
    this.numPlayersAlive = (this.players ?? []).filter((p) => p.alive).length;
  }

  public tick() {
    if (this.state !== "INGAME") {
      return;
    }
    if (Date.now() - (this.lastWordGeneratedMs ?? 0) > this.delay) {
      this.generateWords();
      this.lastWordGeneratedMs = Date.now();
      console.log(`${this.numPlayersAlive} players alive`);
    }

    for (const player of this.players) {
      player.processNetworkInputs();
    }

    this.calculatePlayersAlive();
    this.checkForGameEnd();

    for (const player of this.players) {
      if (player.hasUpdate()) {
        player.sendUpdate();
      }
    }
  }

  public clean() {
    console.log("Cleaning game");
    for (const player of this.players) {
      this.removePlayer(player);
    }
  }

  public shouldClean(): boolean {
    // console.log(Date.now() - this.lastPlayerJoinOrLeave);
    const isStale =
      this.lastPlayerJoinOrLeave != null &&
      Date.now() - this.lastPlayerJoinOrLeave > 1000 * 300;
    return this.players.length === 0 || isStale;
    // or last action a long time ago.
  }

  public sendCurrentPlayercount() {
    for (const p of this.players) {
      p.message(
        "current_game_code",
        `${this.code} (${this.state}) - ${this.players.length} Player(s)`
      );
    }
  }

  public addPlayer(player: Player) {
    this.players.push(player);
    player.game = this;
    this.sendCurrentPlayercount();
    player.sendUpdate();

    this.lastPlayerJoinOrLeave = Date.now();
  }

  public removePlayer(player: Player) {
    this.players = this.players.filter((p) => p.id !== player.id);
    player.game = null;

    this.lastPlayerJoinOrLeave = Date.now();

    console.log("sending current game code");
    player.message("current_game_code", "    ");

    this.sendCurrentPlayercount();
    player.sendUpdate();
  }

  public startGame() {
    for (const player of this.players) {
      player.setUpForGame();
    }
    this.state = "INGAME";
    this.sendCurrentPlayercount();
  }
}

export type GameState = "INGAME" | "LOBBY";
