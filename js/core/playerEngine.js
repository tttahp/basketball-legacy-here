import countries from "../data/countries.js";
import playerTemplate from "../data/player.js";

function getRandomCountry() {
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

function createPlayer() {
    const player = structuredClone(playerTemplate);

    player.creation.country = getRandomCountry();

    return player;
}

export default createPlayer;