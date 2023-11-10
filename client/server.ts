require("dotenv").config();

import path = require("path");
import express = require("express");

const fs = require("fs");

const PORT: number | string = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  // Specify the path to your index.html file
  const indexPath = path.join(__dirname, "public/index.html");

  // Check if the file exists
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File does not exist:", err);
      return res.status(404).send("404 Not Found");
    }

    // If the file exists, read it and send it in the response
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).send("Internal Server Error");
      }
      res.contentType("text/html").send(data);
    });
  });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
