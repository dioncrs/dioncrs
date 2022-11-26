function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function getTotalPokemonsTable(logs) {
  const pokemonsGroup = groupBy(logs, (log) => log.name);

  let table = "";
  table += "|Pokemon|Count|\n";
  table += "|-|-|\n";

  pokemonsGroup.forEach((pokemons) => {
    const pokemon = pokemons[0];
    table += "|" + pokemon.name + "|" + pokemons.length + "\n";
  });

  return table;
}

function getLastTrainersTable(logs) {
  let table = "";
  table += "|Trainer|Pokemon|Level|Date|\n";
  table += "|-|-|-|-|\n";

  logs.sort((a, b) => (a.date < b.date ? 1 : -1));
  logs.slice(0, 10).forEach((log) => {
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

function getTopTrainersTable(logs) {
  const usersMap = groupBy(logs, (log) => log.user);
  const usersGroup = Array.from(usersMap.values());

  let table = "";
  table += "|Trainer|Pokemons Caught|\n";
  table += "|-|-|\n";

  usersGroup.sort((a, b) => (a.length < b.length ? 1 : -1));

  usersGroup.slice(0, 5).forEach((users) => {
    const pokemon = users[0];
    table += "|" + pokemon.user + "|" + users.length + "\n";
  });

  return table;
}

module.exports = {
  getTotalPokemonsTable,
  getLastTrainersTable,
  getTopTrainersTable,
};
