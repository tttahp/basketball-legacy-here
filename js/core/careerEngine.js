const careerTemplate = {
  careerId: "",

  league: "MEN",

  mode: "", // FREE hoặc PRIME

  status: "CREATING",

  currentAge: 16,

  currentStage: "CREATE_PLAYER",

  school: null,

  team: null,

  draft: {
      eligible: false,
      pick: null
  },

  season: {
      year: 1,
      gamesPlayed: 0
  },

  history: []
};


function createCareer() {
  const career = structuredClone(careerTemplate);

  return career;
}


export default createCareer;