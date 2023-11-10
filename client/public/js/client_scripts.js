// Initialize socket connection in global scope to be reused throughout the script
let socket;

window.addEventListener("DOMContentLoaded", (event) => {
  // Initialize DOM elements

  const connectButton = document.getElementById("connect");
  const disconnectButton = document.getElementById("disconnect");
  const createGameButton = document.getElementById("create_game");
  const startGameButton = document.getElementById("start_game");
  const leaveGameButton = document.getElementById("leave_game");
  const joinGameCodeButton = document.getElementById("join_game_code");
  const joinGameAnyButton = document.getElementById("join_game_any");
  const gameCodeInput = document.getElementById("game_code_input");
  const keyInputField = document.getElementById("key_input");
  const currentGameCodeField = document.getElementById("current_game_code");
  const rightAnswersField = document.getElementById("right_answers");

  const wrongAnswersField = document.getElementById("wrong_answers");
  const aliveField = document.getElementById("alive");

  const currentWordField = document.getElementById("current_word");
  // Disable disconnect button initially
  disconnectButton.disabled = true;
  createGameButton.disabled = true;
  leaveGameButton.disabled = true;
  joinGameCodeButton.disabled = true;
  createGameButton.disabled = true;
  joinGameAnyButton.disabled = true;
  keyInputField.disabled = true;
  startGameButton.disabled = true;

  connectButton.addEventListener("click", function () {
    socket = io("https://keyboardwarrior-1011e99642b5.herokuapp.com:52263");
    connectButton.disabled = true;
    disconnectButton.disabled = false;
    disconnectButton.disabled = false;
    createGameButton.disabled = false;
    leaveGameButton.disabled = false;
    joinGameCodeButton.disabled = false;
    createGameButton.disabled = false;
    joinGameAnyButton.disabled = false;
    keyInputField.disabled = false;
    startGameButton.disabled = false;
    // Socket event listeners
    socket.on("connect", () => {
      console.log("Connected to the socket server");
    });

    socket.on("current_game_code", (code) => {
      console.log("Updating code with " + code);
      currentGameCodeField.textContent = code;
    });

    socket.on("player_state", (status) => {
      const data = JSON.parse(status);
      console.log(data);
      currentWordField.textContent = data.nextWords[0];
      aliveField.textContent = `${
        data.currentGameState === "LOBBY" && data.won
          ? "Winner"
          : data.currentGameState === "LOBBY" && !data.alive
          ? "Lost"
          : data.alive
          ? `Alive with ${data.wordsInQueue}/20 words in queue and ${
              data.playersLeft - 1
            } opponent(s) left`
          : "Dead"
      }`;
      rightAnswersField.textContent = data.rightAnswers;
      wrongAnswersField.textContent = data.wrongAnswers;
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the socket server");
      connectButton.disabled = false;
      disconnectButton.disabled = true;
      createGameButton.disabled = true;
      leaveGameButton.disabled = true;
      joinGameCodeButton.disabled = true;
      createGameButton.disabled = true;
      joinGameAnyButton.disabled = true;
      keyInputField.disabled = true;
      startGameButton.disabled = true;
    });

    socket.on("all_games", (games) => {
      const gameObj = JSON.parse(games)["game_list"];
      const gameList = document.getElementById("game_list");

      gameList.innerHTML = ""; // Clear existing list

      gameObj.forEach((gameId) => {
        const listItem = document.createElement("li");
        listItem.textContent = gameId;
        gameList.appendChild(listItem);
      });
    });
  });

  disconnectButton.addEventListener("click", function () {
    if (socket) {
      socket.disconnect();
      connectButton.disabled = false;
      disconnectButton.disabled = true;
    }
  });

  createGameButton.addEventListener("click", function () {
    if (socket) {
      socket.emit("create_game");
    }
  });

  startGameButton.addEventListener("click", function () {
    if (socket) {
      socket.emit("start_game");
    }
  });

  leaveGameButton.addEventListener("click", function () {
    if (socket) {
      socket.emit("leave_game");
    }
  });

  joinGameCodeButton.addEventListener("click", function () {
    if (socket) {
      const code = gameCodeInput.value;
      socket.emit("join_game_code", { code: code });
    }
  });

  joinGameAnyButton.addEventListener("click", function () {
    if (socket) {
      socket.emit("join_game_any");
    }
  });

  // Keystroke event listener for the keyInputField
  keyInputField.addEventListener("keydown", function (event) {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
      const val = keyInputField.value;
      keyInputField.value = ""; // Clear input field
      socket.emit("input", { word: val });
    } else if (event.key === "Backspace") {
      // Default behavior of backspace will delete the last character, no need to handle explicitly
    } else {
      // For all other keystrokes, append the character to the input field
      // This behavior is already handled by the default input field behavior
    }
  });
});
