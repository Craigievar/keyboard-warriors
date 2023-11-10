require("dotenv").config();

import path = require("path");
import express = require("express");

const PORT: number | string = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "../client/public")));
console.log(path.join(__dirname, "../public"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
