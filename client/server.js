"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var path = require("path");
var express = require("express");
var PORT = process.env.PORT || 3000;
var app = express();
app.use(express.static(path.join(__dirname, "../client/public")));
console.log(path.join(__dirname, "../public"));
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
