export const freeAgents = {

  players: []

};


export function addFreeAgent(player) {
  freeAgents.players.push(player);
}


export function removeFreeAgent(playerId) {

  freeAgents.players = freeAgents.players.filter(
      player => player.id !== playerId
  );

}


export function getFreeAgent(playerId) {

  return freeAgents.players.find(
      player => player.id === playerId
  );

}


export function getAllFreeAgents() {
  return freeAgents.players;
}