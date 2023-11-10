"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var path = require("path");
var express = require("express");
var fs = require("fs");
var PORT = process.env.PORT || 3000;
var app = express();
app.get("/", function (req, res) {
    // Specify the path to your index.html file
    var indexPath = path.join(__dirname, "public/index.html");
    // Check if the file exists
    fs.access(indexPath, fs.constants.F_OK, function (err) {
        if (err) {
            console.error("File does not exist:", err);
            return res.status(404).send("404 Not Found");
        }
        // If the file exists, read it and send it in the response
        fs.readFile(indexPath, function (err, data) {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.contentType("text/html").send(data);
        });
    });
});
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
