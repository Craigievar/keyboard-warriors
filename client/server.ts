require("dotenv").config();

import path = require("path");
import express = require("express");

const fs = require("fs");

const PORT: number | string = process.env.PORT || 3001;

const app = express();

app.use(express.static(__dirname + "/public"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
