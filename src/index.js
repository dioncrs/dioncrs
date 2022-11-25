const fs = require("fs");
const https = require("https");
const core = require("@actions/core");

const databaseFileName = "./src/database.json";
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

function saveCatch(databaseList) {
  fs.writeFileSync(databaseFileName, databaseList);
}

function getCatchDatabase() {
  const databaseFile = fs.readFileSync(databaseFileName, "utf8");
  return JSON.parse(databaseFile.toString());
}

function updateDatabase({ id, name }) {
  const catchList = getCatchDatabase();
  let pokemon = catchList.find((pkm) => pkm.id == id);

  if (!pokemon) {
    pokemon = {
      id,
      name,
      count: 0,
    };
    catchList.push(pokemon);
  }

  pokemon.count += 1;

  fs.writeFileSync(databaseFileName, JSON.stringify(catchList));
}

function getCatchListTable() {
  const catchList = getCatchDatabase();
  let table = "";
  table += "|Pokemon|Count|\n";
  catchList.forEach((pokemon) => {
    table += "|" + pokemon.name + "|" + pokemon.count + "|\n";
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

    updateDatabase({ id: pokemon.id, name: pokemon.name });

    const prefixFile = fs.readFileSync("./src/prefix.txt", "utf8");
    const msg = `\n### [${user}](https://www.github.com/${user}) catch a ${name} level ${level}!\n`;
    const pokemonPic = `\n![pokemon pic](${imgUrl})\n`;

    let content = "";
    content += prefixFile.toString();
    content += msg;
    content += pokemonPic;
    content += "### Total pokemon caught!\n";
    content += getCatchListTable();

    fs.writeFileSync("./README.md", content);
  } catch (error) {
    console.log(error);
  }
}

main();
