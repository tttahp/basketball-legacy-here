const simulationTemplate = {
  quarter: 1,

  timeRemaining: "12:00",

  score: {
      userTeam: 0,
      opponent: 0
  },

  playerStats: {
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      minutes: 0
  },

  events: [],

  status: "PLAYING"
};


function createSimulation() {
  const simulation = structuredClone(simulationTemplate);

  return simulation;
}


export default createSimulation;