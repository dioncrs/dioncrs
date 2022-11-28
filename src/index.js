const fs = require("fs");
const https = require("https");
const core = require("@actions/core");
const database = require("./database");
const markdown = require("./markdown");

const totalPokemons = 151; //1ª generation.
const pokemonAPIUrl = "https://pokeapi.co/api/v2/pokemon/";
const pokemonImgUrl =
  "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function getRandomPokemon() {
  const pokemonNumber = getRandomInt(totalPokemons + 1);
  const pokemon = await get(pokemonAPIUrl + pokemonNumber);
  return pokemon;
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function main() {
  try {
    const pokemon = await getRandomPokemon();

    if (!pokemon) {
      console.log("Unable to catch a pokemon!");
      return;
    }

    const { id, name } = pokemon;
    const level = getRandomInt(100);
    const imgUrl = `${pokemonImgUrl}${id.toString().padStart(3, "0")}.png`;
    const user = core.getInput("user");
    const logs = database.getDatabase();
    const date = Date.now();
    logs.push({ id, name, level, user, date });

    const prefixFile = fs.readFileSync("./src/prefix.txt", "utf8");

    const msg = `\n[${user}](https://www.github.com/${user}) catch a **${capitalizeFirstLetter(
      pokemon.name
    )}** level **${level}**!\n`;

    const pokemonPic = `\n![pokemon pic](${imgUrl})\n`;

    let content = "";
    content += prefixFile.toString();
    content += msg;
    content += pokemonPic;
    content += "### Total pokemon caught!\n";
    content += markdown.getTotalPokemonsTable(logs);
    content += "### Top 5 trainers!\n";
    content += markdown.getTopTrainersTable(logs);
    content += "### Last 10 catches!\n";
    content += markdown.getLastTrainersTable(logs);

    database.updateDatabase(logs);

    fs.writeFileSync("./README.md", content);
  } catch (error) {
    console.log(error);
  }
}

main();
