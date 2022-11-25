const fs = require("fs");
const https = require("https");
const core = require("@actions/core");
const database = require("./database");

const totalPokemons = 151; //1ª generation.
const pokemonAPIUrl = "https://pokeapi.co/api/v2/pokemon/";
const pokemonImgUrl =
  "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function get(url) {
  return new Promise((resolve, reject) => {
    let data = "";
    https.get(url, (res) => {
      if (res.statusCode != 200) {
        return reject();
      }

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        return resolve(JSON.parse(data));
      });
      res.on("error", (err) => {
        return reject(err);
      });
    });
  });
}

async function getRandomPokemon() {
  const pokemonNumber = getRandomInt(totalPokemons + 1);
  const pokemon = await get(pokemonAPIUrl + pokemonNumber);
  return pokemon;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getTotalListTable() {
  const catchList = database.getTotals();
  let table = "";
  table += "|Pokemon|Count|\n";
  table += "|-|-|\n";
  catchList.forEach((pokemon) => {
    table += "|" + pokemon.name + "|" + pokemon.count + "\n";
  });
  return table;
}

function getLogListTable() {
  const logs = database.getLogs();
  let table = "";
  table += "|Trainer|Pokemon|Level|Date|\n";
  table += "|-|-|-|-|\n";
  logs.forEach((log) => {
    const d = new Date(log.date);
    const datestring =
      d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    table +=
      "|" +
      log.user +
      "|" +
      log.name +
      "|" +
      log.level +
      "|" +
      datestring +
      "\n";
  });
  return table;
}

async function main() {
  try {
    const pokemon = await getRandomPokemon();

    if (!pokemon) {
      console.log("Unable to catch a pokemon!");
      return;
    }

    const level = getRandomInt(100);
    const id = pokemon.id.toString().padStart(3, "0");
    const name = capitalizeFirstLetter(pokemon.name);
    const imgUrl = `${pokemonImgUrl}${id}.png`;
    const user = core.getInput("user");

    database.updateLogs({ id: pokemon.id, name: pokemon.name, level, user });
    database.updateTotals({ id: pokemon.id, name: pokemon.name });

    const prefixFile = fs.readFileSync("./src/prefix.txt", "utf8");
    const msg = `\n[${user}](https://www.github.com/${user}) catch a **${name}** level **${level}**!\n`;
    const pokemonPic = `\n![pokemon pic](${imgUrl})\n`;

    let content = "";
    content += prefixFile.toString();
    content += msg;
    content += pokemonPic;
    content += "### Total pokemon caught!\n";
    content += getTotalListTable();
    content += "### Pokemon trainers!\n";
    content += getLogListTable();

    fs.writeFileSync("./README.md", content);
  } catch (error) {
    console.log(error);
  }
}

main();
