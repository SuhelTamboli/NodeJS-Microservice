//dotenv package is needed to read .env files
/*
    require("dotenv").config(); =>
    Loads .env file contents into process.env by default. If DOTENV_KEY is present, 
    it smartly attempts to load encrypted .env.vault file contents into process.env.
*/
require("dotenv").config();

// create a new express server
const express = require("express");

const app = express();

const PORT = process.env.PORT;

app.listen(PORT || 3000, () => {
  console.log("App is listening on port", PORT);
});
