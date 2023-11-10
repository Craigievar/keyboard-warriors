"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var express = require("express");
var fs = require("fs");
var PORT = process.env.PORT || 3001;
var app = express();
app.use(express.static(__dirname + "/public"));
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
