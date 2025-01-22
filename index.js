// Import de FS
const fs = require("fs");
const GEN_FILENAME = "pokemon_data.js";

// Import des données (au format JSON d'origine)
const originalData = require("./pokemon_data.json");

// Contiendra les futures données finales
const finalData = {};

// Types de Pokémon en français
const pokemonTypes = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  electric: "Électrique",
  grass: "Plante",
  ice: "Glace",
  fighting: "Combat",
  poison: "Poison",
  ground: "Sol",
  flying: "Vol",
  psychic: "Psy",
  bug: "Insecte",
  rock: "Roche",
  ghost: "Spectre",
  dragon: "Dragon",
  dark: "Ténèbres",
  steel: "Acier",
  fairy: "Fée",
};

// Couleurs des types (okay j'aurai pu mettre les 2 ensemble dans un dico mais bref)
const pokemonTypeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// API utilisées pour récupérer les données
const API = "https://pokeapi.co/api/v2/pokemon/";
const FR_API = "https://tyradex.vercel.app/api/v1/pokemon/";

// Pour chaque Pokémon, on récupère les données en français et en anglais, puis on les injecte
// (honnêtement j'ai la flemme de commenter, je voulais juste que ça marche)
for (let i = 0; i < Object.keys(originalData).length; i++) {
  try {
    if (originalData[i] && originalData[i].identifier !== undefined) {
      fetch(`${API}${originalData[i].identifier}`)
        .then((res) => res.json())
        .then((data) => {
          fetch(`${FR_API}${originalData[i].identifier}`)
            .then((res) => res.json())
            .then((data_fr) => {
              const fr_evolutions_pre = [];
              const fr_evolutions_next = [];

              if (data_fr.evolution && data_fr.evolution["pre"] !== null) {
                data_fr.evolution.pre.forEach((evolution) => {
                  fr_evolutions_pre.push(evolution.pokedex_id);
                });
              }

              if (data_fr.evolution && data_fr.evolution["next"] !== null) {
                data_fr.evolution.next.forEach((evolution) => {
                  fr_evolutions_next.push(evolution.pokedex_id);
                });
              }

              const newElem = {
                ...originalData[i],
                name: {
                  fr: data_fr.name ? data_fr.name["fr"] : data.name,
                  en: data_fr.name ? data_fr.name["en"] : data.name,
                  jp: data_fr.name ? data_fr.name["jp"] : data.name,
                },
                type: data.types.map((type) => type.type.name),
                type_fr: data.types.map((type) => pokemonTypes[type.type.name]),
                type_color: data.types.map(
                  (type) => pokemonTypeColors[type.type.name]
                ),
                evolutions_pre: fr_evolutions_pre,
                evolutions_next: fr_evolutions_next,
                stats: {
                  hp: data.stats[0].base_stat,
                  attack: data.stats[1].base_stat,
                  defense: data.stats[2].base_stat,
                  special_attack: data.stats[3].base_stat,
                  special_defense: data.stats[4].base_stat,
                  speed: data.stats[5].base_stat,
                },
              };

              finalData[parseInt(i)] = newElem;

              if (Object.keys(originalData).length >= 199) {
                // Génère le fichier final quand on a fini le tour
                fs.writeFileSync(
                  GEN_FILENAME,
                  "const pokemonData = " +
                    JSON.stringify(finalData, null, 2).replace(
                      /"(\d+)":/g,
                      "$1:"
                    )
                );
              }
            });
        });
    } else {
      console.log(`Missing data for ${i}`);
    }
  } catch (e) {
    console.log(e);
  }
}
