# Game

Refactored TSBR to have reasonable typing and not broadcast the entire game state.

Server manages a collection of GameRoom objects which have Players in them.

Client is shitty, just exists as for validation for now.

Notes:
Players send words, client side validation, server verifies.
