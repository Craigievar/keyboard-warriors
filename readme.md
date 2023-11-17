# Game

Relevant code is (weirdly) in ./src/types - gameroom and player

# Running

Run `npm run build` and `npm run start` in ./react-client to build/start the client server. Point it to localhost:3000 for the socket server if you want to try server changes.
Run `npm start` in ./src to start a local server. You'll need to provide the env variable for statsig.

Open a few tabs to get multiple clients, create a game on one client, join it on the other and press start

# Notes

Refactored TSBR to have reasonable typing and not broadcast the entire game state.
Server manages a collection of GameRoom objects which have Players in them.
Client is shitty, just exists as for validation for now.
https://github.com/Craigievar/typespeed_br has OG client code etc.

Notes:
Players send words, client side validation + mini cache to avoid flicker, server verifies
Get server key from https://console.statsig.com/2kKHVKKsowaOw4evoTzZGL/metrics/events, add to .env file in src.
