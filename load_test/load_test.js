"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
var SOCKET_URL = "https://keyboard-warriors-6471fc11631d.herokuapp.com"; // Replace with your Socket.IO server URL
var NUM_CONNECTIONS_PER_GAME = parseInt(process.argv[2], 10) || 100; // Number of connections from input argument
var NUM_GAMES = parseInt(process.argv[3], 10) || 100; // Number of connections from input argument
// Function to create a Socket.IO connection
function createSocketConnection(index) {
    var socket = (0, socket_io_client_1.io)(SOCKET_URL);
    socket.on("connect", function () {
        console.log("Connection ".concat(index, " opened"));
        socket.emit("join_game_any");
        setTimeout(function () {
            socket.emit("start_game");
        }, 1000);
        setInterval(function () {
            if (Math.random() < 0.1) {
                socket.emit("start_game");
            }
        }, 10000); // Every 10 seconds
        setInterval(function () {
            var word = "my word";
            socket.emit("input", { word: word });
        }, 6000 * Math.random());
    });
    socket.on("message", function (message) {
        console.log("Received message from connection ".concat(index, ": ").concat(message));
    });
    socket.on("disconnect", function (reason) {
        console.log("Connection ".concat(index, " disconnected: ").concat(reason));
    });
    socket.on("error", function (error) {
        console.error("Connection ".concat(index, " error: ").concat(error));
    });
}
// Function to create connections with a delay
function createConnections() {
    return __awaiter(this, void 0, void 0, function () {
        var j, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    j = 0;
                    _a.label = 1;
                case 1:
                    if (!(j < NUM_GAMES)) return [3 /*break*/, 4];
                    for (i = 0; i < NUM_CONNECTIONS_PER_GAME; i++) {
                        console.log("Creating client");
                        createSocketConnection(i);
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3); })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    j++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
createConnections();
